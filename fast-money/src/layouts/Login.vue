<template>
  <!-- MOBILE -->
  <Mobile v-if="$q.platform.is.mobile" />

  <!-- DESKTOP -->
  <Desktop v-if="$q.platform.is.desktop" />
</template>

<script>
import { defineComponent, watch, ref } from "vue";
import Mobile from "layouts/Mobile/Login.vue";
import Desktop from "layouts/Desktop/Login.vue";

export default defineComponent({
  name: "Login",

  components: {
    Mobile,
    Desktop,
  },
});
</script>
