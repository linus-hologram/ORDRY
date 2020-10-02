<template>
  <div class="account">
    <!-- We display the users username and his role -->
    <span class="username">{{user.username}}</span>
    <span class="role">{{user.role}}</span>
    <!-- With this button we can display the form for resetting the password -->
    <button class="btn-round edit" v-show="!showForm" @click="showForm = true">
      <font-awesome-icon icon="edit" />Passwort zurücksetzen
    </button>
    <transition tag="span" enter-active-class="animated fadeIn fast">
      <!-- The user needs to enter the new password, repeat the new password and hit save -->
      <form class="pswd-form" v-show="showForm" v-on:submit.prevent="changePassword">
        <div>
          <label>Neues Passwort:</label>
          <input
            type="text"
            v-model="$v.password.$model"
            :class="{'error': $v.password.$error, 'noerror': !$v.password.$error}"
          />
        </div>
        <div>
          <label>Passwort bestätigen:</label>
          <input
            type="text"
            v-model="$v.repeatPassword.$model"
            :class="{'error': $v.repeatPassword.$error, 'noerror': !$v.repeatPassword.$error}"
          />
        </div>
        <span class="error-msg" v-if="$v.repeatPassword.$error">
          <p v-if="!$v.repeatPassword.sameAsPassword">Passwörter müssen übereinstimmen!</p>
        </span>
        <span class="error-msg" v-if="$v.password.$error">
          <p v-if="!$v.password.minLength">Das Passwort muss mindestens 6 Zeichen haben!</p>
          <p v-if="!$v.password.required">Geben Sie ein neues Passwort ein.</p>
        </span>
        <span class="actions">
          <!-- The user can either cancle the process or save the new password -->
          <icon-button icon="times" customColor="#828282" @click.native="reset"></icon-button>
          <!-- It is only possible to change the password if the validation is successful -->
          <button class="btn-round" :disabled="$v.$invalid">Übernehmen</button>
        </span>
      </form>
    </transition>
  </div>
</template>

<script>
import iconButton from "../../components/icon-button.vue";
import { required, sameAs, minLength } from "vuelidate/lib/validators";

import AuthService from "../../services/AuthService";
import { mapGetters } from "vuex";

export default {
  name: "account",
  //We need a user object with its id, username and role
  props: ["user"],
  components: { iconButton },
  data() {
    return {
      //This is the input from the form
      password: "",
      repeatPassword: "",
      //This defines if the form is displayed or not
      showForm: false
    };
  },
  //The new password needs to be at least 6 charakters long
  //Both fields (pswd + repeatPswd) need to have the same value
  validations: {
    password: {
      required,
      minLength: minLength(6)
    },
    repeatPassword: {
      sameAsPassword: sameAs("password")
    }
  },
  methods: {
    async changePassword() {
      //Here you need to change the password of this user
      try {
        await AuthService.changeUserPassword(
          btoa(this.user.username),
          btoa(this.password)
        );

        if (this.user.role === "admin") {
          // this works because there's only one admin user in the list - and that is the admin itself
          // if an admin user changes its password, the service auth needs to be updated
          this.$store.commit("user/UPDATE_PASSWORD", this.password);
          AuthService.SET_HEADER_CREDENTIALS(this.getBase64AuthToken);
        }
      } catch (error) {
        console.error(error);
      }
      //Afterwards the component is reset
      this.reset();
    },
    reset() {
      //This is used to reset the component
      this.showForm = false;
      this.password = "";
      this.repeatPassword = "";
      this.$v.$reset();
    }
  },
  computed: {
    ...mapGetters("user", ["getBase64AuthToken"])
  }
};
</script>

<style scoped>
.account {
  display: flex;
  align-items: center;
  width: 90%;
  margin: 0 auto;
  padding: 1em 0;
  border-bottom: 0.5px solid #000000;
  font-size: 18px;
}
.btn-round {
  font-size: 16px;
}
.username {
  flex-basis: 40%;
}
.role {
  font-family: "Raleway";
  color: #828282;
}
.edit {
  background-color: #828282;
  margin-left: auto;
}
.pswd-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: auto;
  flex-basis: 40%;
  height: 100%;
}
.pswd-form label {
  display: block;
}
.pswd-form input {
  margin-left: auto;
  flex-basis: 40%;
  border-radius: 20px;
  border: 0.5px solid #000000;
  box-shadow: none;
  padding: 0.5em 1em;
  height: 1.5em;
}
.pswd-form div {
  width: 100%;
  display: flex;
  margin-bottom: 1em;
  justify-content: space-between;
}
.pswd-form .actions {
  display: flex;
  width: 100%;
}
.pswd-form .btn-round {
  flex-grow: 1;
  margin-left: 10px;
}

.pswd-form .error {
  border: 0.5px solid #dc143c;
}
.error-msg p {
  margin: 0 auto;
  color: #dc143c;
  font-size: 14px;
}
</style>