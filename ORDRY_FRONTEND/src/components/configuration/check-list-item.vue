<template>
  <div class="check-list-item">
    <!-- if a checkbox gets triggered we need to inform the parent component with the check event in order to be able to validate if there are any unchecked boxes left -->
    <div class="task">
      <checkbox @checked="isDone = !isDone, $emit('check')"></checkbox>
      <span v-bind:class="{ done: isDone }">{{info}}</span>
    </div>
    <!-- The img is not displayed if the check-list task is already completed in order to save space -->
    <!-- We need a getImgUrl() method because the source can not be put together directly within the element because the statement would be executed after the DOM element is create, which would be too late -->
    <img v-if="img!=''" v-bind:class="{ noshow: isDone }" :src="getImgUrl(img)" />
  </div>
</template>

<script>
import checkbox from "../checkbox.vue";
export default {
  name: "check-list-item",
  components: { checkbox },
  //We need the text for the check-list task and the filename of the image
  props: ["info", "img"],
  data() {
    return {
      isDone: false
    };
  },
  methods: {
    getImgUrl(pic) {
      //This method creates the img url with the information from the DB
      return "http://localhost:3000/" + pic; // not sure if this is the right way to do it but yeah...
    }
  }
};
</script>

<style scoped>
.check-list-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
}

.check-list-item .task {
  display: flex;
}

.task span {
  padding: 0.25em 0;
  margin-bottom: 0.5em;
}
.checkbox-container {
  margin: 0 10px;
}

.done {
  opacity: 0.5;
  text-decoration: line-through;
}

img {
  width: 80%;
  height: auto;
  margin: 0 10%;
}

.noshow {
  display: none;
}
</style>
