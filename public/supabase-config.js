// Supabase 설정
const SUPABASE_URL = 'https://bztetglagnmfgkznheeg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6dGV0Z2xhZ25tZmdrem5oZWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzc5NDIsImV4cCI6MjA3MTg1Mzk0Mn0.T90yoszkABum01kYpfJCwUI2V45otUX82glNYb5N9xU';

// Supabase 클라이언트 생성
try {
    if (window.supabase) {
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabase;
        console.log('Supabase 클라이언트가 성공적으로 초기화되었습니다.');
    } else {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
    }
} catch (error) {
    console.error('Supabase 클라이언트 초기화 오류:', error);
}
