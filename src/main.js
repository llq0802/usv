import Vue from 'vue';
import App from './App.vue';
import router from './router';
import './plugins/elementui';
import 'nprogress/nprogress.css';
import './plugins/directives';
import 'babel-polyfill';
import './plugins/amap';
import './plugins/signalR';

Vue.config.productionTip = false;
Vue.config.devtools = true;
// Object.prototype[Symbol.iterator] = function () {
//   let index = 0;
//   return {
//     next: (val) => {
//       return {
//         value: index++,
//         done: index < val.length
//       };
//     };
//   }
// };

new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app');
