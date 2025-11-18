// 다국어 지원 시스템
const translations = {
    ko: {
        // 헤더
        title: "모두의 메모",
        subtitle: "누구나 쓸 수 있고, 볼 수 있고, 지울 수 있는 메모장",
        
        // 메모 입력
        memoPlaceholder: "메모 내용을 입력하세요...",
        addMemo: "메모 추가",
        updateMemo: "메모 수정",
        charCount: "{count}/500",
        
        // 메모 액션
        copy: "복사",
        delete: "삭제",
        
        // 메모 카운트
        memoCount: "{count}/7개의 메모",
        
        // 빈 상태
        emptyTitle: "첫 번째 메모를 작성해보세요!",
        emptyDescription: "위의 입력창에 메모를 작성하고 추가 버튼을 클릭하세요.",
        
        // 알림 메시지
        notifyContentRequired: "내용을 입력해주세요.",
        notifyMemoAdded: "메모가 추가되었습니다.",
        notifyMemoUpdated: "메모가 수정되었습니다.",
        notifyMemoDeleted: "메모가 삭제되었습니다.",
        notifyMemoCopied: "메모 내용이 클립보드에 복사되었습니다.",
        notifyCopyFailed: "복사에 실패했습니다. 다시 시도해주세요.",
        notifyMemoNotFound: "메모를 찾을 수 없습니다.",
        notifyMemoLimit: "메모는 최대 7개까지만 작성할 수 있습니다. 새로운 메모를 작성하려면 기존 메모를 삭제해주세요.",
        notifyBannedWords: "부적절한 언어가 포함되어 있습니다. 다른 표현을 사용해주세요.",
        notifyNumbersNotAllowed: "개인정보 보호를 위해 숫자가 포함된 내용은 저장할 수 없습니다.",
        notifyContentRemoved: "부적절한 내용이 자동으로 제거되었습니다.",
        notifySupabaseError: "Supabase 연결에 실패했습니다. 페이지를 새로고침해주세요.",
        notifyLoadError: "메모를 불러오는 중 오류가 발생했습니다.",
        notifyAddError: "메모 추가 중 오류가 발생했습니다: {error}",
        notifyUpdateError: "메모 수정 중 오류가 발생했습니다.",
        notifyDeleteError: "메모 삭제 중 오류가 발생했습니다.",
        
        // 확인 메시지
        confirmDelete: "정말로 이 메모를 삭제하시겠습니까?",
        
        // 광고
        adBadge: "광고",
        adClose: "광고 닫기",
        adViewMore: "자세히 보기",
        adTitle: "메모가 지워져서 답답하시죠?",
        adDescription: "내가 쓴 메모가 지워지지 않는 메모앱, OTU.AI를 사용해보세요!",
        notifyAdHidden: "광고를 숨겼습니다.",
        
        // PWA 설치
        pwaInstall: "앱 설치",
        
        // 후원
        supportText: "이 서비스가 유용하셨나요? 커피 한 잔으로 응원해주세요!",
        supportButton: "커피 한 잔 후원하기",
        
        // 툴팁
        tooltipCopy: "메모 내용 복사",
        tooltipMemoLimit: "메모는 최대 7개까지만 작성할 수 있습니다. 기존 메모를 삭제해주세요.",
        tooltipLastMemo: "마지막 메모입니다. 새로운 메모를 추가하려면 기존 메모를 삭제해야 합니다.",
        
        // 삭제권 시스템
        deleteCredits: "삭제권: {count}회",
        notifyCreditsRewarded: "삭제권 7회가 지급되었습니다!",
        notifyNoCredits: "삭제권이 부족합니다. 광고를 시청해주세요.",
        adConfirmText: "광고 시청 후 삭제 가능해요"
    },
    en: {
        // Header
        title: "Memo for Everyone",
        subtitle: "A memo pad that anyone can write, view, and delete",
        
        // Memo input
        memoPlaceholder: "Enter your memo...",
        addMemo: "Add Memo",
        updateMemo: "Update Memo",
        charCount: "{count}/500",
        
        // Memo actions
        copy: "Copy",
        delete: "Delete",
        
        // Memo count
        memoCount: "{count}/7 memos",
        
        // Empty state
        emptyTitle: "Write your first memo!",
        emptyDescription: "Enter your memo in the input field above and click the add button.",
        
        // Notification messages
        notifyContentRequired: "Please enter content.",
        notifyMemoAdded: "Memo has been added.",
        notifyMemoUpdated: "Memo has been updated.",
        notifyMemoDeleted: "Memo has been deleted.",
        notifyMemoCopied: "Memo content has been copied to clipboard.",
        notifyCopyFailed: "Copy failed. Please try again.",
        notifyMemoNotFound: "Memo not found.",
        notifyMemoLimit: "You can only create up to 7 memos. Please delete an existing memo to create a new one.",
        notifyBannedWords: "Inappropriate language detected. Please use different words.",
        notifyNumbersNotAllowed: "For privacy protection, content with numbers cannot be saved.",
        notifyContentRemoved: "Inappropriate content has been automatically removed.",
        notifySupabaseError: "Failed to connect to Supabase. Please refresh the page.",
        notifyLoadError: "An error occurred while loading memos.",
        notifyAddError: "An error occurred while adding memo: {error}",
        notifyUpdateError: "An error occurred while updating memo.",
        notifyDeleteError: "An error occurred while deleting memo.",
        
        // Confirmation messages
        confirmDelete: "Are you sure you want to delete this memo?",
        
        // Advertisement
        adBadge: "Ad",
        adClose: "Close ad",
        adViewMore: "View more",
        adTitle: "Frustrated with deleted memos?",
        adDescription: "Try OTU.AI, a memo app where your notes never get deleted!",
        notifyAdHidden: "Ad has been hidden.",
        
        // PWA Install
        pwaInstall: "Install App",
        
        // Support
        supportText: "Did you find this service useful? Support us with a coffee!",
        supportButton: "Buy Me a Coffee",
        
        // Tooltips
        tooltipCopy: "Copy memo content",
        tooltipMemoLimit: "You can only create up to 7 memos. Please delete an existing memo.",
        tooltipLastMemo: "This is your last memo slot. Delete an existing memo to add a new one.",
        
        // Delete Credits System
        deleteCredits: "Delete Credits: {count}",
        notifyCreditsRewarded: "7 delete credits have been rewarded!",
        notifyNoCredits: "Not enough delete credits. Please watch an ad.",
        adConfirmText: "Watch the ad to delete memos"
    }
};

