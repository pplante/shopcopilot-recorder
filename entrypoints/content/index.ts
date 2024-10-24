import type { ElementAction, TabRecording } from '@/lib/resourceRecord'
import ElementPicker from '@/entrypoints/content/ElementPicker.vue'
import { backgroundMessenger } from '@/lib/backgroundMessenger'
/* eslint-disable no-console */
import { URL_FILTER_MATCHERS } from '@/lib/constants'
import { extensionStorage } from '@/lib/extStorage'
import Aura from '@primevue/themes/aura'
import PrimeVue from 'primevue/config'

function destroyElementHighlights() {
  document.body
    .querySelectorAll('.scr-selected-element')
    .forEach(el =>
      el.classList.remove(
        'scr-selected-element',
        'scr-action-hide',
        'scr-action-enable',
        'scr-action-disable',
        'scr-action-remove',
      ),
    )
}

function applyElementHighlights(actions: ElementAction[]) {
  actions.forEach((sa) => {
    document.body
      .querySelectorAll(sa.selector)
      .forEach(el =>
        el.classList.add(
          'scr-selected-element',
          `scr-action-${sa.action}`,
        ),
      )
  })
}

export default defineContentScript({
  matches: URL_FILTER_MATCHERS,
  runAt: 'document_end',
  cssInjectionMode: 'manifest',
  async main(ctx) {
    console.log('Hello content.', ctx)

    extensionStorage.onChange('activeRecording', (val: TabRecording | null) => {
      // clean up any existing selections, including removing outlines
      destroyElementHighlights()

      if (val !== null) {
        backgroundMessenger.sendMessage('isTabRecording', undefined).then((isRecording) => {
          if (isRecording) {
            applyElementHighlights(val.elements)
          }
        }).catch(console.error)
      }
    })

    const ui = createIntegratedUi(ctx, {
      position: 'inline',
      anchor: 'body',
      append: 'first',
      onMount: (uiContainer: HTMLElement) => {
        const app = createApp(ElementPicker)
        app
          .use(PrimeVue, {
            theme: {
              preset: Aura,
            },
          })
          .mount(uiContainer)

        return app
      },
      onRemove: app => app?.unmount(),
    })

    ui.mount()
  },
})
