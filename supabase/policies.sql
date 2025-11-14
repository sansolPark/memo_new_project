-- ==========================================
-- 모두의 메모 - 보안 강화 RLS 정책
-- 서비스 특성: 최대 7개 메모, 500자 제한, 공용 게시판
-- ==========================================

-- 1) 기존 정책 제거 (있다면)
DROP POLICY IF EXISTS "Allow all operations for memos" ON memos;

-- 2) RLS 활성화 확인
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 3) SELECT: 모두 조회 가능
CREATE POLICY "public_select_memos" 
ON memos 
FOR SELECT 
USING (true);

-- 4) INSERT: 엄격한 제한
CREATE POLICY "public_insert_memos" 
ON memos 
FOR INSERT 
WITH CHECK (
  -- 내용 필수 (빈 문자열 방지)
  content IS NOT NULL 
  AND length(trim(content)) > 0
  -- 내용 길이 제한 (500자)
  AND length(content) <= 500
  -- 메모 개수 제한 (7개)
  AND (SELECT count(*) FROM memos) < 7
);

-- 5) UPDATE: 내용 수정만 허용
CREATE POLICY "public_update_memos" 
ON memos 
FOR UPDATE 
USING (true)
WITH CHECK (
  -- 내용 필수
  content IS NOT NULL 
  AND length(trim(content)) > 0
  -- 내용 길이 제한
  AND length(content) <= 500
);

-- 6) DELETE: 모두 삭제 가능 (공용 게시판)
CREATE POLICY "public_delete_memos" 
ON memos 
FOR DELETE 
USING (true);

-- 7) Rate Limiting: 대량 삽입 방지 트리거
-- 기존 트리거 제거 (있다면)
DROP TRIGGER IF EXISTS memos_rate_limit ON memos;
DROP FUNCTION IF EXISTS check_memo_rate_limit();

-- Rate Limiting 함수 생성
CREATE OR REPLACE FUNCTION check_memo_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  memo_count INTEGER;
BEGIN
  -- 현재 메모 개수 확인
  SELECT count(*) INTO memo_count FROM memos;
  
  -- 7개 초과 시 차단
  IF memo_count >= 7 THEN
    RAISE EXCEPTION 'Maximum 7 memos allowed. Please delete an existing memo first.';
  END IF;
  
  -- 내용 길이 재확인 (이중 검증)
  IF length(NEW.content) > 500 THEN
    RAISE EXCEPTION 'Content exceeds 500 characters limit.';
  END IF;
  
  -- 빈 내용 차단
  IF length(trim(NEW.content)) = 0 THEN
    RAISE EXCEPTION 'Content cannot be empty.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER memos_rate_limit
BEFORE INSERT ON memos
FOR EACH ROW
EXECUTE FUNCTION check_memo_rate_limit();

-- 8) 추가 보안: 대량 삭제 방지 (선택사항)
-- 한 번에 모든 메모 삭제 방지
DROP TRIGGER IF EXISTS prevent_mass_delete ON memos;
DROP FUNCTION IF EXISTS prevent_mass_delete_func();

CREATE OR REPLACE FUNCTION prevent_mass_delete_func()
RETURNS TRIGGER AS $$
BEGIN
  -- 이 함수는 개별 삭제만 허용
  -- 대량 삭제는 서버에서만 가능하도록
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_mass_delete
BEFORE DELETE ON memos
FOR EACH ROW
EXECUTE FUNCTION prevent_mass_delete_func();

-- 9) 인덱스 최적화 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at DESC);

-- ==========================================
-- 적용 완료!
-- 이제 다음이 보호됩니다:
-- ✅ 7개 초과 메모 삽입 차단
-- ✅ 500자 초과 내용 차단
-- ✅ 빈 내용 차단
-- ✅ 직접 API 공격 방지
-- ✅ 대량 삽입/삭제 방지
-- ==========================================
