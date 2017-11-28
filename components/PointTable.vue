<template>
<b-card :style="{marginTop: '25px'}">
  <div class="point-table">
    <h4>NOTABLE POINTS</h4>
    <!-- <div>
      <ul>
        <p class="listitem" v-for="point in coolPoints" :key="'' + point">
          {{ point.name }}{{point.name ? ': ' : ''}} {{ point.x }}, {{point.y}}
        </p>
      </ul>
    </div> -->
    <b-table striped hover :items="coolPoints"></b-table>
    <!-- {{ coolPoints }} -->
  </div>
  </b-card> 
</template>

<script>
  export default {
    name: 'point-table',
    data () {
      return {

      }
    },
    computed: {
      hiVal () {
        return this.$store.state.hi
      },
      coolPoints () {
        let ctx = this
        return (
          (function () {
            let table = []
            var coolPoints = ctx.$store.state.coolPoints
            coolPoints = coolPoints.map(point => {
              if (point.name === 'leftEndpoint') {
                point.name = 'X Lower Bound'
              }
              if (point.name === 'rightEndpoint') {
                point.name = 'X Upper Bound'
              }
              if (point.name === 'inflectionpt') {
                point.name = 'Inflection Point'
              }
              if (point.name === 'zero') {
                point.name = 'Zero'
              }
              if (point.name === 'min') {
                point.name = 'Relative Minimum'
              }
              if (point.name === 'max') {
                point.name = 'Relative Maximum'
              }
              return point
            })
            // console.log(coolPoints)
            for (let i in coolPoints) {
              table.push({
                // x: ('' + coolPoints[i].x).substring(0, 6 + ((coolPoints[i].x < 0) ? 1 : 0)),
                // y: ('' + coolPoints[i].y).substring(0, 6 + ((coolPoints[i].y < 0) ? 1 : 0)),
                x: '' + parseFloat(coolPoints[i].x).toFixed(3),
                y: '' + parseFloat(coolPoints[i].y).toFixed(3),
                // scaledX: coolPoints[i].scaledX,
                // scaledY: coolPoints[i].scaledY
                name: coolPoints[i].name
              })
            }
            return table
          })()
        )
      }
    },
    methods: {
      handleOk (e) {
        e.cancel()
      }
    }
  }
</script>

<style scoped>
h4 {
  text-align: center;
}
.point-table {
  text-align: left;
}
</style>

