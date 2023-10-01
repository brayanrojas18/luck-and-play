<template>
  <q-page class="column">
    <WinningParticipants />
    <Buy />
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import Buy from "components/Desktop/Buy.vue";
import WinningParticipants from "components/Desktop/WinningParticipants.vue";

export default defineComponent({
  name: "PageIndex",

  components: {
    Buy,
    WinningParticipants,
  },
});
</script>

<style></style>
