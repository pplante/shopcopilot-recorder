<script lang="ts" setup>
import type { TabRecording } from '@/lib/resourceRecord'

const props = defineProps({
  recordings: Array as PropType<TabRecording[]>,
})
</script>

<template>
  <template v-for="recording in props.recordings" :key="recording.tabId">
    <RuleBuilder :recording="recording" />
  </template>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
