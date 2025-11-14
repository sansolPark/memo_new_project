const fs = require('fs');
const path = require('path');

// 복원할 파일 목록
const filesToRestore = [
    'public/script.js',
    'public/validation.js',
    'public/api-client.js',
    'api/memos.js',
    'api/validate.js'
];

console.log('=== Restoring Original Files ===\n');

filesToRestore.forEach(filePath => {
    const backupPath = filePath.replace('.js', '.original.js');
    
    try {
        if (fs.existsSync(backupPath)) {
            const originalCode = fs.readFileSync(backupPath, 'utf8');
            fs.writeFileSync(filePath, originalCode, 'utf8');
            console.log(`✓ Restored: ${filePath}`);
        } else {
            console.log(`⚠ No backup found for: ${filePath}`);
        }
    } catch (error) {
        console.error(`✗ Error restoring ${filePath}:`, error.message);
    }
});

console.log('\n=== Restoration Complete ===');
