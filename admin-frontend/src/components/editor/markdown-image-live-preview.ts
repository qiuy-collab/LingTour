/**
 * 编辑器内联图片渲染扩展（md-editor-v3 / CodeMirror 6）。
 *
 * 目标：
 * 1. 编辑区里把 Markdown 图片语法 `![alt](url)` 直接渲染成图片本体；
 * 2. 光标进入该图片范围时恢复原始 Markdown，保证正文仍然可编辑；
 * 3. 悬浮图片时显示「更换图片」入口，由宿主组件打开媒体库完成替换。
 *
 * 注入方式：md-editor-v3 每次创建编辑器都会调用全局 `config.codeMirrorExtensions`，
 * 这里按 editorId 找到宿主组件注册的回调，把扩展追加进去。
 */
import {
  RangeSetBuilder,
  type EditorSelection,
  type Extension,
} from '@codemirror/state'
import {
  Decoration,
  EditorView,
  ViewPlugin,
  WidgetType,
  type DecorationSet,
  type ViewUpdate,
} from '@codemirror/view'
import { config, type CodeMirrorExtension } from 'md-editor-v3'

export interface EditorImageTarget {
  /** 图片语法在文档中的起止位置 */
  from: number
  to: number
  /** 图片地址（Markdown 中的原文） */
  src: string
  /** 图片替代文本 */
  alt: string
}

export interface MarkdownImageHost {
  /** 把 Markdown 里的相对地址解析成浏览器可直接请求的地址 */
  resolveUrl: (src: string) => string
  /** 用户点击悬浮「更换图片」入口 */
  onReplaceRequest: (target: EditorImageTarget) => void
}

/**
 * Markdown 图片语法：`![alt](url "title")`，兼容 CommonMark 的尖括号地址写法
 * `![alt](<url>)`。
 *
 * 两种写法都要认：编辑器插入图片时会把括号转义成 %28 / %29，走的是裸地址分支；
 * 而数据层直接导入的正文沿用 CommonMark 的 `<...>` 目标写法（地址里允许空格），
 * 若把它并入 src，`<`/`>` 会让地址解析失效，编辑器里就只剩裂图。
 */
const IMAGE_SYNTAX =
  /!\[([^\]\n]*)\]\([ \t]*(?:<([^<>\n]*)>|([^()\s]+))(?:[ \t]+"[^"]*")?[ \t]*\)/g

/** 取图片地址：尖括号写法落在第 2 组，裸地址写法落在第 3 组。 */
function readImageSrc(match: RegExpMatchArray): string {
  return match[2] ?? match[3] ?? ''
}

export interface MarkdownImageMatch {
  from: number
  to: number
  src: string
  alt: string
}

/** 扫描 Markdown 文本，返回其中所有图片语法及其位置。 */
export function matchImages(text: string): MarkdownImageMatch[] {
  const matches: MarkdownImageMatch[] = []

  for (const match of text.matchAll(IMAGE_SYNTAX)) {
    const from = match.index ?? 0
    matches.push({
      from,
      to: from + match[0].length,
      src: readImageSrc(match),
      alt: match[1],
    })
  }

  return matches
}

const hosts = new Map<string, MarkdownImageHost>()
let installed = false

class MarkdownImageWidget extends WidgetType {
  target: EditorImageTarget
  host: MarkdownImageHost

  constructor(target: EditorImageTarget, host: MarkdownImageHost) {
    super()
    this.target = target
    this.host = host
  }

  eq(other: MarkdownImageWidget) {
    return (
      other.target.from === this.target.from &&
      other.target.to === this.target.to &&
      other.target.src === this.target.src &&
      other.target.alt === this.target.alt
    )
  }

  toDOM(view: EditorView) {
    const wrapper = document.createElement('span')
    wrapper.className = 'cm-live-image'
    wrapper.setAttribute('contenteditable', 'false')

    const image = document.createElement('img')
    image.className = 'cm-live-image__body'
    image.src = this.host.resolveUrl(this.target.src)
    image.alt = this.target.alt || '正文图片'
    image.loading = 'lazy'
    image.draggable = false
    // 点击图片本体：把光标放到该图片语法上，装饰随即撤销，恢复成可编辑的原文。
    image.addEventListener('mousedown', (event) => {
      event.preventDefault()
      // 落在语法内部（而非边界），装饰随之撤销并恢复成可编辑的原文。
      const anchor = Math.min(this.target.from + 1, view.state.doc.length)
      view.dispatch({ selection: { anchor } })
      view.focus()
    })
    wrapper.appendChild(image)

    const action = document.createElement('button')
    action.type = 'button'
    action.className = 'cm-live-image__action'
    action.textContent = '更换图片'
    action.title = '从媒体库中重新选择图片替换当前图片'
    // 按下与点击都不移动编辑器光标，避免替换过程中装饰被撤销。
    action.addEventListener('mousedown', (event) => {
      event.preventDefault()
      event.stopPropagation()
    })
    action.addEventListener('click', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.host.onReplaceRequest(this.target)
    })
    wrapper.appendChild(action)

    return wrapper
  }

  /** 由宿主控件自己处理鼠标事件，编辑器不参与定位光标。 */
  ignoreEvent() {
    return true
  }
}

