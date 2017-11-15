<template>
  <div>
    <b-input-group left="input value: ">
      <b-form-input v-model="input" placeholder="3 ^ x"></b-form-input>
    </b-input-group>
    <b-button primary v-on:click="testTokenizer">
      input  compute.
    </b-button>
    <b-card class="text-center">
      {{ outputTokenize }} <br>
      {{ outputParse }}
    </b-card> 
  </div>
</template>
<script>
import { buildASTFromTokenList } from '../calc/parser.js'
import Tokenize from '../calc/tokenizer.js'

export default {
  data () {
    return {
      outputTokenize: 'output tokenize text',
      outputParse: 'output parse text',
      input: '3 ^ x'
    }
  },
  methods: {
    testTokenizer: function () {
      console.log('running the test.')
      try {
        this.outputTokenize = JSON.stringify(Tokenize(this.input))
      } catch (e) {
        this.outputTokenize = 'eror.'
      }
      try {
        this.outputParse = buildASTFromTokenList(0, Tokenize(this.input))
      } catch (e) {
        this.outputParse = 'error: ' + e
      }
    }
  }
}
</script>

<style scoped>

</style>

