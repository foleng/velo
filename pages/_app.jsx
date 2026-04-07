// pages/_app.jsx
import React from 'react';
import Link from '../lib/link';

export default function MyApp({ Component, pageProps }) {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {/* 全局导航栏 */}
      <nav style={{ borderBottom: '1px solid #ccc', padding: '10px' }}>
        <Link href="/" style={{ marginRight: '10px' }}>首页</Link>
        <Link href="/about" style={{ marginRight: '10px' }}>关于</Link>
        <Link href="/post/123">动态文章</Link>
      </nav>

      {/* 页面内容 */}
      <main style={{ padding: '20px' }}>
        <Component {...pageProps} />
      </main>

      <footer style={{ marginTop: '50px', color: '#888' }}>
        © 2024 My Velo Framework
      </footer>
    </div>
  );
}