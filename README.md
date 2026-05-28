# 🎵 像素音浪姬 / Pixel Beat Idol

[![Release](https://img.shields.io/github/v/release/ding7015869-alt/pixel-anime-player?style=for-the-badge)](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-35f7ff?style=for-the-badge)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-desktop-fff36d?style=for-the-badge)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-UI-ff5ec8?style=for-the-badge)](https://react.dev/)
[![Stars](https://img.shields.io/github/stars/ding7015869-alt/pixel-anime-player?style=for-the-badge&color=yellow)](https://github.com/ding7015869-alt/pixel-anime-player/stargazers)

![Pixel Beat Idol demo](docs/media/demo.gif)

> 🎧 **桌面上开一场像素偶像演唱会。原创角色随节拍跳舞，六种视觉特效，歌词同步，照片像素化——全在本地完成。**

[📥 下载 Windows 版](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest) · [📢 推广文案](docs/launch-kit.md)

![social preview](docs/media/social-preview.png)

---

## ✨ 为什么你需要这个？

市面上音乐播放器千篇一律：一个列表 + 一个进度条。**像素音浪姬**把听歌变成一场视觉演出——你投一首歌进去，像素偶像就在舞台上为你跳舞，鼓点、旋律、高音各自触发不同的动作和特效。

- 🎭 原创像素偶像角色，不是素材库拼凑
- 🕺 节拍驱动舞蹈，每一帧都和音乐同步
- ✨ 六种视觉特效一键切换
- 🎤 桌面歌词，霓虹像素风格
- 📸 照片变像素画，本机处理不传云端
- 🌐 中英文界面一键切换

---

## 🎯 亮点

- 🈶 中英文一键切换，默认中文
- 🎵 打开本地音乐文件/文件夹，支持拖拽导入
- ▶️ 完整播控：播放/暂停、上/下一首、进度条、音量
- 🔁 自动连播，歌单放完不停
- 🎤 导入 LRC/TXT 歌词，舞台上霓虹像素同步字幕
- 📸 导入照片，浏览器本地像素化，保存 PNG
- 📊 实时音频分析：低频鼓点、中频旋律、高频闪光、动作强度
- 💃 像素角色随鼓点/旋律/高频跳舞
- ✨ 六种视觉特效：综合 / 像素雨 / 音符 / 晶片 / 光束 / 爆裂
- 📜 大歌单虚拟滚动，窗口自适应布局

---

## 📥 系统要求

| | 最低 |
|------|------|
| 系统 | Windows 10+ (x64) |
| 内存 | 4 GB |
| 存储 | 200 MB |
| 显卡 | 支持 WebGL |

> 🍎 macOS / 🐧 Linux 用户可以从源码运行（见下方开发指南）

---

## 🚀 下载 & 运行

### Windows 用户

👉 **[下载最新版本](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest)**

下载 `像素音浪姬-win-x64.zip`，解压后双击 `像素音浪姬.exe` 即可。

> ⚠️ 解压后保留整个文件夹，不要只拷贝 exe 文件。

### 开发者 / macOS / Linux

```bash
git clone https://github.com/ding7015869-alt/pixel-anime-player.git
cd pixel-anime-player
npm install
npm run electron:dev
```

网页预览（不含 Electron 壳）：

```bash
npm run dev
```

---

## 🔨 构建

```bash
npm run build
npm run dist:win          # Windows x64 解包版
npm run dist:win:portable # 便携版
npm run dist:win:installer # 安装器
```

---

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| 桌面框架 | Electron |
| 前端 | React + Vite + TypeScript |
| 音频分析 | Web Audio API |
| 像素渲染 | Canvas 2D |
| 视觉特效 | 自研粒子系统 |

---

## 📸 更多截图

| 主舞台 | 歌词同步 | 照片像素化 |
|--------|----------|------------|
| ![stage](docs/media/demo.gif) | 见上方 GIF | 见上方 GIF |

---

## 📄 License

MIT — 自由使用、修改、分发。

---

## 🌟 Star History

喜欢的话点个 ⭐ 吧～

[![Star History Chart](https://api.star-history.com/svg?repos=ding7015869-alt/pixel-anime-player&type=date)](https://star-history.com/#ding7015869-alt/pixel-anime-player&Date)
