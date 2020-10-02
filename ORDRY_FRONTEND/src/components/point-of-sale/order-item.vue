<template>
  <div class="container">
    <!-- If an order is clicked it either gets closed or opened -->
    <!-- We need to inform the parent about the action because the parents needs to tell all orders in the accordion to close before the desired order is opened -->
    <!-- So that there is always just one order opened -->
    <div class="order" @click="isOpen = !isOpen" v-bind:class="{open: isOpen}">
      <p class="guest">{{forename + " " + surname}}</p>
      <p class="total">{{total | toCurrency}}</p>
      <status-tag v-if="finished==true && billed==false" status="Fertig" customColor="#15D2AD"></status-tag>
      <status-tag
        v-if="finished==false && billed==false"
        status="Zubereitung"
        customColor="#FF8300"
      ></status-tag>
      <status-tag v-if="billed" status="Rechnung" customColor="#960d28"></status-tag>
      <font-awesome-icon v-show="!isOpen" class="icon" icon="caret-down" />
      <font-awesome-icon v-show="isOpen" class="icon" icon="caret-up" />
    </div>
    <transition
      tag="span"
      name="details"
      class="details-transition"
      enter-active-class="animated fadeIn fast"
    >
      <div class="details" v-if="isOpen">
        <div class="product" v-for="item in items" :key="item.id">
          <p v-bind:class="{unfinished: !item.finished}">{{getName(item)}}</p>
          <p class="price">{{item.price * item.amount | toCurrency}}</p>
        </div>
        <div class="total-price">
          <p>Gesamtsumme:</p>
          <p>{{total | toCurrency}}</p>
        </div>
        <!-- After opening an order the user can decided if he wants to pay or edit the bill -->
        <div class="options" v-if="!billed">
          <icon-button id="edit" icon="edit" customColor="#828282" @click.native="showModal=true"></icon-button>
          <button
            class="btn-round btn-pay"
            @click="payOrder"
            :disabled="!finished"
          >Zur Rechnung hinzufügen</button>
        </div>
        <!-- if the user wants to edit an order a popup is displayed -->
        <order-modal
          v-if="showModal"
          @close="showModal = false"
          :oid="oid"
          :forename="forename"
          :surname="surname"
          :items="items"
        ></order-modal>
      </div>
    </transition>
  </div>
</template>
<script>
import statusTag from "../../components/status-tag.vue";
import iconButton from "../../components/icon-button.vue";
import orderModal from "../../components/point-of-sale/order-modal.vue";

export default {
  name: "order-item",
  components: { statusTag, iconButton, orderModal },
  //We need the orderID, the guests fore- and surename, the status of the order and its items with their id, name and amount
  //Additionally it is possible to define if the order item is open or closed
  props: ["oid", "forename", "surname", "items", "open", "billed"],
  data() {
    return {
      //This is used to close/open an order
      isOpen: this.open,
      //This defines if the edit-order-popup is displayed or not
      showModal: false
    };
  },
  methods: {
    payOrder() {
      //Here you need to change the billing-status of this order from unpaid to paid
      //Is a confirmation popup neccessary?
      this.$emit("bill");
      this.isOpen = false;
    },
    getName(item) {
      //This method puts the displayed description together
      var name = "";
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
  computed: {
    //The total price is calculated from with the amount and price of the ordered items
    total: function() {
      var total = 0;
      this.items.forEach(item => {
        total += item.price * item.amount;
      });
      return total;
    },
    //This validates if the order includes unfinished items
    finished: function() {
      var f = true;
      this.items.forEach(item => {
        if (item.finished == false) {
          f = false;
        }
      });
      return f;
    }
  }
};
</script>
<style scoped>
.container {
  height: auto;
}
.order {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 2%;
  padding: 0.5em 0;
  border-bottom: solid 1px #828282;
  cursor: pointer;
}
.open {
  border: none;
}
.guest {
  flex-basis: 25%;
}
.billed {
  background-color: #e4e4e4;
}
.total {
  font-family: "Raleway";
  color: #828282;
}
.icon {
  font-size: 35px;
  color: #4f4f4f;
}

.details {
  padding: 1em 10%;
  box-shadow: inset 0px 11px 8px -10px #ccc, inset 0px -11px 8px -10px #ccc;
}
.details p {
  margin: 0.25em 0;
}
.details .product,
.details .total-price {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.details .options {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1em 0;
}
.details .total-price {
  border-top: solid 1px #000000;
}
.details .total-price p:nth-child(2) {
  font-size: 24px;
}
.details .btn-pay {
  width: 80%;
  margin-left: 5%;
}
.details #edit {
  width: 40px;
  height: 40px;
  font-size: 18px;
}
.details .product .unfinished {
  color: #ff8300;
}
</style>
