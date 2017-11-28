import math from 'mathjs'

var parser = math.parser()
export const evaluate = function (expr, val) {
  parser.eval('x = ' + val)
  return parser.eval(expr)
}
