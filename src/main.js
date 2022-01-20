import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/elementui';
import 'nprogress/nprogress.css';
import './assets/css/icon.less';
import './plugins/directives';
import 'babel-polyfill';

Vue.config.productionTip = false;

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
