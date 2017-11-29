<template>
  <div class="params">
    <b-card>
      <h5>FUNCTION</h5>
      <b-input-group left="f(x)=">
        <b-form-input v-model="funInput" placeholder="50 * sin(0.1 * x)"></b-form-input>
      </b-input-group>

      <transition name="fade">
        <p v-show="!isFunctionCorrect && !waitingForFuncFinish" :style="{color: '#ff0000'}">Something is wrong with the function.</p>
      </transition>
      <transition name="fade">
        <p v-show="waitingForFuncFinish" :style="{color: '#000000'}">loading...</p>
      </transition>

      <h5 :style="{marginTop: '8px'}">DOMAIN</h5>
      <b-row no-gutters>
        <b-col>
          <b-input-group left="x in [">
            <b-form-input v-model="domainInputLeft"></b-form-input>
          </b-input-group>
        </b-col>
        <b-col>
          <b-input-group left="," right="]">
            <b-form-input v-model="domainInputRight"></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>
      <h5 :style="{marginTop: '8px'}" v-show="!isSYChecked">Y-BOUNDS</h5>
      <b-row no-gutters v-show="!isSYChecked">
        <b-col>
          <b-input-group left="y min:">
            <b-form-input v-model="rangeInputBottom"></b-form-input>
          </b-input-group>
        </b-col>
        <b-col>
          <b-input-group left="y max:">
            <b-form-input v-model="rangeInputTop"></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row no-gutters v-show="$store.state.isGrainCustomInput">
        <b-col>
          <b-input-group left="x-step:">
            <b-form-input v-model="grain"></b-form-input>
          </b-input-group>
        </b-col>
      </b-row>

      <transition name="fade">
        <p v-show="!$store.state.isBoundsCorrect" :style="{color: '#ff0000'}">Something is wrong with the bounds.</p>
      </transition>

      </br>
      <b-form-checkbox id="radio1" v-model="isDChecked" @change="toggleDerivativeChecked" :style="{ color: $store.state.currentTheme.functionTwo }">1st derivative</b-form-checkbox>
      <b-form-checkbox id="radio2" @change="toggleSecondDerivativeChecked" v-model="isDDChecked" :style="{ color: $store.state.currentTheme.functionThree }">2nd derivative</b-form-checkbox>
      <b-form-checkbox id="radio3" @change="toggleAutoScaleYMaxMin" v-model="isSYChecked">Auto-scale x / y bounds</b-form-checkbox>
      <b-form-checkbox id="radio4" @change="toggleShowFTC" v-model="showFTC">Show 1st FTC</b-form-checkbox>
      <!-- <b-form-checkbox id="radio4" @change="toggleGrainInput" v-model="isGrainInputChecked">Input a custom x-step size</b-form-checkbox> -->
      <b-card v-show="showFTC">
        <h5 v-show="showFTC" :style="{marginTop: '8px'}">FTC Bounds</h5>
          <p v-show="waitingForFuncFinish" class="nopadding">loading FTC info...</p>
        <div v-show="showFTC && !waitingForFuncFinish">
          <p class="nopadding">F(x) = {{funInput}}</p>
          <p class="nopadding">f(x) = F'(x) in red on graph</p>
          <p class="nopadding">if f(x) is continuous on the closed interval [{{domainInputRight}}, {{domainInputLeft}}], then</p>
          <p class="nopadding">By 1st FTC, F({{domainInputRight}}) - F({{domainInputLeft}}) = definate integral of f(x) from {{domainInputLeft}} to {{domainInputRight}}</p>
          <p class="nopadding"> ~= {{parseFloat(topVal).toFixed(3)}} - {{parseFloat(bottomVal).toFixed(3)}}</p>
          <p class="nopadding"> = {{parseFloat(topVal - bottomVal).toFixed(3)}}</p>
        </div>
      </b-card>
    </b-card>
  </div>
</template>

