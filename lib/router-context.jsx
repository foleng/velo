// lib/router-context.jsx
import React, { useState, useEffect, createContext, useContext } from 'react';

const RouterContext = createContext();

// 也要在这里定义映射，确保 navigate 能找到对应的组件代码
const PAGES_MAP = {
  'index': () => import('../pages/index.jsx'),
  'about': () => import('../pages/about.jsx'),
  '[id]': () => import('../pages/post/[id].jsx'),
};

export function RouterProvider({ initialComponent, initialProps, path }) {
  const [state, setState] = useState({
    Component: initialComponent,
    props: initialProps,
    path: path || '/'
  });

  const navigate = async (href) => {
    window.history.pushState({}, '', href);
    
    let pageKey = href === '/' ? 'index' : href.replace(/^\//, '').split('/')[0];
    if (href.startsWith('/post/')) pageKey = '[id]';

    const [dataRes, componentModule] = await Promise.all([
      fetch(`${href}${href.includes('?') ? '&' : '?'}_data=1`).then(r => r.json()),
      PAGES_MAP[pageKey]() // 调用映射中的动态导入
    ]);

    setState({ 
      Component: componentModule.default, 
      props: dataRes, 
      path: href 
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.onpopstate = () => navigate(window.location.pathname);
    }
  }, []);

  const Component = state.Component;
  return (
    <RouterContext.Provider value={{ navigate, path: state.path }}>
      <Component {...state.props} />
    </RouterContext.Provider>
  );
}

export const useRouter = () => useContext(RouterContext);