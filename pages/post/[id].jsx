// pages/post/[id].jsx
import React from 'react';
import Link from '../../lib/link'; // 注意相对路径

export default function Post({ postData }) {
  // 如果没有传数据，说明是 fallback 状态（或者没写 getStaticProps）
  if (!postData) return <div>文章加载中...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>{postData.title}</h1>
      <p>ID: {postData.id}</p>
      <p>作者: {postData.author}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#eef' }}>
        <p><i>（这个页面是在 build 阶段生成的纯静态 HTML）</i></p>
        <p>构建时间: {postData.buildTime}</p>
      </div>

      <br />
      <Link href="/">回到首页</Link>
    </div>
  );
}

// 1. 告诉框架有哪些动态路径需要提前生成
export async function getStaticPaths() {
  // 模拟从数据库或 API 拿到所有的文章 ID
  const paths = [
    { params: { id: '1' } },
    { params: { id: '2' } },
    { params: { id: 'hello-world' } } // 支持字符串 slug
  ];

  return { paths };
}

// 2. 根据上面提供的每一个 ID，获取对应的具体数据
export async function getStaticProps({ params }) {
  console.log(`--- 正在静态构建文章详情，ID: ${params.id} ---`);
  
  // 模拟根据 ID 查数据库
  const fakeDb = {
    '1': { title: '第一篇博客', author: '张三' },
    '2': { title: 'Mini-Next 核心原理解析', author: '李四' },
    'hello-world': { title: '你好，世界', author: '王五' }
  };

  const data = fakeDb[params.id] || { title: '未知文章', author: '佚名' };

  return {
    postData: {
      id: params.id,
      title: data.title,
      author: data.author,
      buildTime: new Date().toLocaleTimeString()
    }
  };
}