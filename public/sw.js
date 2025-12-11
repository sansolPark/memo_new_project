// 캐시 이름을 'v4'로 업데이트 (성능 최적화 버전)
const CACHE_NAME = 'memo-app-v4';
const STATIC_CACHE = 'memo-static-v4';
const DYNAMIC_CACHE = 'memo-dynamic-v4';

// 정적 리소스 (변경이 적은 파일들)
const staticUrlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/images/MEMO_icon.png',
  '/images/MEMO_favicon.png',
  '/images/Memo_og.png'
];

// 동적 리소스 (자주 변경되는 파일들)
const dynamicUrlsToCache = [
  '/script.js',
  '/api-client.js',
  '/i18n.js',
  '/delete-credits.js',
  '/ad-modal.js',
  '/validation.js',
  '/ad-config.js',
  '/pwa-install.js'
];

// 외부 리소스
const externalUrls = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // 정적 리소스 캐시
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('정적 캐시가 열렸습니다');
        return cache.addAll(staticUrlsToCache);
      }),
      // 동적 리소스 캐시
      caches.open(DYNAMIC_CACHE).then((cache) => {
        console.log('동적 캐시가 열렸습니다');
        return cache.addAll(dynamicUrlsToCache);
      }),
      // 외부 리소스 캐시 (실패해도 설치 중단하지 않음)
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.allSettled(
          externalUrls.map(url => 
            cache.add(url).catch(err => console.warn('외부 리소스 캐시 실패:', url, err))
          )
        );
      })
    ])
  );
  
  // 새 서비스 워커가 설치되면 즉시 활성화
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE, CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!validCaches.includes(cacheName)) {
            console.log('이전 캐시를 삭제합니다:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('서비스 워커가 활성화되었습니다');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기 (성능 최적화)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isGET = event.request.method === 'GET';

  // API 요청은 네트워크 우선 전략
  if (requestUrl.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }

  // 외부 도메인 요청 또는 GET 이외의 요청은 가로채지 않음
  if (!isSameOrigin || !isGET) {
    return;
  }

  // 정적 리소스는 캐시 우선 전략
  if (isStaticResource(requestUrl.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // 동적 리소스는 stale-while-revalidate 전략
    event.respondWith(staleWhileRevalidateStrategy(event.request));
  }
});

// 정적 리소스 판별
function isStaticResource(pathname) {
  return pathname.includes('/images/') || 
         pathname.endsWith('.css') || 
         pathname === '/' || 
         pathname === '/index.html';
}

// 캐시 우선 전략
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('캐시 우선 전략 실패:', error);
    return caches.match('/index.html');
  }
}

// 네트워크 우선 전략 (API용)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('네트워크 요청 실패, 캐시에서 찾는 중:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate 전략
async function staleWhileRevalidateStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
    }
    return networkResponse;
  }).catch(error => {
    console.error('네트워크 요청 실패:', error);
    return cachedResponse;
  });

  return cachedResponse || fetchPromise;
}

// 백그라운드 동기화 (이 부분은 수정할 필요 없습니다)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // 백그라운드에서 동기화할 작업들
  console.log('백그라운드 동기화 실행');
}