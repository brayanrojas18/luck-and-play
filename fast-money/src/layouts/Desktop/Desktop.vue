<template>
  <q-layout view="lHh Lpr lFf" id="fondo">
    <q-header class="transparent">
      <div class="row justify-between q-px-xl q-mx-xl q-mt-md">
        <div class="q-ml-xl instructions">
          <div class="cursor-pointer" @click="dialog_instructions = true">
            <img class="imagen" src="/instructions.png" style="width: 100%" />
          </div>
        </div>
        <div class="q-mr-xl wallet">
          <div class="cursor-pointer" @click="connect" v-if="!client.isLogged">
            <img class="imagen" src="/connect.png" style="width: 100%" />
          </div>
          <div class="cursor-pointer" v-else>
            <img class="imagen" src="/profile.png" style="width: 100%" />
            <!-- <q-badge
              v-if="tickets_winners_claim.length"
              color="positive"
              rounded
              class="float-right absolute"
              style="margin-left: -10px"
            /> -->
            <q-menu class="menu text-white">
              <q-list style="min-width: 100px">
                <!-- <q-item clickable v-close-popup @click="getTicketsWinnerClaim">
                  <q-item-section>Claim Tickets</q-item-section>
                  <q-item-section side>
                    <q-badge
                      v-if="tickets_winners_claim.length"
                      color="positive"
                      >{{ tickets_winners_claim.length }}</q-badge
                    >
                  </q-item-section>
                </q-item> -->
                <q-separator class="bg-white" />
                <q-item clickable v-close-popup @click="getTicketsWinner">
                  <q-item-section>Tickets Winner</q-item-section>
                </q-item>
                <q-separator class="bg-white" />
                <q-item clickable v-close-popup @click="getTicketsBuyed">
                  <q-item-section>Tickets Buyed</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </div>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view v-if="!$q.platform.is.mobile" />

      <!-- DIALOGS -->
      <q-dialog v-model="dialog_net" persistent>
        <q-card>
          <q-card-section>
            <div class="text-h6">Attention!</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            Please switch to BSC network.
          </q-card-section>
        </q-card>
      </q-dialog>

      <!-- <q-dialog v-model="dialog_winners_claim">
        <q-card class="dialog_loyout text-white">
          <div class="q-mt-sm q-ml-sm q-mb-none q-pb-none">
            <q-btn
              flat
              round
              icon="reply"
              v-close-popup
              color="white"
              size="sm"
            />
          </div>
          <q-card-section class="q-mt-none q-pt-none">
            <div class="text-h5 text-center text-weight-bold">
              My winnin tickets!
            </div>
          </q-card-section>
          <q-card-section
            class="q-pt-none row q-gutter-sm justify-center"
            v-for="ticket in tickets_winners_claim"
            :key="ticket.id"
          >
            <div>
              <img
                :src="`/tickets/active/${ticket.number}.png`"
                style="width: 80px"
                class="cursor-pointer btn_lottery_efec"
                @click="claim(ticket)"
              />
              <q-tooltip class="bg-deep-orange-10">Claim</q-tooltip>
            </div>
          </q-card-section>
          <q-card-section
            v-if="!tickets_winners_claim.length"
            class="text-h6 text-weight-bolder text-center q-pt-none q-mt-none"
          >
            There are no tickets to claim
          </q-card-section>
        </q-card>
      </q-dialog> -->

      <q-dialog v-model="dialog_winners">
        <q-card
          class="dialog_loyout text-white"
          style="width: 700px; max-width: 80vw"
        >
          <div class="q-mt-sm q-ml-sm q-mb-none q-pb-none">
            <q-btn
              flat
              round
              icon="reply"
              v-close-popup
              color="white"
              size="sm"
            />
          </div>
          <div class="q-pa-md">
            <q-table
              class="transparent text-white text-capitalize"
              title="My winnin tickets!"
              :rows="tickets_winners"
              :columns="columns_winners"
              row-key="index"
              :filter="filter"
              dark
            >
              <template v-slot:top-right>
                <q-input
                  borderless
                  dense
                  debounce="300"
                  v-model="filter"
                  placeholder="Search"
                  dark
                  color="white"
                >
                  <template v-slot:append>
                    <q-icon name="search" color="white" />
                  </template>
                </q-input>
              </template>
            </q-table>
          </div>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialog_buyeds">
        <div class="dialog_loyout text-white">
          <div class="q-mt-sm q-ml-sm q-mb-none q-pb-none">
            <q-btn
              flat
              round
              icon="reply"
              v-close-popup
              color="white"
              size="sm"
            />
          </div>
          <div class="q-pa-md">
            <q-table
              class="transparent text-white text-capitalize no-box-shadow"
              title="My buyed tickets!"
              :rows="tickets_buyeds"
              :columns="columns_buyeds"
              :filter="filter2"
            >
              <template v-slot:top-right>
                <q-input
                  borderless
                  dense
                  debounce="300"
                  v-model="filter2"
                  placeholder="Search"
                  color="white"
                  dark
                >
                  <template v-slot:append>
                    <q-icon name="search" color="white" />
                  </template>
                </q-input>
              </template>
            </q-table>
          </div>
        </div>
      </q-dialog>

      <q-dialog v-model="dialog_video">
        <q-card
          class="dialog_loyout q-pa-lg"
          style="width: 700px; max-width: 80vw"
        >
          <div class="absolute-left z-top">
            <q-btn
              flat
              round
              icon="reply"
              v-close-popup
              color="white"
              size="sm"
            />
          </div>
          <q-video src="video-desktop.mp4" loading="eager" :ratio="16 / 9" />
        </q-card>
      </q-dialog>

      <q-dialog
        v-model="dialog_instructions"
        full-height
        @hide="idioma = 'english'"
      >
        <q-card style="width: 700px; max-width: 80vw" class="q-px-md" dark>
          <q-btn-group push class="q-mt-xs">
            <q-btn flat push label="English" @click="idioma = 'english'" />
            <q-btn flat push label="Español" @click="idioma = 'spanish'" />
          </q-btn-group>
          <q-btn
            icon="close"
            flat
            dense
            round
            class="float-right q-mt-xs"
            v-close-popup
          />
          <div v-if="idioma == 'english'">
            <q-card-section class="q-pt-none">
              <div class="text-h3 text-weight-bolder">Fast Money</div>
              <div class="text-subtitle1 text-weight-bold text-grey">
                Fast Money Instructions
              </div>
            </q-card-section>

            <q-separator inset dark />

            <q-card-section align="center">
              <q-img src="/logo.png" width="250px" />
            </q-card-section>

            <q-card-section>
              <div class="text-subtitle2 text-weight-medium">
                Participating in the Fast Money Raffle is very easy, here are
                the steps to follow:<br /><br />

                1- Log in to your Metamask.<br /><br />

                2- Click on the buy button.<br /><br />

                3- Select the ticket number of your choice.<br /><br />

                4- Confirm your purchase.<br /><br />

                That's it, you are now participating.<br /><br />

                Observations:<br /><br />

                - Each ticket has a value of $1 dollar (USDT).<br /><br />

                - They will be from number 1 to number 100.<br /><br />

                - When the ticket sales are completed, the raffle is
                automatically carried out.<br /><br />

                - The winning number will receive a reward of $90 dollars(USDT)
                for their ticket.<br /><br />

                - The winner of the raffle will automatically receive their
                reward in Metamask.
              </div>
            </q-card-section>
          </div>
          <div v-if="idioma == 'spanish'">
            <q-card-section class="q-pt-none">
              <div class="text-h3 text-weight-bolder">Fast Money</div>
              <div class="text-subtitle1 text-weight-bold text-grey">
                Instrucciones de Fast Money
              </div>
            </q-card-section>

            <q-separator inset dark />

            <q-card-section align="center">
              <q-img src="/logo.png" width="250px" />
            </q-card-section>

            <q-card-section>
              <div class="text-subtitle2 text-weight-medium">
                Participar en la Rifa de Fast Money es muy sencillo, te
                mostramos los pasos a seguir: <br /><br />
                1- Inicias sesión en tu Metamask. <br /><br />
                2- Das click en el botón comprar(Buy). <br /><br />
                3- Seleccionas el número de ticket de tu preferencia.
                <br /><br />
                4- Confirmas tu compra. <br /><br />
                Listo, ya estás participando. <br /><br />
                Observaciones: <br /><br />
                - Cada ticket tiene un valor de $1 dólar(USDT).<br /><br />
                - Estarán desde el número 1 al número 100.<br /><br />
                - Al completarse la venta de los ticket, se realiza
                automáticamente la rifa.<br /><br />
                - El número ganador recibirá una recompensa de $90 dólares(USDT)
                por su ticket.<br /><br />
                - El ganador de la rifa recibirá de manera automática su
                recompensa en Metamask.
              </div>
            </q-card-section>
          </div>
        </q-card>
      </q-dialog>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, watch, ref, onMounted } from "vue";
