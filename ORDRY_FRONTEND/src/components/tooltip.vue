<template>
  <!-- This tooltip component can be used with different kinds of content -->
  <!-- The visibilty is define through a prop -->
  <span class="tooltip" :class="{visible, visible}">
    <slot></slot>
  </span>
</template>
<script>
export default {
  name: "tooltip",
  props: ["visible"]
};
</script>
<style scoped>
/*The current styling is customized for use in the point of sale section */
.tooltip {
  visibility: hidden;
  width: 60%;
  height: auto;
  background-color: #e4e4e4;
  text-align: center;
  padding: 0.5em 0;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* Position the tooltip */
  position: absolute;
  z-index: 1;
  top: 2.5em;
  left: 50%;
}
.tooltip:after {
  content: "";
  position: absolute;
  top: -19px;
  left: 82%;
  margin-left: -19px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent #e4e4e4 transparent;
}
.visible {
  visibility: visible;
}
</style>