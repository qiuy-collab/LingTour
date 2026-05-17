# LingTour Admin Web Guidelines

## 技术栈
- Vue 3 (Composition API) + Vite
- TypeScript
- Element Plus
- Vue Router, Pinia
- Axios

## 项目结构 (期望)
```
admin-web/
  ├── src/
  │   ├── api/        # 接口请求服务
  │   ├── assets/     # 静态资源
  │   ├── components/ # 公共组件
  │   ├── layout/     # 全局布局 (Sidebar, Header)
  │   ├── router/     # 路由配置
  │   ├── store/      # 状态管理
  │   ├── views/      # 业务页面 (Cities, Routes, Shop 等)
  │   └── main.ts     # 入口文件
  └── package.json
```

## 开发规范
- **代码风格**: 优先使用 `<script setup lang="ts">`。
- **UI 组件**: 尽量使用 Element Plus 的默认组件。
- **路由及权限**: 目前仅需登录校验，无需动态菜单及复杂角色。
