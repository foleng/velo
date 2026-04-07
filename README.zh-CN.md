# Velo

一个轻量级的类Next.js框架，支持服务端渲染、静态站点生成和增量静态再生功能。

## Language / 语言

- [English](README.md)
- [中文](README.zh-CN.md)

## 特性

- **服务端渲染 (SSR)** - 提高性能和SEO
- **静态站点生成 (SSG)** - 更快的页面加载速度
- **增量静态再生 (ISR)** - 动态内容的增量更新
- **API 路由** - 后端功能支持
- **动态路由** - 支持捕获所有路由的动态路由
- **中间件** - 请求处理中间件
- **客户端路由** - 单页应用体验
- **代码分割** - 优化 bundle 大小

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3000 上运行

## 目录结构

```
├── blog/             # 博客相关组件
├── framework/        # 核心框架代码
│   ├── build.js      # 构建过程
│   ├── router.js     # 路由扫描和匹配
│   └── server.js     # Express 服务器
├── lib/              # 工具库
│   ├── client-entry.js    # 客户端入口点
│   ├── head.jsx           # Head 组件
│   ├── image.jsx          # Image 组件
│   ├── link.jsx           # Link 组件
│   ├── router-context.jsx # 路由上下文
│   └── script.jsx         # Script 组件
├── pages/            # 页面组件
│   ├── api/          # API 路由
│   ├── docs/         # 文档页面
│   ├── post/         # 博客文章页面
│   ├── _app.jsx      # App 组件
│   ├── 404.jsx       # 404 页面
│   └── index.jsx     # 首页
├── public/           # 静态资源
│   ├── chunks/       # 构建后的客户端包
│   └── static-html/  # 生成的静态 HTML 文件
├── middleware.js     # 中间件
├── package.json      # 项目配置
└── start.js          # 服务器启动脚本
```

## 路由系统

### 静态路由

通过在 `pages` 目录中添加文件来创建静态路由。例如：

- `pages/index.jsx` → `/`
- `pages/about.jsx` → `/about`
- `pages/docs/index.jsx` → `/docs`

### 动态路由

通过添加名称中带有括号的文件来创建动态路由。例如：

- `pages/post/[id].jsx` → `/post/1`, `/post/2` 等
- `pages/docs/[...slug].jsx` → `/docs/guide`, `/docs/guide/advanced` 等（捕获所有路由）

### API 路由

通过在 `pages/api` 目录中添加文件来创建 API 路由。例如：

- `pages/api/hello.js` → `/api/hello`

## 数据获取

### 静态站点生成 (SSG)

使用 `getStaticProps` 在构建时生成静态页面：

```jsx
export async function getStaticProps() {
  // 在此获取数据
  return {
    props: {
      // 传递给组件的数据
    }
  };
}
```

对于带有 SSG 的动态路由，使用 `getStaticPaths` 指定要生成的路径：

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
  // 根据 params 获取数据
  return {
    props: {
      // 传递给组件的数据
    }
  };
}
```

### 服务端渲染 (SSR)

使用 `getServerSideProps` 在每次请求时获取数据：

```jsx
export async function getServerSideProps({ params }) {
  // 在此获取数据
  return {
    props: {
      // 传递给组件的数据
    }
  };
}
```

### 增量静态再生 (ISR)

在 `getStaticProps` 的返回值中添加 `revalidate` 属性以启用 ISR：

```jsx
export async function getStaticProps() {
  // 在此获取数据
  return {
    props: {
      // 传递给组件的数据
    },
    revalidate: 60 // 每 60 秒再生一次
  };
}
```

## 中间件

在根目录中创建 `middleware.js` 文件以添加自定义中间件：

```js
// middleware.js
export default function middleware(req) {
  // 自定义中间件逻辑
  if (req.path === '/old-path') {
    return { redirect: '/new-path' };
  }
  // 继续到下一个中间件或路由
  return { next: true };
}

// 或使用命名导出
export function middleware(req) {
  // 自定义中间件逻辑
  return { next: true };
}
```

## 应用组件

在 `pages` 目录中创建 `_app.jsx` 文件以自定义应用布局：

```jsx
// pages/_app.jsx
import React from 'react';

export default function App({ Component, pageProps }) {
  return (
    <div>
      <header>
        {/* 头部内容 */}
      </header>
      <main>
        <Component {...pageProps} />
      </main>
      <footer>
        {/* 底部内容 */}
      </footer>
    </div>
  );
}
```

## 文档组件

在 `pages` 目录中创建 `_document.jsx` 文件以自定义 HTML 文档：

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

## 部署

1. 构建应用：

```bash
node start.js
```

2. 静态文件将在 `public` 目录中生成。

3. 使用您首选的静态托管服务提供 `public` 目录。

## 技术栈

- Node.js
- Express
- React
- esbuild

## 许可证

ISC
