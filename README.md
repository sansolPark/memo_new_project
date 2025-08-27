# 📝 메모 앱

모던하고 부드러운 디자인의 메모 앱입니다. HTML, CSS, JavaScript, Express.js를 사용하여 구현되었습니다.

## ✨ 주요 기능

- **메모 추가**: 제목과 내용을 입력하여 새 메모 생성
- **메모 편집**: 기존 메모 수정 가능
- **메모 삭제**: 불필요한 메모 삭제
- **로컬 스토리지**: 브라우저에 메모 데이터 자동 저장
- **반응형 디자인**: 모바일과 데스크톱 모두 지원
- **모던 UI**: 부드러운 색감과 애니메이션

## 🚀 시작하기

### 1. 의존성 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

### 3. 프로덕션 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **스타일링**: CSS Grid, Flexbox, CSS 애니메이션
- **데이터 저장**: Local Storage
- **폰트**: Google Fonts (Noto Sans KR)
- **아이콘**: Font Awesome

## 📱 사용법

### 메모 추가
1. 제목 입력란에 메모 제목 입력 (선택사항)
2. 내용 입력란에 메모 내용 입력
3. "메모 추가" 버튼 클릭 또는 Enter 키 누르기

### 메모 편집
1. 메모 하단의 "수정" 버튼 클릭
2. 입력란에 수정된 내용 입력
3. "메모 수정" 버튼 클릭

### 메모 삭제
1. 메모 하단의 "삭제" 버튼 클릭
2. 확인 대화상자에서 "확인" 클릭

## 🎨 디자인 특징

- **그라데이션 배경**: 보라색 계열의 부드러운 그라데이션
- **글래스모피즘**: 반투명 배경과 블러 효과
- **부드러운 애니메이션**: 호버 효과와 전환 애니메이션
- **직관적인 UI**: 사용자 친화적인 인터페이스

## 📁 프로젝트 구조

```
memo_new_project/
├── public/
│   ├── index.html      # 메인 HTML 파일
│   ├── styles.css      # CSS 스타일
│   └── script.js       # JavaScript 기능
├── server.js           # Express.js 서버
├── package.json        # 프로젝트 설정
└── README.md          # 프로젝트 설명
```

## 🔧 커스터마이징

### 색상 변경
`public/styles.css` 파일에서 CSS 변수를 수정하여 색상을 변경할 수 있습니다.

### 기능 추가
`public/script.js` 파일의 `MemoApp` 클래스에 새로운 메서드를 추가하여 기능을 확장할 수 있습니다.

## 📝 라이선스

MIT License

## 🤝 기여하기

버그 리포트나 기능 제안은 언제든 환영합니다!
