<template>
  <div class="hello">
    <b-container class="bv-example-row">
      <b-row>
        <b-col class="upper-col" md="6">
          <graph></graph>
        </b-col>
        <b-col class="upper-col" md="6">
          <params></params>
          <point-table></point-table>
        </b-col>
      </b-row>
      </br>
    </b-container>
  </div>
</template>

<script>
import Graph from '~/components/Graph.vue'
import Params from '~/components/Params.vue'
import PointTable from '~/components/PointTable.vue'

export default {
  name: 'hello',
  layout (ctx) {
    return 'default'
  },
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components: {
    Graph,
    Params,
    PointTable
  },
  computed: {
    topBarCol () {
      return this.$store.state.currentTheme.topBarColor
    },
    titleCol () {
      return this.$store.state.currentTheme.titleColor
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

h3 {
  font-weight: bold;
  padding-bottom: 5px;
  border-bottom: 0.07rem solid;
  text-align: center;
  margin-bottom: 0px;
  padding-top: 5px;
}
ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.upper-col {
  margin-top: 20px;
}

.bv-example-row {
  /* background-color: #ff00ff; */
}

.top {
  background-color: #39CCCC;
  padding: 10px;
  color: #000000;
  background-image: linear-gradient(135deg, #5EFCE8 0%, #736EFE 100%)
}

</style>
