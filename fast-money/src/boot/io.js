import { boot } from "quasar/wrappers";
import { io } from "socket.io-client";

const socket = io("https://api.luckandplay.com/", {
  transports: ["websocket"],
});
// const socket = io("http://localhost:5021/", { transports: ["websocket"] });

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async (/* { app, router, ... } */) => {
  // something to do
});

export { socket };
