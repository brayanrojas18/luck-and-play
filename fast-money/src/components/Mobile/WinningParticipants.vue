<template>
  <div class="full-height">
    <q-tab-panels
      v-model="tab"
      animated
      class="text-white absolute-full boxWP-mobile q-pt-sm q-pb-xl"
    >
      <q-tab-panel name="participants">
        <div>
          <q-virtual-scroll
            class="hide-scrollbar q-pa-sm"
            dark
            style="max-height: 100%; height: 100%"
            :items="participants"
            separator
            v-slot="{ item, index }"
          >
            <q-item :key="index" dense>
              <q-item-section v-if="!item.number">
                <q-input
                  label="Search"
                  v-model="search"
                  color="white"
                  dark
                  borderless
                  dense
                  @focus="focus"
                  @blur="focus"
                >
                  <template v-slot:append>
                    <q-icon name="search" color="white" />
                  </template>
                </q-input>
              </q-item-section>
              <q-item-section v-else>
                <q-item-label> #{{ index }} {{ item.wallet_id }} </q-item-label>
                <q-item-label class="text-grey"
                  >Ticket: {{ item.number }}</q-item-label
                >
                <q-tooltip class="bg-amber text-body2" :offset="[10, 10]">
                  Draw Nº {{ item.eventNumber }}
                </q-tooltip>
              </q-item-section>
            </q-item>
          </q-virtual-scroll>
        </div>
      </q-tab-panel>

      <q-tab-panel name="winning">
        <div>
          <q-virtual-scroll
            class="hide-scrollbar q-pa-sm"
            dark
            style="max-height: 100%; height: 100%"
            :items="winners"
            separator
            v-slot="{ item, index }"
          >
            <q-item :key="index" dense>
              <q-item-section v-if="!item.number">
                <q-input
                  label="Search"
                  v-model="search"
                  color="white"
                  dark
                  borderless
                  dense
                >
                  <template v-slot:append>
                    <q-icon name="search" color="white" />
                  </template>
                </q-input>
              </q-item-section>
              <q-item-section v-else>
                <q-item-label> #{{ index }} {{ item.wallet_id }} </q-item-label>
                <q-item-label class="text-grey"
                  >Ticket: {{ item.number }}</q-item-label
                >
                <q-tooltip class="bg-amber text-body2" :offset="[10, 10]">
                  Draw Nº {{ item.eventNumber }}
                </q-tooltip>
              </q-item-section>
            </q-item>
          </q-virtual-scroll>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <q-tabs
      v-if="focus_val"
      v-model="tab"
      class="text-white text-weight-bold absolute-bottom borders"
      switch-indicator
      narrow-indicator
      active-color="white"
      style="background: linear-gradient(0.1turn, #3c0415, #300411)"
    >
      <q-tab name="participants" label="Participants" />
      <q-tab name="winning" label="Winning" />
    </q-tabs>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useEventStore } from "stores/event";
import { useClientStore } from "stores/client";

export default defineComponent({
  name: "WinningParticipants",
  setup() {
    const client = useClientStore();
    const event = useEventStore();
    const search = ref();
    const search2 = ref();
    const focus_val = ref(true);
    const tab = ref("participants");

    // COMPUTED
    const participants = computed(() => {
      let fil = event.participants.filter(
        (v) =>
          !search.value ||
          search.value == v.number ||
          search.value.toLowerCase() == v.wallet_id
      );
      fil.unshift({
        number: false,
      });
      return fil;
    });
    const winners = computed(() => {
      let fil = event.winners.filter(
        (v) =>
          !search2.value ||
          search2.value == v.number ||
          search2.value.toLowerCase() == v.wallet_id
      );
      fil.unshift({
        number: false,
      });
      return fil;
    });

    function focus(val) {
      if (val.type == "focusin") focus_val.value = false;
      else focus_val.value = true;
    }

    return {
      client,
      event,
      search,
      search2,
      winners,
      participants,
      tab,
      focus,
      focus_val,
    };
  },
});
</script>

<style>
.boxWP-mobile {
  background-image: url("/box-mobile.png");
  background-size: 100% 100%;
  background-position: center;
}
/* .borders {
  border-left: solid 6px #b4742c;
  border-right: solid 6px #e6b24d;
} */
.borders {
  border-left: solid 6px transparent;
  border-right: solid 6px transparent;
  border-image: linear-gradient(to top, #b4742c, #e6b24d) 1;
}
</style>
