<template>
  <div class="col relative-position">
    <div
      class="row justify-between text-weight-bold text-white q-mx-xl q-mb-lg absolute-bottom"
    >
      <!-- PARTICIPANTS -->
      <div class="box-desktop1 q-pb-md q-pt-xl">
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

      <!-- WINNERS -->
      <div class="box-desktop2 q-pb-md q-pt-xl">
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
                v-model="search2"
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
    </div>

    <q-dialog
      v-model="search_dialog"
      @hide="search = null"
      :position="position"
    >
      <q-card class="dialog text-white" style="width: 400px">
        <div class="q-ma-sm" :align="position == 'right' ? 'right' : ''">
          <q-btn
            flat
            round
            :icon="
              position == 'left'
                ? 'keyboard_double_arrow_left'
                : 'keyboard_double_arrow_right'
            "
            v-close-popup
            color="white"
            size="sm"
          />
        </div>
        <q-card-section
          align="center"
          class="q-pt-none q-pb-none text-weight-bold text-h6"
        >
          Wallet or Ticket
        </q-card-section>
        <q-card-section align="center" class="q-pt-none">
          <div style="width: 200px">
            <q-input label="Search" v-model="search" color="white" dark />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import { useEventStore } from "stores/event";

export default defineComponent({
  name: "WinningParticipants",
  setup() {
    const event = useEventStore();
    const search_dialog = ref(false);
    const search = ref();
    const search2 = ref();

    const position = ref();

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

    return {
      event,
      search_dialog,
      search,
      search2,
      position,
      winners,
      participants,
    };
  },
});
</script>

<style>
.box-desktop1 {
  background-image: url("/box-participants.png");
  background-size: 100% 100%;
  background-position: center;
  width: 32%;
  height: 50vh;
}
.box-desktop2 {
  background-image: url("/box-winners.png");
  background-size: 100% 100%;
  background-position: center;
  width: 32%;
  height: 50vh;
}

.btn_lottery_efec:hover,
.btn_lottery_efec.active {
  -webkit-transform: scale(0.9);
  transform: scale(0.9);
  /* filter: opacity(0.8); */
}
.btn_lottery_efec {
  transition: all 0.3s ease-in-out;
}
</style>
