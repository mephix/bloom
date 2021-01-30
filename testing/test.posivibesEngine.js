const posivibesEngine = require('../posivibes/posivibesEngine.js')

testPosivibesEngine()

async function testPosivibesEngine() {
  let P = math.zeros(3, 3, 'sparse')
  P.subset(math.index(0,1), 0.4)
  P.subset(math.index(0,2), 0.2)
  P.subset(math.index(2,0), 0.1)
  P.subset(math.index(2,1), 0.2)

  let w = posivibesEngine(P)
  math.forEach(w, wi => console.log(`${wi.toFixed(2)}`))
}
