<template>
  <!-- This is a customizable radio buttom component -->
  <label class="control control-radio">
    {{text}}
    <!-- We inform the parent about the changed checked status-->
    <input type="radio" name="radio" :value="value" @change="$emit('checked')" />
    <div class="control_indicator"></div>
  </label>
</template>
<script>
export default {
  name: "radio-button",
  //We need the label text and a value
  props: ["text", "value"]
};
</script>
<style scoped>
.control {
  display: block;
  position: relative;
  padding-left: 40px;
  margin-bottom: 5px;
  padding-top: 5px;
  cursor: pointer;
  font-size: 18px;
  width: 50%;
}
.control input {
  position: absolute;
  z-index: -1;
  opacity: 0;
}
.control_indicator {
  position: absolute;
  top: calc(50% - 12px);
  left: 0;
  height: 25px;
  width: 25px;
  background: #ffffff;
  border: 1px solid #000000;
}
.control-radio .control_indicator {
  border-radius: 50%;
}

.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
  background: #cccccc;
}

.control input:checked ~ .control_indicator {
  background: #ffffff;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
  background: #ffffff;
}
.control input:disabled ~ .control_indicator {
  background: #e6e6e6;
  opacity: 0.6;
  pointer-events: none;
}
.control_indicator:after {
  box-sizing: unset;
  content: "";
  position: absolute;
  display: none;
}
.control input:checked ~ .control_indicator:after {
  display: block;
}
.control-radio .control_indicator:after {
  left: 5px;
  top: 5px;
  height: 15px;
  width: 15px;
  border-radius: 50%;
  background: #828282;
}
.control-radio input:disabled ~ .control_indicator:after {
  background: #7b7b7b;
}
</style>