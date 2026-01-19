// YouTube Performance Optimizer - Inject Script
// Chạy trong MAIN world - Chỉ tối ưu, KHÔNG can thiệp navigation

(function () {
    'use strict';

    if (window.__YT_OPTIMIZER_LOADED__) return;
    window.__YT_OPTIMIZER_LOADED__ = true;

    // ============================================
    // 1. STORAGE ACCESS API BYPASS
    // ============================================

    try {
        document.requestStorageAccess = () => Promise.resolve();
        document.hasStorageAccess = () => Promise.resolve(true);
        if (document.requestStorageAccessFor) {
            document.requestStorageAccessFor = () => Promise.resolve();
        }
    } catch (e) { }

    // ============================================
    // 2. SUPPRESS ADS/TRACKING ERRORS IN CONSOLE
    // ============================================

    const originalConsoleError = console.error;
    console.error = function (...args) {
        const message = args.join(' ');
        if (message.includes('requestStorageAccess') ||
            message.includes('ERR_BLOCKED_BY_CLIENT') ||
            message.includes('doubleclick') ||
            message.includes('googleads')) {
            return; // Suppress
        }
        originalConsoleError.apply(console, args);
    };

    // ============================================
    // 3. PRECONNECT TO VIDEO SERVERS
    // ============================================

    const preconnectUrls = [
        'https://i.ytimg.com',
        'https://yt3.ggpht.com',
        'https://www.gstatic.com'
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
    // 4. PERFORMANCE CSS
    // ============================================

    function injectPerformanceCSS() {
        if (document.getElementById('yt-optimizer-css')) return;

        const style = document.createElement('style');
        style.id = 'yt-optimizer-css';
        style.textContent = `
            /* Disable ambient mode (gây lag) */
            #cinematics, #cinematics-container {
                display: none !important;
            }
            
            /* GPU acceleration */
            #movie_player, .html5-video-player, video {
                transform: translateZ(0);
                will-change: transform;
            }
            
            /* Contain layout */
            #secondary, #related, #comments {
                contain: layout style;
            }
            
            /* Hide ads */
            #player-ads, .video-ads, .ytp-ad-module, .ytp-ad-overlay-container {
                display: none !important;
            }
            
            /* Faster transitions */
            .ytp-chrome-bottom {
                transition-duration: 0.1s !important;
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // 5. OPTIMIZE PLAYER (sau khi load)
    // ============================================

    function optimizePlayer() {
        const player = document.getElementById('movie_player');
        if (!player) return;

        try {
            // Disable annotations
            if (player.unloadModule) {
                player.unloadModule('annotations_module');
            }

            // Optimize video element
            const video = player.querySelector('video');
            if (video) {
                video.preload = 'auto';
            }
        } catch (e) { }
    }

    // ============================================
    // 6. INITIALIZE
    // ============================================

    function init() {
        injectPerformanceCSS();

        // Wait for player
        let attempts = 0;
        const checkPlayer = setInterval(() => {
            attempts++;
            if (document.getElementById('movie_player')) {
                optimizePlayer();
                clearInterval(checkPlayer);
            }
            if (attempts > 20) {
                clearInterval(checkPlayer);
            }
        }, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    console.log('[YT-Optimizer] Loaded');
})();
