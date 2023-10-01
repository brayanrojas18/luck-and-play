import { boot } from "quasar/wrappers";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
// const axiosApi = axios.create({
//   baseURL: "https://api.luckandplay.com/api/",
// });
const axiosApi = axios.create({ baseURL: "http://localhost:5021/api/" });

function proxyApiLB(axiosObject, method, url, data) {
  return new Promise((resolve, reject) => {
    let config = {
      method,
      url,
      data,
    };

    // const access_token = LocalStorage.getItem('access_token')
    // if (access_token && (!config.headers || !config.headers.Authorization)) {
    //   if (!config.headers) config.headers = {}
    //   config.headers.Authorization = 'Bearer ' + access_token
    // }

    axiosObject(config)
      .then((res) => resolve(res.data))
      .catch((error) => {
        reject(error);
      });
  });
}
function apiFunctionLB(axiosObject) {
  return {
    async get(url) {
      return proxyApiLB(axiosObject, "GET", url);
    },
    post(url, data) {
      return proxyApiLB(axiosObject, "POST", url, data);
    },
    put(url, data) {
      return proxyApiLB(axiosObject, "PUT", url, data);
    },
    patch(url, data) {
      return proxyApiLB(axiosObject, "PATCH", url, data);
    },
    delete(url) {
      return proxyApiLB(axiosObject, "DELETE", url);
    },
  };
}

const api = apiFunctionLB(axiosApi);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api, axios };
