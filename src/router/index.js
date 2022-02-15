import Vue from 'vue';
import Router from 'vue-router';
import { getStorage } from '@/utils/localStorage';
import { checkTokenTime } from '@/utils/token';
// import { Message } from 'element-ui';

Vue.use(Router);
export const routes = [
  {
    path: '/',
    component: () => import(/* webpackChunkName: "home" */ '../components/common/layout/Index.vue'),
    meta: { title: '首页' },
    children: [
      //meta中hidden表示是否在侧边菜单栏中显示,默认显示,为true则不显示
      {
        path: '/',
        component: () => import(/* webpackChunkName: "homepage" */ '../pages/home/HomePage.vue'),
        meta: { title: '运行状态', icon: 'el-icon-lx-home' }
      },

      {
        path: '/waterway',
        component: () =>
          import(/* webpackChunkName: "waterway" */ '../pages/waterway/WaterWay.vue'),
        meta: { title: '航道航标管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/portberth',
        component: () => import(/* webpackChunkName: "portberth" */ '../pages/portberth/Port.vue'),
        meta: { title: '港口泊位管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/chartshow',
        component: () =>
          import(/* webpackChunkName: "portberth" */ '../pages/chartshow/ChartShow.vue'),
        meta: { title: '航图展示管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/user',
        component: () => import(/* webpackChunkName: "user" */ '../pages/user/User.vue'),
        meta: { title: '用户信息管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/organ',
        component: () =>
          import(/* webpackChunkName: "organization" */ '../pages/organization/Organ.vue'),
        meta: { title: '组织机构管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/shipinfo',
        component: () =>
          import(/* webpackChunkName: "shipinfo" */ '../pages/shipinfo/ShipInfo.vue'),
        meta: { title: '船舶信息管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/plan',
        component: () => import(/* webpackChunkName: "plan" */ 'pages/plan/Plan'),
        meta: { title: '计划管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/route',
        component: () => import(/* webpackChunkName: "route" */ 'pages/route/Route'),
        meta: { title: '航线管理', icon: 'el-icon-lx-home' }
      },
      {
        path: '/runstate',
        component: () =>
          import(/* webpackChunkName: "runstate" */ 'pages/shipRunningState/ShipRunningState'),
        meta: { title: '运行详情', icon: 'el-icon-lx-home' }
      },
      {
        path: '/404',
        component: () => import(/* webpackChunkName: "404" */ '../pages/404/404.vue')
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
//push
const originalPush = Router.prototype.push;
const originalReplace = Router.prototype.replace;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch((err) => err);
};
// replace
Router.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch((err) => err);
};
const router = new Router({
  routes,
  mode: 'history'
});

//使用钩子函数对路由进行拦截跳转
router.beforeEach((to, from, next) => {
  const token = getStorage('token');
  const tokenTime = getStorage('tokenTime');
  // token是否过期
  const isPast = checkTokenTime(tokenTime, 0);
  if (to.path === '/login') {
    return next();
  } else {
    if (!token || isPast) {
      // if (document.getElementsByClassName('el-message').length) return next('./login');
      // Message({
      //   message: '用户身份信息失效，请重新登录',
      //   type: 'error',
      //   duration: 4000
      // });
      return next('./login');
    } else {
      return next();
    }
  }
});

export default router;
