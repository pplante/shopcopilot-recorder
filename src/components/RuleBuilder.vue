<script lang="ts" setup>
import type { IElementFilter, IScopeFilter, ResourceRecord, TabRecording, UrlRecord } from '@/lib/resourceRecord'
import ElementActionEditor from '@/entrypoints/sidepanel/ElementActionEditor.vue'
import { backgroundMessenger } from '@/lib/backgroundMessenger'
import { useConfirm } from 'primevue/useconfirm'
import { ref } from 'vue'

defineProps({
  allowRemoval: {
    type: Boolean,
    default: true,
  },
  title: {
    type: String,
    default: 'Recording',
  },
})

const model = defineModel<TabRecording>({ required: true })

const advancedMode = ref(false)

const confirm = useConfirm()

const menu = ref(null)

const items = ref([
  {
    label: 'Advanced Mode',
    icon: 'pi pi-sliders-h',
    command: () => (advancedMode.value = !advancedMode.value),
  },
  {
    label: 'Resume Recording',
    icon: 'pi pi-camera',
    command: resumeRecording,
  },
  {
    separator: true,
  },
])

function toggleMenu(event: Event) {
  menu.value?.toggle(event)
}

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
      await backgroundMessenger.sendMessage('removeRecording', model.value.id)
    },
  })
}

const selectedUrls: Ref<UrlRecord[]> = ref([])
const selectedResources: Ref<ResourceRecord[]> = ref([])
const newRule: Ref<IScopeFilter | null> = ref(null)
const newRuleText = ref('')
watch([selectedResources, selectedUrls, model], updateRuleText)

function updateRuleText() {
  const applyTo = selectedUrls.value.map(rec => rec.url)
  const resources = { allow: selectedResources.value.map(resource => resource.url) }
  const rule: IScopeFilter = {
    applyTo: applyTo.length > 0 ? applyTo : '<all_urls>',
  }

  if (resources.allow.length > 0) {
    rule.resources = resources
  }

  const elementActions: IElementFilter = {}
  model.value?.elements.forEach((v) => {
    elementActions[v.action] ||= []
    elementActions[v.action]?.push(v.selector)
  })

  rule.elements = elementActions

  newRule.value = rule

  newRuleText.value = JSON.stringify(newRule.value, null, 2)
}

async function resumeRecording() {
  await backgroundMessenger.sendMessage('resumeRecording', model.value.id)
}

onMounted(() => {
  updateRuleText()
})
</script>

<template>
  <Panel :collapsed="allowRemoval" :toggleable="allowRemoval">
    <template #header>
      <h2 sc-font="bold">
        {{ title }}
      </h2>
    </template>
    <template v-if="allowRemoval" #icons>
      <ConfirmPopup />
      <Button
        aria-controls="overlay_menu" aria-haspopup="true" icon="pi pi-cog" rounded severity="secondary" text
        @click="toggleMenu"
      />
      <Menu id="config_menu" ref="menu" :model="items" popup>
        <template #end>
          <Button
            class="sc-w-full !sc-justify-start" icon="pi pi-times" label="Delete" severity="danger" size="small"
            text @click="confirmRemoval($event)"
          />
        </template>
      </Menu>
    </template>
    <div>
      <Divider align="center">
        <p sc-text="lg">
          Applies to Urls
        </p>
      </Divider>
      <DataTable
        v-model:selection="selectedUrls"
        :value="model?.urls"
        scroll-height="450px"
        scrollable
        size="small"
      >
        <Column selection-mode="multiple" />

        <Column field="url" header="URL" />
        <Column v-if="advancedMode" field="timesSeen" header="# Seen" />
      </DataTable>
    </div>

    <div>
      <Divider align="center">
        <p sc-text="lg">
          Element Actions
        </p>
      </Divider>
      <ElementActionEditor v-for="sa in model?.elements" :key="sa.id" :model-value="sa" />
      <p v-if="model?.elements.length === 0">
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
        :value="model?.resources"
        scroll-height="450px"
        scrollable
        size="small"
      >
        <Column selection-mode="multiple" />

        <Column field="url" header="URL" />
        <Column v-if="advancedMode" field="type" header="Type" />
        <Column v-if="advancedMode" field="statusCode" header="Status Code" />
        <Column v-if="advancedMode" field="timesSeen" header="# Seen" />
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
