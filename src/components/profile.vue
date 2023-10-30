<script>
import VueCookies from "vue-cookies";
import axios from "axios";
import router from  "../../router.js"
import dayjs from "dayjs";

export default {
  name: "profile",
  data(){
    return{
      login: '',
      user : '',
      recents: '',
      favs: '',
      bookIds: '',
      isInputActivated: false,
      activeTextArea: '',
      title: '',
      content: '',
      description: '',
      check: '',
      bookimg: '',
      isUploaded: false,
      imgUrl: '',
      my:[]
   }
  },
  methods:{
    isLoggedIn() {
      let loginFromStore = this.$store.state.login;
      let loginFromCookie = VueCookies.get('login');
      return loginFromStore || loginFromCookie;
    },
    async loadAccount(){
      let response = await axios.get(`/user`, {params: {'login': this.login}});
      return response.data
    },
    GotoBook(id){
      this.$router.push({name: 'book', params:{id: id}});
    },
    removeDuplicates(id) {
      const uniqueIds = [...new Set(id)];
      return uniqueIds;
    },
    async getBooks(id) {
      console.log(id)
      const response = await axios.get('/bookarray', { params: { id: id } });
      const object = response.data;
      let count = 0 ;
      console.log('id', id)
      const sortedBooks = id.map(bookId => object.find(book => book._id === bookId));
        return sortedBooks;
    },
    leave(){
      VueCookies.set('login', '');
      this.$store.commit('setLogin', null);
      this.$emit('leave');
      this.$router.push({ name: 'main'})
    },
    inputActivated() {
      this.isInputActivated = true;
    },
    inputDeactivated() {
      this.isInputActivated = false;
    },
    setActiveInput(input) {
      this.activeTextArea = input;
    },
    async submitBook() {
      if (this.title && this.description && this.content) {
        try {
          if(this.imgUrl){
            const bookData = {
              title: this.title,
              description: this.description,
              content: this.content,
              img: this.bookimg,
              popularity: 0,
              author: this.login,
              createdAt: new Date().toISOString(),
            };

            const response = await axios.post('/create', bookData);

            this.check = "Книга успешно опубликована!";
          } else{
                const response = await axios.post('/create', {
                  title: this.title,
                  description: this.description,
                  content: this.content,
                  img: 'unnamed.png',
                  popularity: 0,
                  author: this.login,
                  createdAt: new Date().toISOString(),
                });
                this.check = "Книга успешно опубликована!"
            }
        } catch (error) {
          console.error( error);
        }
      } else {
        this.check = "Введите все значения!";
      }
    },
    handleImageUpload(event) {
      let file = event.target.files[0];
      this.imgUrl = file
      let reader = new FileReader();
      reader.onload = (e) => {
        this.bookimg = e.target.result;
        this.isUploaded = true;
      };

      reader.readAsDataURL(file);
    },
  },
  async mounted() {
    this.login = this.isLoggedIn();
    this.bookIds = await this.loadAccount();

    let recentReadIds = this.bookIds.recentRead;
    let favbooksIds = this.bookIds.favbooks;
    let myIds = this.bookIds.myBooks;
    console.log(recentReadIds, favbooksIds);
    this.recents = await this.getBooks(this.removeDuplicates(recentReadIds));
    while (this.recents.length > 5) {
      this.recents.pop();
    }
    this.favs = await this.getBooks(this.removeDuplicates(favbooksIds));
    while (this.favs.length > 5) {
      this.favs.pop();
    }
    this.my = await this.getBooks(this.removeDuplicates(myIds));
    while (this.my.length > 5) {
      this.my.pop();
    }
  },
}
</script>

