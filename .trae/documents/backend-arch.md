
# 后端架构设计文档

## 技术栈
- **框架**: Spring Boot 3.x
- **数据库**: PostgreSQL
- **ORM**: Spring Data JPA
- **认证**: Spring Security + JWT
- **构建工具**: Maven

## 项目结构
```
shenghuo-backend/
├── src/main/java/com/shenghuo/
│   ├── ShenghuoApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── JwtConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── ItemController.java
│   │   └── FloorPlanController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── ItemService.java
│   │   └── FloorPlanService.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   ├── ItemRepository.java
│   │   └── FloorPlanRepository.java
│   ├── entity/
│   │   ├── User.java
│   │   ├── Item.java
│   │   └── FloorPlan.java
│   ├── dto/
│   │   ├── request/
│   │   │   ├── LoginRequest.java
│   │   │   ├── RegisterRequest.java
│   │   │   ├── ItemRequest.java
│   │   │   └── FloorPlanRequest.java
│   │   └── response/
│   │       ├── AuthResponse.java
│   │       ├── ItemResponse.java
│   │       └── ApiResponse.java
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   └── JwtTokenProvider.java
│   └── exception/
│       ├── ResourceNotFoundException.java
│       └── GlobalExceptionHandler.java
└── src/main/resources/
    ├── application.yml
    └── db/migration/
```

## 数据库设计

### User 表
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Item 表
```sql
CREATE TABLE items (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    expiry_date DATE,
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### FloorPlan 表
```sql
CREATE TABLE floor_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image TEXT,
    width INTEGER DEFAULT 800,
    height INTEGER DEFAULT 600,
    items JSONB DEFAULT '{}',
    elements JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API 接口规范

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 物品管理
- `GET /api/items` - 获取用户所有物品
- `GET /api/items/{id}` - 获取物品详情
- `POST /api/items` - 创建物品
- `PUT /api/items/{id}` - 更新物品
- `DELETE /api/items/{id}` - 删除物品
- `GET /api/items/search?query={query}` - 搜索物品

### 平面图管理
- `GET /api/floor-plan` - 获取用户平面图
- `PUT /api/floor-plan` - 更新平面图
- `PUT /api/floor-plan/items/{itemId}` - 更新物品位置
- `DELETE /api/floor-plan/items/{itemId}` - 删除物品位置

## 响应格式
```json
{
  "success": true,
  "data": {},
  "message": ""
}
```
