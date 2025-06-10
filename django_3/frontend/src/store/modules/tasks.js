import axios from "axios";

// API URL
const API_URL = "http://localhost:8000/api/";

// Get token from auth module
const getAuthToken = (state) => {
  const token = state.rootState.auth.token;
  return token ? { headers: { Authorization: `Token ${token}` } } : {};
};

export default {
  namespaced: true,
  state: {
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
  },
  getters: {
    allTasks: (state) => state.tasks,
    currentTask: (state) => state.currentTask,
    isLoading: (state) => state.loading,
    error: (state) => state.error,
  },
  mutations: {
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    SET_TASKS(state, tasks) {
      state.tasks = tasks;
    },
    SET_CURRENT_TASK(state, task) {
      state.currentTask = task;
    },
    ADD_TASK(state, task) {
      state.tasks.unshift(task);
    },
    UPDATE_TASK(state, updatedTask) {
      const index = state.tasks.findIndex((t) => t.id === updatedTask.id);
      if (index !== -1) {
        state.tasks.splice(index, 1, updatedTask);
      }
      if (state.currentTask && state.currentTask.id === updatedTask.id) {
        state.currentTask = updatedTask;
      }
    },
    DELETE_TASK(state, taskId) {
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
      if (state.currentTask && state.currentTask.id === taskId) {
        state.currentTask = null;
      }
    },
    ADD_COMMENT(state, { taskId, comment }) {
      if (state.currentTask && state.currentTask.id === taskId) {
        if (!state.currentTask.comments) {
          state.currentTask.comments = [];
        }
        state.currentTask.comments.push(comment);
      }
    },
  },
  actions: {
    async getTasks({ commit, rootState }, filters = {}) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });

        // Add filters to query params
        let url = `${API_URL}tasks/`;
        if (Object.keys(filters).length > 0) {
          const params = new URLSearchParams();
          for (const key in filters) {
            if (filters[key]) {
              params.append(key, filters[key]);
            }
          }
          url += `?${params.toString()}`;
        }

        const response = await axios.get(url, config);
        commit("SET_TASKS", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error fetching tasks:", error);
        commit("SET_ERROR", error.response?.data || "Error fetching tasks");
        return {
          success: false,
          error: error.response?.data || "Error fetching tasks",
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async getAssignedTasks({ commit, rootState }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const userId = rootState.auth.user?.id;

        if (!userId) {
          throw new Error("User not logged in");
        }

        const url = `${API_URL}tasks/?assigned_to=${userId}`;
        const response = await axios.get(url, config);
        commit("SET_TASKS", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error fetching assigned tasks:", error);
        commit(
          "SET_ERROR",
          error.response?.data || "Error fetching assigned tasks"
        );
        return {
          success: false,
          error: error.response?.data || "Error fetching assigned tasks",
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async getTask({ commit, rootState }, taskId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.get(`${API_URL}tasks/${taskId}/`, config);
        commit("SET_CURRENT_TASK", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error(`Error fetching task ${taskId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error fetching task ${taskId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error fetching task ${taskId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async createTask({ commit, rootState }, taskData) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.post(`${API_URL}tasks/`, taskData, config);
        commit("ADD_TASK", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error creating task:", error);
        commit("SET_ERROR", error.response?.data || "Error creating task");
        return {
          success: false,
          error: error.response?.data || "Error creating task",
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateTask({ commit, rootState }, { taskId, taskData }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.put(
          `${API_URL}tasks/${taskId}/`,
          taskData,
          config
        );
        commit("UPDATE_TASK", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error(`Error updating task ${taskId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error updating task ${taskId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error updating task ${taskId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteTask({ commit, rootState }, taskId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        await axios.delete(`${API_URL}tasks/${taskId}/`, config);
        commit("DELETE_TASK", taskId);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting task ${taskId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error deleting task ${taskId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error deleting task ${taskId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async assignTask({ commit, rootState }, { taskId, userId }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        await axios.post(
          `${API_URL}tasks/${taskId}/assign_task/`,
          { user_id: userId },
          config
        );

        // Refresh the task details
        const taskResponse = await axios.get(
          `${API_URL}tasks/${taskId}/`,
          config
        );
        commit("UPDATE_TASK", taskResponse.data);

        return { success: true, data: taskResponse.data };
      } catch (error) {
        console.error(`Error assigning task ${taskId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error assigning task ${taskId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error assigning task ${taskId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async getTaskComments({ commit, rootState }, taskId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.get(
          `${API_URL}comments/?task=${taskId}`,
          config
        );

        if (response.data) {
          // We're getting a task and then adding its comments separately here
          // First get the task
          const taskResponse = await axios.get(
            `${API_URL}tasks/${taskId}/`,
            config
          );
          const task = taskResponse.data;

          // Add comments to the task
          task.comments = response.data;

          // Update the current task in the store
          commit("SET_CURRENT_TASK", task);
        }

        return { success: true, data: response.data };
      } catch (error) {
        console.error(`Error fetching comments for task ${taskId}:`, error);
        commit("SET_ERROR", error.response?.data || `Error fetching comments`);
        return {
          success: false,
          error: error.response?.data || `Error fetching comments`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async addComment({ commit, rootState }, { taskId, text }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.post(
          `${API_URL}comments/`,
          { task: taskId, text },
          config
        );
        commit("ADD_COMMENT", { taskId, comment: response.data });

        return { success: true, data: response.data };
      } catch (error) {
        console.error(`Error adding comment to task ${taskId}:`, error);
        commit("SET_ERROR", error.response?.data || `Error adding comment`);
        return {
          success: false,
          error: error.response?.data || `Error adding comment`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
