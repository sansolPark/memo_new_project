# 🚀 Vercel 배포 가이드

## ✅ 수정 완료 사항

### 1. 빌드 스크립트 수정
- **Before**: `"build": "node obfuscate.js && node server.js"` ❌
- **After**: `"build": "node obfuscate.js"` ✅

### 2. Serverless Functions 구현
- `api/memos.js` - 메모 CRUD API
- `api/validate.js` - 검증 API

### 3. 구조 변경
```
Before (Node.js 서버):
클라이언트 → Express 서버 → Supabase

After (Vercel Serverless):
클라이언트 → Vercel Functions → Supabase
```

---

## 📝 배포 단계

### 1단계: 로컬 테스트 (선택)

```bash
# 원본 코드로 복원
npm run restore

# 로컬 서버 테스트 (개발용)
npm run dev

# 브라우저에서 http://localhost:3000 확인
```

### 2단계: 난독화 실행

```bash
npm run build
```

**확인사항:**
- ✅ `public/script.js` 난독화됨
- ✅ `public/validation.js` 난독화됨
- ✅ `public/api-client.js` 난독화됨
- ✅ `api/memos.js` 난독화됨
- ✅ `api/validate.js` 난독화됨

### 3단계: Git 커밋 & 푸시

```bash
git add .
git commit -m "Fix: Vercel 배포 오류 수정 - 빌드 스크립트 개선"
git push origin main
```

### 4단계: Vercel 자동 배포

- Vercel이 자동으로 감지하여 배포 시작
- 약 1-2분 소요
- 배포 완료 후 URL 확인

---

## 🔍 배포 확인

### 1. Vercel Dashboard 확인
- https://vercel.com/dashboard
- 프로젝트 선택
- Deployments 탭에서 상태 확인

### 2. 빌드 로그 확인
```
✓ Backed up: public/script.js
✓ Obfuscated: public/script.js
✓ Backed up: api/memos.js
✓ Obfuscated: api/memos.js
=== Obfuscation Complete ===
```

### 3. 배포된 사이트 테스트
- 메모 추가
- 메모 삭제
- 7개 제한 확인
- 500자 제한 확인

---

## 🛠️ 문제 해결

### 빌드 타임아웃 (45분 초과)
**원인**: `node server.js`가 빌드 스크립트에 포함됨
**해결**: ✅ 이미 수정됨 (`package.json` 확인)

### API 호출 오류
**원인**: Serverless Functions 경로 문제
**해결**: `/api/memos` 경로 사용 (✅ 이미 수정됨)

### 난독화 오류
```bash
# 원본 코드로 복원
npm run restore

# 다시 난독화
npm run build
```

---

## 📊 배포 전/후 비교

### Before (Node.js 서버)
```json
{
  "build": "node obfuscate.js && node server.js"
}
```
- ❌ 서버가 계속 실행되어 빌드 타임아웃
- ❌ Vercel에서 Express 서버 사용 불가

### After (Serverless)
```json
{
  "build": "node obfuscate.js"
}
```
- ✅ 난독화만 실행하고 종료
- ✅ Vercel Serverless Functions 사용
- ✅ 빌드 시간: 약 30초

---

## 🎯 최종 체크리스트

배포 전 확인:
- [x] `package.json` 빌드 스크립트 수정
- [x] Serverless Functions 생성 (`api/` 폴더)
- [x] API 클라이언트 경로 수정
- [x] 난독화 스크립트 업데이트
- [ ] 로컬 테스트 (선택)
- [ ] Git 커밋 & 푸시
- [ ] Vercel 배포 확인
- [ ] 배포된 사이트 테스트

---

## 🚀 배포 명령어 요약

```bash
# 1. 난독화 (로컬에서 실행 - 선택)
npm run build

# 2. Git 커밋
git add .
git commit -m "Fix: Vercel 배포 오류 수정"
git push origin main

# 3. Vercel 자동 배포 (자동)
# → Vercel Dashboard에서 확인
```

---

## 📞 도움말

### Vercel 배포 로그 확인
1. Vercel Dashboard 접속
2. 프로젝트 선택
3. Deployments 탭
4. 최신 배포 클릭
5. Build Logs 확인

### 로컬 개발 모드
```bash
# 원본 코드로 복원
npm run restore

# 개발 서버 시작
npm run dev
```

### 배포 후 원본 코드 복원
```bash
# 배포 후 로컬에서 개발 계속하려면
npm run restore
```

---

## ✅ 성공 확인

배포 성공 시:
- ✅ Vercel Dashboard에 "Ready" 상태
- ✅ 배포 URL 접속 가능
- ✅ 메모 추가/삭제 정상 동작
- ✅ 7개 제한 동작
- ✅ 500자 제한 동작

**축하합니다! 배포 완료!** 🎉
