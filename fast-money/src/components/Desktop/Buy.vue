<template>
  <div class="col relative-position absolute-bottom q-mb-xl q-pb-xl q-pa-md">
    <div class="absolute-center" @click="openBuy">
      <img class="cursor-pointer" src="/buy.png" style="width: 100px" />
    </div>

    <!-- DIALOGS -->
    <q-dialog v-model="dialog" @hide="select_ticket = null" class="transparent">
      <div
        class="dialog no-box-shadow"
        style="width: 100%; max-width: 80vw; height: 100%; max-height: 50vw"
      >
        <div class="float-right">
          <q-btn
            round
            icon="close"
            text-color="deep-orange-14"
            color="yellow-7"
            v-close-popup
            @click="select_ticket = null"
          />
        </div>
        <div class="absolute-center text-white">
          <table class="table-buy q-mt-lg q-pt-sm">
            <tr v-for="ticket in tickets_array" :key="ticket">
              <td v-for="tr in ticket.tr" :key="tr.ruta">
                <q-img
                  :src="tr.ruta"
                  style="width: 54px"
                  class="cursor-pointer"
                  :class="{
                    disabled: !tr.available,
                    btn_lottery_efec: tr.available,
                  }"
                  spinner-color="white"
                  @click="selected(tr)"
                />
              </td>
            </tr>
          </table>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useClientStore } from "stores/client";
import { useEventStore } from "stores/event";
import { useQuasar, Notify, Loading, Dialog } from "quasar";

export default defineComponent({
  name: "Buy",
  setup() {
    const $q = useQuasar();
    const client = useClientStore();
    const event = useEventStore();

    const dialog = ref(false);
    const search = ref("");
    const select_ticket = ref(null);
    const loading_pay = ref(false);
    const tickets_array = ref([]);

    watch(async () => {
      if (client.isLogged) {
        await selectEvent();
      }
    });

    watch(
      () => event.tickets_all,
      () => {
        tickets_array.value = event.tickets_all;
      }
    );

    // COMPUTED
    // const tickets = computed(() =>
    //   event.tickets.filter(
    //     (v) =>
    //       !v.reserved &&
    //       !v.selled &&
    //       (!search.value || search.value == v.number)
    //   )
    // );

    // MTHODS
    async function buy_ticket() {
      loading_pay.value = true;
      if (
        Number(select_ticket.value) > 100 ||
        Number(select_ticket.value) < 1
      ) {
        loading_pay.value = false;
        return $q.notify({
          message: `there are only tickets available from number 1 to ${100} `,
          color: "negative",
        });
      }

      let availabe = await event.availableTicket(select_ticket.value);
      if (!availabe) {
        loading_pay.value = false;
        return $q.notify({
          message: `Ticket ${select_ticket.value} not available`,
          color: "negative",
        });
      }
      let res = await event.payTicketUsdt();
      if (res) {
        if (res == "insufficient") {
          loading_pay.value = false;
          return $q.notify({
            message: `You don't have enough USDT to buy the ticket`,
            color: "negative",
          });
        }

        await event.buyTicket(Number(select_ticket.value), res);
        $q.notify({
          message: `Ticket ${select_ticket.value} purchased`,
          color: "positive",
        });
        await selectEvent();
      } else {
        $q.notify({
          message: `Operation cancelled`,
          color: "negative",
        });
      }
      select_ticket.value = null;
      loading_pay.value = false;
    }

    async function selectEvent() {
      $q.loading.show();
      await event.getEvents();
      await event.loadParticipants();
      await event.loadWinners();
      await event.getTransactions();
      await event.getTickets();

      $q.loading.hide();
    }
    function selected(param) {
      if (!param.available)
        return $q.notify({
          message: `Ticket ${param.number} is not available`,
          color: "negative",
        });

      select_ticket.value = param.number;
      $q.dialog({
        title: ' <div class="text-weight-bolder text-center">Buy Ticket</div> ',
        message: ` <div class="text-weight-bold text-subtitle1 text-center">Sure to buy ticket number ${param.number}?</div> `,
        html: true,
        cancel: true,
        persistent: true,
        color: "yellow-7",
        dark: true,
      })
        .onOk(async () => {
          if (!client.isLogged)
            return $q.notify({
              message: "Is not logged. Please login with metamask",
              color: "negative",
            });
          await buy_ticket();
        })
        .onCancel(() => {
          select_ticket.value = null;
        })
        .onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        });
    }
    async function openBuy() {
      $q.loading.show();
      dialog.value = true;
      $q.loading.hide();
    }

    onMounted(async () => {
      await selectEvent();
    });

    return {
      client,
      event,
      dialog,
      buy_ticket,
      selectEvent,
      search,
      select_ticket,
      loading_pay,
      tickets_array,
      openBuy,
      selected,
    };
  },
});
</script>

<style>
.buy {
  position: absolute;
  margin-left: 88px;
}
.dialog {
  background-image: url("/dialog.png");
  background-size: cover;
  background-position: center;
}
.table-buy {
  margin-right: 350px;
}
</style>
