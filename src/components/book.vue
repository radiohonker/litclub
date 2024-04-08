<script>
import router from "../../router";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import 'dayjs/locale/ru';
import VueCookies from "vue-cookies";

dayjs.extend(relativeTime)
dayjs.locale('ru');
export default {
  name: "book",
  data(){
    return{
      id: '',
      book: [],
      isFavourited: '/empty-favourite.png',
      textSize: '1.6',
      description: true,
      read: false,
      login: null,
      pasta: '',
      newComment: '',
      deleteButtonText: 'УДАЛИТЬ',
      stuff_error: false,
      content: '',
      error_message: 'Ваш комментарий не может быть пустым'
    }
  },
  methods:{
    getCommentWordEnding(commentCount) {
      const lastTwoDigits = commentCount % 100;
      if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'Комментариев';
      }

      const lastDigit = commentCount % 10;
      if (lastDigit === 1) {
        return 'Комментарий';
      } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'Комментария';
      } else {
        return 'Комментариев';
      }
    },
    formatTime(time) {
      const stuff = dayjs(time);
      return stuff.fromNow(true) + ' назад'
},

    async deleteBook() {
      try {
        const confirmDelete = confirm("Вы уверены?");
        if (confirmDelete) {
          let response = await axios.delete(`/delete-book/${this.book._id}`);
          if (response.status === 200) {
            this.$router.push({ name: 'main' });
          }
        }
      } catch (error) {
        console.error(error);
      }
    },

    async submit_comment() {
      if (this.content.length !== 0) {
        if(this.login){
          let date = dayjs();
          try {
            let response = await axios.post(`/post-comment`, {
              author: this.login,
              date: date,
              content: this.content,
              id: this.id
            });

            if (response.status === 200) {
              this.book = await this.loadBook(this.id);
              this.content = '';
              this.scrollToNewComment();
              this.stuff_error = true
              this.error_message = 'Комментарий опубликован'
            }
          } catch (error) {
            console.error(error);
          }
        } else{
          this.stuff_error = true
          this.error_message = 'Зарегистрируйтесь для отправки комментариев'
        }

      } else {
        this.stuff_error = true;
      }
    },
    scrollToNewComment() {
      const commentElements = document.querySelectorAll('.comment-box');
    },

    navigateToRead() {
      this.$router.push({name: 'read', params:{id: this.id}});
    },
    resizeTextarea(event) {
      event.target.style.height = 'auto';
      event.target.style.height = (event.target.scrollHeight) + 'px';
    },
    async loadBook(id) {
      try {
        if(!this.login){
          const response = await axios.get(`/book/${id}`);
          const object = response.data;
          return object;
        }

        if(this.login){
          const response = await axios.get(`/book/${id}`);
          const response2 = await axios.post(`/book/read?id=${this.id}&login=${this.login}`);
          if(response2.data.favbooks.includes(id)){
            this.isFavourited = '/favourite.png'
          }
          else{
            this.isFavourited = '/empty-favourite.png'
          }
          const object = response.data;
          return object;
        }
      } catch (error) {
        console.error('Ошибка в поиске книги по id:', error);
        throw error;
      }

    },
    fontSize(operation) {
      const step = 0.1;
      if (operation === '-') {
        const currentFontSize = parseFloat(this.textSize);
        if (currentFontSize - step >= 1.3) {
          this.textSize = currentFontSize - step
        }
      } else if (operation === '+') {
        const currentFontSize = parseFloat(this.textSize);
        if (currentFontSize + step <= 1.8) {
          this.textSize = currentFontSize + step
        }
      }
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    TimeFormat(time){
      return dayjs(time).format('D MMMM YYYY')
    },
    async favourite() {
      if(this.login){
        if (this.isFavourited === '/empty-favourite.png') {
          this.isFavourited = '/favourite.png';
          let response = await axios.post(`/favourite?id=${this.id}&add=true`);
          console.log(response);
          let response2 = await axios.post(`/user/favs?id=${this.id}&login=${this.login}&add=true`);
          this.book = await this.loadBook(this.id);
        } else {
          this.isFavourited = '/empty-favourite.png';
          let response = await axios.post(`/favourite?id=${this.id}&add=false`);
          let response2 = await axios.post(`/user/favs?id=${this.id}&login=${this.login}&add=false`);
          console.log(response);
          this.book = await this.loadBook(this.id);
        }
      } else{
        this.pasta = 'Авторизуйтесь, чтобы добавить книгу в избранные'
      }
    },
    async loadAccount(){
      if (this.login){
        let response = await axios.get(`/user`, {params: {'login': this.login}});
        console.log(response.data)
        if (response.data.favbooks.includes(this.id)){
          this.isFavourited = '/favourite.png'
        }
      }
    },
    isLoggedIn() {
      let loginFromStore = this.$store.state.login;
      let loginFromCookie = VueCookies.get('login');
      return loginFromStore || loginFromCookie;
    },
    isFileOrLink(image) {
      const fileExtensionPattern = /\.(jpeg|jpg|gif|png)$/i;
      if (fileExtensionPattern.test(image)) {
        return `/${image}`;
      } else {
        return image;
      }
    }

  },
  async mounted() {
    this.scrollToTop();
    this.login = this.isLoggedIn()
    await this.loadAccount()
    this.id = this.$route.params.id;
    this.book = await this.loadBook(this.id);
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler() {
        this.scrollToTop();
        this.login = this.isLoggedIn()
        await this.loadAccount()
        this.id = this.$route.params.id;
        this.book = await this.loadBook(this.id);
      }
    }
  },
}
</script>

