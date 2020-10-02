<template>
  <!-- header for the "Verwaltung" page with navigation -->
  <div id="verwaltung">
    <div class="container">
      <h1>VERWALTUNG</h1>
      <!-- not functional yet -->
      <button class="btn-round" id="logout" @click="logout">
        Abmelden
        <font-awesome-icon icon="sign-out-alt" />
      </button>
    </div>
    <navigation></navigation>

    <transition name="slide" mode="out-in">
      <!-- This router-view renders the sub-pages of "Verwaltung" (Statistik, Produkte, Accounts, Check-liste)-->
      <router-view class="view"></router-view>
    </transition>
  </div>
</template>

<script>
import navigation from "../../components/administration/navigation.vue";

export default {
  name: "app",
  components: {
    navigation
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch("user/clearCredentials");
    next();
  },
  methods: {
    logout() {
      this.$router.replace("../");
    }
  }
};
</script>

<style scoped>
#verwaltung {
  display: flex;
  flex-flow: column;
  height: 100%;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  flex: 0 1 auto;
  margin: 0 10px 0.5em;
}
</style>
