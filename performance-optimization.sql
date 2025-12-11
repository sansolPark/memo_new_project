-- 성능 최적화를 위한 데이터베이스 인덱스 추가
-- 이 파일을 Supabase SQL 에디터에서 실행하세요

-- 1. created_at 컬럼에 인덱스 추가 (정렬 성능 향상)
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at DESC);

-- 2. updated_at 컬럼에 인덱스 추가 (업데이트 성능 향상)
CREATE INDEX IF NOT EXISTS idx_memos_updated_at ON memos(updated_at DESC);

-- 3. 복합 인덱스 추가 (created_at과 id를 함께 사용하는 쿼리 최적화)
CREATE INDEX IF NOT EXISTS idx_memos_created_at_id ON memos(created_at DESC, id);

-- 4. 메모 개수 제한을 위한 트리거 함수 (성능 향상)
CREATE OR REPLACE FUNCTION check_memo_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM memos) >= 7 THEN
        RAISE EXCEPTION 'Maximum number of memos (7) reached';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. 트리거 생성 (INSERT 시에만 실행)
DROP TRIGGER IF EXISTS memo_limit_trigger ON memos;
CREATE TRIGGER memo_limit_trigger
    BEFORE INSERT ON memos
    FOR EACH ROW
    EXECUTE FUNCTION check_memo_limit();

-- 6. 테이블 통계 업데이트 (쿼리 플래너 최적화)
ANALYZE memos;

-- 7. 성능 모니터링을 위한 뷰 생성
CREATE OR REPLACE VIEW memo_stats AS
SELECT 
    COUNT(*) as total_memos,
    MAX(created_at) as latest_memo,
    MIN(created_at) as oldest_memo,
    AVG(LENGTH(content)) as avg_content_length
FROM memos;

-- 실행 완료 메시지
SELECT 'Database performance optimization completed!' as status;