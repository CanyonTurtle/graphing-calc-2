import { evaluate } from '../calc/mathjs-computations'

// let NUM_POINTS = 100

function Point (t, x, y) {
  var pt = { mtype: 'normal' }
  pt.mtype = t
  pt.mx = x
  pt.my = y
  return pt
}

function PointSet () {
  var ptset = {}
  ptset.pts = []
  ptset.spts = []
  ptset.minYV = 0
  ptset.maxYV = 0
  ptset.addNormalPoint = (pt) => {
    ptset.pts.push(pt)
  }
  ptset.addSpecialPoint = (pt) => {
    ptset.spts.push(pt)
  }
  ptset.clearSpecialsByName = (name) => {
    ptset.spts = ptset.spts.filter((spt) => {
      if (spt.mtype === name) {
        return false
      }
      return true
    })
  }
  return ptset
}

// imput a function string, get back a set of points representing
// that function's evaluations across the interval.
// as well as the derivative and second derivative!

const derive = function (f, x, grain) {
  return (evaluate(f, x) - evaluate(f, x - grain)) / grain
}

const getPoints = function (f, {graphSvg, ctx, dl, dr, grain, ...graph}, setting) {
  var pointSets = {
    originalPoints: null,
    dPoints: null,
    sDPoints: null
  }

  let NUM_POINTS = 200
  grain = (dr - dl) / NUM_POINTS
  var points = PointSet()
  var dpts = PointSet()
  var sdpts = PointSet()

  var minY = null
  var maxY = null

  // first point
  let firstPoint = Point(
    'leftEndpoint',
    dl,
    evaluate(f, dl)
  )
  points.addSpecialPoint(firstPoint)

  minY = Math.min(minY, firstPoint.my)
  maxY = Math.max(maxY, firstPoint.my)

  var oldSign = Math.sign(firstPoint.my)
  var oldDSign = Math.sign(firstPoint.my)
  var oldSDSign = Math.sign(firstPoint.my)

  var newSign
  var newDSign
  var newSDSign

  var iOutput = firstPoint.my
  // eslint-disable-next-line no-unused-vars
  var lastIOutput = firstPoint.my
  var lastSlope = null
  var continuousMinmaxCount = 0
  var contiguousInflectionCount = 0

  var dontShowMinMax = false
  var dontShowInflectionPts = false

  var inInterval = true

  // start 5 less than, end 5 greater than, to check the endpoints too.
  var ot = performance.now()
  for (let i = dl - (10 * grain); i < dr + (10 * grain); i += grain) {
    // needs to be tested.... what if it's NaN??
    inInterval = (i >= dl && i <= dr)
    // get the point, it's slope, and the slope's slope.
    iOutput = evaluate(f, i)
    let iSlope = derive(f, i, grain)
    let iSlopeSlope = (iSlope - lastSlope) / grain

    // cleanup for next run.
    // eslint-disable-next-line no-unused-vars
    lastIOutput = iOutput
    lastSlope = iSlope

    // add the points for the function, derivative, and second derivative
    // don't add the points on the 1/2nd tries.
    let point = Point('normal', i, iOutput)
    let dpt = Point('normal', i, iSlope)
    let sdpt = Point('normal', i, iSlopeSlope)

    var checkMinMaxList = []
    checkMinMaxList.push(iOutput)
    if (ctx.$store.state.isDerivativeChecked) {
      checkMinMaxList.push(iSlope)
    }
    if (ctx.$store.state.isSecondDerivativeChecked) {
      checkMinMaxList.push(iSlopeSlope)
    }

    // eslint-disable-next-line no-constant-condition
    if (inInterval) {
      points.addNormalPoint(point)
      dpts.addNormalPoint(dpt)
      sdpts.addNormalPoint(sdpt)
      maxY = Math.max(maxY, ...checkMinMaxList)
      minY = Math.min(minY, ...checkMinMaxList)
    }

    // check sign change -> zero, minmax, inflection!
    newSign = Math.sign(iOutput)
    if (oldSign !== newSign && i >= dl) {
      // eslint-disable-next-line no-unused-vars
      // if (inInterval) {
      //   points.addSpecialPoint(Point('zero', i, 0))
      // }
      // experimental verion of zero finder!
      var backtrackSign = null
      var jOutput
      var bi = i
      var ot2 = performance.now()
      while (backtrackSign !== oldSign && bi > dl - 0.01) {
        console.log('backtracking at ' + bi)
        jOutput = evaluate(f, bi)
        backtrackSign = Math.sign(jOutput)
        bi -= 0.001
      }
      while (backtrackSign === oldSign && bi < dr + 0.001) {
        jOutput = evaluate(f, bi)
        backtrackSign = Math.sign(jOutput)
        bi += 0.0001
      }
      while (backtrackSign !== oldSign && bi > dl - 0.0001) {
        jOutput = evaluate(f, bi)
        backtrackSign = Math.sign(jOutput)
        bi -= 0.00001
      }
      if (bi >= dl - 0.01 && bi <= dr) {
        points.addSpecialPoint(Point('zero', bi, 0))
      }
      console.log('time inside first backtrack: ' + (performance.now() - ot2))
    }
    oldSign = newSign

    newDSign = Math.sign(iSlope)
    if (oldDSign !== newDSign && i >= dl) {
      continuousMinmaxCount++
      if (continuousMinmaxCount > 5) {
        dontShowMinMax = true
      }
      // add a special point here.
      var funcMsg = 'min'
      var sd = '1'
      if (oldDSign === -1) {
        sd = 1
      }
      if (oldDSign === 1) {
        sd = -1
      }
      if (sd === 1) {
        funcMsg = 'min'
      }
      if (sd === -1) {
        funcMsg = 'max'
      }
      // if (inInterval) {
      //   points.addSpecialPoint(Point(funcMsg, i, iOutput))
      // }
      var backtrackDSign = null
      var jDOutput
      var bDi = i
      while (backtrackDSign !== oldDSign && bDi > dl - 0.01) {
        jDOutput = derive(f, bDi, 0.001)
        backtrackDSign = Math.sign(jDOutput)
        bDi -= 0.001
      }
      while (backtrackDSign === oldDSign && bDi < dr + 0.001) {
        jDOutput = derive(f, bDi, 0.0001)
        backtrackDSign = Math.sign(jDOutput)
        bDi += 0.0001
      }
      while (backtrackDSign !== oldDSign && bDi > dl - 0.0001) {
        jDOutput = derive(f, bDi, 0.00001)
        backtrackDSign = Math.sign(jDOutput)
        bDi -= 0.00001
      }
      if (bDi >= dl && bDi <= dr) {
        let fHere = evaluate(f, bDi)
        points.addSpecialPoint(Point(funcMsg, bDi, fHere))
        if (Math.abs(fHere) < 0.01) {
          points.addSpecialPoint(Point('zero', bDi, 0))
        }
      }
    } else {
      continuousMinmaxCount = 0
    }
    oldDSign = newDSign

    newSDSign = Math.sign(iSlopeSlope)
    if (oldSDSign !== newSDSign || newSDSign === 0) {
      contiguousInflectionCount++
      if (contiguousInflectionCount > 5) {
        dontShowInflectionPts = true
      }
      if (inInterval) {
        points.addSpecialPoint(Point('inflectionpt', i, iOutput))
      }
    } else {
      contiguousInflectionCount = 0
    }
    oldSDSign = newSDSign
  }
  // last point
  let lastPoint = Point('rightEndpoint', dr, evaluate(f, dr))
  points.addSpecialPoint(lastPoint)

  minY = Math.min(minY, lastPoint.my)
  maxY = Math.max(maxY, lastPoint.my)

  // don't display any special points if there are striaght  lines.
  if (dontShowInflectionPts) {
    points.clearSpecialsByName('inflectionpt')
  }
  if (dontShowMinMax) {
    points.clearSpecialsByName('min')
    points.clearSpecialsByName('max')
  }
  points.minYV = minY
  points.maxYV = maxY
  dpts.minYV = minY
  dpts.maxYV = maxY
  sdpts.minYV = minY
  sdpts.maxYV = maxY

  pointSets.originalPoints = points
  pointSets.dPoints = dpts
  pointSets.sDPoints = sdpts

  var nt = performance.now()
  console.log('took ' + (nt - ot) + ' milliseconds')
  return pointSets
}

