// lib/head.jsx
import React, { useEffect } from 'react';

// 为了简化，我们这里重点实现客户端的动态修改
// 在真实的 Next.js 中，服务端也会通过 Context 收集这些标签注入到 HTML 中
export default function Head({ children }) {
  useEffect(() => {
    // 遍历传入的子节点（比如 <title> 或 <meta>）
    React.Children.forEach(children, (child) => {
      if (!child) return;

      if (child.type === 'title') {
        // 动态修改网页标题
        document.title = child.props.children;
      } 
      else if (child.type === 'meta') {
        // 动态注入 Meta 标签 (用于 SEO 和社交分享卡片)
        const name = child.props.name || child.props.property;
        if (name) {
          let metaTag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          if (!metaTag) {
            metaTag = document.createElement('meta');
            document.head.appendChild(metaTag);
          }
          // 更新属性
          Object.keys(child.props).forEach(key => {
            metaTag.setAttribute(key, child.props[key]);
          });
        }
      }
    });
  }, [children]);

  // Head 组件本身不在页面 Body 中渲染任何可见内容
  return null; 
}