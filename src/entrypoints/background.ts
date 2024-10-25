import { backgroundMessenger } from '@/lib/backgroundMessenger'
import { WEB_REQUEST_URL_FILTER } from '@/lib/constants'

import { extensionStorage } from '@/lib/extStorage'
import { browser } from 'wxt/browser'

async function getCurrentTab() {
  const [tab] = await browser.tabs.query({
    active: true,
    lastFocusedWindow: true,
  })
  const tabId = tab.id
  const startUrl = tab.url

  return { tabId, startUrl }
}
function removeProtocolAndHost(url: string) {
  const parsedUrl = new URL(url)
  return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
}

export default defineBackground(() => {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  })

  browser.webNavigation.onBeforeNavigate.addListener((details) => {
    extensionStorage.getItem('activeRecording').then((activeRecording) => {
      if (activeRecording?.tabId !== details.tabId) {
        return
      }

      const url = removeProtocolAndHost(details.url)

      const existing = activeRecording.urls.find((record) => {
        return record.url === url
      })
      if (existing) {
        existing.timesSeen++
      }
      else {
        activeRecording.urls.push({ url, timesSeen: 1 })
      }

      extensionStorage.setItem('activeRecording', activeRecording).catch(console.error)
    }).catch(console.error)
  })

  browser.webRequest.onHeadersReceived.addListener((details) => {
    extensionStorage.getItem('activeRecording').then((activeRecording) => {
      if (activeRecording?.tabId !== details.tabId) {
        return
      }

      const url = removeProtocolAndHost(details.url)

      const existing = activeRecording.resources.find((record) => {
        return record.method === details.method && record.url === url
      })
      if (existing) {
        existing.timesSeen++
      }
      else {
        activeRecording.resources.push({
          id: details.requestId,
          url,
          type: details.type,
          method: details.method,
          originUrl: details.documentUrl ?? details.originUrl ?? details.initiator,
          statusCode: details.statusCode,
          statusLine: details.statusLine,
          timesSeen: 1,
        })
      }

      extensionStorage.setItem('activeRecording', activeRecording).catch(console.error)
    }).catch(console.error)
  }, WEB_REQUEST_URL_FILTER, ['responseHeaders', 'extraHeaders'])

  backgroundMessenger.onMessage('addElementAction', async ({ data }) => {
    const activeRecording = await extensionStorage.getItem('activeRecording')

    if (activeRecording === null) {
      return
    }
    if (data.id === undefined) {
      data.id = crypto.randomUUID()
    }
    const exists = activeRecording.elements.find((action) => {
      return action.id === data.id || action.selector === data.selector
    })
    if (exists) {
      exists.action = data.action
      exists.selector = data.selector
    }
    else {
      activeRecording.elements.push(data)
    }

    await extensionStorage.setItem('activeRecording', activeRecording).catch(console.error)
  })

  backgroundMessenger.onMessage('removeElementAction', async ({ data }) => {
    const activeRecording = await extensionStorage.getItem('activeRecording')
    if (activeRecording === null) {
      return
    }

    activeRecording.elements = activeRecording.elements.filter(selector => selector.id !== data)

    await extensionStorage.setItem('activeRecording', activeRecording).catch(console.error)
  })

  backgroundMessenger.onMessage('isTabRecording', async ({ sender }) => {
    const activeRecording = await extensionStorage.getItem('activeRecording')
    return activeRecording?.tabId === sender.tab?.id
  })

  backgroundMessenger.onMessage('startRecording', async () => {
    const { tabId, startUrl } = await getCurrentTab()

    if (tabId === undefined || startUrl === undefined) {
      console.error('sender tab id or url is undefined')
      return
    }

    const activeRecording = {
      id: crypto.randomUUID(),
      tabId,
      startUrl,
      urls: [],
      elements: [],
      resources: [],
    }

    await extensionStorage.setItem('activeRecording', activeRecording).catch(console.error)
    await browser.tabs.reload(tabId)
  })
  backgroundMessenger.onMessage('resumeRecording', async ({ data }) => {
    const { tabId, startUrl } = await getCurrentTab()

    if (tabId === undefined || startUrl === undefined) {
      console.error('sender tab id or url is undefined')
      return false
    }

    let allRecordings = await extensionStorage.getItem('tabRecordings')
    if (allRecordings !== null) {
      const activeRecording = allRecordings.find(recording => recording.id === data)

      if (activeRecording) {
        allRecordings = allRecordings.filter((recording) => {
          return recording.id !== data
        })

        await extensionStorage.setItem('tabRecordings', allRecordings).catch(console.error)
        await extensionStorage.setItem('activeRecording', activeRecording).catch(console.error)
        await browser.tabs.reload(tabId)

        return true
      }
    }

    return false
  })

  backgroundMessenger.onMessage('stopRecording', async () => {
    const { tabId, startUrl } = await getCurrentTab()

    if (tabId === undefined || startUrl === undefined) {
      console.error('sender tab id or url is undefined')
      return
    }

    const activeRecording = await extensionStorage.getItem('activeRecording')
    if (activeRecording === null) {
      return
    }
    if (activeRecording.elements.length > 0 || activeRecording.resources.length > 0) {
      let allRecordings = await extensionStorage.getItem('tabRecordings')
      if (allRecordings === null) {
        allRecordings = []
      }
      allRecordings.unshift(activeRecording)
      await extensionStorage.setItem('tabRecordings', allRecordings).catch(console.error)
    }

    await extensionStorage.setItem('activeRecording', null).catch(console.error)
  })

  backgroundMessenger.onMessage('removeRecording', async ({ data }) => {
    let allRecordings = await extensionStorage.getItem('tabRecordings')
    if (allRecordings === null) {
      return
    }
    allRecordings = allRecordings.filter(recording => recording.id !== data)

    await extensionStorage.setItem('tabRecordings', allRecordings).catch(console.error)
  })
})
