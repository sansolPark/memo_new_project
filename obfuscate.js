const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// 난독화할 파일 목록
const filesToObfuscate = [
    'public/script.js',
    'public/validation.js',
    'public/api-client.js'
];

// 난독화 옵션
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false, // 개발 중에는 false
    debugProtectionInterval: 0,
    disableConsoleOutput: false, // 로그 필요시 false
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
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
