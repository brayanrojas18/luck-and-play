const routes = [
  {
    path: "/login",
    component: () => import("layouts/Login.vue"),
  },
  {
    path: "/SingIn",
    component: () => import("layouts/SingIn.vue"),
  },
  {
    path: "/buy",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/IndexPage.vue") }],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
