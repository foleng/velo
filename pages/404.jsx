// pages/404.jsx
import React from 'react';
import Link from '../lib/link';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>404 - 页面没找到</h1>
      <p>对不起，您访问的路径不存在。</p>
      <Link href="/" style={{ color: 'blue' }}>回到首页</Link>
    </div>
  );
}