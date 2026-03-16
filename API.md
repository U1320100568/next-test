# API 端點說明

所有 API 均使用 JSON 格式。認證使用 Bearer Token（Authorization header）。

互動式 API 文件頁面：`GET /api/api-docs`

## 管理員認證

### POST /api/admin/login
管理員登入。

**Request Body:**
```json
{ "username": "admin", "password": "password" }
```

**Response 200:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "username": "admin", "email": "admin@example.com" }
}
```

**Response 401:** 帳號或密碼錯誤

### POST /api/admin/refresh
刷新管理員 access token。

**Request Body:**
```json
{ "refreshToken": "..." }
```

**Response 200:**
```json
{ "accessToken": "...", "refreshToken": "..." }
```

## 使用者認證

### POST /api/auth/login
使用者登入。

**Request Body:**
```json
{ "username": "user1", "password": "password" }
```

**Response 200:**
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "username": "user1", "email": "user@example.com" }
}
```

### POST /api/auth/refresh
刷新使用者 access token。

**Request Body:**
```json
{ "refreshToken": "..." }
```

### POST /api/auth/change-password
修改密碼（需 user JWT）。

**Headers:** `Authorization: Bearer <accessToken>`

**Request Body:**
```json
{ "currentPassword": "old", "newPassword": "new123456" }
```

**Response 200:**
```json
{ "message": "密碼修改成功" }
```

## 使用者管理（需管理員 JWT）

所有以下端點需在 Header 中提供：`Authorization: Bearer <adminAccessToken>`

### GET /api/users
列出使用者，支援分頁。

**Query Params:** `page`（預設 1）、`limit`（預設 10，最大 100）

**Response 200:**
```json
{
  "data": [{ "id": "...", "username": "...", "email": "...", "createdAt": "..." }],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### POST /api/users
建立新使用者。

**Request Body:**
```json
{ "username": "newuser", "email": "new@example.com", "password": "pass123" }
```

**Response 201:** 新使用者資料

### GET /api/users/:id
取得單一使用者。

**Response 200:** 使用者資料

### PUT /api/users/:id
更新使用者（email 或 password）。

**Request Body:**
```json
{ "email": "newemail@example.com", "password": "newpass123" }
```

### DELETE /api/users/:id
刪除使用者。

**Response 200:**
```json
{ "message": "使用者已刪除" }
```

## API 文件

### GET /api/api-docs
自動生成的 OpenAPI/Swagger 文件頁面（由 next-rest-framework 提供）。
