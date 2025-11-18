// 삭제권 관리 시스템
class DeleteCreditsManager {
    constructor() {
        this.storageKey = 'deleteCredits';
        this.init();
    }

    init() {
        // 초기 삭제권이 없으면 0으로 설정
        const credits = localStorage.getItem(this.storageKey);
        if (credits === null || credits === undefined) {
            this.setCredits(0);
        }
    }

    getCredits() {
        const credits = localStorage.getItem(this.storageKey);
        if (credits === null || credits === undefined || credits === '') {
            return 0;
        }
        return parseInt(credits);
    }

    setCredits(count) {
        localStorage.setItem(this.storageKey, count.toString());
        this.updateUI();
    }

    hasCredits() {
        return this.getCredits() > 0;
    }

    useCredit() {
        const current = this.getCredits();
        if (current > 0) {
            this.setCredits(current - 1);
            return true;
        }
        return false;
    }

    rewardCredits() {
        this.setCredits(7);
        this.showRewardNotification();
    }

    updateUI() {
        const creditsDisplay = document.getElementById('deleteCreditsDisplay');
        if (creditsDisplay) {
            const credits = this.getCredits();
            creditsDisplay.textContent = window.i18n ? 
                window.i18n.t('deleteCredits', { count: credits }) : 
                `삭제권: ${credits}회`;
        }
    }

    showRewardNotification() {
        if (window.memoApp) {
            window.memoApp.showNotification(
                window.i18n ? window.i18n.t('notifyCreditsRewarded') : '삭제권 7회가 지급되었습니다!',
                'success'
            );
        }
    }
}

// 전역 인스턴스 생성
window.deleteCreditsManager = new DeleteCreditsManager();