const getGraphState = function (ctx, fun, dl, dr, rt, rb, grain) {
  ctx.$d3.select('svg').remove()
  let graphHtml = ctx.$d3.select('.graph-area')
  let graphBox = ctx.$refs.graphArea.getBoundingClientRect()
  let maxEdge = (graphBox.width < graphBox.height) ? graphBox.width : graphBox.height

  var domainSize = dr - dl
  var rangeSize = (rt - rb)

  var VIEW_ZOOMOUT_SCALE = 0.1

  var vl = dl - (Math.abs(dl) * maxEdge / 5000)
  var vr = dr + (Math.abs(dr) * maxEdge / 5000)
  var vt = rt + (Math.abs(rt) * maxEdge / 5000)
  var vb = rb - (Math.abs(rb) * maxEdge / 5000)

  // if (vt > 0 && vb > 0) {
  //   vb = 0.2
  // }
  // if (vt < 0 && vb < 0) {
  //   vt = -0.2
  // }
  var viewLengthSize = vr - vl
  var viewHeightSize = vt - vb

  // make sure axes are shown
  if (vl >= 0 && vr >= 0) {
    vl = -0.15 * viewLengthSize
  }
  if (vl <= 0 && vr <= 0) {
    vr = 0.15 * viewLengthSize
  }

  // update the view size.
  viewLengthSize = vr - vl
  viewHeightSize = vt - vb

  // map a point to it's scaled location.
  var numToGridTickX = maxEdge / viewLengthSize
  var numToGridTickY = maxEdge / viewHeightSize

  let theme = ctx.$store.state.currentTheme

  let graphSvg = graphHtml.append('svg')
    .attr('width', maxEdge)
    .attr('height', maxEdge)
    .style('background-color', theme.graphColor)
    .attr('class', 'actual-graph-canvas')

  var nX = 9
  var nY = 9

  return {
    ctx,
    domainSize,
    rangeSize,
    graphSvg,
    graphHtml,
    maxEdge,
    numToGridTickX,
    numToGridTickY,
    dl,
    dr,
    rt,
    rb,
    fun,
    nX,
    nY,
    vl,
    vr,
    vb,
    vt,
    viewLengthSize,
    viewHeightSize,
    VIEW_ZOOMOUT_SCALE,
    ...theme,
    grain
  }
}

