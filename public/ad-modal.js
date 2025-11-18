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
            this.canClose = false;
            this.currentAd = this.getRandomAd();
            this.onCloseCallback = resolve;

            this.createModal();
        });
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

        // 안내 텍스트
        const infoText = document.createElement('p');
        infoText.className = 'ad-info-text';
        infoText.textContent = window.i18n ? 
            window.i18n.t('adInfoText') : 
            '광고 시청 후 삭제 가능해요';

        // 닫기 버튼
        const closeBtn = document.createElement('button');
        closeBtn.id = 'adCloseBtn';
        closeBtn.className = 'ad-close-btn';
        closeBtn.disabled = true;
        closeBtn.innerHTML = '<i class="fas fa-times"></i> 닫기';
        closeBtn.addEventListener('click', () => this.close());

        // 조립
        adContainer.appendChild(adContent);
        modal.appendChild(adContainer);
        modal.appendChild(infoText);
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
            closeBtn.disabled = false;
            closeBtn.classList.add('enabled');
        }
    }

    close() {
        if (!this.canClose) {
            return;
        }

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

        // 삭제권 지급
        if (window.deleteCreditsManager) {
            window.deleteCreditsManager.rewardCredits();
        }

        this.isShowing = false;
        this.canClose = false;
        this.currentAd = null;

        // Promise resolve
        if (this.onCloseCallback) {
            this.onCloseCallback(true);
            this.onCloseCallback = null;
        }
    }
}

// 전역 인스턴스 생성
window.adModal = new AdModal();