<script>
  export default {
    name: 'params',
    data () {
      return {
        showFTC: false,
        waitingForFuncFinish: false,
        isFunctionCorrect: true,
        graphingFunction: '',
        isDerivativeChecked: false,
        isSecondDerivativeChecked: false,
        isGrainInputChecked: false,
        secret: 'S3CR3T',
        isDChecked: true,
        isDDChecked: true,
        isSYChecked: true,
        possibleGraphPID: null,
        formTimer: 0
        // funInput: '10 * sin(x)'
        // funInput: 'x'
      }
    },
    computed: {
      funInput: {
        get () {
          return this.$store.state.funInput
        },
        set (val) {
          this.possiblyGraphFunc()
          this.$store.commit('setFunction', val)
        }
      },
      isFunctionNotCorrect: {
        get () {
          return !this.$store.state.isFunctionCorrect
        },
        set (val) {
          this.isFunctionCorrect = val
        }
      },
      domainFTCInputLeft: {
        get () {
          return this.$store.state.domainFTCLeft
        },
        set (value) {
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomainFTC', { which: 'left', value })
            this.possiblyGraphFunc()
          }
        }
      },
      domainFTCInputRight: {
        get () {
          return this.$store.state.domainFTCRight
        },
        set (value) {
          // console.log(value)
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomainFTC', { which: 'right', value })
            this.possiblyGraphFunc()
          }
        }
      },
      domainInputLeft: {
        get () {
          return this.$store.state.domainLeft
        },
        set (value) {
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomain', { which: 'left', value })
            this.possiblyGraphFunc()
          }
        }
      },
      domainInputRight: {
        get () {
          return this.$store.state.domainRight
        },
        set (value) {
          // console.log(value)
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomain', { which: 'right', value })
            this.possiblyGraphFunc()
          }
        }
      },
      rangeInputBottom: {
        get () {
          return this.$store.state.rangeBottom
        },
        set (value) {
          // console.log(value)
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomain', { which: 'bottom', value })
          }
        }
      },
      rangeInputTop: {
        get () {
          return this.$store.state.rangeTop
        },
        set (value) {
          // console.log(value)
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomain', { which: 'top', value })
          }
        }
      },
      grain: {
        get () {
          return this.$store.state.grain
        },
        set (value) {
          this.$store.commit('setGrain', value)
        }
      },
      bottomVal () {
        let point = this.$store.state.coolPoints.filter(point => {
          return point.name === 'X Lower Bound'
        })[0]
        if (point) {
          return point.y
        }
        return 0
      },
      topVal () {
        let point = this.$store.state.coolPoints.filter(point => {
          return point.name === 'X Upper Bound'
        })[0]
        if (point) {
          return point.y
        }
        return 0
      }

    },
    methods: {
      possiblyGraphFunc () {
        // graph the function, if attempt fails then update ui soon.
        if (this.possibleGraphPID) {
          clearInterval(this.possibleGraphPID)
        }
        this.waitingForFuncFinish = true
        setTimeout(() => {
          this.waitingForFuncFinish = false
          this.graphFunc()
          if (this.$store.state.isFunctionCorrect) {
            this.isFunctionCorrect = true
          }
          this.formTimer = 0
          this.possibleGraphPID = setInterval(() => {
            this.formTimer += 10
            if (this.formTimer > 500) {
              this.isFunctionCorrect = this.$store.state.isFunctionCorrect
              clearInterval(this.possibleGraphPID)
            }
          }, 10)
        }, 700)
      },
      graphFunc () {
        this.$store.commit('needsRefresh')
      },
      toggleShowFTC () {
        setTimeout(() => {
          this.$store.commit('toggleShowFTC', this.showFTC)
          this.possiblyGraphFunc()
        }, 10)
      },
      toggleDerivativeChecked () {
        setTimeout(() => {
          this.$store.commit('toggleIsDerivativeChecked', this.isDChecked)
          this.possiblyGraphFunc()
        }, 10)
      },
      toggleSecondDerivativeChecked () {
        setTimeout(() => {
          this.$store.commit('toggleIsSecondDerivativeChecked', this.isDDChecked)
          this.possiblyGraphFunc()
        }, 10)
      },
      toggleAutoScaleYMaxMin () {
        setTimeout(() => {
          this.$store.commit('toggleAutoScaleYMaxMin', this.isSYChecked)
          this.possiblyGraphFunc()
        }, 10)
      },
      toggleGrainInput () {
        setTimeout(() => { this.$store.commit('toggleGrainInput', this.isGrainInputChecked) }, 10)
      },
      graphHi () {
        this.$store.commit('increment')
      },
      onSubmit (evt) {
        evt.preventDefault()
      },
      resetForm () {
        this.form = {
          graphingFunction: '',
          isDerivativeChecked: false,
          isSecondDerivativeChecked: false,
          secret: 'S3CR3T'
        }
      },
      colorText () {
        this.$d3.selectAll('.params').style('color', '#17ab28')
      }
    }
  }
</script>
<style scoped>
.params {
  /* border-top: 1px solid #dddddd;
  border-bottom: 1px solid #dddddd;
  padding: 10px 0px 10px 0px; */
}

.setup-thing {
}

#radio1 {
  background-color: #000000;
  color: #000000;
}

.nopadding {
  margin: 0px;
  text-align: left;
}
</style>
