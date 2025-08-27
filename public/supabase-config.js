// Supabase 설정
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // 여기에 실제 Supabase URL을 입력하세요
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // 여기에 실제 Supabase Anon Key를 입력하세요

// Supabase 클라이언트 생성
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역 변수로 내보내기
window.supabaseClient = supabase;
