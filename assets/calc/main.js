import { evaluate, derive, simpsonsRuleN } from './computations'
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
import { validateInputForm } from './validate'

// the entry point of the graphing function
export default function graphFunc (fun, domainLeft, domainRight, rangeBottom, rangeTop, isDerivativeChecked, isSecondDerivativeChecked, autoScaleMaxMin, showFTC, grain, ctx) {
  console.log(domainLeft)
  console.log(domainRight)
  ctx.$store.commit('graphRefreshing')
  ctx.$store.commit('funcStatus', {
    isLoading: true,
    isLoadingFTC: true,
    isCorrect: true,
    errorMsg: null
  })
  // Capital X goes to x
  fun = fun.split('').map(char => {
    if (char === 'X') {
      return 'x'
    }
    return char
  }).join('')

  // validate the input - ensure that the function
  try {
    validateInputForm({
      function: fun,
      dl: domainLeft,
      dr: domainRight,
      rb: rangeBottom,
      rt: rangeTop,
      showD: isDerivativeChecked,
      showDD: isSecondDerivativeChecked,
      autoScaleMaxMin,
      showFTC,
      grain
    })
  } catch (err) {
    console.error(err)
    ctx.$store.commit('funcStatus', {
      isLoading: false,
      isLoadingFTC: false,
      isCorrect: false,
      errorMsg: '' + err
    })
    return 0
  }

  // is valid by trying it and if it fails, return
  try {
    let testreturn = evaluate(fun, domainLeft)
    if (isNaN(testreturn)) {
      return 0
    }
  } catch (er) {
    ctx.$store.commit('funcStatus', {
      isLoading: false,
      isLoadingFTC: false,
      isCorrect: false,
      errorMsg: 'failed to render.'
    })
    return 0
  }
  ctx.$store.commit('boundStatus', true)
  console.log('setting  functino staus')
  ctx.$store.commit('funcStatus', {
    isLoading: true,
    isCorrect: true
  })

  // if the domains aren't right, stop
  if (domainLeft >= domainRight) {
    return
  }

  // get the basic information about the graph.
  let graph = getGraphState(ctx, fun, domainLeft, domainRight, rangeBottom, rangeTop, isDerivativeChecked, isSecondDerivativeChecked, autoScaleMaxMin, showFTC, grain)

  // I - III ----- originalPoints = getPoints(function)
  let { originalPoints, dPoints, sDPoints } = getPoints(' ' + fun, graph, 'f')

  // IV ---- set bounds
  // get maximum y value.
  var consideredPointsList = []
  consideredPointsList.push(originalPoints)
  if (isDerivativeChecked) {
    consideredPointsList.push(dPoints)
  }
  if (isSecondDerivativeChecked) {
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
  if (autoScaleMaxMin) {
    // get the basic information about the graph.
    graph = getGraphState(ctx, fun, domainLeft, domainRight, globalMinY, globalMaxY, isDerivativeChecked, isSecondDerivativeChecked, autoScaleMaxMin, showFTC, grain)
  }

  // V ----- render the graph axis and numbers.
  graphSetup(graph)

  // V ----- render originalPoints
  let scaledOpoints = scalePointSet(originalPoints, graph)
  graphPointSetNormalPoints(graph, scaledOpoints, 'f')
  graphPointSetSpecialPoints(graph, scaledOpoints, 'f')

  // VI ---- render derivaive points
  if (isDerivativeChecked) {
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphPointSetNormalPoints(graph, scaledDpoints, 'fp')
    graphPointSetSpecialPoints(graph, scaledDpoints, 'fp')
  }

  // VII --- render second derivative Points
  if (isSecondDerivativeChecked) {
    let scaledSDpoints = scalePointSet(sDPoints, graph)
    graphPointSetNormalPoints(graph, scaledSDpoints, 'fpp')
    graphPointSetSpecialPoints(graph, scaledSDpoints, 'fpp')
  }

  // add the special points to the store
  ctx.$store.commit('resetCoolPoints')
  commitSpecialPointSet(graph, originalPoints)
  commitSpecialPointSet(graph, dPoints)
  commitSpecialPointSet(graph, sDPoints)

  // say the function is done
  ctx.$store.commit('funcStatus', {
    isLoading: false,
    isLoadingFTC: true,
    isCorrect: true,
    errorMsg: null
  })

  // show the FTC if required.
  // only show the correct region
  if (showFTC) {
    dPoints.pts = dPoints.pts.filter(point => {
      return point.mx > graph.dl &&
        point.mx < graph.dr
    })
    let scaledDpoints = scalePointSet(dPoints, graph)
    graphAreaUnderPoints(graph, scaledDpoints, 'fp')

    // evaluate simpson's rule
    graph.ctx.$store.commit('setApproximation', {
      value: simpsonsRuleN(graph, 3000, (x) => {
        return derive(fun, x, 0.0001)
      }),
      name: 'Rieman Sum'
    })
  }

  ctx.$store.commit('funcStatus', {
    isLoading: false,
    isLoadingFTC: false,
    isCorrect: true,
    errorMsg: null
  })
}
