export type OpenedAudioFile = {
  name: string
  url: string
  path?: string
  size?: number
}

declare global {
  interface Window {
    pixelStage?: {
      openAudioFiles: () => Promise<OpenedAudioFile[]>
      openAudioFolder: () => Promise<OpenedAudioFile[]>
    }
  }
}
