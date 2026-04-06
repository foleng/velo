// framework/server.js

// --- 1. 绝对优先：拦截 CSS 防止 Node 报错 ---
const Module = require('module');
const cssProxy = new Proxy({}, {
  get(target, prop) {
    if (prop === 'default') return cssProxy;
    if (prop === '__esModule') return true;
    if (typeof prop !== 'string' || prop.startsWith('$$')) return undefined;
    return prop;
  }
});
const handleCss = (m) => { m.exports = cssProxy; };
['.css', '.module.css', '.scss'].forEach(ext => { Module._extensions[ext] = handleCss; });
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.match(/\.(css|module\.css|scss)$/)) return cssProxy;
  return originalLoad.apply(this, arguments);
};

// --- 2. 启动编译注册 ---
require('esbuild-register');

const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const path = require('path');
const fs = require('fs');

const { scanRoutes } = require('./router');
const { runBuild } = require('./build');
const { RouterProvider } = require('../lib/router-context');

const app = express();

// 辅助函数：安全加载组件并清除缓存
function safeRequire(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    delete require.cache[require.resolve(filePath)];
    const mod = require(filePath);
    return mod.default || mod;
  }
  return null;
}

async function startServer() {
  // A. 执行构建 (Bundle + SSG)
  await runBuild();
  const { staticRoutes, dynamicRoutes } = scanRoutes(path.join(process.cwd(), 'pages'));

  app.use(express.static('public'));

  // B. 全局中间件
  const middlewarePath = path.join(process.cwd(), 'middleware.js');
  const middlewareMod = safeRequire(middlewarePath);
  
  // 【核心修复】：兼容具名导出 export function middleware 和 默认导出 export default
  const middlewareFn = middlewareMod?.middleware || (typeof middlewareMod === 'function' ? middlewareMod : null);

  app.use(async (req, res, next) => {
    // 排除静态资源和 JS 块，不走中间件
    if (req.path.includes('.') || req.path.startsWith('/chunks')) return next();

    // 只有当解析出的 middlewareFn 是函数时才执行
    if (typeof middlewareFn === 'function') {
      try {
        const result = await middlewareFn(req);
        
        if (result?.redirect) return res.redirect(result.redirect);
        if (result?.rewrite) return res.send(result.rewrite);
        
        // 如果中间件显式返回了不放行（比如没返回 {next: true}），则在此拦截
        // 但为了方便测试，如果没有返回值我们也默认放行
        if (result && result.next === false) return; 
      } catch (e) { 
        console.error('Middleware Execution Error:', e); 
      }
    }
    next();
  });

  // C. 核心路由
  app.get('*', async (req, res) => {
    const urlPath = req.path;

    // 1. API 路由处理
    if (urlPath.startsWith('/api/')) {
      const apiPath = path.join(process.cwd(), 'pages', `${urlPath}.js`);
      const handler = safeRequire(apiPath);
      return handler ? handler(req, res) : res.status(404).json({ error: 'API Not Found' });
    }

    // 2. SSG/ISR 静态文件优先分发
    const routeBase = urlPath === '/' ? 'index' : urlPath.replace(/^\//, '');
    const staticHtmlPath = path.join(process.cwd(), 'public/static-html', `${routeBase}.html`);
    const staticJsonPath = path.join(process.cwd(), 'public/static-html', `${routeBase}.json`);

    if (fs.existsSync(staticHtmlPath)) {
      const jsonData = JSON.parse(fs.readFileSync(staticJsonPath, 'utf8'));
      // ISR 后台再生逻辑
      const stats = fs.statSync(staticHtmlPath);
      if (jsonData.revalidate && (Date.now() - stats.mtimeMs) / 1000 > jsonData.revalidate) {
        console.log(`[ISR] 重建页面: ${urlPath}`);
        // 此处可异步调用 build.js 中的 renderAndSave，由于篇幅略，逻辑同 build.js
      }
      return req.query._data === '1' ? res.json(jsonData.props || jsonData) : res.sendFile(staticHtmlPath);
    }

    // 3. 动态路由匹配 (包含 Catch-all)
    let componentPath = staticRoutes[urlPath];
    let params = {};
    if (!componentPath) {
      for (const route of dynamicRoutes) {
        const match = urlPath.match(route.pattern);
        if (match) {
          componentPath = route.componentPath;
          params = { ...match.groups };
          for (const key in params) {
            if (route.isCatchAll) params[key] = params[key].split('/');
          }
          break;
        }
      }
    }

    // 4. 404 处理
    if (!componentPath) {
      res.status(404);
      componentPath = path.join(process.cwd(), 'pages/404.jsx');
      if (!fs.existsSync(componentPath)) return res.send('404 Not Found');
    }

    try {
      // 5. 加载组件库
      const Component = safeRequire(componentPath);
      const AppComponent = safeRequire(path.join(process.cwd(), 'pages/_app.jsx'));
      const DocumentComponent = safeRequire(path.join(process.cwd(), 'pages/_document.jsx'));

      // 6. 数据获取
      let props = { params };
      const mod = require(componentPath);
      if (mod.getServerSideProps) {
        props = { ...props, ...(await mod.getServerSideProps({ params })) };
      }

      if (req.query._data === '1') return res.json(props);

      // 7. SSR 渲染
      const content = renderToString(
        React.createElement(RouterProvider, {
          initialComponent: Component,
          initialProps: props,
          path: urlPath,
          AppComponent: AppComponent
        })
      );

      // 8. 响应输出 (优先使用 _document.jsx)
      if (DocumentComponent) {
        const docHtml = renderToString(
          React.createElement(DocumentComponent, { content, props, path: urlPath })
        );
        res.send(`<!DOCTYPE html>${docHtml}`);
      } else {
        // 默认 HTML 模板
        res.send(`
          <!DOCTYPE html>
          <html>
            <head><meta charset="utf-8"><title>Mini Next</title></head>
            <body>
              <div id="root">${content}</div>
              <script>
                window.__NEXT_DATA__ = ${JSON.stringify(props)};
                window.__CURRENT_PATH__ = "${urlPath}";
              </script>
              <script type="module" src="/chunks/client-entry.js"></script>
            </body>
          </html>
        `);
      }
    } catch (err) {
      console.error('SSR Error:', err);
      res.status(500).send(`<pre>${err.stack}</pre>`);
    }
  });

  app.listen(3000, () => console.log('🚀 Mini-Next is running on http://localhost:3000'));
}

module.exports = { startServer };