import { useClientStore } from "stores/client";
import { useEventStore } from "stores/event";
import { useQuasar, Dialog, Notify, Loading } from "quasar";
import moment from "moment";

export default defineComponent({
  name: "MainLayout",

  setup(props) {
    const client = useClientStore();
    const event = useEventStore();
    const $q = useQuasar();
    const dialog_net = ref(false);
    const dialog_winners = ref(false);
    const dialog_buyeds = ref(false);
    // const dialog_winners_claim = ref(false);
    const dialog_video = ref(false);
    const dialog_instructions = ref(false);
    const tickets_winners = ref([]);
    const tickets_buyeds = ref([]);
    // const tickets_winners_claim = ref([]);
    const menu = ref(false);
    const filter = ref("");
    const filter2 = ref("");
    const idioma = ref("english");

    // VARIABLES TABLETS
    const columns_winners = [
      {
        name: "number",
        required: true,
        label: "Number",
        align: "center",
        field: "number",
        sortable: true,
      },
      {
        name: "eventNumber",
        required: true,
        label: "Nº Lottery",
        align: "center",
        field: "eventNumber",
        sortable: true,
      },
      {
        name: "createdAt",
        label: "Date",
        align: "center",
        field: (row) => row.createdAt,
        format: (val) => moment(val).format("YYYY-MM-DD"),
        sortable: true,
      },
    ];
    const columns_buyeds = [
      {
        name: "number",
        required: true,
        label: "Number",
        align: "center",
        field: "number",
        sortable: true,
      },
      {
        name: "eventNumber",
        required: true,
        label: "Nº Lottery",
        align: "center",
        field: "eventNumber",
        sortable: true,
      },
      {
        name: "winner",
        align: "center",
        label: "Winner",
        field: "winner",
        sortable: true,
      },
      {
        name: "createdAt",
        label: "Date",
        align: "center",
        field: (row) => row.createdAt,
        format: (val) => moment(val).format("YYYY-MM-DD"),
        sortable: true,
      },
    ];

    watch(() => {
      if (client.isLogged) {
        if (!client.isAvailableNetwork) dialog_net.value = true;
        else dialog_net.value = false;
      } else {
        connect();
      }
    });

    // METHODS
    async function connect() {
      if (client.walletAvailable) {
        await client.connectWallet();
      } else {
        $q.dialog({
          title: "Attention!",
          message: "Please install Metamask",
          cancel: true,
        })
          .onOk(() => {
            window.location.href = "https://metamask.io/";
          })
          .onCancel(() => {});
      }
    }

    // async function getTicketsWinnerClaim() {
    //   $q.loading.show();
    //   dialog_winners_claim.value = true;
    //   let winners = await client.myTicketsWinners();
    //   if (winners && winners.length)
    //     tickets_winners_claim.value = winners.filter((v) => !v.payed);
    //   $q.loading.hide();
    // }

    async function getTicketsWinner() {
      $q.loading.show();
      dialog_winners.value = true;
      let winners = await client.myTicketsWinners();
      if (winners.length)
        tickets_winners.value = winners.filter((v) => v.payed);
      $q.loading.hide();
    }

    async function getTicketsBuyed() {
      $q.loading.show();
      dialog_buyeds.value = true;
      tickets_buyeds.value = await client.myTicketsBuyeds();
      $q.loading.hide();
    }

    // function claim(ticket) {
    //   $q.dialog({
    //     title: "Confirm claim",
    //     message: `Are you sure to claim the ticket ${ticket.number}?`,
    //     cancel: true,
    //     persistent: true,
    //     color: "yellow-7",
    //     dark: true,
    //   })
    //     .onOk(async () => {
    //       $q.loading.show();
    //       await client.payTicketWinner(ticket.id);
    //       let winners = await client.myTicketsWinners();
    //       if (winners && winners.length)
    //         tickets_winners_claim.value = winners.filter((v) => !v.payed);
    //       $q.loading.hide();
    //       dialog_winners_claim.value = false;
    //       $q.notify({
    //         message: `Ticket claimed successfully`,
    //         color: "positive",
    //       });
    //     })
    //     .onCancel(() => {
    //       // console.log('>>>> Cancel')
    //     })
    //     .onDismiss(() => {
    //       // console.log('I am triggered on both OK and Cancel')
    //     });
    // }

    function instructions() {
      window.location.href = "https://whitepaper.tetherlottery.app/";
    }

    onMounted(async () => {});

    return {
      connect,
      client,
      dialog_net,
      dialog_winners,
      dialog_buyeds,
      // dialog_winners_claim,
      dialog_video,
      dialog_instructions,
      tickets_winners,
      tickets_buyeds,
      // tickets_winners_claim,
      menu,
      columns_winners,
      columns_buyeds,
      filter,
      filter2,
      // claim,
      getTicketsWinner,
      // getTicketsWinnerClaim,
      getTicketsBuyed,
      instructions,
      idioma,
    };
  },
});
</script>

