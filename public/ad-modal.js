// 광고 모달 시스템
class AdModal {
    constructor() {
        this.ads = [
            { 
                type: 'video', 
                src: '/ads/melon.mp4', 
                link: 'https://short.millie.co.kr/naxfpy',
                name: 'melon_video'
            },
            { 
                type: 'image', 
                src: '/ads/melon2.jpg', 
                link: 'https://short.millie.co.kr/naxfpy',
                name: 'melon_image'
            },
            { 
                type: 'video', 
                src: '/ads/gag.mp4', 
                link: 'https://short.millie.co.kr/jixd6r',
                name: 'gag_video'
            }
        ];
        this.currentAd = null;
        this.isShowing = false;
        this.canClose = false;
        this.imageTimer = null;
    }

    getRandomAd() {
        const randomIndex = Math.floor(Math.random() * this.ads.length);
        return this.ads[randomIndex];
    }

    show() {
        return new Promise((resolve) => {
            if (this.isShowing) {
                resolve(false);
                return;
            }

            this.isShowing = true;
            this.onCloseCallback = resolve;

            // 1단계: 광고 보기 확인 모달
            this.showConfirmModal();
        });
    }

    showConfirmModal() {
        // 확인 모달 오버레이
        const overlay = document.createElement('div');
        overlay.id = 'adConfirmOverlay';
        overlay.className = 'ad-modal-overlay';

        // 확인 모달
        const modal = document.createElement('div');
        modal.className = 'ad-modal ad-confirm-modal';

        // 아이콘
        const icon = document.createElement('div');
        icon.className = 'ad-confirm-icon';
        icon.innerHTML = '<i class="fas fa-tv"></i>';

        // 안내 텍스트
        const infoText = document.createElement('p');
        infoText.className = 'ad-confirm-text';
        infoText.textContent = window.i18n ? 
            window.i18n.t('adConfirmText') : 
            '광고 시청 후 삭제 가능해요';

        // 광고 보기 버튼
        const watchBtn = document.createElement('button');
        watchBtn.className = 'ad-watch-btn';
        watchBtn.innerHTML = '<i class="fas fa-play-circle"></i> 광고 보기';
        watchBtn.addEventListener('click', () => {
            overlay.remove();
            this.canClose = false;
            this.currentAd = this.getRandomAd();
            this.createModal();
        });

        // 취소 버튼
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ad-cancel-btn';
        cancelBtn.textContent = '취소';
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            this.isShowing = false;
            if (this.onCloseCallback) {
                this.onCloseCallback(false);
                this.onCloseCallback = null;
            }
        });

        // 조립
        modal.appendChild(icon);
        modal.appendChild(infoText);
        modal.appendChild(watchBtn);
        modal.appendChild(cancelBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 애니메이션
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }

    createModal() {
        // 모달 오버레이
        const overlay = document.createElement('div');
        overlay.id = 'adModalOverlay';
        overlay.className = 'ad-modal-overlay';

        // 모달 컨테이너
        const modal = document.createElement('div');
        modal.id = 'adModal';
        modal.className = 'ad-modal';

        // 광고 컨테이너
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container';

        // 광고 콘텐츠 (이미지 또는 동영상)
        let adContent;
        if (this.currentAd.type === 'video') {
            adContent = this.createVideoAd();
        } else {
            adContent = this.createImageAd();
        }

        // 전자책 보러가기 버튼
        const linkBtn = document.createElement('a');
        linkBtn.className = 'ad-link-btn';
        linkBtn.href = this.currentAd.link;
        linkBtn.target = '_blank';
        linkBtn.rel = 'noopener noreferrer';
        linkBtn.innerHTML = '<i class="fas fa-book-open"></i> 전자책 보러가기 클릭';

        // 닫기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.id = 'adCloseBtn';
        closeBtn.className = 'ad-close-btn';
        closeBtn.innerHTML = '<i class="fas fa-times"></i> 닫기';
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('닫기 버튼 클릭됨, canClose:', this.canClose);
            this.close();
        });

        // 조립
        adContainer.appendChild(adContent);
        modal.appendChild(adContainer);
        modal.appendChild(linkBtn);
        modal.appendChild(closeBtn);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // 애니메이션
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
    }

    createVideoAd() {
        const video = document.createElement('video');
        video.className = 'ad-video';
        video.src = this.currentAd.src;
        video.autoplay = true;
        video.playsInline = true;
        video.controls = false;

        // 동영상 종료 시 닫기 버튼 활성화
        video.addEventListener('ended', () => {
            this.enableCloseButton();
        });

        // 동영상 클릭 시 링크 이동
        video.addEventListener('click', () => {
            window.open(this.currentAd.link, '_blank', 'noopener,noreferrer');
        });

        // 커서 포인터
        video.style.cursor = 'pointer';

        return video;
    }

    createImageAd() {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'ad-image-wrapper';

        const image = document.createElement('img');
        image.className = 'ad-image';
        image.src = this.currentAd.src;
        image.alt = '광고';

        // 이미지 클릭 시 링크 이동
        imageWrapper.addEventListener('click', () => {
            window.open(this.currentAd.link, '_blank', 'noopener,noreferrer');
        });

        imageWrapper.style.cursor = 'pointer';
        imageWrapper.appendChild(image);

        // 5초 후 닫기 버튼 활성화
        this.imageTimer = setTimeout(() => {
            this.enableCloseButton();
        }, 5000);

        return imageWrapper;
    }

    enableCloseButton() {
        this.canClose = true;
        const closeBtn = document.getElementById('adCloseBtn');
        if (closeBtn) {
            closeBtn.classList.add('enabled');
            closeBtn.style.cursor = 'pointer';
            console.log('닫기 버튼 활성화됨');
        }
    }

    close() {
        console.log('close() 호출됨, canClose:', this.canClose);
        
        const overlay = document.getElementById('adModalOverlay');
        if (overlay) {
            overlay.classList.remove('show');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }

        // 타이머 정리
        if (this.imageTimer) {
            clearTimeout(this.imageTimer);
            this.imageTimer = null;
        }

        // 삭제권 지급 여부 저장
        const shouldReward = this.canClose;

        // 삭제권 지급 (닫기 버튼이 활성화된 경우에만)
        if (shouldReward && window.deleteCreditsManager) {
            console.log('삭제권 지급');
            window.deleteCreditsManager.rewardCredits();
        } else {
            console.log('삭제권 지급 안 함 (광고 미완료)');
        }

        this.isShowing = false;
        const wasComplete = this.canClose;
        this.canClose = false;
        this.currentAd = null;

        // Promise resolve
        if (this.onCloseCallback) {
            this.onCloseCallback(wasComplete);
            this.onCloseCallback = null;
        }
    }
}

// 전역 인스턴스 생성
window.adModal = new AdModal();
