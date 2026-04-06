// pages/test-events.jsx
import React, { useEffect, useState } from 'react';
import { useRouter } from '../lib/router-context';
import Link from '../lib/link';

export default function TestEvents() {
  const router = useRouter();
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // 用于模拟进度条的宽度状态
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. 订阅开始事件
    const handleStart = (url) => {
      setLoadingMsg(`正在赶往: ${url} ...`);
      setProgress(30); // 瞬间跳到 30%
    };

    // 2. 订阅完成事件
    const handleComplete = (url) => {
      setProgress(100); // 进度条拉满
      setLoadingMsg(`✅ 成功抵达: ${url}`);
      
      // 延迟半秒隐藏进度条
      setTimeout(() => {
        setProgress(0);
        setLoadingMsg('');
      }, 500);
    };

    // 绑定事件
    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);

    // 组件卸载时解绑事件，防止内存泄漏
    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
    };
  }, [router]);

  return (
    <div style={{ padding: '20px' }}>
      {/* 这是一个简陋的加载进度条 UI */}
      {progress > 0 && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, height: '4px',
          background: 'blue',
          width: `${progress}%`,
          transition: 'width 0.2s ease',
          zIndex: 9999
        }} />
      )}

      <h1>路由事件 (Router Events) 测试</h1>
      
      <div style={{ height: '30px', color: 'orange', fontWeight: 'bold' }}>
        {loadingMsg}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <Link href="/">去首页</Link>
        <Link href="/about">去关于页</Link>
        
        {/* 我们可以用 navigate 故意设置一个假的延迟，让你看清进度条 */}
        <button onClick={() => {
          router.events.emit('routeChangeStart', '/fake-delay');
          setProgress(50);
          setTimeout(() => {
            router.navigate('/');
            // navigate 内部完成后会自动 emit complete
          }, 1000);
        }}>
          模拟一个耗时 1 秒的跳转
        </button>
      </div>
    </div>
  );
}

// 随便弄个 getServerSideProps，让这个页面成为 SSR
export async function getServerSideProps() {
  return {};
}