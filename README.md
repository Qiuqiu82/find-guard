# 找不同小游戏

这是一个基于 Vue3 + Vite + TypeScript 开发的找不同小游戏网站。

## 项目介绍

- 游戏规则：在规定时间内找出图片中的不同点
- 每关有3-4个解密点需要找出
- 总共6个关卡
- 三颗爱心生命值，点错会扣除生命值
- 第一次点错扣半颗心，第二次点错扣一颗心
- 时间结束前找出所有不同点或用完生命值则游戏结束

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Vuex
- Element Plus
- Axios
- ECharts
- Mitt

## 如何启动项目

1. 安装依赖：

```bash
npm install
```

2. 启动开发服务器：

```bash
npm run dev
```

3. 构建项目：

```bash
npm run build
```

## 项目结构

- `src/layout`: 布局组件
- `src/views`: 页面组件
- `src/router`: 路由配置
- `src/store`: 状态管理
- `src/components`: 公共组件
- `src/assets`: 静态资源
