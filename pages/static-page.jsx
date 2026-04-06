// pages/static-page.jsx
import React from 'react';
import Link from '../lib/link';

export default function StaticPage({ buildTime, randomData }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>这是纯静态页面 (SSG)</h1>
      <p>这个页面的 HTML 是在执行 node build 的时候生成的，而不是你请求的时候生成的。</p>
      
      <div style={{ background: '#eee', padding: '10px', marginTop: '20px' }}>
        <p><strong>构建时间:</strong> {buildTime}</p>
        <p><strong>打包时获取的数据:</strong> {randomData}</p>
        <p><i>（无论你怎么刷新页面，上面的时间和数据都不会变了）</i></p>
      </div>

      <br />
      <Link href="/">回到首页</Link>
    </div>
  );
}

// 框架会在编译时调用这个函数
export async function getStaticProps() {
  console.log('--- 正在构建阶段执行 getStaticProps ---');
  return {
    buildTime: new Date().toLocaleTimeString(),
    randomData: Math.floor(Math.random() * 10000),
      // 【核心新增】：告诉框架，这个页面的保质期是 10 秒
    revalidate: 10 
  };
}