<script lang="ts" setup>
import '@/styles/styles'

const props = defineProps({
  targetRect: {
    type: Object as PropType<DOMRect>,
    required: true,
  },
})

const elementOverlayStyles = computed(() => {
  return {
    display: 'block',
    top: `${props.targetRect.top + window.scrollY}px`,
    left: `${props.targetRect.left + window.scrollX}px`,
    width: `${props.targetRect.width}px`,
    height: `${props.targetRect.height}px`,
  }
})
</script>

<template>
  <div :style="elementOverlayStyles" class="scr-element-overlay" />
</template>

<style scoped>
.scr-element-overlay {
  position: absolute;
  pointer-events: none;
  border: 3px dotted green;
  background-color: rgba(0, 255, 0, 0.1);
  z-index: 999999999;
}
</style>
