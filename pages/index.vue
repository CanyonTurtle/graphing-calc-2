<template>
  <section class="container hype">
    <b-container>
      <div>
        <!-- Attach Right button Group via slot -->
        <nuxt-link to="/calc">
          <b-btn variant="info" right>Graph!</b-btn>
        </nuxt-link>
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
