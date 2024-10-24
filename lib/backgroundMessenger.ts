import type { ElementAction, TabRecording } from '@/lib/resourceRecord'
import { defineExtensionMessaging } from '@webext-core/messaging'

interface ProtocolMap {
  startRecording: () => void
  stopRecording: () => void
  removeRecording: (recordingId: string) => void
  activeRecordingChanged: (recording: TabRecording | null) => void
  isTabRecording: () => boolean

  addElementAction: (selector: ElementAction) => void
  removeElementAction: (selectorId: string) => void
}

export const backgroundMessenger = defineExtensionMessaging<ProtocolMap>()
