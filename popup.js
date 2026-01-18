// YouTube Storage Access Fixer - Popup Script

document.addEventListener('DOMContentLoaded', () => {
    const toggleEnabled = document.getElementById('toggleEnabled');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const btnReload = document.getElementById('btnReload');

    // Get current status
    chrome.runtime.sendMessage({ action: 'getStatus' }, (response) => {
        if (response) {
            updateUI(response.enabled);
        }
    });

    // Toggle handler
    toggleEnabled.addEventListener('change', () => {
        chrome.runtime.sendMessage({ action: 'toggleEnabled' }, (response) => {
            if (response) {
                updateUI(response.enabled);
            }
        });
    });

    // Reload button handler
    btnReload.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.url?.includes('youtube.com')) {
                chrome.tabs.reload(currentTab.id);
                window.close();
            } else {
                // Find YouTube tab and reload it
                chrome.tabs.query({ url: '*://*.youtube.com/*' }, (ytTabs) => {
                    if (ytTabs.length > 0) {
                        chrome.tabs.reload(ytTabs[0].id);
                        window.close();
                    } else {
                        alert('No YouTube tab found!');
                    }
                });
            }
        });
    });

    function updateUI(enabled) {
        toggleEnabled.checked = enabled;

        if (enabled) {
            statusDot.classList.remove('disabled');
            statusText.textContent = 'Active';
            statusText.style.color = '#4CAF50';
        } else {
            statusDot.classList.add('disabled');
            statusText.textContent = 'Disabled';
            statusText.style.color = '#F44336';
        }
    }
});
