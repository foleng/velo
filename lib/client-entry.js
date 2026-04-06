// lib/client-entry.js
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from './router-context';

/**
 * 页面映射表：显式定义所有可能的页面
 * 这让 esbuild 能够识别并进行代码分割（Code Splitting）
 */
const PAGES_MAP = {
  '_app': () => import('../pages/_app.jsx'),
  'index': () => import('../pages/index.jsx'),
  'about': () => import('../pages/about.jsx'),
  'shallow-page': () => import('../pages/shallow-page.jsx'),
  'static-page': () => import('../pages/static-page.jsx'),
  'test-events': () => import('../pages/test-events.jsx'),
  '[id]': () => import('../pages/post/[id].jsx'), // 动态路由文件名
  // 【新增】注册 catch-all 组件
  '[...slug]': () => import('../pages/docs/[...slug].jsx'), 
};

/**
 * 启动函数：将服务器渲染的 HTML 转换为可交互的 React 应用
 */
async function bootstrap() {
  // 1. 获取服务器注入的初始数据和路径
  const path = window.__CURRENT_PATH__;
  const props = window.__NEXT_DATA__;

  // 2. 根据 URL 确定页面 Key
  let pageKey = 'index';
  if (path !== '/') {
    const segments = path.split('/').filter(Boolean);
    pageKey = segments[0]; 
    // 特殊处理动态路由映射 (例如 /post/123 -> [id])
    if (path.startsWith('/post/')) pageKey = '[id]';
     // 【新增】匹配 /docs 开头的全部路由
    if (path.startsWith('/docs/')) pageKey = '[...slug]'; 
  }

  try {
    // 3. 并发加载全局 App 组件和当前页面组件
    // 这确保了 Hydration 时结构与服务端完全一致
    const [appMod, pageMod] = await Promise.all([
      PAGES_MAP['_app'](),
      PAGES_MAP[pageKey]()
    ]);

    // 4. 执行水合 (Hydration)
    // hydrateRoot 会保留服务器生成的 DOM，仅挂载事件监听器
    hydrateRoot(
      document.getElementById('root'),
      <RouterProvider 
        AppComponent={appMod.default}
        initialComponent={pageMod.default} 
        initialProps={props} 
        path={path} 
      />
    );
    console.log('✅ 客户端水合完成');
  } catch (err) {
    console.error('❌ 客户端启动失败:', err);
  }
}

// 执行启动
bootstrap();