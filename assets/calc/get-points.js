import { Point, PointSet } from './data'
import { evaluate, derive, secondDerive } from './computations'

// input a function string, get back a set of points representing
// that function's evaluations across the interval.
// as well as the derivative and second derivative!
export const getPoints = function (f, {graphSvg, ctx, dl, dr, grain, ...graph}, setting) {
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
