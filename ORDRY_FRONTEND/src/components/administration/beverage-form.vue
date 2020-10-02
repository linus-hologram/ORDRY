<template>
  <!-- we need to prevent the default submit and use our own method in order to avoid an unwanted page reload-->
  <form class="beverage-form" v-on:submit.prevent="onSubmit">
    <h2>{{ getTitel }}</h2>
    <label>
      Bezeichnung:
      <!-- type search creates a clearable input box in some browsers (not firefox) -->
      <!-- here vuelidate is used to directly validate the input and give the user feedback -->
      <input
        type="search"
        name="name"
        id="name-input"
        placeholder="Bezeichnung"
        v-model="$v.nameInput.$model"
        class="input-elem"
        :class="{'error': $v.nameInput.$error, 'noerror': !$v.nameInput.$error}"
      />
      <span class="error-msg" v-if="$v.nameInput.$error">
        <p v-if="!$v.nameInput.required">Bitte geben sie eine Bezeichnung ein!</p>
      </span>
    </label>
    <label>Größe &amp; Preis:</label>
    <div class="size-price">
      <!-- at the moment the size gets also displayed when creating a new product 'cos of my test data. -->
      <!-- most likely there is no adjustment needed there you just need to work with the data -->
      <sizeItem
        v-for="item in sizes"
        :key="item._id"
        :name="item.name"
        :price="item.price"
        @delete-size="deleteSize(item)"
      ></sizeItem>
      <!-- Here create a new size is triggered, which is very complecated and hopefully works without issues so I won't have to explain it in detail -->
      <div class="add-size" v-show="!adding" @click.stop="adding = true">
        <icon-button icon="plus" customColor="#dc143c"></icon-button>
        <p>Größe hinzufügen</p>
      </div>
      <div class="adding-size" v-show="adding">
        <input
          type="search"
          name="size"
          id="size-input"
          placeholder="Größe"
          v-model="$v.sizeInput.$model"
          class="input-elem"
          :class="{'error': $v.sizeInput.$error, 'noerror': !$v.sizeInput.$error}"
        />
        <input
          type="search"
          name="price"
          id="price-input"
          placeholder="0,00 €"
          v-model="$v.priceInput.$model"
          class="input-elem"
          :class="{'error': $v.priceInput.$error, 'noerror': !$v.priceInput.$error}"
        />
        <span class="error-msg" v-if="$v.addSizeGrp.$error">
          <p v-if="!$v.sizeInput.required">Bitte geben Sie eine Größenbezeichnung ein!</p>
          <p v-if="!$v.priceInput.required">Bitte geben Sie einen Preis ein!</p>
          <p v-if="!$v.priceInput.decimal">Der Preis muss eine gültige Zahl sein!</p>
          <p v-if="!$v.priceInput.minValue">Der Preis kann nicht negativ sein!</p>
        </span>
        <!-- This button is for adding a new size -->
        <button
          type="button"
          class="btn-round"
          id="btnSize"
          @click="adding = false, addSize()"
        >Hinzufügen</button>
      </div>
      <span class="error-msg" v-if="$v.sizes.$error">
        <p>Bitte legen Sie mindestens eine Größe an!</p>
      </span>
    </div>
    <label>
      Kategorie:
      <select
        v-model="$v.category.$model"
        id="category"
        class="input-elem"
        :class="{'error': $v.category.$error, 'noerror': !$v.category.$error}"
      >
        <!-- The first option is used as a placeholder -->
        <!-- The other options are created according to the data -->
        <option value="-1" disabled selected hidden id="placeholder">auswählen</option>
        <option v-for="item in categories" :key="item" :value="item">{{item}}</option>
      </select>
      <span class="error-msg" v-if="$v.category.$error">
        <p v-if="!$v.category.alpha">Bitte wählen Sie eine Kategorie aus!</p>
      </span>
    </label>
    <!--This button is for creating a new product/saving changes on an existing product -->
    <button
      class="btn-round"
      id="save"
      :disabled="$v.bvgGrp.$invalid"
      v-show="!adding"
    >Produkt speichern</button>
  </form>
</template>
<script>
import iconButton from "../icon-button.vue";
import sizeItem from "../administration/size-list-item.vue";

import { mapState } from "vuex";

import {
  required,
  decimal,
  minValue,
  minLength,
  alpha
} from "vuelidate/lib/validators";

