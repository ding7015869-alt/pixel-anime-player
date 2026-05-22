import {
  type ChangeEvent,
  type CSSProperties,
  type DragEvent,
  type UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import './App.css'

type Track = {
  id: string
  name: string
  url: string
  size?: number
  source: 'dialog' | 'folder' | 'drop' | 'input'
}

type LyricLine = {
  time: number
  text: string
}

type MotionState = {
  energy: number
  bass: number
  mid: number
  treble: number
  beat: number
  kick: number
  snare: number
  hat: number
}

type CssVars = CSSProperties & Record<`--${string}`, string | number>

type IdolCharacter = {
  id: string
  name: string
  nameEn: string
  role: string
  roleEn: string
  hair: string
  hairShade: string
  outfit: string
  accent: string
  boot: string
  skin: string
  kind: 'twintail' | 'dj' | 'guitar' | 'drummer' | 'samurai' | 'cat'
  prop: 'mic' | 'headphones' | 'guitar' | 'sticks' | 'blade' | 'fan'
  dance: 'lead' | 'jump' | 'slide' | 'spin' | 'kick' | 'wave'
}

type DancerSlot = {
  id: string
  characterId: string
  left: string
  top: string
  scale: number
  delay: string
  layer: number
  flip?: boolean
}

type ParticleKind = 'rain' | 'note' | 'diamond' | 'streak' | 'spark'

type EffectMode = 'mix' | 'rain' | 'notes' | 'crystal' | 'beam' | 'burst'

type Language = 'zh' | 'en'

type StatusKey =
  | 'initial'
  | 'selectTrackFirst'
  | 'playingNoAnalysis'
  | 'playingSync'
  | 'playAgain'
  | 'noAudio'
  | 'loadedTracks'
  | 'noSelection'
  | 'webNoFolder'
  | 'noAudioInFolder'
  | 'paused'
  | 'preparing'
  | 'playlistEmpty'
  | 'restartSong'
  | 'restartPrompt'
  | 'endedReplay'
  | 'autoNext'
  | 'effectChanged'
  | 'lyricEmpty'
  | 'lyricImported'
  | 'lyricFail'
  | 'photoProcessing'
  | 'photoDone'
  | 'photoFail'
  | 'importPhotoFirst'
  | 'readyPlay'
  | 'cannotPlay'

type StatusValue = string | number

type StatusState = {
  key: StatusKey
  values?: Record<string, StatusValue>
}

type VisualParticle = {
  x: number
  y: number
  size: number
  speed: number
  color: string
  phase: number
  kind: ParticleKind
  drift: number
}

const effectModes: Array<{ id: EffectMode }> = [
  { id: 'mix' },
  { id: 'rain' },
  { id: 'notes' },
  { id: 'crystal' },
  { id: 'beam' },
  { id: 'burst' },
]

const effectModeLabels: Record<Language, Record<EffectMode, string>> = {
  zh: {
    beam: '光束',
    burst: '爆裂',
    crystal: '晶片',
    mix: '综合',
    notes: '音符',
    rain: '像素雨',
  },
  en: {
    beam: 'Beams',
    burst: 'Burst',
    crystal: 'Crystals',
    mix: 'Mix',
    notes: 'Notes',
    rain: 'Pixel Rain',
  },
}

const appCopy = {
  zh: {
    appName: '像素音浪姬',
    eyeline: '二次元像素播放器',
    statusAria: '播放器状态',
    playerAria: '音乐播放器',
    playing: '播放中',
    standby: '待机',
    beat: (value: number) => `节拍 ${value}%`,
    switchLanguage: 'EN',
    switchLanguageAria: '切换到英文界面',
    playlist: '歌单',
    chooseMusic: '选音乐',
    chooseFolder: '选文件夹',
    dropMusic: '拖入音乐',
    dropOrChoose: '拖入或选择音乐文件',
    audioSupport: '支持常见音频格式',
    rhythmStage: '节奏舞台',
    idolStage: '霓虹偶像舞台',
    waitingFirstTrack: '等待第一首歌',
    lyricStageAria: '歌词舞台',
    photoAlt: '本地生成的像素风照片',
    pixelPhoto: '像素照片',
    discLabel: '音浪',
    lyricSync: '歌词同步',
    currentPlaying: '当前播放',
    openFirstTrack: '打开一首音乐，舞台开始',
    previous: '上一首',
    play: '播放',
    pause: '暂停',
    next: '下一首',
    seekAria: '播放进度',
    stageResponse: '舞台反应',
    audioAnalysis: '音频分析',
    bass: '低频鼓点',
    mid: '中频旋律',
    treble: '高频闪光',
    motionIntensity: '动作强度',
    volume: '音量',
    creativeTools: '创作工具',
    localProcessing: '本地处理',
    lyricLines: (count: number) => `${count} 行歌词`,
    importLyrics: '导入歌词',
    importPhoto: '导入照片',
    savePixel: '保存像素图',
    localPixelize: '本地像素化',
    effectMode: '特效模式',
    emptyPlaylist: '空歌单',
    playlistCount: (count: number) => `${count} 首歌`,
    localFile: '本地文件',
    mb: '兆',
    kb: '千字节',
    pixelPhotoFallback: '像素照片',
    status: {
      autoNext: () => '正在自动播放下一首',
      cannotPlay: () => '这首歌无法播放，请换一首或检查文件格式',
      effectChanged: (values?: Record<string, StatusValue>) =>
        `已切换特效：${effectModeLabels.zh[(values?.mode as EffectMode) ?? 'mix']}`,
      endedReplay: () => '播放结束，点播放可重听',
      importPhotoFirst: () => '请先导入照片',
      initial: () => '请选择音乐，舞台会按节奏启动',
      loadedTracks: (values?: Record<string, StatusValue>) =>
        `已载入 ${values?.count ?? 0} 首歌，点播放开始`,
      lyricEmpty: () => '歌词文件没有可显示内容',
      lyricFail: () => '歌词导入失败，请检查文件格式',
      lyricImported: (values?: Record<string, StatusValue>) => `已导入歌词：${values?.file ?? ''}`,
      noAudio: () => '没有识别到音频文件',
      noAudioInFolder: () => '文件夹里没有识别到音频',
      noSelection: () => '未选择音乐文件',
      paused: () => '已暂停，舞台待机',
      photoDone: (values?: Record<string, StatusValue>) => `像素照片已生成：${values?.file ?? ''}`,
      photoFail: () => '照片像素化失败，请换一张图片',
      photoProcessing: () => '正在本地生成像素照片',
      playAgain: () => '播放未开始，请再点一次播放',
      playingNoAnalysis: () => '正在播放，当前文件无法接入频谱分析',
      playingSync: () => '正在播放，舞者按鼓点同步',
      playlistEmpty: () => '歌单为空',
      preparing: () => '正在准备播放',
      readyPlay: () => '已准备好，点播放开始',
      restartPrompt: () => '已回到开头，点播放开始',
      restartSong: () => '已回到歌曲开头',
      selectTrackFirst: () => '请先选择一首音乐',
      webNoFolder: () => '网页预览不支持直接打开文件夹，请拖入或选择音乐文件',
    },
  },
  en: {
    appName: 'Pixel Beat Idol',
    eyeline: 'Anime Pixel Music Player',
    statusAria: 'Player status',
    playerAria: 'Music player',
    playing: 'Playing',
    standby: 'Standby',
    beat: (value: number) => `Beat ${value}%`,
    switchLanguage: '中文',
    switchLanguageAria: 'Switch to Chinese interface',
    playlist: 'Playlist',
    chooseMusic: 'Music',
    chooseFolder: 'Folder',
    dropMusic: 'Drop Music',
    dropOrChoose: 'Drop or choose audio files',
    audioSupport: 'Common audio formats supported',
    rhythmStage: 'Rhythm stage',
    idolStage: 'Neon idol stage',
    waitingFirstTrack: 'Waiting for the first track',
    lyricStageAria: 'Lyric stage',
    photoAlt: 'Locally generated pixel-style photo',
    pixelPhoto: 'Pixel photo',
    discLabel: 'Beat',
    lyricSync: 'Lyric Sync',
    currentPlaying: 'Now playing',
    openFirstTrack: 'Open a song to start the stage',
    previous: 'Previous',
    play: 'Play',
    pause: 'Pause',
    next: 'Next',
    seekAria: 'Playback progress',
    stageResponse: 'Stage response',
    audioAnalysis: 'Audio analysis',
    bass: 'Bass hits',
    mid: 'Mid melody',
    treble: 'Treble flash',
    motionIntensity: 'Motion power',
    volume: 'Volume',
    creativeTools: 'Creative tools',
    localProcessing: 'Local tools',
    lyricLines: (count: number) => `${count} lyric lines`,
    importLyrics: 'Import lyrics',
    importPhoto: 'Import photo',
    savePixel: 'Save pixel PNG',
    localPixelize: 'Local pixelizer',
    effectMode: 'Effect mode',
    emptyPlaylist: 'Empty list',
    playlistCount: (count: number) => `${count} track${count === 1 ? '' : 's'}`,
    localFile: 'Local file',
    mb: 'MB',
    kb: 'KB',
    pixelPhotoFallback: 'pixel-photo',
    status: {
      autoNext: () => 'Auto-playing the next track',
      cannotPlay: () => 'This track cannot play. Try another file or check its format.',
      effectChanged: (values?: Record<string, StatusValue>) =>
        `Effect switched: ${effectModeLabels.en[(values?.mode as EffectMode) ?? 'mix']}`,
      endedReplay: () => 'Playback ended. Press play to listen again.',
      importPhotoFirst: () => 'Import a photo first',
      initial: () => 'Choose music and the stage will follow the beat',
      loadedTracks: (values?: Record<string, StatusValue>) =>
        `Loaded ${values?.count ?? 0} track${values?.count === 1 ? '' : 's'}. Press play to start.`,
      lyricEmpty: () => 'No displayable lyrics found in this file',
      lyricFail: () => 'Lyric import failed. Check the file format.',
      lyricImported: (values?: Record<string, StatusValue>) => `Lyrics imported: ${values?.file ?? ''}`,
      noAudio: () => 'No audio files were recognized',
      noAudioInFolder: () => 'No supported audio files were found in this folder',
      noSelection: () => 'No music file selected',
      paused: () => 'Paused. Stage on standby.',
      photoDone: (values?: Record<string, StatusValue>) => `Pixel photo generated: ${values?.file ?? ''}`,
      photoFail: () => 'Photo pixelization failed. Try another image.',
      photoProcessing: () => 'Generating the pixel photo locally',
      playAgain: () => 'Playback did not start. Press play again.',
      playingNoAnalysis: () => 'Playing, but this file cannot connect to spectrum analysis',
      playingSync: () => 'Playing. Dancers are syncing to the beat.',
      playlistEmpty: () => 'The playlist is empty',
      preparing: () => 'Preparing playback',
      readyPlay: () => 'Ready. Press play to start.',
      restartPrompt: () => 'Returned to the start. Press play to begin.',
      restartSong: () => 'Returned to the start of the track',
      selectTrackFirst: () => 'Choose a track first',
      webNoFolder: () => 'Folder picker is only available in the desktop app. Drop or choose files instead.',
    },
  },
} as const

const emptyLyricLines: LyricLine[] = []

const idols: IdolCharacter[] = [
  {
    id: 'momo',
    name: '桃音',
    nameEn: 'Momo',
    role: '粉发主唱',
    roleEn: 'Pink Vocal',
    hair: '#ff4fb6',
    hairShade: '#9e246d',
    outfit: '#35f7ff',
    accent: '#fff36d',
    boot: '#211435',
    skin: '#ffd8bd',
    kind: 'twintail',
    prop: 'mic',
    dance: 'lead',
  },
  {
    id: 'ao',
    name: '蓝璃',
    nameEn: 'Aori',
    role: '耳机打碟',
    roleEn: 'Headphone DJ',
    hair: '#36d8ff',
    hairShade: '#167493',
    outfit: '#b6ff45',
    accent: '#ff5ec8',
    boot: '#13213d',
    skin: '#ffd6c2',
    kind: 'dj',
    prop: 'headphones',
    dance: 'spin',
  },
  {
    id: 'mika',
    name: '美夏',
    nameEn: 'Mika',
    role: '绿发贝斯',
    roleEn: 'Green Bass',
    hair: '#70ff6a',
    hairShade: '#278f37',
    outfit: '#ff6b3d',
    accent: '#35f7ff',
    boot: '#17192f',
    skin: '#ffd3b6',
    kind: 'guitar',
    prop: 'guitar',
    dance: 'slide',
  },
  {
    id: 'yuki',
    name: '雪奈',
    nameEn: 'Yuki',
    role: '白发鼓手',
    roleEn: 'Snow Drummer',
    hair: '#f3fbff',
    hairShade: '#8da8bd',
    outfit: '#ff5c8c',
    accent: '#78ff6b',
    boot: '#14172b',
    skin: '#ffe0c7',
    kind: 'drummer',
    prop: 'sticks',
    dance: 'jump',
  },
  {
    id: 'rin',
    name: '凛火',
    nameEn: 'Rinka',
    role: '橙发剑舞',
    roleEn: 'Blade Dancer',
    hair: '#ffae42',
    hairShade: '#9b561b',
    outfit: '#66efa4',
    accent: '#f7fbff',
    boot: '#23152b',
    skin: '#ffd1af',
    kind: 'samurai',
    prop: 'blade',
    dance: 'kick',
  },
  {
    id: 'nana',
    name: '娜娜',
    nameEn: 'Nana',
    role: '猫耳应援',
    roleEn: 'Cat Cheer',
    hair: '#8c8dff',
    hairShade: '#484bb3',
    outfit: '#ffe26b',
    accent: '#ff64ce',
    boot: '#161432',
    skin: '#ffd8bd',
    kind: 'cat',
    prop: 'fan',
    dance: 'wave',
  },
]

const dancerSlots: DancerSlot[] = [
  { id: 'a', characterId: 'momo', left: '4%', top: '18%', scale: 0.98, delay: '-0.1s', layer: 2 },
  { id: 'b', characterId: 'ao', left: '16%', top: '38%', scale: 1.04, delay: '-0.4s', layer: 3, flip: true },
  { id: 'c', characterId: 'mika', left: '5%', top: '66%', scale: 1, delay: '-0.9s', layer: 5 },
  { id: 'd', characterId: 'rin', left: '30%', top: '10%', scale: 0.8, delay: '-1.3s', layer: 1, flip: true },
  { id: 'e', characterId: 'yuki', left: '29%', top: '77%', scale: 1.08, delay: '-0.6s', layer: 6 },
  { id: 'f', characterId: 'ao', left: '45%', top: '9%', scale: 0.84, delay: '-1.6s', layer: 1 },
  { id: 'g', characterId: 'mika', left: '56%', top: '79%', scale: 1.1, delay: '-0.2s', layer: 6, flip: true },
  { id: 'h', characterId: 'nana', left: '68%', top: '12%', scale: 0.88, delay: '-1.1s', layer: 1 },
  { id: 'i', characterId: 'rin', left: '82%', top: '35%', scale: 1.04, delay: '-0.5s', layer: 3 },
  { id: 'j', characterId: 'yuki', left: '93%', top: '20%', scale: 0.9, delay: '-1.7s', layer: 1, flip: true },
  { id: 'k', characterId: 'momo', left: '91%', top: '64%', scale: 1.02, delay: '-0.8s', layer: 4 },
  { id: 'l', characterId: 'nana', left: '75%', top: '76%', scale: 1.04, delay: '-0.3s', layer: 6, flip: true },
]

const featuredIds = ['momo', 'ao', 'mika']
const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'webm']
const trackRowHeight = 64
const playlistOverscan = 8
const defaultMotion: MotionState = {
  energy: 0.14,
  bass: 0.1,
  mid: 0.1,
  treble: 0.1,
  beat: 0.08,
  kick: 0.08,
  snare: 0.08,
  hat: 0.08,
}

