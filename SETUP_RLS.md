# 🛡️ Supabase RLS 보안 설정 - 빠른 시작

## ⚡ 5분 안에 완료하기 (가장 쉬운 방법)

### 1️⃣ Supabase Dashboard 접속
```
https://supabase.com/dashboard
```
- 로그인
- 프로젝트 선택

### 2️⃣ SQL Editor 열기
- 왼쪽 메뉴에서 **SQL Editor** 클릭
- **New query** 버튼 클릭

### 3️⃣ 정책 적용
1. 이 프로젝트의 `supabase/policies.sql` 파일 열기
2. 전체 내용 복사 (Ctrl+A, Ctrl+C)
3. SQL Editor에 붙여넣기 (Ctrl+V)
4. **Run** 버튼 클릭 (또는 Ctrl+Enter)

### 4️⃣ 완료 확인
✅ "Success. No rows returned" 메시지가 보이면 성공!

---

## 🧪 테스트하기

### Dashboard에서 테스트
SQL Editor에서 실행:

```sql
-- 1. 현재 메모 개수 확인
SELECT count(*) FROM memos;

-- 2. 7개 제한 테스트 (7개 이상이면 실패해야 정상)
INSERT INTO memos (content) VALUES ('테스트 메모');

-- 3. 500자 제한 테스트 (실패해야 정상)
INSERT INTO memos (content) VALUES (repeat('a', 501));

-- 4. 빈 내용 테스트 (실패해야 정상)
INSERT INTO memos (content) VALUES ('');
```

---

## 🎯 이제 뭐가 보호되나요?

### ✅ 보호되는 것들
1. **7개 메모 제한**
   - 클라이언트에서 우회 불가능
   - DB 레벨에서 강제 적용

2. **500자 제한**
   - 긴 텍스트 자동 차단
   - 스토리지 낭비 방지

3. **빈 내용 차단**
   - 의미 없는 메모 방지
   - DB 정리 유지

4. **대량 삽입 방지**
   - DoS 공격 차단
   - 스팸 방지

5. **직접 API 공격 차단**
   - Supabase API 직접 호출해도 정책 적용
   - 개발자 도구로 우회 불가능

### ❌ 이전에 가능했던 공격들
```javascript
// 이제 모두 차단됩니다!

// 1. 무제한 메모 추가
for (let i = 0; i < 1000; i++) {
  supabase.from('memos').insert({ content: 'spam' });
}
// ❌ 7개 초과 시 자동 차단

// 2. 긴 텍스트 삽입
supabase.from('memos').insert({ 
  content: 'a'.repeat(10000) 
});
// ❌ 500자 초과 시 자동 차단

// 3. 빈 메모 추가
supabase.from('memos').insert({ content: '' });
// ❌ 빈 내용 자동 차단
```

---

## 🔧 문제 해결

### "permission denied" 에러
```sql
-- 정책 다시 적용
-- supabase/policies.sql 파일 내용 다시 실행
```

### 정책 초기화 (문제 발생 시)
```sql
-- 1. 모든 정책 제거
DROP POLICY IF EXISTS "public_select_memos" ON memos;
DROP POLICY IF EXISTS "public_insert_memos" ON memos;
DROP POLICY IF EXISTS "public_update_memos" ON memos;
DROP POLICY IF EXISTS "public_delete_memos" ON memos;

-- 2. 트리거 제거
DROP TRIGGER IF EXISTS memos_rate_limit ON memos;
DROP FUNCTION IF EXISTS check_memo_rate_limit();

-- 3. policies.sql 다시 실행
```

---

## 📚 더 자세한 정보

- **전체 가이드**: `supabase/README.md`
- **보안 문서**: `SECURITY.md`
- **Supabase 공식 문서**: https://supabase.com/docs/guides/auth/row-level-security

---

## ✅ 완료 체크리스트

- [ ] Supabase Dashboard 접속
- [ ] SQL Editor에서 `policies.sql` 실행
- [ ] "Success" 메시지 확인
- [ ] 테스트 쿼리 실행
- [ ] 앱에서 메모 추가/삭제 테스트
- [ ] 7개 제한 동작 확인

---

## 🎉 축하합니다!

이제 서비스가 다음 레벨의 보안을 갖추었습니다:

1. ✅ 서버 측 검증
2. ✅ 코드 난독화
3. ✅ **DB 레벨 보안 (RLS)**
4. ✅ Rate Limiting
5. ✅ 보안 헤더

**완벽한 3중 보안 체계 완성!** 🛡️
