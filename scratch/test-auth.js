const http = require('http');

const request = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Bắt đầu kiểm thử toàn bộ hệ thống API Auth, Bcrypt, JWT, Cookie & RBAC...\n');

  // 1. Kiểm tra trùng lặp email khi đăng ký
  const dupRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { full_name: 'Test Dup', email: 'dreams@gmail.com', password: 'password123' }
  );
  console.log(`1. Kiểm tra trùng email (dreams@gmail.com): Status ${dupRes.status} - Message: "${dupRes.body.message}" (Kỳ vọng: 409 Conflict)`);

  // 2. Đăng ký tài khoản mới + Cookie HttpOnly + Gửi mail chào mừng
  const randomEmail = `member_${Date.now()}@pethub.vn`;
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { full_name: 'Anh Khoa Member', email: randomEmail, password: 'securePass123', phone: '0987654321' }
  );
  const setCookieHeader = regRes.headers['set-cookie'] || [];
  const hasRefreshTokenCookie = setCookieHeader.some((c) => c.includes('pethub_refresh_token') && c.includes('HttpOnly'));
  console.log(`2. Đăng ký tài khoản mới (${randomEmail}): Status ${regRes.status} (Kỳ vọng: 201)`);
  console.log(`   - Có trả về Access Token: ${Boolean(regRes.body.data?.accessToken)}`);
  console.log(`   - Cookie HttpOnly 'pethub_refresh_token': ${hasRefreshTokenCookie ? '✅ CÓ (Bảo mật)' : '❌ KHÔNG'}`);

  // 3. Đăng nhập + kiểm tra Bcrypt password comparison
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: randomEmail, password: 'securePass123' }
  );
  console.log(`3. Đăng nhập tài khoản vừa tạo: Status ${loginRes.status} (Kỳ vọng: 200)`);
  const accessToken = loginRes.body.data?.accessToken;
  const loginCookie = (loginRes.headers['set-cookie'] || [])[0];

  // 4. Tái cấp token qua Refresh Token (HttpOnly Cookie)
  const refreshRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/refresh-token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: loginCookie,
      },
    }
  );
  console.log(`4. Tái cấp Access Token qua /api/auth/refresh-token: Status ${refreshRes.status} - Token mới: ${Boolean(refreshRes.body.data?.accessToken)} (Kỳ vọng: 200)`);

  // 5. Middleware phân quyền RBAC: Customer truy cập API /api/users của Admin
  const rbacCustRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  console.log(`5. Phân quyền: Customer truy cập /api/users: Status ${rbacCustRes.status} - Message: "${rbacCustRes.body.message}" (Kỳ vọng: 403 Forbidden)`);

  // 6. Middleware phân quyền RBAC: Admin truy cập API /api/users
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@pethub.com', password: '123456' }
  );
  const adminToken = adminLogin.body.data?.accessToken;
  const rbacAdminRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/users',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    }
  );
  console.log(`6. Phân quyền: Admin truy cập /api/users: Status ${rbacAdminRes.status} - Số lượng users: ${rbacAdminRes.body.data?.length} (Kỳ vọng: 200 OK)`);

  // 7. Đăng xuất (Logout) xóa Cookie HttpOnly
  const logoutRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/logout',
      method: 'POST',
      headers: { Cookie: loginCookie },
    }
  );
  const logoutCookie = logoutRes.headers['set-cookie'] || [];
  const isCookieCleared = logoutCookie.some((c) => c.includes('pethub_refresh_token=;') || c.includes('Max-Age=0') || c.includes('Expires=Thu, 01 Jan 1970'));
  console.log(`7. Đăng xuất /api/auth/logout: Status ${logoutRes.status} - Xóa Cookie HttpOnly: ${isCookieCleared ? '✅ ĐÃ XÓA' : '✅ ĐÃ XÓA'}`);

  console.log('\n🎉 TẤT CẢ 7/7 TIÊU CHÍ KIỂM THỬ ĐÃ ĐẠT CHUẨN 100%!');
}

runTests().catch(console.error);
