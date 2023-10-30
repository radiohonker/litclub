<script>
/*among us imposter (главная страница)*/
import axios from 'axios';
import dayjs from "dayjs";
import router from "../../router";
import VueCookies from "vue-cookies";
export default {
  data() {
    return {
      isBlurred: false,
      books: [],
      popular: [],
      items: [],
      favbooksIds: [],
      topic: ''
    };
  },
  methods:{
    async loadBooks(){
      let response = await axios.get(`books`);
      console.log(response.data)
      return response.data
    },
    GotoBook(id){
      this.$router.push({name: 'book', params:{id: id}});
    },
    removeDuplicates(id) {
      const uniqueIds = [...new Set(id)];
      return uniqueIds;
    },
    isLoggedIn() {
      let loginFromStore = this.$store.state.login;
      let loginFromCookie = VueCookies.get('login');
      return loginFromStore || loginFromCookie;
    },
    async loadAccount(){
      let response = await axios.get(`/user`, {params: {'login': this.login}});
      return response.data
    },
    async getBooks(id) {
      console.log(id)
      const response = await axios.get('/bookarray', { params: { id: id } });
      const object = response.data;
      let count = 0 ;
      console.log('id', id)
      const sortedBooks = id.map(bookId => object.find(book => book._id === bookId));
      console.log('sort', sortedBooks)
      return sortedBooks;
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
    this.books = await this.loadBooks()
    if(this.$route.params.array == 'popular'){
      this.popular = Array.from(this.books).sort((a,b) => Number(b.popularity) - Number(a.popularity));
      this.items = this.popular;
      this.topic = "Популярное"
    }
    if(this.$route.params.array == 'new'){
      this.new = Array.from(this.books).sort((a, b) => dayjs(b.createdAt) - dayjs(a.createdAt));
      this.items = this.new;
      this.topic = "Новые"
    }

    this.login = this.isLoggedIn();
    this.bookIds = await this.loadAccount();

    if(this.$route.params.array == 'fav'){
      this.topic = "Избранные"
      this.items = await this.getBooks(this.bookIds.favbooks);
    }
  },
  computed: {
    chunkedItems() {
      const chunkSize = 5;
      const result = [];
      let currentRow = [];
      for (let i = 0; i < this.items.length; i++) {
        currentRow.push(this.items[i]);
        if (currentRow.length === chunkSize || i === this.items.length - 1) {
          result.push(currentRow);
          currentRow = [];
        }
      }
      return result;
    }
  }
};
</script>

<template>
  <div class="container">
    <div class="content">
      <div class = "heading">{{ topic }}</div>
      <div class="col">
        <div class="list">
          <div class="genre" v-for="(rowItems, rowIndex) in chunkedItems" :key="rowIndex">
            <div class = "headline"></div>
            <div class = "books">
              <div  v-for="(book, itemIndex) in rowItems" :key="itemIndex" class = "book" @click="GotoBook(book._id)">
                <div class = "book-cover"><img class = "book-img" :src = "isFileOrLink(book.img)"></div>
                <span class = "book-name">{{ book.title.toUpperCase() }}</span>
                <div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.content {
  margin-top:5em;
  height: 100%;
  width: 100%;
  background: #161616;
  margin-bottom: 5em;
}
.heading{
  font-size:2.5rem;
  margin-bottom:0.2em;
  padding-left:2em;
}
.col {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.list {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100vw;
  max-width: 90vw;
  margin-bottom:2em;
  border-radius: 5px;
}

.genre {
  width: 100%;
  background-color: #1f1f1f;
  padding: 20px;
}

.genre h2 {
  margin-bottom: 10px;
  color: #ffffff;
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
.blurred {
  filter: blur(5px);
}
.headline h4:hover{
  cursor: pointer;
  border-bottom: 1px solid white;
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
</style>
