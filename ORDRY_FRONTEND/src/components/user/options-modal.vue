<template>
  <!-- This popup is used to display different options for the product selection in the user section -->
  <transition appear name="slide">
    <div class="modal-mask">
      <div class="modal-wrapper" @click="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <div class="line" @click="$emit('close')"></div>
          </div>
          <div class="modal-body">
            <slot>default body</slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  name: "options-modal",
  methods: {
    closeModal() {
      //This method is used to close the modal if the user clicks outside the popup area
      this.event = function(event) {
        if (event.target.className == "modal-wrapper") {
          // close modal here
          this.$emit("close");
          document.body.removeEventListener("click", this.event);
        }
      }.bind(this);
      document.body.addEventListener("click", this.event);
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
  display: table;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: bottom;
}

.modal-container {
  min-height: 20em;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}

.modal-header .line {
  width: 60px;
  background-color: #828282;
  height: 4px;
  border-radius: 2px;
  margin: 0 auto;
}

.modal-body {
  margin: 20px 0;
}

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

.slide-leave-active,
.slide-enter-active {
  transition: 1s;
}
.slide-enter {
  transform: translate(0, 100%);
}
.slide-leave-to {
  transform: translate(0, 100%);
}
</style>
