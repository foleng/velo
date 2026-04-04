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

      if (routeName.includes('[') && routeName.includes(']')) {
        const regexSource = path.join(routePrefix, routeName)
          .replace(/\\/g, '/')
          .replace(/\[(.+?)\]/g, '(?<$1>[^/]+)');
        dynamicRoutes.push({
          pattern: new RegExp(`^${regexSource}$`),
          componentPath: fullPath
        });
      } else {
        const finalRoute = path.join(routePrefix, routeName).replace(/\\/g, '/') || '/';
        staticRoutes[finalRoute] = fullPath;
      }
    }
  });
  return { staticRoutes, dynamicRoutes };
}

module.exports = { scanRoutes };
