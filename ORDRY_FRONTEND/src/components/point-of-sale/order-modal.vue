<template>
  <!-- This is a popup for creating/editing menus -->
  <transition name="modal" appear>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <div class="modal-header">
            <h2>Bestellung bearbeiten</h2>
            <!-- This button tells the parent component to hide the popup again -->
            <button class="btn-round" id="close" @click="$emit('close')">
              Abbrechen
              <font-awesome-icon icon="times" id="times" />
            </button>
          </div>
          <p class="guest">{{ forename + " " + surname }}</p>

          <div class="modal-body">
            <div class="product-list">
              <div class="product" v-for="item in products" :key="item.id">
                <!-- With this button we can delete an item from the bill -->
                <!-- This is only possible if the item is already finished and not displayed in the kitchen -->
                <!-- because this would lead to confusion on the kitchen screen and it should not be possible to communicate with the kitchen this way-->
                <icon-button
                  id="remove"
                  icon="minus"
                  customColor="#000000"
                  :disabled="!item.finished"
                  @click.native="removeProduct(item)"
                ></icon-button>
                <p v-bind:class="{ unfinished: !item.finished }">
                  {{ getName(item) }}
                </p>
                <p class="price">{{ item.price | toCurrency }}</p>
              </div>
              <div
                class="product"
                v-for="item in unsavedProducts"
                :key="item.id"
              >
                <icon-button
                  id="remove"
                  icon="minus"
                  customColor="#000000"
                  @click.native="removeUnsavedProduct(item)"
                ></icon-button>
                <p>{{ getName(item) }}</p>
                <p class="price">{{ item.price | toCurrency }}</p>
              </div>
            </div>
            <!-- If the user clicks this area a new popup is display to add a new product to the bill -->
            <!-- Again no communication with the kitchen should be possible so added products are already prepared on default -->
            <div class="add-product" @click="showAddProductModal = true">
              <icon-button icon="plus" customColor="#dc143c"></icon-button>
              <p>Produkt hinzufügen*</p>
            </div>
            <!-- We need to listen if the user adds a product to the order so that we can add it to our local product array -->
            <add-product-modal
              :forename="forename"
              :surname="surname"
              v-show="showAddProductModal"
              @close="showAddProductModal = false"
              @added-bvg="addBeverage"
              @added-food="addFood"
              @added-menu="addMenu"
            ></add-product-modal>
            <button class="btn-round" id="save" @click="saveChanges(products)">
              Änderungen speichern
            </button>
            <p class="info">
              * Diese Maske ist nur für die Korrektur von
              <b>Fakturierungsfehlern</b> zu verwenden. <br />Keine
              Kommunikation mit der Küche mögich!
            </p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import iconButton from "../icon-button.vue";
import addProductModal from "../point-of-sale/add-product-modal.vue";

import { mapState } from "vuex";

