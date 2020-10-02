<template>
  <div class="home">
    <div class="logo">
      <img alt="Ordry logo" src="../assets/ordry.png" />
      <h1>YOUR PERSONAL WAITER.</h1>
    </div>
    <!-- According to the section we navigate to a different version of the login screen -->
    <div class="links">
      <router-link class="link-round" to="/login/user">
        Gast
        <font-awesome-icon icon="arrow-right" />
      </router-link>
      <router-link v-if="!sessionActive" class="link-round" to="/login/pos">
        Konfiguration
        <font-awesome-icon icon="arrow-right" />
      </router-link>
      <router-link v-if="sessionActive" class="link-round" to="/kassa">
        Kassa
        <font-awesome-icon icon="arrow-right" />
      </router-link>
      <router-link class="link-round" to="/login/kitchen">
        Küche
        <font-awesome-icon icon="arrow-right" />
      </router-link>
      <router-link class="link-round" to="/login/admin">
        Verwaltung
        <font-awesome-icon icon="arrow-right" />
      </router-link>
    </div>
  </div>
</template>

<script>
import SessionService from "../services/SessionService";

export default {
  name: "home",
  data() {
    return {
      sessionActive: false
    };
  },
  async created() {
    const sessionActiveResponse = await SessionService.getServiceStatus();
    this.sessionActive = sessionActiveResponse.data.active;
  }
};
</script>
<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  flex-wrap: nowrap;
  padding: 10px;
  height: 100%;
}
.logo {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo img {
  width: 80%;
  max-width: 800px;
}
.home h1 {
  margin: 0;
  text-align: center;
  font-size: 4vw;
}
.links {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.link-round {
  color: white;
  margin: 0.5em 0;
  text-decoration: none;
  background-color: #dc143c;
  border-radius: 2em;
  cursor: pointer;
  padding: 1em 0;
  font-size: 18px;
  text-align: center;
  width: 100%;
  max-width: 550px;
  box-sizing: border-box;
}
.link-round:hover:enabled {
  filter: brightness(130%);
  box-shadow: none;
}
</style>
