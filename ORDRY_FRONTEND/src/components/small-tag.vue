<template>
  <!-- This is a small tag with customizable color styling and a dynamic text -->
  <div class="tag" :style="{ backgroundColor: customColor }">
    <p>{{status}}</p>
  </div>
</template>
<script>
export default {
  name: "small-tag",
  props: ["customColor", "status"]
};
</script>
<style scoped>
.tag {
  border-radius: 50%;
  display: grid;
  color: #ffffff;
  width: 2em;
  height: 2em;
}
.tag p {
  margin: auto;
  font-size: 14px;
}
</style>
