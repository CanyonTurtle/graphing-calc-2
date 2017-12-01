import math from 'mathjs'

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
export const simpsonsRuleN = function (f, {dl, dr}, s) {
  let GRAIN = 0.001
  let n = s * 3
  let h = (dr - dl) / n
  var sum = 0

  sum += derive(f, dl, GRAIN)
  for (let i = 0; i < s; i++) {
    let xi = dl + i * h
    sum += 3 * derive(f, xi, GRAIN)
    xi += h
    sum += 3 * derive(f, xi, GRAIN)
    xi += h
    sum += 2 * derive(f, xi, GRAIN)
  }
  sum += derive(f, dr, GRAIN)
  sum *= 3 * h / 8

  return sum
}
