<template>
  <div>
    <div class="column q-gutter-lg q-pa-lg">

      <div align="center">
        <img src="/logo.png" style="width: 150px" />
      </div>
      <div class="text-h5 text-weight-bold" style="color: #82340c" v-if="!hidden.hidde">
        {{ time.time }} <q-icon :name="time.time_icon" />
      </div>
      <div>
        <q-input @focus="focus('email')" @blur="blur('email')" v-model="email" label="E-mail" type="email" 
        color="dark"/>
      </div>
      <div>
        <q-input
          @focus="focus('password')"
          @blur="blur('password')"
          v-model="password"
          label="Password"
          :type="isPwd ? 'password' : 'text'"
          color="dark"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd = !isPwd"
            />
          </template>
        </q-input>
      </div>
      <div align="center">
        <q-btn flat no-caps class="text-subtitle2 text-weight-bold" style="color: #82340c ">
          Did you forget your password?
        </q-btn>
      </div>
      <div>
        <q-btn
          class="full-width"
          label="Login"
          style="background: #82340c "
		      text-color="white"
          @click="Login"
          :disable="!email || !password"
          :loading="loading"
        />
      </div>
      <div align="center" class="absolute-bottom q-pb-md" v-if="!hidden.hidde">
        <q-btn flat label="Create new account" class="text-weight-bold" style="color: #82340c" to="/SingIn"/>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, watch, ref, onMounted } from "vue";
import { useClientStore } from "stores/client";
import { useQuasar, Notify, Loading, Dialog } from "quasar";
import { useRouter } from "vue-router";
import { api } from "boot/axios";
import { Vue3Lottie } from 'vue3-lottie'
import 'vue3-lottie/dist/style.css'

import Lottie from './lottie.json'
// <Vue3Lottie :animationData="Lottie" :height="200" :width="200" />

export default defineComponent({
  name: "Login",

  components: {
    Vue3Lottie,
  },

  setup(props) {
    const $q = useQuasar();
    const client = useClientStore();
    const router = useRouter();

    const email = ref("");
    const password = ref("");
    const time = ref({});
    const isPwd = ref(true);
    const hidden = ref({
    	focus: false,
    	focus_time: false,
    	hidde: false
    })
    const loading = ref(false)

    function schedule() {
      var fecha = new Date();
      var hora = fecha.getHours();

      if (hora >= 5 && hora < 12) {
        time.value.time = "Good morning";
        time.value.time_icon = "wb_sunny";
      }
      if (hora >= 12 && hora < 19) {
        time.value.time = "Good afternoon";
        time.value.time_icon = "brightness_4";
      }
      if (hora >= 19 && hora < 24) {
        time.value.time = "Good night";
        time.value.time_icon = "fas fa-moon";
      }
      if (hora >= 0 && hora < 5) {
        time.value.time = "Good night";
        time.value.time_icon = "fas fa-moon";
      }
    }
    schedule();

    function hidde_component(v) {
        if (v != "blur") hidden.value.hidde = true;
    }
    async function focus(v) {
      var foco = false;
      if (hidden.value.focus === false) {
        foco = true;
      }
      if (v == "email") {
        hidden.value.focus_email = true;
        hidden.value.focus_password = false;
      }
      if (v == "password") {
        hidden.value.focus_password = true;
        hidden.value.focus_email = false;
      }
      if (foco) {
        hidden.value.focus = true;
        await hidde_component();
      }
    }
    async function blur(v) {
      if (v == "email") {
        hidden.value.focus_email = false;
      }
      if (v == "password") {
        hidden.value.focus_password = false;
      }
      if (!hidden.value.focus_email && !hidden.value.focus_password) {
        hidden.value.focus = false;
        hidden.value.hidde = false;
        await hidde_component("blur");
      }
    }

    async function Login() {
      const credentials = {
        email: email.value,
        password: password.value
      };

      const promise = api.post("usuarios/login", credentials);
      promise.catch(e => {
        $q.loading.hide()
        $q.notify({
          message: "User not found",
          type: "negative"
        });
      });
      promise.then(async response => {

        $q.loading.show({spinnerColor: 'dark'})
        let user = await client.getUser(response.userId)
        $q.localStorage.set("token", response.id);
        $q.localStorage.set("user", user)
        router.push("/buy");
      });
      

    }

    onMounted(async () => {});

    return {
      time,
      email,
      password,
      isPwd,
      hidden,
      loading,
      Lottie,

      focus,
      blur,
      Login
    };
  },
});
</script>
