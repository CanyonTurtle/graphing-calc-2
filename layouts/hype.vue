<template>
  <div id="app" :style="{color: textCol}">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
      <h3 class="title" :style="{ color: titleCol }">GRAPHING CALC!</h3>
      <p class="dividerboi">
        <nuxt-link class="linkboi" to="/calc">try</nuxt-link>
        <nuxt-link class="linkboi" to="/docs">learn</nuxt-link>
        <nuxt-link class="linkboi" to="/credits">credits</nuxt-link>
      </p>
    <div>
      <transition name="fade">
        <nuxt/>
      </transition>
    </div>
  </div>
</template>

<script>

export default {
  name: 'app',
  data () {
    return {
    }
  },
  computed: {
    bgCol () {
      return this.$store.state.currentTheme.backgroundColor
    },
    textCol () {
      return this.$store.state.currentTheme.textColor
    },
    topBarCol () {
      return this.$store.state.currentTheme.topBarColor
    },
    titleCol () {
      return this.$store.state.currentTheme.titleColor
    }
  }
}
</script>

<style>
#app {
  /* font-family: 'Avenir', Helvetica, Arial, sans-serif; */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 0px;
}

.top {
  padding: 10px;
  color: #000000;
}

.dividerboi {
  border-bottom: 0.07rem solid;
  color: #ffffff;
  margin-bottom: 0px;
  margin-top: 0px;
  text-align: center;
}

.linkboi {
  color: #ffffff;
  margin-left: 10px;
  margin-right: 10px;
  text-decoration: none;
}

h3 {
  font-weight: bold;
  padding-bottom: 5px;
  text-align: center;
  margin-bottom: 0px;
  padding-top: 5px;
}
#app {
  display: block;
  background-image: linear-gradient(135deg, #5EFCE8 0%, #736EFE 100%);
  height: 1400px;
}
.fade-enter-active, .fade-leave-active {
  transition-property: opacity;
  transition-duration: .25s;
}

.fade-enter-active {
  transition-delay: .25s;
}

.fade-enter, .fade-leave-active {
  opacity: 0
}
.title {
  padding-top: 20px;
}
</style>
