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

// Supabase 클라이언트 초기화 (서버용)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://bztetglagnmfgkznheeg.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Service Role Key (서버 전용)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dGV0Z2xhZ25tZmdrem5oZWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTU5NzcsImV4cCI6MjA1MjMzMTk3N30.Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq';

// 서버용 Supabase 클라이언트 (Service Role Key 사용 시 RLS 우회 가능)
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// API 라우트: 콘텐츠 검증
app.post('/api/validate', rateLimit, (req, res) => {
  const { content } = req.body;
  const validation = validateContent(content);
  
  if (!validation.valid) {
    return res.status(400).json({ valid: false, error: validation.error });
  }
  
  res.json({ valid: true });
});

// API 라우트: 메모 목록 조회
app.get('/api/memos', rateLimit, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('메모 조회 오류:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch memos' });
  }
});

// API 라우트: 메모 추가
app.post('/api/memos', rateLimit, async (req, res) => {
  try {
    const { content } = req.body;
    
    // 서버 측 검증
    const validation = validateContent(content);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    // 메모 개수 확인
    const { count } = await supabase
      .from('memos')
      .select('*', { count: 'exact', head: true });
    
    if (count >= 7) {
      return res.status(400).json({ success: false, error: 'MEMO_LIMIT_REACHED' });
    }
    
    // 메모 삽입
    const { data, error } = await supabase
      .from('memos')
      .insert([{
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('메모 추가 오류:', error);
    res.status(500).json({ success: false, error: 'Failed to add memo' });
  }
});

// API 라우트: 메모 수정
app.put('/api/memos/:id', rateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // 서버 측 검증
    const validation = validateContent(content);
    if (!validation.valid) {
      return res.status(400).json({ success: false, error: validation.error });
    }
    
    // 메모 수정
    const { data, error } = await supabase
      .from('memos')
      .update({
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('메모 수정 오류:', error);
    res.status(500).json({ success: false, error: 'Failed to update memo' });
  }
});

// API 라우트: 메모 삭제
app.delete('/api/memos/:id', rateLimit, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('memos')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('메모 삭제 오류:', error);
    res.status(500).json({ success: false, error: 'Failed to delete memo' });
  }
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
