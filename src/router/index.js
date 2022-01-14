import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);
const routes = [
    // {
    //     path: '/',
    //     redirect: '/dashboard'
    // },
    {
        path: '/',
        component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
        meta: { title: '自述文件' },
        children: [
            {
                path: '/',
                component: () => import(/* webpackChunkName: "dashboard" */ '../pages/home/Dashboard.vue'),
                meta: { title: '系统首页' }
            },
            {
                path: '/table',
                component: () => import(/* webpackChunkName: "table" */ '../pages/BaseTable.vue'),
                meta: { title: '基础表格' }
            },
            {
                path: '/form',
                component: () => import(/* webpackChunkName: "form" */ '../pages/BaseForm.vue'),
                meta: { title: '基本表单' }
            },

            {
                // 拖拽列表组件
                path: '/drag',
                component: () => import(/* webpackChunkName: "drag" */ '../pages/DragList.vue'),
                meta: { title: '拖拽列表' }
            },
            {
                // 拖拽Dialog组件
                path: '/dialog',
                component: () => import(/* webpackChunkName: "dragdialog" */ '../pages/DragDialog.vue'),
                meta: { title: '拖拽弹框' }
            },
            {
                // 国际化组件
                path: '/i18n',
                component: () => import(/* webpackChunkName: "i18n" */ '../pages/I18n.vue'),
                meta: { title: '国际化' }
            },
            {
                // 权限页面
                path: '/permission',
                component: () => import(/* webpackChunkName: "permission" */ '../pages/Permission/Permission.vue'),
                meta: { title: '权限测试', permission: true }
            },
            {
                path: '/404',
                component: () => import(/* webpackChunkName: "404" */ '../pages/404/404.vue'),
                meta: { title: '404' }
            },
            {
                path: '/403',
                component: () => import(/* webpackChunkName: "403" */ '../pages/403/403.vue'),
                meta: { title: '403' }
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
// router.beforeEach((to, from, next) => {
//     document.title = `${to.meta.title} | vue-manage-system`;
//     const role = localStorage.getItem('ms_username');
//     if (!role && to.path !== '/login') {
//         next('/login');
//     } else if (to.meta.permission) {
//         // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
//         role === 'admin' ? next() : next('/403');
//     } else {
//         // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
//         if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
//             Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
//                 confirmButtonText: '确定'
//             });
//         } else {
//             next();
//         }
//     }
// });

export default router;
