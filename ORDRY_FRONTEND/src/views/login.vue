<template>
  <div class="login">
    <div class="logo">
      <img id="logo" alt="Ordry logo" src="../assets/ordry-dark.png" />
      <h1>YOUR PERSONAL WAITER.</h1>
    </div>
    <!-- We prevent the standard submit action and use our login method instead-->
    <!-- The form is adjusted according to the section the user tries to access (guest or staff) -->
    <form class="login-form" v-on:submit.prevent="Login(section)" v-if="section=='user'">
      <!-- The form contains input fields for the fore- und surname
      and error messages for the validation-->
      <input
        type="text"
        name="forename"
        id="forename"
        placeholder="Vorname"
        v-model.trim="$v.forename.$model"
        :class="{'error': $v.forename.$error, 'noerror': !$v.forename.$error}"
      />
      <span class="error-msg" v-if="$v.forename.$error">
        <p>Bitte geben Sie Ihren Vornamen ein!</p>
      </span>
      <input
        type="text"
        name="surname"
        id="surname"
        placeholder="Nachname"
        v-model.trim="$v.surname.$model"
        :class="{'error': $v.surname.$error, 'noerror': !$v.surname.$error}"
      />
      <span class="error-msg" v-if="$v.surname.$error">
        <p>Bitte geben Sie Ihren Nachnamen ein!</p>
      </span>
      <p class="info">
        Bitte melden Sie sich mit ihrem Vor- und Nachnamen an, um bei
        <b>“Skihütte Tosters”</b> zu bestellen.
        <!-- This link could be used to provide additional information - still debating if neccessary -->
        <!-- <a href>weitere Informationen</a> -->
      </p>
      <!-- The button is disabled if the form validation fails -->
      <button class="btn-round" :disabled="$v.$invalid">Los geht's</button>
    </form>
    <form
      class="login-form"
      v-on:submit.prevent="Login(section)"
      v-else-if="section=='kitchen'||section=='pos'||section=='admin'"
    >
      <!-- The form contains input fields for username and password
      and error messages for the validation-->
      <input
        type="text"
        placeholder="Benutzername"
        v-model.trim="$v.username.$model"
        :class="{'error': $v.username.$error, 'noerror': !$v.username.$error}"
      />
      <span class="error-msg" v-if="$v.username.$error">
        <p>Bitte geben Sie Ihren Benutzernamen ein!</p>
      </span>
      <input
        type="password"
        placeholder="Passwort"
        v-model.trim="$v.password.$model"
        :class="{'error': $v.password.$error, 'noerror': !$v.password.$error}"
      />
      <span class="error-msg" v-if="$v.password.$error">
        <p>Bitte geben Sie Ihr Passwort ein!</p>
      </span>
      <span class="info error-msg" v-if="error">
        <p>Anmeldung fehlgeschlagen! Benutzername oder Passwort sind nicht korrekt.</p>
      </span>
      <span class="info error-msg" v-if="notactive">
        <p>Anmeldung fehlgeschlagen! Aktive Konfiguration erforderlich.</p>
      </span>
      <span class="info error-msg" v-if="active">
        <p>Anmeldung fehlgeschlagen! Keine Änderungen möglich - es ist eine Sitzung aktiv. Bitte führen Sie zuerst den Tagesabschluss durch.</p>
      </span>
      <p
        class="info"
        v-if="!error&&!notactive"
      >Bitte melden Sie sich mit ihren Zugangsdaten an, um mit der Arbeit zu beginnen.</p>
      <!-- The button is disabled if the form validation fails -->
      <button class="btn-round" :disabled="$v.$invalid">Los geht's</button>
    </form>
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import AuthService from "../services/AuthService";
import ChecklistService from "../services/ChecklistService";
import ProductService from "../services/ProductService";
import OrderService from "../services/OrderService";
import SessionService from "../services/SessionService";

import { mapGetters } from "vuex";

