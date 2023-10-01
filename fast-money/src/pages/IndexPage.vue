<template>
  <q-page>
    <!-- MOBILE -->
    <Mobile v-if="$q.platform.is.mobile" />

    <!-- DESKTOP -->
    <Desktop v-if="$q.platform.is.desktop" />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import Mobile from "pages/Mobile.vue";
import Desktop from "pages/Desktop.vue";

export default defineComponent({
  name: "PageIndex",

  components: {
    Mobile,
    Desktop,
  },
});
</script>

<style></style>
