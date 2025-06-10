import axios from "axios";

// Local storage keys
const TOKEN_KEY = "access_token";
const USER_KEY = "user";

// API URL
const API_URL = "http://localhost:8000/api/";

// Initial state
const initialState = {
  user: JSON.parse(localStorage.getItem(USER_KEY)) || null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  isLoggedIn: !!localStorage.getItem(TOKEN_KEY),
};

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Token ${initialState.token}`,
  },
});

export default {
  namespaced: true,
  state: initialState,
  getters: {
    isLoggedIn: (state) => state.isLoggedIn,
    user: (state) => state.user,
    token: (state) => state.token,
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TOKEN(state, token) {
      state.token = token;
      state.isLoggedIn = !!token;

      // Update axios headers
      if (token) {
        api.defaults.headers.common["Authorization"] = `Token ${token}`;
      } else {
        delete api.defaults.headers.common["Authorization"];
      }
    },
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post(`${API_URL}auth/login/`, credentials);
        const { user, token } = response.data;

        // Save to local storage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Update store
        commit("SET_USER", user);
        commit("SET_TOKEN", token);

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          error: error.response?.data || "Błąd logowania",
        };
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await axios.post(`${API_URL}auth/register/`, userData);
        const { user, token } = response.data;

        // Save to local storage
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        // Update store
        commit("SET_USER", user);
        commit("SET_TOKEN", token);

        return { success: true };
      } catch (error) {
        console.error("Registration error:", error);
        return {
          success: false,
          error: error.response?.data || "Błąd rejestracji",
        };
      }
    },
    logout({ commit }) {
      // Clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      // Reset store
      commit("SET_USER", null);
      commit("SET_TOKEN", null);
    },
    async updateProfile({ commit, state }, userData) {
      try {
        const response = await api.put(`users/${state.user.id}/`, userData);
        const updatedUser = response.data;

        // Update local storage
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

        // Update store
        commit("SET_USER", updatedUser);

        return { success: true };
      } catch (error) {
        console.error("Update profile error:", error);
        return {
          success: false,
          error: error.response?.data || "Błąd aktualizacji profilu",
        };
      }
    },
  },
};
