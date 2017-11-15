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
            let coolPoints = ctx.$store.state.coolPoints
            // console.log(coolPoints)
            for (let i in coolPoints) {
              table.push({
                x: ('' + coolPoints[i].x).substring(0, 4),
                y: ('' + coolPoints[i].y).substring(0, 4),
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

