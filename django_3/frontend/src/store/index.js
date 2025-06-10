import { createStore } from "vuex";
import auth from "./modules/auth";
import projects from "./modules/projects";
import tasks from "./modules/tasks";

export default createStore({
  modules: {
    auth,
    projects,
    tasks,
  },
});
