// framework/build.js
const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function runBuild() {
  const chunksDir = path.join(process.cwd(), 'public/chunks');
  if (fs.existsSync(chunksDir)) fs.rmSync(chunksDir, { recursive: true });

  console.log('📦 正在构建客户端 Bundle...');
  await esbuild.build({
    // 【修改点】只需要这一个入口即可，esbuild 会自动通过 import() 发现并拆分其他页面
    entryPoints: [path.join(process.cwd(), 'lib/client-entry.js')], 
    bundle: true,
    splitting: true, 
    format: 'esm',
    outdir: chunksDir,
    entryNames: '[name]',
    loader: { '.jsx': 'jsx', '.js': 'jsx' },
    jsx: 'automatic',
    platform: 'browser',
    define: { 'process.env.NODE_ENV': '"development"' },
  });
}

module.exports = { runBuild };