export default {
  name: "beverageForm",
  components: {
    iconButton,
    sizeItem
  },
  props: ["bid"], //the BID is passed on from the parent and used for edit mode
  data() {
    return {
      nameInput: "",
      sizeInput: "",
      priceInput: null,
      categories: ["alkoholisch", "kalt", "warm"], //array for the beverage categories
      category: -1, //the selected category
      adding: false, //used for switching to adding size mode
      //this is test data I used and should later be replaced with data from Vuex/API
      //if there are no sizes (e.g. when creating an etirely new product) this array should be empty
      sizes: [],
      BID: null
    };
  },
  //declaration of the validation rules
  validations() {
    //I needed to differentiate between adding a new size or creating/saving a product
    //this is a suboptimal solution, but "it works"
    return {
      nameInput: {
        required
      },
      category: {
        alpha
      },
      sizeInput: {
        required
      },
      priceInput: {
        required,
        decimal,
        minValue: minValue(0)
      },
      //This is not needed if you want to check for the number of created sizes somewhere else - might be more convenient
      sizes: {
        required,
        minLength: minLength(1)
      },
      addSizeGrp: ["sizeInput", "priceInput"],
      bvgGrp: ["nameInput", "category", "sizes"]
    };
  },
  methods: {
    //we need to touch the validation of sizes because it does not use a v-model
    checkSizes() {
      this.$v.sizes.$touch();
    },
    onSubmit() {
      if (this.BID == null) {
        //create new beverage
        console.log(this.sizes);
        this.$store
          .dispatch("beverages/createBeverage", {
            name: this.nameInput,
            category: this.category,
            sizes: this.sizes
          })
          .then(() => {
            this.resetForm();
          });
      } else {
        //update existing beverage
        this.$store
          .dispatch("beverages/updateBeverage", {
            bid: this.BID,
            name: this.nameInput,
            category: this.category,
            sizes: this.sizes
          })
          .then(() => {
            this.resetForm();
          });
      }
    },
    addSize() {
      //Here the new size for the product is create
      if (!this.$v.addSizeGrp.$invalid) {
        this.sizes.push({
          name: this.sizeInput,
          price: parseFloat(this.priceInput),
          available: true
        });
      }
      //afterwards the adding form is reset
      this.resetAdding();
      //and checkSizes is called
      this.checkSizes();
      //Leaving this beautiful but completely uneccessary solution here for now - No, I'm not crying ..
      // if (this.bid == null) {
      //   this.sizes.push({
      //     name: this.sizeInput,
      //     price: this.priceInput,
      //     available: true
      //   });
      // } else {
      //   this.$store.dispatch("beverages/addBeverageSize", {
      //     bid: this.bid,
      //     size: {
      //       name: this.sizeInput,
      //       price: parseFloat(this.priceInput),
      //       available: true
      //     }
      //   });
      //}
    },
    deleteSize(size) {
      //Here a size is deleted
      this.sizes = this.sizes.filter(sizes => {
        return sizes != size;
      });

      //Its all there but serves no purpose ...
      // this.$store.dispatch("beverages/deleteBeverageSize", {
      //   bid: this.bid,
      //   sid: id
      // });
    },
    resetForm() {
      this.nameInput = null;
      this.sizeInput = null;
      this.sizes = [];
      this.priceInput = null;
      this.category = -1;
      this.adding = false;
      this.BID = null;
      this.$v.$reset(); //the validation needs to be resetted too, otherwise all errors are triggered
    },
    resetAdding() {
      this.sizeInput = null;
      this.priceInput = null;
      this.$v.addSizeGrp.$reset(); //the validation needs to be resetted too, otherwise all errors are triggered
    }
  },
  computed: {
    //this needs to be a computed prop 'cos we need to detect if a prop value change in order to update the view
    getTitel: function() {
      return this.BID == null ? "Getränk hinzufügen" : "Getränk bearbeiten";
    },
    ...mapState({
      beverageItems: state => state.beverages.beverageItems
    })
  },
  watch: {
    //we need to watch the bid prop 'cos we need to detect if the value is changed in order to switch to edit-mode
    bid: function(newBid) {
      if (newBid) {
        console.log("Edit beverage: ", newBid);
        console.log(this.beverageItems);
        this.BID = newBid;

        const bvg = this.beverageItems.find(b => {
          return b._id == newBid;
        });
        console.log(bvg);
        this.nameInput = bvg.name;
        this.sizes = bvg.sizes;
        this.category = bvg.category;
      }
    }
  }
};
</script>
<style scoped>
h2 {
  font-family: "Raleway";
  font-size: 30px;
  font-weight: 600;
}
.beverage-form {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}
.beverage-form > label,
.size-price {
  display: flex;
  flex-wrap: wrap;
  width: 80%;
  margin-bottom: 2em;
}
label:nth-child(3) {
  margin-bottom: 0;
}
.size-price {
  margin-top: 0.5em;
}
.input-elem {
  width: 100%;
  border-radius: 20px;
  font-size: 18px;
  box-shadow: none;
  padding: 0.5em 1em;
  margin-top: 0.5em;
}
.input-elem:focus {
  border-color: #dc143c;
}
#category {
  background: url(../../assets/caret-down-solid.svg) no-repeat right;
  -webkit-appearance: none;
  background-position-x: 90%;
}
#category {
  color: #828282;
  cursor: pointer;
}
#size-input {
  border-radius: 20px 0 0 20px;
  width: 60%;
}
#price-input {
  border-radius: 0 20px 20px 0;
  width: 40%;
}
.add-size {
  width: 100%;
  border: 1px dashed #000000;
  display: flex;
  align-items: center;
  padding: 0.5em 1em;
  border-radius: 30px;
  /*margin-top: 0.5em;*/
}
.add-size button {
  margin-right: 10px;
  height: 25px;
  width: 25px;
}
.add-size p {
  margin: 0;
}
.add-size:hover {
  color: #dc143c;
  border: 1px solid #dc143c;
}

.adding-size {
  display: flex;
  flex-wrap: wrap;
  justify-items: center;
  align-items: center;
}
/* TIL Flexbox-layout does NOT affect <button> or <input type="button"> - makes sense ...*/
#btnSize {
  margin: auto;
  margin-top: 1em;
}
#save {
  width: 80%;
}

.noerror {
  border: 0.5px solid #000000;
}
.error {
  border: 0.5px solid #dc143c;
}
.error-msg p {
  margin: 0 auto;
  color: #dc143c;
  font-size: 14px;
}
</style>
