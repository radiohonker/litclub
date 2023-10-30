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
  data() {
    return {
      id: '',
      book: [],
      isFavourited: '/empty-favourite.png',
      textSize: '1',
      description: true,
      read: false,
      login: null,
      pasta: '',
      pageSize: 1000,
      bookmark: null,
      currentPage: 1,
      totalPages: 0,
      contentLoaded: false,
      pages: [],
      goToBookmark: '/x.png',
      autoBookmark: false
    }
  },
  methods: {
    async loadBook(id) {
      try {
        const response = await axios.get(`/book/${id}`);
        const bookData = response.data;

        if (this.login) {
          const response2 = await axios.post(`/book/read?id=${this.id}&login=${this.login}`);
          if (response2.data.favbooks.includes(id)) {
            this.isFavourited = '/favourite.png';
          } else {
            this.isFavourited = '/empty-favourite.png';
          }
        }

        return bookData;
      } catch (error) {
        console.error('Ошибка в поиске книги по id:', error);
        throw error;
      }
    },
    fontSize(operation) {
      const step = 0.1;
      if (operation === '-') {
        const currentFontSize = parseFloat(this.textSize);
        if (currentFontSize - step >= 0.9) {
          this.textSize = currentFontSize - step
        }
      } else if (operation === '+') {
        const currentFontSize = parseFloat(this.textSize);
        if (currentFontSize + step <= 1.1) {
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
    async loadAccount() {
      if (this.login) {
        let response = await axios.get(`/user`, { params: { login: this.login } });
        this.goToBookmark = response.data.showbookmark;
        let matchingBookmark = response.data.bookmark.find(obj => obj.bookId === this.id);
        if (this.goToBookmark == "/v.png" && matchingBookmark) {
          if(matchingBookmark.pageIndex % 2 == 0){
            this.currentPage = matchingBookmark.pageIndex - 1;
          }
          else{
            this.currentPage = matchingBookmark.pageIndex;
          }
        }
        if (response.data.favbooks.includes(this.id)) {
          this.isFavourited = '/favourite.png';
        }
        await this.loadBookmark(response);
      }
    },

    async loadBookmark(response) {
      try {
        const user = response.data;
        const matchingBookmark = user.bookmark.find(bm => bm.bookId === this.id);

        if (matchingBookmark) {
          this.bookmark = {
            pageIndex: matchingBookmark.pageIndex,
            wordIndex: matchingBookmark.wordIndex,
          };
        }
      } catch (error) {
        console.error('Ошибка в загрузке закладки:', error);
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
    },
    async bookmarkClick() {
      if(this.login){
        if(this.goToBookmark === "/x.png"){
          this.goToBookmark = "/v.png"
          this.autoBookmark = true
          if(this.bookmark){
            if(this.bookmark.pageIndex % 2 == 0){
              this.currentPage = this.bookmark.pageIndex - 1
            }
            else{
              this.currentPage = this.bookmark.pageIndex
            }
          }
        }
        else{
          this.goToBookmark = "/x.png"
          this.autoBookmark = false
        }
        await axios.post('/user/bookmark/img', {
          img: this.goToBookmark,
          login: this.login,
        });
      }
    },
    divideContentIntoPages(content) {
      const pages = [];
      let currentPage = [];
      let currentLength = 0;
      const paragraphs = content.split("\n");
      const uniqueParagraphs = [...new Set(paragraphs)]; // Remove duplicate paragraphs

      for (const paragraph of uniqueParagraphs) {
        const words = paragraph.trim().split(" ");
        for (const word of words) {
          if (currentLength + word.length <= this.pageSize) {
            currentPage.push(word + " ");
            currentLength += word.length + 1;
          } else {
            pages.push({
              content: currentPage.join("").trim(),
              words: currentPage.slice(),
            });
            currentPage = [word + " "];
            currentLength = word.length + 1;
          }
        }
        currentPage.push("\n");
        currentLength += 1;
      }
      if (currentPage.length > 0) {
        pages.push({
          content: currentPage.join("").trim(),
          words: currentPage.slice(),
        });
      }
      this.pages = pages;
      this.totalPages = pages.length;
      this.contentLoaded = true;
    },

    async reloadPages() {
      try {
        const response = await axios.get(`/book/${this.id}`);
        const object = response.data;
        this.book = object;
        this.divideContentIntoPages(this.book.content);
      } catch (error) {
        console.error('Ошибка в поиске книги по id:', error);
        throw error;
      }
    },
    async setBookmark(wordIndex, pageIndex) {
      if (this.login) {
        this.bookmark = {
          pageIndex: pageIndex + 1,
          wordIndex,
        };
        try {
          await axios.post('/user/bookmark', {
            bookId: this.id,
            login: this.login,
            pageIndex: pageIndex + 1,
            wordIndex: wordIndex,
          });
        } catch (error) {
          console.error('Error posting bookmark:', error);
        }
      }
    },
    previousPage() {
      if (this.currentPage > 2) {
        this.currentPage -= 2;
      } else if (this.currentPage === 2) {
        this.currentPage = 1;
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage += 2;
      } else if (this.currentPage === this.totalPages - 1) {
        this.currentPage = this.currentPage;
      }
    },
    goRead(){
      this.$router.push({name: 'read', params:{id: this.id}});
    },
    GotoBook(id){
      this.$router.push({name: 'book', params:{id: id}});
    },
  },
  async mounted() {
    try {
      this.scrollToTop();
      this.login = this.isLoggedIn();
      await this.loadAccount();
      this.id = this.$route.params.id;
      this.book = await this.loadBook(this.id);
      this.divideContentIntoPages(this.book.content);
    } catch (error) {
      console.error('Ошибка в загрузке книги:', error);
    }
  },

  watch: {
    contentLoaded(newVal) {
      if (newVal == false) {
        this.reloadPages();
      }
    },
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
  computed: {
    isBookmark() {
      return (pageIndex, wordIndex) => {
        if (this.bookmark) {
          return (
              pageIndex + 1 === this.bookmark.pageIndex &&
              wordIndex === this.bookmark.wordIndex
          );
        }
        return false;
      };
    },
    isPageVisible() {
      return (pageIndex, column) => {
        const startingPageIndex = Math.floor((this.currentPage - 1) / 2) * 2;
        return pageIndex >= startingPageIndex + column && pageIndex < startingPageIndex + column + 1;
      };
    },
  },

}
</script>
<template>
  <div class="container">
    <div class="content">
      <div class ="goback" @click="GotoBook(this.book.id)">&lt;&lt;&lt; Книга "{{this.book.title}}"</div>
      <div class="row">
        <div class="col">
          <div class="size">
            Шрифт: <button @click="fontSize('-')">Меньше</button> <button @click="fontSize('+')">Больше</button>
            <span class="bkmark">Автоматически переходить к закладке:</span> <img width="30" :src="goToBookmark" @click="bookmarkClick">
          </div>
          <div class = "upper-part">
            <div v-if="contentLoaded" class="two-cols-container">
              <div class="left-column">
                <div class="text-container" :style="{ 'font-size': textSize + 'rem' }">
                  <div class="page-content" v-for="(page, pageIndex) in pages" :key="pageIndex" v-show="isPageVisible(pageIndex, 0)">
                  <span v-for="(word, wordIndex) in page.words" :key="wordIndex" :class="{ 'highlight': isBookmark(pageIndex, wordIndex) }" @click="setBookmark(wordIndex, pageIndex)">
                    {{ word }}
                  </span>
                  </div>
                </div>
              </div>

              <div class="right-column">
                <div class="text-container" :style="{ 'font-size': textSize + 'rem' }">
                  <div class="page-content" v-for="(page, pageIndex) in pages" :key="pageIndex" v-show="isPageVisible(pageIndex, 1)">
                  <span v-for="(word, wordIndex) in page.words" :key="wordIndex" :class="{ 'highlight': isBookmark(pageIndex, wordIndex) }" @click="setBookmark(wordIndex, pageIndex)">
                    {{ word }}
                  </span>
                  </div>
                </div>
              </div>
            </div>

            <div style="height:60vh;" v-else @click="reloadPages">Загрузка книги... <br>Нажмите если загрузка идет слишком долго</div>
          </div>
          <div class ="bottom-part">
            <div class="size" style="margin: 2em auto; justify-content: center; display: flex;">
              <button @click="previousPage()" :disabled="currentPage === 1" style="margin-right: 1em"> &lt; </button>
              <span>
                Страницы {{ currentPage }}-{{ currentPage === totalPages ? currentPage : currentPage + 1 }} из {{ totalPages }}
              </span>

              <button @click="nextPage()" :disabled="currentPage === totalPages" style="margin-left: 1em"> > </button>
            </div>
            <div class="page-choose">
              <input
                  type="range"
                  class="page-range"
                  min="0"
                  :max="totalPages - 1"
                  step="2"
                  placeholder="1"
                  :value="currentPage - 1"
                  @input="currentPage = parseInt($event.target.value) + 1"
              >
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>

hr {
  border: 1px solid #c7c7c7;
  margin-top: 0.5em;
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
  margin-top: 5em;
  height: 100%;
  width: 100%;
  border-radius: 10px;
}

.row {
  margin: 0!important;
}

.col {
  min-height: 80vh;
  padding-top: 0.5em;
  margin-bottom:15em;
  color: white;
  font-size: 2rem;
  display: flex;
  flex-direction: column;
  height:80vh;
}
.upper-part {
  flex-grow: 1;
}
.bottom-part {
  flex-shrink: 0;

}
.two-cols-container {
  display: flex;
  justify-content: space-between;
  min-height: 60vh;
}

.variations button {
  margin-right:1.5em;
  width: 8em;
  height: 2.5em;
  border: 1px solid #d9d6d6;
  background-color: rgba(255, 250, 205, 0);
  color: #d9d6d6;
}
.size {
  font-size: 1.3rem;
  margin-bottom: 1.5em;
  color: #d9d6d6;
}

.size button {
  width: 5em;
  height: 2em;
  border: 1px solid #d9d6d6;
  background-color: rgba(255, 250, 205, 0);
  color: #d9d6d6;
  margin-left: 0.5em;
}
button:hover{
  outline:1px solid white;
  cursor:pointer;
}

.left-column,
.right-column {
  width: 48%;
  margin-bottom: 2em;
  max-height: 800px;
}

.page-content {
  margin-bottom: 2em;
  white-space: pre-wrap;
}

.page-content span {
  display: inline;
  white-space: pre-wrap;
}

.page-content {
  padding: 0.5em 1em;
}

.page-content.highlight {
  background-color: rgba(255, 255, 0, 0.21);
}

.page-choose {
  margin: 0 auto;
  width: 80%;
}

.page-range {
  width: 80%;
  color:black;
}

input[type=range] {
  height: 25px;
  -webkit-appearance: none;
  margin: 10px auto;
  width: 100%;
  background-color: #161616;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: #d9d6d6;
  border-radius: 1px;
  border: 0px solid #000000;
}
input[type=range]::-webkit-slider-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: none;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: #d9d6d6;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -7px;
}
input[type=range]:focus::-webkit-slider-runnable-track {
  background: #d9d6d6;
}
input[type=range]::-moz-range-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  box-shadow: 0px 0px 0px #000000;
  background: #d9d6d6;
  border-radius: 1px;
  border: 0px solid #000000;
}
input[type=range]::-moz-range-thumb {
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #d9d6d6;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: #A1D0FF;
  cursor: pointer;
}
input[type=range]::-ms-track {
  width: 100%;
  height: 5px;
  cursor: pointer;
  animate: 0.2s;
  background: transparent;
  border-color: transparent;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: #2497E3;
  border: 0px solid #000000;
  border-radius: 2px;
  box-shadow: 0px 0px 0px #000000;
}
input[type=range]::-ms-fill-upper {
  background: #2497E3;
  border: 0px solid #000000;
  border-radius: 2px;
  box-shadow: 0px 0px 0px #000000;
}
input[type=range]::-ms-thumb {
  margin-top: 1px;
  box-shadow: 0px 0px 0px #000000;
  border: 1px solid #2497E3;
  height: 18px;
  width: 18px;
  border-radius: 25px;
  background: #A1D0FF;
  cursor: pointer;
}
input[type=range]:focus::-ms-fill-lower {
  background: #2497E3;
}
input[type=range]:focus::-ms-fill-upper {
  background: #2497E3;
}
.highlight {
  background-color: rgba(255, 255, 0, 0.21);
}
.bkmark{
  margin-left:1em;
}
.size img{
  margin-left:0.3em;
}
.size img:hover{
  cursor: pointer;
}
.goback{
  color:#d9d6d6;
  font-size:0.9rem;
}
.goback:hover{
  cursor: pointer;
  text-decoration: underline;
}
</style>