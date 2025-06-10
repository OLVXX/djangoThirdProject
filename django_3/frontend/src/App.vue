<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link class="navbar-brand" to="/"
          >System Zarządzania Zadaniami</router-link
        >
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Pulpit</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/projects"
                >Projekty</router-link
              >
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/tasks">Zadania</router-link>
            </li>
          </ul>
          <div class="navbar-nav" v-if="!isLoggedIn">
            <router-link class="nav-link" to="/login">Logowanie</router-link>
            <router-link class="nav-link" to="/register"
              >Rejestracja</router-link
            >
          </div>
          <div class="navbar-nav" v-else>
            <span class="nav-link">Witaj, {{ username }}</span>
            <a class="nav-link" href="#" @click.prevent="logout">Wyloguj</a>
          </div>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <router-view />
    </div>

    <footer class="bg-light text-center text-lg-start mt-5">
      <div class="text-center p-3">© 2025 System Zarządzania Zadaniami</div>
    </footer>
  </div>
</template>

<script>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const store = useStore();
    const router = useRouter();

    const isLoggedIn = computed(() => store.state.auth.isLoggedIn);
    const username = computed(() => store.state.auth.user?.username || "");

    const logout = () => {
      store.dispatch("auth/logout");
      router.push("/login");
    };

    return {
      isLoggedIn,
      username,
      logout,
    };
  },
};
</script>

<style>
#app {
  font-family: "Roboto", sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

footer {
  margin-top: auto;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}
</style>