<template>
  <div class="container">
    <div class="content">
      <div class = "heading">Здравствуйте, {{this.login}} <button @click="leave">выйти</button></div>
      <div class="col">
        <div class="list">
          <div class="genre">
            <div class = "headline"><h2>Недавно просмотренные книги</h2></div>
            <div class = "books">
              <div class = "error" v-if="this.recents.length == 0">Странно, здесь пока ничего нет.</div>
              <div v-for="(book, index) in recents" class = "book" @click="GotoBook(book._id)">
                <div class = "book-cover"><img class = "book-img" :src = "`${book.img}`"></div>
                <span class = "book-name">{{ book.title.toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <div class="genre">
            <div class = "headline"><h2>Избранные книги</h2> <h4 @click="this.$router.push({path: '/filter/fav'})" style = " margin-left:auto; margin-right:1em;">Просмотреть все >>></h4></div>
            <div class = "books">
              <div class = "error" v-if="this.favs.length == 0">Странно, здесь пока ничего нет.</div>
              <div v-for="(book, index) in favs" class = "book" @click="GotoBook(book._id)">
                <div class = "book-cover"><img class = "book-img" :src = "`${book.img}`"></div>
                <span class = "book-name">{{ book.title.toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <div class="genre">
            <div class = "headline"><h2>Мои книги</h2> <h4 @click="this.$router.push({path: '/filter/fav'})" style = " margin-left:auto; margin-right:1em;">Просмотреть все >>></h4></div>
            <div class = "books">
              <div class = "error" v-if="this.favs.length == 0">Странно, здесь пока ничего нет.</div>
              <div v-for="(book, index) in my" class = "book" @click="GotoBook(book._id)">
                <div class = "book-cover"><img class = "book-img" :src = "`${book.img}`"></div>
                <span class = "book-name">{{ book.title.toUpperCase() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class = "aboba">Опубликовать свою книгу</div>
      <div class = "write">
        <div class = "cover">
          <div class = "main">
            <p style = "margin-bottom:1em; text-align:center; font-size:1.2rem;" >Обложка книги</p>
            <img :src="this.isUploaded ? this.bookimg: '/unnamed.png'" @click="handleImageUpload(event)" class = "book-img">
            <input style="height:auto; border: none; background-color: #161616;" id="upload-image" type="file" accept="image/*" @change="handleImageUpload">
            <button @click="submitBook">Опубликовать</button>
            {{this.check}}
          </div>
          <div class = "book-info">
            <div class = "title">  Название <input
                type="text"
                :class="{ active: isInputActivated }"
                :placeholder="isInputActivated ? 'Введите запрос' : 'Невероятные приключения хлебушка'"
                @focus="inputActivated"
                v-model="title"
                @blur="inputDeactivated"></div>
            <div class = "description"><br> <div class = "title"> <div class = "description">Описание</div> <textarea
                type="text"
              :class="{ activetextarea: activeTextArea === 'description' }"
                @focus="setActiveInput('description')"
                v-model="description"
                @blur="setActiveInput(null)">
                </textarea></div>
              </div>
            <div class = "description"><br> <div class = "title"> <div class = "description1">Содержание</div> <textarea
                type="text"
                :class="{ activetextarea: activeTextArea === 'text' }"
                @focus="setActiveInput('text')"
                v-model="content"
                @blur="setActiveInput(null)">
                </textarea></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
button{
  font-size:1.5rem;
  width:4.1em;
  height:1.7em;
  border:1px solid #ff3131;
  background-color: rgba(255, 250, 205, 0);
  color: #d9d6d6;
  margin-left:0.5em;
}
button:hover{
  cursor: pointer;
}
.container {
  width: 100vw;
  height: 100%;
  min-height: 100vh;
  background: #161616;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  color:white;
}
.aboba{
  text-align: center;
  margin-top:5em;
  font-size:2rem;
}
.content {
  margin-top:5em;
  height: 100%;
  width: 100%;
  background: #161616;
  margin-bottom:10em;
}
.heading{
  font-size:2.5rem;
  font-style: italic;
  margin-bottom:0.2em;
  padding-left:2em;
}
.col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.genre {
  width: 90vw;
  background-color: #1f1f1f;
  padding: 20px;
}

.genre h2 {
  margin-bottom: 10px;
  color: #ffffff;
}
.genre h4:hover{
  cursor: pointer;
  border-bottom: 1px solid white;
}
.genre ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.genre li {
  margin-bottom: 5px;
  color: #ffffff;
}
.headline{
  display:flex;
}
.books{
  display:flex;
  flex-direction: row;
  height:29em;
  width:100%;
  justify-content: space-around;
  padding-top:1em;
}
.book{
  width:100%;
  justify-content: center;
  text-align: center;
  -webkit-transition: transform 0.15s ease-in-out;
  backface-visibility: hidden;
}
.book:hover{
  cursor: pointer;
  transform: scale(1.1);
}
.book-cover{
  width:13em;
  border:1px solid white;
  height:20em;
  margin: 0 auto;
  margin-bottom: 0.5em;
}
.book-img{
  width:100%;
  height:100%;
}
.book-name{
  font-size:1.3rem;
  width:10em;
  height:7em;
  display: inline-block;
  overflow: hidden;
}
body {
  margin: 0;
}
.write{
  width:100%;
  padding: 0 10em 0 10em;
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
  background-color: #d9d9d9 !important;
}
.active::placeholder {
  color: black !important;
}
.write{
  width:100%;
  margin-bottom:20em;
}
.cover{
  display:flex;
  justify-content:center;
  margin-top:2em;
  margin-left:7em;
}
.cover img {
  width:35em;
  padding-right:10em;
  padding-left:0;
  height:35em;
}
.book-info{
  flex-grow: 1;
}
.book-info input{
  width:25em;
  margin: 0 0 0 1em;
}
.book-info textarea{
  min-width:30em;
  max-width:30em;
  min-height:22.5em
}
.title{
  display:flex;
  align-items: center;
  font-size:1.5rem
}
.main{
  display:flex;
  flex-direction: column;
  width:35em;
  padding-right:10em;
}
.main button{
  width:8em;
  border:1px solid white;
  margin: 1em 0 0 8.7em;
}
.description{
  margin-bottom:auto;
}
.book-info textarea{
  margin: 0 0 0 0.7em;
  width: 100%;
  border: none;
  border-radius: 10px;
  border: 2px solid #626262;
  background-color: #181818;
  color: white;
  width: 100%;
  font-size:1.3rem;
  height: 3.5em;
  padding:0;
}
.description1{
  font-size:1.2rem;
  margin-bottom:auto;
}
</style>
