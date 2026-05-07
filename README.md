# 遊戲片追貨平台 — 部署說明

## 第一步：建立 Firebase 專案

1. 開啟 [https://console.firebase.google.com](https://console.firebase.google.com)
2. 點「建立專案」→ 輸入名稱（例如 `agm-tracking`）→ 建立
3. 左側選單 → **Realtime Database** → 「建立資料庫」
   - 選擇亞洲節點：`asia-southeast1`（新加坡，台灣最近）
   - 安全規則先選「**以測試模式啟動**」（之後再鎖定）
4. 左側 → **專案設定**（齒輪圖示）→ 「一般」→ 向下滾到「您的應用程式」
5. 點「新增應用程式」→ 選網頁（`</>`）→ 輸入暱稱 → 不勾 Firebase Hosting → 「註冊應用程式」
6. 複製 `firebaseConfig` 物件（格式如下）：

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "agm-tracking.firebaseapp.com",
  databaseURL: "https://agm-tracking-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agm-tracking",
  storageBucket: "agm-tracking.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## 第二步：填入設定到程式碼

在以下 **4 個檔案**中，找到 `FIREBASE_CONFIG` 區塊，把 `YOUR_*` 全部換成上面複製的值：

- `dealer.html`
- `logistics.html`
- `sales.html`
- `pm.html`

每個檔案裡找這段並替換：

```js
const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",          // ← 換成你的
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  databaseURL:       "https://YOUR_PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId:         "YOUR_PROJECT",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};
```

> **搜尋技巧**：用文字編輯器（VSCode / 記事本）開檔案，`Ctrl+H` 全部取代：
> - 找：`YOUR_API_KEY` → 換成你的 apiKey
> - 找：`YOUR_PROJECT` → 換成你的 projectId（出現多次，一次全換）

---

## 第三步：初始化資料庫資料

**首次部署必做**，把商品主檔和通路資料寫入 Firebase：

### 方法 A：透過 Firebase Console（最簡單）

1. 開啟 Firebase Console → Realtime Database
2. 點右上角「⋮」→「匯入 JSON」
3. 上傳 `seed_data.json`（如果有的話），或直接用方法 B

### 方法 B：瀏覽器 Console

1. 部署完畢後，用 `pm2025` 登入 PM 管理頁
2. 打開瀏覽器開發者工具（F12）→ Console 分頁
3. 貼入以下指令並執行：

```js
// 將 firebase.js 裡 DEFAULT_PRODUCTS 和 DEFAULT_DEALERS 的內容
// 貼到這裡執行，或直接在 Firebase Console 手動建立測試資料
firebase.database().ref('window').set({ open: true, week: '2025-W20' });
```

4. 之後商品和通路都可以透過 PM 管理頁的「商品管理」介面新增，不需要手動操作資料庫。

---

## 第四步：部署到 Netlify（推薦）

### 4a. Netlify Drop（拖曳上傳，最快）

1. 開啟 [app.netlify.com/drop](https://app.netlify.com/drop)
2. 把整個 `platform/` 資料夾拖進去
3. 等幾秒，拿到網址（例如 `https://random-name-123.netlify.app`）
4. 完成！

### 4b. 自訂網域（選用）

1. Netlify → 你的網站 → **Domain management** → Add domain
2. 按照指示設定 DNS

---

## 第五步：鎖定 Firebase 安全規則（正式上線前必做）

Firebase Console → Realtime Database → **規則** 分頁，把規則改成：

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": false
    },
    "dealers": {
      ".read": true,
      ".write": false
    },
    "window": {
      ".read": true,
      ".write": true
    },
    "orders": {
      ".read": true,
      ".write": true
    },
    "pmData": {
      ".read": true,
      ".write": true
    }
  }
}
```

> **說明**：目前規則是全開（測試用），正式上線前至少把 `products` 和 `dealers` 的 write 關掉，防止外部人員亂改主檔。
> 如果要更嚴格的控制，需要加入 Firebase Authentication，這屬於進階設定。

---

## 各角色使用方式

| 角色 | 入口 | 存取碼 |
|------|------|--------|
| 經銷商 | `dealer.html?code=WQ2025`（各通路代碼不同） | 無需密碼 |
| 業務 AGM | `index.html` → 選業務 | 無需密碼 |
| 後勤統計 | `index.html` → 選後勤統計 | `agm2025` |
| PM 管理 | `index.html` → 選 PM 管理 | `pm2025` |

### 取得各通路連結

1. 用 `pm2025` 登入 PM 管理
2. 點「📎 通路連結」頁籤
3. 點「複製全部連結」→ 貼到 Email 或 Line 傳給各業務
4. 業務再把各通路的連結傳給對應通路

---

## 常見問題

**Q: 換電腦還看得到資料嗎？**
A: 可以。資料存在 Firebase 雲端，任何裝置開啟連結都能看到。

**Q: 修改後需要重新上傳嗎？**
A: 需要。Netlify Drop 重新拖曳資料夾就會更新；或連結 GitHub 可以自動部署。

**Q: 免費方案有限制嗎？**
A: Firebase Realtime Database 免費方案：1GB 儲存 + 每月 10GB 流量，追貨系統用量遠低於上限。

**Q: 可以改密碼嗎？**
A: 目前密碼寫在 `index.html` 的 JS 裡，直接改 `agm2025` / `pm2025` 這兩個字串即可。
