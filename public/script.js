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

        // Enter 키로 메모 저장, Shift+Enter로 줄바꿈
        document.getElementById('memoContent').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.addMemo();
            }
            // Shift+Enter는 기본 동작(줄바꿈)을 허용
        });

        // 글자 수 카운트 및 실시간 입력 검증
        document.getElementById('memoContent').addEventListener('input', (e) => {
            this.updateCharCount(e.target.value);
            this.validateAndCleanInput(e.target, 'memoContent');
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

        // 메모 리스트 클릭 이벤트 위임 (inline onclick 제거)
        const memoListEl = document.getElementById('memoList');
        if (memoListEl) {
            memoListEl.addEventListener('click', (event) => {
                const targetButton = event.target.closest('button');
                if (!targetButton) return;

                const memoItem = targetButton.closest('.memo-item');
                if (!memoItem) return;

                const idAttr = memoItem.getAttribute('data-id');
                const memoId = Number(idAttr);
                if (Number.isNaN(memoId)) return;

                if (targetButton.classList.contains('delete-btn')) {
                    this.deleteMemo(memoId);
                } else if (targetButton.classList.contains('copy-btn')) {
                    this.copyMemoContent(memoId);
                }
            });
        }
    }

    async addMemo() {
        const contentInput = document.getElementById('memoContent');
        
        const content = contentInput.value.trim();

        if (!content) {
            this.showNotification('내용을 입력해주세요.', 'warning');
            return;
        }

        // 입력 내용 검증
        const validation = this.validateInput('', content);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        if (this.currentEditId !== null) {
            // 편집 모드
            await this.updateMemo(this.currentEditId, content);
            this.currentEditId = null;
            document.getElementById('addMemoBtn').innerHTML = '<i class="fas fa-plus"></i> 메모 추가';
        } else {
            // 새 메모 추가 - 개수 제한 확인
            if (this.memos.length >= 7) {
                this.showNotification('메모는 최대 7개까지만 작성할 수 있습니다. 새로운 메모를 작성하려면 기존 메모를 삭제해주세요.', 'warning');
                return;
            }

            const memo = {
                content: content,
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
        contentInput.value = '';
        this.updateCharCount('');
        contentInput.focus();
        
        this.updateUI();
    }

    async updateMemo(id, content) {
        // 수정 시에도 입력 내용 검증
        const validation = this.validateInput('', content);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        try {
            const { data, error } = await this.supabase
                .from('memos')
                .update({
                    content: content,
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
            document.getElementById('memoContent').value = memo.content;
            document.getElementById('addMemoBtn').innerHTML = '<i class="fas fa-save"></i> 메모 수정';
            this.currentEditId = id;
            this.updateCharCount(memo.content);
            
            // 입력 필드로 스크롤
            document.getElementById('memoContent').scrollIntoView({ behavior: 'smooth' });
        }
    }

    async copyMemoContent(id) {
        const memo = this.memos.find(memo => memo.id === id);
        if (!memo) {
            this.showNotification('메모를 찾을 수 없습니다.', 'error');
            return;
        }

        try {
            // 클립보드 API를 사용하여 텍스트 복사
            await navigator.clipboard.writeText(memo.content);
            this.showNotification('메모 내용이 클립보드에 복사되었습니다.', 'success');
        } catch (error) {
            // 클립보드 API가 지원되지 않는 경우 대체 방법 사용
            try {
                const textArea = document.createElement('textarea');
                textArea.value = memo.content;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('메모 내용이 클립보드에 복사되었습니다.', 'success');
            } catch (fallbackError) {
                console.error('복사 실패:', fallbackError);
                this.showNotification('복사에 실패했습니다. 다시 시도해주세요.', 'error');
            }
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

    // 실시간 입력 검증 및 정리 메서드
    validateAndCleanInput(inputElement, fieldType) {
        let text = inputElement.value;
        const originalText = text;
        let hasChanges = false;
        
        // 금칙어 제거
        this.bannedWords.forEach(word => {
            const regex = new RegExp(word, 'gi');
            if (regex.test(text)) {
                text = text.replace(regex, '***');
                hasChanges = true;
            }
        });
        
        // 숫자 제거
        if (/\d/.test(text)) {
            text = text.replace(/\d/g, '');
            hasChanges = true;
        }
        
        // 변경사항이 있으면 입력 필드 업데이트
        if (hasChanges) {
            const cursorPosition = inputElement.selectionStart;
            inputElement.value = text;
            
            // 커서 위치 조정
            const newCursorPosition = Math.min(cursorPosition, text.length);
            inputElement.setSelectionRange(newCursorPosition, newCursorPosition);
            
            // 경고 메시지 표시
            this.showInputError(fieldType, '부적절한 내용이 자동으로 제거되었습니다.');
            
            // 2초 후 경고 메시지 제거
            setTimeout(() => {
                this.clearInputError(fieldType);
            }, 2000);
        } else {
            // 검증 통과 시 에러 메시지 제거
            this.clearInputError(fieldType);
        }
    }

    // 실시간 입력 검증 메서드 (기존 유지)
    validateInputRealTime(text, fieldType) {
        const fieldName = fieldType === 'memoTitle' ? '제목' : '내용';
        
        // 금칙어 검사
        if (this.containsBannedWords(text)) {
            this.showInputError(fieldType, '부적절한 언어가 포함되어 있습니다. 다른 표현을 사용해주세요.');
            return false;
        }
        
        // 숫자 포함 검사
        if (this.containsNumbers(text)) {
            this.showInputError(fieldType, '개인정보 보호를 위해 숫자가 포함된 내용은 저장할 수 없습니다.');
            return false;
        }
        
        // 검증 통과 시 에러 메시지 제거
        this.clearInputError(fieldType);
        return true;
    }

    // 입력 필드 에러 표시
    showInputError(fieldType, message) {
        const field = document.getElementById(fieldType);
        const errorElement = document.getElementById(`${fieldType}Error`);
        
        // 기존 에러 메시지 제거
        if (errorElement) {
            errorElement.remove();
        }
        
        // 에러 메시지 생성
        const errorDiv = document.createElement('div');
        errorDiv.id = `${fieldType}Error`;
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        
        // 필드에 에러 스타일 적용
        field.classList.add('input-has-error');
        
        // 에러 메시지 삽입
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
        
        // 입력 내용을 빨간색으로 표시 (클래스로 처리)
    }

    // 입력 필드 에러 제거
    clearInputError(fieldType) {
        const field = document.getElementById(fieldType);
        const errorElement = document.getElementById(`${fieldType}Error`);
        
        if (errorElement) {
            errorElement.remove();
        }
        
        // 필드 스타일 복원
        field.classList.remove('input-has-error');
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
        
        // 글자 수에 따른 색상 변경 (클래스로 처리)
        charCount.classList.remove('char-count-warning', 'char-count-danger');
        if (count > 450) {
            charCount.classList.add('char-count-danger');
        } else if (count > 400) {
            charCount.classList.add('char-count-warning');
        }
    }


    renderMemo(memo) {
        return `
            <div class="memo-item" data-id="${memo.id}">
                <div class="memo-header">
                    <button class="action-btn copy-btn" title="메모 내용 복사">
                        <i class="fas fa-copy"></i> 복사
                    </button>
                </div>
                <div class="memo-content">${this.escapeHtml(memo.content)}</div>
                <div class="memo-actions">
                    <button class="action-btn delete-btn">
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
        const addMemoBtn = document.getElementById('addMemoBtn');

        if (this.memos.length === 0) {
            memoList.classList.add('is-hidden');
            emptyState.classList.add('is-visible');
            emptyState.classList.remove('is-hidden');
            memoCount.textContent = '0/7개의 메모';
        } else {
            memoList.classList.remove('is-hidden');
            emptyState.classList.remove('is-visible');
            emptyState.classList.add('is-hidden');
            memoCount.textContent = `${this.memos.length}/7개의 메모`;
            
            memoList.innerHTML = this.memos.map(memo => this.renderMemo(memo)).join('');
        }

        // 메모 개수에 따른 추가 버튼 상태 관리
        if (this.memos.length >= 7 && this.currentEditId === null) {
            // 편집 모드가 아닐 때만 버튼 비활성화
            addMemoBtn.disabled = true;
            addMemoBtn.title = '메모는 최대 7개까지만 작성할 수 있습니다. 기존 메모를 삭제해주세요.';
            addMemoBtn.classList.add('memo-limit-reached');
            
            // 메모 카운터에 경고 스타일 적용
            memoCount.classList.add('memo-count-limit');
        } else if (this.memos.length === 6 && this.currentEditId === null) {
            // 6개일 때 경고 스타일 적용
            addMemoBtn.disabled = false;
            addMemoBtn.title = '마지막 메모입니다. 새로운 메모를 추가하려면 기존 메모를 삭제해야 합니다.';
            addMemoBtn.classList.remove('memo-limit-reached');
            
            // 메모 카운터에 경고 스타일 적용
            memoCount.classList.add('memo-count-limit', 'warning');
        } else {
            addMemoBtn.disabled = false;
            addMemoBtn.title = '';
            addMemoBtn.classList.remove('memo-limit-reached');
            
            // 메모 카운터에서 경고 스타일 제거
            memoCount.classList.remove('memo-count-limit', 'warning');
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
        notification.className = `notification notification-${type} animate-slide-in-right`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        // 스타일과 애니메이션은 CSS 클래스로 처리

        document.body.appendChild(notification);

        // 3초 후 자동 제거
        setTimeout(() => {
            notification.classList.remove('animate-slide-in-right');
            notification.classList.add('animate-slide-out-right');
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
            adSection.classList.add('is-visible', 'animate-slide-in-down');
            adSection.classList.remove('is-hidden');
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
            adSection.classList.remove('is-visible');
            adSection.classList.add('is-hidden');
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
