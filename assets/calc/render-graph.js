import { Point, PointSet } from './data'

// map x points to the real-screen location
export const xToScale = function (graph, oX) {
  return (oX - graph.vl) * graph.numToGridTickX
}

// map y points to the real-screen location
export const yToScale = function (graph, oY) {
  return (-1 * oY + graph.vt) * graph.numToGridTickY
}

// map points to the real-screen location
export const scalePoint = function (oldPoint, graph) {
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
export const scalePointSet = function (ps, graph) {
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
export const commitSpecialPoint = function (graph, point) {
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
export const commitSpecialPointSet = function (graph, pointSet) {
  for (let pk in pointSet.spts) {
    commitSpecialPoint(graph, pointSet.spts[pk])
  }
}

// takes the normal points in a point set,
// and graphs them - the rendering stage,
// NOT the evaluating stage (see getPoints)
export const graphPointSetNormalPoints = function (graph, pointSet, ft) {
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
export const graphPointSetSpecialPoints = function (graph, pointSet, ft) {
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
    } else if (point.mtype === 'hole') {
      graph.graphSvg.append('circle')
        .style('fill', graph.graphColor)
        .style('stroke', funcCol)
        .attr('cx', xToScale(graph, point.mx))
        .attr('cy', yToScale(graph, point.my))
        .attr('r', 3)
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, point.mx))
        .attr('y', yToScale(graph, point.my) - 4)
        .attr('font-size', 10)
        .text('h')
    } else if (point.mtype === 'asymptote') {
      graph.graphSvg.append('rect')
        .style('fill', '#000000')
        .style('stroke', funcCol)
        .attr('x', xToScale(graph, point.mx))
        .attr('y', 0)
        .attr('width', 3)
        .attr('height', 1000)
      graph.graphSvg.append('text')
        .attr('x', xToScale(graph, point.mx))
        .attr('y', yToScale(graph, point.my) - 4)
        .attr('font-size', 10)
        .text('h')
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
export const graphSetup = function (graph) {
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
export const graphAreaUnderPoints = (graph, pointSet, ft) => {
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
