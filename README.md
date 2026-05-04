# 微光日记 ✨

<p align="center">
  <img src="assets/icon.png" width="120" height="120" alt="微光日记 Logo">
</p>

<p align="center">
  <strong>一个用 Emoji、日历、照片和温柔总结记录生活的私人日记 App</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#安装运行">安装运行</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#开发路线">开发路线</a>
</p>

---

## 📱 功能特性

### 核心功能

| 功能 | 描述 |
|------|------|
| 📅 **心情日历** | 用 Emoji 记录每天心情，一目了然的历史回顾 |
| ✏️ **每日记录** | 记录今天做了什么、开心的事、不开心的事 |
| 📷 **照片记录** | 每日照片上传，支持设置封面照片 |
| 🏷️ **生活标签** | 自定义标签，分类记录生活点滴 |
| 🤖 **AI 温柔总结** | AI 像朋友一样温柔地总结你的一天 |
| 💌 **时间胶囊** | 写给未来的自己，在指定日期开启 |
| 📊 **年度报告** | 年度生活回顾，重温美好回忆 |

### 设计理念

- 🌸 **温柔治愈** — 奶油白背景、低饱和配色、圆角卡片
- 🔒 **隐私优先** — 数据本地存储，不上传云端
- 🎯 **极简设计** — 无社交、无打卡、无压力
- 💫 **Apple-like** — 简洁优雅的交互体验

---

## 🛠 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React Native | 0.76.9 | 跨平台移动开发框架 |
| Expo | 52.0.0 | React Native 开发工具链 |
| TypeScript | 5.3.3 | 类型安全的 JavaScript |
| Expo Router | 4.0.21 | 文件系统路由 |
| Expo SQLite | 15.1.4 | 本地数据库存储 |

---

## 📲 安装运行

### 环境要求

- Node.js >= 18
- npm 或 yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator / Android Emulator / 真机

### 克隆项目

```bash
git clone https://github.com/yy611185/mood-note.git
cd mood-note
```

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# 启动开发服务器
npm start

# 运行 iOS
npm run ios

# 运行 Android
npm run android

# 运行 Web
npm run web
```

### 类型检查

```bash
npm run typecheck
```

---

## 📁 项目结构

```
mood-note/
├── app/                    # Expo Router 页面路由
│   ├── (tabs)/            # 底部导航 Tab 页面
│   │   ├── calendar.tsx   # 日历页
│   │   ├── record.tsx     # 记录页
│   │   └── profile.tsx    # 我的页
│   ├── day-detail/        # 日期详情页
│   ├── capsule/           # 时间胶囊页
│   ├── stats/             # 统计页
│   ├── report/            # 年度报告页
│   └── settings/          # 设置页
├── src/
│   ├── components/        # 可复用 UI 组件
│   │   ├── MoodEmojiPicker.tsx
│   │   ├── PhotoCoverCard.tsx
│   │   ├── TagChip.tsx
│   │   └── ...
│   ├── db/                # 数据库层
│   │   ├── schema.ts      # 数据库 Schema
│   │   ├── database.ts    # 数据库初始化
│   │   ├── diaryRepository.ts
│   │   ├── photoRepository.ts
│   │   └── ...
│   ├── services/          # 业务服务
│   ├── types/             # TypeScript 类型定义
│   ├── theme/             # 设计系统（颜色、间距等）
│   └── utils/             # 工具函数
├── assets/                # 静态资源
├── codex.md               # AI 编程规范文档
├── app.json               # Expo 配置
└── package.json
```

---

## 🎨 设计系统

### 心情类型

| 心情 | Emoji | 分数 |
|------|:-----:|:----:|
| 很开心 | 😆 | 5 |
| 开心 | 😊 | 4 |
| 平静 | 😌 | 3.5 |
| 普通 | 😐 | 3 |
| 疲惫 | 😮‍💨 | 2.5 |
| 焦虑 | 😟 | 2 |
| 难过 | 😢 | 1.5 |
| 生气 | 😠 | 1.5 |
| 特别的一天 | ✨ | 5 |

### 配色风格

```
温柔治愈 · 极简 · 低压力
奶油白背景 · 低饱和配色 · 圆角卡片 · 轻微阴影
```

---

## 🗺 开发路线

### ✅ V1 基础版（已完成）

- [x] 三栏底部导航（日历/记录/我的）
- [x] Emoji 心情选择器
- [x] 每日记录页面
- [x] SQLite 本地存储
- [x] 照片上传与封面设置
- [x] 生活标签
- [x] 历史记录查看

### 🚧 V2 增强版（进行中）

- [ ] 心情趋势图
- [ ] 生活标签统计
- [ ] 时间胶囊完整功能
- [ ] AI 温柔总结（真实 API）
- [ ] 历史记录搜索

### 📅 V3 完整版（规划中）

- [ ] 年度回忆报告
- [ ] 隐私锁（生物识别）
- [ ] 数据导出
- [ ] 可选云同步

---

## 🔐 隐私保护

微光日记高度重视用户隐私：

- ✅ **默认本地存储** — 所有日记、照片默认只存在您的设备上
- ✅ **不上传数据** — 未经用户明确开启，不会上传任何内容到云端
- ✅ **AI 安全** — AI 调用通过安全后端代理，不在客户端暴露密钥
- ✅ **可选关闭** — 用户可随时关闭 AI 功能

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 💬 联系方式

如有问题或建议，欢迎提交 [Issue](https://github.com/yy611185/mood-note/issues)

---

<p align="center">
  <strong>慢慢来，记录本来就是一件温柔的小事 ✨</strong>
</p>
