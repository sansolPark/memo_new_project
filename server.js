const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// JSON 파싱 미들웨어
app.use(express.json());

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

// Rate limiting (간단한 구현)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1분
const MAX_REQUESTS = 30; // 1분당 최대 30개 요청

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (requests.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  requests.push(now);
  rateLimitMap.set(ip, requests);
  next();
}

// 서버 측 검증 로직
const bannedWords = [
  "바보", "멍청이", "병신", "미친", "개새끼", "씨발", "좆", "존나", 
  "개놈", "년", "놈", "죽어", "꺼져", "닥쳐", "시발", "개자식",
  "새끼", "븅신", "또라이", "정신병", "장애", "개빡", "개쓰레기",
  "쓰레기", "쪽팔려", "한심", "개못생김", "추남", "추녀", "돼지",
  "뚱보", "개뚱", "개못남", "개못해", "개구림", "개더러워"
];

function validateContent(content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'INVALID_CONTENT' };
  }
  
  if (content.length > 500) {
    return { valid: false, error: 'CONTENT_TOO_LONG' };
  }
  
  // 금칙어 검사 (고급 - 공백, 특수문자 제거 후 검사)
  const normalizedContent = content
    .toLowerCase()
    .replace(/[\s\-_.,!?]/g, '') // 공백, 특수문자 제거
    .replace(/[ㄱ-ㅎㅏ-ㅣ]/g, ''); // 자음/모음 제거
  
  for (const word of bannedWords) {
    const normalizedWord = word.toLowerCase().replace(/[\s\-_.,!?]/g, '');
    if (normalizedContent.includes(normalizedWord)) {
      return { valid: false, error: 'BANNED_WORDS' };
    }
  }
  
  // 숫자 검사
  if (/\d/.test(content)) {
    return { valid: false, error: 'NUMBERS_NOT_ALLOWED' };
  }
  
  return { valid: true };
}

// API 라우트: 콘텐츠 검증
app.post('/api/validate', rateLimit, (req, res) => {
  const { content } = req.body;
  const validation = validateContent(content);
  
  if (!validation.valid) {
    return res.status(400).json({ valid: false, error: validation.error });
  }
  
  res.json({ valid: true });
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
