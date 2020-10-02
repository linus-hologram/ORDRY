<template>
  <!-- This is a status tag with customizable color styling and a dynamic text -->
  <div class="tag" :style="{ backgroundColor: customColor }">
    <p>{{status}}</p>
  </div>
</template>
<script>
export default {
  name: "status-tag",
  props: ["customColor", "status"]
};
</script>
<style scoped>
.tag {
  border-radius: 1em;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  width: 6em;
  height: 2em;
}
.tag p {
  font-size: 14px;
}
</style>
