export interface TabRecording {
  id: string
  tabId: number
  startUrl: string
  urls: UrlRecord[]
  elements: ElementAction[]
  resources: ResourceRecord[]
}

export interface UrlRecord {
  url: string
  timesSeen: number
}

export interface ResourceRecord {
  id: string
  url: string
  type: string
  method: string
  originUrl?: string
  statusCode: number
  statusLine: string
  timesSeen: number
}

export interface ElementAction {
  id?: string
  action: 'enable' | 'remove' | 'hide' | 'disable'
  selector: string
}

export interface IElementFilter {
  disable?: string[]
  hide?: string[]
  enable?: string[]
  remove?: string[]
}

export interface IResourceFilter {
  allow: string[]
}

export interface IScopeFilter {
  applyTo: string | string[]
  elements?: IElementFilter
  resources?: IResourceFilter
}

export interface IFeatureBlock {
  id: string
  name: string
  scopes: IScopeFilter[]
}
