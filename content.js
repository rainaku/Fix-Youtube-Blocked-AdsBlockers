// YouTube Performance Optimizer - Content Script

(function () {
  'use strict';

  // ============================================
  // 1. FORCE RELOAD ON VIDEO NAVIGATION
  // Force reload khi click vào video từ bất kỳ trang nào
  // ============================================

  let lastUrl = window.location.href;

  // Detect URL changes (YouTube SPA navigation)
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      const newUrl = window.location.href;
      const oldUrl = lastUrl;
      lastUrl = newUrl;

      // Nếu đang navigate đến video (watch hoặc shorts)
      const isGoingToVideo = newUrl.includes('/watch?') || newUrl.includes('/shorts/');

      // Nếu từ trang không phải video, hoặc sang video khác
      const wasNotOnVideo = !oldUrl.includes('/watch?') && !oldUrl.includes('/shorts/');
      const isDifferentVideo = getVideoId(oldUrl) !== getVideoId(newUrl);

      if (isGoingToVideo && (wasNotOnVideo || isDifferentVideo)) {
        // Force reload để video load đúng
        window.location.reload();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  function getVideoId(url) {
    try {
      const urlObj = new URL(url);
      if (url.includes('/watch?')) {
        return urlObj.searchParams.get('v');
      } else if (url.includes('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1]?.split('?')[0];
      }
    } catch (e) { }
    return null;
  }

  // ============================================
  // 2. PERFORMANCE CSS
  // ============================================

  function injectPerformanceCSS() {
    if (document.getElementById('yt-optimizer-css')) return;

    const style = document.createElement('style');
    style.id = 'yt-optimizer-css';
    style.textContent = `
            /* GPU acceleration */
            #movie_player, .html5-video-player, video {
                transform: translateZ(0);
                backface-visibility: hidden;
            }
            
            /* Contain layout calculations */
            #secondary, #related, #comments {
                contain: layout style paint;
            }
            
            /* Disable heavy effects */
            #cinematics, #cinematics-container {
                display: none !important;
            }
            
            /* Hide ads */
            #player-ads, .video-ads, .ytp-ad-module, .ytp-ad-overlay-container {
                display: none !important;
            }
            
            /* Faster thumbnail hover */
            ytd-thumbnail:hover {
                transition-duration: 0.1s !important;
            }
        `;
    document.head.appendChild(style);
  }

  // ============================================
  // 3. INITIALIZE
  // ============================================

  function init() {
    injectPerformanceCSS();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.log('[YT-Optimizer] Content script loaded');
})();
