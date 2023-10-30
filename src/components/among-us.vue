<script>
/*among us imposter (главная страница)*/
import axios from 'axios';
import dayjs from "dayjs";
import router from "../../router";
export default {
  computed: {
    classObject() {
      return {
        blurred: this.isBlurred,
        container: true,
        'text-light': true
      };
    }
  },
  data() {
    return {
      isBlurred: false,
      books: [],
      mostPopular: [],
      mostNew: [],
      new:[],
      popular: []
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
  },
  async mounted() {
    this.books = await this.loadBooks()
    this.popular = Array.from(this.books).sort((a,b) => Number(b.popularity) - Number(a.popularity));
    this.mostPopular = this.popular;
    while (this.mostPopular.length > 5) {
      this.mostPopular.pop();
    }
    this.new = Array.from(this.books).sort((a, b) => dayjs(b.createdAt) - dayjs(a.createdAt));
    this.mostNew = this.new;
    while(this.mostNew.length > 5) {
      this.mostNew.pop();
    }
  }
};
</script>

<template>
  <div :class="classObject">
    <div class="content">
      <div class = "heading">Каталог</div>
      <div class="col">
        <div class="list">
          <div class="genre">
            <div class = "headline"><h2>Самое популярное</h2> <h4 @click="this.$router.push({path: '/filter/popular'})" style = " margin-left:auto; margin-right:1em;">Просмотреть все >>></h4></div>
            <div class = "books">
              <div v-for="(book, index) in mostPopular" class = "book" @click="GotoBook(book._id)">
                <div class = "book-cover"><img class = "book-img" :src = "`${book.img}`"></div>
                <span class = "book-name">{{ book.title.toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <div class="genre">
            <div class = "headline"><h2>Новинки</h2> <h4 @click="this.$router.push({path: '/filter/new'})" style = " margin-left:auto; margin-right:1em;">Просмотреть все >>></h4></div>
            <div class = "books">
              <div class = "book" v-for="(book, index) in mostNew" @click="GotoBook(book._id)">
                <div class = "book-cover"><img class = "book-img" :src = "`${book.img}`"></div>
                <span class = "book-name">{{ book.title.toUpperCase() }}</span>
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
}

.genre {
  margin-bottom: 20px;
  width: 100%;
  background-color: #1f1f1f;
  border-radius: 5px;
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
