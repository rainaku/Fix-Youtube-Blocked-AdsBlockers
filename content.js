// YouTube Storage Access Fixer - Content Script
// Performance optimizations + Navigation handling

(function () {
  'use strict';

  const CONFIG = {
    DEBUG: false,
    ERROR_CHECK_INTERVAL: 1000,
    MAX_RETRIES: 2
  };

  const log = (...args) => CONFIG.DEBUG && console.log('[YT-Fixer]', ...args);

  let currentVideoId = null;
  let retryCount = 0;

  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  function isWatchPage() {
    return window.location.pathname === '/watch';
  }

  if (isWatchPage()) {
    currentVideoId = getVideoId();
  }

  // ============================================
  // 1. INSTANT NAVIGATION INTERCEPT
  // ============================================

  document.addEventListener('click', (e) => {
    if (!isWatchPage()) return;

    const link = e.target.closest('a[href*="/watch?v="], a[href*="/shorts/"]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    let newVideoId = null;

    if (href.includes('/watch?v=')) {
      const match = href.match(/[?&]v=([^&]+)/);
      newVideoId = match ? match[1] : null;
    } else if (href.includes('/shorts/')) {
      const match = href.match(/\/shorts\/([^?&/]+)/);
      newVideoId = match ? match[1] : null;
    }

    if (newVideoId && newVideoId !== currentVideoId) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      let fullUrl = href.startsWith('http') ? href : window.location.origin + href;
      window.location.href = fullUrl;
      return false;
    }
  }, true);

  // ============================================
  // 2. PERFORMANCE: LAZY LOAD SIDEBAR
  // ============================================

  function optimizeSidebar() {
    // Defer loading of non-critical sidebar content
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.dataset.src) {
            el.src = el.dataset.src;
            observer.unobserve(el);
          }
        }
      });
    }, { rootMargin: '200px' });

    document.querySelectorAll('#related img[data-src]').forEach(img => {
      observer.observe(img);
    });
  }

  // ============================================
  // 3. PERFORMANCE: REDUCE REPAINTS
  // ============================================

  function injectPerformanceCSS() {
    const style = document.createElement('style');
    style.id = 'yt-fixer-perf-css';
    style.textContent = `
      /* GPU acceleration */
      #movie_player,
      .html5-video-player,
      video {
        transform: translateZ(0);
        backface-visibility: hidden;
      }
      
      /* Contain layout calculations */
      #secondary,
      #related,
      #comments {
        contain: layout style paint;
      }
      
      /* Smoother animations */
      .ytp-chrome-bottom,
      .ytp-chrome-top {
        will-change: opacity;
      }
      
      /* Disable heavy effects */
      #cinematics,
      #cinematics-container {
        display: none !important;
      }
      
      /* Faster thumbnail hover */
      ytd-thumbnail:hover {
        transition-duration: 0.1s !important;
      }
      
      /* Reduce motion for performance */
      @media (prefers-reduced-motion: reduce) {
        * {
          animation-duration: 0.01ms !important;
          transition-duration: 0.01ms !important;
        }
      }
      
      /* Hide ads container */
      #player-ads,
      .video-ads,
      .ytp-ad-module,
      .ytp-ad-overlay-container {
        display: none !important;
      }
      
      /* Optimize scrolling */
      #content,
      ytd-watch-flexy {
        overflow-anchor: none;
      }
    `;

    if (!document.getElementById('yt-fixer-perf-css')) {
      document.head.appendChild(style);
    }
  }

  // ============================================
  // 4. PERFORMANCE: PAUSE HIDDEN VIDEOS
  // ============================================

  function handleVisibilityChange() {
    document.addEventListener('visibilitychange', () => {
      const video = document.querySelector('video.html5-main-video');
      if (!video) return;

      // Không tự động pause, nhưng giảm quality khi tab hidden
      if (document.hidden) {
        // Tab hidden - có thể giảm resource usage
      }
    });
  }

  // ============================================
  // 5. PREFETCH NEXT VIDEO
  // ============================================

  function prefetchNextVideo() {
    // Prefetch first related video thumbnail
    setTimeout(() => {
      const firstRelated = document.querySelector('#related ytd-compact-video-renderer a#thumbnail');
      if (firstRelated) {
        const href = firstRelated.getAttribute('href');
        if (href) {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = href;
          document.head.appendChild(link);
        }
      }
    }, 3000);
  }

  // ============================================
  // 6. BACKUP: SPA NAVIGATION HANDLER
  // ============================================

  let navigationPending = false;

  window.addEventListener('yt-navigate-start', () => {
    navigationPending = true;
  }, true);

  window.addEventListener('yt-navigate-finish', () => {
    if (!navigationPending) return;
    navigationPending = false;

    if (!isWatchPage()) {
      currentVideoId = null;
      return;
    }

    const newVideoId = getVideoId();

    if (currentVideoId && newVideoId && currentVideoId !== newVideoId) {
      window.location.reload();
    }

    currentVideoId = newVideoId;

    // Re-apply optimizations after navigation
    setTimeout(() => {
      injectPerformanceCSS();
      prefetchNextVideo();
    }, 500);
  }, true);

  // ============================================
  // 7. ERROR DETECTION
  // ============================================

  function checkForErrors() {
    const errorScreen = document.querySelector('.ytp-error');
    if (errorScreen && errorScreen.offsetParent !== null) {
      if (retryCount < CONFIG.MAX_RETRIES) {
        retryCount++;
        window.location.reload();
      }
    } else {
      retryCount = 0;
    }
  }

  setInterval(checkForErrors, CONFIG.ERROR_CHECK_INTERVAL);

  // ============================================
  // 8. MESSAGE HANDLER
  // ============================================

  if (chrome.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'forceReload') {
        window.location.reload();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  // ============================================
  // 9. INITIALIZE
  // ============================================

  function init() {
    injectPerformanceCSS();
    handleVisibilityChange();
    optimizeSidebar();

    if (isWatchPage()) {
      prefetchNextVideo();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  log('Content script loaded with performance optimizations');
})();
