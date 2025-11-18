class MemoApp {
    constructor() {
        this.memos = [];
        this.currentEditId = null;
        this.supabase = null;
        this.init();
    }

    async init() {
        // 서버 API 사용 (Supabase 직접 호출 제거)
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
            this.showNotification(window.i18n.t('notifyContentRequired'), 'warning');
            return;
        }

        // 서버 측 검증
        const validation = await validateWithServer(content);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        if (this.currentEditId !== null) {
            // 편집 모드
            await this.updateMemo(this.currentEditId, content);
            this.currentEditId = null;
            document.getElementById('addMemoBtn').innerHTML = `<i class="fas fa-plus"></i> ${window.i18n.t('addMemo')}`;
        } else {
            // 새 메모 추가 - 개수 제한 확인
            if (this.memos.length >= 7) {
                this.showNotification(window.i18n.t('notifyMemoLimit'), 'warning');
                return;
            }

            const memo = {
                content: content,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            try {
                // 서버 API 호출
                const { data, error } = await API.addMemo(content);

                if (error) {
                    throw error;
                }

                // 새로 생성된 메모를 배열에 추가
                if (data) {
                    this.memos.unshift(data);
                    this.showNotification(window.i18n.t('notifyMemoAdded'), 'success');
                }
            } catch (error) {
                console.error('메모 추가 오류:', error);
                this.showNotification(window.i18n.t('notifyAddError', { error: error.message }), 'error');
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
        // 서버 측 검증
        const validation = await validateWithServer(content);
        if (!validation.isValid) {
            this.showNotification(validation.message, 'error');
            return;
        }

        try {
            // 서버 API 호출
            const { data, error } = await API.updateMemo(id, content);

            if (error) throw error;

            // 로컬 배열 업데이트
            const memoIndex = this.memos.findIndex(memo => memo.id === id);
            if (memoIndex !== -1 && data) {
                this.memos[memoIndex] = data;
            }

            this.showNotification(window.i18n.t('notifyMemoUpdated'), 'success');
        } catch (error) {
            console.error('메모 수정 오류:', error);
            this.showNotification(window.i18n.t('notifyUpdateError'), 'error');
        }
    }

    async deleteMemo(id) {
        // 삭제권 확인
        if (!window.deleteCreditsManager.hasCredits()) {
            // 광고 모달 표시
            const watched = await window.adModal.show();
            if (!watched) {
                return; // 광고를 보지 않으면 삭제 취소
            }
        }

        // 삭제 확인
        if (confirm(window.i18n.t('confirmDelete'))) {
            // 삭제권 사용
            if (!window.deleteCreditsManager.useCredit()) {
                this.showNotification(window.i18n.t('notifyNoCredits'), 'warning');
                return;
            }

            try {
                // 서버 API 호출
                const { error } = await API.deleteMemo(id);

                if (error) throw error;

                // 로컬 배열에서 제거
                this.memos = this.memos.filter(memo => memo.id !== id);
                this.updateUI();
                this.showNotification(window.i18n.t('notifyMemoDeleted'), 'info');
            } catch (error) {
                console.error('메모 삭제 오류:', error);
                this.showNotification(window.i18n.t('notifyDeleteError'), 'error');
                
                // 삭제 실패 시 삭제권 복구
                const currentCredits = window.deleteCreditsManager.getCredits();
                window.deleteCreditsManager.setCredits(currentCredits + 1);
            }
        }
    }

    editMemo(id) {
        const memo = this.memos.find(memo => memo.id === id);
        if (memo) {
            document.getElementById('memoContent').value = memo.content;
            document.getElementById('addMemoBtn').innerHTML = `<i class="fas fa-save"></i> ${window.i18n.t('updateMemo')}`;
            this.currentEditId = id;
            this.updateCharCount(memo.content);
            
            // 입력 필드로 스크롤
            document.getElementById('memoContent').scrollIntoView({ behavior: 'smooth' });
        }
    }

    async copyMemoContent(id) {
        const memo = this.memos.find(memo => memo.id === id);
        if (!memo) {
            this.showNotification(window.i18n.t('notifyMemoNotFound'), 'error');
            return;
        }

        try {
            // 클립보드 API를 사용하여 텍스트 복사
            await navigator.clipboard.writeText(memo.content);
            this.showNotification(window.i18n.t('notifyMemoCopied'), 'success');
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
                this.showNotification(window.i18n.t('notifyMemoCopied'), 'success');
            } catch (fallbackError) {
                console.error('복사 실패:', fallbackError);
                this.showNotification(window.i18n.t('notifyCopyFailed'), 'error');
            }
        }
    }

    // 실시간 입력 검증 (클라이언트 측 빠른 피드백)
    validateAndCleanInput(inputElement, fieldType) {
        const text = inputElement.value;
        
        // 길이 체크만 클라이언트에서
        if (text.length > 500) {
            this.showInputError(fieldType, 'Content is too long (max 500 characters)');
        } else {
            this.clearInputError(fieldType);
        }
    }

    // 입력 필드 에러 표시
    showInputError(fieldType, message) {
        const field = document.getElementById(fieldType);
        const errorElement = document.getElementById(`${fieldType}Error`);
        
        if (errorElement) {
            errorElement.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.id = `${fieldType}Error`;
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        
        field.classList.add('input-has-error');
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    // 입력 필드 에러 제거
    clearInputError(fieldType) {
        const field = document.getElementById(fieldType);
        const errorElement = document.getElementById(`${fieldType}Error`);
        
        if (errorElement) {
            errorElement.remove();
        }
        
        field.classList.remove('input-has-error');
    }

    updateCharCount(content) {
        const charCount = document.getElementById('charCount');
        const count = content.length;
        charCount.textContent = window.i18n.t('charCount', { count });
        
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
                    <button class="action-btn copy-btn" title="${window.i18n.t('tooltipCopy')}">
                        <i class="fas fa-copy"></i> ${window.i18n.t('copy')}
                    </button>
                </div>
                <div class="memo-content">${this.escapeHtml(memo.content)}</div>
                <div class="memo-actions">
                    <button class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> ${window.i18n.t('delete')}
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
            memoCount.textContent = window.i18n.t('memoCount', { count: 0 });
        } else {
            memoList.classList.remove('is-hidden');
            emptyState.classList.remove('is-visible');
            emptyState.classList.add('is-hidden');
            memoCount.textContent = window.i18n.t('memoCount', { count: this.memos.length });
            
            memoList.innerHTML = this.memos.map(memo => this.renderMemo(memo)).join('');
        }

        // 메모 개수에 따른 추가 버튼 상태 관리
        if (this.memos.length >= 7 && this.currentEditId === null) {
            // 편집 모드가 아닐 때만 버튼 비활성화
            addMemoBtn.disabled = true;
            addMemoBtn.title = window.i18n.t('tooltipMemoLimit');
            addMemoBtn.classList.add('memo-limit-reached');
            
            // 메모 카운터에 경고 스타일 적용
            memoCount.classList.add('memo-count-limit');
        } else if (this.memos.length === 6 && this.currentEditId === null) {
            // 6개일 때 경고 스타일 적용
            addMemoBtn.disabled = false;
            addMemoBtn.title = window.i18n.t('tooltipLastMemo');
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

        // 삭제권 UI 업데이트
        if (window.deleteCreditsManager) {
            window.deleteCreditsManager.updateUI();
        }
    }

    async loadMemos() {
        try {
            // 서버 API 호출
            const { data, error } = await API.getMemos();

            if (error) throw error;

            this.memos = data || [];
        } catch (error) {
            console.error('메모 로드 중 오류 발생:', error);
            this.showNotification(window.i18n.t('notifyLoadError'), 'error');
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
            this.showNotification(window.i18n.t('notifyAdHidden'), 'success');
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
        
        // 광고 설정 파일의 설정을 사용 (다국어 지원)
        if (window.AD_CONFIG && window.AD_CONFIG.enabled) {
            this.updateAd(
                window.AD_CONFIG.getTitle(),
                window.AD_CONFIG.getDescription(),
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
