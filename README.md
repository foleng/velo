# Velo

A lightweight Next.js-like framework for React applications with server-side rendering, static site generation, and incremental static regeneration capabilities.

## Language / 语言

- [English](README.md)
- [中文](README.zh-CN.md)

## 特性 | Features

- **服务端渲染 (SSR)** - Server-side rendering for improved performance and SEO
- **静态站点生成 (SSG)** - Static site generation for faster page loads
- **增量静态再生 (ISR)** - Incremental static regeneration for dynamic content
- **API 路由** - API routes for backend functionality
- **动态路由** - Dynamic routes with support for catch-all routes
- **中间件** - Middleware support for request processing
- **客户端路由** - Client-side routing for single-page application experience
- **代码分割** - Code splitting for optimized bundle sizes

## 快速开始 | Quick Start

### 安装依赖 | Install Dependencies

```bash
pnpm install
```

### 启动开发服务器 | Start Development Server

```bash
pnpm dev
```

The server will run on http://localhost:3000

## 目录结构 | Directory Structure

```
├── blog/             # Blog-related components
├── framework/        # Core framework code
│   ├── build.js      # Build process
│   ├── router.js     # Route scanning and matching
│   └── server.js     # Express server
├── lib/              # Utility library
│   ├── client-entry.js    # Client-side entry point
│   ├── head.jsx           # Head component
│   ├── image.jsx          # Image component
│   ├── link.jsx           # Link component
│   ├── router-context.jsx # Router context
│   └── script.jsx         # Script component
├── pages/            # Page components
│   ├── api/          # API routes
│   ├── docs/         # Documentation pages
│   ├── post/         # Blog post pages
│   ├── _app.jsx      # App component
│   ├── 404.jsx       # 404 page
│   └── index.jsx     # Home page
├── public/           # Static assets
│   ├── chunks/       # Built client-side bundles
│   └── static-html/  # Generated static HTML files
├── middleware.js     # Middleware
├── package.json      # Project configuration
└── start.js          # Server start script
```

## 路由系统 | Routing System

### 静态路由 | Static Routes

Static routes are created by adding files to the `pages` directory. For example:

- `pages/index.jsx` → `/`
- `pages/about.jsx` → `/about`
- `pages/docs/index.jsx` → `/docs`

### 动态路由 | Dynamic Routes

Dynamic routes are created by adding files with brackets in their names. For example:

- `pages/post/[id].jsx` → `/post/1`, `/post/2`, etc.
- `pages/docs/[...slug].jsx` → `/docs/guide`, `/docs/guide/advanced`, etc. (catch-all route)

### API 路由 | API Routes

API routes are created by adding files to the `pages/api` directory. For example:

- `pages/api/hello.js` → `/api/hello`

## 数据获取 | Data Fetching

### 静态站点生成 | Static Site Generation (SSG)

Use `getStaticProps` to generate static pages at build time:

```jsx
export async function getStaticProps() {
  // Fetch data here
  return {
    props: {
      // Data to pass to the component
    }
  };
}
```

For dynamic routes with SSG, use `getStaticPaths` to specify the paths to generate:

```jsx
export async function getStaticPaths() {
  return {
    paths: [
      { params: { id: '1' } },
      { params: { id: '2' } }
    ]
  };
}

export async function getStaticProps({ params }) {
  // Fetch data based on params
  return {
    props: {
      // Data to pass to the component
    }
  };
}
```

### 服务端渲染 | Server-Side Rendering (SSR)

Use `getServerSideProps` to fetch data on each request:

```jsx
export async function getServerSideProps({ params }) {
  // Fetch data here
  return {
    props: {
      // Data to pass to the component
    }
  };
}
```

### 增量静态再生 | Incremental Static Regeneration (ISR)

Add a `revalidate` property to the return value of `getStaticProps` to enable ISR:

```jsx
export async function getStaticProps() {
  // Fetch data here
  return {
    props: {
      // Data to pass to the component
    },
    revalidate: 60 // Regenerate every 60 seconds
  };
}
```

## 中间件 | Middleware

Create a `middleware.js` file in the root directory to add custom middleware:

```js
// middleware.js
export default function middleware(req) {
  // Custom middleware logic
  if (req.path === '/old-path') {
    return { redirect: '/new-path' };
  }
  // Continue to the next middleware or route
  return { next: true };
}

// Or using named export
export function middleware(req) {
  // Custom middleware logic
  return { next: true };
}
```

## 应用组件 | App Component

Create a `_app.jsx` file in the `pages` directory to customize the app layout:

```jsx
// pages/_app.jsx
import React from 'react';

export default function App({ Component, pageProps }) {
  return (
    <div>
      <header>
        {/* Header content */}
      </header>
      <main>
        <Component {...pageProps} />
      </main>
      <footer>
        {/* Footer content */}
      </footer>
    </div>
  );
}
```

## 文档组件 | Document Component

Create a `_document.jsx` file in the `pages` directory to customize the HTML document:

```jsx
// pages/_document.jsx
import React from 'react';

export default function Document({ content, props, path }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Velo App</title>
      </head>
      <body>
        <div id="root">{content}</div>
        <script>
          window.__NEXT_DATA__ = {JSON.stringify(props)};
          window.__CURRENT_PATH__ = "${path}";
        </script>
        <script type="module" src="/chunks/client-entry.js"></script>
      </body>
    </html>
  );
}
```

## 部署 | Deployment

1. Build the application:

```bash
node start.js
```

2. The static files will be generated in the `public` directory.

3. Serve the `public` directory with your preferred static hosting service.

## 技术栈 | Technology Stack

- Node.js
- Express
- React
- esbuild

## 许可证 | License

ISC