class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = translations;
    }

    detectLanguage() {
        // 브라우저 언어 감지
        const browserLang = navigator.language || navigator.userLanguage;
        
        // 로컬 스토리지에 저장된 언어 설정 확인
        const savedLang = localStorage.getItem('preferredLanguage');
        
        if (savedLang && (savedLang === 'ko' || savedLang === 'en')) {
            return savedLang;
        }
        
        // 한국어면 'ko', 그 외는 'en'
        if (browserLang.startsWith('ko')) {
            return 'ko';
        }
        
        return 'en';
    }

    setLanguage(lang) {
        if (lang === 'ko' || lang === 'en') {
            this.currentLang = lang;
            localStorage.setItem('preferredLanguage', lang);
            this.updatePageContent();
        }
    }

    t(key, params = {}) {
        let text = this.translations[this.currentLang][key] || key;
        
        // 파라미터 치환
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    }

    updatePageContent() {
        // 헤더
        const headerTitle = document.querySelector('.header h1');
        if (headerTitle) {
            const icon = headerTitle.querySelector('i');
            headerTitle.innerHTML = '';
            if (icon) headerTitle.appendChild(icon.cloneNode(true));
            headerTitle.appendChild(document.createTextNode(this.t('title')));
        }
        
        const subtitle = document.querySelector('.header .subtitle');
        if (subtitle) subtitle.textContent = this.t('subtitle');
        
        // 메모 입력
        const memoContent = document.getElementById('memoContent');
        if (memoContent) memoContent.placeholder = this.t('memoPlaceholder');
        
        // 빈 상태
        const emptyTitle = document.querySelector('.empty-state h3');
        if (emptyTitle) emptyTitle.textContent = this.t('emptyTitle');
        
        const emptyDesc = document.querySelector('.empty-state p');
        if (emptyDesc) emptyDesc.textContent = this.t('emptyDescription');
        
        // 후원 섹션
        const supportText = document.querySelector('.support-text');
        if (supportText) supportText.textContent = this.t('supportText');
        
        const supportBtn = document.querySelector('.support-btn');
        if (supportBtn) {
            const icon = supportBtn.querySelector('i');
            supportBtn.innerHTML = '';
            if (icon) supportBtn.appendChild(icon.cloneNode(true));
            supportBtn.appendChild(document.createTextNode(' ' + this.t('supportButton')));
        }
        
        // 광고 배지
        const adBadge = document.querySelector('.ad-badge');
        if (adBadge) {
            const icon = adBadge.querySelector('i');
            adBadge.innerHTML = '';
            if (icon) adBadge.appendChild(icon.cloneNode(true));
            adBadge.appendChild(document.createTextNode(' ' + this.t('adBadge')));
        }
        
        const adCloseBtn = document.getElementById('adCloseBtn');
        if (adCloseBtn) adCloseBtn.title = this.t('adClose');
        
        const adLink = document.getElementById('adLink');
        if (adLink) {
            const icon = adLink.querySelector('i');
            adLink.innerHTML = '';
            if (icon) adLink.appendChild(icon.cloneNode(true));
            adLink.appendChild(document.createTextNode(' ' + this.t('adViewMore')));
        }
        
        // 메모 추가 버튼
        const addMemoBtn = document.getElementById('addMemoBtn');
        if (addMemoBtn && !addMemoBtn.innerHTML.includes('fa-save')) {
            addMemoBtn.innerHTML = `<i class="fas fa-plus"></i> ${this.t('addMemo')}`;
        }
        
        // PWA 설치 버튼
        const pwaInstallBtn = document.getElementById('pwa-install-btn');
        if (pwaInstallBtn) {
            const icon = pwaInstallBtn.querySelector('i');
            pwaInstallBtn.innerHTML = '';
            if (icon) pwaInstallBtn.appendChild(icon.cloneNode(true));
            pwaInstallBtn.appendChild(document.createTextNode(' ' + this.t('pwaInstall')));
        }
        
        // 광고 제목과 설명 업데이트
        const adTitle = document.querySelector('.ad-title');
        if (adTitle) adTitle.textContent = this.t('adTitle');
        
        const adDescription = document.querySelector('.ad-description');
        if (adDescription) adDescription.textContent = this.t('adDescription');
        
        // 메모 카운트 업데이트 (MemoApp에서 처리)
        if (window.memoApp) {
            window.memoApp.updateUI();
            // 광고도 다시 설정
            window.memoApp.setupDefaultAd();
        }
    }

    getCurrentLanguage() {
        return this.currentLang;
    }
}

// 전역 i18n 인스턴스 생성
window.i18n = new I18n();

// DOM 로드 후 페이지 콘텐츠 업데이트
document.addEventListener('DOMContentLoaded', () => {
    window.i18n.updatePageContent();
});
