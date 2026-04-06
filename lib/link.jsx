// lib/link.jsx
import React from 'react';
import { useRouter } from './router-context';

export default function Link({ href, children, prefetch = true, ...props }) {
  const { navigate, prefetch: prefetchData } = useRouter();

  const handleClick = (e) => {
    if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      navigate(href);
    }
  };

  // 【核心修改】：鼠标移入时触发预取
  const handleMouseEnter = () => {
    if (prefetch) {
      prefetchData(href);
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick} 
      onMouseEnter={handleMouseEnter} 
      {...props}
    >
      {children}
    </a>
  );
}