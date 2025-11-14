// 서버 측 검증 API 호출
async function validateWithServer(content) {
    try {
        const response = await fetch('/api/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content })
        });
        
        const result = await response.json();
        
        if (!result.valid) {
            const errorMessages = {
                'INVALID_CONTENT': window.i18n.t('notifyContentRequired'),
                'CONTENT_TOO_LONG': 'Content is too long',
                'BANNED_WORDS': window.i18n.t('notifyBannedWords'),
                'NUMBERS_NOT_ALLOWED': window.i18n.t('notifyNumbersNotAllowed')
            };
            
            return {
                isValid: false,
                message: errorMessages[result.error] || 'Validation failed'
            };
        }
        
        return { isValid: true };
    } catch (error) {
        console.error('Server validation error:', error);
        // 서버 오류 시 클라이언트 검증으로 폴백
        return { isValid: true };
    }
}

// 클라이언트 측 빠른 검증 (UX 개선용)
function quickValidate(content) {
    if (!content || content.length > 500) {
        return false;
    }
    return true;
}
