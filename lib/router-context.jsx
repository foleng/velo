// lib/router-context.jsx
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';

const RouterContext = createContext();

/**
 * 页面映射表：显式定义所有可能的页面，以便 esbuild 进行静态分析和按需打包 (Code Splitting)
 */
const PAGES_MAP = {
  '_app': () => import('../pages/_app.jsx'),
  'index': () => import('../pages/index.jsx'),
  'about': () => import('../pages/about.jsx'),
  'shallow-page': () => import('../pages/shallow-page.jsx'),
  'static-page': () => import('../pages/static-page.jsx'),
  'test-events': () => import('../pages/test-events.jsx'),
  '[id]': () => import('../pages/post/[id].jsx'),
};

/**
 * RouterProvider：整个 SPA 的状态中心
 */
export function RouterProvider({ initialComponent, initialProps, path, AppComponent }) {
  // 1. 核心状态：当前渲染的组件、传递的 Props、当前的路径
  const [state, setState] = useState({
    Component: initialComponent,
    props: initialProps,
    path: path || '/'
  });

  // 2. 预取缓存池：记录已经下载过的页面，避免重复发请求
  const prefetchCache = useRef({});

  // 3. 事件管理器：实现 routeChangeStart, routeChangeComplete 等生命周期钩子
  const events = useRef({
    listeners: {
      routeChangeStart: [],
      routeChangeComplete: [],
      routeChangeError: []
    },
    on(event, cb) {
      if (this.listeners[event]) this.listeners[event].push(cb);
    },
    off(event, cb) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(l => l !== cb);
      }
    },
    emit(event, ...args) {
      if (this.listeners[event]) {
        this.listeners[event].forEach(cb => cb(...args));
      }
    }
  });

  // 4. 全局包装器 (Layout)：如果没有定义 _app.jsx，则使用透明容器降级
  const App = AppComponent || (({ Component, pageProps }) => <Component {...pageProps} />);

  /**
   * 预取功能：鼠标悬停在 Link 上时触发，提前下载 JS 和 JSON
   */
  const prefetch = async (href) => {
    if (prefetchCache.current[href]) return;

    let pageKey = href === '/' ? 'index' : href.replace(/^\//, '').split('/')[0];
    if (href.startsWith('/post/')) pageKey = '[id]';

    try {
      const [dataRes, componentModule] = await Promise.all([
        fetch(`${href}${href.includes('?') ? '&' : '?'}_data=1`).then(r => r.json()),
        PAGES_MAP[pageKey]()
      ]);
      prefetchCache.current[href] = { 
        Component: componentModule.default, 
        props: dataRes 
      };
      // console.log(`☁️ 已静默预取: ${href}`);
    } catch (e) {
      // 预取失败静默处理，不打扰用户
    }
  };

  /**
   * 核心跳转功能 (包含深路由、浅路由、缓存读取、触发事件)
   */
  const navigate = async (href, options = {}) => {
    const currentPathname = window.location.pathname;
    const newPathname = new URL(href, window.location.origin).pathname;

    // A. 改变浏览器地址栏（不刷新页面）
    window.history.pushState({}, '', href);

    // B. 处理浅路由 (Shallow Routing)
    // 浅路由不发任何请求，只更新上下文的 path 状态，触发组件本身重渲染
    if (options.shallow && currentPathname === newPathname) {
      // console.log(`🌊 浅路由触发: ${href}`);
      setState(prev => ({ ...prev, path: href }));
      return; 
    }

    // --- 开始深路由流程 ---

    // C. 触发 Start 事件
    events.current.emit('routeChangeStart', href);

    // D. 尝试使用缓存
    if (prefetchCache.current[href]) {
      const cached = prefetchCache.current[href];
      setState({ Component: cached.Component, props: cached.props, path: href });
      window.scrollTo(0, 0);
      events.current.emit('routeChangeComplete', href);
      return;
    }

    // E. 无缓存则实时抓取
    let pageKey = href === '/' ? 'index' : href.replace(/^\//, '').split('/')[0];
    if (href.startsWith('/post/')) pageKey = '[id]';

    try {
      const [dataRes, componentModule] = await Promise.all([
        fetch(`${href}${href.includes('?') ? '&' : '?'}_data=1`).then(r => r.json()),
        PAGES_MAP[pageKey]()
      ]);
      
      setState({ 
        Component: componentModule.default, 
        props: dataRes, 
        path: href 
      });
      window.scrollTo(0, 0); // 页面置顶
      
      // F. 触发 Complete 事件
      events.current.emit('routeChangeComplete', href);
    } catch (e) {
      console.error('跳转失败:', e);
      events.current.emit('routeChangeError', e, href);
      // 可选的降级策略：window.location.href = href;
    }
  };

  /**
   * 监听浏览器物理返回/前进键 (PopState)
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 当用户点击后退时，用当前的路径去执行一遍 navigate（由于浏览器已经改了地址栏，所以直接拿来用）
      window.onpopstate = () => navigate(window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <RouterContext.Provider value={{ 
      navigate, 
      prefetch, 
      path: state.path, 
      events: events.current // 暴露事件管理器供页面监听
    }}>
      <App Component={state.Component} pageProps={state.props} />
    </RouterContext.Provider>
  );
}

/**
 * Custom Hook: 供所有页面组件调用
 */
export const useRouter = () => useContext(RouterContext);