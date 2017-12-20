<template>
  <div>
    <div>
      <!-- the function -->
      <div v-if="!justRenderedGraph">
        <b-card>
          <!-- functions that are default - not rational expressions -->
          <b-input-group v-if="!inputForm.rationalMode" id="exampleInputGroup1"
                        label="Function:"
                        left="f(x)=">
            <b-form-input id="exampleInput1"
                        type="text"
                        v-model="inputForm.function"
                        required
                        placeholder="enter function">
            </b-form-input>
          </b-input-group>

          <!-- rational expressions -->
          <b-input-group v-if="inputForm.rationalMode" id="exampleInputGroup1"
                        label="Function:"
                        left="p(x)=">
            <b-form-input id="exampleInput1"
                        type="text"
                        v-model="inputForm.rationalFunctionTop"
                        required
                        placeholder="enter function">
            </b-form-input>
          </b-input-group>
          <b-input-group v-if="inputForm.rationalMode" id="exampleInputGroup1"
                        label="Function:"
                        left="q(x)=">
            <b-form-input id="exampleInput1"
                        type="text"
                        v-model="inputForm.rationalFunctionBottom"
                        required
                        placeholder="enter function">
            </b-form-input>
          </b-input-group>

          <!-- boundary inputs -->
          <b-row no-gutters>
            <b-col>
              <b-input-group left="x in [">
                <b-form-input v-model="inputForm.dl"></b-form-input>
              </b-input-group>
            </b-col>
            <b-col>
              <b-input-group left=",">
                <b-form-input v-model="inputForm.dr"></b-form-input>
              </b-input-group>
            </b-col>
          </b-row>
          <b-row no-gutters v-show="!inputForm.autoScaleMaxMin">
            <b-col>
              <b-input-group left="y min:">
                <b-form-input v-model="inputForm.rb"></b-form-input>
              </b-input-group>
            </b-col>
            <b-col>
              <b-input-group left="y max:">
                <b-form-input v-model="inputForm.rt"></b-form-input>
              </b-input-group>
            </b-col>
          </b-row>

        <!-- checkboxes -->
          <b-form-group id="exampleGroup5">
            <b-form-checkbox v-model="inputForm.showD" id="exampleInput4">
              1st Derivative
            </b-form-checkbox>
            <b-form-checkbox v-model="inputForm.showDD" id="exampleInput5">
              2nd Derivative
            </b-form-checkbox>
            <b-form-checkbox id="radio3" v-model="inputForm.autoScaleMaxMin">Auto-scale x / y bounds</b-form-checkbox>
            <b-form-checkbox id="radio3" v-model="inputForm.showFTC">show FTC</b-form-checkbox>
            <b-form-checkbox id="radio4" v-model="inputForm.rationalMode">rational mode</b-form-checkbox>
          </b-form-group>
          <b-button type="button" @click="onSubmit" variant="outline-info">Graph!</b-button>
        </b-card>

        <div v-if="isLoading">
          <p>Loading...</p>
        </div>
      </div>
    </div>

    <!-- error messages for the user -->
    <p class="error-function" v-show="status.errorMsg !== null">{{status.errorMsg}}</p>

    <!-- the part that explains the FTC -->
    <b-card v-show="inputForm.showFTC && justRenderedGraph">
      <h5 :style="{marginTop: '8px'}">1st FTC</h5>
      <p v-show="isLoading" class="nopadding">loading FTC info...</p>
      <div v-show="inputForm.showFTC && !isLoadingFTC">
        <p class="nopadding">F(x) = {{inputForm.function}}</p>
        <p class="nopadding">f(x) = F'(x) in red on graph</p>
        <p class="nopadding"> let a = {{inputForm.dl}}</p>
        <p class="nopadding"> let b = {{inputForm.dr}}</p>
        <p class="nopadding">if f(x) is continuous on the closed interval [{{inputForm.dl}}, {{inputForm.dr}}], then by 1st FTC,</p>
        <div lang="latex">
          \\int_{a}^{b}f(x)dx = F(b) - F(a)
        </div>
        <b-row>
          <b-col xs="4">
            <p class="nopadding">Antiderivative Evaluation</p>
          </b-col>
          <b-col xs="8">
            <p class="nopadding"> ~= {{parseFloat(topVal).toFixed(3)}} - {{parseFloat(bottomVal).toFixed(3)}}</p>
            <p class="nopadding"> = {{parseFloat(topVal - bottomVal).toFixed(3)}}</p>
          </b-col>
        </b-row>
        <b-row>
          <b-col xs="4">
            <p class="nopadding">{{$store.state.approximation.name}} Approximation</p>
          </b-col>
          <b-col xs="8">
            <p class="nopadding">{{parseFloat($store.state.approximation.value).toFixed(3)}}</p>
          </b-col>
        </b-row>
      </div>
    </b-card>
    <b-card v-if="justRenderedGraph">
      <b-button type="button" @click="justRenderedGraph = false" variant="outline-info">Graph Again!</b-button>
    </b-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      justRenderedGraph: false
    }
  },
  methods: {
    onSubmit (evt) {
      evt.preventDefault()
      this.$store.commit('setInputForm', this.inputForm)
      this.$store.commit('funcStatus', {
        isLoading: true,
        isLoadingFTC: true,
        isCorrect: true,
        errorMsg: null
      })
      this.$store.commit('refreshGraph')
      this.justRenderedGraph = true
    },
    onReset (evt) {
      evt.preventDefault()
      this.show = false
      this.$nextTick(() => { this.show = true })
    }
  },
  computed: {
    inputForm: {
      get () {
        return this.$store.state.inputForm
      },
      set () {
        this.$store.commit('setInputForm', this.inputForm)
      }
    },
    status () {
      return this.$store.state.functionStatus
    },
    isLoading () {
      return this.$store.state.functionStatus.isLoading
    },
    isLoadingFTC () {
      return this.$store.state.functionStatus.isLoadingFTC
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
  }
}
</script>
<style scoped>
.error-function {
  color: #ff0000;
}  
.nopadding {
  padding: 2px;
  margin: 2px;
}
</style>