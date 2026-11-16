const { spawn } = require('child_process');
const path = require('path');

console.log('====================================================');
console.log('🐾 [PetHub] Đang khởi động Fullstack (Backend + Frontend)...');
console.log('====================================================');

// 1. Khởi chạy Backend Express Server
const backend = spawn('node', ['src/server.js'], {
  cwd: path.resolve(__dirname, '../backend'),
  stdio: 'inherit',
  shell: true,
});

// 2. Khởi chạy Frontend Vite Dev Server (tự động mở trình duyệt)
const frontend = spawn('npx', ['vite', '--open'], {
  cwd: path.resolve(__dirname, '../frontend'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = (signal) => {
  console.log(`\n🛑 Nhận tín hiệu ${signal}. Đang tắt toàn bộ tiến trình PetHub...`);
  try {
    backend.kill('SIGINT');
  } catch (err) {}
  try {
    frontend.kill('SIGINT');
  } catch (err) {}
  process.exit(0);
};

process.on('SIGINT', () => cleanup('SIGINT'));
process.on('SIGTERM', () => cleanup('SIGTERM'));
