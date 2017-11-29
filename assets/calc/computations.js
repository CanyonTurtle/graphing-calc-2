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
