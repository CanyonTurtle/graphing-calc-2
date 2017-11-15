<template>
  <div>
    <b-container>
      <h3 class="docheader">DOCUMENTATION</h3>
      <b-tabs class="tabzz" justified>
        <b-tab title="Intro" active>
          <h4 class="contentheader">What is this?</h4>
          <p>
            My goal with this graphing calculator is to provide a
            cool-looking, useful graphing calculator that is accessable
            to anyone.
            <br>
            To achieve my goal, I decided to make my
            graphing calculator as a web application,
            which allows several benefits as a whole:
            <li> Use of technologies I am familiar with (Vue, JavaScript)</li>
            <li> Easy prototyping with a development server </li>
            <li> Ecosystem benefits of NPM for finding graphing libraries, etc...</li>
            <li> Multi-platform (just a website).</li>
            <br>
            So I decided to go for it!
          </p>
        </b-tab>
        <b-tab title="Planning" >
          <h4 class="contentheader">Making the Plan</h4>
          <p>
            <br>
            Before I started, I wanted to have a plan
            for the graphing algorithms, presentation,
            and user interface design. From previous 
            experience, I knew that planning these things
            beforehand could save alot of pain later on.
          </p>
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


