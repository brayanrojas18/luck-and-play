<template>
  <slot />
</template>

<script>

import { onUnmounted, watch } from 'vue'
import { socket } from 'boot/io'

export default {
  props: {
    room: {
      default: null
    },
    event: {
      default: null
    }
  },
  emits: ['event'],
  setup (props, context) {

    function emit (data) {
      context.emit('event', data)
    }

    function initSocket () {
      if (props.room && props.event) {
        socket.emit('join-room', props.room)
        socket.on(props.event, emit)
      }
    }

    function leaveSocket () {
      socket.off(props.event, emit)
    }

    function reconnect () {
      leaveSocket()
      initSocket()
    }

    socket.on('connect', reconnect)

    initSocket()

    onUnmounted(() => {
      leaveSocket()
      socket.off('connect', reconnect)
    })

    watch(() => props.room, val => {
      reconnect()
    })

    watch(() => props.event, val => {
      reconnect()
    })

    return {
    }
  }
}
</script>
