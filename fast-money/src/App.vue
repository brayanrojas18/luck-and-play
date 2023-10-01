<template>
  <router-view />
  <general-events />
</template>

<script>
import { defineComponent, onMounted } from "vue";
import GeneralEvents from 'components/GeneralEvents.vue'
import { useClientStore } from "stores/client";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";

export default defineComponent({
  name: 'App',
  components: {
    GeneralEvents
  },

  setup(props) {
  	const $q = useQuasar();
    const client = useClientStore();
    const router = useRouter();

  	onMounted(async () => {
    	// if (Object.keys(client.user).length === 0) {
	    //   $q.sessionStorage.remove('user')
	    //   router.push('/login')
	    //   if(!close)
	    //     window.location.reload(false);
	   	// }
    });
  }

})


</script>
