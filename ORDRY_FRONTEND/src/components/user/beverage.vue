<template>
  <div class="beverage">
    <!-- We display the name of the beverage and its sizes-->
    <p class="name">{{ beverage.name }}</p>
    <p class="size">{{ sizeText | toCurrency }}</p>
    <!-- We show a plus button if there's only one bvg size 
    If there're more sizes we show an arrow icon-->
    <font-awesome-icon v-if="success" icon="check" id="check" />
    <icon-button
      id="plus"
      icon="plus"
      customColor="#dc143c"
      v-if="beverage.sizes.length == 1 && !success"
      @click.native="addSingle"
    ></icon-button>
    <icon-button
      id="more"
      icon="arrow-right"
      customColor="#B82442"
      v-else-if="beverage.sizes.length >= 1 && !success"
      @click.native="showSizes = true"
    ></icon-button>
    <!-- We darken the background when the user triggers the popup -->
    <div class="overlay" v-show="showSizes"></div>
    <!-- This popup is for displaying the different size options -->
    <options-modal
      v-if="showSizes"
      @close="(showSizes = false), (selectedSize = null)"
    >
      <h2>Größe wählen</h2>
      <fieldset>
        <!-- We listen for the checked event in order to validate the selection -->
        <span
          class="size-option"
          v-for="item in beverage.sizes"
          :key="item._id"
        >
          <radio
            :text="radioText(item.name)"
            @checked="changedSize(item._id)"
          ></radio>
          <p class="size">{{ item.price | toCurrency }}</p>
        </span>
      </fieldset>
      <!-- The selected size is added with this button 
      It is disabled if no size is selected-->
      <button
        class="btn-round"
        :disabled="selectedSize == null"
        @click="addBeverage(selectedSize), (showSizes = false)"
      >
        <font-awesome-icon class="icon" icon="plus" />Hinzufügen
      </button>
    </options-modal>
  </div>
</template>
<script>
import iconButton from "../../components/icon-button.vue";
import optionsModal from "../../components/user/options-modal.vue";
import radio from "../../components/radio.vue";

export default {
  name: "beverage",
  //We need a beverage object
  props: ["beverage"],
  components: { iconButton, optionsModal, radio },
  data() {
    return {
      //This shows/hides the sizes-popup
      showSizes: false,
      //This validates if a size is selected
      selectedSize: null,
      success: false
    };
  },
  computed: {
    sizeText: function() {
      //We create a string consisting of the different size names
      var text = "";

      var sizeNames = [];
      this.beverage.sizes.forEach(size => {
        sizeNames.push(size.name);
      });

      text = sizeNames.join(" • ");

      return text;
    }
  },
  methods: {
    addBeverage(sizeId) {
      var size = this.beverage.sizes.filter(function(size) {
        return size._id == sizeId;
      });
      var bvg = {
        _id: this.beverage._id,
        name: this.beverage.name,
        sizes: size
      };
      //We send a bvg object that only contains the selected size to the parent
      this.$emit("added", bvg);
    },
    addSingle() {
      this.success = true;
      var self = this;
      this.$emit("added", this.beverage);
      setTimeout(function() {
        self.success = false;
      }, 1000);
    },
    changedSize(sid) {
      //We adjust the selected size based on the radio buttons
      this.selectedSize = sid;
    },
    radioText(sizeText) {
      //This adds the beverage name to the size name for the size selection popup
      return this.beverage.name + " " + sizeText;
    }
  }
};
</script>
<style scoped>
.beverage {
  display: flex;
  align-items: center;
  width: 90%;
  min-height: 4em;
  padding: 0 5%;
  border-bottom: solid 0.5px #000000;
}
.beverage p {
  margin: 0;
}
.beverage #more,
.beverage #plus {
  margin-left: auto;
  font-size: 20px;
  height: 2em;
  width: 2em;
}
.beverage .name {
  flex-basis: 50%;
}
.beverage .size {
  font-family: "Raleway";
  color: #828282;
}
.beverage .overlay {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
}
.beverage .size-option {
  display: flex;
  margin-bottom: 1em;
  align-items: center;
  justify-content: space-between;
}
.beverage fieldset {
  border: none;
}
.beverage .btn-round {
  width: 80%;
  margin: 0 10%;
}
.beverage .btn-round .icon {
  margin-right: 10px;
}
#check {
  font-size: 2em;
  color: #14dcb4;
  margin-left: auto;
}
</style>
