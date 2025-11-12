// 캐시 이름을 'v1'으로 설정합니다. (업데이트 시 'v2'로 변경하세요!)
const CACHE_NAME = 'memo-app-v1'; 
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/supabase-config.js',
  '/ad-config.js',
  '/images/MEMO_icon.png',
  '/images/MEMO_favicon.png',
  '/images/Memo_og.png',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시가 열렸습니다');
        return cache.addAll(urlsToCache);
      })
  );
  
  // [ ★ 수정 1 ] 새 서비스 워커가 설치되면 즉시 활성화합니다.
  self.skipWaiting();
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시를 삭제합니다:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    // [ ★ 수정 2 ] 활성화된 서비스 워커가 즉시 페이지 제어권을 가져옵니다.
    }).then(() => self.clients.claim()) 
  );
});

// 네트워크 요청 가로채기 (이 부분은 수정할 필요 없습니다)
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isGET = event.request.method === 'GET';

  // 외부 도메인 요청(Supabase 등) 또는 GET 이외의 요청(POST/PUT/DELETE)은 가로채지 않음
  if (!isSameOrigin || !isGET) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }

        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request).then((response) => {
          // 유효한 응답이 아니면 그대로 반환
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 응답을 복제하여 캐시에 저장 (GET만 처리)
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        });
      })
      .catch(() => {
        // 네트워크 오류 시 오프라인 페이지 반환
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

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