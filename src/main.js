import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './utils/directives';
import 'babel-polyfill';

Vue.config.productionTip = false;
Vue.use(ElementUI, {
    size: 'small' //小号
});
//全局修改默认配置，点击空白处不能关闭弹窗dialog
ElementUI.Dialog.props.closeOnClickModal.default = false;

new Vue({
    router,
    render: (h) => h(App)
}).$mount('#app');
