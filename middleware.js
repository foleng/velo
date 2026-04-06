// middleware.js
export function middleware(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  console.log(`[Middleware] 正在拦截请求: ${pathname}`);

  // 场景 1：权限校验
  // 如果访问的是 /post/123，且没有特殊的 query（模拟未登录），则重定向到 /about
  if (pathname.startsWith('/post/123') && !url.searchParams.get('token')) {
    console.log('[Middleware] 无权访问，重定向至 /about');
    return { redirect: '/about' };
  }

  // 场景 2：直接拦截并返回
  if (pathname === '/secret') {
    return { rewrite: '这是中间件直接拦截并返回的私密信息' };
  }

  // 场景 3：放行
  return { next: true };
}