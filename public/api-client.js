// 서버 API 클라이언트 (Supabase 직접 호출 대체)
const API = {
    // 메모 목록 조회
    async getMemos() {
        try {
            const response = await fetch('/api/memos');
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
        }
    },
    
    // 메모 추가
    async addMemo(content) {
        try {
            const response = await fetch('/api/memos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
        }
    },
    
    // 메모 수정
    async updateMemo(id, content) {
        try {
            const response = await fetch('/api/memos', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id, content })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            return { data: result.data, error: null };
        } catch (error) {
            console.error('API Error:', error);
            return { data: null, error };
        }
    },
    
    // 메모 삭제
    async deleteMemo(id) {
        try {
            const response = await fetch('/api/memos', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            return { error: null };
        } catch (error) {
            console.error('API Error:', error);
            return { error };
        }
    }
};
