# 環境變數說明

請複製 `.env.example` 為 `.env.local` 並依照專案需求填入：

| 變數名稱 | 說明 | 預設值 |
|----------|------|--------|
| `MONGODB_URI` | MongoDB 連線字串 | `mongodb://localhost:27017` |
| `MONGODB_DB_NAME` | MongoDB 資料庫名稱 | `next-test` |
| `JWT_SECRET` | JWT Access Token 簽名密鑰 | `dev-jwt-secret`（⚠️ 生產環境必須修改） |
| `JWT_REFRESH_SECRET` | JWT Refresh Token 簽名密鑰 | `dev-jwt-refresh-secret`（⚠️ 生產環境必須修改） |
| `JWT_EXPIRY` | Access Token 有效期 | `15m` |
| `JWT_REFRESH_EXPIRY` | Refresh Token 有效期 | `7d` |
| `NEXT_PUBLIC_API_URL` | API 基礎 URL（前端使用） | `http://localhost:3000` |

## 整合測試環境變數

整合測試使用 `.env.test` 或直接在 docker-compose 中設定。

| 變數名稱 | 說明 | 預設值 |
|----------|------|--------|
| `MONGODB_URI` | 測試用 MongoDB 連線字串 | `mongodb://localhost:27018` |
| `MONGODB_DB_NAME` | 測試資料庫名稱 | `next-test-integration` |
| `NEXT_PUBLIC_API_URL` | 測試 API URL | `http://localhost:3000` |

> 注意：整合測試使用 port **27018** 以避免與開發環境（port 27017）衝突。

## 安全注意事項

- **`JWT_SECRET`** 與 **`JWT_REFRESH_SECRET`** 在生產環境中必須設定為強隨機字串
- 切勿將 `.env.local` 或 `.env` 提交到版本控制
- 建議使用至少 32 字元的隨機字串作為 JWT 密鑰
