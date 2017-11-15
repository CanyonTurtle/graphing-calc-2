import Vuex from 'vuex'
import Themes from '~/themes'

var isNum = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}
// eslint-disable-next-line

const createStore = () => {
  return new Vuex.Store({
    state: {
      hi: 1,
      domainLeft: -1,
      domainRight: 1,
      rangeBottom: -10,
      rangeTop: 10,
      isDerivativeChecked: true,
      isSecondDerivativeChecked: true,
      needsRefreshedGraph: false,
      isDomainLeftZoomed: true,
      isDomainRightZoomed: true,
      funInput: 'sin(e^x)',
      coolPoints: [
        // { name: 'absolute max', x: 10, y: 10, scaledx: 0, scaledY: 0 }
      ],
      autoScaleYMaxMin: true,
      currentTheme: Themes.new
    },
    mutations: {
      increment (state) {
        state.hi++
      },
      setDomainLeft (state, dl) {
        if (dl === '' || dl == null) {
          dl = 0
        } else if (dl === '-') {
          dl = 0
        } else if (!isNum(dl)) {
          dl = 0
        }
        state.needsRefreshedGraph = true
        state.isDomainLeftZoomed = false
        state.domainLeft = Math.max(dl, -1000000)
        // console.log('domainLeft set to ' + state.domainLeft)
      },
      setRangeBottom (state, dl) {
        if (dl === '' || dl == null) {
          dl = 0
        } else if (dl === '-') {
          dl = 0
        } else if (!isNum(dl)) {
          dl = 0
        }
        state.needsRefreshedGraph = true
        state.isDomainLeftZoomed = false
        state.rangeBottom = Math.max(dl, -1000000)
        // console.log('domainLeft set to ' + state.domainLeft)
      },
      setRangeTop (state, dr) {
        if (dr === '' || dr == null) {
          dr = 0
        } else if (dr === '-') {
          dr = 0
        } else if (!isNum(dr)) {
          dr = 0
        }

        state.rangeTop = Math.min(dr, 1000000)
        state.isDomainRightZoomed = false
        state.needsRefreshedGraph = true
      },
      setDomainRight (state, dr) {
        if (dr === '' || dr == null) {
          dr = 0
        } else if (dr === '-') {
          dr = 0
        } else if (!isNum(dr)) {
          dr = 0
        }

        state.domainRight = Math.min(dr, 1000000)
        state.isDomainRightZoomed = false
        state.needsRefreshedGraph = true
      },
      toggleIsDerivativeChecked (state, val) {
        state.isDerivativeChecked = val
        state.needsRefreshedGraph = true
      },
      toggleIsSecondDerivativeChecked (state, val) {
        state.isSecondDerivativeChecked = val
        state.needsRefreshedGraph = true
      },
      refreshedGraph (state) {
        state.needsRefreshedGraph = false
      },
      domainLeftIsZoomed (state) {
        state.isDomainLeftZoomed = true
      },
      domainRightIsZoomed (state) {
        state.isDomainRightZoomed = true
      },
      setCoolPoints (state, coolP) {
        state.coolPoints = coolP
      },
      addCoolPoint (state, coolPt) {
        state.coolPoints.push(coolPt)
      },
      resetCoolPoints (state) {
        state.coolPoints = []
      },
      setFunction (state, fun) {
        state.needsRefreshedGraph = true
        // console.log('fun set.')
        state.funInput = fun
      },
      needRefresh (state) {
        state.needsRefreshedGraph = true
      },
      toggleAutoScaleYMaxMin (state, mode) {
        state.autoScaleYMaxMin = mode
        state.needsRefreshedGraph = true
      },
      setTheme (state, newTheme) {
        state.currentTheme = Themes[newTheme]
        state.needsRefreshedGraph = true
      }
    }
  })
}

export default createStore
