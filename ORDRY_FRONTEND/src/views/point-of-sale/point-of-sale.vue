<template>
  <div class="wrapper">
    <div class="drink">
      <div class="head">
        <h1>GETRÄNKE</h1>
        <!-- With this button the user can get the last finished beverage order back if he removed it unintentionally -->
        <icon-button id="undo" icon="undo-alt" customColor="#DC143C" @click.native="undoFinished()"></icon-button>
      </div>
      <transition-group
        name="drink"
        tag="div"
        class="drinks"
        leave-active-class="animated slideOutLeft faster"
        enter-active-class="animated slideInLeft faster"
      >
        <order-beverages
          v-for="item in preparedBeverageData"
          :key="item.oid"
          :oid="item.oid"
          :guestname="item.guestname"
          :beverages="item.beverages"
        ></order-beverages>
        <div class="end" :key="0">
          <p>Keine weiteren Bestellungen.</p>
        </div>
      </transition-group>
    </div>
    <div class="orders">
      <div class="orders-header">
        <h1>BESTELLUNGEN</h1>
        <button class="btn-round" id="logout" @click="showLogout=!showLogout">
          Abmelden
          <font-awesome-icon icon="sign-out-alt" />
        </button>
        <logout-modal v-show="showLogout" @close="showLogout=false"></logout-modal>
      </div>
      <transition-group
        class="order-list"
        tag="div"
        name="orders"
        leave-active-class="animated fadeOutRight fast"
        enter-active-class="animated fadeInLeft"
      >
        <!-- Every time a user clicks on an order we collapse all displayed orders, afterwards the open status of the clicked order is adjusted to the desired state -->
        <order-item
          v-for="item in preparedOrderData"
          :key="item.id"
          :oid="item.id"
          :forename="item.forename"
          :surname="item.surname"
          :items="item.items"
          :billed="billOrders.includes(item)"
          ref="accordion"
          @bill="addToBill(item)"
        ></order-item>
      </transition-group>
      <billing
        :orders="billOrders"
        @close="showBill = false"
        @payed="clearBill"
        @remove="removeOrder($event)"
        v-show="showBill"
      ></billing>
      <billing-info :orders="billOrders.length" @open="showBill=true" v-show="!showBill"></billing-info>
    </div>
  </div>
</template>

<script>
import iconButton from "../../components/icon-button.vue";
import orderBeverages from "../../components/point-of-sale/order-beverages.vue";
import orderItem from "../../components/point-of-sale/order-item.vue";
import logoutModal from "../../components/point-of-sale/logout-modal.vue";
import billing from "../../components/point-of-sale/billing.vue";
import billingInfo from "../../components/point-of-sale/billing-info.vue";

import { mapGetters, mapState } from "vuex";
import openSocket from "socket.io-client";

