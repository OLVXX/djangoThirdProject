<template>
  <div class="register-view">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h2 class="text-center">Rejestracja</h2>
          </div>
          <div class="card-body">
            <div v-if="error" class="alert alert-danger" role="alert">
              {{ error }}
            </div>
            <form @submit.prevent="handleRegister">
              <div class="mb-3">
                <label for="username" class="form-label"
                  >Nazwa użytkownika</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="formData.username"
                  required
                  autocomplete="username"
                />
              </div>
              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="formData.email"
                  required
                  autocomplete="email"
                />
              </div>
              <div class="row mb-3">
                <div class="col">
                  <label for="first_name" class="form-label">Imię</label>
                  <input
                    type="text"
                    class="form-control"
                    id="first_name"
                    v-model="formData.first_name"
                    autocomplete="given-name"
                  />
                </div>
                <div class="col">
                  <label for="last_name" class="form-label">Nazwisko</label>
                  <input
                    type="text"
                    class="form-control"
                    id="last_name"
                    v-model="formData.last_name"
                    autocomplete="family-name"
                  />
                </div>
              </div>
              <div class="mb-3">
                <label for="password" class="form-label">Hasło</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="formData.password"
                  required
                  autocomplete="new-password"
                />
                <div class="form-text">
                  Hasło musi zawierać co najmniej 8 znaków.
                </div>
              </div>
              <div class="mb-3">
                <label for="password2" class="form-label">Powtórz hasło</label>
                <input
                  type="password"
                  class="form-control"
                  id="password2"
                  v-model="formData.password2"
                  required
                  autocomplete="new-password"
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
                  {{ loading ? "Rejestracja..." : "Zarejestruj się" }}
                </button>
              </div>
            </form>
            <div class="mt-3 text-center">
              <p>
                Masz już konto?
                <router-link to="/login">Zaloguj się</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export default {
  name: "RegisterView",
  setup() {
    const store = useStore();
    const router = useRouter();

    const formData = reactive({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      password: "",
      password2: "",
    });

    const loading = ref(false);
    const error = ref("");

    const validateForm = () => {
      if (formData.password.length < 8) {
        error.value = "Hasło musi mieć co najmniej 8 znaków";
        return false;
      }

      if (formData.password !== formData.password2) {
        error.value = "Hasła nie są identyczne";
        return false;
      }

      return true;
    };

    const handleRegister = async () => {
      if (!validateForm()) return;

      loading.value = true;
      error.value = "";

      try {
        const result = await store.dispatch("auth/register", {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          password: formData.password,
          password2: formData.password2,
        });

        if (result.success) {
          router.push("/");
        } else {
          if (typeof result.error === "string") {
            error.value = result.error;
          } else if (typeof result.error === "object") {
            // Format API errors
            const errorMessages = [];
            for (const field in result.error) {
              errorMessages.push(`${field}: ${result.error[field].join(" ")}`);
            }
            error.value = errorMessages.join("\n");
          } else {
            error.value = "Wystąpił błąd podczas rejestracji";
          }
        }
      } catch (e) {
        console.error("Registration error:", e);
        error.value =
          "Wystąpił problem podczas rejestracji. Spróbuj ponownie później.";
      } finally {
        loading.value = false;
      }
    };

    return {
      formData,
      loading,
      error,
      handleRegister,
    };
  },
};
</script>
