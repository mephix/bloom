export class Logger {
  static active = false
  constructor(private prefix: string, private color: string) {}

  get wrappedPrefix() {
    return `%c[${this.prefix}]`
  }

  get style() {
    return `color: ${this.color}; font-weight: bold;`
  }

  log(...args: any[]) {
    if (Logger.active)
      console.log.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  info(...args: any[]) {
    if (Logger.active)
      console.info.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  debug(...args: any[]) {
    if (Logger.active)
      console.debug.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  warn(...args: any[]) {
    console.warn.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  error(...args: any[]) {
    console.error.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  generateGroup(label: string, ...args: any[]) {
    console.groupCollapsed(this.wrappedPrefix, this.style, label)
    args.forEach(log => console.debug(log))
    console.groupEnd()
  }

  startGroup(label: string) {
    console.groupCollapsed(this.wrappedPrefix, this.style, label)
  }

  endGroup() {
    console.groupEnd()
  }
}
