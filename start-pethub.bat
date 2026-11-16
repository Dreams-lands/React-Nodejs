@echo off
chcp 65001 >nul
title PetHub Fullstack Web App
echo ====================================================
echo 🐾 [PetHub] Khởi chạy ứng dụng Fullstack trên Web
echo ====================================================
echo 📡 Backend API : http://localhost:5000/api
echo 🌐 Frontend Web: http://localhost:5173
echo 🗄️ Database     : PostgreSQL (webql_db)
echo.
echo 👉 Trình duyệt web sẽ tự động mở trang PetHub...
echo ====================================================
npm run dev
pause
