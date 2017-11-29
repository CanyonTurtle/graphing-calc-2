import { evaluate } from '../calc/mathjs-computations'

// Point data type. represents a place and a type of point.
// Used extensively thruought graphing functions.
function Point (t, x, y) {
  var pt = { mtype: 'normal' }
  pt.mtype = t
  pt.mx = x
  pt.my = y
  return pt
}

// Represents a set of:
// - normal points
// - special points (zeros, inflection, etc.)
//
// also has information about the biggest and smallest Y value
// which is used for calculating the view size later.
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

// derivation algorithm: simply a difference quotient.
const derive = function (f, x, grain) {
  return (evaluate(f, x + grain / 2) - evaluate(f, x - grain / 2)) / grain
}

// second derivative algorithm is just the difference quotient of 2 derivations!
const secondDerive = function (f, x, grain) {
  return (derive(f, x + grain / 2, grain) - derive(f, x - grain / 2, grain)) / grain
}

// input a function string, get back a set of points representing
// that function's evaluations across the interval.
// as well as the derivative and second derivative!
const getPoints = function (f, {graphSvg, ctx, dl, dr, grain, ...graph}, setting) {
  var pointSets = {
    originalPoints: null,
    dPoints: null,
    sDPoints: null
  }

  // the number of individual points.
  let NUM_POINTS = 200

  // distance between points
  grain = (dr - dl) / NUM_POINTS

  // sets of points to contain info about the points.
  var points = PointSet()
  var dpts = PointSet()
  var sdpts = PointSet()

  // minimum/maximum used for the view calculation: needs to be stateful
  // for accumulation and checking during the point calculaition.
  var minY = null
  var maxY = null

  // first point
  let firstPoint = Point('leftEndpoint', dl, evaluate(f, dl))
  points.addSpecialPoint(firstPoint)

  // Check the min/maxes with new point
  minY = Math.min(minY, firstPoint.my)
  maxY = Math.max(maxY, firstPoint.my)

  // sign information is used to locate
  // zeroes, derivatives, inflection pts, etc...
  var oldSign = Math.sign(firstPoint.my)
  var oldDSign = Math.sign(firstPoint.my)
  var oldSDSign = Math.sign(firstPoint.my)

  var newSign
  var newDSign
  var newSDSign

  // represents the 'y' return from a given iteration
  var iOutput = firstPoint.my

  // if there are straight lines, these are for catching them
  var continuousMinmaxCount = 0
  var contiguousInflectionCount = 0
  var dontShowMinMax = false
  var dontShowInflectionPts = false

  // MAIN ITERATION
  // goes in sequence across the whole domain, before and after too to be accurate.
  for (let i = dl - (10 * grain); i < dr + (10 * grain); i += grain) {
    // needs to be tested.... what if it's NaN??
    // get the point, it's slope, and the slope's slope.
    iOutput = evaluate(f, i)
    let iSlope = derive(f, i, grain)
    let iSlopeSlope = secondDerive(f, i, grain)

    // add the points for the function, derivative, and second derivative
    let point = Point('normal', i, iOutput)
    let dpt = Point('normal', i, iSlope)
    let sdpt = Point('normal', i, iSlopeSlope)

    // check for mins or maxes.
    var checkMinMaxList = []
    checkMinMaxList.push(iOutput)
    if (ctx.$store.state.isDerivativeChecked) {
      checkMinMaxList.push(iSlope)
    }
    if (ctx.$store.state.isSecondDerivativeChecked) {
      checkMinMaxList.push(iSlopeSlope)
    }

    // add the points to the point sets.
    points.addNormalPoint(point)
    dpts.addNormalPoint(dpt)
    sdpts.addNormalPoint(sdpt)

    // update min/max from the points.
    maxY = Math.max(maxY, ...checkMinMaxList)
    minY = Math.min(minY, ...checkMinMaxList)

    // check sign change -> zero, minmax, inflection!
    newSign = Math.sign(iOutput)
    if (oldSign !== newSign && i >= dl) {
      // ZERO FINDING ALGORITHM
      // works by averaging the points
      // on left and right side of interval
      // to continuously approach the zero.
      var rightBoundPoint = Point('normal', i, iOutput)
      var leftBoundPoint = JSON.parse(JSON.stringify(points.pts[points.pts.length - 2]))
      var jOutput = 1
      var newI = i
      let j = 0
      while (j < 10 && Math.abs(jOutput) > 0.001) {
        j++
        newI = (rightBoundPoint.mx + leftBoundPoint.mx) / 2
        jOutput = evaluate(f, newI)

        // whichever point is furthest gets replaced by the found average, so the algorithm converges on 0
        if (Math.abs(rightBoundPoint.my) > Math.abs(leftBoundPoint.my)) {
          // ensure 0 is in the middle
          if (Math.sign(rightBoundPoint.my) === Math.sign(leftBoundPoint.my)) {
            leftBoundPoint.my = leftBoundPoint.my * -1
          }
          rightBoundPoint = Point('normal', newI, jOutput)
        } else {
          // ensure 0 is in the middle
          if (Math.sign(rightBoundPoint.my) === Math.sign(leftBoundPoint.my)) {
            rightBoundPoint.my = rightBoundPoint.my * -1
          }
          leftBoundPoint = Point('normal', newI, jOutput)
        }
      }
      if (newI >= dl && newI <= dr) {
        // only add special point if on domain
        points.addSpecialPoint(Point('zero', newI, jOutput))
      }
    }
    oldSign = newSign

    // MINMAX FINDING ALGORITHM
    // same as zero algorithm.
    newDSign = Math.sign(iSlope)
    if (oldDSign !== newDSign && i >= dl) {
      // this catches constant functions from making
      // a bunch of min/max points
      // since the derivative is constant on 0
      continuousMinmaxCount++
      if (continuousMinmaxCount > 5) {
        dontShowMinMax = true
      }

      // The sign checks are for if the point
      // is a min or a max.
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

      // same deal: iteratively average the points on either side of the min/max.
      var rightBoundPoint2 = Point('normal', i, iSlope)
      var leftBoundPoint2 = JSON.parse(JSON.stringify(dpts.pts[dpts.pts.length - 2]))
      var jOutput2 = 1
      var newI2 = i
      let j2 = 0
      while (j2 < 20 && Math.abs(jOutput2) > 0.001) {
        j2++
        newI2 = (rightBoundPoint2.mx + leftBoundPoint2.mx) / 2
        jOutput2 = derive(f, newI2, grain)
        if (Math.abs(rightBoundPoint2.my) > Math.abs(leftBoundPoint2.my)) {
          if (Math.sign(rightBoundPoint2.my) === Math.sign(leftBoundPoint2.my)) {
            leftBoundPoint2.my = leftBoundPoint2.my * -1
          }
          rightBoundPoint2 = Point('normal', newI2, jOutput2)
        } else {
          if (Math.sign(rightBoundPoint2.my) === Math.sign(leftBoundPoint2.my)) {
            rightBoundPoint2.my = rightBoundPoint2.my * -1
          }
          leftBoundPoint2 = Point('normal', newI2, jOutput2)
        }
      }
      // add the special point
      if (newI2 >= dl && newI2 <= dr) {
        points.addSpecialPoint(Point(funcMsg, newI2, evaluate(f, newI2)))
        // SPECIAL ZERO IDENTIFICATION LOGIC
        // helps when a zero doesn't cross the axis.
        if (Math.abs(evaluate(f, newI2)) < 0.01) {
          points.addSpecialPoint(Point('zero', newI2, 0))
        }
      }
    } else {
      // reset for new mins/maxes not in a row
      continuousMinmaxCount = 0
    }
    oldDSign = newDSign

    // INFLECTION POINT FINDER
    // same deal as the first two.
    newSDSign = Math.sign(iSlopeSlope)
    if (oldSDSign !== newSDSign && i > dl) {
      // identify inflection points all in a row
      // same deal as minmax finder
      contiguousInflectionCount++
      if (contiguousInflectionCount > 5) {
        dontShowInflectionPts = true
      }
      var rightBoundPoint3 = Point('normal', i, iSlopeSlope)
      var leftBoundPoint3 = JSON.parse(JSON.stringify(sdpts.pts[sdpts.pts.length - 2]))
      var jOutput3 = 1
      var newI3 = i
      let j3 = 0
      while (j3 < 20 && Math.abs(jOutput3) > 0.001) {
        j3++
        newI3 = (rightBoundPoint3.mx + leftBoundPoint3.mx) / 2
        jOutput3 = secondDerive(f, newI3, grain)
        if (Math.abs(rightBoundPoint3.my) > Math.abs(leftBoundPoint3.my)) {
          if (Math.sign(rightBoundPoint3.my) === Math.sign(leftBoundPoint3.my)) {
            leftBoundPoint3.my = leftBoundPoint3.my * -1
          }
          rightBoundPoint3 = Point('normal', newI3, jOutput3)
        } else {
          if (Math.sign(rightBoundPoint3.my) === Math.sign(leftBoundPoint3.my)) {
            rightBoundPoint3.my = rightBoundPoint3.my * -1
          }
          leftBoundPoint3 = Point('normal', newI3, jOutput3)
        }
      }
      if (newI3 >= dl && newI3 <= dr) {
        // add the special point.
        points.addSpecialPoint(Point('inflectionpt', newI3, evaluate(f, newI3)))
      }
    } else {
      // reset if the second derivative changes.
      contiguousInflectionCount = 0
    }
    oldSDSign = newSDSign
  }
  // last point
  let lastPoint = Point('rightEndpoint', dr, evaluate(f, dr))
  points.addSpecialPoint(lastPoint)

  // update min/max from the endpoint
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

  // add the values to the point sets
  points.minYV = minY
  points.maxYV = maxY
  dpts.minYV = minY
  dpts.maxYV = maxY
  sdpts.minYV = minY
  sdpts.maxYV = maxY

  // consolidate the return object with the point sets
  pointSets.originalPoints = points
  pointSets.dPoints = dpts
  pointSets.sDPoints = sdpts

  return pointSets
}

