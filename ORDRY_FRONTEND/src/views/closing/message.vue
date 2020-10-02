<template>
  <div class="wrapper">
    <h2>Möchten Sie eine Nachricht hinzufügen?</h2>
    <p>Ihre Nachricht wird gemeinsam mit dem Tagesbericht übermittelt.</p>
    <textarea v-model="message" placeholder="Ihre Nachricht .." class="message"></textarea>
    <div class="navigation">
      <button
        id="back-btn"
        class="btn-round"
        @click="$router.replace('kassastand'), $emit('activated', 1)"
      >Zurück</button>
      <div class="next">
        <button id="next-btn" class="btn-round" @click="next">Weiter</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "message",
  data() {
    return {
      message: ""
    };
  },
  methods: {
    next() {
      //Here you need to update the store value before we continue with the next step
      if (this.message == "") {
        this.message = "Keine Nachricht.";
      }
      this.$store.commit("statistics/SET_MESSAGE", this.message);
      this.$router.replace("übermittlung");
      this.$emit("activated", 3);
    }
  },
  created() {
    //Here you need to put the value of the store into the 'message' variable
    this.message = this.$store.state.statistics.message;
  }
};
</script>
<style scoped>
h2 {
  margin-left: 2%;
  align-self: flex-start;
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
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1em;
}
.next {
  align-self: flex-end;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap-reverse;
  justify-content: flex-end;
  align-items: center;
  width: 50%;
}
#next-btn,
#back-btn {
  width: 150px;
  height: 40px;
  margin: 0 10px;
}
.message {
  width: 75%;
  height: 15em;
  font-family: "Roboto";
  font-size: 16px;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 0.5em;
  resize: none;
}
</style>