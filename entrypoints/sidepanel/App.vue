<script lang="ts" setup>
/* eslint-disable no-console */
import type { TabRecording } from '@/lib/resourceRecord'
import { backgroundMessenger } from '@/lib/backgroundMessenger'
import { extensionStorage } from '@/lib/extStorage'
import { ref } from 'vue'

const activeRecording: Ref<TabRecording | null> = ref(null)
const recordings: Ref<TabRecording[]> = ref([])

async function startNewRecording() {
  await backgroundMessenger.sendMessage('startRecording', undefined)
}

async function stopRecording() {
  await backgroundMessenger.sendMessage('stopRecording', undefined)
}

onMounted(async () => {
  activeRecording.value = await extensionStorage.getItem('activeRecording')
  recordings.value = await extensionStorage.getItem('tabRecordings') ?? []

  extensionStorage.onChange('activeRecording', (val: TabRecording | null) => {
    console.log('activeRecording', val)
    activeRecording.value = val
  })

  extensionStorage.onChange('tabRecordings', (val: TabRecording[]) => recordings.value = val)
})
</script>

<template>
  <div sc-flex="~ col" sc-gap="4">
    <Button
      v-if="!activeRecording"
      icon="pi pi-camera"
      label="Start Recording"
      @click="startNewRecording"
    />
    <Button
      v-else
      icon="pi pi-camera"
      label="Stop Recording"
      severity="danger"
      @click="stopRecording"
    />

    <RuleBuilder v-if="activeRecording" :allow-removal="false" :recording="activeRecording" title="Active Recording" />

    <RecordingList :recordings="recordings" />
  </div>
</template>
