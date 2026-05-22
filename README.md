# 像素音浪姬 / Pixel Beat Idol

[![Release](https://img.shields.io/github/v/release/ding7015869-alt/pixel-anime-player?style=for-the-badge)](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest)
[![License: MIT](https://img.shields.io/badge/license-MIT-35f7ff?style=for-the-badge)](LICENSE)
[![Electron](https://img.shields.io/badge/Electron-desktop-fff36d?style=for-the-badge)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-UI-ff5ec8?style=for-the-badge)](https://react.dev/)

![Pixel Beat Idol demo](docs/media/demo.gif)

一个 Electron + Vite + React 桌面音乐播放器：像素二次元舞台、原创角色、粒子特效、节拍分析、同步歌词、本地照片像素化，还有中英文界面切换。

An Electron + Vite + React desktop music player with a pixel-anime stage, original beat-reactive idols, particle effects, lyric sync, local photo pixelization, and a bilingual Chinese/English UI.

[Download Windows build](https://github.com/ding7015869-alt/pixel-anime-player/releases/latest) · [Launch kit / 推广文案](docs/launch-kit.md)

![Pixel Beat Idol social preview](docs/media/social-preview.png)

## 亮点

- 中英文一键切换，默认中文，主界面按钮可随时切换。
- 打开本地音乐文件或音乐文件夹，支持拖拽导入。
- 歌单点击即播放，支持播放/暂停、上一首/下一首、进度条、音量控制。
- 多首歌曲结束后自动连续播放下一首。
- 支持导入 LRC/TXT 歌词，舞台上显示霓虹像素同步字幕。
- 支持导入本地照片，在本机处理成像素风图片并保存 PNG。
- 低频鼓点、中频旋律、高频闪光、动作强度实时显示。
- 像素角色会跟随鼓点、旋律和高频闪光跳舞。
- 综合、像素雨、音符、晶片、光束、爆裂六种特效可手动切换。
- 大歌单虚拟滚动，窗口宽窄变化时自适应布局。

## Features

- One-click Chinese/English switch directly on the main screen.
- Import local audio files, folders, or drag audio into the window.
- Click a playlist row to play, with transport controls, seek, and volume.
- Auto-play the next track when the current one ends.
- Import LRC/TXT lyrics for neon pixel lyric sync on the stage.
- Import a local photo, pixelize it entirely in the browser canvas, and save a PNG.
- Live bass, mid, treble, and motion meters.
- Original pixel idols dance to the analysed music energy.
- Six manually switchable visual modes: Mix, Pixel Rain, Notes, Crystals, Beams, and Burst.
- Virtualized large playlists and responsive desktop layout.

## 开发运行 / Development

```bash
npm install
npm run electron:dev
```

网页预览 / Web preview:

```bash
npm run dev
```

## 构建 / Build

```bash
npm run build
npm run dist:win
```

`npm run dist:win` 会生成 Windows x64 解包目录：

```text
release/win-unpacked/像素音浪姬.exe
```

移动到 Windows 时必须保留整个 `win-unpacked` 文件夹，不要只单独拷走 exe。

`npm run dist:win` creates a Windows x64 unpacked app folder. Keep the whole `win-unpacked` folder together when moving it to Windows.

## 便携版和安装器 / Portable and Installer

脚本已保留：

```bash
npm run dist:win:portable
npm run dist:win:installer
```

在 Apple Silicon macOS 上，这两个单文件目标可能因为构建工具里的 x86 `makensis` / `wine64` 不能运行而失败。需要单文件安装包时，建议在 Windows 或兼容环境里执行。

## License

MIT
