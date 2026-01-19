# YouTube Storage Access Fixer

A lightweight Chrome extension that bypasses Storage Access API restrictions and boosts YouTube performance - fix "Không xem được nội dung này" errors instantly!

## Features

- **Bypass Storage Access API** - Fix "Permission denied" errors on YouTube
- **Instant Navigation** - Click videos without reload delay 
- **Performance Boost** - Preconnect servers, block tracking, GPU acceleration
- **Block Ads/Tracking** - Remove Google Analytics, DoubleClick, ad requests
- **Auto-Retry** - Automatically reload when video errors detected
- **Memory Optimization** - Cleanup unused thumbnails, reduce repaints
- **Lightweight & Fast** - Minimal performance impact, no background lag

## Installation

### Chrome/Edge/Brave (Developer Mode)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top right)
4. Click **Load unpacked**
5. Select the `AX` folder
6. Done! Navigate to YouTube and enjoy smooth playback

## Usage

### Automatic Mode (Default)
1. Install the extension
2. Navigate to any YouTube video
3. Extension works automatically - no configuration needed
4. Click between videos seamlessly without errors

### Extension Popup
1. Click the extension icon in your browser toolbar
2. Toggle the main switch to enable/disable
3. Click "Reload YouTube Tab" to force refresh

## Performance Optimizations

| Feature | Description |
|---------|-------------|
| **Preconnect Servers** | Pre-establish connections to YouTube CDN servers |
| **GPU Acceleration** | CSS transforms for smooth video rendering |
| **Block Tracking** | Remove analytics/ads requests (faster loading) |
| **Layout Containment** | Isolate repaints to minimize thrashing |
| **Prefetch Videos** | Load next video in background |
| **Disable Ambient Mode** | Remove cinema glow effect (reduces lag) |

## Blocked Requests

The extension blocks these unnecessary requests:

| Domain | Type |
|--------|------|
| `youtube.com/api/stats/*` | Tracking |
| `google-analytics.com/*` | Analytics |
| `doubleclick.net/*` | Ads |
| `googleadservices.com/*` | Ads |
| `googlesyndication.com/*` | Ads |
| `youtube.com/pagead/*` | Page Ads |
| `youtube.com/ptracking*` | Player Tracking |

## Project Structure

```
AX/
├── manifest.json       # Extension manifest (MV3)
├── inject.js           # Page context script (MAIN world)
├── content.js          # Content script (navigation + performance)
├── background.js       # Service worker
├── rules.json          # Declarative Net Request rules
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## How It Works

### Storage Access Bypass
```
YouTube calls requestStorageAccessFor()
         ↓
Extension intercepts in MAIN world
         ↓
Returns Promise.resolve() immediately
         ↓
No "Permission denied" error ✓
```

### Navigation Fix
```
User clicks video B
         ↓
Extension intercepts click (capture phase)
         ↓
preventDefault() + direct navigation
         ↓
Page loads fresh → Video plays ✓
```

## Troubleshooting

### Video still showing error?
1. Make sure extension is enabled (check badge shows "ON")
2. Try clicking "Reload YouTube Tab" in popup
3. Disable other ad blockers temporarily (may conflict)
4. Clear YouTube cookies and refresh

### Extension not working?
1. Go to `chrome://extensions/`
2. Find "YouTube Storage Access Fixer"
3. Click the reload button (🔄)
4. Refresh YouTube page

### Buttons/popup not appearing?
1. Make sure you're on `youtube.com`
2. Try disabling and re-enabling the extension
3. Check if Developer mode is still enabled

## Permissions

| Permission | Reason |
|------------|--------|
| `storage` | Save extension state (ON/OFF) |
| `scripting` | Inject scripts into YouTube pages |
| `declarativeNetRequest` | Block tracking/ad requests |
| `host_permissions` | Access YouTube and Google CDN domains |

## License

MIT License - Free to use and modify

---

## Changelog

### v1.0.2 (2026-01-19) - Major Bug Fixes

#### 🐛 Bug Fixes

**1. Fix video không load khi click từ trang chủ/kênh YouTube**
- **Vấn đề**: Click video từ trang chủ (`youtube.com`) hoặc trang kênh (`youtube.com/@channel`) bị chặn, video không phát được
- **Nguyên nhân**: Content script đang intercept click events và chặn YouTube SPA navigation
- **Giải pháp**: Loại bỏ click interceptor, thay bằng auto-reload khi navigate đến video mới

**2. Fix lỗi loop reload vô hạn khi vào trang kênh**
- **Vấn đề**: Khi vào trang kênh, trang liên tục reload không dừng
- **Nguyên nhân**: SPA navigation handler gọi `window.location.reload()` mỗi khi URL thay đổi
- **Giải pháp**: Thay đổi logic chỉ reload khi navigate đến video mới, không reload khi navigate trong kênh

**3. Fix "Không xem được nội dung này" error**
- **Vấn đề**: Video hiển thị lỗi "Không xem được nội dung này. Vui lòng thử lại sau."
- **Nguyên nhân**: 
  - XHR interceptor trong `inject.js` block YouTube API requests
  - `rules.json` block quá nhiều endpoints quan trọng
  - `background.js` dùng deprecated webRequest API (MV3 không hỗ trợ)
- **Giải pháp**: 
  - Loại bỏ XHR/fetch interception
  - Đơn giản hóa blocking rules chỉ block ads domains
  - Remove deprecated webRequest code

#### 🔧 Technical Changes

| File | Changes |
|------|---------|
| `content.js` | Thay click interceptor bằng MutationObserver để detect URL changes và auto-reload |
| `inject.js` | Loại bỏ XHR/fetch interception, chỉ giữ performance CSS và Storage Access bypass |
| `background.js` | Remove deprecated webRequest blocking (MV3 dùng declarativeNetRequest) |
| `rules.json` | Đơn giản hóa, chỉ block ads domains (doubleclick, googleads, etc.) |
| `manifest.json` | Loại bỏ declarativeNetRequest (tạm thời), set `all_frames: false` |

#### ⚡ Logic mới cho video navigation

```javascript
// Khi URL thay đổi trong YouTube SPA:
isGoingToVideo = URL mới là /watch hoặc /shorts
wasNotOnVideo = URL cũ KHÔNG phải video (trang chủ, kênh, search)
isDifferentVideo = Video ID khác nhau

// Reload khi:
if (isGoingToVideo && (wasNotOnVideo || isDifferentVideo)) {
    window.location.reload();
}
```

**Các trường hợp sẽ auto-reload:**
- ✅ Trang chủ → Video
- ✅ Trang kênh → Video  
- ✅ Trang search → Video
- ✅ Video A → Video B (khác video)
- ❌ Video → Video (cùng video) - không reload

---

### v1.0.1 - Initial Release

- Storage Access API bypass
- Performance optimizations (GPU acceleration, preconnect)
- Ad/tracking blocking via declarativeNetRequest
- Auto-retry on video errors
