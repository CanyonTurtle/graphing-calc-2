<template>
  <div class="graph"> 
    <div class="graph-area" ref="graphArea" v-bind:style="{ height: graphDynamicHeight + 'px' }">
    </div>
  </div>
</template>

<script>
import graphFunc from '~/assets/calc/main.js'

export default {
  name: 'graph',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      delayDomainRight: 100,
      delayDomainLeft: -100,
      pidLeft: null,
      pidRight: null,
      graphDynamicHeight: 800,
      points: [
      //   {
      //     x: 0,
      //     y: 0,
      //     scaledX: 10,
      //     scaledY: 10,
      //     name: 'endpoint'
      //   }
      ]
    }
  },
  computed: {
    isDomainValid () {
      return (this.delayDomainLeft < this.delayDomainRight)
    },
    refreshGraph () {
      return this.$store.state.needsRefreshedGraph
    }
  },
  methods: {
    triggerFunction () {
      alert('hi')
    },
    setupGraph () {
      if (this.$refs.graphArea) {
        try {
          this.graphDynamicHeight = this.$refs.graphArea.getBoundingClientRect().width
        } catch (e) {
          console.log(e)
        }
        // console.log(this.$refs.graphArea.getBoundingClientRect().width)
      } else {
        // console.log('ref DNE.')
      }
      if (this.isDomainValid) {
        this.points = this.$store.state.coolPoints

        // use instant domain change.
        // let ld = this.$store.state.domainLeft
        // let rd = this.$store.state.domainRight
        // let br = this.$store.state.rangeBottom
        // let tr = this.$store.state.rangeTop
        let ipf = this.$store.state.inputForm
        console.log('REFRESHING')
        graphFunc(ipf.function, parseFloat(ipf.dl), parseFloat(ipf.dr), parseFloat(ipf.rb), parseFloat(ipf.rt), ipf.showD, ipf.showDD, ipf.autoScaleMaxMin, ipf.showFTC, this.$store.state.grain, this)
      } else {
        this.$store.commit('boundStatus', false)
      }
    }
  },
  mounted: function () {
    this.setupGraph()
    window.addEventListener('resize', this.setupGraph)
    setInterval(() => {
      if (this.$store.state.needsRefreshedGraph) {
        this.setupGraph()
      }
    }, 300)
  }
}
</script>

<style scoped>
.graph-area {
  /* background-color: #00ffff; */
  position: relative;
  max-height: 600px;
}
</style>