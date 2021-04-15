module.exports = consoleColorLog

/*
 * `consoleColorLog`: prints to Node debug console in different colors and emphases.
 */
function consoleColorLog(message, color='blue', emphasis='none') {
  // `color`: white, red, yellow, green, cyan, blue, magenta.
  if (colors[color] === undefined) throw new Error(`consoleColorLog does not support the color ${color}`)
  // `emphasis`: none, bright, bold, underline, reversed.
  if (emphases[emphasis] === undefined) throw new Error(`consoleColorLog: emphasis must be bright, bold, underline, reversed or none, not ${emphasis}`)
  // `bright` is implemented differently to the others.
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

const colors = {
  white: 37,
  red: 31,
  yellow: 33,
  green: 32,
  cyan: 36,
  blue: 34,
  magenta: 35,
  // Black: 30,
  // Reset: 0,
}

const emphases = {
  none: 0,
  bold: 1,
  underline: 4,
  reversed: 7,
}
// Print out all the colors
// Object.keys(colors).forEach(c => consoleColorLog(`${c}`, c))
