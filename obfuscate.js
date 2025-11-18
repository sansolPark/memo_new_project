const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// 난독화할 파일 목록
const filesToObfuscate = [
    'public/script.js',
    'public/validation.js',
    'public/api-client.js',
    'public/delete-credits.js',
    'public/ad-modal.js',
    'api/memos.js',
    'api/validate.js'
];

// 난독화 옵션 (Vercel 빌드 최적화 - 빠른 버전)
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: false, // 빌드 속도 개선
    deadCodeInjection: false, // 빌드 속도 개선
    debugProtection: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    renameGlobals: false,
    selfDefending: false, // 빌드 속도 개선
    simplify: true,
    splitStrings: false, // 빌드 속도 개선
    stringArray: true,
    stringArrayEncoding: [], // 빌드 속도 개선
    stringArrayThreshold: 0.5,
    transformObjectKeys: false, // 빌드 속도 개선
    unicodeEscapeSequence: false
};

// 원본 파일 백업 및 난독화
filesToObfuscate.forEach(filePath => {
    try {
        // 원본 파일 읽기
        const originalCode = fs.readFileSync(filePath, 'utf8');
        
        // 백업 파일 생성
        const backupPath = filePath.replace('.js', '.original.js');
        fs.writeFileSync(backupPath, originalCode, 'utf8');
        console.log(`✓ Backed up: ${filePath} -> ${backupPath}`);
        
        // 난독화 실행
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(originalCode, obfuscationOptions).getObfuscatedCode();
        
        // 난독화된 코드 저장
        fs.writeFileSync(filePath, obfuscatedCode, 'utf8');
        console.log(`✓ Obfuscated: ${filePath}`);
        
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
    }
});

console.log('\n=== Obfuscation Complete ===');
console.log('Original files backed up with .original.js extension');
console.log('To restore: rename .original.js files back to .js');
