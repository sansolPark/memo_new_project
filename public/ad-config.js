// 광고 설정 파일
// 이 파일에서 광고 내용을 쉽게 수정할 수 있습니다.

const AD_CONFIG = {
    // 광고 제목
    title: '메모가 지워져서 답답하시죠?',
    
    // 광고 설명
    description: '내가 쓴 메모가 지워지지 않는 메모앱, OTU.AI를 사용해보세요!',
    
    // 광고 링크 (실제 광고 URL로 변경하세요)
    link: 'https://otu.ai/home',
    
    // 광고 표시 여부 (true: 표시, false: 숨김)
    enabled: true,
    
    // 광고 색상 테마 (선택사항)
    theme: {
        primary: '#ff6b6b',
        secondary: '#ffa500'
    }
};

// 광고 설정을 전역으로 사용할 수 있도록 설정
window.AD_CONFIG = AD_CONFIG;

// 광고 설정 업데이트 함수
function updateAdConfig(newConfig) {
    Object.assign(AD_CONFIG, newConfig);
    
    // 메모 앱이 로드된 후 광고 업데이트
    if (window.memoApp && window.memoApp.updateAd) {
        window.memoApp.updateAd(
            AD_CONFIG.title,
            AD_CONFIG.description,
            AD_CONFIG.link
        );
    }
}

// 광고 설정을 쉽게 변경할 수 있는 함수들
const AdManager = {
    // 광고 제목 변경
    setTitle: (title) => {
        AD_CONFIG.title = title;
        updateAdConfig({ title });
    },
    
    // 광고 설명 변경
    setDescription: (description) => {
        AD_CONFIG.description = description;
        updateAdConfig({ description });
    },
    
    // 광고 링크 변경
    setLink: (link) => {
        AD_CONFIG.link = link;
        updateAdConfig({ link });
    },
    
    // 광고 활성화/비활성화
    setEnabled: (enabled) => {
        AD_CONFIG.enabled = enabled;
        if (enabled) {
            updateAdConfig({ enabled });
        } else {
            if (window.memoApp && window.memoApp.hideAd) {
                window.memoApp.hideAd();
            }
        }
    },
    
    // 전체 광고 설정 변경
    updateAd: (title, description, link) => {
        updateAdConfig({ title, description, link });
    }
};

// 전역으로 AdManager 사용 가능
window.AdManager = AdManager;

console.log('광고 설정이 로드되었습니다. AdManager를 사용하여 광고를 관리할 수 있습니다.');
console.log('사용법: AdManager.setTitle("새로운 광고 제목")');
console.log('사용법: AdManager.setLink("https://example.com")');
