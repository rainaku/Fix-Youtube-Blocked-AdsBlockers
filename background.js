// YouTube Performance Optimizer - Background Service Worker

// ============================================
// Manifest V3 sử dụng declarativeNetRequest (rules.json)
// Background chỉ xử lý UI và messages
// ============================================

// HANDLE EXTENSION ICON CLICK
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get(['enabled'], (result) => {
        const newState = !(result.enabled ?? true);
        chrome.storage.local.set({ enabled: newState });

        chrome.action.setBadgeText({
            text: newState ? 'ON' : 'OFF',
            tabId: tab.id
        });

        chrome.action.setBadgeBackgroundColor({
            color: newState ? '#4CAF50' : '#F44336',
            tabId: tab.id
        });
    });
});

// INITIAL SETUP
chrome.runtime.onInstalled.addListener(() => {
    console.log('[YT-Optimizer] Extension installed');
    chrome.storage.local.set({ enabled: true });
});

// MESSAGE HANDLER
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getStatus') {
        chrome.storage.local.get(['enabled'], (result) => {
            sendResponse({ enabled: result.enabled ?? true });
        });
        return true;
    }

    if (message.action === 'toggleEnabled') {
        chrome.storage.local.get(['enabled'], (result) => {
            const newState = !result.enabled;
            chrome.storage.local.set({ enabled: newState }, () => {
                sendResponse({ enabled: newState });
            });
        });
        return true;
    }
});

// UPDATE BADGE ON TAB LOAD
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com')) {
        chrome.storage.local.get(['enabled'], (result) => {
            if (result.enabled) {
                chrome.action.setBadgeText({ text: 'ON', tabId });
                chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId });
            }
        });
    }
});

console.log('[YT-Optimizer] Background service worker loaded');
