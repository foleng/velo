// lib/client-entry.js
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from './router-context';

// 【核心修改点】显式定义页面映射
// 这让 esbuild 知道这些文件需要被作为动态 chunk 打包
const PAGES_MAP = {
  'index': () => import('../pages/index.jsx'),
  'about': () => import('../pages/about.jsx'),
  '[id]': () => import('../pages/post/[id].jsx'),
};

async function bootstrap() {
  const path = window.__CURRENT_PATH__;
  const props = window.__NEXT_DATA__;

  // 获取页面 Key
  let pageKey = 'index';
  if (path !== '/') {
    const segments = path.split('/').filter(Boolean);
    pageKey = segments[0];
    if (path.startsWith('/post/')) pageKey = '[id]';
  }

  try {
    // 动态加载组件模块
    const loader = PAGES_MAP[pageKey];
    if (!loader) throw new Error(`Page not found: ${pageKey}`);
    
    const pageModule = await loader();
    
    hydrateRoot(
      document.getElementById('root'),
      <RouterProvider 
        initialComponent={pageModule.default} 
        initialProps={props} 
        path={path} 
      />
    );
  } catch (err) {
    console.error('水合失败:', err);
  }
}

bootstrap();