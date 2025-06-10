import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import store from "../store";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
    meta: { requiresGuest: true },
  },
  {
    path: "/projects",
    name: "projects",
    component: () => import("../views/ProjectsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/new",
    name: "project-create",
    component: () => import("../views/ProjectCreateView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/projects/:id",
    name: "project-detail",
    component: () => import("../views/ProjectDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/tasks",
    name: "tasks",
    component: () => import("../views/TasksView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/tasks/new",
    name: "task-create",
    component: () => import("../views/TaskCreateView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/tasks/:id",
    name: "task-detail",
    component: () => import("../views/TaskDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../views/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.state.auth.isLoggedIn;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: "login", query: { redirect: to.fullPath } });
  } else if (to.meta.requiresGuest && isLoggedIn) {
    next({ name: "home" });
  } else {
    next();
  }
});

export default router;
