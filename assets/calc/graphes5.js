/* eslint-disable */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = graphFunc;

var _mathjsComputations = require('./mathes5');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NUM_POINTS = 100;

var Point = function () {
  function Point(t, x, y) {
    _classCallCheck(this, Point);

    this.mtype = 'normal';

    this.mtype = t;
    this.mx = x;
    this.my = y;
  }

  _createClass(Point, [{
    key: 'x',
    get: function get() {
      return this.mx;
    }
  }, {
    key: 'y',
    get: function get() {
      return this.my;
    }
  }, {
    key: 'type',
    get: function get() {
      return this.mtype;
    }
  }]);

  return Point;
}();

var PointSet = function () {
  function PointSet() {
    _classCallCheck(this, PointSet);

    this.pts = [];
    this.spts = [];
    this.minYV = 0;
    this.maxYV = 0;
  }

  _createClass(PointSet, [{
    key: 'addNormalPoint',
    value: function addNormalPoint(pt) {
      this.pts.push(pt);
    }
  }, {
    key: 'addSpecialPoint',
    value: function addSpecialPoint(spt) {
      this.spts.push(spt);
    }
  }, {
    key: 'normalPoints',
    get: function get() {
      return this.pts;
    },
    set: function set(val) {
      this.pts = val;
    }
  }, {
    key: 'specialPoints',
    get: function get() {
      return this.spts;
    }
  }, {
    key: 'maxY',
    set: function set(val) {
      this.maxYV = val;
    },
    get: function get() {
      return this.maxYV;
    }
  }, {
    key: 'minY',
    set: function set(val) {
      this.minYV = val;
    },
    get: function get() {
      return this.minYV;
    }
  }]);

  return PointSet;
}();

// imput a function string, get back a set of points representing
// that function's evaluations across the interval.
// as well as the derivative and second derivative!


var getPoints = function getPoints(f, _ref, setting) {
  var dl = _ref.dl,
      dr = _ref.dr;

  var pointSets = {
    originalPoints: null,
    dPoints: null,
    sDPoints: null
  };

  var grain = (dr - dl) / NUM_POINTS;
  var points = new PointSet();
  var dpts = new PointSet();
  var sdpts = new PointSet();

  var minY = null;
  var maxY = null;

  // first point
  var firstPoint = new Point('leftEndpoint', dl, (0, _mathjsComputations.evaluate)(f, dl));
  points.addSpecialPoint(firstPoint);

  minY = Math.min(minY, firstPoint.y);
  maxY = Math.max(maxY, firstPoint.y);

  var oldSign = Math.sign(firstPoint.y);
  var oldDSign = Math.sign(firstPoint.y);
  var oldSDSign = Math.sign(firstPoint.y);

  var newSign;
  var newDSign;
  var newSDSign;

  var iOutput = firstPoint.y;
  var lastIOutput = firstPoint.y;
  var lastSlope = null;

  // all the points in between
  for (var i = dl - grain - grain; i < dr; i += grain) {
    // needs to be tested.... what if it's NaN??

    // get the point, it's slope, and the slope's slope.
    iOutput = (0, _mathjsComputations.evaluate)(f, i);
    var iSlope = (iOutput - lastIOutput) / grain;
    var iSlopeSlope = (iSlope - lastSlope) / grain;

    // cleanup for next run.
    lastIOutput = iOutput;
    lastSlope = iSlope;

    // add the points for the function, derivative, and second derivative
    // don't add the points on the 1/2nd tries.
    if (i >= dl) {
      var point = new Point('normal', i, iOutput);
      points.addNormalPoint(point);
      var dpt = new Point('normal', i, iSlope);
      dpts.addNormalPoint(dpt);
      var sdpt = new Point('normal', i, iSlopeSlope);
      sdpts.addNormalPoint(sdpt);

      minY = Math.min(minY, iOutput, iSlope, iSlopeSlope);
      maxY = Math.max(maxY, iOutput, iSlope, iSlopeSlope);
      // check sign change -> zero, minmax, inflection!
      newSign = Math.sign(iOutput);
      if (oldSign !== newSign || newSign === 0) {
        // eslint-disable-next-line no-unused-vars
        points.addSpecialPoint(new Point('zero', i, 0));
      }
      oldSign = newSign;

      newDSign = Math.sign(iSlope);
      if (oldDSign !== newDSign || newDSign === 0) {
        // add a special point here.
        var funcMsg = 'min';
        var sd = '1';
        if (oldDSign === -1) {
          sd = 1;
        }
        if (oldDSign === 1) {
          sd = -1;
        }
        if (sd === 1) {
          funcMsg = 'min';
        }
        if (sd === -1) {
          funcMsg = 'max';
        }
        points.addSpecialPoint(new Point(funcMsg, i, iOutput));
      }
      oldDSign = newDSign;

      newSDSign = Math.sign(iSlopeSlope);
      if (oldSDSign !== newSDSign || newSDSign === 0) {
        points.addSpecialPoint(new Point('inflectionpt', i, iOutput));
      }
      oldSDSign = newSDSign;
    }
  }
  // last point
  var lastPoint = new Point('rightEndpoint', dr, (0, _mathjsComputations.evaluate)(f, dr));
  points.addSpecialPoint(lastPoint);

  minY = Math.min(minY, lastPoint.y);
  maxY = Math.max(maxY, lastPoint.y);

  points.minY = minY;
  points.maxY = maxY;
  dpts.minY = minY;
  dpts.maxY = maxY;
  sdpts.minY = minY;
  sdpts.maxY = maxY;

  pointSets.originalPoints = points;
  pointSets.dPoints = dpts;
  pointSets.sDPoints = sdpts;

  return pointSets;
};

