# 🎵 像素音浪姬 / Pixel Beat Idol

[![Release](https://img.shields.io/github/v/release/ding7015869-alt/pixel-anime-player?style=for-the-badge)](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-35f7ff?style=for-the-badge)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-desktop-fff36d?style=for-the-badge)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-UI-ff5ec8?style=for-the-badge)](https://react.dev/)
[![Stars](https://img.shields.io/github/stars/ding7015869-alt/pixel-anime-player?style=for-the-badge&color=yellow)](https://github.com/ding7015869-alt/pixel-anime-player/stargazers)

![Pixel Beat Idol demo](docs/media/demo.gif)

> 🎧 **桌面上开一场像素偶像演唱会。原创角色随节拍跳舞，六种视觉特效，歌词同步，照片像素化——全在本地完成。**
>
> 🎧 **Turn your desktop into a pixel idol concert. Original characters dance to your music, with 6 visual effects, lyric sync, and local photo pixelization.**

[📥 Download for Windows / 下载 Windows 版](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest) · [📢 Launch Kit / 推广文案](docs/launch-kit.md)

![social preview](docs/media/social-preview.png)

---

## ✨ 为什么你需要这个？ / Why This?

**中文：** 市面上音乐播放器千篇一律：一个列表 + 一个进度条。像素音浪姬把听歌变成一场视觉演出——你投一首歌进去，像素偶像就在舞台上为你跳舞，鼓点、旋律、高音各自触发不同的动作和特效。

**English:** Most music players are the same: a list + a progress bar. Pixel Beat Idol turns listening into a visual performance — drop in a song, and pixel idols dance on stage, with drums, melodies, and high notes each triggering unique moves and effects.

- 🎭 原创像素偶像角色 / Original pixel idols — not stock assets
- 🕺 节拍驱动舞蹈 / Beat-reactive dance — every frame synced to music
- ✨ 六种视觉特效 / 6 VFX modes — one-click switch
- 🎤 桌面霓虹歌词 / Desktop neon lyrics — LRC/TXT sync
- 📸 照片像素化 / Photo pixelizer — local processing, no cloud
- 🌐 中英文一键切换 / Bilingual — Chinese/English on the main screen

---

## 🎯 亮点 / Highlights

- 🈶 中英文一键切换 / One-click Chinese/English switch
- 🎵 本地音乐文件/文件夹导入 / Local audio files & folders, drag-and-drop
- ▶️ 完整播控 / Full transport: play/pause, prev/next, seek, volume
- 🔁 自动连播 / Auto-play next track
- 🎤 LRC/TXT 歌词霓虹同步 / Neon pixel lyric sync
- 📸 照片本地像素化保存 PNG / Photo pixelization → save PNG
- 📊 实时音频分析 / Live audio analysis: bass, mid, treble, motion meters
- 💃 像素角色随节拍跳舞 / Pixel idols dance to the beat
- ✨ 六种特效 / 6 VFX: 综合 Mix / 像素雨 Pixel Rain / 音符 Notes / 晶片 Crystals / 光束 Beams / 爆裂 Burst
- 📜 大歌单虚拟滚动 / Virtualized large playlists, responsive layout

---

## 📥 系统要求 / System Requirements

| | Minimum |
|------|------|
| OS | Windows 10+ (x64) |
| RAM | 4 GB |
| Storage | 200 MB |
| GPU | WebGL support |

> 🍎 macOS / 🐧 Linux: run from source (see Development below / 见下方开发指南)

---

## 🚀 下载 & 运行 / Download & Run

### Windows 用户 / Windows Users

👉 **[Download Latest / 下载最新版](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest)**

Download `像素音浪姬-win-x64.zip`, extract, double-click `像素音浪姬.exe`.

> ⚠️ Keep the entire extracted folder — don't move just the exe. 保留整个解压文件夹。

### 开发者 / Developers (macOS / Linux)

```bash
git clone https://github.com/ding7015869-alt/pixel-anime-player.git
cd pixel-anime-player
npm install
npm run electron:dev
```

Web preview / 网页预览：

```bash
npm run dev
```

---

## 🔨 构建 / Build

```bash
npm run build
npm run dist:win              # Windows x64 unpacked / 解包版
npm run dist:win:portable     # Portable / 便携版
npm run dist:win:installer    # Installer / 安装器
```

---

## 🛠 技术栈 / Tech Stack

| Layer | Tech |
|-------|------|
| Desktop Framework | Electron |
| UI | React + Vite + TypeScript |
| Audio Analysis | Web Audio API |
| Pixel Rendering | Canvas 2D |
| Visual Effects | Custom particle system / 自研粒子系统 |

---

## 📄 License

MIT — 自由使用、修改、分发。Free to use, modify, and distribute.

---

## 🌟 Star History

喜欢点个 ⭐ / Drop a ⭐ if you like it!

[![Star History Chart](https://api.star-history.com/svg?repos=ding7015869-alt/pixel-anime-player&type=date)](https://star-history.com/#ding7015869-alt/pixel-anime-player&Date)
