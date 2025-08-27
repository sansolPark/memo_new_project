class MemoApp {
    constructor() {
        this.memos = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.loadMemos();
        this.bindEvents();
        this.updateUI();
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

        // 초기 글자 수 표시
        this.updateCharCount('');
    }

    addMemo() {
        const titleInput = document.getElementById('memoTitle');
        const contentInput = document.getElementById('memoContent');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title && !content) {
            this.showNotification('제목이나 내용을 입력해주세요.', 'warning');
            return;
        }

        if (this.currentEditId !== null) {
            // 편집 모드
            this.updateMemo(this.currentEditId, title, content);
            this.currentEditId = null;
            document.getElementById('addMemoBtn').innerHTML = '<i class="fas fa-plus"></i> 메모 추가';
        } else {
            // 새 메모 추가
            const memo = {
                id: Date.now(),
                title: title || '제목 없음',
                content: content || '내용 없음',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.memos.unshift(memo);
            this.saveMemos();
            this.showNotification('메모가 추가되었습니다.', 'success');
        }

        // 입력 필드 초기화
        titleInput.value = '';
        contentInput.value = '';
        this.updateCharCount('');
        titleInput.focus();
        
        this.updateUI();
    }

    updateMemo(id, title, content) {
        const memoIndex = this.memos.findIndex(memo => memo.id === id);
        if (memoIndex !== -1) {
            this.memos[memoIndex].title = title || '제목 없음';
            this.memos[memoIndex].content = content || '내용 없음';
            this.memos[memoIndex].updatedAt = new Date().toISOString();
            
            this.saveMemos();
            this.showNotification('메모가 수정되었습니다.', 'success');
        }
    }

    deleteMemo(id) {
        if (confirm('정말로 이 메모를 삭제하시겠습니까?')) {
            this.memos = this.memos.filter(memo => memo.id !== id);
            this.saveMemos();
            this.updateUI();
            this.showNotification('메모가 삭제되었습니다.', 'info');
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
        const isEdited = memo.updatedAt !== memo.createdAt;
        const dateText = isEdited ? 
            `수정됨: ${this.formatDate(memo.updatedAt)}` : 
            this.formatDate(memo.createdAt);

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

    saveMemos() {
        localStorage.setItem('memos', JSON.stringify(this.memos));
    }

    loadMemos() {
        const savedMemos = localStorage.getItem('memos');
        if (savedMemos) {
            try {
                this.memos = JSON.parse(savedMemos);
            } catch (e) {
                console.error('메모 로드 중 오류 발생:', e);
                this.memos = [];
            }
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
