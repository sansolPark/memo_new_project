class MemoApp {
    constructor() {
        this.memos = [];
        this.currentEditId = null;
        this.supabase = null;
        
        // 금칙어 리스트 (개발자가 직접 수정/추가 가능)
        this.bannedWords = [
            "바보", "멍청이", "병신", "미친", "개새끼", "씨발", "좆", "존나", 
            "개놈", "년", "놈", "죽어", "꺼져", "닥쳐", "시발", "개자식",
            "새끼", "븅신", "또라이", "정신병", "장애", "개빡", "개쓰레기",
            "쓰레기", "쪽팔려", "한심", "개못생김", "추남", "추녀", "돼지",
            "뚱보", "개뚱", "개못남", "개못해", "개구림", "개더러워"
        ];
        
        this.init();
    }

    async init() {
        // Supabase 클라이언트 초기화 확인
        if (window.supabaseClient) {
            this.supabase = window.supabaseClient;
        } else {
            console.error('Supabase 클라이언트가 초기화되지 않았습니다.');
            this.showNotification('Supabase 연결에 실패했습니다. 페이지를 새로고침해주세요.', 'error');
            return;
        }
        
        await this.loadMemos();
        this.bindEvents();
        this.updateUI();
        
        // 기본 광고 설정
        this.setupDefaultAd();
    }

    bindEvents() {
        // 메모 추가 버튼
        document.getElementById('addMemoBtn').addEventListener('click', () => {
            this.addMemo();
        });

        // Enter 키로 메모 추가
        document.getElementById('memoTitle').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addMemo();
            }
        });

        // 글자 수 카운트
        document.getElementById('memoContent').addEventListener('input', (e) => {
            this.updateCharCount(e.target.value);
        });

        // 광고 닫기 버튼
        const adCloseBtn = document.getElementById('adCloseBtn');
        if (adCloseBtn) {
            adCloseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideAd();
            });
        } else {
            console.error('광고 닫기 버튼을 찾을 수 없습니다.');
        }

        // 초기 글자 수 표시
        this.updateCharCount('');
    }

    async addMemo() {
        const titleInput = document.getElementById('memoTitle');
        const contentInput = document.getElementById('memoContent');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title && !content) {
            this.showNotification('제목이나 내용을 입력해주세요.', 'warning');
            return;
        }

        // 입력 내용 검증
        const validation = this.validateInput(title, content);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        if (this.currentEditId !== null) {
            // 편집 모드
            await this.updateMemo(this.currentEditId, title, content);
            this.currentEditId = null;
            document.getElementById('addMemoBtn').innerHTML = '<i class="fas fa-plus"></i> 메모 추가';
        } else {
            // 새 메모 추가
            const memo = {
                title: title || '제목 없음',
                content: content || '내용 없음',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            try {
                console.log('메모 추가 시도:', memo);
                console.log('Supabase 클라이언트:', this.supabase);
                
                const { data, error } = await this.supabase
                    .from('memos')
                    .insert([memo])
                    .select();

                if (error) {
                    console.error('Supabase 오류:', error);
                    throw error;
                }

                console.log('메모 추가 성공:', data);

                // 새로 생성된 메모를 배열에 추가
                if (data && data.length > 0) {
                    this.memos.unshift(data[0]);
                    this.showNotification('메모가 추가되었습니다.', 'success');
                }
            } catch (error) {
                console.error('메모 추가 오류:', error);
                this.showNotification(`메모 추가 중 오류가 발생했습니다: ${error.message}`, 'error');
                return;
            }
        }

        // 입력 필드 초기화
        titleInput.value = '';
        contentInput.value = '';
        this.updateCharCount('');
        titleInput.focus();
        
        this.updateUI();
    }

    async updateMemo(id, title, content) {
        // 수정 시에도 입력 내용 검증
        const validation = this.validateInput(title, content);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('memos')
                .update({
                    title: title || '제목 없음',
                    content: content || '내용 없음',
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select();

            if (error) throw error;

            // 로컬 배열 업데이트
            const memoIndex = this.memos.findIndex(memo => memo.id === id);
            if (memoIndex !== -1 && data && data.length > 0) {
                this.memos[memoIndex] = data[0];
            }

            this.showNotification('메모가 수정되었습니다.', 'success');
        } catch (error) {
            console.error('메모 수정 오류:', error);
            this.showNotification('메모 수정 중 오류가 발생했습니다.', 'error');
        }
    }

    async deleteMemo(id) {
        if (confirm('정말로 이 메모를 삭제하시겠습니까?')) {
            try {
                const { error } = await this.supabase
                    .from('memos')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                // 로컬 배열에서 제거
                this.memos = this.memos.filter(memo => memo.id !== id);
                this.updateUI();
                this.showNotification('메모가 삭제되었습니다.', 'info');
            } catch (error) {
                console.error('메모 삭제 오류:', error);
                this.showNotification('메모 삭제 중 오류가 발생했습니다.', 'error');
            }
        }
    }

    editMemo(id) {
        const memo = this.memos.find(memo => memo.id === id);
        if (memo) {
            document.getElementById('memoTitle').value = memo.title;
            document.getElementById('memoContent').value = memo.content;
            document.getElementById('addMemoBtn').innerHTML = '<i class="fas fa-save"></i> 메모 수정';
            this.currentEditId = id;
            this.updateCharCount(memo.content);
            
            // 입력 필드로 스크롤
            document.getElementById('memoTitle').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // 금칙어 검사 메서드
    containsBannedWords(text) {
        const lowerText = text.toLowerCase();
        return this.bannedWords.some(word => 
            lowerText.includes(word.toLowerCase())
        );
    }

    // 숫자 포함 검사 메서드
    containsNumbers(text) {
        return /\d/.test(text);
    }

    // 입력 내용 검증 메서드
    validateInput(title, content) {
        const fullText = `${title} ${content}`.trim();
        
        // 금칙어 검사
        if (this.containsBannedWords(fullText)) {
            return {
                isValid: false,
                message: '부적절한 언어가 포함되어 있습니다. 다른 표현을 사용해주세요.'
            };
        }
        
        // 숫자 포함 검사
        if (this.containsNumbers(fullText)) {
            return {
                isValid: false,
                message: '개인정보 보호를 위해 숫자가 포함된 내용은 저장할 수 없습니다.'
            };
        }
        
        return { isValid: true };
    }

    updateCharCount(content) {
        const charCount = document.getElementById('charCount');
        const count = content.length;
        charCount.textContent = `${count}/500`;
        
        // 글자 수에 따른 색상 변경
        if (count > 450) {
            charCount.style.color = '#e74c3c';
        } else if (count > 400) {
            charCount.style.color = '#f39c12';
        } else {
            charCount.style.color = '#666';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            return '오늘';
        } else if (diffDays === 2) {
            return '어제';
        } else if (diffDays <= 7) {
            return `${diffDays - 1}일 전`;
        } else {
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    renderMemo(memo) {
        const isEdited = memo.updated_at !== memo.created_at;
        const dateText = isEdited ? 
            `수정됨: ${this.formatDate(memo.updated_at)}` : 
            this.formatDate(memo.created_at);

        return `
            <div class="memo-item" data-id="${memo.id}">
                <div class="memo-header">
                    <h3 class="memo-title">${this.escapeHtml(memo.title)}</h3>
                    <span class="memo-date">${dateText}</span>
                </div>
                <div class="memo-content">${this.escapeHtml(memo.content)}</div>
                <div class="memo-actions">
                    <button class="action-btn edit-btn" onclick="memoApp.editMemo(${memo.id})">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button class="action-btn delete-btn" onclick="memoApp.deleteMemo(${memo.id})">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateUI() {
        const memoList = document.getElementById('memoList');
        const emptyState = document.getElementById('emptyState');
        const memoCount = document.getElementById('memoCount');

        if (this.memos.length === 0) {
            memoList.style.display = 'none';
            emptyState.style.display = 'block';
            memoCount.textContent = '0개의 메모';
        } else {
            memoList.style.display = 'grid';
            emptyState.style.display = 'none';
            memoCount.textContent = `${this.memos.length}개의 메모`;
            
            memoList.innerHTML = this.memos.map(memo => this.renderMemo(memo)).join('');
        }
    }

    async loadMemos() {
        try {
            const { data, error } = await this.supabase
                .from('memos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.memos = data || [];
        } catch (error) {
            console.error('메모 로드 중 오류 발생:', error);
            this.showNotification('메모를 불러오는 중 오류가 발생했습니다.', 'error');
            this.memos = [];
        }
    }

    showNotification(message, type = 'info') {
        // 기존 알림 제거
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        // 알림 스타일 추가
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;

        // 애니메이션 CSS 추가
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#27ae60',
            warning: '#f39c12',
            error: '#e74c3c',
            info: '#3498db'
        };
        return colors[type] || '#3498db';
    }

    // 광고 관련 메서드들
    updateAd(title, description, link) {
        const adTitle = document.querySelector('.ad-title');
        const adDescription = document.querySelector('.ad-description');
        const adLink = document.getElementById('adLink');

        if (adTitle) adTitle.textContent = title;
        if (adDescription) adDescription.textContent = description;
        if (adLink) adLink.href = link;

        // 광고 섹션 표시
        this.showAd();
    }

    showAd() {
        const adSection = document.getElementById('adSection');
        if (adSection) {
            adSection.style.display = 'block';
            adSection.style.animation = 'slideInDown 0.6s ease-out';
        }
    }

    hideAd() {
        console.log('hideAd 메서드 호출됨');
        const adSection = document.getElementById('adSection');
        console.log('광고 섹션 요소:', adSection);
        
        if (adSection) {
            // 로컬 스토리지에 광고 숨김 상태 저장
            localStorage.setItem('hiddenAds', 'true');
            console.log('로컬 스토리지에 광고 숨김 상태 저장됨');
            
            // 즉시 숨기기
            adSection.style.display = 'none';
            console.log('광고가 숨겨짐');
            
            // 성공 알림 표시
            this.showNotification('광고를 숨겼습니다.', 'success');
        } else {
            console.error('광고 섹션을 찾을 수 없습니다.');
        }
    }

    // 광고 설정 예시 (실제 사용 시 이 부분을 수정하면 됩니다)
    setupDefaultAd() {
        // 로컬 스토리지에서 광고 숨김 상태 확인
        const hiddenAds = localStorage.getItem('hiddenAds');
        if (hiddenAds === 'true') {
            // 광고가 숨겨진 상태라면 표시하지 않음
            return;
        }
        
        // 광고 설정 파일의 설정을 사용
        if (window.AD_CONFIG && window.AD_CONFIG.enabled) {
            this.updateAd(
                window.AD_CONFIG.title,
                window.AD_CONFIG.description,
                window.AD_CONFIG.link
            );
        }
    }
}

// 앱 초기화
let memoApp;
document.addEventListener('DOMContentLoaded', () => {
    memoApp = new MemoApp();
});

// 페이지 새로고침 시 편집 모드 초기화
window.addEventListener('beforeunload', () => {
    if (memoApp && memoApp.currentEditId !== null) {
        memoApp.currentEditId = null;
    }
});
