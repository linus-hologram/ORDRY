<template>
  <!-- This is a popup for creating/editing menus -->
  <transition name="modal">
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <!-- The displayed titel is a computed property and depends on what the form is used for (creat or edit) -->
            <h2>{{getTitel}}</h2>
            <!-- This button tells the parent component to hide the popup again -->
            <button class="btn-round" id="close" @click="$emit('close')">
              Abbrechen
              <font-awesome-icon icon="times" id="times" />
            </button>
          </div>

          <!-- This is the input form for the menu -->
          <div class="modal-body">
            <label class="name">
              Bezeichnung:
              <input
                type="text"
                name="bezeichnung"
                placeholder="Tagesmenü"
                v-model.trim="$v.nameInput.$model"
                :class="{'error': $v.nameInput.$error, 'noerror': !$v.nameInput.$error}"
              />
              <span class="error-msg" v-if="$v.nameInput.$error">
                <p v-if="!$v.nameInput.required">Bitte geben sie eine Bezeichnung ein!</p>
              </span>
            </label>
            <label class="courses">
              Bestehend aus:
              <input
                type="text"
                name="gang1"
                placeholder="1. Gang"
                v-model.trim="$v.course1.$model"
                :class="{'error': $v.course1.$error, 'noerror': !$v.course1.$error}"
              />
              <input
                type="text"
                name="gang2"
                placeholder="2. Gang"
                v-model.trim="$v.course2.$model"
                :class="{'error': $v.course2.$error, 'noerror': !$v.course2.$error}"
              />
              <input
                type="text"
                name="gang3"
                placeholder="3. Gang"
                v-model.trim="$v.course3.$model"
                :class="{'error': $v.course3.$error, 'noerror': !$v.course3.$error}"
              />
            </label>
            <label class="prices">
              Preis:
              <input
                type="text"
                name="preis1"
                placeholder="€0.00"
                v-model.trim="$v.price1.$model"
                :class="{'error': $v.price1.$error, 'noerror': !$v.price1.$error}"
              />
              <input
                type="text"
                name="preis2"
                placeholder="€0.00"
                v-model.trim="$v.price2.$model"
                :class="{'error': $v.price2.$error, 'noerror': !$v.price2.$error}"
              />
              <input
                type="text"
                name="preis3"
                placeholder="€0.00"
                v-model.trim="$v.price3.$model"
                :class="{'error': $v.price3.$error, 'noerror': !$v.price3.$error}"
              />
            </label>
            <span class="error-msg" v-if="$v.courseGrp.$error">
              <p>Bitte überprüfen Sie Ihre Angaben!</p>
            </span>
            <!-- To support the user the total price is displayed. It is a computed property and consists of the price inputs -->
            <p class="total">Gesamtpreis: {{total | toCurrency}}</p>
            <!-- This button is only enabled if the form validation is successful -->
            <!-- It calls the saveMenu() method-->
            <button
              class="btn-round"
              id="save"
              :disabled="$v.$invalid"
              @click="saveMenu()"
            >Menü speichern</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import { required, decimal, minValue } from "vuelidate/lib/validators";

import { mapState } from "vuex";

