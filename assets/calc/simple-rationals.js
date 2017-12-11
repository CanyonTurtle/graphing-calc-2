import { Point, PointSet } from './data'
// eslint-disable-next-line no-unused-vars
import { evaluate, findApproxZeroPointBetween } from './computations'

// let simpleRationalRegex = /\([^\(\)]+\) *\/ *\([^\(\)]+\)/

export const getRationalPoints = function (f1, f2, graph) {
  // evaluate f1
  // evaluate f2

  let dl = graph.dl
  let dr = graph.dr

  console.log('left: ' + dl + ' right: ' + dr)

  // the function is composed of the top and bottom.
  let f = '(' + f1 + ')/(' + f2 + ')'

  var pointSets = {
    originalPoints: null
  }

  // the number of individual points.
  let NUM_POINTS = 200

  // distance between points
  let grain = (dr - dl) / NUM_POINTS

  // sets of points to contain info about the points.
  var points = PointSet()

  // var topPoints = PointSet()
  // var bottomPoints = PointSet()

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

  // the top and bottom points are used to find asymptotes.
  let topPoint = Point('leftEndpoint', dl, evaluate(f1, dl))
  let bottomPoint = Point('leftEndpoint', dl, evaluate(f2, dl))

  // sign information is used to locate
  // zeroes, derivatives, inflection pts, etc...
  // var oldSign = Math.sign(firstPoint.my)
  var topOldSign = Math.sign(topPoint.my)
  var bottomOldSign = Math.sign(bottomPoint.my)

  // var newSign
  var topNewSign
  var bottomNewSign

  // represents the 'y' return from a given iteration
  var iOutput = firstPoint.my
  var topOutput = topPoint.my
  var bottomOutput = bottomPoint.my

  // if there are straight lines, these are for catching them
  // var continuousMinmaxCount = 0
  // var contiguousInflectionCount = 0
  // var dontShowMinMax = false
  // var dontShowInflectionPts = false

  // MAIN ITERATION
  // goes in sequence across the whole domain, before and after too to be accurate.
  for (let i = dl - (10 * grain); i < dr + (10 * grain); i += grain) {
    // needs to be tested.... what if it's NaN??
    // get the point, it's slope, and the slope's slope.
    iOutput = evaluate(f, i)
    topOutput = evaluate(f1, i)
    bottomOutput = evaluate(f2, i)

    // add the points for the function, derivative, and second derivative
    let point = Point('normal', i, iOutput)

    // check for mins or maxes.
    var checkMinMaxList = []
    checkMinMaxList.push(iOutput)

    // add the points to the point sets.
    points.addNormalPoint(point)

    // update min/max from the points.
    maxY = Math.max(maxY, ...checkMinMaxList)
    minY = Math.min(minY, ...checkMinMaxList)

    // check sign change -> zero, minmax, inflection!
    // newSign = Math.sign(iOutput)
    topNewSign = Math.sign(topOutput)
    bottomNewSign = Math.sign(bottomOutput)

    // if the bottom is a zero
    //   if the top is a zero this is a hole
    //   else this is an asymptote
    // else
    //   if the top is a zero this is a zero
    if (bottomOldSign !== bottomNewSign && i >= dl) {
      if (topOldSign !== topNewSign) {
        // find hole
        points.addSpecialPoint(Point('hole', i, iOutput))
      } else {
        // find asymptote
        points.addSpecialPoint(Point('asymptote', i, iOutput))
      }
    } else if (topOldSign !== topNewSign && i >= dl) {
      // find zero
      points.addSpecialPoint(Point('zero', i, iOutput))
    }

    // oldSign = newSign
    topOldSign = topNewSign
    bottomOldSign = bottomNewSign

    // if (oldSign !== newSign && i >= dl) {
    //   // ZERO FINDING ALGORITHM
    //   // works by averaging the points
    //   // on left and right side of interval
    //   // to continuously approach the zero.
    //   var rightBoundPoint = Point('normal', i, iOutput)
    //   var leftBoundPoint = JSON.parse(JSON.stringify(points.pts[points.pts.length - 2]))

    //   let zeroPoint = findApproxZeroPointBetween(leftBoundPoint.mx, rightBoundPoint.mx, dl, dr, (x) => {
    //     return evaluate(f, x)
    //   })
    //   if (zeroPoint) {
    //     points.addSpecialPoint(zeroPoint)
    //   }
    // }
  }

  // last point
  let lastPoint = Point('rightEndpoint', dr, evaluate(f, dr))
  points.addSpecialPoint(lastPoint)

  // update min/max from the endpoint
  minY = Math.min(minY, lastPoint.my)
  maxY = Math.max(maxY, lastPoint.my)

  // the points.
  points.minYV = minY
  points.maxYV = maxY

  // consolidate the return object with the point sets
  pointSets.originalPoints = points

  return pointSets
}