/**
 * 光标严格落在图片语法内部（或选区与之相交）时保留原文，方便就地编辑。
 * 两端边界不算命中：插入或替换图片后光标停在语法末端，图片应保持渲染。
 */
function selectionTouches(
  selection: EditorSelection,
  from: number,
  to: number,
): boolean {
  return selection.ranges.some((range) => {
    if (range.empty) return range.head > from && range.head < to
    return range.from <= to && range.to >= from
  })
}

function buildDecorations(
  view: EditorView,
  host: MarkdownImageHost,
): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const doc = view.state.doc
  const selection = view.state.selection

  for (const visible of view.visibleRanges) {
    const text = doc.sliceString(visible.from, visible.to)

    for (const match of text.matchAll(IMAGE_SYNTAX)) {
      const start = visible.from + (match.index ?? 0)
      const end = start + match[0].length
      if (selectionTouches(selection, start, end)) continue

      const target: EditorImageTarget = {
        from: start,
        to: end,
        src: readImageSrc(match),
        alt: match[1],
      }

      builder.add(
        start,
        end,
        Decoration.replace({ widget: new MarkdownImageWidget(target, host) }),
      )
    }
  }

  return builder.finish()
}

function createImagePreviewExtension(host: MarkdownImageHost): Extension {
  const imagePreview = ViewPlugin.fromClass(
    class {
      decorations: DecorationSet

      constructor(view: EditorView) {
        this.decorations = buildDecorations(view, host)
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet || update.viewportChanged) {
          this.decorations = buildDecorations(update.view, host)
        }
      }
    },
    {
      decorations: (instance) => instance.decorations,
      provide: (plugin) =>
        EditorView.atomicRanges.of(
          (view) => view.plugin(plugin)?.decorations ?? Decoration.none,
        ),
    },
  )

  return imagePreview
}

function resolveHost(editorId: string): MarkdownImageHost | undefined {
  const direct = hosts.get(editorId)
  if (direct) return direct

  // 兜底：页面上只有一个 Markdown 编辑器时，即使 id 生成方式变化也能命中。
  const registered = [...hosts.values()]
  return registered.length === 1 ? registered[0] : undefined
}

export function registerMarkdownImageHost(
  editorId: string,
  host: MarkdownImageHost,
): void {
  hosts.set(editorId, host)
}

export function unregisterMarkdownImageHost(editorId: string): void {
  hosts.delete(editorId)
}

/**
 * md-editor-v3 自带的 linkShortener 用 replace 装饰折叠过长地址，会与本扩展
 * 对整个 `![alt](url)` 的替换嵌套冲突并导致图片无法渲染；
 * 只在启用内联图片的编辑器上移除它，其他编辑器保持原样。
 */
function withoutLinkShortener(extensions: Array<CodeMirrorExtension>) {
  return extensions.filter((item) => item.type !== 'linkShortener')
}

/** 通过全局配置注入，只需执行一次；所有 md-editor-v3 实例随之获得内联图片渲染。 */
export function installMarkdownImagePreview(): void {
  if (installed) return
  installed = true

  config({
    codeMirrorExtensions: (extensions, options) => {
      const host = resolveHost(options.editorId)
      if (!host) return extensions

      const addition: CodeMirrorExtension = {
        type: 'liveImagePreview',
        extension: createImagePreviewExtension(host),
      }

      return [...withoutLinkShortener(extensions), addition]
    },
  })
}