const xToScale = function (graph, oX) {
  return (oX - graph.vl) * graph.numToGridTickX
}

const yToScale = function (graph, oY) {
  return (-1 * oY + graph.vt) * graph.numToGridTickY
}

var scalePoint = function (oldPoint, graph) {
  var oldX = 0
  var oldY = 0
  // if (oldPoint.type === 'normal') {
  oldX = oldPoint.mx
  oldY = oldPoint.my
  // }
  let newX = xToScale(graph, oldX)
  let newY = yToScale(graph, oldY)
  var pt = Point(oldPoint.type, newX, newY)
  return pt
}

const scalePointSet = function (ps, graph) {
  var oldPointSet = JSON.parse(JSON.stringify(ps))
  var newPS = PointSet()
  newPS.spts = oldPointSet.spts
  newPS.pts = oldPointSet.pts.map((p) => (scalePoint(p, graph)))
  newPS.minYV = oldPointSet.minYV
  newPS.maxYV = oldPointSet.maxYV
  return newPS
}

// var rangeSize = (globalMaxY - globalMinY)
// var numToGridTickY = maxEdge / rangeSize

// var yToScale = function (oldY) {
//   var newY = (-1 * oldY + globalMaxY) * numToGridTickY
//   return newY
// }
const commitSpecialPoint = function (graph, point) {
  let scaledPoint = scalePoint(point, graph)
  let specialPointData = {
    x: point.mx,
    y: point.my,
    scaledX: scaledPoint.mx,
    scaledY: scaledPoint.my,
    name: point.mtype
  }
  graph.ctx.$store.commit('addCoolPoint', specialPointData)
}

const commitSpecialPointSet = function (graph, pointSet) {
  for (let pk in pointSet.spts) {
    commitSpecialPoint(graph, pointSet.spts[pk])
  }
}

// const renderPointSet = function (ctx, pointSet) {
// }

const graphPointSetNormalPoints = function (graph, pointSet, ft) {
  var graphPoints = graph.ctx.$d3.line()

  var funcCol = (ft === 'f') ? graph.functionOne : (ft === 'fp') ? graph.functionTwo : graph.functionThree
  // let scaledPoints = scalePoints(JSON.parse(JSON.stringify(functionData.points)))
  graph.graphSvg.append('path')
    .style('fill', 'none')
    .style('stroke', funcCol)
    .attr('d', graphPoints(pointSet.pts.map((point) => {
      return [point.mx, point.my]
    })))
}

