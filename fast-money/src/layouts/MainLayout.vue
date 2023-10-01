<template>
  <!-- MOBILE -->
  <Mobile v-if="$q.platform.is.mobile" />

  <!-- DESKTOP -->
  <Desktop v-if="$q.platform.is.desktop" />
</template>

<script>
import { defineComponent, watch, ref } from "vue";
import Mobile from "layouts/Mobile/Mobile.vue";
import Desktop from "layouts/Desktop/Desktop.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    Mobile,
    Desktop,
  },
});
</script>
