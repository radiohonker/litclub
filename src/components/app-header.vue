<script>
import auth from './auth-form.vue';
import profile from './profile.vue'
import VueCookies from 'vue-cookies';
import dayjs from "dayjs";
import axios from "axios";
import router from "../../router";
export default {
  components: {
    auth,
  },
  name: "app-header",
  data() {
    return {
      isInputActivated: false,
      isAuth: false,
      books: [],
      searchFilter: [],
      inputStuff: ''
    };
  },
  methods: {
    inputActivated() {
      this.isInputActivated = true;
    },
    inputDeactivated() {
      this.isInputActivated = false;
      this.inputStuff = ''
      setTimeout(() => {
        this.searchFilter = '';
      }, 100); // чтобы переход по ссылке успел сработать
    },
    loginClicked() {
      if (!this.isLoggedIn){
        this.$emit('toggle-blur');
        this.isAuth = !this.isAuth;
      }
      else{
        this.$router.push({ name: 'profile'})
      }
    },
    main(){
      this.$router.push({ name: 'main'})
    },
    handleLoginSuccess() {
      this.$emit('login-success');
      this.$emit('toggle-blur');
      this.isAuth = false;
    },
    async loadBooks(){
      let response = await axios.get(`books`);
      console.log(response.data)
      return response.data
    },
    filterBooks(input) {
      this.searchFilter = [];
      const trimmedInput = input.trim().toLowerCase();

      for (let i = 0; i < this.books.length; i++) {
        const bookTitle = this.books[i].title.toLowerCase();

        if (bookTitle.includes(trimmedInput)) {
          this.searchFilter.push(this.books[i]);
        }
      }
      if (input.length == 0 ){
        this.searchFilter = ''
      }
    },

    GotoBook(id){
      this.$router.push({name: 'book', params:{id: id}});
      this.$forceUpdate();
      this.searchFilter = []
    },
    leaveAccount(){
      this.$emit('leave');
      this.isLoggedIn();
    },
    ClickSearch(id){
      if (id.length == 1){
        this.$router.push({name: 'book', params:{id: id[0]._id}});
        this.searchFilter = []
      }
      else{

      }
    }
  },
  computed: {
    isLoggedIn() {
      let loginFromStore = this.$store.state.login;
      let loginFromCookie = VueCookies.get('login');
      return loginFromStore || loginFromCookie;
    },
  },
  async mounted() {
    this.books = await this.loadBooks()
    this.books = this.books.sort()
  }
}
</script>


<template>
  <nav class='main'>
    <ul class="navbar">
      <li style="font-family: 'Tinos', serif;"><img src="/white-logo.png" width="40" style="margin-right: 0.2em">LitClub</li>
      <li><div @click = "main" class = "text">Главная</div></li>
        <div class="search-container">
          <input
              class="search"
              type="text"
              @input="filterBooks(inputStuff)"
              v-model="inputStuff"
              :class="{ active: isInputActivated }"
              :placeholder="isInputActivated ? 'Введите запрос' : 'Поиск книги по названию...'"
              @focus="inputActivated"
              @blur="inputDeactivated">
          <button class="search-button" @click="ClickSearch(this.searchFilter)">
            <img :src="isInputActivated ? '/search.png' : '/white_search.png'">
          </button>
          <ul v-if="this.searchFilter.length > 0">
            <li v-for="book in searchFilter" @click="GotoBook(book._id)">
              {{book.title}}
            </li>
          </ul>

        </div>

      <div class="profile">
        <div @click="loginClicked" class = "text">
          <img src="/person.png" width="25" style="margin-right: 0.5em">
          <h4 v-if="!isLoggedIn">Авторизация</h4> <h4>{{isLoggedIn}}</h4>
        </div>

      </div>

    </ul>

  </nav>
  <br>
  <profile @leave="leaveAccount"></profile>
  <Transition>
    <auth v-if="isAuth" @login-success="handleLoginSuccess" @close="isAuth = false"></auth>
  </Transition>
</template>

<style scoped>
  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.2s;
  }
  .v-enter-from,
  .v-leave-to {
    opacity: 0;
  }
  nav ul {
    list-style-type: none;
  }

  li{
    height:100%;
    width:6em;
    justify-content: center;
    display: flex;
    align-items: center;
    flex-grow: 0.5;
  }

  .navbar{
    margin:0 0 0 0!important;
    width:100%;
    height:100%;
    padding: 0 0 0 0;
  }
  .navbar .text{
    display:flex;
    height:100%;
    width: 6em;
    align-items: center;
    justify-content: center;
  }
  .profile .text{
    width:9em;
  }
  .navbar .text:hover{
    border-top: 3px solid black;
    border-bottom: 3px solid white;
    cursor: pointer;
  }
  .main{
    background-color: #0d0d0d;
    width: 100%;
    height:7vh;
    color: #e3e3e3;
    font-size:1.5rem;
    display:flex;
    align-items: center;
  }
  ::placeholder{
    color: #bebebe;
  }
  input:focus{
    border: none;
    outline: none;
  }
  .active {
    color: #242424!important;
    background-color: #ebebeb !important;
  }
  .active::placeholder{
    color: black!important;
  }
  .search{
    border: none;
    border-radius:10px;
    background-color: #363636;
    color:white;
    width:30vw;
    padding-left:1rem;
    height: 100%;
    display:flex;
    align-content: center;
  }
  .search-container {
    height:80%;
    position: relative;
  }
  .search-container ul{
    background-color: #ebebeb;
    margin-top:0.2em;
    color: #242424;
    padding:0.3em 0 0.3em 0;
    border-radius:10px;
    animation: mymove 0.2s ease-out forwards;
  }
  @keyframes mymove {
    from {opacity: 0}
    to {opacity: 1}
  }
  .search-container li{
    width:100%;
    padding: 0.1em 0 0.1em 1em;
    justify-content: flex-start!important;
    font-size:1.2rem;
  }
  .search-container li:hover{
    background-color: #d2d2d2;
    cursor: pointer;
  }
  .search-button {
    position: absolute;
    top: 45%;
    right: 0.5rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .search-button img {
    width: 1.8rem;
  }
  .profile{
    height:100%;
    width:9.5em;
    display:flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
  }
  .profile h4{
    padding-top:0.2em;
  }
</style>