-- 메모 테이블 생성
CREATE TABLE memos (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '제목 없음',
    content TEXT NOT NULL DEFAULT '내용 없음',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 메모를 읽고 쓸 수 있도록 정책 설정
CREATE POLICY "Allow all operations for memos" ON memos
    FOR ALL USING (true)
    WITH CHECK (true);

-- updated_at 컬럼을 자동으로 업데이트하는 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 컬럼 자동 업데이트를 위한 트리거
CREATE TRIGGER update_memos_updated_at 
    BEFORE UPDATE ON memos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 샘플 데이터 삽입 (선택사항)
INSERT INTO memos (title, content) VALUES 
    ('환영합니다!', '메모 앱에 오신 것을 환영합니다. 이곳에서 생각과 아이디어를 기록하세요.'),
    ('사용법', '제목과 내용을 입력하고 "메모 추가" 버튼을 클릭하세요. 수정과 삭제도 가능합니다.');
