// Clear all recordings from localStorage
// Run this script in the browser's developer console on the BusyBee app

// Clear recordings from localStorage
localStorage.removeItem('recordings');

// Verify clearing
const remainingRecordings = localStorage.getItem('recordings');
if (!remainingRecordings) {
    console.log('✅ All recordings have been cleared from localStorage');
} else {
    console.log('❌ Recordings still exist:', JSON.parse(remainingRecordings));
}

// Alternative: Clear all localStorage data for the app
// localStorage.clear(); // Uncomment this line to clear ALL app data

console.log('Recordings cleared. Refresh the page to see the empty state.');