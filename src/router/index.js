import Vue from 'vue';
import Router from 'vue-router';
import { getStorage } from '@/utils/localStorage';
Vue.use(Router);
const routes = [
  // {
  //     path: '/',
  //     redirect: '/dashboard'
  // },
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '../components/common/layout/Index.vue'),
    meta: { title: '首页' },
    children: [
      {
        path: '/',
        component: () => import(/* webpackChunkName: "dashboard" */ '../pages/home/Dashboard.vue'),
        meta: { title: '运行状态' }
      },
      {
        path: '/user',
        component: () => import(/* webpackChunkName: "user" */ '../pages/user/User.vue'),
        meta: { title: '用户管理' }
      },

      // {
      //     // 权限页面
      //     path: '/permission',
      //     component: () => import(/* webpackChunkName: "permission" */ '../pages/permissions/Permission.vue'),
      //     meta: { title: '权限测试', permission: true }
      // },
      {
        path: '/404',
        component: () => import(/* webpackChunkName: "404" */ '../pages/404/404.vue'),
        meta: { title: '404' }
      },
      {
        path: '/t',
        component: () => import(/* webpackChunkName: "test" */ 'pages/plan/Plan'),
        meta: { title: '测试' }
      }
    ]
  },
  {
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */ '../pages/login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '*',
    redirect: '/404'
  }
];

// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};

const router = new Router({
  routes,
  mode: 'history'
});

//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
  const token = getStorage('token');
  if (to.path === '/login') return next();
  if (!token) {
    // this.$message.error('用户登录信息失效,请重新登录')
    return next('./login');
  } else {
    return next();
  }
});

export default router;
