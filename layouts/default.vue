<template>
  <div id="app" :style="{ backgroundColor: bgCol , color: textCol}">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <div class="top" :style="{ backgroundColor: topBarCol } ">
      <h3 class="title" :style="{ color: titleCol }">GRAPH YOUR FUNCTION</h3>
      <nuxt-link class="linkboi" to="/calc"><b-button :size="'sm'" :variant="'outline-primary'">try</b-button></nuxt-link>
      <nuxt-link class="linkboi" to="/docs"><b-button :size="'sm'" :variant="'outline-primary'">learn</b-button></nuxt-link>
      <nuxt-link class="linkboi" to="/credits"><b-button :size="'sm'" :variant="'outline-primary'">credits</b-button></nuxt-link>
    </div>
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
  background-color: #39CCCC;
  padding: 10px;
  color: #000000;
  background: #ff5f6d; /* fallback for old browsers */
  background: -webkit-linear-gradient(to right, #ff5f6d, #ffc371); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(to right, #ff5f6d, #ffc371); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
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
  background-image: none;
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
</style>
