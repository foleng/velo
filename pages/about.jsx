import React from 'react';
import Link from '../lib/link';

export default function About() {
  return (
    <div>
      <h1>关于我们</h1>
      <p>这是一个手写的 Next.js 框架测试。</p>
      <Link href="/">回到首页</Link>
    </div>
  );
}