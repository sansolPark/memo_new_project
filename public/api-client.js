// 서버 API 클라이언트 (Supabase 직접 호출 대체)
const API = {
    // 요청 중복 방지를 위한 AbortController 관리
    controllers: new Map(),
    
    // 이전 요청 취소 및 새 컨트롤러 생성
    createController(key) {
        if (this.controllers.has(key)) {
            this.controllers.get(key).abort();
        }
        const controller = new AbortController();
        this.controllers.set(key, controller);
        return controller;
    },
    // 메모 목록 조회
    async getMemos() {
        const controller = this.createController('getMemos');
        
        try {
            const response = await fetch('/api/memos', {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'max-age=60' // 1분 캐시
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.controllers.delete('getMemos');
            return { data: result.data, error: null };
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('요청이 취소되었습니다.');
                return { data: null, error: new Error('Request cancelled') };
            }
            console.error('API Error:', error);
            this.controllers.delete('getMemos');
            return { data: null, error };
        }
    },
    
    // 메모 추가
    async addMemo(content) {
        const controller = this.createController('addMemo');
        
        try {
            const response = await fetch('/api/memos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
                signal: controller.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.controllers.delete('addMemo');
            return { data: result.data, error: null };
        } catch (error) {
            if (error.name === 'AbortError') {
                return { data: null, error: new Error('Request cancelled') };
            }
            console.error('API Error:', error);
            this.controllers.delete('addMemo');
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
