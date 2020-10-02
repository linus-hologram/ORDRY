<template>
  <div class="report">
    <span>{{sessionDate}}</span>
    <button class="btn-round" :disabled="session.active" @click="openReport">Bericht anzeigen</button>
  </div>
</template>

<script>
export default {
  name: "report",
  //We need a user object with its id, username and role
  props: ["session"],
  data() {
    return {};
  },
  methods: {
    openReport() {
      //This does not work because the api requires authentication to open this url which
      var reportUrl =
        "http://localhost:3000/stats-pdfs/" + this.session.reportId;
      window.open(reportUrl, "_blank");
    }
  },
  computed: {
    sessionDate: function() {
      var date = new Date(this.session.date);
      var options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };

      return date.toLocaleDateString("de-DE", options);
    }
  }
};
</script>

<style scoped>
.report {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  margin: 0 auto;
  padding: 1em 0;
  border-bottom: 0.5px solid #000000;
  font-size: 18px;
}
</style>