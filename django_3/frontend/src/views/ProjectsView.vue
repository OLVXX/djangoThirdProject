<template>
  <div class="projects-view">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Projekty</h1>
      <router-link to="/projects/new" class="btn btn-primary">
        <i class="bi bi-plus"></i> Nowy projekt
      </router-link>
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Ładowanie...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger" role="alert">
      {{ error }}
    </div>

    <div v-else-if="projects.length === 0" class="text-center">
      <p class="lead mb-4">Nie masz jeszcze żadnych projektów.</p>
      <router-link to="/projects/new" class="btn btn-success">
        Utwórz pierwszy projekt
      </router-link>
    </div>

    <div v-else class="row">
      <div v-for="project in projects" :key="project.id" class="col-md-6 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="card-title">{{ project.name }}</h5>
            <p class="card-text text-muted">
              {{ project.description || "Brak opisu" }}
            </p>

            <div class="d-flex justify-content-between">
              <small class="text-muted">
                <i class="bi bi-calendar"></i>
                {{ formatDate(project.created_at) }}
              </small>
              <span class="badge bg-info">
                {{ project.tasks_count }} zadań
              </span>
            </div>

            <div class="mt-3">
              <h6>Członkowie zespołu:</h6>
              <div class="d-flex align-items-center mb-2">
                <span class="badge bg-secondary me-2"
                  >{{ project.owner.username }} (Właściciel)</span
                >
                <span
                  v-for="member in project.members"
                  :key="member.id"
                  class="badge bg-light text-dark me-2"
                >
                  {{ member.username }}
                </span>
                <span
                  v-if="project.members.length === 0"
                  class="text-muted small"
                >
                  Brak dodatkowych członków zespołu
                </span>
              </div>
            </div>
          </div>
          <div class="card-footer bg-transparent">
            <div class="d-flex justify-content-between">
              <router-link
                :to="`/projects/${project.id}`"
                class="btn btn-sm btn-outline-primary"
              >
                Szczegóły projektu
              </router-link>
              <router-link
                :to="`/tasks/new?project=${project.id}`"
                class="btn btn-sm btn-outline-success"
              >
                Dodaj zadanie
              </router-link>
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
  name: "ProjectsView",
  setup() {
    const store = useStore();
    const projects = computed(() => store.getters["projects/allProjects"]);
    const loading = computed(() => store.getters["projects/isLoading"]);
    const error = computed(() => store.getters["projects/error"]);

    // Format date helper
    const formatDate = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    };

    onMounted(async () => {
      await store.dispatch("projects/getProjects");
    });

    return {
      projects,
      loading,
      error,
      formatDate,
    };
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.3s;
}
.card:hover {
  transform: translateY(-5px);
}
</style>
