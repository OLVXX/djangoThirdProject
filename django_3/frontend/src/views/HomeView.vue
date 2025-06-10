<template>
  <div class="home">
    <div v-if="isLoggedIn">
      <h1 class="mb-4">Pulpit</h1>
      <div class="row">
        <div class="col-md-6">
          <div class="card mb-4">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Moje projekty</h5>
              <router-link to="/projects" class="btn btn-sm btn-primary"
                >Zobacz wszystkie</router-link
              >
            </div>
            <div class="card-body">
              <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Ładowanie...</span>
                </div>
              </div>
              <div v-else-if="projects.length === 0" class="text-center">
                <p>Nie masz jeszcze żadnych projektów.</p>
                <router-link to="/projects/new" class="btn btn-success">
                  Utwórz nowy projekt
                </router-link>
              </div>
              <ul v-else class="list-group list-group-flush">
                <li
                  v-for="project in projects.slice(0, 5)"
                  :key="project.id"
                  class="list-group-item d-flex justify-content-between align-items-center"
                >
                  <router-link
                    :to="`/projects/${project.id}`"
                    class="text-decoration-none"
                  >
                    {{ project.name }}
                  </router-link>
                  <span class="badge bg-primary rounded-pill"
                    >{{ project.tasks_count }} zadań</span
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card mb-4">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Moje zadania</h5>
              <router-link to="/tasks" class="btn btn-sm btn-primary"
                >Zobacz wszystkie</router-link
              >
            </div>
            <div class="card-body">
              <div v-if="loadingTasks" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Ładowanie...</span>
                </div>
              </div>
              <div v-else-if="tasks.length === 0" class="text-center">
                <p>Nie masz przypisanych zadań.</p>
              </div>
              <div v-else>
                <ul class="list-group list-group-flush">
                  <li
                    v-for="task in tasks.slice(0, 5)"
                    :key="task.id"
                    class="list-group-item"
                  >
                    <div
                      class="d-flex justify-content-between align-items-center"
                    >
                      <router-link
                        :to="`/tasks/${task.id}`"
                        class="text-decoration-none"
                      >
                        {{ task.title }}
                      </router-link>
                      <span :class="getStatusBadgeClass(task.status)">{{
                        getStatusLabel(task.status)
                      }}</span>
                    </div>
                    <div class="text-muted small">
                      Projekt: {{ getProjectName(task.project) }}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Przegląd zadań</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h3>{{ tasksByStatus.TODO || 0 }}</h3>
                      <p class="card-text">Do zrobienia</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h3>{{ tasksByStatus.IN_PROGRESS || 0 }}</h3>
                      <p class="card-text">W trakcie</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h3>{{ tasksByStatus.REVIEW || 0 }}</h3>
                      <p class="card-text">Przegląd</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 col-sm-6 mb-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <h3>{{ tasksByStatus.DONE || 0 }}</h3>
                      <p class="card-text">Zakończone</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="text-center mt-5">
        <h1 class="mb-4">Witaj w Systemie Zarządzania Zadaniami</h1>
        <p class="lead mb-4">
          Efektywnie zarządzaj projektami i zadaniami w jednym miejscu.
        </p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
          <router-link to="/login" class="btn btn-primary btn-lg px-4 gap-3"
            >Zaloguj się</router-link
          >
          <router-link
            to="/register"
            class="btn btn-outline-secondary btn-lg px-4"
            >Zarejestruj się</router-link
          >
        </div>
      </div>

      <div class="row mt-5">
        <div class="col-md-4">
          <div class="card mb-4 h-100">
            <div class="card-body text-center">
              <i class="bi bi-kanban display-4 text-primary mb-3"></i>
              <h3>Zarządzanie projektami</h3>
              <p>
                Twórz projekty i dziel je na zadania, nadawaj priorytety i
                terminy.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4 h-100">
            <div class="card-body text-center">
              <i class="bi bi-people display-4 text-primary mb-3"></i>
              <h3>Współpraca zespołowa</h3>
              <p>
                Zaproś członków zespołu do projektów i przydziel im zadania.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card mb-4 h-100">
            <div class="card-body text-center">
              <i class="bi bi-graph-up display-4 text-primary mb-3"></i>
              <h3>Śledzenie postępów</h3>
              <p>Monitoruj postępy prac i analizuj wydajność zespołu.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref } from "vue";
import { useStore } from "vuex";

export default {
  name: "HomeView",
  setup() {
    const store = useStore();
    const isLoggedIn = computed(() => store.getters["auth/isLoggedIn"]);

    const loading = ref(true);
    const loadingTasks = ref(true);
    const projects = ref([]);
    const tasks = ref([]);
    const allProjects = ref({}); // For project name lookup

    const fetchProjects = async () => {
      if (isLoggedIn.value) {
        loading.value = true;
        try {
          const response = await store.dispatch("projects/getProjects");
          projects.value = response.data;

          // Create lookup for project names
          response.data.forEach((project) => {
            allProjects.value[project.id] = project.name;
          });
        } catch (error) {
          console.error("Error fetching projects:", error);
        } finally {
          loading.value = false;
        }
      }
    };

    const fetchTasks = async () => {
      if (isLoggedIn.value) {
        loadingTasks.value = true;
        try {
          const response = await store.dispatch("tasks/getAssignedTasks");
          tasks.value = response.data;
        } catch (error) {
          console.error("Error fetching tasks:", error);
        } finally {
          loadingTasks.value = false;
        }
      }
    };

    const tasksByStatus = computed(() => {
      const result = {};
      if (tasks.value) {
        tasks.value.forEach((task) => {
          if (!result[task.status]) {
            result[task.status] = 0;
          }
          result[task.status]++;
        });
      }
      return result;
    });

    const getStatusBadgeClass = (status) => {
      const map = {
        TODO: "badge bg-secondary",
        IN_PROGRESS: "badge bg-primary",
        REVIEW: "badge bg-info",
        DONE: "badge bg-success",
      };
      return map[status] || "badge bg-secondary";
    };

    const getStatusLabel = (status) => {
      const map = {
        TODO: "Do zrobienia",
        IN_PROGRESS: "W trakcie",
        REVIEW: "Przegląd",
        DONE: "Zakończone",
      };
      return map[status] || status;
    };

    const getProjectName = (projectId) => {
      return allProjects.value[projectId] || "Nieznany projekt";
    };

    onMounted(() => {
      if (isLoggedIn.value) {
        fetchProjects();
        fetchTasks();
      }
    });

    return {
      isLoggedIn,
      loading,
      loadingTasks,
      projects,
      tasks,
      tasksByStatus,
      getStatusBadgeClass,
      getStatusLabel,
      getProjectName,
    };
  },
};
</script>
