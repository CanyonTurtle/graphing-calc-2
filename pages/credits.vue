<template>
<b-card>
  <div class="credits-block">
    <b-container>
      <h4>About This Project</h4>
      <p> Created by Cannon Tuttle for AP Calculus BC 2017-2018.</p>
        <b-row>
          <b-col>
            <p class="cred-header">Built With:</p>
              <a href="https://vuejs.org">Vue.js</a></br>
              <a href="https://bootstrap-vue.org">Vue Bootstrap</a></br>
              <a href="https://vue-d3.org">Vue d3</a>
            <br/>
            <!-- <b-dropdown class="bt" size="sm" variant="primary" id="ddown-divider" text="Select Theme">
              <div v-for="theme in themes" :key="theme">
                <b-dropdown-item-button @click="$store.commit('setTheme', theme)">{{ theme }}</b-dropdown-item-button>
              </div>
            </b-dropdown> -->
          </b-col>
          <b-col>
            <p class="cred-header">Learn More:</p>
            <router-link to="/docs">Code documentation</router-link>
          </b-col>
        </b-row>
    </b-container>
  </div>
  </b-card>
</template>

<script>
import Themes from '../themes'

export default {
  name: 'credits-modal',
  data () {
    return {
      themes: Object.keys(Themes)
    }
  },
  computed: {
    hiVal () {
      return this.$store.state.hi
    }
  },
  methods: {
    handleOk (e) {
      e.cancel()
    }
  }
}
</script>

<!-- modal.vue -->
<style scoped>
.credits-list {
  /* text-align: center; */
}
.cred-header {
  margin-bottom: 0px;
}
.bt {
  margin-bottom: 20px;
}
</style>
