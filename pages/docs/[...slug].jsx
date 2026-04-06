// pages/docs/[...slug].jsx
import React from 'react';
import Link from '../../lib/link';

export default function Docs({ slugArray, currentPath }) {
  return (
    <div style={{ padding: '20px' }}>
      <h1>万能文档页 (Catch-all Routing)</h1>
      
      <div style={{ background: '#f5f5f5', padding: '15px', marginTop: '20px' }}>
        <p>你当前访问的完整路径是: <strong>{currentPath}</strong></p>
        <p>
          解析出的 slug 层级: 
          <code>{JSON.stringify(slugArray)}</code>
        </p>
      </div>

      <ul style={{ marginTop: '20px' }}>
        <li><Link href="/docs/react/hooks">前往 /docs/react/hooks</Link></li>
        <li><Link href="/docs/api/v1/auth/login">前往 /docs/api/v1/auth/login</Link></li>
        <li><Link href="/">回首页</Link></li>
      </ul>
    </div>
  );
}

// 获取请求参数
export async function getServerSideProps({ params }) {
  console.log('Catch-all 收到参数:', params.slug);
  
  return {
    slugArray: params.slug || [], // 返回解析出的数组
    currentPath: '/docs/' + (params.slug ? params.slug.join('/') : '')
  };
}