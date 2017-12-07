import math from 'mathjs'
import { Point } from './data'

// math evaluation dependence.
var parser = math.parser()
export const evaluate = function (expr, val) {
  parser.eval('x = ' + val)
  return parser.eval(expr)
}

// derivation algorithm: simply a difference quotient.
export const derive = function (f, x, grain) {
  return (evaluate(f, x + grain / 2) - evaluate(f, x - grain / 2)) / grain
}

// second derivative algorithm is just the difference quotient of 2 derivations!
export const secondDerive = function (f, x, grain) {
  return (derive(f, x + grain / 2, grain) - derive(f, x - grain / 2, grain)) / grain
}

// INTEGRAL APPROXIMATION
export const simpsonsRule = function (f, {dl, dr}) {
  return (
    (dr - dl) / 8 * (derive(f, dl, 0.001) +
      3 * derive(f, (2 * dl + dr) / 3, 0.001) +
      3 * derive(f, (dl + 2 * dr) / 3, 0.001) + derive(f, dr, 0.001)
    )
  )
}

// INTEGRAL APPROXIMATION
export const simpsonsRuleN = function ({dl, dr}, n, evaluator) {
  let h = (dr - dl) / n
  var sum = 0

  sum += evaluator(dl)
  for (let i = 0; i <= n; i += 1) {
    let xi = dl + i * h
    var coef = (i % 2 === 0) ? 4 : 2
    coef = (i === 0 || i === n) ? 1 : coef
    sum += coef * evaluator(xi)
  }
  sum *= h / 3

  return sum
}

// INTEGRAL APPROXIMATION
export const riemanSum = function ({dl, dr}, n, evaluator) {
  var i = dl
  var grain = (dr - dl / n)
  var area = 0
  while (i < dr) {
    let rectangle = grain * evaluator(i)
    area += rectangle
    i += grain
  }
  return area
}

// zero finder
export const findApproxZeroPointBetween = function (xl, xr, dl, dr, evaluator) {
  var rightBoundPoint = Point('normal', xr, evaluator(xr))
  var leftBoundPoint = Point('normal', xl, evaluator(xl))
  var jOutput = 1
  var newI = xr
  let j = 0
  while (j < 10 && Math.abs(jOutput) > 0.001) {
    j++
    newI = (rightBoundPoint.mx + leftBoundPoint.mx) / 2
    jOutput = evaluator(newI)
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
    return Point('zero', newI, jOutput)
  }
  return null
}
