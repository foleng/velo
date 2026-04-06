// pages/api/hello.js
export default function handler(req, res) {
  // 这里可以写后端逻辑：查数据库、调用外部 API 等
  const date = new Date().toLocaleString();
  
  res.json({ 
    message: '你好，这是来自 Mini-Next API 的数据',
    time: date,
    status: 'success'
  });
}