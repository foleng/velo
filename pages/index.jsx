import React, { useState } from 'react';
import Link from '../lib/link';

export default function Index() {
  const [apiData, setApiData] = useState(null);

  const fetchHello = async () => {
    const res = await fetch('/api/hello');
    const data = await res.json();
    setApiData(data);
  };

  return (
    <div>
      <h1>全栈能力测试</h1>
      <button onClick={fetchHello}>点击调用后端接口 (/api/hello)</button>

      {apiData && (
        <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
          <p>后端消息: {apiData.message}</p>
          <p>后端时间: {apiData.time}</p>
        </div>
      )}

      <hr />
      <Link href="/about">去关于页</Link>
    </div>
  );
}