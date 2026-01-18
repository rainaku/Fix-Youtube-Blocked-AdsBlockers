// YouTube Storage Access Fixer - Background Service Worker

// ============================================
// 1. MODIFY REQUEST HEADERS
// ============================================

chrome.webRequest?.onBeforeSendHeaders?.addListener(
    (details) => {
        // Add headers to bypass some restrictions
        const headers = details.requestHeaders || [];

        // Remove Sec-Fetch-Site header that might cause issues
        const filteredHeaders = headers.filter(header =>
            !['sec-fetch-site', 'sec-fetch-mode'].includes(header.name.toLowerCase())
        );

        return { requestHeaders: filteredHeaders };
    },
    { urls: ['*://*.youtube.com/*', '*://*.googlevideo.com/*'] },
    ['blocking', 'requestHeaders', 'extraHeaders']
);

// ============================================
// 2. MODIFY RESPONSE HEADERS
// ============================================

chrome.webRequest?.onHeadersReceived?.addListener(
    (details) => {
        const headers = details.responseHeaders || [];

        // Remove restrictive headers
        const filteredHeaders = headers.filter(header => {
            const name = header.name.toLowerCase();
            return !['x-frame-options', 'content-security-policy'].includes(name);
        });

        // Add permissive CORS headers
        filteredHeaders.push({
            name: 'Access-Control-Allow-Origin',
            value: '*'
        });

        return { responseHeaders: filteredHeaders };
    },
    { urls: ['*://*.youtube.com/*', '*://*.googlevideo.com/*'] },
    ['blocking', 'responseHeaders', 'extraHeaders']
);

// ============================================
// 3. HANDLE EXTENSION ICON CLICK
// ============================================

chrome.action.onClicked.addListener((tab) => {
    // Toggle extension state if needed
    chrome.storage.local.get(['enabled'], (result) => {
        const newState = !(result.enabled ?? true);
        chrome.storage.local.set({ enabled: newState });

        // Update icon badge
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

// ============================================
// 4. INITIAL SETUP
// ============================================

chrome.runtime.onInstalled.addListener(() => {
    console.log('[YT-Fixer] Extension installed');

    // Set default state
    chrome.storage.local.set({ enabled: true });
});

// ============================================
// 5. MESSAGE HANDLER
// ============================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getStatus') {
        chrome.storage.local.get(['enabled'], (result) => {
            sendResponse({ enabled: result.enabled ?? true });
        });
        return true; // Keep channel open for async response
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

    if (message.action === 'reloadTab') {
        chrome.tabs.reload(sender.tab.id);
        sendResponse({ success: true });
    }
});

// ============================================
// 6. TAB UPDATE LISTENER
// ============================================

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

console.log('[YT-Fixer] Background service worker loaded');
