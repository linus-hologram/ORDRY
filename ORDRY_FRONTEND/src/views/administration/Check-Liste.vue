<template>
  <div class="wrapping">
    <checklist-form class="checklist-form" :checklistitem="editTask"></checklist-form>
    <div class="checklist-items">
      <segmented-control @filterChanged="onFilterChange"></segmented-control>
      <span v-if="section==0">
        <!-- I guess that this v-model approach won't work with the mapped state from vuex 
        since the list is automatically edited as soon as a item is moved
        Maybe we can work with copies or something?-->
        <!-- They refer to vuex briefly in the official documentation. 
        However it is not directly applicable to our usecase 
        'cos we need to save the position as dedicated value and not through the index-->
        <!-- MAYBE I'M WRONG AND IT'S AN EASY SWITCH TO VUEX: https://github.com/SortableJS/Vue.Draggable#with-vuex -->
        <draggable
          v-model="beginningCLItems"
          ghost-class="ghost"
          handle=".grip"
          @start="dragging = true"
          @end="moved"
        >
          <checklist-task
            v-for="item in beginningCLItems"
            :key="item._id"
            :task="item"
            @edit="editTask = item"
          ></checklist-task>
        </draggable>
      </span>
      <span v-if="section==1">
        <draggable
          v-model="endingCLItems"
          ghost-class="ghost"
          handle=".grip"
          @start="dragging = true"
          @end="moved"
        >
          <checklist-task
            v-for="item in endingCLItems"
            :key="item.key"
            :task="item"
            @edit="editTask = item"
          ></checklist-task>
        </draggable>
      </span>
    </div>
  </div>
</template>

<script>
import checklistForm from "../../components/administration/checklist-form.vue";
import segmentedControl from "../../components/administration/segmented-control-cl.vue";
import checklistTask from "../../components/administration/checklist-task.vue";
import draggable from "vuedraggable";

export default {
  name: "checklist",
  components: { checklistForm, segmentedControl, checklistTask, draggable },
  data() {
    return {
      //This is used for the section filter
      section: 0,
      //This is used to tell the Form which item to edit
      editTask: null
    };
  },
  methods: {
    onFilterChange(data) {
      this.section = data;
    },
    moved: function() {
      //This function gets called everytime a item is moved
      this.dragging = false;
    }
  },
  computed: {
    beginningCLItems: {
      get() {
        return this.$store.state.checklist.checklistItems
          .filter(e => {
            return e.sectionId === 0;
          })
          .sort((a, b) => {
            if (a.position > b.position) return 1;
            if (a.position < b.position) return -1;
            if (a.position == b.position) return 0;
          });
      },
      set(value) {
        this.$store.dispatch("checklist/updateItemOrder", value);
      }
    },
    endingCLItems: {
      get() {
        return this.$store.state.checklist.checklistItems
          .filter(e => {
            return e.sectionId === 1;
          })
          .sort((a, b) => {
            if (a.position > b.position) return 1;
            if (a.position < b.position) return -1;
            if (a.position == b.position) return 0;
          });
      },
      set(value) {
        this.$store.dispatch("checklist/updateItemOrder", value);
      }
    }
  },
  created() {
    this.$store.dispatch("checklist/fetchAllChecklistItems");
  }
};
</script>
<style scoped>
.wrapping {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: wrap;
  flex: 1 1 auto;
  overflow-y: auto;
}

.checklist-items {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  margin: 1em 10px 0;
  flex-basis: 60%;
  flex-grow: 1;
}
.checklist-form {
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
  margin: 1em 10px 0;
  flex-basis: 30%;
  flex-grow: 1;
}
</style>
