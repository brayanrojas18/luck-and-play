<template>
  <q-page class="column">
    <q-tabs
      v-model="tab"
      class="text-white col-1"
      switch-indicator
      narrow-indicator
      active-color="white"
      style="background: linear-gradient(0.1turn, #3c0415, #300411)"
    >
      <q-tab name="buy" label="Buy" />
      <q-tab name="listing" label="Listing" />
    </q-tabs>
    <q-tab-panels
      v-model="tab"
      animated
      class="bg-transparent col"
      swipeable
      infinite
    >
      <q-tab-panel name="buy">
        <!-- RAFFLES -->
        <Buy />
      </q-tab-panel>

      <q-tab-panel name="listing" class="q-pa-none">
        <!-- WINNING & PARTICIPANTS -->
        <WinningParticipants />
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import Buy from "components/Mobile/Buy.vue";
import WinningParticipants from "components/Mobile/WinningParticipants.vue";

export default defineComponent({
  name: "PageIndex",

  components: {
    Buy,
    WinningParticipants,
  },

  setup() {
    return {
      tab: ref("buy"),
    };
  },
});
</script>

<style></style>
