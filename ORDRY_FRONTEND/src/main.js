import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import Vuelidate from "vuelidate";
import Hammer from "hammerjs";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faUserSecret,
  faPlus,
  faMinus,
  faSignOutAlt,
  faTrashAlt,
  faEdit,
  faCheck,
  faTimes,
  faUndoAlt,
  faCaretDown,
  faCaretUp,
  faArrowLeft,
  faShoppingCart,
  faGlassWhiskey,
  faHamburger,
  faArrowRight,
  faUtensils,
  faSort,
  faGripHorizontal,
  faHeartBroken,
  faReceipt
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import store from "./store/store";
import "./registerServiceWorker";

library.add(
  faUserSecret,
  faPlus,
  faMinus,
  faSignOutAlt,
  faTrashAlt,
  faEdit,
  faCheck,
  faTimes,
  faUndoAlt,
  faCaretDown,
  faCaretUp,
  faArrowLeft,
  faShoppingCart,
  faGlassWhiskey,
  faHamburger,
  faArrowRight,
  faUtensils,
  faSort,
  faGripHorizontal,
  faHeartBroken,
  faReceipt
);

Vue.use(Vuelidate); // FormValidation
Vue.component("font-awesome-icon", FontAwesomeIcon); // Icons

Vue.filter("toCurrency", function(value) {
  if (typeof value !== "number") {
    return value;
  }
  var formatter = new Intl.NumberFormat("de-AT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2
  });
  return formatter.format(value);
});

Vue.config.productionTip = false;

Vue.directive("swipe", {
  bind: function(el, binding) {
    if (typeof binding.value === "function") {
      const mc = new Hammer(el);
      mc.get("swipe").set({
        direction: Hammer.DIRECTION_HORIZONTAL,
        threshold: 3,
        velocity: 0.2
      });
      mc.on("swipe", binding.value);
    }
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
