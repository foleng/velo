// lib/image.jsx
import React from 'react';

export default function Image({ src, alt, width, height, ...props }) {
  // 核心魔法：计算高宽比 (Aspect Ratio)
  // 通过给外层盒子设置 paddingBottom，在图片没下载完之前就把位置提前“占”好
  const paddingTop = `${(height / width) * 100}%`;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: width }}>
      {/* 占位符盒子，绝对防止 CLS 布局偏移 */}
      <div style={{ width: '100%', paddingBottom: paddingTop }} />
      
      <img
        src={src}
        alt={alt}
        // 原生懒加载：图片只有滚动到视口附近才会发网络请求下载
        loading="lazy" 
        // 异步解码：不阻塞主线程渲染
        decoding="async" 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover', // 保持图片比例不变形
        }}
        {...props}
      />
    </div>
  );
}