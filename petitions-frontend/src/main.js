import Vue from 'vue';
import App from './App.vue';
import Home from './Home.vue'
import Petitions from './Petitions.vue';
import Petition from './Petition.vue';
import Profile from './Profile.vue';
import axios from 'axios';
import VueAxios from "vue-axios";
import VueRouter from 'vue-router';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import VueSocialSharing from 'vue-social-sharing';

Vue.use(VueSocialSharing);
Vue.use(VueAxios, axios);
Vue.use(VueRouter);
Vue.use(Vuetify);


const routes = [
  {
    path: "/",
    component: Home
  },
  {
    path: "/petitions",
    name: "petitions",
    component: Petitions
  },
  {
    path: "/petitions/:petitionId",
    name: "petition",
    component: Petition
  },
  {
    path: "/petitions/categories",
    name: "categories",
    component: Petitions
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile
  }

];

const router = new VueRouter({
  routes: routes,
  mode: 'history'
});

new Vue({
  el: '#app',
  vuetify : new Vuetify(),
  router: router,
  render: h => h(App)
})
