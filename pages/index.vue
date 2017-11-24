<template>
  <section class="container hype">
    <b-container>
      <div>
        </br>
         <b-input-group>
          <!-- Add-ons -->
          <b-input-group-addon>
            f(x)=
          </b-input-group-addon

          <!-- Main form input -->
          <b-form-input v-model="$store.state.funInput" type="text"></b-form-input>
          
          <!-- Attach Right button Group via slot -->
          <b-input-group-button slot="right">
            <nuxt-link to="/calc">
              <b-btn variant="info" right>Graph!</b-btn>
            </nuxt-link>
          </b-input-group-button>
          </b-input-group>
      </div>
    </b-container>
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'

export default {
  layout (ctx) {
    return 'default'
  },
  components: {
    Logo
  }
}
</script>

<style>
.title {
  font-family: "Quicksand", "Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; /* 1 */
}
</style>
