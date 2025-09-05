const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 보안 헤더 미들웨어 (모든 요청에 적용)
app.use((req, res, next) => {
  const csp = "default-src 'self'; " +
              "script-src 'self' https://cdn.jsdelivr.net; " +
              "style-src 'self' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " +
              "img-src 'self' data:; " +
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; " +
              "connect-src 'self' https://bztetglagnmfgkznheeg.supabase.co https://api.vercel.com https://vitals.vercel-insights.com; " +
              "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; worker-src 'self'; " +
              "navigate-to 'self' https://otu.ai https://otu.ai/home;";
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

// 정적 파일 제공
app.use(express.static('public'));

// 메인 페이지 라우트
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`메모 앱이 http://localhost:${PORT} 에서 실행 중입니다.`);
});
