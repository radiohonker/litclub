<script>
import appHeader from "./components/app-header.vue";
import AmongUs from "./components/among-us.vue";
import {RouterView} from 'vue-router'
import appFooter from './components/app-footer.vue'
export default {
  name: 'App',
  components: {
    AmongUs,
    appHeader,
    RouterView,
    appFooter
  },
  data() {
    return {
      isBlurred: false,
    };
  },
  methods: {
    toggleContentBlur() {
      this.isBlurred = !this.isBlurred;
    },
  },
};
</script>
<template>
  <header>
    <app-header @toggle-blur="toggleContentBlur"></app-header>
  </header>
  <main>
    <router-view :class="{ 'blur': isBlurred }"></router-view>
  </main>
  <app-footer></app-footer>
</template>
<style scoped>
  .blur {
    filter: blur(10px);
  }
  header{
    position:fixed;
    width:100%;
    z-index: 1000;
  }
  main{
    margin-top:0!important;
    background-color: #161616;
    width: 100%;
  }
  body{
    background-color: #161616;
  }
</style>
