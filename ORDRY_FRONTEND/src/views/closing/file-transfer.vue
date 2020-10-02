<template>
  <div class="wrapper">
    <h2>Übermittlung der Daten</h2>
    <div v-if="finished" class="success">
      <font-awesome-icon icon="check" id="check" />
      <h2>Übermittlung erfolgreich!</h2>
      <p>Vielen Dank, auf Wiedersehen.</p>
    </div>
    <div v-else-if="error" class="success">
      <font-awesome-icon icon="heart-broken" id="check" />
      <h2>Übermittlung fehlgeschlagen!</h2>
      <p>
        Da ist wohl etwas schiefgelaufen ... Keine Sorge,
        <b>ORDRY</b> übernimmt ab jetzt für Sie.
      </p>
    </div>
    <div v-else class="loading">
      <div class="loader"></div>
      <h2>Tagesbericht wird erstellt ...</h2>
      <p>Bitte haben Sie einen Moment Geduld.</p>
    </div>
    <div class="navigation">
      <button
        id="next-btn"
        class="btn-round"
        v-show="finished||error"
        @click="$router.replace('check-liste'), $emit('activated', 4)"
      >Weiter</button>
    </div>
  </div>
</template>
<script>
export default {
  name: "message",
  data() {
    return {
      finished: false,
      error: false
    };
  },
  async created() {
    try {
      await this.$store.dispatch("statistics/generateStatistics");
      //console.log("Statistics generated successfully!");
      // handle success
      this.finished = true;
    } catch (error) {
      // handle error
      //console.error("Error generating the statistics!");
      this.error = true;
    }
  }
};
</script>
<style scoped>
h2 {
  margin-left: 2%;
  align-self: flex-start;
}
.success h2,
.loading h2 {
  margin-left: 0;
  align-self: center;
}
.wrapper {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  align-items: center;
  justify-content: space-between;
  overflow-y: auto;
}
.navigation {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1em;
}
#next-btn,
#back-btn {
  width: 150px;
  height: 40px;
  margin: 0 10px;
}
.success,
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: auto 0;
}
.success p,
.loading p {
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

.loader {
  border: 15px solid #f3f3f3; /* Light grey */
  border-top: 15px solid #14dcb4; /* Blue */
  border-radius: 50%;
  width: 150px;
  height: 150px;
  padding: 2em;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>