const graphPointSetSpecialPoints = function (graph, pointSet, ft) {
  var funcCol = (ft === 'f') ? graph.functionOne : (ft === 'fp') ? graph.functionTwo : graph.functionThree
  // let scaledPoints = scalePoints(JSON.parse(JSON.stringify(functionData.points)))
  pointSet.spts.forEach((point) => {
    if (point.mtype === 'leftEndpoint' || point.mtype === 'rightEndpoint') {
      graph.graphSvg.append('circle')
        .style('fill', graph.functionOne)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 2)
    } else if (point.mtype === 'min') {
      graph.graphSvg.append('circle')
        .style('fill', graph.functionTwo)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 2)
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, point.mx))
        .attr('y', yToScale(graph, point.my) - 4)
        .attr('font-size', 10)
        .text('min')
    } else if (point.mtype === 'max') {
      graph.graphSvg.append('circle')
        .style('fill', graph.functionTwo)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 2)
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, point.mx))
        .attr('y', yToScale(graph, point.my) - 4)
        .attr('font-size', 10)
        .text('max')
    } else if (point.mtype === 'inflectionpt') {
      graph.graphSvg.append('circle')
        .style('fill', graph.functionThree)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 2)
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, point.mx))
        .attr('y', yToScale(graph, point.my) - 4)
        .attr('font-size', 10)
        .text('ip')
    } else if (point.mtype === 'zero') {
      graph.graphSvg.append('circle')
        .style('fill', funcCol)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 2)
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, point.mx))
        .attr('y', yToScale(graph, point.my) - 4)
        .attr('font-size', 10)
        .text('z')
    } else {
      graph.graphSvg.append('circle')
        .style('fill', funcCol)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 2)
    }
  })
}

const graphSetup = function (graph) {
  // tickmarks on X axis
  for (let i = 0; i <= 50; i++) {
    let putTick = function (xCoord) {
      var extraSpace
      if (`${xCoord}`.substring(0, 1) === '-') {
        extraSpace = 1
      } else {
        extraSpace = 0
      }
      graph.graphSvg.append('rect')
        .attr('x', xToScale(graph, xCoord))
        .attr('y', 0)
        .attr('width', 1)
        .attr('height', graph.maxEdge)
        .style('fill', graph.gridColor)
      graph.graphSvg.append('rect')
        .attr('x', xToScale(graph, xCoord))
        .attr('y', yToScale(graph, 0) - 3)
        .attr('width', 1)
        .attr('height', 6)
        .style('fill', graph.axisColor)
        .attr('class', 'x-tick')
      // tickmark labels.
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, xCoord))
        .attr('y', yToScale(graph, 0) - 3)
        .attr('width', 1)
        .attr('height', 6)
        .style('fill', graph.axisColor)
        .attr('class', 'x-tick-text')
        .text(((`${xCoord}`).substring(0, 5 + extraSpace)) || '0')
        .attr('font-size', '10px')
    }
    putTick(i * graph.viewLengthSize / graph.nX)
    putTick(-1 * i * graph.viewLengthSize / graph.nX)
  }

  // tickmarks on Y axis
  for (let i = 0; i <= 50; i++) {
    let putTick = function (yCoord) {
      var extraSpace
      if (`${yCoord}`.substring(0, 1) === '-') {
        extraSpace = 1
      } else {
        extraSpace = 0
      }
      graph.graphSvg.append('rect')
        .attr('x', 0)
        .attr('y', yToScale(graph, yCoord))
        .attr('width', graph.maxEdge)
        .attr('height', 1)
        .style('fill', graph.gridColor)
      graph.graphSvg.append('rect')
        .attr('x', xToScale(graph, 0) - 3)
        .attr('y', yToScale(graph, yCoord))
        .attr('width', 6)
        .attr('height', 1)
        .style('fill', graph.axisColor)
      // tickmark labels.
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, 0))
        .attr('y', yToScale(graph, yCoord))
        .attr('width', 6)
        .attr('height', 1)
        .style('fill', graph.axisColor)
        .attr('class', 'y-tick-text')
        .text(((`${yCoord}`).substring(0, 5 + extraSpace)) || '0')
        .attr('font-size', '10px')
    }
    putTick(i * graph.rangeSize / graph.nY)
    putTick(-1 * i * graph.rangeSize / graph.nY)
    // putTick(-1 * i * raneSize / nY)
  }

  // x axis
  graph.graphSvg.append('rect')
    .attr('x', 0)
    .attr('y', yToScale(graph, 0))
    .attr('width', graph.maxEdge)
    .attr('height', 0.5)
    .style('background-color', graph.axisColor)

  // y axis
  graph.graphSvg.append('rect')
    .attr('x', xToScale(graph, 0))
    .attr('y', 0)
    .attr('width', 0.5)
    .attr('height', graph.maxEdge)
    .style('background-color', graph.axisColor)
}

