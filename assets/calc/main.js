import { evaluate, simpsonsRuleN } from './computations'
import { getPoints } from './get-points'
import {
  commitSpecialPointSet,
  graphPointSetNormalPoints,
  graphPointSetSpecialPoints,
  graphSetup,
  scalePointSet,
  graphAreaUnderPoints
} from './render-graph'
import { getGraphState } from './setup-graph'

// the entry point of the graphing function
export default function graphFunc (fun, domainLeft, domainRight, rangeBottom, rangeTop, grain, ctx) {
  // Capital X goes to x
  fun = fun.split('').map(char => {
    if (char === 'X') {
      return 'x'
    }
    return char
  }).join('')

  // validate the input - ensure that the function
  // is valid by trying it and if it fails, return
  try {
    let testreturn = evaluate(fun, domainLeft)
    if (isNaN(testreturn)) {
      return 0
    }
  } catch (er) {
    ctx.$store.commit('funcStatus', false)
    return 0
  }
  ctx.$store.commit('boundStatus', true)
  ctx.$store.commit('funcStatus', true)

  // if the domains aren't right, stop
  if (domainLeft >= domainRight) {
    return
  }

  // get the basic information about the graph.
  let graph = getGraphState(ctx, fun, domainLeft, domainRight, rangeTop, rangeBottom, grain)

  // I - III ----- originalPoints = getPoints(function)
  let { originalPoints, dPoints, sDPoints } = getPoints(' ' + fun, graph, 'f')

  // IV ---- set bounds
  // get maximum y value.
  var consideredPointsList = []
  consideredPointsList.push(originalPoints)
  if (ctx.$store.state.isDerivativeChecked) {
    consideredPointsList.push(dPoints)
  }
  if (ctx.$store.state.isSecondDerivativeChecked) {
    consideredPointsList.push(sDPoints)
  }
  let globalMaxY = Math.max(...(consideredPointsList.map(ps => ps.maxYV)))
  let globalMinY = Math.min(...(consideredPointsList.map(ps => ps.minYV)))

  // make sure that the axes are shown within the view.
  if (globalMaxY <= 0 && globalMinY <= 0) {
    globalMaxY = 0.05 * graph.viewHeightSize
  }
  if (globalMaxY >= 0 && globalMinY >= 0) {
    globalMinY = -0.05 * graph.viewHeightSize
  }

  // if the autoscale is on, the graph is reset with new size.
  // this alters thew view scaling for the rendering later.
  if (ctx.$store.state.autoScaleYMaxMin) {
    // get the basic information about the graph.
    graph = getGraphState(ctx, fun, domainLeft, domainRight, globalMaxY, globalMinY, grain)
  }

  // V ----- render the graph axis and numbers.
  graphSetup(graph)

  // V ----- render originalPoints
  let scaledOpoints = scalePointSet(originalPoints, graph)
  graphPointSetNormalPoints(graph, scaledOpoints, 'f')
  graphPointSetSpecialPoints(graph, scaledOpoints, 'f')

  // VI ---- render derivaive points
  if (ctx.$store.state.isDerivativeChecked) {
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphPointSetNormalPoints(graph, scaledDpoints, 'fp')
    graphPointSetSpecialPoints(graph, scaledDpoints, 'fp')
  }

  // VII --- render second derivative Points
  if (ctx.$store.state.isSecondDerivativeChecked) {
    let scaledSDpoints = scalePointSet(sDPoints, graph)
    graphPointSetNormalPoints(graph, scaledSDpoints, 'fpp')
    graphPointSetSpecialPoints(graph, scaledSDpoints, 'fpp')
  }

  // add the special points to the store
  ctx.$store.commit('resetCoolPoints')
  commitSpecialPointSet(graph, originalPoints)
  commitSpecialPointSet(graph, dPoints)
  commitSpecialPointSet(graph, sDPoints)

  // show the FTC if required.
  // only show the correct region
  if (graph.ctx.$store.state.showFTC) {
    dPoints.pts = dPoints.pts.filter(point => {
      return point.mx > graph.ctx.$store.state.domainLeft &&
        point.mx < graph.ctx.$store.state.domainRight
    })
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphAreaUnderPoints(graph, scaledDpoints, 'fp')

    // evaluate simpson's rule
    graph.ctx.$store.commit('setSimpsons', simpsonsRuleN(fun, graph, 3))
  }
}
