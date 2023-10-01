import { defineStore } from "pinia";
import { api } from "boot/axios";
import _ from "lodash";
import { Notify } from "quasar";
import moment from "moment";

const reciever = "0xb3969E71080bA9c47717807C6A22D46325f66397";

export const useEventStore = defineStore("event", {
  state: () => ({
    loadingParticipants: false,
    loadingWinners: false,
    loadingEvents: false,

    events: [],
    selectedEvent: null,
    currentEvent: null,
    participants: [],
    winners: [],
    tickets: [],
    tickets_all: [],
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_spender",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "approve",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "totalSupply",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_from",
            type: "address",
          },
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transferFrom",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [
          {
            name: "",
            type: "uint8",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        constant: false,
        inputs: [
          {
            name: "_to",
            type: "address",
          },
          {
            name: "_value",
            type: "uint256",
          },
        ],
        name: "transfer",
        outputs: [
          {
            name: "",
            type: "bool",
          },
        ],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
          {
            name: "_spender",
            type: "address",
          },
        ],
        name: "allowance",
        outputs: [
          {
            name: "",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      {
        payable: true,
        stateMutability: "payable",
        type: "fallback",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
    ],
  }),
  getters: {
    selected: (state) => state.selectedEvent,
    // currentEvent: (state) =>
    //   state.events.find((v) => v.type == state.selectedEvent),
    topEvents: (state) => state.events,
  },
  actions: {
    async getEvents() {
      this.loadingEvents = true;
      this.events = await api.get(
        "events?filter=" +
          JSON.stringify({
            where: {
              status: "active",
            },
          })
      );
      this.events = _.sortBy(this.events, ["tickets_available"]);
      (this.currentEvent = this.events.find(
        (v) => v.type == this.selectedEvent
      )),
        (this.selectedEvent = "cooper");
      this.loadingEvents = false;
    },
    async getTransactions() {
      let result = await api.get(
        "transactions?filter=" +
          JSON.stringify({
            where: {
              event_id: this.currentEvent.id,
              confirmed: true,
            },
          })
      );
      return result;
    },
    async getTickets(mobile) {
      let transactions = await api.get(
        "transactions?filter=" +
          JSON.stringify({
            where: {
              event_id: this.currentEvent.id,
              confirmed: true,
            },
          })
      );
      transactions = transactions && transactions.length ? transactions : [];
      let tickets = [];
      let division = this.currentEvent.tickets_quantity / (mobile ? 5 : 10);
      let counter = this.currentEvent.tickets_quantity / (mobile ? 20 : 10);
      let iterator = 1;
      for (let i = 0; i < division; i++) {
        tickets.push({ tr: [] });
        for (let e = iterator; e <= counter; e++) {
          let find = transactions.find((f) => f.number == e);
          tickets[i].tr.push({
            number: e,
            ruta: find
              ? `/tickets/disabled/${e}.png`
              : `/tickets/active/${e}.png`,
            available: find ? false : true,
          });
        }
        iterator += mobile ? 5 : division;
        counter += mobile ? 5 : division;
      }
      this.tickets_all = tickets;
    },
    // async selectEvent(type) {
    //   this.selectedEvent = type;
    //   // this.loadParticipants()
    //   // this.loadWinners()
    // },
    async loadParticipants() {
      this.loadingParticipants = true;
      let participants = await api.get(
        "transactions?filter=" +
          JSON.stringify({
            where: {
              confirmed: true,
              event_id: this.currentEvent.id,
            },
          })
      );
      this.participants = participants.map((v) => {
        let event = this.events.find((f) => f.id == v.event_id);
        return {
          wallet_id: v.wallet_id,
          number: v.number,
          eventNumber: event ? event.eventNumber : "",
        };
      });
      this.loadingParticipants = false;
    },
    async loadWinners() {
      this.loadingWinners = true;
      // let event = await api.get(
      //   "events?filter=" +
      //     JSON.stringify({
      //       where: {
      //         status: "finished",
      //         generated_winners: true,
      //         type: this.currentEvent.type,
      //       },
      //       sort: "createdAt DESC",
      //       limit: 1,
      //     })
      // );

      let winners = await api.get(
        "transactions?filter=" +
          JSON.stringify({
            where: {
              confirmed: true,
              // event_id: event[0].id,
              winner: true,
            },
          })
      );
      this.winners = winners
        .filter(
          (v) =>
            moment(v.updatedAt).format("YYYY-MM-DD") ===
            moment().format("YYYY-MM-DD")
        )
        .map((v) => {
          let event = this.events.find((f) => f.id == v.event_id);
          return {
            wallet_id: v.wallet_id,
            number: v.number,
            eventNumber: event ? event.eventNumber : "",
          };
        });
      if (!this.winners || !this.winners.length) this.winners = [];

      this.loadingWinners = false;
    },
    async payTicket() {
      const web3 = new Web3(window.ethereum);
      try {
        const transactionHash = await ethereum.request({
          method: "eth_sendTransaction",
          params: [
            {
              to: reciever,
              from: ethereum.selectedAddress,
              value: web3.utils.toHex(
                web3.utils.toWei(this.currentEvent.price)
              ),
              // And so on...
            },
          ],
        });
        return transactionHash;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    // Esta es el metodo que debes usar para pagar el ticket en USDT
    async payTicketUsdt() {
      try {
        const web3 = new Web3(window.ethereum);
        const contractAddress = "0x55d398326f99059ff775485246999027b3197955"; // address of the token contract
        const tokenAddress = ethereum.selectedAddress; // address of which you want to get the token balance

        const token = new web3.eth.Contract(this.abi, contractAddress, {
          from: tokenAddress,
          gas: 100000,
        });
        // const balance = await token.methods.balanceOf(tokenAddress).call().then(console.log);
        const balance = await token.methods
          .balanceOf(ethereum.selectedAddress)
          .call();

        if (balance < web3.utils.toWei(String(this.currentEvent.price)))
          return "insufficient";

        let tx = await token.methods
          .transfer(
            "0xf81e51FDEbDb692f286fC6063Fe6fB49A3e3C065",
            web3.utils.toWei(String(this.currentEvent.price))
          )
          .send();

        console.log("tx", tx);

        return tx.transactionHash;
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    async buyTicket(number, transaction_id) {
      let buy = await api.post(`/events/${this.currentEvent.id}/buy`, {
        transaction_id,
        wallet_id: ethereum.selectedAddress,
        number,
      });
      if (!buy.valid) {
        return Notify.create({
          message: buy.message,
          color: "negative",
        });
      } else {
        return buy.data;
      }
    },
    // Con este metodo puedes ver si un numero está disponible
    async availableTicket(number) {
      return api.get(
        `/events/${this.currentEvent.id}/available-ticket?number=${number}`
      );
    },
    replaceTicket(ticket) {
      let index = this.tickets.findIndex((v) => v.id == ticket.id);
      if (index >= 0) {
        this.tickets[index] = ticket;
      }
    },
    addParticipant(transaction) {
      this.participants.push(transaction.wallet_id);
    },
  },
});
