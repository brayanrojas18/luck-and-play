<template>
  <div>
    <div class="column q-gutter-lg q-pa-lg">

      <div class="row justify-center ">
        <div class="absolute-left q-mt-xs q-ml-xs">
          <q-btn flat round icon="arrow_back" color="dark" to="/login"/>
        </div>
        <div  class="text-h4 text-weight-bold" style="color: #82340c">
          Let's start!
        </div>
      </div>
      <div>
        <q-input v-model="form.name" label="Name" color="dark"/>
      </div>
      <div>
        <q-input v-model="form.last_name" label="Last Name" color="dark"/>
      </div>
      <div class="row">
        <q-select 
          v-model="form.country" 
          :options="countrys" 
          color="dark" 
          @filter="filterFn" 
          use-input
          input-debounce="0" 
          behavior="dialog"
          fill-input
          emit-value
          hide-selected
          @input-value="Country"
          style="width: 20%"
        >
          <template v-slot:prepend >
            <q-icon :name="icon_country" />
          </template>
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section avatar>
                <q-icon :name="scope.opt.icon" />
              </q-item-section>
              <q-item-section>
                {{ scope.opt.label }}
              </q-item-section>
              <q-item-section side>
                {{ scope.opt.code }}
              </q-item-section>
            </q-item>
            <q-separator/>
          </template>
        </q-select>
        <q-input v-model="form.phone" label="Phone" type="tel" color="dark" style="width: 80%" class="q-pl-md" 
         :prefix="form.code_phone" hint="Enter a valid phone number"/>
      </div>
      <div>
        <q-input v-model="form.email" label="Email" type="email" color="dark" hint="Please enter a valid email"/>
      </div>
      <div>
        <q-input
          v-model="form.password"
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
      <div>
        <q-input
          v-model="form.password2"
          label="Repeat Password"
          :type="isPwd2 ? 'password' : 'text'"
          color="dark"
        >
          <template v-slot:append>
            <q-icon
              :name="isPwd2 ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="isPwd2 = !isPwd2"
            />
          </template>
        </q-input>
      </div>
      <div align="center" class="q-pt-xs">
        <q-btn
          class="full-width"
          label="Create Account"
          style="background: #82340c "
		      text-color="white"
          @click="saveData"
          :disable="!form.name || !form.last_name || !form.email || !form.phone || !form.password || !form.password2"
        />
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

export default defineComponent({
  name: "SingIn",

  setup(props) {
    const $q = useQuasar();
    const client = useClientStore();
    const router = useRouter();

    const form = ref({
      country: 'VE'
    })
    const isPwd = ref(true)
    const isPwd2 = ref(true)
    const countrys = ref(client.countrys)
    const icon_country = ref('')


    function filterFn (val, update) {
      if (val === '') {
        setTimeout(() => {
          update(() => {
            countrys.value = client.countrys
          })
        }, 2000)
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        countrys.value = client.countrys.filter(v => v.label.toLowerCase().indexOf(needle) > -1)
      })
    }

    function Country(val) {
      $q.loading.show()
      let find = client.countrys.find(v => v.value == val)
      if(find) {
        form.value.country = find.value
        icon_country.value = find.icon
        form.value.code_phone = find.code
      }
      $q.loading.hide()
    }

    async function saveData() {
      if (
          !/^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(
            form.value.email
          )
        ) {
          return $q.notify({
            message: "The email address is not valid",
            color: "negative"
          });
        }
      let email = await api.get(
        "usuarios?filter=" +
          JSON.stringify({
            where: {
              email: form.value.email,
            },
          })
      );
      if(email.length) 
        return $q.notify({
          message:
            "Email already exists",
          color: "negative"
        });

      var validar = false;
      if(form.value.password.length < 8) {
        return $q.notify({
          message:
            "The password must have a minimum length of 8 characters",
          color: "negative"
        });
      }
      if (form.value.password) {
        var mayuscula = false;
        var minuscula = false;
        var numero = false;
        var caracter_raro = false;

        for (var i = 0; i < form.value.password.length; i++) {
          if (
            form.value.password.charCodeAt(i) >= 65 &&
            form.value.password.charCodeAt(i) <= 90
          ) {
            mayuscula = true;
          } else if (
            form.value.password.charCodeAt(i) >= 97 &&
            form.value.password.charCodeAt(i) <= 122
          ) {
            minuscula = true;
          } else if (
            form.value.password.charCodeAt(i) >= 48 &&
            form.value.password.charCodeAt(i) <= 57
          ) {
            numero = true;
          } else {
            caracter_raro = true;
          }
        }
        if (
          mayuscula == true &&
          minuscula == true &&
          caracter_raro == true &&
          numero == true
        ) {
          validar = true;
        }
      }
      if (form.value.password && !validar) {

        return $q.dialog({
          title: 'Attention',
          message: 'The Password must have: Uppercase, Lowercase, special character and numbers'
        }).onOk(() => {
          // console.log('OK')
        }).onCancel(() => {
          // console.log('Cancel')
        }).onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        })
      }
      if (form.value.password !== form.value.password2) {
        return $q.notify({
          message:
            "Both passwords must match",
          color: "negative"
        });
      }

      try {
        delete form.value.password2
        await api.post('/usuarios', {
          ...form.value
        });
        return $q.dialog({
          title: 'Note',
          message: 'Your account has been successfully created. Please log in',
          html: true,
          color: 'dark',
          persistent: true,
          ok: 'Next'
        }).onOk(() => {
          router.push('/login')
        }).onCancel(() => {
          // console.log('Cancel')
        }).onDismiss(() => {
          // console.log('I am triggered on both OK and Cancel')
        })
      } catch (error) {
        console.log(error, 'error')
        $q.notify({
          message: "Error creating account",
          color: "negative"
        });
      }

    }

    onMounted(async () => {
      return $q.dialog({
        title: 'Note',
        message: 'Phone: Enter a valid phone number<br> Email: Enter a valid email <br>The Password must have: Uppercase, Lowercase, special characters and numbers',
        html: true,
        color: 'dark'
      }).onOk(() => {
        // console.log('OK')
      }).onCancel(() => {
        // console.log('Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    });

    return {
      form,
      isPwd,
      isPwd2,
      countrys,
      icon_country,

      filterFn,
      Country,
      saveData
    };
  },
});
</script>
