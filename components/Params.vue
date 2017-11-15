<template>
  <div class="params">
    <b-card>
      <h5>FUNCTION</h5>
      <b-input-group left="f(x)=">
        <b-form-input v-model="funInput" placeholder="50 * sin(0.1 * x)" v-on:keyup.enter="graphFunc()"></b-form-input>
      </b-input-group>

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
      <h5 :style="{marginTop: '8px'}" v-show="!form.isSYChecked">Y-BOUNDS</h5>
      <b-row no-gutters v-show="!form.isSYChecked">
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

      </br>
      <b-form-checkbox id="radio1" @change="toggleDerivativeChecked" v-model="form.isDChecked" :style="{ color: $store.state.currentTheme.functionTwo }">1st derivative</b-form-checkbox>
      <b-form-checkbox id="radio2" @change="toggleSecondDerivativeChecked" v-model="form.isDDChecked" :style="{ color: $store.state.currentTheme.functionThree }">2nd derivative</b-form-checkbox>
      <b-form-checkbox id="radio3" @change="toggleAutoScaleYMaxMin" v-model="form.isSYChecked">Auto-scale x / y bounds</b-form-checkbox>
    </b-card>
  </div>
</template>

<script>
  export default {
    name: 'params',
    data () {
      return {
        form: {
          graphingFunction: '',
          isDerivativeChecked: false,
          isSecondDerivativeChecked: false,
          secret: 'S3CR3T',
          rangeInputBottom: 0,
          rangeInputTop: 0,
          domainInputLeft: 0,
          domainInputRight: 0,
          isDChecked: true,
          isDDChecked: true,
          isSYChecked: true
          // funInput: '10 * sin(x)'
        }
        // funInput: 'x'
      }
    },
    computed: {
      funInput: {
        get () {
          return this.$store.state.funInput
        },
        set (val) {
          this.$store.commit('setFunction', val)
        }
      },
      domainInputLeft: {
        get () {
          return this.$store.state.domainLeft
        },
        set (value) {
          // console.log(value)
          if (value !== '' && value !== '-') {
            this.$store.commit('setDomainLeft', value)
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
            this.$store.commit('setDomainRight', value)
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
            this.$store.commit('setRangeBottom', value)
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
            this.$store.commit('setRangeTop', value)
          }
        }
      }
    },
    methods: {
      graphFunc () {
        this.$store.commit('needsRefresh')
      },
      toggleDerivativeChecked () {
        this.$store.commit('toggleIsDerivativeChecked', this.form.isDChecked)
      },
      toggleSecondDerivativeChecked () {
        this.$store.commit('toggleIsSecondDerivativeChecked', this.form.isDDChecked)
      },
      toggleAutoScaleYMaxMin () {
        this.$store.commit('toggleAutoScaleYMaxMin', this.form.isSYChecked)
      },
      graphHi () {
        this.$store.commit('increment')
      },
      onSubmit (evt) {
        evt.preventDefault()
        alert(JSON.stringify(this.form))
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
</style>
