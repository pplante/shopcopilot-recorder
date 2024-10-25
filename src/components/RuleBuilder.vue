<script lang="ts" setup>
import type { IElementFilter, IScopeFilter, ResourceRecord, TabRecording, UrlRecord } from '@/lib/resourceRecord'
import ElementActionEditor from '@/entrypoints/sidepanel/ElementActionEditor.vue'
import { backgroundMessenger } from '@/lib/backgroundMessenger'
import { useConfirm } from 'primevue/useconfirm'
import { ref } from 'vue'

const props = defineProps({
  allowRemoval: {
    type: Boolean,
    default: true,
  },
  recording: {
    type: Object as PropType<TabRecording>,
    required: true,
  },
  title: {
    type: String,
    default: 'Recording',
  },
})

const confirm = useConfirm()

function confirmRemoval(event: Event) {
  confirm.require({
    target: event.currentTarget,
    message: 'Do you want to delete this recording?',
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true,
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger',
    },
    accept: async () => {
      await backgroundMessenger.sendMessage('removeRecording', props.recording.id)
    },
  })
}

const selectedUrls: Ref<UrlRecord[]> = ref([])
const selectedResources: Ref<ResourceRecord[]> = ref([])
const newRule: Ref<IScopeFilter | null> = ref(null)
const newRuleText = ref('')

watch([selectedResources, selectedUrls], () => {
  const applyTo = selectedUrls.value.map(rec => rec.url)
  const resources = { allow: selectedResources.value.map(resource => resource.url) }
  const rule: IScopeFilter = {
    applyTo: applyTo.length > 0 ? applyTo : '<all_urls>',
  }

  if (resources.allow.length > 0) {
    rule.resources = resources
  }

  const elementActions: IElementFilter = {
    enable: [],
    disable: [],
    hide: [],
    remove: [],
  }
  props.recording?.elements.forEach((v) => {
    elementActions[v.action]?.push(v.selector)
  })

  rule.elements = elementActions

  newRule.value = rule

  newRuleText.value = JSON.stringify(newRule.value, null, 2)
})

async function resumeRecording() {
  await backgroundMessenger.sendMessage('resumeRecording', props.recording.id)
}
</script>

<template>
  <Panel :toggleable="allowRemoval">
    <template #header>
      <h2 sc-font="bold" sc-text="lg">
        {{ title }}
      </h2>
    </template>
    <template v-if="allowRemoval" #icons>
      <ConfirmPopup />
      <Button icon="pi pi-times" rounded severity="danger" size="small" text @click="confirmRemoval($event)" />
      <Button icon="pi pi-camera" rounded size="small" text @click="resumeRecording" />
    </template>
    <div>
      <Divider align="center">
        <p sc-text="lg">
          Applies to Urls
        </p>
      </Divider>
      <DataTable
        v-model:selection="selectedUrls"
        :value="props.recording?.urls"
        scroll-height="450px"
        scrollable
        size="small"
      >
        <Column header-style="width: 3rem" selection-mode="multiple" />

        <Column field="url" header="URL" />
        <Column field="timesSeen" header="# Seen" />
      </DataTable>
    </div>

    <div>
      <Divider align="center">
        <p sc-text="lg">
          Element Actions
        </p>
      </Divider>
      <ElementActionEditor v-for="sa in props.recording?.elements" :key="sa.id" :model-value="sa" />
      <p v-if="props.recording?.elements.length === 0">
        Use the "Pick Element" button in the page viewport to select elements.
      </p>
    </div>

    <div>
      <Divider align="center">
        <p sc-text="lg">
          Resources
        </p>
      </Divider>

      <DataTable
        v-model:selection="selectedResources"
        :value="props.recording?.resources"
        scroll-height="450px"
        scrollable
        size="small"
      >
        <Column header-style="width: 3rem" selection-mode="multiple" />

        <Column field="url" header="URL" />
        <Column field="type" header="Type" />
        <Column field="statusCode" header="Status Code" />
        <Column field="timesSeen" header="# Seen" />
      </DataTable>
    </div>

    <Divider align="center">
      <p sc-text="lg">
        Rule as JSON
      </p>
    </Divider>

    <pre>{{ newRuleText }}</pre>
  </Panel>
</template>
