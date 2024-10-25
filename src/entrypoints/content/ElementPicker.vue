<script lang="ts" setup>
import type { Ref } from 'vue'
import ElementOverlay from '@/entrypoints/content/ElementOverlay.vue'
import { backgroundMessenger } from '@/lib/backgroundMessenger'
import { extensionStorage } from '@/lib/extStorage'
import { getCssSelector } from 'css-selector-generator'
import '@/styles/styles'

const elementPicking = ref(false)
const picker = useTemplateRef<HTMLElement>('element-picker')
const targetRect: Ref<DOMRect | null> = ref(null)
const actionsToIntercept = ['click', 'mousedown', 'mouseup']
const isRecording = ref(false)

function isElementPicker(e: Event) {
  return picker.value?.contains(e.target as Node)
}

function OnMouseOver(e: MouseEvent) {
  if (!elementPicking.value || isElementPicker(e)) {
    return
  }

  actionsToIntercept.forEach(event => e.target?.addEventListener(event, blockEvent, true))
  targetRect.value = (e.target as HTMLElement).getBoundingClientRect()
}

function OnMouseOut(e: MouseEvent) {
  if (!elementPicking.value) {
    return
  }

  actionsToIntercept.forEach(event => e.target?.removeEventListener(event, blockEvent, true))
}

async function elementClicked(e: Event) {
  if (!elementPicking.value || isElementPicker(e)) {
    return
  }

  elementPicking.value = false
  targetRect.value = null

  const cssSelector = getCssSelector(e.target as HTMLElement)

  void backgroundMessenger.sendMessage('addElementAction', {
    action: 'disable',
    selector: cssSelector,
  })
}

function blockEvent(e: Event) {
  e.preventDefault()
  e.stopPropagation()
  e.stopImmediatePropagation()
}

onMounted(() => {
  extensionStorage.onChange('activeRecording', (val: TabRecording | null) => {
    if (val !== null) {
      backgroundMessenger.sendMessage('isTabRecording', undefined)
        .then(tabRecording => isRecording.value = tabRecording)
        .catch(() => isRecording.value = false)
    }
    else {
      isRecording.value = false
    }
  })

  document.body.addEventListener('click', elementClicked, { capture: true, passive: false })
  document.body.addEventListener('mouseover', OnMouseOver, { capture: true, passive: true })
  document.body.addEventListener('mouseout', OnMouseOut, { capture: true, passive: true })
})
</script>

<template>
  <template v-if="isRecording">
    <div
      ref="element-picker"
      sc-bottom="5"
      sc-position="fixed"
      sc-right="5"
      sc-z="99999999999"
    >
      <Button
        :icon="`pi ${elementPicking ? 'pi-times' : 'pi-plus'}`"
        :label="elementPicking ? 'Cancel' : 'Pick Element'"
        :severity="elementPicking ? 'danger' : 'primary'"
        raised
        rounded
        size="large"
        @click="elementPicking = !elementPicking"
      />
    </div>

    <ElementOverlay v-if="targetRect" :target-rect="targetRect" />
  </template>
</template>

<style>
@import "@/styles/element-picker-colors.css";

:root {
  --scr-action-color: rgba(0, 0, 0, 0.5);
}

.scr-selected-element {
  outline: var(--scr-action-color) dashed 4px !important;
}
</style>
