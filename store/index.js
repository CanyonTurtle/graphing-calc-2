import Vuex from 'vuex'
import Themes from '~/themes'

// eslint-disable-next-line

const createStore = () => {
  return new Vuex.Store({
    state: {
      approximation: {
        value: 0,
        name: 'Rieman'
      },
      showFTC: false,
      grain: 0.01,
      hi: 1,
      needsRefreshedGraph: false,
      coolPoints: [],
      currentTheme: Themes.new,
      inputForm: {
        dl: -10,
        dr: 10,
        rt: 10,
        rb: -10,
        function: 'sin(x) - 3',
        showD: true,
        showDD: true,
        showFTC: false,
        autoScaleMaxMin: true
      },
      functionStatus: {
        isLoading: true,
        isLoadingFTC: true,
        isCorrect: true,
        errorMsg: null
      },
      boundStatus: false
    },
    mutations: {
      setInputForm (state, payload) {
        state.inputForm = payload
      },
      refreshGraph (state) {
        state.needsRefreshedGraph = true
      },
      resetCoolPoints (state) {
        state.coolPoints = []
      },
      addCoolPoint (state, payload) {
        state.coolPoints.push(payload)
      },
      setApproximation (state, payload) {
        state.approximation = payload
      },
      boundStatus (state, payload) {
        state.boundStatus = payload
      },
      funcStatus (state, payload) {
        state.functionStatus = payload
        console.log(JSON.stringify(state.functionStatus))
      },
      graphRefreshing (state) {
        state.needsRefreshedGraph = false
      }
      // setDomain (state, { which, value: val }) {
      //   // validate
      //   val = '' + val
      //   let inputRegex = /^-?\d*\.{0,1}\d+$/
      //   if (inputRegex.test(val)) {
      //     // which is used as the bound.
      //     switch (which) {
      //       case 'left' : {
      //         if (val >= state.domainRight) {
      //           state.isBoundsCorrect = false
      //           return
      //         }
      //         state.domainLeft = Math.max(val, -100000)
      //         break
      //       }
      //       case 'right' : {
      //         if (val <= state.domainLeft) {
      //           state.isBoundsCorrect = false
      //           return
      //         }
      //         state.domainRight = Math.min(val, 100000)
      //         break
      //       }
      //       case 'top' : {
      //         if (val <= state.rangeBottom) {
      //           state.isBoundsCorrect = false
      //           return
      //         }
      //         state.rangeTop = Math.min(val, 100000)
      //         break
      //       }
      //       case 'bottom' : {
      //         if (val >= state.rangeBottom) {
      //           state.isBoundsCorrect = false
      //           return
      //         }
      //         state.rangeBottom = Math.max(val, -100000)
      //         break
      //       }
      //     }
      //     state.isBoundsCorrect = true
      //     state.isDomainLeftZoomed = false
      //   } else {
      //     state.isBoundsCorrect = false
      //   }
      // },
    }
  })
}

export default createStore
