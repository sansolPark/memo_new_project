// Vercel Serverless Function
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://bztetglagnmfgkznheeg.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dGV0Z2xhZ25tZmdrem5oZWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3NTU5NzcsImV4cCI6MjA1MjMzMTk3N30.Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq-Ks-Aq';

// Supabase 클라이언트 재사용을 위한 싱글톤 패턴
let supabaseClient = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'public',
      },
      auth: {
        persistSession: false, // 서버사이드에서는 세션 유지 불필요
      },
      global: {
        headers: {
          'Cache-Control': 'max-age=60', // 1분 캐시
        },
      },
    });
  }
  return supabaseClient;
}

// Rate limiting (간단한 구현)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS = 30;

function checkRateLimit(ip) {
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip).filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (requests.length >= MAX_REQUESTS) {
    return false;
  }
  
  requests.push(now);
  rateLimitMap.set(ip, requests);
  return true;
}

// 금칙어 리스트
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
  
  const normalizedContent = content
    .toLowerCase()
    .replace(/[\s\-_.,!?]/g, '')
    .replace(/[ㄱ-ㅎㅏ-ㅣ]/g, '');
  
  for (const word of bannedWords) {
    const normalizedWord = word.toLowerCase().replace(/[\s\-_.,!?]/g, '');
    if (normalizedContent.includes(normalizedWord)) {
      return { valid: false, error: 'BANNED_WORDS' };
    }
  }
  
  if (/\d/.test(content)) {
    return { valid: false, error: 'NUMBERS_NOT_ALLOWED' };
  }
  
  return { valid: true };
}

export default async function handler(req, res) {
  // CORS 및 캐싱 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 성능 최적화 헤더
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // GET 요청에 대한 캐싱 헤더
  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30');
    res.setHeader('ETag', `"${Date.now()}"`);
  }

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ success: false, error: 'Too many requests' });
  }

  try {
    // GET: 메모 목록 조회
    if (req.method === 'GET') {
      const supabase = getSupabaseClient();
      
      // 필요한 필드만 선택하여 데이터 전송량 최소화
      const { data, error } = await supabase
        .from('memos')
        .select('id, content, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(7); // 최대 7개만 조회

      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        data: data || [],
        timestamp: Date.now() // 캐시 무효화를 위한 타임스탬프
      });
    }

    // POST: 메모 추가
    if (req.method === 'POST') {
      const { content } = req.body;
      const supabase = getSupabaseClient();
      
      const validation = validateContent(content);
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }
      
      // 더 효율적인 카운트 쿼리
      const { count, error: countError } = await supabase
        .from('memos')
        .select('id', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      if (count >= 7) {
        return res.status(400).json({ success: false, error: 'MEMO_LIMIT_REACHED' });
      }
      
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('memos')
        .insert([{
          content: content,
          created_at: now,
          updated_at: now
        }])
        .select('id, content, created_at, updated_at'); // 필요한 필드만 반환

      if (error) throw error;

      return res.status(201).json({ success: true, data: data[0] });
    }

    // PUT: 메모 수정
    if (req.method === 'PUT') {
      const { id, content } = req.body;
      
      const validation = validateContent(content);
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }
      
      const { data, error } = await supabase
        .from('memos')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) throw error;

      return res.status(200).json({ success: true, data: data[0] });
    }

    // DELETE: 메모 삭제
    if (req.method === 'DELETE') {
      const { id } = req.body;
      
      const { error } = await supabase
        .from('memos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