export default function graphFunc (fun, domainLeft, domainRight, rangeBottom, rangeTop, grain, ctx) {
  // validate the input
  fun = fun.split('').map(char => {
    if (char === 'X') {
      return 'x'
    }
    return char
  }).join('')

  // if the function is broke, stop
  try {
    let testreturn = evaluate(fun, domainLeft)
    if (isNaN(testreturn)) {
      return 0
    }
  } catch (er) {
    ctx.$store.commit('funcStatus', false)
    console.log(er)
    return 0
  }
  ctx.$store.commit('boundStatus', true)
  ctx.$store.commit('funcStatus', true)

  // if the domains aren't right, stop
  if (domainLeft >= domainRight) {
    return 0
  }

  // get the basic information about the graph.
  let graph = getGraphState(ctx, fun, domainLeft, domainRight, rangeTop, rangeBottom, grain)

  // I ----- originalPoints = getPoints(function)
  let { originalPoints, dPoints, sDPoints } = getPoints(' ' + fun, graph, 'f')

  // II ---- dPoints = getDerivativePoints(originalPoints)
  // temporary
  // let fPrime = derive(fun)
  // let dPoints = getPoints(' ' + fPrime, graph, 'fp')

  // // III --- dPoints = getDerivativePoints(dPoints)
  // let fDPrime = derive(fPrime)
  // let sDPoints = getPoints(' ' + fDPrime, graph, 'fpp')

  // IV ---- set bounds
  // get maximum y value.
  var consideredPointsList = []
  consideredPointsList.push(originalPoints)
  if (ctx.$store.state.isDerivativeChecked) {
    consideredPointsList.push(dPoints)
  }
  if (ctx.$store.state.isSecondDerivativeChecked) {
    consideredPointsList.push(sDPoints)
  }
  let globalMaxY = Math.max(...(consideredPointsList.map(ps => ps.maxYV)))
  let globalMinY = Math.min(...(consideredPointsList.map(ps => ps.minYV)))

  // make sure that the axes are shown.
  if (globalMaxY <= 0 && globalMinY <= 0) {
    globalMaxY = 0.05 * graph.viewHeightSize
  }
  if (globalMaxY >= 0 && globalMinY >= 0) {
    globalMinY = -0.05 * graph.viewHeightSize
  }

  if (ctx.$store.state.autoScaleYMaxMin) {
    // get the basic information about the graph.
    graph = getGraphState(ctx, fun, domainLeft, domainRight, globalMaxY, globalMinY, grain)
  }
  // V ----- render the graph axis and numbers.
  graphSetup(graph)

  // V ----- render originalPoints
  let scaledOpoints = scalePointSet(originalPoints, graph)
  graphPointSetNormalPoints(graph, scaledOpoints, 'f')
  graphPointSetSpecialPoints(graph, scaledOpoints, 'f')
  // VI ---- render dPoints
  if (ctx.$store.state.isDerivativeChecked) {
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphPointSetNormalPoints(graph, scaledDpoints, 'fp')
    graphPointSetSpecialPoints(graph, scaledDpoints, 'fp')
  }

  // VII --- render sdPoints
  if (ctx.$store.state.isSecondDerivativeChecked) {
    let scaledSDpoints = scalePointSet(sDPoints, graph)
    graphPointSetNormalPoints(graph, scaledSDpoints, 'fpp')
    graphPointSetSpecialPoints(graph, scaledSDpoints, 'fpp')
  }
  // add the special points to the store
  ctx.$store.commit('resetCoolPoints')

  commitSpecialPointSet(graph, originalPoints)
  commitSpecialPointSet(graph, dPoints)
  commitSpecialPointSet(graph, sDPoints)
}
