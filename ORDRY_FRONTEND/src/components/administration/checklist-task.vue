<template>
  <div class="task">
    <font-awesome-icon class="grip" icon="grip-horizontal" />
    <span class="text">{{text}}</span>
    <span class="actions">
      <icon-button id="edit" icon="edit" customColor="#828282" @click.native="$emit('edit')"></icon-button>
      <icon-button
        id="delete"
        icon="trash-alt"
        customColor="#FF9900"
        @click.native="deleteTask(task)"
      ></icon-button>
    </span>
  </div>
</template>

<script>
import iconButton from "../../components/icon-button.vue";

export default {
  name: "checklist-task",
  components: {
    iconButton
  },
  props: ["task"],
  data() {
    return {};
  },
  methods: {
    deleteTask(task) {
      this.$store.dispatch("checklist/deleteItem", task._id);
      console.log("Checklist-item deleted.");
    }
  },
  computed: {
    text: function() {
      var text = this.task.title.slice(0, 50);
      return this.task.title.length > 50 ? text + "..." : text;
    }
  }
};
</script>

<style scoped>
.task {
  display: flex;
  align-items: center;
  width: 90%;
  margin: 0 auto;
  height: 3.5em;
  border-bottom: 0.5px solid #000000;
}
.task .grip {
  margin: 0 20px;
}
.task .text {
  flex-grow: 1;
}
.actions {
  display: flex;
  flex-basis: 25%;
  justify-content: flex-end;
}
.actions button {
  margin: 0 5%;
}
</style>