var getGraphState = function getGraphState(ctx, fun, dl, dr, rt, rb) {
  ctx.$d3.select('svg').remove();
  var graphHtml = ctx.$d3.select('.graph-area');
  var graphBox = ctx.$refs.graphArea.getBoundingClientRect();
  var maxEdge = graphBox.width < graphBox.height ? graphBox.width : graphBox.height;

  var domainSize = dr - dl;
  var rangeSize = rt - rb;

  var VIEW_ZOOMOUT_SCALE = 0.1;

  var vl = dl - Math.abs(dl) * maxEdge / 5000;
  var vr = dr + Math.abs(dr) * maxEdge / 5000;
  var vt = rt + Math.abs(rt) * maxEdge / 5000;
  var vb = rb - Math.abs(rb) * maxEdge / 5000;

  // if (vt > 0 && vb > 0) {
  //   vb = 0.2
  // }
  // if (vt < 0 && vb < 0) {
  //   vt = -0.2
  // }
  var viewLengthSize = vr - vl;
  var viewHeightSize = vt - vb;

  // make sure axes are shown
  if (vl >= 0 && vr >= 0) {
    vl = -0.15 * viewLengthSize;
  }
  if (vl <= 0 && vr <= 0) {
    vr = 0.15 * viewLengthSize;
  }

  // update the view size.
  viewLengthSize = vr - vl;
  viewHeightSize = vt - vb;

  // map a point to it's scaled location.
  var numToGridTickX = maxEdge / viewLengthSize;
  var numToGridTickY = maxEdge / viewHeightSize;

  var theme = ctx.$store.state.currentTheme;

  var graphSvg = graphHtml.append('svg').attr('width', maxEdge).attr('height', maxEdge).style('background-color', theme.graphColor).attr('class', 'actual-graph-canvas');

  var nX = 9;
  var nY = 9;

  return _extends({
    ctx: ctx,
    domainSize: domainSize,
    rangeSize: rangeSize,
    graphSvg: graphSvg,
    graphHtml: graphHtml,
    maxEdge: maxEdge,
    numToGridTickX: numToGridTickX,
    numToGridTickY: numToGridTickY,
    dl: dl,
    dr: dr,
    rt: rt,
    rb: rb,
    fun: fun,
    nX: nX,
    nY: nY,
    vl: vl,
    vr: vr,
    vb: vb,
    vt: vt,
    viewLengthSize: viewLengthSize,
    viewHeightSize: viewHeightSize,
    VIEW_ZOOMOUT_SCALE: VIEW_ZOOMOUT_SCALE
  }, theme);
};

var xToScale = function xToScale(graph, oX) {
  return (oX - graph.vl) * graph.numToGridTickX;
};

var yToScale = function yToScale(graph, oY) {
  return (-1 * oY + graph.vt) * graph.numToGridTickY;
};

var scalePoint = function scalePoint(oldPoint, graph) {
  var oldX = 0;
  var oldY = 0;
  // if (oldPoint.type === 'normal') {
  oldX = oldPoint.mx;
  oldY = oldPoint.my;
  // }
  var newX = xToScale(graph, oldX);
  var newY = yToScale(graph, oldY);
  return new Point(oldPoint.type, newX, newY);
};

