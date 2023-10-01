import { boot } from 'quasar/wrappers'
import SocketEvent from 'components/SocketEvent.vue'

export default boot(({ app }) => {
  
  app.component('socket-event', SocketEvent)

})
