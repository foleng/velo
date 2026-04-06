// lib/script.jsx
import React, { useEffect } from 'react';

export default function Script({ src, strategy = 'afterInteractive', onLoad }) {
  useEffect(() => {
    // 防止同一个脚本被加载多次
    if (document.querySelector(`script[src="${src}"]`)) return;

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      if (onLoad) script.onload = onLoad;
      document.body.appendChild(script);
    };

    if (strategy === 'lazyOnload') {
      // 策略：极低优先级。等网页全部加载完毕，甚至闲置了才去加载第三方脚本
      if (document.readyState === 'complete') {
        // 利用浏览器的空闲回调执行
        window.requestIdleCallback ? window.requestIdleCallback(loadScript) : setTimeout(loadScript, 0);
      } else {
        window.addEventListener('load', loadScript);
      }
    } else {
      // 策略：默认。React 组件挂载完后立刻加载
      loadScript();
    }

    return () => {
      // 卸载组件时清理事件 (可选)
      window.removeEventListener('load', loadScript);
    }
  }, [src, strategy]);

  return null;
}