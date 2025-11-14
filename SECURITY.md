# 보안 가이드

## 구현된 보안 기능

### 1. 서버 측 검증
- **위치**: `server.js`
- **기능**: 
  - 모든 메모 콘텐츠를 서버에서 검증
  - 금칙어 필터링
  - 숫자 차단 (개인정보 보호)
  - 길이 제한 (500자)
  - Rate Limiting (1분당 30개 요청)

### 2. 코드 난독화
- **도구**: javascript-obfuscator
- **대상 파일**:
  - `public/script.js` - 메인 앱 로직
  - `public/validation.js` - 검증 로직
  - `public/supabase-config.js` - DB 설정

### 3. 보안 헤더
- Content-Security-Policy (CSP)
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- Referrer-Policy
- Permissions-Policy

## 사용 방법

### 개발 모드 (난독화 없음)
```bash
npm run dev
```

### 프로덕션 배포 전 난독화
```bash
npm run obfuscate
npm start
```

### 원본 코드 복원 (개발용)
```bash
npm run restore
```

## 주의사항

### ⚠️ 난독화 후 주의사항
1. **백업 파일 보관**: `.original.js` 파일은 원본 코드입니다
2. **Git 커밋 전**: 난독화된 코드를 커밋하지 마세요 (개발 어려움)
3. **배포 시에만**: Vercel 배포 전에만 난독화 실행

### 🔒 Supabase RLS 설정 (필수!)

**중요**: DB 레벨 보안을 위해 반드시 설정하세요!

#### 빠른 설정 (5분)
1. Supabase Dashboard 접속
2. SQL Editor 열기
3. `supabase/policies.sql` 파일 내용 복사
4. 붙여넣기 후 실행 (Run 버튼)

**자세한 가이드**: `supabase/README.md` 참고

#### RLS 적용 효과
- ✅ 7개 메모 제한 (DB 레벨 강제)
- ✅ 500자 제한 (DB 레벨 강제)
- ✅ 빈 내용 차단
- ✅ 대량 삽입 방지
- ✅ 직접 API 공격 차단

### 🔒 추가 보안 권장사항

1. **환경 변수 보호** (선택):
   - Supabase 키를 `.env` 파일로 이동
   - 서버에서만 사용하도록 변경

2. **API 인증 추가** (선택):
   - JWT 토큰 기반 인증
   - API 키 검증

## 보안 체크리스트

- [x] 서버 측 검증 구현
- [x] Rate Limiting 적용
- [x] 코드 난독화 설정
- [x] 보안 헤더 적용
- [ ] **Supabase RLS 설정 (필수!)** ← 지금 바로 설정!
- [ ] 환경 변수 분리 (선택)
- [ ] API 인증 추가 (선택)

## 문제 발생 시

### 난독화 후 오류 발생
```bash
npm run restore  # 원본 코드로 복원
```

### 서버 검증 오류
- 서버 로그 확인: `console.log` 출력 확인
- 클라이언트는 서버 오류 시 자동으로 폴백

## 성능 영향

- **난독화**: 파일 크기 약 2-3배 증가, 실행 속도 약간 감소
- **서버 검증**: 요청당 약 10-50ms 추가 지연
- **전체 영향**: 사용자 경험에 큰 영향 없음