<style>
#fondo {
  background-image: url("/background.jpg");
  background-size: 100% 100%;
  background-position: center;
}
.imagen:hover {
  -webkit-transform: scale(0.9);
  transform: scale(0.9);
  /* filter: opacity(0.8); */
}
.imagen {
  transition: all 0.5s ease-in-out;
}
.menu {
  background-image: url("/box2.png");
  background-size: cover;
  background-position: center;
}
.dialog_loyout {
  background-image: url("/box2.png");
  background-size: cover;
  background-position: center;
}

/*RESPONSIVE*/
@media only screen and (min-width: 320px) and (max-width: 375px) {
}
@media only screen and (min-width: 375px) and (max-width: 425px) {
}
@media only screen and (min-width: 425px) and (max-width: 768px) {
}
@media only screen and (min-width: 768px) and (max-width: 1024px) {
}
@media only screen and (min-width: 1024px) and (max-width: 1440px) {
  .instructions {
    margin-left: 50px;
  }
  .wallet {
    margin-right: 45px;
  }
}
@media only screen and (min-width: 1440px) and (max-width: 1920px) {
  .instructions {
    margin-left: 70px;
  }
  .wallet {
    margin-right: 70px;
  }
}
@media only screen and (min-width: 1920px) and (max-width: 2560px) {
  .instructions {
    margin-left: 115px;
  }
  .wallet {
    margin-right: 115px;
  }
}
@media only screen and (min-width: 2560px) and (max-width: 3000px) {
  .instructions {
    margin-left: 180px;
  }
  .wallet {
    margin-right: 180px;
  }
}
</style>
