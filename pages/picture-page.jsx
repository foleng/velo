import Image from '../lib/image';

export default function PicturePage() {
  return (
    <div style={{ width: '500px' }}>
      <h2>优雅加载的图片</h2>
      <Image 
        src="https://images.unsplash.com/photo-1682687220742-aba13b6e50ba" 
        width={800} 
        height={600} 
        alt="风景图" 
      />
      <p>图片下方的内容绝对不会因为图片的加载而发生跳动！</p>
    </div>
  )
}