require('esbuild-register');
const express = require('express');
const React = require('react');
const { renderToString } = require('react-dom/server');
const path = require('path');
const { scanRoutes } = require('./router');
const { runBuild } = require('./build');
const { RouterProvider } = require('../lib/router-context');

const app = express();
app.use(express.static('public'));

async function startServer() {
  await runBuild();
  const { staticRoutes, dynamicRoutes } = scanRoutes(path.join(process.cwd(), 'pages'));

  app.get('*', async (req, res) => {
    if (req.path.startsWith('/chunks')) return res.status(404).end();

    let componentPath = staticRoutes[req.path];
    let params = {};

    if (!componentPath) {
      for (const route of dynamicRoutes) {
        const match = req.path.match(route.pattern);
        if (match) {
          componentPath = route.componentPath;
          params = match.groups;
          break;
        }
      }
    }

    if (!componentPath) return res.status(404).send('Not Found');

    try {
      const mod = require(componentPath);
      let props = { params };
      if (mod.getServerSideProps) {
        props = { ...props, ...(await mod.getServerSideProps({ params })) };
      }

      if (req.query._data === '1') return res.json(props);

      const content = renderToString(
        React.createElement(RouterProvider, {
          initialComponent: mod.default,
          initialProps: props,
          path: req.path
        })
      );

      res.send(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"><title>Mini Next</title></head>
          <body>
            <div id="root">${content}</div>
            <script>
              window.__NEXT_DATA__ = ${JSON.stringify(props)};
              window.__CURRENT_PATH__ = "${req.path}";
            </script>
            <script type="module" src="/chunks/client-entry.js"></script>
          </body>
        </html>
      `);
    } catch (e) {
      res.status(500).send(e.stack);
    }
  });

  app.listen(3000, () => console.log('🚀 Ready on http://localhost:3000'));
}

module.exports = { startServer };