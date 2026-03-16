# 整合測試說明

整合測試使用真實的 MongoDB，透過 Docker Compose 啟動。

## 執行方式

```bash
# 啟動 MongoDB
docker compose -f docker-compose.test.yml up -d

# 執行整合測試
npm run test:integration
```

## 測試案例

### 01_admin_mgr.test.ts - 管理員管理腳本
- 應該可以建立管理員帳號
- 建立後應該可以在資料庫中查詢到管理員
- 應該可以列出所有管理員
- 應該可以更新管理員電子郵件

### 02_user_mgr.test.ts - 使用者管理腳本
- 應該可以建立使用者帳號
- 建立後應該可以在資料庫中查詢到使用者
- 應該可以列出所有使用者

### 03_auth.test.ts - 認證 API
- 管理員應該可以成功登入
- 管理員密碼錯誤應該返回 401
- 使用者應該可以成功登入
- 使用者密碼錯誤應該返回 401

### 04_user_api.test.ts - 使用者 CRUD API
- 未授權應該無法取得使用者列表
- 管理員應該可以取得使用者列表
- 使用者應該可以修改自己的密碼
- 管理員應該可以刪除使用者
