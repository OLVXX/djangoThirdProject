<template>
  <div class="login-view">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h2 class="text-center">Logowanie</h2>
          </div>
          <div class="card-body">
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label"
                  >Nazwa użytkownika</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                  autocomplete="username"
                />
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Hasło</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                  autocomplete="current-password"
                />
              </div>
              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {{ loading ? "Logowanie..." : "Zaloguj się" }}
                </button>
              </div>
            </form>
            <div class="mt-3 text-center">
              <p>
                Nie masz jeszcze konta?
                <router-link to="/register">Zarejestruj się</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter, useRoute } from "vue-router";

export default {
  name: "LoginView",
  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();

    const username = ref("");
    const password = ref("");
    const loading = ref(false);
    const error = ref("");

    const handleLogin = async () => {
      loading.value = true;
      error.value = "";

      try {
        const result = await store.dispatch("auth/login", {
          username: username.value,
          password: password.value,
        });

        if (result.success) {
          // Redirect to the route they were trying to access, or to home
          const redirectPath = route.query.redirect || "/";
          router.push(redirectPath);
        } else {
          error.value =
            result.error || "Nieprawidłowa nazwa użytkownika lub hasło";
        }
      } catch (e) {
        console.error("Login error:", e);
        error.value =
          "Wystąpił problem podczas logowania. Spróbuj ponownie później.";
      } finally {
        loading.value = false;
      }
    };

    return {
      username,
      password,
      loading,
      error,
      handleLogin,
    };
  },
};
</script>
