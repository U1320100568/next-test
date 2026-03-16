# MongoDB Collections

## user

一般使用者資料集合。

| 欄位 | 類型 | 說明 |
|------|------|------|
| _id | ObjectId | 主鍵（MongoDB 自動生成） |
| username | String | 使用者名稱（唯一） |
| email | String | 電子郵件（唯一） |
| password | String | bcrypt 雜湊後的密碼 |
| createdAt | Date | 建立時間（自動） |
| updatedAt | Date | 更新時間（自動） |

**索引：** username（唯一）、email（唯一）

## admin_user

管理後台使用者資料集合。

| 欄位 | 類型 | 說明 |
|------|------|------|
| _id | ObjectId | 主鍵（MongoDB 自動生成） |
| username | String | 管理員名稱（唯一） |
| email | String | 電子郵件（唯一） |
| password | String | bcrypt 雜湊後的密碼 |
| createdAt | Date | 建立時間（自動） |
| updatedAt | Date | 更新時間（自動） |

**索引：** username（唯一）、email（唯一）
