// pages/post/[id].jsx
import React from 'react';

export default function Post({ id, title }) {
  return (
    <div>
      <h1>文章详情页</h1>
      <p>当前文章 ID: {id}</p>
      <p>模拟标题: {title}</p>
      <a href="/">返回首页</a>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // 这里的 params.id 就是从 URL 中提取出来的
  return { 
    id: params.id,
    title: `这是关于 ${params.id} 的文章内容` 
  };
}