export default {
  name: "menu-modal",
  props: ["mid", "available"], //We shouldn't have the same issues as in the administration section since the form reloads every time someone wants to create or edit a menu so this prop is set to null automatically after the process is done
  data() {
    return {
      //Input values
      nameInput: null,
      course1: null,
      course2: null,
      course3: null,
      price1: null,
      price2: null,
      price3: null,

      MID: null
    };
  },
  //Form-validation
  validations: {
    nameInput: { required },
    course1: { required },
    course2: { required },
    course3: { required },
    price1: {
      required,
      decimal,
      minValue: minValue(0)
    },
    price2: {
      required,
      decimal,
      minValue: minValue(0)
    },
    price3: {
      required,
      decimal,
      minValue: minValue(0)
    },
    courseGrp: ["course1", "price1", "course2", "price2", "course3", "price3"]
  },
  methods: {
    saveMenu() {
      let food = [
        { name: this.course1, price: parseFloat(this.price1) },
        { name: this.course2, price: parseFloat(this.price2) },
        { name: this.course3, price: parseFloat(this.price3) }
      ];
      if (this.mid == null) {
        //Create a new menu
        this.$store
          .dispatch("menu/createMenu", {
            name: this.nameInput,
            food: food,
            available: false
          })
          .then(() => {
            //Afterwards we tell the parent component to close the popup
            this.$emit("close");
          });
      } else {
        //Update the existing menu

        let currentMenuItem = this.menuItems.find(m => {
          return m._id === this.mid;
        });

        if (currentMenuItem) {
          currentMenuItem.name = this.nameInput;
          currentMenuItem.food[0].name = this.course1;
          currentMenuItem.food[0].price = parseFloat(this.price1);
          currentMenuItem.food[1].name = this.course2;
          currentMenuItem.food[1].price = parseFloat(this.price2);
          currentMenuItem.food[2].name = this.course3;
          currentMenuItem.food[2].price = parseFloat(this.price3);

          console.log("NEWLY UPDATED MENU ITEM", currentMenuItem);
          this.$store
            .dispatch("menu/updateMenuWithId", {
              mid: currentMenuItem._id,
              name: currentMenuItem.name,
              food: currentMenuItem.food,
              available: currentMenuItem.available
            })
            .then(() => {
              //Afterwards we tell the parent component to close the popup
              this.$emit("close");
            });
        }
      }
    }
  },
  computed: {
    //This is used to dynamically change the titel of the form
    getTitel: function() {
      return this.mid == null ? "Menü erstellen" : "Menü bearbeiten";
    },
    //This is used to display a total price for the menu
    total: function() {
      var total =
        parseFloat(this.price1) +
        parseFloat(this.price2) +
        parseFloat(this.price3);
      if (isNaN(total)) {
        return 0;
      } else {
        return total;
      }
    },
    ...mapState({
      menuItems: state => state.menu.menuItems
    })
  },
  watch: {
    //we need to watch the mid prop 'cos we need to detect if the value is changed in order to switch to edit-mode
    MID: function(newMid) {
      console.log("TRIGGERED");
      console.log("MID:::::::::::::::::::::::::", newMid);
      if (newMid) {
        console.log("Edit menu: ", newMid);
        //Here you need to fill the form with the current data
        const currentItem = this.menuItems.filter(m => {
          return m._id === newMid;
        })[0];

        const currentFoods = currentItem.food;

        this.nameInput = currentItem.name;
        this.course1 = currentFoods[0].name;
        this.price1 = currentFoods[0].price;
        this.course2 = currentFoods[1].name;
        this.price2 = currentFoods[1].price;
        this.course3 = currentFoods[2].name;
        this.price3 = currentFoods[2].price;
      }
    }
  },
  created() {
    this.MID = this.mid;
  }
};
</script>
<style scoped>
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
  font-size: 20px;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 60%;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
}
.modal-header h2 {
  flex: 2;
}
.modal-header button {
  justify-self: flex-end;
}
.modal-body {
  display: flex;
  flex-wrap: wrap;
  padding: 0 10%;
}

#close {
  background-color: #828282;
}
.name {
  display: block;
  flex-basis: 100%;
}
.name input {
  width: 70%;
}
.courses {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 70%;
}

.prices {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 20%;
  padding-left: 10%;
}
input[type="text"] {
  border-radius: 20px;
  font-size: 18px;
  box-shadow: none;
  padding: 0.25em 0.5em;
  border-color: #828282;
  margin: 0.5em 0;
}
input[type="text"]:focus {
  border-color: #dc143c;
}
.total {
  width: 100%;
  text-align: right;
}
#save {
  width: 100%;
  margin-bottom: 1em;
}

.noerror {
  border: 0.5px solid #000000;
}
.error {
  border: 0.5px solid #dc143c;
}
.error-msg p {
  margin: 0.25em auto;
  color: #dc143c;
  font-size: 14px;
}

/*Transition*/
.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
