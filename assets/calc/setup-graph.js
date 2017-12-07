// get information about the graph.
export const getGraphState = function (ctx, fun, dl, dr, rb, rt, isDerivativeChecked, isSecondDerivativeChecked, autoScaleMaxMin, showFTC, grain) {
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
    isDerivativeChecked,
    isSecondDerivativeChecked,
    autoScaleMaxMin,
    showFTC,
    ...theme,
    grain
  }
}