export default {
  name: "login",
  //We get the section value from the way the route is constructed
  //e.g. "../login/kitchen" --> section = "kitchen"
  props: ["section"],
  data() {
    return {
      //This is the input from the login form
      forename: "",
      surname: "",
      //Input for kitchen|pos|admin login
      username: "",
      password: "",
      //This is used to display an error message if the authentification with the entered credentials fails
      error: false,
      //This is used to display an error message if the session is not active
      notactive: false,
      //This is used to display an error message if the session is active
      active: false
    };
  },
  //Form-validation
  validations() {
    if (this.section == "user") {
      //fore- and surname must be provided (guest login)
      return {
        forename: { required },
        surname: { required }
      };
    } else {
      //username and password must be provided
      return {
        username: { required },
        password: { required }
      };
    }
  },
  methods: {
    async Login(section) {
      switch (section) {
        case "user":
          //Here you need to perform some kind of authentication action and start a new order
          this.$store.dispatch("cart/setGuestName", {
            forename: this.forename,
            surname: this.surname
          });
          //Afterwards the user gets redirected to the menu carte
          this.$router.push("../benutzer/speisekarte");
          break;
        case "kitchen":
          //Here you need to perform some kind of authentication action
          try {
            this.$store.dispatch("user/setCredentials", {
              username: this.username,
              password: this.password
            });

            AuthService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);

            const response = await AuthService.getUserRole();
            const sessionActiveResponse = await SessionService.getServiceStatus();

            console.warn(sessionActiveResponse.data.active);

            if (response.data.role === "employee") {
              //If successfull the user gets redirected
              // enable the headers

              if (sessionActiveResponse.data.active === true) {
                ProductService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
                ChecklistService.SET_HEADER_CREDENTIALS(
                  this.getBase64AuthToken
                );
                OrderService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);

                this.$router.push("../küche");
              } else {
                // MARK: Create message that tells the user that service needs to be activated first.
                // MARK: REMOVE THE CONSOLE.LOG AND MARK STATEMENTS
                this.reset();
                this.notactive = true;
                this.error = false;
                this.$store.dispatch("user/clearCredentials");
              }
            } else {
              //If not we reset the form and tell the user to retry
              this.reset();
              this.$store.dispatch("user/clearCredentials");
            }
          } catch (error) {
            this.reset();
            this.$store.dispatch("user/clearCredentials");
          }
          break;
        case "pos":
          //Here you need to perform some kind of authentication action
          try {
            this.$store.dispatch("user/setCredentials", {
              username: this.username,
              password: this.password
            });

            AuthService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);

            const response = await AuthService.getUserRole();
            const sessionActiveResponse = await SessionService.getServiceStatus();

            if (response.data.role === "employee") {
              //If successfull the user gets redirected
              // enable the headers
              ProductService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
              ChecklistService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
              OrderService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
              SessionService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
              if (sessionActiveResponse.data.active === true) {
                this.$router.push("../kassa");
              } else {
                this.$router.push("../konfiguration/check-liste");
              }
            } else {
              //If not we reset the form and tell the user to retry
              this.reset();
              this.$store.dispatch("user/clearCredentials");
            }
          } catch (error) {
            this.reset();
            this.$store.dispatch("user/clearCredentials");
          }
          break;
        case "admin":
          //Here you need to perform some kind of authentication action
          try {
            this.$store.dispatch("user/setCredentials", {
              username: this.username,
              password: this.password
            });

            AuthService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);

            const response = await AuthService.getUserRole();
            const sessionActiveResponse = await SessionService.getServiceStatus();

            if (response.data.role === "admin") {
              if (sessionActiveResponse.data.active === false) {
                //If successfull the user gets redirected
                // enable the headers
                ProductService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
                ChecklistService.SET_HEADER_CREDENTIALS(
                  this.getBase64AuthToken
                );
                OrderService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
                SessionService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);

                this.$router.push("../verwaltung/statistik");
              } else {
                // MARK: Create message that tells the user that service needs to be activated first.
                // MARK: REMOVE THE CONSOLE.LOG AND MARK STATEMENTS
                this.reset();
                this.active = true;
                this.error = false;
                this.$store.dispatch("user/clearCredentials");
              }
            } else {
              //If not we reset the form and tell the user to retry
              this.reset();
              this.$store.dispatch("user/clearCredentials");
            }
          } catch (error) {
            this.reset();
            this.$store.dispatch("user/clearCredentials");
          }
          break;
        default:
          break;
      }
    },
    reset() {
      //This resets the form and displays an error message for the user
      this.forename = "";
      this.surname = "";
      this.password = "";
      this.error = true;
      this.notactive = false;
      this.$v.$reset();
    }
  },
  created() {
    if (this.section == "admin") {
      this.username = "admin";
    } else if (this.section == "kitchen" || this.section == "pos") {
      this.username = "service";
    }
  },
  computed: {
    ...mapGetters("user", ["getBase64AuthToken"])
  }
};
</script>
<style scoped>
.login {
  position: absolute;
  top: 0;
  left: 0;
  min-height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}
.login .logo h1 {
  color: #000000;
  font-weight: 700;
  font-size: 4vw;
  text-align: center;
  margin: 0;
}
.logo {
  width: 80%;
  max-width: 800px;
  margin: 5em auto 0;
}
#logo {
  width: 100%;
  height: auto;
}

input {
  border: 0;
  outline: 0;
  background: transparent;
  height: 3em;
  width: 80%;
  font-size: 18px;
}
.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
  width: 80%;
  margin: 2em auto 0;
}
.login-form .info {
  text-align: center;
  font-size: 14px;
  width: 80%;
  margin: auto 0;
}
.login-form .info a {
  display: block;
  color: #14dcb4;
  text-decoration: none;
  margin-top: 0.5em;
}
.login-form .btn-round {
  width: 100%;
  margin: auto 0 3em;
}

.noerror {
  border-bottom: 2px solid #bdbdbd;
}
.error {
  border-bottom: 2px solid #dc143c;
}
.error-msg p {
  margin: 0.25em auto;
  color: #dc143c;
  font-size: 14px;
}
</style>