export default {
  name: "point-of-sale",
  components: {
    logoutModal,
    iconButton,
    orderBeverages,
    orderItem,
    billing,
    billingInfo
  },
  beforeRouteLeave(to, from, next) {
    if (
      to.fullPath.includes("/konfiguration") ||
      to.fullPath.includes("/abschluss")
    ) {
      next();
    } else {
      this.$store.dispatch("user/clearCredentials");
      next();
    }
  },
  data() {
    return {
      //This variable defines if the logout popup is displayed or not
      showLogout: false,
      //This variable defines if the bill displayed or not
      showBill: false,
      //This variable is the default value for the orders in the accordion -> they are closed on default
      open: false,
      //This is the current list of orders that are marked for settlement
      billOrders: []
    };
  },
  methods: {
    undoFinished(oid) {
      //Here you need to set all the beverages of this order (the last finished one) back to unfinished
      this.$store.dispatch("orders/undoLastFinishMarkOnBeverageOrder");
      console.log("undo finished: " + oid);
    },
    collapseAll() {
      //Here all displayed orders are closed
      //The order-accordion requires me to change a prop directly when an order is opened/closed
      //This is not an ideal solution. However, I was not able to get it to work without this
      //this.$refs.accordion.map(c => (c.open = false));
    },
    addToBill(order) {
      if (!this.billOrders.includes(order)) {
        this.billOrders.push(order);
      }
      this.showBill = true;
    },
    clearBill() {
      this.billOrders = [];
      this.showBill = false;
      console.log("cleared bill.");
    },
    removeOrder(rOrder) {
      this.billOrders = this.billOrders.filter(order => {
        return order !== rOrder;
      });
    }
  },
  async created() {
    try {
      await this.$store.dispatch("orders/fetchOrders");
      await this.$store.dispatch("beverages/fetchAllBeverages");
      await this.$store.dispatch("food/fetchAllFood");
      await this.$store.dispatch("menu/fetchAllMenus");

      const socket = openSocket("http://localhost:3000", {
        upgrade: false,
        transports: ["websocket"],
        reconnection: true,
        forceNew: false
      });
      socket.on("order-placed", data => {
        this.$store.dispatch("orders/addOrder", data);
      });
      socket.on("food-order-finished-changed", data => {
        console.log("Finished status changed of food order:", data);
        this.$store.dispatch("orders/updateOrderFoodFinished", data);
      });
      socket.on("menu-order-finished-changed", data => {
        console.log("Finished status changed of menu order:", data);
        this.$store.dispatch("orders/updateOrderMenuFinished", data);
      });
    } catch (error) {
      console.error(error);
    }
  },
  beforeDestroy() {
    clearInterval(this.refreshTimer);
    this.refreshTimer = undefined;
  },
  computed: {
    ...mapGetters("orders", ["openBeverageOrders", "timeSortedOrders"]), // the orders which have open beverages
    ...mapState("beverages", ["beverageItems"]), // all current beverages
    ...mapState("food", ["foodItems"]), // all current food items
    ...mapState("menu", ["menuItems"]), // all current menu items
    ...mapState("orders", ["orders"]), // all UNPAID orders
    preparedBeverageData() {
      // this property prepares the "raw" data for being displayed on the screen
      let preparedData = [];

      if (this.beverageItems.length > 0) {
        // are the beverageItems already loaded?

        this.openBeverageOrders.forEach(order => {
          let currentOrderData = {};
          currentOrderData.guestname = order.forename + " " + order.surname;
          currentOrderData.oid = order._id;
          currentOrderData.beverages = [];

          order.beverages.forEach(bvg => {
            // loop through each ordered beverage
            if (!bvg.finished) {
              let beverageData = this.beverageItems.find(b => {
                // STEP 1: Find the beverage
                return b._id == bvg.beverageId;
              });

              if (beverageData) {
                let sizeData = beverageData.sizes.find(s => {
                  // STEP 2: Find the size
                  return s._id == bvg.sizeId;
                });

                if (sizeData) {
                  currentOrderData.beverages.push({
                    // STEP 3: put shit together
                    name: beverageData.name + " " + sizeData.name,
                    amount: bvg.amount, // the amount of the ordered beverage,
                    sizeId: sizeData._id
                  });
                }
              }
            }
          });
          if (currentOrderData.beverages.length > 0) {
            preparedData.push(currentOrderData); // only push if all necessary items have been added to the object
          }
        });
      }
      return preparedData;
    },
    preparedOrderData() {
      let preparedData = [];

      if (
        this.beverageItems.length > 0 &&
        this.foodItems.length > 0 &&
        this.menuItems.length > 0
      ) {
        this.timeSortedOrders.forEach(o => {
          let currentOrderData = {};
          currentOrderData.id = o._id;
          currentOrderData.forename = o.forename;
          currentOrderData.surname = o.surname;
          currentOrderData.finished = o.finished;
          currentOrderData.items = [];
          currentOrderData.total = 0;
          currentOrderData.open = false;

          // STEP 1: Prepare beverage data
          o.beverages.forEach(bvg => {
            let beverageData = this.beverageItems.find(b => {
              // STEP 1: Find the beverage
              return b._id == bvg.beverageId;
            });

            if (beverageData) {
              let sizeData = beverageData.sizes.find(s => {
                // STEP 2: Find the size
                return s._id == bvg.sizeId;
              });

              if (sizeData) {
                currentOrderData.items.push({
                  // STEP 3: put shit together
                  type: "beverage",
                  name: beverageData.name + " " + sizeData.name,
                  amount: bvg.amount, // the amount of the ordered beverage,
                  finished: bvg.finished,
                  price: sizeData.price,
                  beverageOrderId: bvg._id
                });
                // currentOrderData.total += sizeData.price * bvg.amount;
              }
            }
          });

          o.food.forEach(forder => {
            let foodData = this.foodItems.find(f => {
              return f._id == forder.foodId;
            });

            if (foodData) {
              currentOrderData.items.push({
                type: "food",
                name: foodData.name,
                amount: forder.amount,
                finished: forder.finished >= forder.amount,
                price: foodData.price,
                foodOrderId: forder._id
              });
              // currentOrderData.total += foodData.price * forder.amount;
            }
          });

          let groupedOrderItems = [];

          o.menus.forEach(morder => {
            let menuData = this.menuItems.find(m => {
              return m._id == morder.menuId;
            });

            let menuPrice = 0;
            let menuItemNames = [];

            morder.items.forEach(mitem => {
              let currentMenuItem = menuData.food.find(mf => {
                return mf._id == mitem.itemId;
              });

              menuPrice += currentMenuItem.price;
              menuItemNames.push({
                id: mitem.itemId,
                name: currentMenuItem.name
              });
            });

            if (menuData) {
              if (groupedOrderItems.length > 0) {
                let shouldAddCurrentMorder = false;

                for (let i = 0; i < groupedOrderItems.length; i++) {
                  let goi = groupedOrderItems[i];

                  if (
                    JSON.stringify(goi.items) == JSON.stringify(menuItemNames)
                  ) {
                    goi.menuOrderIds.push(morder._id);
                    goi.amount++;
                    if (goi.finished === true && morder.finished === false) {
                      // set the overall status of this menu combination to false if necessary
                      goi.finished = morder.finished;
                    }
                    shouldAddCurrentMorder = false;
                    break;
                  } else {
                    shouldAddCurrentMorder = true;
                  }
                }

                if (shouldAddCurrentMorder) {
                  groupedOrderItems.push({
                    type: "menu",
                    menuId: morder.menuId,
                    menuOrderIds: [morder._id],
                    name: menuData.name,
                    amount: 1,
                    items: menuItemNames,
                    finished: morder.finished,
                    price: menuPrice
                  });
                }
              } else {
                groupedOrderItems.push({
                  type: "menu",
                  menuId: morder.menuId,
                  menuOrderIds: [morder._id],
                  name: menuData.name,
                  amount: 1,
                  items: menuItemNames,
                  finished: morder.finished,
                  price: menuPrice
                });
              }
            }
          });
          groupedOrderItems.forEach(goi => {
            currentOrderData.items.push(goi);
          });
          preparedData.push(currentOrderData);
        });
      }
      return preparedData;
    }
  }
};
</script>

<style scoped>
.wrapper {
  height: 100%;
}
.drink {
  width: 25%;
  margin-right: 5%;
  display: flex;
  flex-direction: column;
  float: left;
  overflow: hidden;
  height: 100%;
}
.drink .head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
}
.drink .drinks {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
}
.end {
  color: #828282;
  border-top: dotted 4px #828282;
  width: 90%;
  margin: 1em 0 0;
  text-align: center;
  font-style: italic;
}
.orders {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
#undo {
  width: 40px;
  height: 40px;
  font-size: 20px;
}
.order-list {
  background-color: #ffffff;
  width: 100%;
  flex-grow: 1;
  border-radius: 15px 15px 0 0;
  padding-top: 0.5em;
  overflow-y: auto;
}
</style>
