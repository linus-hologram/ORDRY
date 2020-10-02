<template>
  <div class="wrapper">
    <h2>Wieviel Geld befindet sich aktuell in der Kassa?</h2>
    <p>
      Bitte tragen Sie den exakten Betrag exkl. Wechselgeld ein:
      <b class="desired-cash">
        SOLL-Kassastand:
        {{ desiredCash | toCurrency }}
      </b>
    </p>

    <cash-input v-model="actualCash"></cash-input>
    <div class="navigation">
      <button id="next-btn" class="btn-round" @click="next" :disabled="$v.$invalid">Weiter</button>
    </div>
  </div>
</template>
<script>
import cashInput from "../../components/closing/cash-input.vue";
import SessionService from "../../services/SessionService";

export default {
  name: "cash",
  components: { cashInput },
  data() {
    return {
      actualCash: "", //what the user enters
      desiredCash: 0 //today's real turnover
    };
  },

  validations() {
    const greaterThanZero = value => value > 0;
    return {
      actualCash: { minValue: greaterThanZero }
    };
  },
  methods: {
    next() {
      //Here you need to update the store value before we continue with the next step
      this.$store.commit("statistics/SET_TURNOVER", parseInt(this.actualCash, 10));
      this.$router.replace("nachricht");
      this.$emit("activated", 2);
    }
  },
  watch: {
    actualCash: function() {
      this.$v.actualCash.$touch;
    }
  },
  created() {
    //Here you need to put the value of the store into the 'actualCash' variable
    this.actualCash = this.$store.state.statistics.turnover;

    //Please put today's turnover into the 'desiredCash' variable:
    SessionService.getSoleTurover().then(result => {
      console.log("Cash:", result.data.turnover);
      this.desiredCash = result.data.turnover;
    });
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
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 1em;
}
.desired-cash {
  display: block;
  text-align: center;
  margin-top: 0.5em;
}
#next-btn,
#back-btn {
  width: 150px;
  height: 40px;
  margin: 0 10px;
}
</style>
