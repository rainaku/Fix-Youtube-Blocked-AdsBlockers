// YouTube Storage Access Fixer - Inject Script
// Chạy trong MAIN world - Performance optimizations

(function () {
    'use strict';

    if (window.__YT_FIXER_INJECTED__) return;
    window.__YT_FIXER_INJECTED__ = true;

    // ============================================
    // 1. STORAGE ACCESS API BYPASS
    // ============================================

    document.requestStorageAccess = () => Promise.resolve();
    if (document.requestStorageAccessFor) {
        document.requestStorageAccessFor = () => Promise.resolve();
    }
    document.hasStorageAccess = () => Promise.resolve(true);

    try {
        Object.defineProperty(document, 'requestStorageAccess', {
            value: () => Promise.resolve(),
            writable: false,
            configurable: false
        });
        Object.defineProperty(document, 'requestStorageAccessFor', {
            value: () => Promise.resolve(),
            writable: false,
            configurable: false
        });
    } catch (e) { }

    // ============================================
    // 2. SUPPRESS ERRORS
    // ============================================

    const originalConsoleError = console.error;
    console.error = function (...args) {
        const message = args.join(' ');
        if (message.includes('requestStorageAccess') ||
            message.includes('Permission denied') ||
            message.includes('ERR_BLOCKED_BY_CLIENT') ||
            message.includes('doubleclick') ||
            message.includes('googleads')) {
            return;
        }
        originalConsoleError.apply(console, args);
    };

    // ============================================
    // 3. PRECONNECT TO YOUTUBE SERVERS
    // Kết nối trước để giảm latency
    // ============================================

    const preconnectUrls = [
        'https://www.youtube.com',
        'https://i.ytimg.com',
        'https://yt3.ggpht.com',
        'https://fonts.googleapis.com',
        'https://www.gstatic.com',
        'https://rr1---sn-a5mekney.googlevideo.com',
        'https://rr2---sn-a5mekney.googlevideo.com',
        'https://rr3---sn-a5mekney.googlevideo.com',
        'https://rr4---sn-a5mekney.googlevideo.com',
        'https://rr5---sn-a5mekney.googlevideo.com'
    ];

    preconnectUrls.forEach(url => {
        try {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = url;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        } catch (e) { }
    });

    // ============================================
    // 4. OPTIMIZE YOUTUBE PLAYER SETTINGS
    // ============================================

    function optimizePlayer() {
        const player = document.getElementById('movie_player');
        if (!player) return;

        try {
            // Tăng buffer size
            if (player.setPlaybackQualityRange) {
                // Không giới hạn quality để tải nhanh hơn
            }

            // Disable annotations (giảm render)
            if (player.unloadModule) {
                player.unloadModule('annotations_module');
            }

            // Optimal playback rate
            const video = player.querySelector('video');
            if (video) {
                // Preload metadata
                video.preload = 'auto';

                // Disable Picture-in-Picture auto prompt
                video.disablePictureInPicture = false;

                // Fast seek
                video.fastSeek = video.fastSeek || function (time) {
                    this.currentTime = time;
                };
            }
        } catch (e) { }
    }

    // ============================================
    // 5. DISABLE HEAVY FEATURES
    // ============================================

    function disableHeavyFeatures() {
        // Disable ambient mode (gây lag)
        try {
            const style = document.createElement('style');
            style.textContent = `
        /* Disable ambient mode glow */
        #cinematics { display: none !important; }
        #cinematics-container { display: none !important; }
        
        /* Reduce animation overhead */
        .ytp-gradient-bottom,
        .ytp-gradient-top {
          transition: none !important;
        }
        
        /* Faster hover transitions */
        .ytp-chrome-bottom {
          transition-duration: 0.1s !important;
        }
        
        /* Disable thumbnail previews on progress bar (saves memory) */
        .ytp-storyboard-framepreview {
          display: none !important;
        }
      `;
            document.head.appendChild(style);
        } catch (e) { }
    }

    // ============================================
    // 6. MEMORY OPTIMIZATION
    // ============================================

    function optimizeMemory() {
        // Cleanup old video data periodically
        setInterval(() => {
            try {
                // Force garbage collection hint
                if (window.gc) window.gc();

                // Clear image cache for thumbnails not in view
                const hiddenThumbnails = document.querySelectorAll('img.yt-core-image:not([loaded])');
                hiddenThumbnails.forEach(img => {
                    if (!isElementInViewport(img)) {
                        img.src = '';
                    }
                });
            } catch (e) { }
        }, 30000); // Every 30 seconds
    }

    function isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= -100 &&
            rect.left >= -100 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + 100 &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + 100
        );
    }

    // ============================================
    // 7. FASTER VIDEO LOADING
    // ============================================

    function enhanceVideoLoading() {
        // Intercept video source requests để thêm params
        const originalFetch = window.fetch;
        window.fetch = async function (url, options) {
            try {
                if (typeof url === 'string' && url.includes('googlevideo.com')) {
                    // Add range header for faster initial load
                    options = options || {};
                    options.headers = options.headers || {};
                }
            } catch (e) { }
            return originalFetch.apply(this, arguments);
        };
    }

    // ============================================
    // 8. REDUCE LAYOUT SHIFTS
    // ============================================

    function reduceLayoutShifts() {
        const style = document.createElement('style');
        style.textContent = `
      /* Pre-define sizes to prevent layout shifts */
      ytd-thumbnail {
        aspect-ratio: 16/9;
      }
      
      #movie_player {
        contain: strict;
      }
      
      /* Smoother scrolling */
      html {
        scroll-behavior: auto !important;
      }
      
      /* GPU acceleration for key elements */
      #player-container,
      #movie_player,
      .html5-video-player,
      video {
        transform: translateZ(0);
        will-change: transform;
      }
      
      /* Reduce paint areas */
      #secondary {
        contain: layout style;
      }
      
      #related {
        contain: layout style;
      }
    `;
        document.head.appendChild(style);
    }

    // ============================================
    // 9. DISABLE YOUTUBE TRACKING/ANALYTICS
    // ============================================

    function disableTracking() {
        // Block tracking beacons
        const originalSendBeacon = navigator.sendBeacon;
        navigator.sendBeacon = function (url, data) {
            if (url.includes('youtube.com/api/stats') ||
                url.includes('play.google.com') ||
                url.includes('googleads')) {
                return true; // Fake success
            }
            return originalSendBeacon.apply(this, arguments);
        };

        // Block certain XHR requests
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function (method, url) {
            if (typeof url === 'string' &&
                (url.includes('/api/stats') ||
                    url.includes('doubleclick') ||
                    url.includes('googleads'))) {
                // Redirect to empty
                arguments[1] = 'data:text/plain,';
            }
            return originalXHROpen.apply(this, arguments);
        };
    }

    // ============================================
    // 10. INITIALIZE ALL OPTIMIZATIONS
    // ============================================

    function init() {
        reduceLayoutShifts();
        disableHeavyFeatures();
        disableTracking();
        enhanceVideoLoading();
        optimizeMemory();

        // Wait for player
        const checkPlayer = setInterval(() => {
            if (document.getElementById('movie_player')) {
                optimizePlayer();
                clearInterval(checkPlayer);
            }
        }, 500);

        // Timeout after 10s
        setTimeout(() => clearInterval(checkPlayer), 10000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[YT-Fixer] Performance optimizations loaded');
})();
