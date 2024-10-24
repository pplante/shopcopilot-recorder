<script lang="ts" setup>
import type { ElementAction } from '@/lib/resourceRecord'
import { backgroundMessenger } from '@/lib/backgroundMessenger'

import '@/styles/element-picker-colors.css'

const props = defineProps({
  modelValue: {
    type: Object as PropType<ElementAction>,
    required: true,
  },
})

const action = ref(props.modelValue.action)
const selectorText = ref(props.modelValue.selector)

const actions = [
  { label: 'Hide', value: 'hide' },
  { label: 'Enable', value: 'enable' },
  { label: 'Disable', value: 'disable' },
  { label: 'Remove', value: 'remove' },
]
function getActionLabel(value: string) {
  return actions.find(a => a.value === value)?.label
}

function removeAction() {
  void backgroundMessenger.sendMessage('removeElementAction', props.modelValue.id)
}

function isSelectorValid() {
  try {
    document.createDocumentFragment().querySelector(selectorText.value)
    return true
  }
  catch {

  }

  return false
}

watch([selectorText, action], () => {
  if (isSelectorValid()) {
    void backgroundMessenger.sendMessage('addElementAction', {
      id: props.modelValue.id,
      action: action.value,
      selector: selectorText.value.trim(),
    })
  }
})
</script>

<template>
  <Panel>
    <template #header>
      <IftaLabel>
        <Select
          v-model="action" :options="actions" fluid
          input-id="dd-element-action" option-label="label"
          option-value="value"
          placeholder="Select an action"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value" class="sc-flex sc-items-center">
              <div :class="`sc-mr-2 scr-action-color scr-action-${slotProps.value}`" />
              <div v-text="getActionLabel(slotProps.value)" />
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>

          <template #option="slotProps">
            <div class="sc-flex sc-items-center">
              <div :class="`sc-mr-2 scr-action-color scr-action-${slotProps.option.value}`" />
              <div v-text="slotProps.option.label" />
            </div>
          </template>
        </Select>

        <label for="dd-element-action">Element Action</label>
      </IftaLabel>
    </template>

    <template #icons>
      <Button
        aria-label="Remove" icon="pi pi-times" severity="danger" size="small" text
        @click="removeAction"
      />
    </template>

    <IftaLabel>
      <InputText id="selector" v-model="selectorText" :invalid="!isSelectorValid" fluid />
      <label for="selector">Css Selector</label>
    </IftaLabel>
  </Panel>
</template>

<style scoped>
.scr-action-color {
  background: var(--scr-action-color);
  height: 1em;
  width: 1em;
}
</style>
