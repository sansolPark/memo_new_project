// Vercel Serverless Function - 검증 API
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
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ valid: false, error: 'Method not allowed' });
  }

  const { content } = req.body;
  const validation = validateContent(content);
  
  if (!validation.valid) {
    return res.status(400).json({ valid: false, error: validation.error });
  }
  
  res.status(200).json({ valid: true });
}
