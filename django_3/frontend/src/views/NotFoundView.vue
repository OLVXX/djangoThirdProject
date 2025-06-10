<template>
  <div class="not-found-view text-center py-5">
    <h1 class="display-1">404</h1>
    <h2 class="mb-4">Strona nie znaleziona</h2>
    <p class="lead mb-4">
      Przepraszamy, ale nie możemy znaleźć strony, której szukasz.
    </p>
    <router-link to="/" class="btn btn-primary">
      Wróć na stronę główną
    </router-link>
  </div>
</template>

<script>
export default {
  name: "NotFoundView",
};
</script>
