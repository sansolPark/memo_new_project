// Supabase 설정
const SUPABASE_URL = 'https://bztetglagnmfgkznheeg.supabase.co'; // 여기에 실제 Supabase URL을 입력하세요
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dGV0Z2xhZ25tZmdrem5oZWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzc5NDIsImV4cCI6MjA3MTg1Mzk0Mn0.T90yoszkABum01kYpfJCwUI2V45otUX82glNYb5N9xU
'; // 여기에 실제 Supabase Anon Key를 입력하세요

// Supabase 클라이언트 생성
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 전역 변수로 내보내기
window.supabaseClient = supabase;
