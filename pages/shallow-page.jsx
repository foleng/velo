// pages/index.jsx
import React from 'react';
import Link from '../lib/link';
import { useRouter } from '../lib/router-context';

export default function Index({ time }) {
  const router = useRouter();

  // 纯手工解析 URL 参数（模拟 useRouter().query）
  // 因为框架没做这步封装，我们临时用原生 API 读取
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost';
  const searchParams = new URL(currentUrl).searchParams;
  const currentTab = searchParams.get('tab') || '1';

  return (
    <div style={{ padding: '20px' }}>
      <h1>浅路由 (Shallow Routing) 测试</h1>
      <p>服务器渲染时间: {time} (观察这个时间会不会变)</p>
      
      <div style={{ margin: '20px 0', padding: '10px', background: '#f5f5f5' }}>
        <h3>当前所在的 Tab: 第 {currentTab} 页</h3>
        
        {/* 触发浅路由 */}
        <button onClick={() => router.navigate('/?tab=1', { shallow: true })}>
          看 Tab 1 (浅路由)
        </button>
        <button onClick={() => router.navigate('/?tab=2', { shallow: true })}>
          看 Tab 2 (浅路由)
        </button>

        <hr />
        
        {/* 触发深路由 (默认行为) */}
        <button onClick={() => router.navigate('/?tab=3')}>
          看 Tab 3 (深路由 - 会重新请求数据)
        </button>
      </div>

      <Link href="/about">去关于页</Link>
    </div>
  );
}

export async function getServerSideProps() {
  console.log('服务端正在运行 getServerSideProps...');
  return { time: new Date().toLocaleTimeString() };
}