# 前端頁面說明

## 公開頁面

### / - 首頁
- Hero Banner（藍色漸層背景，顯示歡迎標題與副標題）
- 6 個功能特點卡片（響應式 Grid 佈局：手機 1 欄、平板 2 欄、桌機 3 欄）
- SiteHeader（包含登入/登出功能）

### /profile - 使用者個人資料頁
- 需登入方可存取，未登入自動跳回首頁
- 顯示使用者資訊（username、email）
- 修改密碼表單（需輸入目前密碼、新密碼、確認新密碼）
- 密碼修改成功後自動登出並返回首頁

## 管理後台（/admin/*）

> 未登入時自動重導向至 /admin/login

### /admin/login - 管理員登入
- 登入表單（username + password）
- 登入成功後跳至 /admin/users

### /admin - 管理後台首頁
- 自動重導向至 /admin/users

### /admin/users - 使用者管理
- Dashboard 佈局（左側 Sider + 主內容區）
- 使用者列表（Ant Design Table）
- 支援分頁（每頁 10 筆，顯示總筆數）
- 新增按鈕 → 開啟 Modal，內含新增使用者表單
- 編輯按鈕 → 開啟 Modal，內含編輯表單（可修改 email 或密碼）
- 刪除按鈕 → 彈出確認框後執行刪除
- 左側 Sider 含「儀表板」與「使用者管理」連結

## 元件說明

### SiteHeader (`src/components/SiteHeader.tsx`)
網站頂部導覽列，包含：
- Logo 文字
- 未登入：顯示「登入」按鈕，點擊開啟 LoginForm Modal
- 已登入：顯示 username（點擊跳至 /profile）+ 「登出」按鈕

### LoginForm (`src/components/LoginForm.tsx`)
使用者登入表單元件（獨立檔案），包含：
- 使用者名稱輸入欄
- 密碼輸入欄
- 登入按鈕（含 loading 狀態）
- 錯誤提示

### UserAuthProvider (`src/components/UserAuthProvider.tsx`)
React Context Provider，管理使用者登入狀態：
- 提供 `user`、`accessToken`、`login`、`logout` 給子元件使用
- 自動從 localStorage 恢復登入狀態
