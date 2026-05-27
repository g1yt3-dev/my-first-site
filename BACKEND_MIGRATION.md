# 前后端分离迁移指南

## 概述

本项目已从纯前端本地存储方案迁移为前后端分离架构。

## 技术栈

### 前端
- React 18
- Vite
- Tailwind CSS
- Zustand (状态管理)
- React Router

### 后端 (待实现)
- Spring Boot 3.x
- PostgreSQL
- Spring Security + JWT

## 项目结构变更

### 新增文件
```
src/
├── services/
│   ├── api.js              # API 客户端基础类
│   ├── auth.js             # 认证相关 API
│   ├── item.js             # 物品相关 API
│   └── floorPlan.js        # 户型图相关 API
├── store/
│   └── auth.js             # 认证状态管理
└── pages/
    ├── Login.jsx           # 登录页面
    └── Register.jsx        # 注册页面

.env.example                # 环境变量示例
BACKEND_MIGRATION.md       # 本文档
.trae/documents/backend-arch.md  # 后端架构文档
```

### 修改文件
- `src/store/index.js` - 重构为使用 API 而非 localStorage
- `src/pages/Home.jsx` - 添加认证状态和数据加载
- `src/pages/ItemForm.jsx` - 使用异步 API 调用
- `src/pages/ItemDetail.jsx` - 使用异步 API 调用
- `src/App.jsx` - 添加路由保护和认证初始化

## API 规范

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 物品管理接口
- `GET /api/items` - 获取用户所有物品
- `GET /api/items/:id` - 获取物品详情
- `POST /api/items` - 创建物品
- `PUT /api/items/:id` - 更新物品
- `DELETE /api/items/:id` - 删除物品
- `GET /api/items/search?query=:query` - 搜索物品

### 户型图管理接口
- `GET /api/floor-plan` - 获取用户户型图
- `PUT /api/floor-plan` - 更新户型图
- `PUT /api/floor-plan/items/:itemId` - 更新物品位置
- `DELETE /api/floor-plan/items/:itemId` - 删除物品位置

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```
VITE_API_URL=http://localhost:8080/api
```

## 后端实现指南

详细的后端架构设计请参考 [.trae/documents/backend-arch.md](file:///e:/shenghuo/.trae/documents/backend-arch.md)

### 数据库设计
1. 用户表 - 存储用户信息
2. 物品表 - 存储物品信息，关联用户
3. 户型图表 - 存储户型图数据，关联用户

### 关键实现点
1. JWT 认证机制
2. 用户数据隔离（每个用户只能访问自己的数据）
3. RESTful API 设计
4. 异常处理和统一响应格式
