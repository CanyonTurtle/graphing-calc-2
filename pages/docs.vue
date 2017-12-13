<template>
  <div>
    <b-container>
      <h3 class="docheader">DOCUMENTATION</h3>
      <p>Read this source code on <a href='https://github.com/CanyonTurtle/graphing-calc-2'>GitHub.com</a></p>
      <b-tabs class="tabzz" justified>
        <b-tab title="Intro" active>
          <h4 class="contentheader">What is this?</h4>
          <p>
            The purpose of this graphing calculator is to provide a
            intuitive graphing calculator that is accessable
            to everyone.
          </p>
          <h5 class="contentheader">Features</h5>
          <ul>
            <li>Graph a function in terms of x</li>
            <li>Derivative and 2nd Derivative</li>
            <li>Approximate features of graph (zeros, extrema, inflection points)</li>
            <li>A special mode to handle rational functions</li>
            <li>Display the 1st FTC on a derivative graph, with an approximation function to verify the 1st FTC</li>
          </ul>
          <h4 class="contentheader">Making The Plan</h4>
          <p>
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
          </p>
          <ul>
            <li> Use of the familiar <a href="https://vuejs.org">Vue.js</a> framework.</li>
            <li> Easy prototyping with a development server </li>
            <li> Ecosystem benefits of NPM for finding graphing libraries, etc...</li>
            <li> Multi-platform (just a website).</li>
          </ul>
          <br>
          <h4 class="contentheader">Choosing The Technology Stack</h4>
          <p>
            For scaffolding the frontend, <a href="https://nuxtjs.org">nuxt.js</a> was chosen because 
            it allows static site generation along with integrating the
            <a href="https://vuejs.org">Vue.js</a> frontend framework.
          </p>
          <p> The data graphing library, <a href="">Vue-d3</a>, was chosen after the main technologies were picked.</p>

          <h4 class="contentheader">User Experience</h4>
          <br>
          <p>
            This application was designed to be:
          </p>
          <ul>
            <li>Responsive to user interation</li>
            <li>Adaptive to differing screen sizes</li>
          </ul>
          <p>
             In order to achieve responsive screen size, <a href='https://boostrap-vue.js.org'>Bootstrap Vue</a>
            was used as a style framework. this allowed for fast construction of UI components that adjust the layout according to screen size.
          </p>
          <p>
            the responsiveness, as far as re-rendering the graph when user input is changed, follows like this:
          </p>
          <ul>
            <li>Input is changed in one of the fields (function, domain, etc...)</li>
            <li>An event is emmited to the <a href='store link'>store</a> which signals that the input changed</li>
            <li>The store handles the input change, and makes sure the input is valid (proper domain, is a number, etc...)</li>
            <li>If the input is valid, the graph is signaled to be re-rendered and all input errors are cleared. If not, an error message is toggled for the user.</li>
          </ul>
          <br>
        </b-tab>
        <b-tab title="Algorithms">
          <h4 class="contentheader">Algorithms</h4>
          <p>These algorithms capture the essence of the actual logic in use. Read all of the logic here on <a href="https://github.com/CanyonTurtle/graphing-calc-2/tree/master/assets/calc">Github!</a></p>
          <h5>Integration</h5>
          <p>The integration process is done using Simpson's Nth rule.</p>
          <img class="imgwidth" src="~/assets/img/integration.png" alt="image not found.">
          <h5>Derivation</h5>
          <p>This is a simple difference-quotient, or, rise / run formula.</p>
          <img class="imgwidth" src="~/assets/img/derivation.png" alt="image not found.">
          <h5>FTC</h5>
          <p>This verifies the first FTC by using the integration formula and then evaluating the original function at the right and left endpoints.</p>
          <img class="imgwidth" src="~/assets/img/ftc.png" alt="image not found.">
          <h5>Special Points: Zeroes, Inflection points, Extrema</h5>
          <p>This process will find the approximate x-values at places where y-values are 0. This is run where there are sign changes in the graph, with X left and X right corresponding to before and after the sign change.</p>
          <p>For scenarios where a function hits 0 but does not change signs, the derivative of the function is examined to make sure the point is not overlooked.</p>
          <img class="imgwidth" src="~/assets/img/point-finder.png" alt="image not found.">
        </b-tab>
        <b-tab title="Deployment">
          <h4 class="contentheader">Deployment</h4>
          <p>This project is hosted through <a href="https://www.netlify.com/">Netlify</a>, a service that hosts static websites.</p>
          <p>The project is compiled into static websites using the <a href="https://nuxtjs.org">nuxt.js</a> framework, and the deployed sites are hosted in the dist folder.</p>
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
.imgwidth {
  width: 100%;
}

h3 {
  color: #ff9f1c;
}
h4 {
  color: #e71d36;
}
h5 {
  color: #2ec4b6;
}
</style>


