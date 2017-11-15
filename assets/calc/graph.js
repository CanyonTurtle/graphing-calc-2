import { evaluate } from '../calc/mathjs-computations'

let NUM_POINTS = 100

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
  return ptset
}

// imput a function string, get back a set of points representing
// that function's evaluations across the interval.
// as well as the derivative and second derivative!
const getPoints = function (f, {dl, dr}, setting) {
  var pointSets = {
    originalPoints: null,
    dPoints: null,
    sDPoints: null
  }

  let grain = (dr - dl) / NUM_POINTS
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
  var lastIOutput = firstPoint.my
  var lastSlope = null

  // all the points in between
  for (let i = dl - grain - grain; i < dr; i += grain) {
    // needs to be tested.... what if it's NaN??

    // get the point, it's slope, and the slope's slope.
    iOutput = evaluate(f, i)
    let iSlope = (iOutput - lastIOutput) / grain
    let iSlopeSlope = (iSlope - lastSlope) / grain

    // cleanup for next run.
    lastIOutput = iOutput
    lastSlope = iSlope

    // add the points for the function, derivative, and second derivative
    // don't add the points on the 1/2nd tries.
    if (i >= dl) {
      let point = Point('normal', i, iOutput)
      points.addNormalPoint(point)
      let dpt = Point('normal', i, iSlope)
      dpts.addNormalPoint(dpt)
      let sdpt = Point('normal', i, iSlopeSlope)
      sdpts.addNormalPoint(sdpt)

      minY = Math.min(minY, iOutput, iSlope, iSlopeSlope)
      maxY = Math.max(maxY, iOutput, iSlope, iSlopeSlope)
      // check sign change -> zero, minmax, inflection!
      newSign = Math.sign(iOutput)
      if (oldSign !== newSign || newSign === 0) {
        // eslint-disable-next-line no-unused-vars
        points.addSpecialPoint(Point('zero', i, 0))
      }
      oldSign = newSign

      newDSign = Math.sign(iSlope)
      if (oldDSign !== newDSign || newDSign === 0) {
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
        points.addSpecialPoint(Point(
          funcMsg,
          i,
          iOutput
        ))
      }
      oldDSign = newDSign

      newSDSign = Math.sign(iSlopeSlope)
      if (oldSDSign !== newSDSign || newSDSign === 0) {
        points.addSpecialPoint(Point(
          'inflectionpt',
          i,
          iOutput
        ))
      }
      oldSDSign = newSDSign
    }
  }
  // last point
  let lastPoint = Point(
    'rightEndpoint',
    dr,
    evaluate(f, dr)
  )
  points.addSpecialPoint(lastPoint)

  minY = Math.min(minY, lastPoint.my)
  maxY = Math.max(maxY, lastPoint.my)

  points.minYV = minY
  points.maxYV = maxY
  dpts.minYV = minY
  dpts.maxYV = maxY
  sdpts.minYV = minY
  sdpts.maxYV = maxY

  pointSets.originalPoints = points
  pointSets.dPoints = dpts
  pointSets.sDPoints = sdpts

  return pointSets
}

const getGraphState = function (ctx, fun, dl, dr, rt, rb) {
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
    ...theme
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
  console.log('scaled points....')
  console.log(newPS)
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
  console.log('special point data:')
  console.log(specialPointData)
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
    graph.graphSvg.append('circle')
      .style('fill', funcCol)
      .style('stroke', funcCol)
      .attr('cx', xToScale(graph, point.mx))
      .attr('cy', yToScale(graph, point.my))
      .attr('r', 2)
  })
}

const graphSetup = function (graph) {
  // tickmarks on X axis
  for (let i = 0; i <= 50; i++) {
    let putTick = function (xCoord) {
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
        .text(((`${xCoord}`).substring(0, 4)) || '0')
        .attr('font-size', '10px')
    }
    putTick(i * graph.viewLengthSize / graph.nX)
    putTick(-1 * i * graph.viewLengthSize / graph.nX)
  }

  // tickmarks on Y axis
  for (let i = 0; i <= 50; i++) {
    let putTick = function (yCoord) {
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
        .text(((`${yCoord}`).substring(0, 4)) || '0')
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

export default function graphFunc (fun, domainLeft, domainRight, rangeBottom, rangeTop, ctx) {
  console.log('making a point set:')
  console.log(PointSet())
  console.log(PointSet().addNormalPoint(Point('normal', 1, 2)))
  // if the function is broke, stop
  try {
    evaluate(fun, 1)
  } catch (er) {
    return 0
  }

  // if the domains aren't right, stop
  if (domainLeft >= domainRight) {
    return 0
  }

  // get the basic information about the graph.
  let graph = getGraphState(ctx, fun, domainLeft, domainRight, rangeTop, rangeBottom)

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
  // console.log(consideredPointsList)
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
    graph = getGraphState(ctx, fun, domainLeft, domainRight, globalMaxY, globalMinY)
  }
  // V ----- render the graph axis and numbers.
  graphSetup(graph)

  console.log('original points!!!')
  console.log(originalPoints)
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
