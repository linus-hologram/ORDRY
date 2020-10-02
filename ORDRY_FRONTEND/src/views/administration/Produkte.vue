<template>
  <div class="wrapping">
    <!-- filter determins if the beverage or food form is displayed -->
    <!-- the PID is getting passed on if the user intends to edit a product -->
    <inputForm :filter="filter" :pid="pid"></inputForm>
    <!-- We listen for the filter Change Event in order to display the correct form. -->
    <!-- We listen for the edit Modus Event in order to display the data of the product in the input form or not. -->
    <productList @filterChanged="onFilterChange" @edit="editModus"></productList>
  </div>
</template>

<script>
import inputForm from "../../components/administration/input-form.vue";
import productList from "../../components/administration/product-list.vue";

export default {
  name: "produkte",
  components: {
    inputForm,
    productList
  },
  data() {
    return {
      filter: "beverages",
      pid: null
    };
  },
  methods: {
    onFilterChange(data) {
      //gets called if the user selects something in the segmented control
      //the event gets passed up all the way from the segmente control component to this view
      this.filter = data;
    },
    editModus(pid) {
      //the pid is set if the user wants to edit a product (is either a BID or a FID)
      //this pid gets passend down to the inputForm
      this.pid = pid;
    }
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

.productList {
  margin: 1em 10px 0;
  flex-basis: 60%;
  flex-grow: 1;
}
</style>