var scalePointSet = function scalePointSet(ps, graph) {
  var oldPointSet = JSON.parse(JSON.stringify(ps));
  var newPS = new PointSet();
  newPS.spts = oldPointSet.spts;
  newPS.normalPoints = oldPointSet.pts.map(function (p) {
    return scalePoint(p, graph);
  });
  return newPS;
};

// var rangeSize = (globalMaxY - globalMinY)
// var numToGridTickY = maxEdge / rangeSize

// var yToScale = function (oldY) {
//   var newY = (-1 * oldY + globalMaxY) * numToGridTickY
//   return newY
// }
var commitSpecialPoint = function commitSpecialPoint(graph, point) {
  var scaledPoint = scalePoint(point, graph);
  graph.ctx.$store.commit('addCoolPoint', {
    x: point.x,
    y: point.y,
    scaledX: scaledPoint.x,
    scaledY: scaledPoint.y,
    name: point.type
  });
};

var commitSpecialPointSet = function commitSpecialPointSet(graph, pointSet) {
  for (var pk in pointSet.specialPoints) {
    commitSpecialPoint(graph, pointSet.specialPoints[pk]);
  }
};

// const renderPointSet = function (ctx, pointSet) {
// }

var graphPointSetNormalPoints = function graphPointSetNormalPoints(graph, pointSet, ft) {
  var graphPoints = graph.ctx.$d3.line();

  var funcCol = ft === 'f' ? graph.functionOne : ft === 'fp' ? graph.functionTwo : graph.functionThree;
  // let scaledPoints = scalePoints(JSON.parse(JSON.stringify(functionData.points)))
  graph.graphSvg.append('path').style('fill', 'none').style('stroke', funcCol).attr('d', graphPoints(pointSet.pts.map(function (point) {
    return [point.mx, point.my];
  })));
};

var graphPointSetSpecialPoints = function graphPointSetSpecialPoints(graph, pointSet, ft) {
  var funcCol = ft === 'f' ? graph.functionOne : ft === 'fp' ? graph.functionTwo : graph.functionThree;
  // let scaledPoints = scalePoints(JSON.parse(JSON.stringify(functionData.points)))
  pointSet.spts.forEach(function (point) {
    graph.graphSvg.append('circle').style('fill', funcCol).style('stroke', funcCol).attr('cx', xToScale(graph, point.mx)).attr('cy', yToScale(graph, point.my)).attr('r', 2);
  });
};

var graphSetup = function graphSetup(graph) {
  // tickmarks on X axis
  for (var i = 0; i <= 50; i++) {
    var putTick = function putTick(xCoord) {
      graph.graphSvg.append('rect').attr('x', xToScale(graph, xCoord)).attr('y', 0).attr('width', 1).attr('height', graph.maxEdge).style('fill', graph.gridColor);
      graph.graphSvg.append('rect').attr('x', xToScale(graph, xCoord)).attr('y', yToScale(graph, 0) - 3).attr('width', 1).attr('height', 6).style('fill', graph.axisColor).attr('class', 'x-tick');
      // tickmark labels.
      graph.graphSvg.append('text').attr('x', xToScale(graph, xCoord)).attr('y', yToScale(graph, 0) - 3).attr('width', 1).attr('height', 6).style('fill', graph.axisColor).attr('class', 'x-tick-text').text(('' + xCoord).substring(0, 4) || '0').attr('font-size', '10px');
    };
    putTick(i * graph.viewLengthSize / graph.nX);
    putTick(-1 * i * graph.viewLengthSize / graph.nX);
  }

  // tickmarks on Y axis
  for (var _i = 0; _i <= 50; _i++) {
    var _putTick = function _putTick(yCoord) {
      graph.graphSvg.append('rect').attr('x', 0).attr('y', yToScale(graph, yCoord)).attr('width', graph.maxEdge).attr('height', 1).style('fill', graph.gridColor);
      graph.graphSvg.append('rect').attr('x', xToScale(graph, 0) - 3).attr('y', yToScale(graph, yCoord)).attr('width', 6).attr('height', 1).style('fill', graph.axisColor);
      // tickmark labels.
      graph.graphSvg.append('text').attr('x', xToScale(graph, 0)).attr('y', yToScale(graph, yCoord)).attr('width', 6).attr('height', 1).style('fill', graph.axisColor).attr('class', 'y-tick-text').text(('' + yCoord).substring(0, 4) || '0').attr('font-size', '10px');
    };
    _putTick(_i * graph.rangeSize / graph.nY);
    _putTick(-1 * _i * graph.rangeSize / graph.nY);
    // putTick(-1 * i * raneSize / nY)
  }

  // x axis
  graph.graphSvg.append('rect').attr('x', 0).attr('y', yToScale(graph, 0)).attr('width', graph.maxEdge).attr('height', 0.5).style('background-color', graph.axisColor);

  // y axis
  graph.graphSvg.append('rect').attr('x', xToScale(graph, 0)).attr('y', 0).attr('width', 0.5).attr('height', graph.maxEdge).style('background-color', graph.axisColor);
};

