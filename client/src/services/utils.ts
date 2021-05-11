const colors = {
  white: 37,
  red: 31,
  yellow: 33,
  green: 32,
  cyan: 36,
  blue: 34,
  magenta: 35
}

const emphases = {
  bright: -1,
  none: 0,
  bold: 1,
  underline: 4,
  reversed: 7
}

type ColorType =
  | 'white'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'

type EmphasesType = 'bright' | 'none' | 'bold' | 'underline' | 'reversed'

export function consoleColorLog(
  message: string,
  color: ColorType = 'blue',
  emphasis: EmphasesType = 'none'
) {
  let bright = ''
  if (emphasis === 'bright') {
    bright = ';1'
    emphasis = 'none'
  }
  let eTag = `\u001b[${emphases[emphasis]}m`
  const colorTag = `\u001b[${colors[color]}${bright}m`
  const resetTag = `\u001b[0m`
  console.log(eTag + colorTag + message + resetTag)
}
