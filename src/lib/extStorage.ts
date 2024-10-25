import type { ElementAction, TabRecording } from '@/lib/resourceRecord'
import { defineExtensionStorage } from '@webext-core/storage'

export interface ExtensionStorageSchema {
  installDate: number
  elementActions: ElementAction[]
  activeRecording: TabRecording | null
  tabRecordings: TabRecording[]
}

export const extensionStorage = defineExtensionStorage<ExtensionStorageSchema>(
  browser.storage.local,
)
