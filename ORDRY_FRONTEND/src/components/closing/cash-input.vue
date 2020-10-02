<template>
  <input
    type="text"
    v-model="displayValue"
    @blur="isInputActive = false"
    @focus="isInputActive = true"
  />
</template>

<script>
export default {
  name: "cash-input",
  props: ["value"],
  data: function() {
    return {
      isInputActive: false
    };
  },
  computed: {
    displayValue: {
      get: function() {
        const formatter = new Intl.NumberFormat("de-AT", {
          style: "currency",
          currency: "EUR",
          minimumFractionDigits: 2
        });

        if (this.isInputActive) {
          // Cursor is inside the input field. unformat display value for user
          return this.value.toString();
        } else {
          // User is not modifying now. Format display value for user interface
          return formatter.format(this.value);
        }
      },
      set: function(modifiedValue) {
        let newValue = parseFloat(modifiedValue.replace("€", ""));
        // Ensure that it is not NaN
        if (isNaN(newValue)) {
          newValue = "";
        }
        // Note: we cannot set this.value as it is a "prop". It needs to be passed to parent component
        // $emit the event so that parent component gets it
        this.$emit("input", newValue);
      }
    }
  }
};
</script>

<style scoped>
input {
  border: none;
  font-size: 96px;
  font-weight: 500;
  width: 50%;
  text-align: center;
  color: #828282;
}
</style>