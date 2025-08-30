// ============================================
// CLEAR ALL RECORDINGS FROM VIBEBEE APP
// ============================================
// Run this script in the browser's developer console

console.log('🧹 Starting complete recordings cleanup...\n');

// 1. Clear recordings from localStorage
const recordingsCleared = localStorage.getItem('recordings');
if (recordingsCleared) {
    const count = JSON.parse(recordingsCleared).length;
    localStorage.removeItem('recordings');
    console.log(`✅ Cleared ${count} recording(s) from localStorage`);
} else {
    console.log('ℹ️  No recordings found in localStorage');
}

// 2. Clear any cached audio blobs
const keys = Object.keys(localStorage);
let audioClearedCount = 0;
keys.forEach(key => {
    if (key.includes('audio') || key.includes('recording') || key.includes('transcript') || key.includes('summary')) {
        localStorage.removeItem(key);
        audioClearedCount++;
    }
});
if (audioClearedCount > 0) {
    console.log(`✅ Cleared ${audioClearedCount} audio-related item(s) from localStorage`);
}

// 3. Clear session storage as well
const sessionKeys = Object.keys(sessionStorage);
let sessionClearedCount = 0;
sessionKeys.forEach(key => {
    if (key.includes('audio') || key.includes('recording') || key.includes('transcript') || key.includes('summary')) {
        sessionStorage.removeItem(key);
        sessionClearedCount++;
    }
});
if (sessionClearedCount > 0) {
    console.log(`✅ Cleared ${sessionClearedCount} item(s) from sessionStorage`);
}

// 4. Clear IndexedDB if used (for larger audio files)
if (window.indexedDB) {
    const databases = ['vibebee-recordings', 'recordings', 'audio-storage'];
    databases.forEach(dbName => {
        const deleteReq = indexedDB.deleteDatabase(dbName);
        deleteReq.onsuccess = () => console.log(`✅ Cleared IndexedDB: ${dbName}`);
        deleteReq.onerror = () => console.log(`ℹ️  No IndexedDB found: ${dbName}`);
    });
}

// 5. Summary
console.log('\n====================================');
console.log('🎉 All recordings have been cleared!');
console.log('====================================');
console.log('The page will refresh in 2 seconds...');

// 6. Refresh the page to show empty state
setTimeout(() => {
    location.reload();
}, 2000);

// Alternative: Complete nuclear option - clear EVERYTHING
// WARNING: This will clear ALL app data including settings
/*
console.log('\n⚠️  To clear EVERYTHING (including settings), run:');
console.log('localStorage.clear(); sessionStorage.clear(); location.reload();');
*/