function graphFunc(fun, domainLeft, domainRight, rangeBottom, rangeTop, ctx) {
  // if the function is broke, stop
  try {
    (0, _mathjsComputations.evaluate)(fun, 1);
  } catch (er) {
    return 0;
  }

  // if the domains aren't right, stop
  if (domainLeft >= domainRight) {
    return 0;
  }

  // get the basic information about the graph.
  var graph = getGraphState(ctx, fun, domainLeft, domainRight, rangeTop, rangeBottom);

  // I ----- originalPoints = getPoints(function)

  var _getPoints = getPoints(' ' + fun, graph, 'f'),
      originalPoints = _getPoints.originalPoints,
      dPoints = _getPoints.dPoints,
      sDPoints = _getPoints.sDPoints;

  // II ---- dPoints = getDerivativePoints(originalPoints)
  // temporary
  // let fPrime = derive(fun)
  // let dPoints = getPoints(' ' + fPrime, graph, 'fp')

  // // III --- dPoints = getDerivativePoints(dPoints)
  // let fDPrime = derive(fPrime)
  // let sDPoints = getPoints(' ' + fDPrime, graph, 'fpp')

  // IV ---- set bounds
  // get maximum y value.


  var consideredPointsList = [];
  consideredPointsList.push(originalPoints);
  if (ctx.$store.state.isDerivativeChecked) {
    consideredPointsList.push(dPoints);
  }
  if (ctx.$store.state.isSecondDerivativeChecked) {
    consideredPointsList.push(sDPoints);
  }
  console.log(consideredPointsList);
  var globalMaxY = Math.max.apply(Math, _toConsumableArray(consideredPointsList.map(function (ps) {
    return ps.maxYV;
  })));
  var globalMinY = Math.min.apply(Math, _toConsumableArray(consideredPointsList.map(function (ps) {
    return ps.minYV;
  })));

  // make sure that the axes are shown.
  if (globalMaxY <= 0 && globalMinY <= 0) {
    globalMaxY = 0.05 * graph.viewHeightSize;
  }
  if (globalMaxY >= 0 && globalMinY >= 0) {
    globalMinY = -0.05 * graph.viewHeightSize;
  }

  if (ctx.$store.state.autoScaleYMaxMin) {
    // get the basic information about the graph.
    graph = getGraphState(ctx, fun, domainLeft, domainRight, globalMaxY, globalMinY);
  }
  // V ----- render the graph axis and numbers.
  graphSetup(graph);

  // V ----- render originalPoints
  var scaledOpoints = scalePointSet(originalPoints, graph);
  graphPointSetNormalPoints(graph, scaledOpoints, 'f');
  graphPointSetSpecialPoints(graph, scaledOpoints, 'f');
  // VI ---- render dPoints
  if (ctx.$store.state.isDerivativeChecked) {
    var scaledDpoints = scalePointSet(dPoints, graph);
    graphPointSetNormalPoints(graph, scaledDpoints, 'fp');
    graphPointSetSpecialPoints(graph, scaledDpoints, 'fp');
  }

  // VII --- render sdPoints
  if (ctx.$store.state.isSecondDerivativeChecked) {
    var scaledSDpoints = scalePointSet(sDPoints, graph);
    graphPointSetNormalPoints(graph, scaledSDpoints, 'fpp');
    graphPointSetSpecialPoints(graph, scaledSDpoints, 'fpp');
  }
  // add the special points to the store
  ctx.$store.commit('resetCoolPoints');

  commitSpecialPointSet(graph, originalPoints);
  commitSpecialPointSet(graph, dPoints);
  commitSpecialPointSet(graph, sDPoints);
}