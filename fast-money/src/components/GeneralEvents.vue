<template>
  <socket-event room="general" event="ticket-changed" @event="ticketChanged" />
  <socket-event
    room="general"
    event="new-participant"
    @event="newParticipant"
  />
  <socket-event room="general" event="new-event" @event="newEvent" />
  <socket-event
    :room="`wallet:${wallet}`"
    :event="`wallet:${wallet}:tickets`"
    @event="updateTickets"
  />
</template>

<script>
import { useEventStore } from "stores/event";
import { useClientStore } from "stores/client";
import { watch, computed } from "vue";

export default {
  // name: 'ComponentName',
  setup() {
    const events = useEventStore();
    const client = useClientStore();

    const wallet = computed(() => client.wallet_id);

    events.getEvents();

    // setTimeout(() => events.selectEvent('cooper'), 5000)

    // setTimeout(() => events.selectEvent('diamond'), 10000)

    function ticketChanged(ticket) {
      events.replaceTicket(ticket);
    }

    function newParticipant(transaction) {
      if (transaction.event_id == events.currentEvent?.id) {
        events.addParticipant(transaction);
        events.getTickets();
      }
    }

    async function newEvent(event) {
      await events.getEvents(
        $q.platform.is.mobile ? $q.platform.is.mobile : null
      );
      events.loadParticipants();
      events.loadWinners();
    }

    function updateTickets() {
      client.loadTickets();
    }

    // watch(
    //   () => events.selected,
    //   () => {
    //     events.loadParticipants();
    //     events.loadWinners();
    //   }
    // );

    watch(wallet, (val) => {
      if (val) {
        client.loadTickets();
      }
    });

    return {
      wallet,

      ticketChanged,
      newParticipant,
      newEvent,
      updateTickets,
    };
  },
};
</script>
