<template>
  <div id="nav">
    <router-link to="/verwaltung/statistik" class="nav-item">Statistik</router-link>
    <router-link to="/verwaltung/produkte" class="nav-item">Produkte</router-link>
    <router-link to="/verwaltung/checkliste" class="nav-item">Check-Liste</router-link>
    <router-link to="/verwaltung/passwort" class="nav-item">Passwörter</router-link>
  </div>
</template>

<script>
export default {
  name: "navigation"
};
</script>

<style scoped>
a {
  color: #000000;
  text-decoration: none;
}
#nav {
  background-color: #ffffff;
  height: 4.5em;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
  font-size: 18px;
  font-weight: 500;
  margin: 0 10px;
}
#nav .nav-item {
  display: flex;
  width: 25%;

  text-align: center;
  align-items: center;
  justify-content: center;
  height: 2.5em;
}

.router-link-active {
  color: #dc143c;
  overflow: hidden;
  position: relative;
}
.router-link-active::after {
  content: "";
  display: inline-block;
  width: 50%;
  height: 100%;
  position: absolute;
  left: 25%;
  bottom: 0;
  border-bottom: 3px solid #dc143c;
}

/* needed to 'cheat' with a media query to get the complex flexbox layout working for smaller screens */
@media screen and (max-width: 500px) {
  #nav {
    height: auto;
    flex-direction: column;
  }
}
</style>
