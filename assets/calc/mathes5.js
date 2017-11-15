/* eslint-disable */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.derive = exports.evaluate = undefined;

var _mathjs = require('mathjs');

var _mathjs2 = _interopRequireDefault(_mathjs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parser = _mathjs2.default.parser();
var evaluate = exports.evaluate = function evaluate(expr, val) {
  parser.eval('x = ' + val);
  return parser.eval(expr);
};

var derive = exports.derive = function derive(expr) {
  return _mathjs2.default.derivative(expr, 'x');
};