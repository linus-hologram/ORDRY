<template>
  <!-- This is a popup for creating/editing menus -->
  <transition name="modal" appear>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Bestellung bearbeiten</h2>
            <!-- This button tells the parent component to hide the popup again -->
            <button class="btn-round" id="close" @click="$emit('close')">
              Abbrechen
              <font-awesome-icon icon="times" id="times" />
            </button>
          </div>
          <div class="modal-body">
            <button class="btn-round" @click="goToClosing">Tagesabschluss</button>
            <button class="btn-round" @click="goToConfig">Konfiguration</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import SessionService from "../../services/SessionService";

export default {
  name: "logout-modal",
  data() {
    return {};
  },
  methods: {
    goToConfig() {
      this.$router.replace({ name: "beverages" });
    },
    goToClosing() {
      SessionService.disableService();
      this.$router.replace({ name: "cash" });
    }
  }
};
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
  font-size: 20px;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 60%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  padding-top: 0.5em;
  margin-bottom: 1em;
}
.modal-header h2 {
  margin: 0;
}
.modal-header button {
  margin-left: auto;
}
.modal-body {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 0 10%;
}

#close {
  background-color: #828282;
}

.modal-body .btn-round {
  min-height: 3em;
  margin: 1em 0 1em;
  border-radius: 2em;
}

/*Transition*/
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
