<template>
  <div class="accounts">
    <!-- We display all user accounts in a list -->
    <account v-for="item in users" :key="item._id" :user="item"></account>
  </div>
</template>

<script>
import account from "../../components/administration/account.vue";

import AuthService from "../../services/AuthService";

export default {
  name: "accounts",
  components: { account },
  data() {
    return {
      //This is the test data I used
      users: []
    };
  },
  async created() {
    try {
      const response = await AuthService.getAllEmployeeUsers();
      this.users = response.data.users;
    } catch (error) {
      console.error(error);
    }
  }
};
</script>

<style scoped>
.accounts {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  margin: 1em 10px 0;
  padding: 1em 0 0;
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 15px 15px 0 0;
}
</style>