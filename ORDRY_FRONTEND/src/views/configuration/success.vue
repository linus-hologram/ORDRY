<template>
  <div class="wrapper">
    <!-- This page is just used to inform the user about the successful configuration -->
    <div class="success">
      <font-awesome-icon icon="check" id="check" />
      <h2>Konfiguration erfolgreich!</h2>
      <p>Weiter zum Kassaterminal.</p>
    </div>
    <div class="navigation">
      <div class="next">
        <!-- This button forwards the user to the point of sale page -->
        <button id="next-btn" class="btn-round" @click="$router.replace('../kassa')">Fertig</button>
      </div>
    </div>
  </div>
</template>
<script>
import SessionService from "../../services/SessionService";

export default {
  name: "config-success",
  async created() {
    try {
      await SessionService.enableService();
    } catch (error) {
      console.error(error);
    }
  }
};
</script>
<style scoped>
h2 {
  margin-left: 2%;
}
.wrapper {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow-y: auto;
  align-items: stretch;
  justify-content: space-between;
}
.navigation {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1em;
}
.next {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  justify-content: flex-end;
  align-items: center;
  width: 30%;
}
#next-btn {
  width: 150px;
  height: 40px;
  margin-right: 10px;
}
#back-btn {
  width: 150px;
  height: 40px;
  margin-left: 10px;
}

.success {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: auto 0;
}
.success p {
  font-style: italic;
  color: #828282;
  margin: 0;
}
#check {
  width: 150px;
  height: 150px;
  border: solid 15px #14dcb4;
  padding: 2em;
  border-radius: 50%;
  color: #14dcb4;
}
</style>