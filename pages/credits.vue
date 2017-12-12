<template>
<b-card>
  <div class="credits-block">
    <b-container>
      <h4>Credits</h4>
      <p> Created by Cannon Tuttle for AP Calculus BC 2017-2018.</p>
      <b-card title="Built with: ">
        <b-row>
          <b-col>
            <i>frontend</i></br>
            <a href="https://vuejs.org">Vue.js</a></br>
            <a href="https://bootstrap-vue.js.org">Vue Bootstrap</a></br>
            <a href="https://github.com/jaredreich/vue-d3">Vue d3</a></br>
            <a href="https://nuxtjs.org/">Nuxt.js</a></br>
            <br/>
            <!-- <b-dropdown class="bt" size="sm" variant="primary" id="ddown-divider" text="Select Theme">
              <div v-for="theme in themes" :key="theme">
                <b-dropdown-item-button @click="$store.commit('setTheme', theme)">{{ theme }}</b-dropdown-item-button>
              </div>
            </b-dropdown> -->
          </b-col>
          <b-col>
            <i>other</i></br>
            <a href="http://mathjs.org/">Math.js</a></br>
            <a href="https://www.netlify.com/">Netlify</a>
          </b-col>
        </b-row>
      </b-card>
      </br>
      <!-- Place this tag where you want the button to render. -->
      <router-link to="/docs">Learn about the project!</router-link>
    </b-container>
  </div>
  </b-card>
</template>

<script>
import Themes from '../themes'

export default {
  layout (ctx) {
    return 'default'
  },
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
.builtwith {
  margin-bottom: 0px;
  text-align: center;
}
.bt {
  margin-bottom: 20px;
}
</style>
