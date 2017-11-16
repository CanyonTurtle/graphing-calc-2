<template>
  <div>
    <b-container>
      <h3 class="docheader">DOCUMENTATION</h3>
      <b-tabs class="tabzz" justified>
        <b-tab title="Intro" active>
          <h4 class="contentheader">What is this?</h4>
          <p>
            The purpose of this graphing calculator is to provide a
            intuitive graphing calculator that is accessable
            to everyone.
            <br>
          </p>
          <h4 class="contentheader">Features</h4>
          <li>Graph a function in terms of x</li>
          <li>Derivative and 2nd Derivative</li>
          <li>Approximate features of graph (zeros, extrema, inflection points)</li>
        </b-tab>
        <b-tab title="Planning" >
          <h4 class="contentheader">Making The Plan</h4>
          <p>
            <br>
            Before starting, the
            the graphing algorithms, presentation,
            and user interface design needed to be planned. From previous 
            experience, Planning these things
            beforehand could save alot of work later on.
          </p>
          <p>
            The
            graphing calculator was chosen to be a web application,
            which allows several benefits as a whole:
            <li> Use of familiar technologies</li>
            <li> Easy prototyping with a development server </li>
            <li> Ecosystem benefits of NPM for finding graphing libraries, etc...</li>
            <li> Multi-platform (just a website).</li>
            <br>
          </p>
          <h4 class="contentheader">Choosing The Technologies</h4>
          <p>
            For scaffolding the frontend, <a href="https://nuxtjs.org">nuxt.js</a> was chosen because 
            it allows static site generation along with integrating the
            <a href="https://vuejs.org">Vue.js</a> frontend framework.
          </p>
          <p> The data graphing library, <a href="">Vue-d3</a>, was chosen after the main technologies were picked.</p>

        </b-tab>
        <b-tab title="UX">
          <br>User experience tab!
        </b-tab>
        <b-tab title="Algorithms">
          <br>Algorithms tab!
        </b-tab>
        <b-tab title="Deployment">
          <br>Algorithms tab!
        </b-tab>
      </b-tabs>
    </b-container>
  </div>
</template>
<script>
export default {
  layout (ctx) {
    return 'default'
  },
  data () {
    return {

    }
  }
}
</script>
<style scoped>
.docheader {
  margin-top: 25px;
}
.contentheader {
  margin-top: 25px;
}
.tabzz {
  text-align: left;
}
</style>


