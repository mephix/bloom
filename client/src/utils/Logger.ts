import { DateTime } from 'luxon'

const TIME_COLOR = 'grey'

export class Logger {
  static active = false
  constructor(private prefix: string, private color: string) {}

  get wrappedPrefix() {
    return `%c[${this.prefix}]`
  }

  get style() {
    return `color: ${this.color}; font-weight: bold;`
  }

  get nowStyle() {
    return `color: ${TIME_COLOR}; font-weight: bold;`
  }

  get wrappedNow() {
    return `%c[${DateTime.now().toLocaleString(DateTime.TIME_24_WITH_SECONDS)}]`
  }

  get template() {
    return [
      `${this.wrappedPrefix} ${this.wrappedNow}`,
      this.style,
      this.nowStyle
    ]
  }

  log(...args: any[]) {
    if (Logger.active) console.debug.apply(null, [...this.template, ...args])
  }

  info(...args: any[]) {
    if (Logger.active) console.info.apply(null, [...this.template, ...args])
  }

  warn(...args: any[]) {
    console.warn.apply(null, [...this.template, ...args])
  }

  error(...args: any[]) {
    console.error.apply(null, [...this.template, ...args])
  }

  generateGroup(label: string, ...args: any[]) {
    this.startGroup(label)
    args.forEach(log => console.debug(log))
    this.endGroup()
  }

  startGroup(label: string) {
    console.groupCollapsed(...this.template, label)
  }

  endGroup() {
    console.groupEnd()
  }
}

export class LogGroup {
  groupItems: any[] = []

  constructor(private label: string, private logger: Logger) {}

  add(...args: any[]) {
    args.forEach(arg => this.groupItems.push(arg))
  }

  apply() {
    this.logger.startGroup(this.label)
    this.groupItems.forEach(item => {
      if (typeof item === 'function') item()
      else console.debug(item)
    })
    this.logger.endGroup()
  }
}
