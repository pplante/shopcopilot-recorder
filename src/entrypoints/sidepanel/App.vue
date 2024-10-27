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
      :label="activeRecording ? 'Stop Recording' : 'Start Recording'"
      :severity="activeRecording ? 'danger' : 'primary'"
      icon="pi pi-camera"
      @click="activeRecording ? stopRecording() : startNewRecording()"
    />

    <RuleBuilder v-if="activeRecording" v-model="activeRecording" :allow-removal="false" title="Active Recording" />

    <RuleBuilder
      v-for="(recording, index) in recordings"
      :key="recording.tabId"
      v-model="recordings[index]"
    />
  </div>
</template>
