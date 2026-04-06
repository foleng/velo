import Script from '../lib/script';

export default function AnalyticsPage() {
  return (
    <div>
      <h1>脚本加载优化测试</h1>
      
      {/* 比如加载 jQuery，等页面闲置了再加载，绝不卡顿页面首屏 */}
      <Script 
        src="https://code.jquery.com/jquery-3.6.0.min.js" 
        strategy="lazyOnload"
        onLoad={() => console.log('jQuery 懒加载完成了！', window.$)}
      />
    </div>
  )
}