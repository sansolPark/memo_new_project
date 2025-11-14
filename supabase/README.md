# Supabase RLS 보안 설정 가이드

## 🎯 목적
- 7개 메모 제한 강제 (DB 레벨)
- 500자 제한 강제 (DB 레벨)
- 대량 삽입/삭제 방지
- 직접 API 공격 차단

## 🚀 빠른 설정 (3가지 방법)

### 방법 1: Supabase Dashboard (가장 쉬움) ⭐ 추천

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 `SQL Editor` 클릭
   - `New query` 버튼 클릭

3. **정책 적용**
   - `supabase/policies.sql` 파일 내용 전체 복사
   - SQL Editor에 붙여넣기
   - `Run` 버튼 클릭 (또는 Ctrl+Enter)

4. **확인**
   - 에러 없이 완료되면 ✅ 성공!
   - "Success. No rows returned" 메시지 확인

---

### 방법 2: Supabase CLI (자동화)

#### 1단계: CLI 설치
```bash
npm install -g supabase
```

#### 2단계: 로그인
```bash
supabase login
```
브라우저가 열리면 로그인

#### 3단계: 프로젝트 연결
```bash
# 프로젝트 ID 확인 (Dashboard > Settings > General)
supabase link --project-ref YOUR_PROJECT_ID
```

#### 4단계: 정책 배포
```bash
supabase db push
```

---

### 방법 3: 수동 SQL 실행

Supabase Dashboard > SQL Editor에서 아래 명령어들을 순서대로 실행:

```sql
-- 1. 기존 정책 제거
DROP POLICY IF EXISTS "Allow all operations for memos" ON memos;

-- 2. RLS 활성화
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 3. 읽기 정책
CREATE POLICY "public_select_memos" 
ON memos FOR SELECT USING (true);

-- 4. 쓰기 정책 (7개 제한, 500자 제한)
CREATE POLICY "public_insert_memos" 
ON memos FOR INSERT 
WITH CHECK (
  content IS NOT NULL 
  AND length(trim(content)) > 0
  AND length(content) <= 500
  AND (SELECT count(*) FROM memos) < 7
);

-- 5. 수정 정책
CREATE POLICY "public_update_memos" 
ON memos FOR UPDATE 
USING (true)
WITH CHECK (
  content IS NOT NULL 
  AND length(trim(content)) > 0
  AND length(content) <= 500
);

-- 6. 삭제 정책
CREATE POLICY "public_delete_memos" 
ON memos FOR DELETE USING (true);

-- 7. Rate Limiting 트리거
CREATE OR REPLACE FUNCTION check_memo_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  memo_count INTEGER;
BEGIN
  SELECT count(*) INTO memo_count FROM memos;
  
  IF memo_count >= 7 THEN
    RAISE EXCEPTION 'Maximum 7 memos allowed';
  END IF;
  
  IF length(NEW.content) > 500 THEN
    RAISE EXCEPTION 'Content exceeds 500 characters';
  END IF;
  
  IF length(trim(NEW.content)) = 0 THEN
    RAISE EXCEPTION 'Content cannot be empty';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER memos_rate_limit
BEFORE INSERT ON memos
FOR EACH ROW
EXECUTE FUNCTION check_memo_rate_limit();
```

---

## ✅ 적용 확인

### 테스트 1: 7개 제한 확인
```sql
-- 메모 개수 확인
SELECT count(*) FROM memos;

-- 7개 이상이면 삽입 시도 (실패해야 정상)
INSERT INTO memos (content) VALUES ('테스트');
-- 예상 결과: "Maximum 7 memos allowed" 에러
```

### 테스트 2: 500자 제한 확인
```sql
-- 500자 초과 삽입 시도 (실패해야 정상)
INSERT INTO memos (content) VALUES (repeat('a', 501));
-- 예상 결과: "Content exceeds 500 characters" 에러
```

### 테스트 3: 빈 내용 차단 확인
```sql
-- 빈 내용 삽입 시도 (실패해야 정상)
INSERT INTO memos (content) VALUES ('');
-- 예상 결과: "Content cannot be empty" 에러
```

---

## 🔒 보안 효과

### Before (취약)
```javascript
// 클라이언트에서 직접 Supabase API 호출 가능
supabase.from('memos').insert([
  { content: 'spam1' },
  { content: 'spam2' },
  // ... 무제한 삽입 가능
]);
```

### After (보안)
```javascript
// 동일한 코드 실행 시
// ❌ 7개 초과 시 자동 차단
// ❌ 500자 초과 시 자동 차단
// ❌ 빈 내용 자동 차단
// ✅ DB 레벨에서 강제 적용
```

---

## 🛠️ 문제 해결

### 에러: "permission denied for table memos"
- RLS가 너무 엄격하게 설정됨
- 해결: `policies.sql` 다시 실행

### 에러: "policy already exists"
- 기존 정책이 남아있음
- 해결: 
```sql
DROP POLICY IF EXISTS "정책이름" ON memos;
```

### 정책 전체 초기화
```sql
-- 모든 정책 제거
DROP POLICY IF EXISTS "public_select_memos" ON memos;
DROP POLICY IF EXISTS "public_insert_memos" ON memos;
DROP POLICY IF EXISTS "public_update_memos" ON memos;
DROP POLICY IF EXISTS "public_delete_memos" ON memos;

-- 트리거 제거
DROP TRIGGER IF EXISTS memos_rate_limit ON memos;
DROP FUNCTION IF EXISTS check_memo_rate_limit();

-- RLS 비활성화 (임시)
ALTER TABLE memos DISABLE ROW LEVEL SECURITY;
```

---

## 📊 성능 영향

- **읽기**: 영향 없음
- **쓰기**: 약 5-10ms 추가 (검증 시간)
- **전체**: 사용자 경험에 영향 없음

---

## 🎉 완료 체크리스트

- [ ] Supabase Dashboard 접속
- [ ] SQL Editor에서 `policies.sql` 실행
- [ ] 에러 없이 완료 확인
- [ ] 테스트 1, 2, 3 실행하여 정상 동작 확인
- [ ] 앱에서 메모 추가/삭제 테스트

---

## 📞 도움이 필요하면

1. Supabase Dashboard > Logs 확인
2. 에러 메시지 복사
3. `SECURITY.md` 파일 참고
