export class Logger {
  constructor(private prefix: string, private color: string) {}

  get wrappedPrefix() {
    return `%c[${this.prefix}]`
  }

  get style() {
    return `color: ${this.color}; font-weight: bold;`
  }

  log(...args: any[]) {
    console.log.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  info(...args: any[]) {
    console.info.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  warn(...args: any[]) {
    console.warn.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  debug(...args: any[]) {
    console.debug.apply(null, [this.wrappedPrefix, this.style, ...args])
  }

  error(...args: any[]) {
    console.error.apply(null, [this.wrappedPrefix, this.style, ...args])
  }
}
