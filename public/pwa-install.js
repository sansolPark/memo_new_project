// PWA 설치 관련 변수들
let deferredPrompt;
let installButton;

// DOM이 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
  // 설치 버튼 생성
  createInstallButton();
  
  // 서비스 워커 등록
  registerServiceWorker();
  
  // 설치 이벤트 리스너 등록
  window.addEventListener('beforeinstallprompt', (e) => {
    // 기본 설치 프롬프트 방지
    e.preventDefault();
    // 나중에 사용하기 위해 이벤트 저장
    deferredPrompt = e;
    // 설치 버튼 표시
    showInstallButton();
  });
  
  // 앱이 이미 설치되었는지 확인
  window.addEventListener('appinstalled', () => {
    console.log('PWA가 성공적으로 설치되었습니다!');
    hideInstallButton();
    deferredPrompt = null;
  });
});

// 서비스 워커 등록
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('서비스 워커가 성공적으로 등록되었습니다:', registration.scope);
      })
      .catch((error) => {
        console.log('서비스 워커 등록 실패:', error);
      });
  }
}

// 설치 버튼 생성
function createInstallButton() {
  // 기존 설치 버튼이 있다면 제거
  const existingButton = document.getElementById('pwa-install-btn');
  if (existingButton) {
    existingButton.remove();
  }
  
  // 새로운 설치 버튼 생성
  installButton = document.createElement('button');
  installButton.id = 'pwa-install-btn';
  installButton.className = 'pwa-install-btn';
  installButton.innerHTML = `
    <i class="fas fa-download"></i>
    앱 설치
  `;
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 50px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    z-index: 1000;
    display: none;
    transition: all 0.3s ease;
    font-family: 'Noto Sans KR', sans-serif;
  `;
  
  // 호버 효과
  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)';
    installButton.style.boxShadow = '0 6px 16px rgba(76, 175, 80, 0.4)';
  });
  
  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)';
    installButton.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.3)';
  });
  
  // 클릭 이벤트
  installButton.addEventListener('click', installPWA);
  
  // body에 추가
  document.body.appendChild(installButton);
}

// 설치 버튼 표시
function showInstallButton() {
  if (installButton) {
    installButton.style.display = 'block';
    // 애니메이션 효과
    setTimeout(() => {
      installButton.style.opacity = '1';
      installButton.style.transform = 'translateY(0)';
    }, 100);
  }
}

// 설치 버튼 숨기기
function hideInstallButton() {
  if (installButton) {
    installButton.style.opacity = '0';
    installButton.style.transform = 'translateY(20px)';
    setTimeout(() => {
      installButton.style.display = 'none';
    }, 300);
  }
}

// PWA 설치 실행
function installPWA() {
  if (deferredPrompt) {
    // 설치 프롬프트 표시
    deferredPrompt.prompt();
    
    // 사용자의 응답 대기
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('사용자가 PWA 설치를 수락했습니다');
      } else {
        console.log('사용자가 PWA 설치를 거부했습니다');
      }
      deferredPrompt = null;
    });
  }
}

// 오프라인 상태 감지
window.addEventListener('online', () => {
  console.log('온라인 상태로 전환되었습니다');
  showOnlineStatus();
});

window.addEventListener('offline', () => {
  console.log('오프라인 상태로 전환되었습니다');
  showOfflineStatus();
});

// 온라인 상태 표시
function showOnlineStatus() {
  const status = document.getElementById('connection-status');
  if (status) {
    status.textContent = '온라인';
    status.className = 'connection-status online';
  }
}

// 오프라인 상태 표시
function showOfflineStatus() {
  const status = document.getElementById('connection-status');
  if (status) {
    status.textContent = '오프라인';
    status.className = 'connection-status offline';
  }
}

// 연결 상태 표시 요소 생성
function createConnectionStatus() {
  const status = document.createElement('div');
  status.id = 'connection-status';
  status.className = 'connection-status';
  status.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    z-index: 1001;
    display: none;
    font-family: 'Noto Sans KR', sans-serif;
  `;
  
  document.body.appendChild(status);
  
  // 초기 상태 설정
  if (navigator.onLine) {
    showOnlineStatus();
  } else {
    showOfflineStatus();
  }
}

// 페이지 로드 시 연결 상태 표시 요소 생성
window.addEventListener('load', () => {
  createConnectionStatus();
});