function makeId(prefix: string) {
  const randomId = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
  return `${prefix}-${randomId}`
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return '0:00'
  }

  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatSize(size: number | undefined, language: Language) {
  const copy = appCopy[language]
  if (!size) {
    return copy.localFile
  }

  if (size > 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} ${copy.mb}`
  }

  return `${Math.max(1, Math.round(size / 1024))} ${copy.kb}`
}

function average(values: Uint8Array, start: number, end: number) {
  let sum = 0
  const cappedEnd = Math.min(values.length, end)
  for (let index = start; index < cappedEnd; index += 1) {
    sum += values[index]
  }

  return cappedEnd > start ? sum / (cappedEnd - start) : 0
}

function parseLyricTimestamp(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?$/)
  if (!match) {
    return null
  }

  const minutes = Number(match[1])
  const seconds = Number(match[2])
  const fraction = match[3] ? Number(match[3].padEnd(3, '0').slice(0, 3)) / 1000 : 0
  return minutes * 60 + seconds + fraction
}

function parseLyrics(text: string): LyricLine[] {
  const lines: LyricLine[] = []
  const plainLines: string[] = []

  text.split(/\r?\n/).forEach((rawLine) => {
    const timestampMatches = [...rawLine.matchAll(/\[([0-9]{1,2}:[0-9]{2}(?:[.:][0-9]{1,3})?)\]/g)]
    const lyricText = rawLine.replace(/\[[^\]]+\]/g, '').trim()

    if (timestampMatches.length > 0) {
      timestampMatches.forEach((match) => {
        const time = parseLyricTimestamp(match[1])
        if (time !== null) {
          lines.push({ time, text: lyricText || '♪' })
        }
      })
      return
    }

    const cleaned = rawLine.trim()
    if (cleaned && !/^\[[a-z]+:/i.test(cleaned)) {
      plainLines.push(cleaned)
    }
  })

  if (lines.length > 0) {
    return lines
      .sort((left, right) => left.time - right.time)
      .filter((line, index, sorted) => index === 0 || line.time !== sorted[index - 1].time || line.text !== sorted[index - 1].text)
  }

  return plainLines.map((line, index) => ({
    time: index * 4,
    text: line,
  }))
}

async function pixelizeImage(file: File) {
  const objectUrl = URL.createObjectURL(file)

  try {
    const image = new Image()
    image.decoding = 'async'
    image.src = objectUrl
    await image.decode()

    const maxSourceSize = 92
    const sourceRatio = image.width / image.height
    const smallWidth = sourceRatio >= 1 ? maxSourceSize : Math.max(28, Math.round(maxSourceSize * sourceRatio))
    const smallHeight = sourceRatio >= 1 ? Math.max(28, Math.round(maxSourceSize / sourceRatio)) : maxSourceSize
    const smallCanvas = document.createElement('canvas')
    const smallContext = smallCanvas.getContext('2d', { willReadFrequently: true })
    if (!smallContext) {
      throw new Error('无法创建像素处理画布')
    }

    smallCanvas.width = smallWidth
    smallCanvas.height = smallHeight
    smallContext.imageSmoothingEnabled = false
    smallContext.drawImage(image, 0, 0, smallWidth, smallHeight)

    const imageData = smallContext.getImageData(0, 0, smallWidth, smallHeight)
    const data = imageData.data
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index]
      const green = data[index + 1]
      const blue = data[index + 2]
      const contrast = 1.18
      data[index] = Math.max(0, Math.min(255, Math.round((red - 128) * contrast + 128) >> 4 << 4))
      data[index + 1] = Math.max(0, Math.min(255, Math.round((green - 128) * contrast + 128) >> 4 << 4))
      data[index + 2] = Math.max(0, Math.min(255, Math.round((blue - 128) * contrast + 128) >> 4 << 4))
    }
    smallContext.putImageData(imageData, 0, 0)

    const scale = Math.max(3, Math.floor(420 / Math.max(smallWidth, smallHeight)))
    const outputCanvas = document.createElement('canvas')
    const outputContext = outputCanvas.getContext('2d')
    if (!outputContext) {
      throw new Error('无法生成像素照片')
    }

    outputCanvas.width = smallWidth * scale
    outputCanvas.height = smallHeight * scale
    outputContext.imageSmoothingEnabled = false
    outputContext.drawImage(smallCanvas, 0, 0, outputCanvas.width, outputCanvas.height)
    outputContext.fillStyle = 'rgba(255,255,255,0.08)'
    for (let y = 0; y < outputCanvas.height; y += scale * 2) {
      outputContext.fillRect(0, y, outputCanvas.width, 1)
    }

    return outputCanvas.toDataURL('image/png')
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function drawPixelStar(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const half = Math.max(1, Math.floor(size / 2))
  context.fillStyle = color
  context.fillRect(x - half, y, size, half)
  context.fillRect(x, y - half, half, size)
}

function drawPixelDiamond(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const unit = Math.max(2, Math.floor(size / 3))
  context.fillStyle = color
  context.fillRect(x, y - unit * 2, unit, unit)
  context.fillRect(x - unit, y - unit, unit * 3, unit)
  context.fillRect(x - unit * 2, y, unit * 5, unit)
  context.fillRect(x - unit, y + unit, unit * 3, unit)
  context.fillRect(x, y + unit * 2, unit, unit)
}

function drawPixelNote(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const unit = Math.max(2, Math.floor(size / 3))
  context.fillStyle = color
  context.fillRect(x, y - unit * 5, unit, unit * 5)
  context.fillRect(x, y - unit * 5, unit * 4, unit)
  context.fillRect(x + unit * 3, y - unit * 4, unit, unit * 2)
  context.fillRect(x - unit * 3, y - unit, unit * 4, unit * 3)
  context.fillRect(x - unit * 2, y - unit * 2, unit * 2, unit)
}

function drawPixelStreak(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const unit = Math.max(2, Math.floor(size / 4))
  context.fillStyle = color
  context.fillRect(x, y, unit * 7, unit)
  context.fillRect(x + unit * 2, y + unit, unit * 7, unit)
  context.fillStyle = '#f7fbff'
  context.fillRect(x + unit * 8, y + unit, unit, unit)
}

function drawPixelSpark(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  const unit = Math.max(1, Math.floor(size / 4))
  context.fillStyle = color
  context.fillRect(x - unit, y - unit, unit * 3, unit * 3)
  context.fillRect(x - unit * 5, y, unit * 3, unit)
  context.fillRect(x + unit * 3, y, unit * 3, unit)
  context.fillRect(x, y - unit * 5, unit, unit * 3)
  context.fillRect(x, y + unit * 3, unit, unit * 3)
}

function characterById(id: string) {
  return idols.find((idol) => idol.id === id) ?? idols[0]
}

function localizeCharacter(character: IdolCharacter, language: Language): IdolCharacter {
  if (language === 'zh') {
    return character
  }

  return {
    ...character,
    name: character.nameEn,
    role: character.roleEn,
  }
}

function HairShape({ character }: { character: IdolCharacter }) {
  if (character.kind === 'twintail') {
    return (
      <>
        <rect x="9" y="23" width="16" height="32" fill={character.hairShade} />
        <rect x="63" y="23" width="16" height="32" fill={character.hairShade} />
        <rect x="7" y="47" width="18" height="20" fill={character.hair} />
        <rect x="63" y="47" width="18" height="20" fill={character.hair} />
        <rect x="13" y="18" width="10" height="8" fill={character.accent} />
        <rect x="65" y="18" width="10" height="8" fill={character.accent} />
      </>
    )
  }

  if (character.kind === 'dj') {
    return (
      <>
        <rect x="20" y="9" width="48" height="34" fill={character.hairShade} />
        <rect x="14" y="22" width="10" height="22" fill={character.hairShade} />
        <rect x="64" y="22" width="10" height="22" fill={character.hairShade} />
        <rect x="14" y="17" width="10" height="18" fill={character.accent} />
        <rect x="64" y="17" width="10" height="18" fill={character.accent} />
        <rect x="22" y="12" width="44" height="8" fill={character.hair} />
      </>
    )
  }

  if (character.kind === 'guitar') {
    return (
      <>
        <rect x="17" y="11" width="50" height="50" fill={character.hairShade} />
        <rect x="12" y="35" width="10" height="30" fill={character.hair} />
        <rect x="58" y="35" width="16" height="36" fill={character.hair} />
        <rect x="23" y="8" width="40" height="10" fill={character.hair} />
      </>
    )
  }

  if (character.kind === 'drummer') {
    return (
      <>
        <rect x="18" y="12" width="52" height="38" fill={character.hairShade} />
        <rect x="12" y="20" width="14" height="26" fill={character.hair} />
        <rect x="62" y="20" width="14" height="26" fill={character.hair} />
        <rect x="24" y="8" width="12" height="8" fill={character.hair} />
        <rect x="38" y="6" width="14" height="10" fill={character.hair} />
        <rect x="54" y="8" width="12" height="8" fill={character.hair} />
      </>
    )
  }

  if (character.kind === 'samurai') {
    return (
      <>
        <rect x="20" y="10" width="48" height="36" fill={character.hairShade} />
        <rect x="35" y="2" width="18" height="12" fill={character.hair} />
        <rect x="16" y="24" width="12" height="28" fill={character.hair} />
        <rect x="60" y="24" width="12" height="28" fill={character.hair} />
        <rect x="24" y="12" width="40" height="8" fill={character.hair} />
      </>
    )
  }

  return (
    <>
      <rect x="18" y="13" width="52" height="38" fill={character.hairShade} />
      <rect x="14" y="5" width="14" height="18" fill={character.hair} />
      <rect x="60" y="5" width="14" height="18" fill={character.hair} />
      <rect x="18" y="2" width="10" height="8" fill={character.accent} />
      <rect x="60" y="2" width="10" height="8" fill={character.accent} />
      <rect x="24" y="10" width="40" height="10" fill={character.hair} />
    </>
  )
}

function Prop({ character }: { character: IdolCharacter }) {
  if (character.prop === 'mic') {
    return (
      <g className="prop prop-mic">
        <rect x="66" y="47" width="7" height="15" fill="#111827" />
        <rect x="63" y="43" width="12" height="8" fill={character.accent} />
        <rect x="68" y="60" width="4" height="12" fill="#f7fbff" />
      </g>
    )
  }

  if (character.prop === 'headphones') {
    return (
      <g className="prop prop-headphones">
        <rect x="18" y="17" width="8" height="20" fill="#101728" />
        <rect x="62" y="17" width="8" height="20" fill="#101728" />
        <rect x="24" y="12" width="40" height="5" fill={character.accent} />
        <rect x="17" y="22" width="6" height="10" fill="#35f7ff" />
        <rect x="65" y="22" width="6" height="10" fill="#35f7ff" />
      </g>
    )
  }

  if (character.prop === 'guitar') {
    return (
      <g className="prop prop-guitar">
        <rect x="54" y="48" width="8" height="34" fill="#3c240e" />
        <rect x="38" y="66" width="28" height="20" fill={character.accent} />
        <rect x="43" y="70" width="10" height="8" fill="#111827" />
        <rect x="62" y="42" width="7" height="11" fill="#f7fbff" />
      </g>
    )
  }

  if (character.prop === 'sticks') {
    return (
      <g className="prop prop-sticks">
        <rect x="15" y="40" width="5" height="30" fill="#fff36d" transform="rotate(-24 15 40)" />
        <rect x="66" y="40" width="5" height="30" fill="#fff36d" transform="rotate(24 66 40)" />
        <rect x="26" y="78" width="36" height="12" fill="#35f7ff" />
        <rect x="30" y="75" width="28" height="4" fill="#f7fbff" />
      </g>
    )
  }

  if (character.prop === 'blade') {
    return (
      <g className="prop prop-blade">
        <rect x="62" y="28" width="6" height="54" fill="#d8fbff" />
        <rect x="60" y="76" width="11" height="6" fill={character.accent} />
        <rect x="64" y="24" width="3" height="8" fill="#fff36d" />
      </g>
    )
  }

  return (
    <g className="prop prop-fan">
      <rect x="12" y="46" width="18" height="20" fill={character.accent} />
      <rect x="16" y="50" width="18" height="5" fill="#f7fbff" />
      <rect x="16" y="58" width="14" height="4" fill="#f7fbff" />
    </g>
  )
}

function PixelDancer({
  character,
  flip = false,
  label = true,
}: {
  character: IdolCharacter
  flip?: boolean
  label?: boolean
}) {
  return (
    <div className={`idol-card dance-${character.dance}`} style={{ '--flip': flip ? -1 : 1 } as CssVars}>
      <svg className="dancer-sprite" viewBox="0 0 88 116" role="img" aria-label={`${character.name}${character.role}`}>
        <g className="shadow-pixels">
          <rect x="18" y="104" width="52" height="6" fill="#050610" opacity="0.75" />
        </g>

        <g className="hair-back">
          <HairShape character={character} />
        </g>

        <g className="head">
          <rect x="27" y="20" width="34" height="32" fill={character.skin} />
          <rect x="27" y="18" width="34" height="8" fill={character.hair} />
          <rect x="22" y="27" width="9" height="15" fill={character.hair} />
          <rect x="57" y="27" width="9" height="15" fill={character.hair} />
          <rect x="34" y="34" width="5" height="5" fill="#152036" />
          <rect x="50" y="34" width="5" height="5" fill="#152036" />
          <rect x="38" y="45" width="12" height="3" fill="#e7687d" />
          <rect x="28" y="41" width="5" height="3" fill="#ff8da2" />
          <rect x="57" y="41" width="5" height="3" fill="#ff8da2" />
        </g>

        <g className="body">
          <rect x="31" y="55" width="26" height="23" fill={character.outfit} />
          <rect x="27" y="74" width="34" height="11" fill={character.accent} />
          <rect x="35" y="55" width="18" height="6" fill="#f7fbff" opacity="0.82" />
          <rect x="31" y="85" width="10" height="17" fill={character.skin} />
          <rect x="49" y="85" width="10" height="17" fill={character.skin} />
          <rect x="28" y="100" width="15" height="7" fill={character.boot} />
          <rect x="48" y="100" width="15" height="7" fill={character.boot} />
        </g>

        <g className="arm-left">
          <rect x="20" y="56" width="11" height="7" fill={character.skin} />
          <rect x="13" y="48" width="9" height="8" fill={character.skin} />
          <rect x="10" y="43" width="8" height="8" fill={character.accent} />
        </g>

        <g className="arm-right">
          <rect x="57" y="56" width="11" height="7" fill={character.skin} />
          <rect x="66" y="48" width="9" height="8" fill={character.skin} />
          <rect x="72" y="43" width="8" height="8" fill={character.accent} />
        </g>

        <Prop character={character} />

        <g className="sparkle-pixels">
          <rect x="8" y="12" width="4" height="4" fill={character.accent} />
          <rect x="76" y="17" width="4" height="4" fill="#f7fbff" />
          <rect x="7" y="82" width="4" height="4" fill={character.outfit} />
          <rect x="78" y="81" width="4" height="4" fill={character.hair} />
        </g>
      </svg>
      {label ? (
        <span className="dancer-name">
          <strong>{character.name}</strong>
          <small>{character.role}</small>
        </span>
      ) : null}
    </div>
  )
}

function App() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lyricInputRef = useRef<HTMLInputElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const appRef = useRef<HTMLElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceReadyRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)
  const objectUrlsRef = useRef<string[]>([])
  const autoStartRef = useRef(false)
  const lastMeterUpdateRef = useRef(0)
  const playlistListRef = useRef<HTMLDivElement | null>(null)

  const [playlist, setPlaylist] = useState<Track[]>([])
  const [trackIndex, setTrackIndex] = useState(0)
  const [playlistScrollTop, setPlaylistScrollTop] = useState(0)
  const [playlistViewportHeight, setPlaylistViewportHeight] = useState(360)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.86)
  const [effectMode, setEffectMode] = useState<EffectMode>('mix')
  const [language, setLanguage] = useState<Language>('zh')
  const [lyricLines, setLyricLines] = useState<LyricLine[]>(emptyLyricLines)
  const [lyricFileName, setLyricFileName] = useState('')
  const [pixelPhotoUrl, setPixelPhotoUrl] = useState('')
  const [pixelPhotoName, setPixelPhotoName] = useState('')
  const [status, setStatus] = useState<StatusState>({ key: 'initial' })
  const [motion, setMotion] = useState<MotionState>(defaultMotion)

  const copy = appCopy[language]
  const statusText = copy.status[status.key](status.values)
  const currentTrack = playlist[trackIndex]
  const progressPercent = duration > 0 ? Math.min(100, (progress / duration) * 100) : 0
  const activeLyricIndex = useMemo(() => {
    if (lyricLines.length === 0) {
      return -1
    }

    const index = lyricLines.findIndex((line) => line.time > progress)
    if (index === -1) {
      return lyricLines.length - 1
    }

    return Math.max(0, index - 1)
  }, [lyricLines, progress])
  const activeLyric = activeLyricIndex >= 0 ? lyricLines[activeLyricIndex] : undefined
  const previousLyric = activeLyricIndex > 0 ? lyricLines[activeLyricIndex - 1] : undefined
  const nextLyric = activeLyricIndex >= 0 ? lyricLines[activeLyricIndex + 1] : undefined
  const lyricProgress = useMemo(() => {
    if (!activeLyric) {
      return 0
    }

    const nextTime = nextLyric?.time ?? duration
    const span = Math.max(0.8, nextTime - activeLyric.time)
    return clamp(((progress - activeLyric.time) / span) * 100, 0, 100)
  }, [activeLyric, duration, nextLyric, progress])

  const playlistLabel = useMemo(() => {
    if (playlist.length === 0) {
      return copy.emptyPlaylist
    }

    return copy.playlistCount(playlist.length)
  }, [copy, playlist.length])

  const visiblePlaylist = useMemo(() => {
    if (playlist.length === 0) {
      return {
        end: 0,
        items: [] as Track[],
        start: 0,
        totalHeight: 0,
      }
    }

    const safeViewportHeight = Math.max(trackRowHeight, playlistViewportHeight)
    const start = Math.max(0, Math.floor(playlistScrollTop / trackRowHeight) - playlistOverscan)
    const visibleCount = Math.ceil(safeViewportHeight / trackRowHeight) + playlistOverscan * 2
    const end = Math.min(playlist.length, start + visibleCount)

    return {
      end,
      items: playlist.slice(start, end),
      start,
      totalHeight: playlist.length * trackRowHeight,
    }
  }, [playlist, playlistScrollTop, playlistViewportHeight])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.title = copy.appName
  }, [copy.appName, language])

  const ensureAudioGraph = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    const BrowserAudioContext =
      window.AudioContext ??
      (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext

    if (!audioContextRef.current) {
      audioContextRef.current = new BrowserAudioContext()
    }

    const audioContext = audioContextRef.current
    if (!analyserRef.current) {
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.58
      analyserRef.current = analyser
    }

    if (!sourceReadyRef.current) {
      const source = audioContext.createMediaElementSource(audio)
      source.connect(analyserRef.current)
      analyserRef.current.connect(audioContext.destination)
      sourceReadyRef.current = true
    }

    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }
  }, [])

  const playAudio = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !audio.src || !currentTrack) {
      setStatus({ key: 'selectTrackFirst' })
      return
    }

    try {
      try {
        await ensureAudioGraph()
      } catch (graphError) {
        console.warn(graphError)
        setStatus({ key: 'playingNoAnalysis' })
      }
      await audio.play()
      setIsPlaying(true)
      setStatus({ key: 'playingSync' })
    } catch (error) {
      console.error(error)
      setStatus({ key: 'playAgain' })
    }
  }, [currentTrack, ensureAudioGraph])

  const loadTracks = useCallback((tracks: Track[]) => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }

    if (tracks.length === 0) {
      setStatus({ key: 'noAudio' })
      return
    }

    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    objectUrlsRef.current = tracks
      .filter((track) => track.source !== 'dialog')
      .map((track) => track.url)

    autoStartRef.current = false
    playlistListRef.current?.scrollTo({ top: 0 })
    setPlaylistScrollTop(0)
    setPlaylist(tracks)
    setTrackIndex(0)
    setProgress(0)
    setDuration(0)
    setIsPlaying(false)
    setLyricLines(emptyLyricLines)
    setLyricFileName('')
    setStatus({ key: 'loadedTracks', values: { count: tracks.length } })
  }, [])

  const tracksFromFiles = useCallback((files: FileList | File[]) => {
    return Array.from(files)
      .filter((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        return Boolean(extension && audioExtensions.includes(extension))
      })
      .map((file) => {
        const url = URL.createObjectURL(file)
        return {
          id: makeId('file'),
          name: file.name,
          size: file.size,
          url,
          source: 'input' as const,
        }
      })
  }, [])

  const openSelectedTracks = useCallback(
    (selectedFiles: Array<{ name: string; url: string; size?: number }>, source: Track['source']) => {
      loadTracks(
        selectedFiles.map((file) => ({
          id: makeId(source),
          name: file.name,
          url: file.url,
          size: file.size,
          source,
        })),
      )
    },
    [loadTracks],
  )

  const handleOpen = useCallback(async () => {
    if (window.pixelStage) {
      const selectedFiles = await window.pixelStage.openAudioFiles()
      if (selectedFiles.length === 0) {
        setStatus({ key: 'noSelection' })
        return
      }

      openSelectedTracks(selectedFiles, 'dialog')
      return
    }

    fileInputRef.current?.click()
  }, [openSelectedTracks])

  const handleOpenFolder = useCallback(async () => {
    if (!window.pixelStage) {
      setStatus({ key: 'webNoFolder' })
      fileInputRef.current?.click()
      return
    }

    const selectedFiles = await window.pixelStage.openAudioFolder()
    if (selectedFiles.length === 0) {
      setStatus({ key: 'noAudioInFolder' })
      return
    }

    openSelectedTracks(selectedFiles, 'folder')
  }, [openSelectedTracks])

  const handleFileInput = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.files) {
        loadTracks(tracksFromFiles(event.currentTarget.files))
        event.currentTarget.value = ''
      }
    },
    [loadTracks, tracksFromFiles],
  )

  const handleDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault()
      const tracks = tracksFromFiles(Array.from(event.dataTransfer.files)).map((track) => ({
        ...track,
        source: 'drop' as const,
      }))
      loadTracks(tracks)
    },
    [loadTracks, tracksFromFiles],
  )

  const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault()
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) {
      setStatus({ key: 'selectTrackFirst' })
      return
    }

    if (audio.paused) {
      void playAudio()
    } else {
      audio.pause()
      setIsPlaying(false)
      setStatus({ key: 'paused' })
    }
  }, [currentTrack, playAudio])

  const playTrackAt = useCallback(
    (index: number) => {
      if (index < 0 || index >= playlist.length) {
        return
      }

      if (index === trackIndex) {
        void playAudio()
        return
      }

      autoStartRef.current = true
      setTrackIndex(index)
      setStatus({ key: 'preparing' })
    },
    [playAudio, playlist.length, trackIndex],
  )

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) {
      setStatus({ key: 'playlistEmpty' })
      return
    }

    if (playlist.length === 1) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        setProgress(0)
        setStatus({ key: isPlaying ? 'restartSong' : 'restartPrompt' })
        if (isPlaying) {
          void playAudio()
        }
      }
      return
    }

    autoStartRef.current = isPlaying
    setTrackIndex((index) => (index + 1) % playlist.length)
  }, [isPlaying, playAudio, playlist.length])

  const handleAudioEnded = useCallback(() => {
    if (playlist.length === 0) {
      setIsPlaying(false)
      return
    }

    if (playlist.length === 1) {
      setIsPlaying(false)
      setProgress(duration)
      setStatus({ key: 'endedReplay' })
      return
    }

    autoStartRef.current = true
    setStatus({ key: 'autoNext' })
    setTrackIndex((index) => (index + 1) % playlist.length)
  }, [duration, playlist.length])

  const previousTrack = useCallback(() => {
    if (playlist.length === 0) {
      setStatus({ key: 'playlistEmpty' })
      return
    }

    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setProgress(0)
      return
    }

    if (playlist.length === 1) {
      if (audio) {
        audio.currentTime = 0
      }
      setProgress(0)
      setStatus({ key: isPlaying ? 'restartSong' : 'restartPrompt' })
      return
    }

    autoStartRef.current = isPlaying
    setTrackIndex((index) => (index - 1 + playlist.length) % playlist.length)
  }, [isPlaying, playlist.length])

  const handleSeek = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextTime = Number(event.currentTarget.value)
    const audio = audioRef.current
    if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = nextTime
      setProgress(nextTime)
    }
  }, [])

  const handleVolume = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const nextVolume = Number(event.currentTarget.value)
    const audio = audioRef.current
    if (audio) {
      audio.volume = nextVolume
    }
    setVolume(nextVolume)
  }, [])

  const handleEffectMode = useCallback((nextMode: EffectMode) => {
    setEffectMode(nextMode)
    setStatus({ key: 'effectChanged', values: { mode: nextMode } })
  }, [])

  const handleLyricInput = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) {
      return
    }

    try {
      const text = await file.text()
      const nextLines = parseLyrics(text)
      if (nextLines.length === 0) {
        setStatus({ key: 'lyricEmpty' })
        return
      }

      setLyricLines(nextLines)
      setLyricFileName(file.name)
      setStatus({ key: 'lyricImported', values: { file: file.name } })
    } catch (error) {
      console.error(error)
      setStatus({ key: 'lyricFail' })
    }
  }, [])

  const handlePhotoInput = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (!file) {
      return
    }

    try {
      setStatus({ key: 'photoProcessing' })
      const dataUrl = await pixelizeImage(file)
      setPixelPhotoUrl(dataUrl)
      setPixelPhotoName(file.name)
      setStatus({ key: 'photoDone', values: { file: file.name } })
    } catch (error) {
      console.error(error)
      setStatus({ key: 'photoFail' })
    }
  }, [])

  const downloadPixelPhoto = useCallback(() => {
    if (!pixelPhotoUrl) {
      setStatus({ key: 'importPhotoFirst' })
      return
    }

    const link = document.createElement('a')
    link.href = pixelPhotoUrl
    link.download = `${pixelPhotoName.replace(/\.[^.]+$/, '') || copy.pixelPhotoFallback}-pixel.png`
    link.click()
  }, [copy.pixelPhotoFallback, pixelPhotoName, pixelPhotoUrl])

  const handlePlaylistScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    setPlaylistScrollTop(event.currentTarget.scrollTop)
  }, [])

  useEffect(() => {
    const node = playlistListRef.current
    if (!node) {
      return
    }

    const updateViewportHeight = () => {
      setPlaylistViewportHeight(node.clientHeight)
    }

    updateViewportHeight()
    const observer =
      'ResizeObserver' in window ? new ResizeObserver(updateViewportHeight) : undefined
    observer?.observe(node)
    window.addEventListener('resize', updateViewportHeight)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateViewportHeight)
    }
  }, [])

  useEffect(() => {
    const node = playlistListRef.current
    if (!node || playlist.length === 0) {
      return
    }

    const rowTop = trackIndex * trackRowHeight
    const rowBottom = rowTop + trackRowHeight
    const viewportTop = node.scrollTop
    const viewportBottom = viewportTop + node.clientHeight

    if (rowTop < viewportTop) {
      node.scrollTop = rowTop
      setPlaylistScrollTop(rowTop)
    } else if (rowBottom > viewportBottom) {
      const nextScrollTop = Math.max(0, rowBottom - node.clientHeight)
      node.scrollTop = nextScrollTop
      setPlaylistScrollTop(nextScrollTop)
    }
  }, [playlist.length, trackIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) {
      return
    }

    audio.src = currentTrack.url
    audio.load()
    setProgress(0)
    setDuration(0)
    setIsPlaying(false)

    if (autoStartRef.current) {
      autoStartRef.current = false
      window.setTimeout(() => {
        void playAudio()
      }, 60)
    }
  }, [currentTrack, playAudio])

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
    }
  }, [volume])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = appRef.current
    if (!canvas || !host) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const particleColors = ['#35f7ff', '#ff5ec8', '#fff36d', '#78ff6b', '#f7fbff']
    const particleKinds: ParticleKind[] = ['rain', 'note', 'diamond', 'streak', 'spark']
    const particles: VisualParticle[] = Array.from({ length: 300 }, (_, index) => ({
      x: Math.random(),
      y: Math.random(),
      size: 2 + (index % 7),
      speed: 0.1 + Math.random() * 0.62,
      color: particleColors[index % particleColors.length],
      phase: Math.random() * Math.PI * 2,
      kind: particleKinds[index % particleKinds.length],
      drift: -0.42 + Math.random() * 0.84,
    }))

    const frequencyData = new Uint8Array(1024)
    let bassFloor = 0.12
    let beatPulse = 0
    let kickPulse = 0
    let snarePulse = 0
    let hatPulse = 0
    let previousTime = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.floor(rect.width * ratio))
      canvas.height = Math.max(1, Math.floor(rect.height * ratio))
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const render = (time: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const analyser = analyserRef.current
      const delta = previousTime ? Math.min(48, time - previousTime) : 16
      const showBars = effectMode === 'mix' || effectMode === 'rain' || effectMode === 'notes' || effectMode === 'beam'
      const showRadial = effectMode === 'mix' || effectMode === 'crystal' || effectMode === 'burst'
      const showOrbitShards = effectMode === 'mix' || effectMode === 'crystal' || effectMode === 'burst'
      const showScanBeams = effectMode === 'mix' || effectMode === 'beam'
      previousTime = time

      let bass = 0.08 + Math.sin(time * 0.0018) * 0.025
      let mid = 0.09 + Math.sin(time * 0.0011) * 0.025
      let treble = 0.1 + Math.cos(time * 0.0012) * 0.03
      let energy = 0.12 + Math.sin(time * 0.0014) * 0.03

      if (analyser) {
        const activeData = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(activeData)
        frequencyData.set(activeData.slice(0, frequencyData.length))
        bass = clamp(average(activeData, 0, 28) / 255)
        mid = clamp(average(activeData, 34, 130) / 255)
        treble = clamp(average(activeData, 150, 360) / 255)
        energy = clamp(average(activeData, 0, 260) / 220)
      } else {
        for (let index = 0; index < frequencyData.length; index += 1) {
          frequencyData[index] =
            30 + Math.sin(time * 0.003 + index * 0.23) * 20 + Math.cos(index * 0.09) * 18
        }
      }

      bassFloor = bassFloor * 0.965 + bass * 0.035
      if (bass > Math.max(0.24, bassFloor + 0.09)) {
        beatPulse = 1
        kickPulse = 1
      }
      if (mid > 0.28 && mid > energy * 0.9) {
        snarePulse = Math.max(snarePulse, 0.8)
      }
      if (treble > 0.2) {
        hatPulse = Math.max(hatPulse, treble)
      }

      const decay = Math.pow(0.001, delta / 760)
      beatPulse *= decay
      kickPulse *= Math.pow(0.001, delta / 640)
      snarePulse *= Math.pow(0.001, delta / 520)
      hatPulse *= Math.pow(0.001, delta / 380)

      const nextMotion = {
        energy: clamp(Math.max(0.05, energy)),
        bass: clamp(Math.max(0, bass)),
        mid: clamp(Math.max(0, mid)),
        treble: clamp(Math.max(0, treble)),
        beat: clamp(Math.max(beatPulse, energy * 0.42)),
        kick: clamp(Math.max(kickPulse, bass)),
        snare: clamp(Math.max(snarePulse, mid * 0.85)),
        hat: clamp(Math.max(hatPulse, treble)),
      }

      host.style.setProperty('--energy', nextMotion.energy.toFixed(3))
      host.style.setProperty('--bass', nextMotion.bass.toFixed(3))
      host.style.setProperty('--mid', nextMotion.mid.toFixed(3))
      host.style.setProperty('--treble', nextMotion.treble.toFixed(3))
      host.style.setProperty('--beat', nextMotion.beat.toFixed(3))
      host.style.setProperty('--kick', nextMotion.kick.toFixed(3))
      host.style.setProperty('--snare', nextMotion.snare.toFixed(3))
      host.style.setProperty('--hat', nextMotion.hat.toFixed(3))
      host.style.setProperty('--tempo', `${Math.max(0.34, 0.82 - nextMotion.energy * 0.38)}s`)

      if (time - lastMeterUpdateRef.current > 80) {
        lastMeterUpdateRef.current = time
        setMotion(nextMotion)
      }

      context.clearRect(0, 0, width, height)
      context.fillStyle = '#070611'
      context.fillRect(0, 0, width, height)

      context.globalAlpha = 0.88
      context.fillStyle = '#0d1023'
      for (let x = 0; x < width; x += 24) {
        context.fillRect(x, 0, 1, height)
      }
      for (let y = 0; y < height; y += 24) {
        context.fillRect(0, y, width, 1)
      }

      const horizon = height * 0.56
      context.globalAlpha = 1
      if (showBars) {
        for (let index = 0; index < 96; index += 1) {
          const value = frequencyData[(index * 4) % frequencyData.length] / 255
          const barWidth = Math.max(5, width / 116)
          const x = index * (barWidth + 3) + ((time * (0.02 + nextMotion.beat * 0.04)) % (barWidth + 3)) - 36
          const barHeight = 18 + value * height * (0.16 + nextMotion.kick * 0.12)
          context.fillStyle = index % 3 === 0 ? '#35f7ff' : index % 3 === 1 ? '#ff5ec8' : '#fff36d'
          context.fillRect(x, horizon - barHeight, barWidth, barHeight)
          context.fillStyle = '#ffffff'
          context.globalAlpha = 0.32 + nextMotion.hat * 0.38
          context.fillRect(x, horizon - barHeight - 5, barWidth, 3)
          context.globalAlpha = 1
        }
      }

      const centerX = width / 2
      const centerY = height * 0.48
      const ringCount = 58
      if (showRadial) {
        for (let index = 0; index < ringCount; index += 1) {
          const angle = (Math.PI * 2 * index) / ringCount + time * (0.0003 + nextMotion.energy * 0.0006)
          const value = frequencyData[(index * 9) % frequencyData.length] / 255
          const inner = 92 + nextMotion.beat * 30
          const outer = inner + 14 + value * (72 + nextMotion.kick * 72)
          const x1 = centerX + Math.cos(angle) * inner
          const y1 = centerY + Math.sin(angle) * inner
          const x2 = centerX + Math.cos(angle) * outer
          const y2 = centerY + Math.sin(angle) * outer
          context.strokeStyle = index % 2 === 0 ? '#35f7ff' : '#ff5ec8'
          context.lineWidth = 2 + nextMotion.beat * 3
          context.beginPath()
          context.moveTo(x1, y1)
          context.lineTo(x2, y2)
          context.stroke()
        }
      }

      context.strokeStyle = '#fff36d'
      context.lineWidth = 2
      context.globalAlpha = 0.48 + nextMotion.beat * 0.46
      if (effectMode !== 'rain') {
        for (let ring = 0; ring < 4; ring += 1) {
          context.beginPath()
          context.arc(centerX, centerY, 70 + ring * 42 + nextMotion.beat * 44, 0, Math.PI * 2)
          context.stroke()
        }
      }
      context.globalAlpha = 1

      particles.forEach((particle, index) => {
        const particleKind =
          effectMode === 'rain'
            ? 'rain'
            : effectMode === 'notes'
              ? 'note'
              : effectMode === 'crystal'
                ? 'diamond'
                : effectMode === 'beam'
                  ? 'streak'
                  : effectMode === 'burst'
                    ? 'spark'
                    : particle.kind
        const speedBoost =
          particleKind === 'streak'
            ? nextMotion.hat * 3.8
            : particleKind === 'note'
              ? nextMotion.mid * 1.6
              : nextMotion.energy * 1.4 + nextMotion.kick * 1.5
        particle.y += (particle.speed + speedBoost) / height
        particle.x +=
          Math.sin(time * 0.001 + particle.phase) * (0.0007 + nextMotion.hat * 0.0016) +
          (particleKind === 'streak' ? (0.9 + nextMotion.treble * 2.2) / width : particle.drift * 0.00045)
        if (particle.y > 1.08 || particle.x > 1.08) {
          particle.y = -0.08 - Math.random() * 0.08
          particle.x = Math.random()
        }
        if (particle.x < -0.08) {
          particle.x = 1.08
        }
        const x = particle.x * width
        const y = particle.y * height
        const pulse = 1 + Math.sin(time * 0.006 + index) * 0.5 + nextMotion.beat * 2.4
        const size = Math.max(2, particle.size * pulse)
        context.globalAlpha =
          particleKind === 'streak' ? 0.32 + nextMotion.hat * 0.48 : 0.5 + nextMotion.beat * 0.34

        if (particleKind === 'note') {
          drawPixelNote(context, x, y, size + 5 + nextMotion.mid * 8, particle.color)
        } else if (particleKind === 'diamond') {
          drawPixelDiamond(context, x, y, size + nextMotion.kick * 7, particle.color)
        } else if (particleKind === 'streak') {
          drawPixelStreak(context, x, y, size + 8 + nextMotion.treble * 10, particle.color)
        } else if (particleKind === 'spark') {
          drawPixelSpark(context, x, y, size + nextMotion.beat * 8, particle.color)
        } else {
          drawPixelStar(context, x, y, size, particle.color)
        }
      })
      context.globalAlpha = 1

      if (showOrbitShards) {
        for (let index = 0; index < 28; index += 1) {
          const angle = (Math.PI * 2 * index) / 28 + time * 0.0012
          const radius = 120 + nextMotion.kick * 170 + ((time * 0.035 + index * 18) % 92)
          const x = centerX + Math.cos(angle) * radius
          const y = centerY + Math.sin(angle) * radius * 0.62
          context.globalAlpha = 0.16 + nextMotion.kick * 0.52
          drawPixelDiamond(
            context,
            x,
            y,
            4 + ((index % 4) + 1) * 2 + nextMotion.beat * 8,
            particleColors[index % particleColors.length],
          )
        }
      }
      context.globalAlpha = 1

      if (showScanBeams) {
        context.globalAlpha = 0.1 + nextMotion.treble * 0.34
        for (let index = 0; index < 7; index += 1) {
          const sweepX = ((time * (0.025 + nextMotion.hat * 0.08) + index * width * 0.19) % (width + 160)) - 80
          context.fillStyle = index % 2 === 0 ? '#35f7ff' : '#ff5ec8'
          context.fillRect(sweepX, 0, 4 + nextMotion.hat * 8, height)
        }
      }
      context.globalAlpha = 1

      context.fillStyle = 'rgba(255,255,255,0.08)'
      for (let y = 0; y < height; y += 4) {
        context.fillRect(0, y, width, 1)
      }

      animationFrameRef.current = window.requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    animationFrameRef.current = window.requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [effectMode])

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      void audioContextRef.current?.close()
    }
  }, [])

  return (
    <main
      ref={appRef}
      className="app-shell"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={
        {
          '--energy': motion.energy,
          '--bass': motion.bass,
          '--mid': motion.mid,
          '--treble': motion.treble,
          '--beat': motion.beat,
          '--kick': motion.kick,
          '--snare': motion.snare,
          '--hat': motion.hat,
          '--progress': `${progressPercent}%`,
          '--volume': `${volume * 100}%`,
          '--tempo': `${Math.max(0.34, 0.82 - motion.energy * 0.38)}s`,
        } as CssVars
      }
    >
      <canvas ref={canvasRef} className="visualizer-canvas" aria-hidden="true" />
      <div className="pixel-vignette" aria-hidden="true" />

      <div className="dancer-field">
        {dancerSlots.map((slot) => {
          const character = localizeCharacter(characterById(slot.characterId), language)
          return (
            <div
              key={slot.id}
              className="dancer-slot"
              style={
                {
                  '--left': slot.left,
                  '--top': slot.top,
                  '--scale': slot.scale,
                  '--delay': slot.delay,
                  '--layer': slot.layer,
                } as CssVars
              }
            >
              <PixelDancer character={character} flip={slot.flip} />
            </div>
          )
        })}
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className="eyeline">{copy.eyeline}</p>
            <h1>{copy.appName}</h1>
          </div>
        </div>
        <div className="status-strip" aria-label={copy.statusAria}>
          <span>{playlistLabel}</span>
          <span>{isPlaying ? copy.playing : copy.standby}</span>
          <span>{copy.beat(Math.round(motion.beat * 100))}</span>
          <button
            type="button"
            className="language-toggle"
            onClick={() => setLanguage((nextLanguage) => (nextLanguage === 'zh' ? 'en' : 'zh'))}
            aria-label={copy.switchLanguageAria}
          >
            {copy.switchLanguage}
          </button>
        </div>
      </header>

      <section className="stage-layout" aria-label={copy.playerAria}>
        <aside className="side-panel playlist-panel">
          <div className="panel-heading">
            <span>{copy.playlist}</span>
            <div className="import-actions">
              <button type="button" onClick={handleOpen}>
                {copy.chooseMusic}
              </button>
              <button type="button" onClick={handleOpenFolder}>
                {copy.chooseFolder}
              </button>
            </div>
          </div>

          <div ref={playlistListRef} className="playlist-list" onScroll={handlePlaylistScroll}>
            {playlist.length === 0 ? (
              <button type="button" className="empty-drop" onClick={handleOpen}>
                <span>{copy.dropMusic}</span>
                <strong>{copy.dropOrChoose}</strong>
                <small>{copy.audioSupport}</small>
              </button>
            ) : (
              <div className="playlist-virtual-space" style={{ height: visiblePlaylist.totalHeight }}>
                {visiblePlaylist.items.map((track, itemIndex) => {
                  const index = visiblePlaylist.start + itemIndex
                  return (
                    <button
                      key={track.id}
                      type="button"
                      className={`track-row ${index === trackIndex ? 'is-active' : ''}`}
                      style={{ top: `${index * trackRowHeight}px` }}
                      onClick={() => playTrackAt(index)}
                    >
                      <span className="track-number">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="track-info">
                        <strong>{track.name}</strong>
                        <small>{formatSize(track.size, language)}</small>
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </aside>

        <section className="center-stage" aria-label={copy.rhythmStage}>
          <div className="stage-title">
            <span>{copy.idolStage}</span>
            <strong>{currentTrack?.name ?? copy.waitingFirstTrack}</strong>
          </div>

          <div className="core-stage" aria-label={copy.lyricStageAria}>
            <div className="equalizer-crown">
              {Array.from({ length: 34 }, (_, index) => (
                <span key={index} style={{ '--bar': index } as CssVars} />
              ))}
            </div>
            {pixelPhotoUrl ? (
              <figure className="pixel-photo-card">
                <img src={pixelPhotoUrl} alt={copy.photoAlt} />
                <figcaption>
                  <span>{copy.pixelPhoto}</span>
                  <strong>{pixelPhotoName}</strong>
                </figcaption>
              </figure>
            ) : null}
            <div className="core-disc">
              <span className="disc-pixel one" />
              <span className="disc-pixel two" />
              <span className="disc-pixel three" />
              <span className="disc-label">{copy.discLabel}</span>
            </div>
            {lyricLines.length > 0 ? (
              <div
                className="lyric-stage has-lyrics"
                style={{ '--lyric-progress': `${lyricProgress}%` } as CssVars}
                aria-live="polite"
              >
                <span>{copy.lyricSync}</span>
                <small>{previousLyric?.text ?? '◆ ◆ ◆'}</small>
                <strong>{activeLyric?.text ?? '♪'}</strong>
                <i aria-hidden="true" />
                <small>{nextLyric?.text ?? '♪'}</small>
              </div>
            ) : null}
            <div className="lead-troupe">
              {featuredIds.map((id, index) => (
                <div key={id} className={`lead-idol lead-idol-${index + 1}`}>
                  <PixelDancer
                    character={localizeCharacter(characterById(id), language)}
                    flip={index === 1}
                    label={false}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="transport-panel">
            <div className="now-playing">
              <span>{copy.currentPlaying}</span>
              <strong>{currentTrack?.name ?? copy.openFirstTrack}</strong>
              <small>{statusText}</small>
            </div>

            <div className="transport-buttons">
              <button type="button" onClick={previousTrack} aria-label={copy.previous} disabled={!currentTrack}>
                {copy.previous}
              </button>
              <button
                type="button"
                className="play-button"
                onClick={togglePlay}
                aria-label={isPlaying ? copy.pause : copy.play}
                disabled={!currentTrack}
              >
                {isPlaying ? copy.pause : copy.play}
              </button>
              <button type="button" onClick={nextTrack} aria-label={copy.next} disabled={!currentTrack}>
                {copy.next}
              </button>
            </div>

            <label className="seek-control">
              <span>{formatTime(progress)}</span>
              <input
                type="range"
                min="0"
                max={Math.max(0, duration)}
                step="0.1"
                value={Math.min(progress, duration || 0)}
                onChange={handleSeek}
                aria-label={copy.seekAria}
                disabled={!currentTrack || duration <= 0}
              />
              <span>{formatTime(duration)}</span>
            </label>
          </div>
        </section>

        <aside className="side-panel mix-panel">
          <div className="panel-heading">
            <span>{copy.stageResponse}</span>
            <strong>{copy.audioAnalysis}</strong>
          </div>

          <div className="meter-stack">
            <label>
              <span>{copy.bass}</span>
              <meter min="0" max="1" value={motion.bass} />
            </label>
            <label>
              <span>{copy.mid}</span>
              <meter min="0" max="1" value={motion.mid} />
            </label>
            <label>
              <span>{copy.treble}</span>
              <meter min="0" max="1" value={motion.treble} />
            </label>
            <label>
              <span>{copy.motionIntensity}</span>
              <meter min="0" max="1" value={motion.beat} />
            </label>
          </div>

          <label className="volume-control">
            <span>{copy.volume}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              aria-label={copy.volume}
            />
            <strong>{Math.round(volume * 100)}%</strong>
          </label>

          <div className="creative-panel" aria-label={copy.creativeTools}>
            <div className="creative-panel-title">
              <span>{copy.creativeTools}</span>
              <strong>{lyricLines.length > 0 ? copy.lyricLines(lyricLines.length) : copy.localProcessing}</strong>
            </div>
            <div className="creative-actions">
              <button type="button" onClick={() => lyricInputRef.current?.click()}>
                {copy.importLyrics}
              </button>
              <button type="button" onClick={() => photoInputRef.current?.click()}>
                {copy.importPhoto}
              </button>
              <button type="button" onClick={downloadPixelPhoto} disabled={!pixelPhotoUrl}>
                {copy.savePixel}
              </button>
            </div>
            <small>
              {lyricFileName || 'LRC/TXT'} · {pixelPhotoName || copy.localPixelize}
            </small>
          </div>

          <div className="effect-panel" aria-label={copy.effectMode}>
            <div className="effect-panel-title">
              <span>{copy.effectMode}</span>
              <strong>{effectModeLabels[language][effectMode]}</strong>
            </div>
            <div className="effect-grid">
              {effectModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  className={mode.id === effectMode ? 'is-active' : ''}
                  aria-pressed={mode.id === effectMode}
                  onClick={() => handleEffectMode(mode.id)}
                >
                  {effectModeLabels[language][mode.id]}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <audio
        ref={audioRef}
        onLoadedMetadata={(event) => {
          const nextDuration = event.currentTarget.duration
          setDuration(Number.isFinite(nextDuration) ? nextDuration : 0)
        }}
        onCanPlay={() => {
          if (currentTrack && !isPlaying) {
            setStatus({ key: 'readyPlay' })
          }
        }}
        onError={() => {
          setIsPlaying(false)
          setStatus({ key: 'cannotPlay' })
        }}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleAudioEnded}
      />
      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept="audio/*"
        multiple
        onChange={handleFileInput}
      />
      <input
        ref={lyricInputRef}
        className="visually-hidden"
        type="file"
        accept=".lrc,.txt,text/plain"
        onChange={handleLyricInput}
      />
      <input
        ref={photoInputRef}
        className="visually-hidden"
        type="file"
        accept="image/*"
        onChange={handlePhotoInput}
      />
    </main>
  )
}

export default App
