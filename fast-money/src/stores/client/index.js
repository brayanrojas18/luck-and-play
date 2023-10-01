import { defineStore } from "pinia";
import { axios, api } from "boot/axios";
import { result } from "lodash";
import { Notify } from "quasar";
import { LocalStorage, SessionStorage } from 'quasar'

export const useClientStore = defineStore("client", {
  state: () => ({
    wallet_id: null,
    network: null,
    tickets: [], // los tickets que ha comprado el usuario
    loadingTickets: false,
    userData: {},

    // PHONE CODES
    countrys: [
    {
      label: 'Colombia',
      value: 'CO',
      icon: 'img:/flags/Colombia.png',
      code: '+57'
    },
    {
        label: 'Venezuela',
        value: 'VE',
        icon: 'img:/flags/Venezuela.png',
        code: '+58'
      },
    ]
  }),
  getters: {
    isLogged: (state) => (LocalStorage.has('user') ? true : false),
    user: (state) => state.userData || LocalStorage.getItem('user')
  },
  actions: {
    // async connectWallet() {
    //   await ethereum.request({ method: "eth_requestAccounts" });
    //   this.setWallet();
    //   return ethereum.selectedAddress;
    // },
    // async setWallet() {
    //   this.network = await ethereum.request({ method: "eth_chainId" });
    //   this.wallet_id = ethereum.selectedAddress;
    // },
    // async getBnbPrice() {
    //   let price = await axios.get(
    //     "https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT"
    //   );
    //   return price.data.price;
    // },
    async loadTickets() {
      if (this.wallet_id) {
        this.loadingTickets = true;
        this.tickets = await api.get(
          "transactions?filter=" +
            JSON.stringify({
              where: {
                wallet_id: this.wallet_id,
              },
              sort: "createdAt DESC",
            })
        );
        this.loadingTickets = false;
      }
    },
    // Este es el metodo para pagar un ticket ganador, recibe el id del ticket que selecciona del arreglo tickets
    // async payTicketWinner(id) {
    //   let pay = await api.post(`/transactions/${id}/pay`);
    //   if (!pay.valid) {
    //     return Notify.create({
    //       message: pay.message,
    //       color: "negative",
    //     });
    //   } else {
    //     return pay.data;
    //   }
    // },
    async myTicketsWinners() {
      let events = await api.get("events");

      if (this.wallet_id) {
        let result = await api.get(
          "transactions?filter=" +
            JSON.stringify({
              where: {
                wallet_id: this.wallet_id,
                winner: true,
              },
              sort: "createdAt DESC",
            })
        );

        if (result.length) {
          result = result.map((v) => {
            let event = events.find((f) => f.id == v.event_id);
            if (event) {
              return {
                ...v,
                event_name: event.type == "cooper" ? "bronze" : event.type,
                value: event.winner_pay,
                eventNumber: event.eventNumber,
              };
            }
          });
        }
        return result;
      }
    },
    async myTicketsBuyeds() {
      let events = await api.get("events");

      if (this.wallet_id) {
        let result = await api.get(
          "transactions?filter=" +
            JSON.stringify({
              where: {
                wallet_id: this.wallet_id,
              },
              sort: "createdAt DESC",
            })
        );

        if (result.length) {
          result = result.map((v) => {
            let event = events.find((f) => f.id == v.event_id);
            if (event) {
              return {
                ...v,
                event_name: event.type == "cooper" ? "bronze" : event.type,
                winner: v.winner ? "Yes" : "No",
                value: event.winner_pay,
                eventNumber: event.eventNumber,
              };
            }
          });
        }
        return result;
      }
    },
    async getUser(param) {
      let user = await api.get(
          "usuarios/" + param
        );
      this.userData = user 
      return user
    }
  },
});
