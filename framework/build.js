// framework/build.js
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function runBuild() {
  const chunksDir = path.join(process.cwd(), 'public/chunks');
  const staticHtmlDir = path.join(process.cwd(), 'public/static-html');

  // ==========================================
  // 1. 初始化并清理目录
  // ==========================================
  [chunksDir, staticHtmlDir].forEach(dir => {
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
  });

  console.log('📦 [1/2] 正在构建浏览器端 Bundle...');

  try {
    // ==========================================
    // 2. 打包浏览器端 JS 代码 (Code Splitting)
    // ==========================================
    await esbuild.build({
      // 只保留客户端入口，因为 client-entry 会通过 import() 动态拉取其他页面
      entryPoints: [path.join(process.cwd(), 'lib/client-entry.js')],
      bundle: true,
      splitting: true,
      format: 'esm',
      outdir: chunksDir,
      entryNames: '[name]',
      loader: { '.jsx': 'jsx', '.js': 'jsx' },
      jsx: 'automatic',
      platform: 'browser',
      define: { 'process.env.NODE_ENV': '"development"' },
    });
    
    // ==========================================
    // 3. SSG 静态预渲染逻辑 (核心魔法)
    // ==========================================
    console.log('📄 [2/2] 正在扫描并执行 SSG 静态生成 (Prerendering)...');
    
    const React = require('react');
    const { renderToString } = require('react-dom/server');
    const { RouterProvider } = require('../lib/router-context');

    // 内部工具函数：将组件渲染为 HTML 并写入硬盘
    const renderAndSave = async (mod, props, routePath, saveName) => {
      console.log(`   - 正在预渲染: ${routePath}`);
      
      // 加载 _app.jsx
      const _appPath = path.join(process.cwd(), 'pages/_app.jsx');
      let AppComponent = null;
      if (fs.existsSync(_appPath)) {
        AppComponent = require(_appPath).default;
      }

      // 执行 React 服务端渲染
      const content = renderToString(
        React.createElement(RouterProvider, {
          initialComponent: mod.default,
          initialProps: props,
          path: routePath,
          AppComponent: AppComponent
        })
      );

      // 拼装最终的 HTML 骨架
      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Mini Next SSG</title>
          </head>
          <body>
            <div id="root">${content}</div>
            <script>
              window.__NEXT_DATA__ = ${JSON.stringify(props)};
              window.__CURRENT_PATH__ = "${routePath}";
            </script>
            <script type="module" src="/chunks/client-entry.js"></script>
          </body>
        </html>
      `;
      
      // 确保多级目录存在 (例如 saveName 是 "post/1" 时，需创建 post 文件夹)
      const targetDir = path.join(staticHtmlDir, path.dirname(saveName));
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

      // 将 HTML 和预取需要的 JSON 写入硬盘
      fs.writeFileSync(path.join(staticHtmlDir, `${saveName}.html`), html);
      fs.writeFileSync(path.join(staticHtmlDir, `${saveName}.json`), JSON.stringify(props));
    };

    // 递归扫描 pages 目录寻找 SSG 页面
    const pagesDir = path.join(process.cwd(), 'pages');
    
    // 这里收集所有的构建任务，最后使用 Promise.all 并发执行以提高速度
    const buildTasks = [];

    function scanAndRender(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          // 遇到文件夹 (如 /post) 递归扫描
          scanAndRender(fullPath);
        } else if (file.name.endsWith('.jsx') && !file.name.startsWith('_')) {
          // 遇到普通组件文件
          const mod = require(fullPath);
          
          // 提取相对路由名，例如: index, about, post/[id]
          const relativePath = path.relative(pagesDir, fullPath).replace(/\\/g, '/').replace('.jsx', '');

          // --- 场景 A: 动态路由 SSG (文件路径含 [], 且导出了 getStaticPaths) ---
          if (relativePath.includes('[') && mod.getStaticPaths && mod.getStaticProps) {
            const task = mod.getStaticPaths().then(async ({ paths }) => {
              for (const p of paths) {
                // p.params 例如 { id: '1' }
                // 我们要把 post/[id] 替换成真实的 url: post/1
                let finalRouteName = relativePath;
                for (const key in p.params) {
                  finalRouteName = finalRouteName.replace(`[${key}]`, p.params[key]);
                }
                const routePath = `/${finalRouteName}`;
                
                // 执行数据获取并生成文件
                const props = await mod.getStaticProps({ params: p.params });
                await renderAndSave(mod, props, routePath, finalRouteName);
              }
            });
            buildTasks.push(task);
          } 
          
          // --- 场景 B: 普通静态路由 SSG (文件路径无 [], 导出了 getStaticProps) ---
          else if (!relativePath.includes('[') && mod.getStaticProps) {
            const routePath = relativePath === 'index' ? '/' : `/${relativePath}`;
            const task = mod.getStaticProps().then(async (props) => {
              await renderAndSave(mod, props, routePath, relativePath);
            });
            buildTasks.push(task);
          }
        }
      }
    }
    
    // 开始扫描并收集任务
    scanAndRender(pagesDir);
    
    // 等待所有页面的 HTML 渲染写入完毕
    await Promise.all(buildTasks);
    
    console.log('✅ SSG 编译与生成全部完成！\n');

  } catch (err) {
    console.error('❌ 构建框架崩溃:', err);
    process.exit(1);
  }
}

module.exports = { runBuild };