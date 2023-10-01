<template>
  <!-- MOBILE -->
  <Mobile v-if="$q.platform.is.mobile" />

  <!-- DESKTOP -->
  <Desktop v-if="$q.platform.is.desktop" />
</template>

<script>
import { defineComponent, watch, ref } from "vue";
import Mobile from "layouts/Mobile/SingIn.vue";
import Desktop from "layouts/Desktop/SingIn.vue";

export default defineComponent({
  name: "SingIn",

  components: {
    Mobile,
    Desktop,
  },
});
</script>
