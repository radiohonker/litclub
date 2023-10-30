<template>
  <div class="login">
    <div class="col">
      <h2>Авторизация</h2>
      <form @submit.prevent="authorise">
        <input
            placeholder="Логин"
            type="login"
            v-model="login"
            :class="{ active: activeInput === 'login' }"
            @focus="setActiveInput('login')"
            @blur="setActiveInput(null)"
        >
        <input
            placeholder="Пароль"
            type="password"
            v-model="pass"
            :class="{ active: activeInput === 'password' }"
            @focus="setActiveInput('password')"
            @blur="setActiveInput(null)"
        ><h4 v-if="passIncorrect" style = "text-align: center; margin-top:1em">Пароль неверный</h4>
        <div class="container">
          <button type="submit">Авторизоваться / Зарегистрироваться</button>
          <h3 v-if="!filledAll">Введите пожалуйста все значения!</h3>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import router from "../../router";
import axios from 'axios';
import VueCookies from 'vue-cookies';

export default {
  name: "auth",
  data() {
    return {
      activeInput: null,
      login: '',
      pass: '',
      filledAll: true,
      passIncorrect: false
    };
  },
  methods: {
    setActiveInput(input) {
      this.activeInput = input;
    },
    closeAuthForm() {
      this.$emit('close');
    },
    async authorise() {
      try {
        if (this.login && this.pass) {
          this.filledAll = true;
          let response = await axios.post('/auth', {
            login: this.login,
            pass: this.pass,
          });
          if (response.data) {
            console.log(response.data);
            VueCookies.set('login', this.login);
            this.$store.commit('setLogin', this.login);
            this.$emit('login-success');
            this.$router.push({ name: 'profile'})
          }
        } else {
          this.filledAll = false;
        }
      } catch (e) {
        if (e.response.status == 401){
          this.passIncorrect = true
        }
        console.log(e);
      }
    },
  },
}
</script>

<style scoped>
.col{
  height:100%;
}
.login {
  width: 28em;
  height: 34em;
  padding: 0 1em 0 1em;
  background-color: #121212; /*121212 */
  color: white;
  margin: 0 auto;
  margin-top: 50px;
  border-radius: 20px;
}
h2 {
  text-align: center;
  padding-top: 0.5em;
}
input {
  width: 100%;
  border: none;
  border-radius: 10px;
  border: 2px solid #626262;
  background-color: #181818;
  color: white;
  width: 100%;
  font-size:1.3rem;
  padding-left: 1rem;
  margin-top: 2em;
  height: 3.5em;
}
::placeholder {
  color: #bebebe;
}
input:focus {
  border: none;
  outline: none;
}
.active {
  color: #242424 !important;
  background-color: #ebebeb !important;
}
.active::placeholder {
  color: black !important;
}
.container{
  display:flex;
  justify-content: center;
  height: 9em;
  align-items: flex-end;
}
button{
  width:20em;
  height: 3.5em;
  border: none;
  outline: none;
  font-size:1.5rem;
  padding:0;
  border-radius:10px;
  background-color: #181818;
  color: #cbcbcb;
  border: 2px solid #cbcbcb;
}
button:hover{
  cursor: pointer;
}
</style>
