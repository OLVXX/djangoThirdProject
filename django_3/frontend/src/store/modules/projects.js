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
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
  },
  getters: {
    allProjects: (state) => state.projects,
    currentProject: (state) => state.currentProject,
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
    SET_PROJECTS(state, projects) {
      state.projects = projects;
    },
    SET_CURRENT_PROJECT(state, project) {
      state.currentProject = project;
    },
    ADD_PROJECT(state, project) {
      state.projects.unshift(project);
    },
    UPDATE_PROJECT(state, updatedProject) {
      const index = state.projects.findIndex((p) => p.id === updatedProject.id);
      if (index !== -1) {
        state.projects.splice(index, 1, updatedProject);
      }
      if (
        state.currentProject &&
        state.currentProject.id === updatedProject.id
      ) {
        state.currentProject = updatedProject;
      }
    },
    DELETE_PROJECT(state, projectId) {
      state.projects = state.projects.filter((p) => p.id !== projectId);
      if (state.currentProject && state.currentProject.id === projectId) {
        state.currentProject = null;
      }
    },
    ADD_MEMBER_TO_PROJECT(state, { projectId, member }) {
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.members.push(member);
      }
      if (state.currentProject && state.currentProject.id === projectId) {
        state.currentProject.members.push(member);
      }
    },
    REMOVE_MEMBER_FROM_PROJECT(state, { projectId, memberId }) {
      const project = state.projects.find((p) => p.id === projectId);
      if (project) {
        project.members = project.members.filter((m) => m.id !== memberId);
      }
      if (state.currentProject && state.currentProject.id === projectId) {
        state.currentProject.members = state.currentProject.members.filter(
          (m) => m.id !== memberId
        );
      }
    },
  },
  actions: {
    async getProjects({ commit, rootState }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.get(`${API_URL}projects/`, config);
        commit("SET_PROJECTS", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error fetching projects:", error);
        commit("SET_ERROR", error.response?.data || "Error fetching projects");
        return {
          success: false,
          error: error.response?.data || "Error fetching projects",
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async getProject({ commit, rootState }, projectId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.get(
          `${API_URL}projects/${projectId}/`,
          config
        );
        commit("SET_CURRENT_PROJECT", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error(`Error fetching project ${projectId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error fetching project ${projectId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error fetching project ${projectId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async createProject({ commit, rootState }, projectData) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.post(
          `${API_URL}projects/`,
          projectData,
          config
        );
        commit("ADD_PROJECT", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error("Error creating project:", error);
        commit("SET_ERROR", error.response?.data || "Error creating project");
        return {
          success: false,
          error: error.response?.data || "Error creating project",
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async updateProject({ commit, rootState }, { projectId, projectData }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        const response = await axios.put(
          `${API_URL}projects/${projectId}/`,
          projectData,
          config
        );
        commit("UPDATE_PROJECT", response.data);
        return { success: true, data: response.data };
      } catch (error) {
        console.error(`Error updating project ${projectId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error updating project ${projectId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error updating project ${projectId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async deleteProject({ commit, rootState }, projectId) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        await axios.delete(`${API_URL}projects/${projectId}/`, config);
        commit("DELETE_PROJECT", projectId);
        return { success: true };
      } catch (error) {
        console.error(`Error deleting project ${projectId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error deleting project ${projectId}`
        );
        return {
          success: false,
          error: error.response?.data || `Error deleting project ${projectId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async addMember({ commit, rootState }, { projectId, userId }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        await axios.post(
          `${API_URL}projects/${projectId}/add_member/`,
          { user_id: userId },
          config
        );
        // Refresh the project after adding member
        const projectResponse = await axios.get(
          `${API_URL}projects/${projectId}/`,
          config
        );
        commit("SET_CURRENT_PROJECT", projectResponse.data);
        return { success: true };
      } catch (error) {
        console.error(`Error adding member to project ${projectId}:`, error);
        commit(
          "SET_ERROR",
          error.response?.data || `Error adding member to project ${projectId}`
        );
        return {
          success: false,
          error:
            error.response?.data ||
            `Error adding member to project ${projectId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    async removeMember({ commit, rootState }, { projectId, userId }) {
      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const config = getAuthToken({ rootState });
        await axios.post(
          `${API_URL}projects/${projectId}/remove_member/`,
          { user_id: userId },
          config
        );
        // Refresh the project after removing member
        const projectResponse = await axios.get(
          `${API_URL}projects/${projectId}/`,
          config
        );
        commit("SET_CURRENT_PROJECT", projectResponse.data);
        return { success: true };
      } catch (error) {
        console.error(
          `Error removing member from project ${projectId}:`,
          error
        );
        commit(
          "SET_ERROR",
          error.response?.data ||
            `Error removing member from project ${projectId}`
        );
        return {
          success: false,
          error:
            error.response?.data ||
            `Error removing member from project ${projectId}`,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },
  },
};
