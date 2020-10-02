import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/login.vue";

//Verwaltung
import Statistik from "./views/administration/Statistik.vue";
import Produkte from "./views/administration/Produkte.vue";
import Benutzerkonten from "./views/administration/Benutzerkonten.vue";
import CheckListe from "./views/administration/Check-Liste.vue";
import Verwaltung from "./views/administration/Verwaltung.vue";
//Konfiguration
import Configuration from "./views/configuration/configuration.vue";
import configCheckList from "./views/configuration/check-list.vue";
import beverageSelection from "./views/configuration/beverage-selection.vue";
import foodSelection from "./views/configuration/food-selection.vue";
import menuSelection from "./views/configuration/menu-selection.vue";
import configSuccess from "./views/configuration/success.vue";
//Kassa
import pointOfSale from "./views/point-of-sale/point-of-sale.vue";
//Küche
import kitchen from "./views/kitchen/kitchen.vue";
//Benutzer
import User from "./views/user/user.vue";
import Carte from "./views/user/carte.vue";
import shoppingCart from "./views/user/shopping-cart.vue";
import userSuccess from "./views/user/success.vue";
import notActive from "./views/user/notActive.vue";
//Abschluss
import Closing from "./views/closing/closing.vue";
import Cash from "./views/closing/cash.vue";
import Message from "./views/closing/message.vue";
import fileTransfer from "./views/closing/file-transfer.vue";
import closingCheckList from "./views/closing/closing-checklist.vue";

//Import Store
import store from "./store/store.js";
//Import services
import AuthService from "./services/AuthService";
import SessionService from "./services/SessionService";

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [
    {
      // "Verwaltung" is one of the main sections (Verwaltung, User, Küche, Kassa, Konfig)
      // The "Verwaltung" has several child pages (Statistik, Benutzer, Produkte, Check-Liste)
      path: "/verwaltung",
      name: "verwaltung",
      component: Verwaltung,
      beforeEnter: adminAuth,
      children: [
        {
          path: "produkte",
          name: "produkte",
          component: Produkte
        },
        {
          path: "passwort",
          name: "passwort",
          component: Benutzerkonten
        },
        {
          path: "checkliste",
          name: "checkliste",
          component: CheckListe
        },
        {
          path: "statistik",
          name: "statistik",
          component: Statistik
        }
      ]
    },
    {
      path: "/konfiguration",
      name: "konfiguration",
      component: Configuration,
      beforeEnter: posAuth,
      children: [
        {
          path: "check-liste",
          name: "check-liste",
          component: configCheckList
        },
        {
          path: "getränke",
          name: "beverages",
          component: beverageSelection
        },
        {
          path: "speisen",
          name: "food",
          component: foodSelection
        },
        {
          path: "menüs",
          name: "menus",
          component: menuSelection
        },
        {
          path: "erfolgreich",
          name: "success",
          component: configSuccess
        }
      ]
    },
    {
      path: "/kassa",
      name: "point-of-sale",
      component: pointOfSale,
      beforeEnter: posAuth
    },
    {
      path: "/küche",
      name: "kitchen",
      beforeEnter: kitchenAuth,
      component: kitchen
    },
    {
      path: "/login/:section",
      name: "login",
      component: Login,
      beforeEnter: checkActive,
      props: true
    },
    {
      path: "/benutzer",
      name: "user",
      component: User,
      beforeEnter: userAuth,
      children: [
        {
          path: "speisekarte",
          name: "carte",
          component: Carte
        },
        {
          path: "bestellung",
          name: "shopping-cart",
          component: shoppingCart
        }
      ]
    },
    {
      path: "/bestellung-abgeschlossen",
      name: "user-success",
      component: userSuccess
    },
    {
      path: "/inaktiv",
      name: "notactive",
      component: notActive
    },
    {
      path: "/abschluss",
      name: "closing",
      component: Closing,
      beforeEnter: posAuth,
      children: [
        {
          path: "check-liste",
          name: "closing-checkliste",
          component: closingCheckList
        },
        {
          path: "Kassastand",
          name: "cash",
          component: Cash
        },
        {
          path: "Nachricht",
          name: "nachricht",
          component: Message
        },
        {
          path: "Übermittlung",
          name: "file-transfer",
          component: fileTransfer
        }
      ]
    },
    {
      path: "/",
      name: "home",
      component: Home
    }
  ]
});

function userAuth(to, from, next) {
  var forename = store.state.cart.forename;
  var surname = store.state.cart.surname;
  if (forename == "" || surname == "") {
    next({ name: "login", params: { section: "user" } });
  } else {
    next();
  }
}
async function posAuth(to, from, next) {
  var username = store.state.user.username;
  var password = store.state.user.password;
  if (username != "" && password != "") {
    try {
      const response = await AuthService.getUserRole();
      if (response.data.role === "employee") {
        next();
      } else {
        next({ name: "login", params: { section: "pos" } });
      }
    } catch (error) {
      next({ name: "login", params: { section: "pos" } });
    }
  } else {
    next({ name: "login", params: { section: "pos" } });
  }
}
async function kitchenAuth(to, from, next) {
  var username = store.state.user.username;
  var password = store.state.user.password;
  if (username != "" && password != "") {
    try {
      const response = await AuthService.getUserRole();
      if (response.data.role === "employee") {
        next();
      } else {
        next({ name: "login", params: { section: "kitchen" } });
      }
    } catch (error) {
      next({ name: "login", params: { section: "kitchen" } });
    }
  } else {
    next({ name: "login", params: { section: "kitchen" } });
  }
}
async function adminAuth(to, from, next) {
  var username = store.state.user.username;
  var password = store.state.user.password;
  if (username != "" && password != "") {
    try {
      const response = await AuthService.getUserRole();
      if (response.data.role === "admin") {
        next();
      } else {
        next({ name: "login", params: { section: "admin" } });
      }
    } catch (error) {
      next({ name: "login", params: { section: "admin" } });
    }
  } else {
    next({ name: "login", params: { section: "admin" } });
  }
}

async function checkActive(to, from, next) {
  if (to.params.section == "user") {
    const sessionActiveResponse = await SessionService.getServiceStatus();
    if (sessionActiveResponse.data.active === true) {
      next();
      console.log("active");
    } else {
      next({ name: "notactive" });
      console.log("not active");
    }
  } else {
    next();
  }
}
export default router;
