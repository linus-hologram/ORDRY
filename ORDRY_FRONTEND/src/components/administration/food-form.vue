<template>
  <!-- we need to prevent the default submit and use our own method in order to avoid an unwanted page reload-->
  <form v-on:submit.prevent="onSubmit">
    <h2>{{getTitel}}</h2>
    <label>
      Bezeichnung:
      <!-- type search creates a clearable input box in some browsers (not firefox) -->
      <!-- here vuelidate is used to directly validate the input and give the user feedback -->
      <input
        type="search"
        name="name"
        id="name"
        placeholder="Bezeichnung"
        v-model="$v.nameInput.$model"
        :class="{'error': $v.nameInput.$error, 'noerror': !$v.nameInput.$error}"
      />
      <span class="error-msg" v-if="$v.nameInput.$error">
        <p v-if="!$v.nameInput.required">Bitte geben sie eine Bezeichnung ein!</p>
      </span>
    </label>
    <label>
      Preis:
      <input
        type="search"
        name="price"
        id="price"
        placeholder="0,00 €"
        v-model="$v.priceInput.$model"
        class="input-elem"
        :class="{'error': $v.priceInput.$error, 'noerror': !$v.priceInput.$error}"
      />
      <span class="error-msg" v-if="$v.priceInput.$error">
        <p v-if="!$v.priceInput.required">Bitte geben Sie einen Preis ein!</p>
        <p v-if="!$v.priceInput.decimal">Der Preis muss eine gültige Zahl sein!</p>
        <p v-if="!$v.priceInput.minValue">Der Preis kann nicht negativ sein!</p>
      </span>
    </label>
    <button class="btn-round" id="save" :disabled="$v.$invalid">Produkt speichern</button>
  </form>
</template>
<script>
import { required, decimal, minValue } from "vuelidate/lib/validators";

import { mapState } from "vuex";

export default {
  name: "beverageForm",
  props: ["fid"], //the FID is passed on from the parent and used for edit mode
  data() {
    return {
      nameInput: "",
      priceInput: "",
      FID: null
    };
  },
  //declaration of the validation rules
  validations: {
    nameInput: {
      required
    },
    priceInput: {
      required,
      decimal,
      minValue: minValue(0)
    }
  },
  methods: {
    onSubmit() {
      //here the food needs to be created or updated.
      //It can be differentiated with the FID 'cos if there is no FID
      //this means that the edit event was not triggered and therefore we are not in edit-mode.
      let fprice = parseFloat(this.priceInput);

      if (this.FID == null) {
        //create new food
        this.$store
          .dispatch("food/createFood", {
            name: this.nameInput,
            price: fprice,
            available: true
          })
          .then(() => {
            this.resetForm();
          });
      } else {
        //update existing food
        this.$store
          .dispatch("food/updateFood", {
            name: this.nameInput,
            price: fprice,
            available: true,
            fid: this.FID
          })
          .then(() => {
            this.resetForm();
          });
      }
    },
    resetForm() {
      this.nameInput = null;
      this.priceInput = null;
      this.FID = null;
      this.$v.$reset(); //the validation needs to be resetted too, otherwise all errors are triggered
    }
  },
  computed: {
    //this needs to be a computed prop 'cos we need to detect if a prop value change in order to update the view
    getTitel: function() {
      return this.FID == null ? "Gericht hinzufügen" : "Gericht bearbeiten";
    },
    ...mapState({
      foodItems: state => state.food.foodItems
    })
  },
  watch: {
    //we need to watch the fid prop 'cos we need to detect if the value is changed in order to switch to edit-mode
    fid: function(newFid) {
      if (newFid) {
        console.log("Edit Food: ", newFid);
        this.FID = newFid;
        //Here you would call a method that gets the data of this particular food with the
        //new bid from the Vuex Store and fills the input form with name, sizeArray, category.
        const food = this.foodItems.find(f => {
          return f._id == newFid;
        });
        console.log(food);
        this.nameInput = food.name;
        this.priceInput = food.price;
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
form {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
}
label {
  display: flex;
  flex-wrap: wrap;
  width: 80%;
  margin-bottom: 2em;
}
#name,
#price {
  width: 100%;
  border-radius: 20px;
  font-size: 18px;
  border: 0.5px solid #000000;
  box-shadow: none;
  padding: 0.5em 1em;
  margin-top: 0.5em;
}
#name:focus,
#price:focus {
  border-color: #dc143c;
}
#save {
  width: 80%;
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