<template>
  <div class ="container">
    <div class = "content">
      <div class = "row">
        <div class = "col">
          <div class = "cover">
            <div class = "main">
              <img :src="isFileOrLink(book.img)" class = "book-img">
            </div>
            <div class = "book-info">
              <div class = "title"><h1>{{ this.book.title }}</h1></div>
              <div class = "description">Автор: {{this.book.author}} <br> Опубликовано {{ TimeFormat(this.book.createdAt) }}</div>
              <div class = "fav" @click = "favourite(this.id)"><img class = "favbutton" :src = "this.isFavourited"><div class = "favtext">{{ this.book.popularity }}</div></div>
              <div style = "font-size: 1rem;">{{pasta}}</div>
            </div>
          </div>
          <div class="button-container">
            <div class="variations">
              <button @click="this.description = true; this.read = false">Описание</button>
              <button class="rev" @click="this.description = false; this.read = true">Комментарии</button>
              <button @click="navigateToRead">Читать</button>
            </div>
            <button id="delete" v-if="this.book.author === this.login" class="btn btn-primary" @click="deleteBook">{{ deleteButtonText }}</button>

          </div>
          <hr>
          <div v-if="read" class = "read">
            <div class="comment-section">
              <div class="comment-heading">
                {{ this.book.comments.length }} {{ getCommentWordEnding(this.book.comments.length) }}
              </div>
              <div class = "input-stuff">
                <textarea
                    id="input"
                    v-model="this.content"
                    placeholder="Введите комментарий . . ."
                    @input="resizeTextarea"
                    :maxlength="500"
                ></textarea>
                <button type="submit" @click="submit_comment">Отправить</button>
                <span class = "error" v-if="stuff_error">{{ this.error_message }}</span>
              </div>

              <div class ="comment-box" v-for="comment in this.book.comments">
                <div class = "d-flex">
                  <div class = "comment-author">
                    {{ comment.author }}
                  </div>
                  <div class = "comment-date">
                    {{ formatTime(comment.date) }}
                  </div>
                </div>
                <div class = "comment-text">
                  {{ comment.content }}
                </div>
              </div>

            </div>
          </div>
          <div v-if="description" class = "read">
            <div :style="{ 'font-size': textSize +'rem'}">
              {{this.book.description}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
hr{
  border: 1px solid #c7c7c7;
  margin-top:0.5em;
}
.container {
  padding: 0em 10em 0 10em;
  width: 100vw;
  height: 100%;
  background: #161616;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
}
.content {
  margin-top:7em;
  height: 100%;
  width: 100%;
  border-radius: 10px;
}
.row{
  margin:0!important;
}
.col{
  min-height: 100vh;
  padding-top:0.5em;
  color:white;
  font-size:2rem;
}
.cover{
  display:flex;
  justify-content:center;
}
.book-info{
  margin-left:2em;
  width:20em;
  text-align: center;
}
.error{
  font-size:1.2rem;
}
.description{
  font-size:1.4rem;
  line-height: 1.3;
}
.book-img{
  width:15em;
  height:22em;
  border:1px solid white;
}
.title{
  font-size:3rem;
  margin-bottom:0.2em;
}
.fav{
  margin-top:1em;
  display:flex;
  font-size:3.5rem;
}
.fav:hover{
  cursor: pointer;
}
.comment-section button{
  width:8em;
  height:3em;
  border:1px solid #d9d6d6;
  background-color: rgba(255, 250, 205, 0);
  color: #d9d6d6;
  font-size:1.3rem;
  float: right;
  margin-top:1em;
}
.favbutton{
  width:1.2em;
  height:1.2em;
  margin-top:0.2em;
  margin-right:0.1em;
}
.variations{
  margin-top:2em;
  font-size:1.3rem;
  color: #d9d6d6;

}
.comment-section{
  width: 100%;
  padding: 0 3em 0 3em;
}
.button-container button{
  width:8em;
  height:2.5em;
  border:1px solid #d9d6d6;
  background-color: rgba(255, 250, 205, 0);
  color: #d9d6d6;
}
.variations button:last-child{
  margin-left:1em;
}
.button-container {
  display: flex;
  justify-content: space-between;
}

.variations {
  display: flex;
}

#delete{
  margin-top:45px;
  border: 1px solid red;
  color:red;
  width:10em;
  height:3.1em;
}

.size{
  font-size:1.3rem;
  margin-bottom:1.5em;
  color: #d9d6d6;
}
.comment-heading{
  font-size:1.1em;
  margin-bottom:1em;
  margin-top:2em;
}
textarea {
  width: 100%;
  resize: none;
  overflow: hidden;
  font-size: 1.1rem;
  color:whitesmoke;
  padding: 8px;
  border: 1px solid whitesmoke;
  border-radius: 1px;
  background-color:transparent;
}
.input-stuff{
  margin-bottom:5em;
  min-height:30vh;
}
.rev{
  margin-left:1em;
}
.size button{
  width:5em;
  height:2em;
  border:1px solid #d9d6d6;
  background-color: rgba(255, 250, 205, 0);
  color: #d9d6d6;
  margin-left:0.5em;
}
button:hover{
  cursor: pointer;
}
#input{
  font-size:1.4rem;
}
#input::placeholder{
  font-size:1.4rem;
}
.comment-box{
  border:1px solid white;
  padding: 0.8em 0.8em 0.8em 0.8em;
  margin-bottom:1em;
}
.comment-author{
  font-size:1.4rem;
  margin-bottom:1em;
}
.comment-text{
  font-size:1.5rem;
}
.comment-date{
  font-size:1rem;
  margin-bottom:1em;
  padding-left: 1em;
  padding-top:0.3em;
  color: rgba(245, 245, 245, 0.7);
}
.read{
  margin-bottom: 13em;
}
</style>
