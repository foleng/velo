// framework/router.js
const fs = require('fs');
const path = require('path');

function scanRoutes(dir, routePrefix = '/') {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let staticRoutes = {};
  let dynamicRoutes = [];

  files.forEach((file) => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      const child = scanRoutes(fullPath, path.join(routePrefix, file.name));
      staticRoutes = { ...staticRoutes, ...child.staticRoutes };
      dynamicRoutes = [ ...dynamicRoutes, ...child.dynamicRoutes ];
    } else {
      let routeName = file.name.replace(/\.jsx$/, '');
      if (routeName === 'index') routeName = '';

      // --- 【核心修改点：处理 Catch-all 路由 [...slug]】 ---
      if (routeName.startsWith('[...') && routeName.endsWith(']')) {
        // 提取参数名，比如 [...slug] 提取出 slug
        const paramName = routeName.slice(4, -1); 
        
        // 生成正则：匹配前面的路径 + 后面跟着的所有内容 (.*)
        // 例如：/post/[...slug] 变成 ^/post/(?<slug>.*)$
        const regexSource = path.join(routePrefix)
          .replace(/\\/g, '/') + `/(?<${paramName}>.*)`;
          
        dynamicRoutes.push({
          pattern: new RegExp(`^${regexSource}$`),
          componentPath: fullPath,
          isCatchAll: true // 打个标记
        });
      } 
      // --- 处理普通的动态路由 [id] ---
      else if (routeName.includes('[') && routeName.includes(']')) {
        const regexSource = path.join(routePrefix, routeName)
          .replace(/\\/g, '/')
          .replace(/\[(.+?)\]/g, '(?<$1>[^/]+)');
        dynamicRoutes.push({
          pattern: new RegExp(`^${regexSource}$`),
          componentPath: fullPath
        });
      } 
      // --- 处理静态路由 ---
      else {
        const finalRoute = path.join(routePrefix, routeName).replace(/\\/g, '/') || '/';
        staticRoutes[finalRoute] = fullPath;
      }
    }
  });

  // --- 【极其重要的排序逻辑】 ---
  // Catch-all 路由必须放在最后面匹配！否则它会把普通的 [id] 也拦截掉
  dynamicRoutes.sort((a, b) => {
    if (a.isCatchAll && !b.isCatchAll) return 1;
    if (!a.isCatchAll && b.isCatchAll) return -1;
    return 0;
  });

  return { staticRoutes, dynamicRoutes };
}

module.exports = { scanRoutes };