import React from 'react';
import Link from '../lib/link';
import { useRouter } from '../lib/router-context';

export default function Index({ time }) {
  const { path } = useRouter();
  return (
    <div>
      <h1>首页</h1>
      <p>当前路径: {path}</p>
      <p>服务器时间: {time}</p>
      <Link href="/about" style={{color: 'blue'}}>去关于页</Link>
      <br/>
      <Link href="/post/123">查看动态文章 123</Link>
    </div>
  );
}

export async function getServerSideProps() {
  return { time: new Date().toLocaleTimeString() };
}