export default {
  name: "order-modal",
  //We need the orderID, the guests fore- and surename and the ordered items
  props: ["oid", "forename", "surname", "items"],
  components: { iconButton, addProductModal },
  data() {
    return {
      //We use this local array to save changes on the order while the user is editing the order
      //This changes are only communicated to the DB if the user hits the save changes button in the end
      //If the user decides to cancel the edit process the real order in the DB has not been touched
      products: [],
      newProducts: {
        menus: [],
        food: [],
        beverages: []
      }, // the products that are newly added
      removeProducts: {
        // the products that should be removed - no objects needed, just the food/beverage/menu -orderIDs
        menus: [],
        food: [],
        beverages: []
      },
      updateAmountProducts: {
        menus: [],
        food: [],
        beverages: []
      },
      //This defines if the popup for adding a new product is displayed or not
      showAddProductModal: false
    };
  },
  methods: {
    generateUUID() {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
        c
      ) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    getName(item) {
      //This method puts the displayed description together

      var name;
      switch (item.type) {
        case "unsaved-beverage":
          name = item.amount + " x ";
          var currentBeverage = this.beverageItems.find(bvg => {
            return bvg._id === item.beverageId;
          });
          name += currentBeverage.name + " ";
          name += currentBeverage.sizes.find(s => {
            return s._id === item.sizeId;
          }).name;

          return name;
        case "unsaved-food":
          name = item.amount + " x ";
          name += this.foodItems.find(f => {
            return f._id === item.foodId;
          }).name;
          return name;

        case "unsaved-menu":
          name = item.amount + " x ";

          console.log(item);

          var currentMenu = this.menuItems.find(m => {
            return m._id === item.menuId;
          });

          console.log(currentMenu);

          name += currentMenu.name + " (";

          var itemIds = item.items.map(i => {
            return i.itemId;
          });

          var itemNames = [];
          currentMenu.food.forEach(f => {
            if (itemIds.includes(f._id)) {
              itemNames.push(f.name);
            }
          });

          name += itemNames.join(", ") + ")";

          return name;
        default:
          name = item.amount + " x " + item.name;
          if (item.items != null) {
            name += // I have to map here because the items array contains objects - necessary for grouping shit together
              " (" +
              item.items
                .map(i => {
                  return i.name;
                })
                .join(", ") +
              ")";
          }
          return name;
      }
    },
    saveChanges() {
      // HERE I will dispatch the vuex store action/s that update the database.
      // MARK: - I do not need any input parameter. You can remove it as I will directly work with the variables needed

      this.$store.dispatch("orders/saveOrderChanges", {
        orderId: this.oid,
        newProducts: this.newProducts,
        removeProducts: this.removeProducts,
        updateAmountProducts: this.updateAmountProducts
      });
      //Afterwards the popup closes
      this.$emit("close");
    },
    removeProduct(product) {
      //Here we reduce the amount/remove the product from the local array
      //You probably need to change this if you are working with a different data structure
      if (product.amount - 1 >= 1) {
        product.amount -= 1;
        switch (product.type) {
          case "menu":
            this.removeProducts.menus.push(product.menuOrderIds[0]);
            product.menuOrderIds.shift(); // remove the product from the current menuOrderIds Array
            break;
          case "food":
            var currentFoodOrder = this.updateAmountProducts.food.find(f => {
              return f.foodOrderId === product.foodOrderId;
            });

            if (currentFoodOrder) {
              currentFoodOrder.amount = product.amount;
            } else
              this.updateAmountProducts.food.push({
                foodOrderId: product.foodOrderId,
                amount: product.amount
              });
            break;
          case "beverage":
            this.updateAmountProducts.beverages.push({
              beverageOrderId: product.beverageOrderId,
              amount: product.amount
            });
            break;
          default:
            console.log("The Product Type did not match any cases!");
            break;
        }
      } else {
        this.products = this.products.filter(p => {
          return p != product;
        });

        switch (product.type) {
          case "menu":
            this.removeProducts.menus.push(product.menuOrderIds[0]);
            break;
          case "food":
            this.updateAmountProducts.food = this.updateAmountProducts.food.filter(
              f => {
                return f.foodOrderId !== product.foodOrderId;
              }
            );
            this.removeProducts.food.push(product.foodOrderId);
            break;
          case "beverage":
            this.updateAmountProducts.beverages = this.updateAmountProducts.beverages.filter(
              f => {
                return f.beverageOrderId !== product.beverageOrderId;
              }
            );
            this.removeProducts.beverages.push(product.beverageOrderId);
            break;
          default:
            console.log("The Product Type did not match any cases!");
            break;
        }
      }
      console.log(this.removeProducts, this.updateAmountProducts);
    },
    removeUnsavedProduct(item) {
      // this method removes a unsaved item or decreases its amount value.
      // Please implement the template that way, that NEW PRODUCTS have their own array, matching the schema of the 'newProducts'
      // document above. In order to see how the items of the single branches (food, beverages, menus) are structured, take a look
      // at the addFood, addBeverage & addMenu function. In there you see the schema of the items.
      // As the items don't have a beverage-, food-, or menuOrderId (their not in the database yet),
      // every item has a freshly generated UUID stored in a 'id' field. This id allows me to completely remove a product from the
      // 'newProducts' document
      switch (item.type) {
        case "unsaved-food": // type is necessary to detect what kind of product it is
          if (item.amount - 1 >= 1) {
            // decrease amount
            item.price -= item.price / item.amount;
            item.amount--;
          } else
            this.newProducts.food = this.newProducts.food.filter(f => {
              // or remove it
              return f.id !== item.id;
            });
          break;
        case "unsaved-beverage":
          if (item.amount - 1 >= 1) {
            // decrease amount
            item.price -= item.price / item.amount;
            item.amount--;
          } else
            this.newProducts.beverages = this.newProducts.beverages.filter(
              // or remove it
              b => {
                return b.id !== item.id;
              }
            );
          break;
        case "unsaved-menu":
          this.newProducts.menus = this.newProducts.menus.filter(m => {
            // remove the menu as menus don't have a amount field in the database
            return m.id !== item.id;
          });
          break;
        default:
          console.log(
            "The type of the unsaved product did not match any cases!"
          );
          break;
      }
    },
    addBeverage(ids) {
      // this method stores a new beverage into the 'newProducts' document if it does not exist already, else the amount is increased

      let currentBeverage = this.newProducts.beverages.find(b => {
        return b.beverageId === ids.bid && b.sizeId === ids.sid;
      });

      if (currentBeverage) {
        currentBeverage.price += currentBeverage.price / currentBeverage.amount;
        currentBeverage.amount++;
      } else {
        let beverageItem = this.beverageItems.find(b => {
          return b._id === ids.bid;
        });

        if (beverageItem) {
          let sizeItem = beverageItem.sizes.find(s => {
            return s._id === ids.sid;
          });

          if (sizeItem) {
            this.newProducts.beverages.push({
              // MARK: - structure of the new beverage, keep it in mind while refactoring the template
              beverageId: ids.bid,
              sizeId: ids.sid,
              amount: 1,
              price: sizeItem.price,
              id: this.generateUUID(),
              type: "unsaved-beverage"
            });
          }
        }
      }
    },
    addFood(foodID) {
      // this method stores a new food into the 'newProducts' document if it does not exist already, else the amount is increased

      let currentFood = this.newProducts.food.find(f => {
        return f.foodId === foodID;
      });

      if (currentFood) {
        currentFood.price += currentFood.price / currentFood.amount;
        currentFood.amount++;
      } else {
        let foodItem = this.foodItems.find(f => {
          return f._id === foodID;
        });
        if (foodItem) {
          this.newProducts.food.push({
            // MARK: - structure of the new food, keep it in mind while refactoring the template
            foodId: foodID,
            amount: 1,
            price: foodItem.price,
            id: this.generateUUID(),
            type: "unsaved-food"
          });
        }
      }
    },
    addMenu(menu) {
      // this method stores a new menu into the 'newProducts' document. It does not matter if the same combination already exists,
      // each ordered menu has its own document in the database.

      // MARK: For readability reasons, I will probably add a computed property that 'groups' same new menus and assigns them a amount field.
      let menuItems = [];

      menu.items.forEach(m => {
        menuItems.push({ itemId: m });
      });

      let price = 0;
      let currentMenu = this.menuItems.find(m => {
        return m._id === menu.id;
      });

      currentMenu.food.map(f => {
        if (menu.items.includes(f._id)) {
          price += f.price;
        }
      });

      this.newProducts.menus.push({
        menuId: menu.id,
        items: menuItems,
        id: this.generateUUID(),
        type: "unsaved-menu",
        amount: 1,
        price: price
      });
    }
  },
  computed: {
    unsavedProducts() {
      // this is the property you should use in the for loop!
      // MARK: name & price are still missing but will be added. Just know that every item will have a 'name' as well as a 'price' field

      let products = [];

      this.newProducts.food.map(f => {
        products.push(f);
      });

      this.newProducts.beverages.map(b => {
        products.push(b);
      });

      this.newProducts.menus.map(m => {
        products.push(m);
      });

      return products;
    },
    ...mapState({
      menuItems: state => state.menu.menuItems,
      foodItems: state => state.food.foodItems,
      beverageItems: state => state.beverages.beverageItems
    })
  },
  created() {
    //When the component is created, we clone the currently ordered products in a fresh local array without reactiveness
    //this array is then update by the user with the interface
    //the actual order is only updated if the user hits the save changes button
    this.products = JSON.parse(JSON.stringify(this.items));
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
  padding-top: 0.5em;
}
.modal-header h2 {
  margin: 0;
}
.modal-header button {
  margin-left: auto;
}
.modal-body {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  padding: 0 10%;
}
.modal-body .product-list {
  max-height: 9em;
  overflow-y: auto;
}
p {
  margin: 0.5em 0;
}

#close {
  background-color: #828282;
}
#save {
  width: 80%;
  margin: 1em 0;
  align-self: center;
}
.guest {
  font-family: "Raleway";
  font-size: 24px;
  font-weight: 500;
  color: #14dcb4;
  margin-bottom: 1em;
}
.product {
  display: flex;
  align-items: center;
  padding: 0 14px;
}
.price {
  margin-left: auto;
}
.product .unfinished {
  color: #ff8300;
}
.product #remove {
  height: 25px;
  width: 25px;
  margin-right: 10px;
}
.add-product {
  width: 100%;
  border: 1px dashed #000000;
  display: flex;
  align-items: center;
  padding: 0.5em 1em;
  margin: 0.5em 0;
  border-radius: 30px;
  color: #828282;
  font-style: italic;
  font-size: 14px;
  /*margin-top: 0.5em;*/
}
.add-product button {
  margin-right: 10px;
  height: 25px;
  width: 25px;
}
.add-product p {
  margin: 0;
}
.add-product:hover {
  color: #dc143c;
  font-style: normal;
  border: 1px solid #dc143c;
  cursor: pointer;
}
.info {
  font-size: 14px;
  font-style: italic;
  text-align: center;
  color: #828282;
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