// get information about the graph.
const getGraphState = function (ctx, fun, dl, dr, rt, rb, grain) {
  ctx.$d3.select('svg').remove()
  let graphHtml = ctx.$d3.select('.graph-area')
  let graphBox = ctx.$refs.graphArea.getBoundingClientRect()
  let maxEdge = (graphBox.width < graphBox.height) ? graphBox.width : graphBox.height

  // size of domains
  var domainSize = dr - dl
  var rangeSize = (rt - rb)

  // zooms out the view for the user
  var VIEW_ZOOMOUT_SCALE = 0.1

  // calculates the view bounds
  var vl = dl - (Math.abs(dl) * maxEdge / 5000)
  var vr = dr + (Math.abs(dr) * maxEdge / 5000)
  var vt = rt + (Math.abs(rt) * maxEdge / 5000)
  var vb = rb - (Math.abs(rb) * maxEdge / 5000)

  // size of viewport dimensions
  var viewLengthSize = vr - vl
  var viewHeightSize = vt - vb

  // force the axes to show within the view
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

  // coloring information
  let theme = ctx.$store.state.currentTheme

  // adding the graph canvas
  let graphSvg = graphHtml.append('svg')
    .attr('width', maxEdge)
    .attr('height', maxEdge)
    .style('background-color', theme.graphColor)
    .attr('class', 'actual-graph-canvas')

  // controls the number of grid ticks on the graph.
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

// map x points to the real-screen location
const xToScale = function (graph, oX) {
  return (oX - graph.vl) * graph.numToGridTickX
}

// map y points to the real-screen location
const yToScale = function (graph, oY) {
  return (-1 * oY + graph.vt) * graph.numToGridTickY
}

// map points to the real-screen location
var scalePoint = function (oldPoint, graph) {
  var oldX = 0
  var oldY = 0

  oldX = oldPoint.mx
  oldY = oldPoint.my

  let newX = xToScale(graph, oldX)
  let newY = yToScale(graph, oldY)
  var pt = Point(oldPoint.type, newX, newY)
  return pt
}

// map entire pointsets to the real-screen location
const scalePointSet = function (ps, graph) {
  var oldPointSet = JSON.parse(JSON.stringify(ps))
  var newPS = PointSet()
  newPS.spts = oldPointSet.spts
  newPS.pts = oldPointSet.pts.map((p) => (scalePoint(p, graph)))
  newPS.minYV = oldPointSet.minYV
  newPS.maxYV = oldPointSet.maxYV
  return newPS
}

// special points are labeled places on the graph
// that also show in the table.
// this tells the UI to have the points.
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

// all the special points in a pointset get put in the UI.
const commitSpecialPointSet = function (graph, pointSet) {
  for (let pk in pointSet.spts) {
    commitSpecialPoint(graph, pointSet.spts[pk])
  }
}

// takes the normal points in a point set,
// and graphs them - the rendering stage,
// NOT the evaluating stage (see getPoints)
const graphPointSetNormalPoints = function (graph, pointSet, ft) {
  var graphPoints = graph.ctx.$d3.line()

  var funcCol = (ft === 'f') ? graph.functionOne : (ft === 'fp') ? graph.functionTwo : graph.functionThree
  let dl = xToScale(graph, graph.dl)
  let dr = xToScale(graph, graph.dr)

  // append the points to the SVG element in the UI
  graph.graphSvg.append('path')
    .style('fill', 'none')
    .style('stroke', funcCol)
    .attr('d', graphPoints(pointSet.pts.filter(point => {
      // filter out points not in the domain interval
      if (point.mx >= dl && point.mx <= dr) {
        return true
      }
      return false
    }).map(point => {
      return [point.mx, point.my]
    })))
}

// put special points on the graph
// uses many unique cases for different points.
const graphPointSetSpecialPoints = function (graph, pointSet, ft) {
  // the color choice
  var funcCol = (ft === 'f') ? graph.functionOne : (ft === 'fp') ? graph.functionTwo : graph.functionThree

  // each point is identified and a unique point is placed.
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

// put the parts of the graph that need to
// be there to understand it - axes, ticks, etc.
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

// FTC AREA VISUAL
// updates the UI to show the lines representing the area
// under f prime.
const graphAreaUnderPoints = (graph, pointSet, ft) => {
  // color
  var funcCol = (ft === 'f') ? graph.functionOne : (ft === 'fp') ? graph.functionTwo : graph.functionThree

  // if the y value is negative, the rectangle is above.
  // otherwise it is right at the x and Y location.
  pointSet.pts.forEach((point) => {
    let g = graph.graphSvg.append('rect')
      .style('fill', 'none')
      .style('stroke', funcCol)
      .attr('x', point.mx)
      .attr('width', 0.1)
    if (point.my - yToScale(graph, 0) >= 0) {
      g.attr('height', Math.abs(point.my - yToScale(graph, 0)))
        .attr('y', point.my - Math.abs(point.my - yToScale(graph, 0)))
    } else {
      g.attr('height', Math.abs(point.my - yToScale(graph, 0)))
        .attr('y', point.my)
    }
  })
}

// the entry point of the graphing function
export default function graphFunc (fun, domainLeft, domainRight, rangeBottom, rangeTop, grain, ctx) {
  // Capital X goes to x
  fun = fun.split('').map(char => {
    if (char === 'X') {
      return 'x'
    }
    return char
  }).join('')

  // validate the input - ensure that the function
  // is valid by trying it and if it fails, return
  try {
    let testreturn = evaluate(fun, domainLeft)
    if (isNaN(testreturn)) {
      return 0
    }
  } catch (er) {
    ctx.$store.commit('funcStatus', false)
    return 0
  }
  ctx.$store.commit('boundStatus', true)
  ctx.$store.commit('funcStatus', true)

  // if the domains aren't right, stop
  if (domainLeft >= domainRight) {
    return
  }

  // get the basic information about the graph.
  let graph = getGraphState(ctx, fun, domainLeft, domainRight, rangeTop, rangeBottom, grain)

  // I - III ----- originalPoints = getPoints(function)
  let { originalPoints, dPoints, sDPoints } = getPoints(' ' + fun, graph, 'f')

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

  // make sure that the axes are shown within the view.
  if (globalMaxY <= 0 && globalMinY <= 0) {
    globalMaxY = 0.05 * graph.viewHeightSize
  }
  if (globalMaxY >= 0 && globalMinY >= 0) {
    globalMinY = -0.05 * graph.viewHeightSize
  }

  // if the autoscale is on, the graph is reset with new size.
  // this alters thew view scaling for the rendering later.
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

  // VI ---- render derivaive points
  if (ctx.$store.state.isDerivativeChecked) {
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphPointSetNormalPoints(graph, scaledDpoints, 'fp')
    graphPointSetSpecialPoints(graph, scaledDpoints, 'fp')
  }

  // VII --- render second derivative Points
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

  // show the FTC if required.
  // only show the correct region
  if (graph.ctx.$store.state.showFTC) {
    dPoints.pts = dPoints.pts.filter(point => {
      return point.mx > graph.ctx.$store.state.domainLeft &&
        point.mx < graph.ctx.$store.state.domainRight
    })
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphAreaUnderPoints(graph, scaledDpoints, 'fp')
  }
}
