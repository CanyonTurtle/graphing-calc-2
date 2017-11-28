import Vuex from 'vuex'
import Themes from '~/themes'

var isNum = function (n) {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

// eslint-disable-next-line

const createStore = () => {
  return new Vuex.Store({
    state: {
      grain: 0.01,
      isGrainCustomInput: false,
      isBoundsCorrect: false,
      isFunctionCorrect: true,
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
      boundStatus (state, status) {
        state.isBoundsCorrect = status
      },
      funcStatus (state, status) {
        state.isFunctionCorrect = status
      },
      increment (state) {
        state.hi++
      },
      setDomain (state, { which, value: val }) {
        // validate
        val = '' + val
        let inputRegex = /^-?\d*\.{0,1}\d+$/
        if (inputRegex.test(val)) {
          // which is used as the bound.
          switch (which) {
            case 'left' : {
              if (val >= state.domainRight) {
                state.isBoundsCorrect = false
                return
              }
              state.domainLeft = Math.max(val, -100000)
              break
            }
            case 'right' : {
              if (val <= state.domainLeft) {
                state.isBoundsCorrect = false
                return
              }
              state.domainRight = Math.min(val, 100000)
              break
            }
            case 'top' : {
              if (val <= state.rangeBottom) {
                state.isBoundsCorrect = false
                return
              }
              state.rangeTop = Math.min(val, 100000)
              break
            }
            case 'bottom' : {
              if (val >= state.rangeBottom) {
                state.isBoundsCorrect = false
                return
              }
              state.rangeBottom = Math.max(val, -100000)
              break
            }
          }
          state.needsRefreshedGraph = true
          state.isBoundsCorrect = true
          state.isDomainLeftZoomed = false
        } else {
          state.isBoundsCorrect = false
        }
      },
      setDomainLeft (state, dl) {
        if (dl === '' || dl == null) {
          state.isBoundsCorrect = false
          dl = 0
        } else if (dl === '-') {
          dl = 0
        } else if (!isNum(dl)) {
          state.isBoundsCorrect = false
          dl = 0
        }
        state.needsRefreshedGraph = true
        state.isDomainLeftZoomed = false
        state.domainLeft = Math.max(dl, -1000000)
        // console.log('domainLeft set to ' + state.domainLeft)
      },
      setRangeBottom (state, dl) {
        if (dl === '' || dl == null) {
          state.isBoundsCorrect = false
          dl = 0
        } else if (dl === '-') {
          dl = 0
        } else if (!isNum(dl)) {
          state.isBoundsCorrect = false
          dl = 0
        }
        state.needsRefreshedGraph = true
        state.isDomainLeftZoomed = false
        state.rangeBottom = Math.max(dl, -1000000)

        // console.log('domainLeft set to ' + state.domainLeft)
      },
      setRangeTop (state, dr) {
        if (dr === '' || dr == null) {
          state.isBoundsCorrect = false
          dr = 0
        } else if (dr === '-') {
          dr = 0
        } else if (!isNum(dr)) {
          state.isBoundsCorrect = false
          dr = 0
        }

        state.rangeTop = Math.min(dr, 1000000)
        state.isDomainRightZoomed = false
        state.needsRefreshedGraph = true
      },
      setDomainRight (state, dr) {
        if (dr === '' || dr == null) {
          state.isBoundsCorrect = false
          dr = 0
        } else if (dr === '-') {
          dr = 0
        } else if (!isNum(dr)) {
          state.isBoundsCorrect = false
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
      toggleGrainInput (state, val) {
        state.isGrainCustomInput = val
      },
      setGrain (state, val) {
        let inputRegex = /^-?\d*\.{0,1}\d+$/
        if (inputRegex.test(val) && val > 0.001) {
          state.grain = val
          state.needsRefreshedGraph = true
        }
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
        // state.needsRefreshedGraph = true
        // console.log('fun set.')
        if (fun.length !== 0) {
          state.funInput = fun
        }
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
      },
      needsRefresh (state) {
        state.needsRefreshedGraph = true
      }
    }
  })
}

export default createStore
