<template>
  <div class="tasks-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Zadania</h1>
      <router-link to="/tasks/new" class="btn btn-primary">
        <i class="bi bi-plus"></i> Nowe zadanie
      </router-link>
    </div>

    <div class="card mb-4">
      <div class="card-header">
        <h5 class="mb-0">Filtry</h5>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label for="project-filter" class="form-label">Projekt</label>
            <select
              v-model="filters.project"
              class="form-select"
              id="project-filter"
            >
              <option value="">Wszystkie projekty</option>
              <option
                v-for="project in projects"
                :key="project.id"
                :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="status-filter" class="form-label">Status</label>
            <select
              v-model="filters.status"
              class="form-select"
              id="status-filter"
            >
              <option value="">Wszystkie statusy</option>
              <option value="TODO">Do zrobienia</option>
              <option value="IN_PROGRESS">W trakcie</option>
              <option value="REVIEW">Przegląd</option>
              <option value="DONE">Zakończone</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="priority-filter" class="form-label">Priorytet</label>
            <select
              v-model="filters.priority"
              class="form-select"
              id="priority-filter"
            >
              <option value="">Wszystkie priorytety</option>
              <option value="LOW">Niski</option>
              <option value="MEDIUM">Średni</option>
              <option value="HIGH">Wysoki</option>
              <option value="URGENT">Pilny</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="assigned-filter" class="form-label"
              >Przypisane do</label
            >
            <select
              v-model="filters.assigned_to"
              class="form-select"
              id="assigned-filter"
            >
              <option value="">Wszyscy</option>
              <option value="me">Moje zadania</option>
              <option value="unassigned">Nieprzypisane</option>
            </select>
          </div>
        </div>

        <div class="d-flex justify-content-end mt-3">
          <button @click="clearFilters" class="btn btn-outline-secondary me-2">
            Wyczyść filtry
          </button>
          <button @click="applyFilters" class="btn btn-primary">
            Zastosuj filtry
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="tasks.length === 0" class="text-center">
      <p class="lead mb-4">
        Nie znaleziono żadnych zadań pasujących do wybranych filtrów.
      </p>
      <button @click="clearFilters" class="btn btn-outline-secondary me-2">
        Wyczyść filtry
      </button>
      <router-link to="/tasks/new" class="btn btn-success">
        Utwórz nowe zadanie
      </router-link>
    </div>

    <div v-else>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Tytuł</th>
              <th>Projekt</th>
              <th>Status</th>
              <th>Priorytet</th>
              <th>Termin</th>
              <th>Przypisany do</th>
              <th>Akcje</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.id">
              <td>{{ task.title }}</td>
              <td>{{ getProjectName(task.project) }}</td>
              <td>
                <span :class="getStatusBadgeClass(task.status)">
                  {{ getStatusLabel(task.status) }}
                </span>
              </td>
              <td>
                <span :class="getPriorityBadgeClass(task.priority)">
                  {{ getPriorityLabel(task.priority) }}
                </span>
              </td>
              <td>{{ formatDate(task.due_date) || "Brak" }}</td>
              <td>
                {{
                  task.assigned_to ? task.assigned_to.username : "Nieprzypisane"
                }}
              </td>
              <td>
                <router-link
                  :to="`/tasks/${task.id}`"
                  class="btn btn-sm btn-outline-primary me-1"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, reactive } from "vue";
import { useStore } from "vuex";

export default {
  name: "TasksView",
  setup() {
    const store = useStore();
    const tasks = computed(() => store.getters["tasks/allTasks"]);
    const loading = computed(() => store.getters["tasks/isLoading"]);
    const error = computed(() => store.getters["tasks/error"]);
    const projects = computed(() => store.getters["projects/allProjects"]);
    const currentUser = computed(() => store.getters["auth/user"]);

    // Create a map of project IDs to project names for easy lookup
    const projectMap = ref({});

    // Filters
    const filters = reactive({
      project: "",
      status: "",
      priority: "",
      assigned_to: "",
    });

    // Helper functions
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    };

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

    const getPriorityBadgeClass = (priority) => {
      const map = {
        LOW: "badge bg-secondary",
        MEDIUM: "badge bg-info",
        HIGH: "badge bg-warning",
        URGENT: "badge bg-danger",
      };
      return map[priority] || "badge bg-secondary";
    };

    const getPriorityLabel = (priority) => {
      const map = {
        LOW: "Niski",
        MEDIUM: "Średni",
        HIGH: "Wysoki",
        URGENT: "Pilny",
      };
      return map[priority] || priority;
    };

    const getProjectName = (projectId) => {
      return projectMap.value[projectId] || "Nieznany projekt";
    };

    const updateProjectMap = () => {
      const map = {};
      projects.value.forEach((project) => {
        map[project.id] = project.name;
      });
      projectMap.value = map;
    };

    const clearFilters = () => {
      filters.project = "";
      filters.status = "";
      filters.priority = "";
      filters.assigned_to = "";
      fetchTasks();
    };

    const applyFilters = () => {
      fetchTasks();
    };

    const fetchTasks = async () => {
      const apiFilters = { ...filters };

      // Handle special cases for assigned_to filter
      if (apiFilters.assigned_to === "me" && currentUser.value) {
        apiFilters.assigned_to = currentUser.value.id;
      } else if (apiFilters.assigned_to === "unassigned") {
        apiFilters.assigned_to = "null"; // Backend will handle this
      }

      await store.dispatch("tasks/getTasks", apiFilters);
    };

    onMounted(async () => {
      // Fetch projects first to build the project map
      await store.dispatch("projects/getProjects");
      updateProjectMap();

      // Then fetch tasks
      await fetchTasks();
    });

    return {
      tasks,
      loading,
      error,
      projects,
      filters,
      formatDate,
      getStatusBadgeClass,
      getStatusLabel,
      getPriorityBadgeClass,
      getPriorityLabel,
      getProjectName,
      clearFilters,
      applyFilters,
    };
  },
};
</script>
