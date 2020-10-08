import Vue from 'vue'
import VueRouter from 'vue-router'
import {originPrefix} from "@/main";
import store from '@/store/index'


Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'home',
        meta: {
            title: '主页'
        },
        component: () => import('@/views/home/index'),
    },
    {
        path: '/article',
        name: 'article',
        component: () => import('@/views/article/index'),
        children: [
            {
                path: '',
                name: 'article.list',
                meta: {
                    title: '文章列表'
                },
                component: () => import('@/views/article/List'),
            },
            {
                path: ':id',
                name: 'article.detail',
                meta: {
                    title: '文章详情'
                },
                query: {anchor: true},
                component: () => import('@/views/article/Detail'),
            },

        ]
    },
    {
        path: '/msg-board',
        name: 'msgBoard',
        meta: {
            title: '留言板'
        },
        component: () => import('@/views/msg-board/index')
    },
    {
        path: '/record',
        name: 'record',
        meta: {
            title: '记录'
        },
        component: () => import('@/views/record/index')
    },
    {
        path: '/backend',
        name: 'backend',
        redirect: {name: 'backend.config'},
        component: () => import('@/views/backend/index'),
        children: [
            {
                path: 'config',
                name: 'backend.config',
                meta: {
                    title: '后台-配置'
                },
                component: () => import('@/views/backend/Config'),
            },
            {
                path: 'md',
                name: 'backend.md',
                meta: {
                    title: '后台-文章列表'
                },
                component: () => import('@/views/backend/Md'),
            },
            {
                path: 'md/:id',
                name: 'backend.md.detail',
                meta: {
                    title: '后台-文章'
                },
                component: () => import('@/views/backend/MdDetail')
            },
            {
                path: 'record',
                name: 'backend.record',
                meta: {
                    title: '后台-记录列表'
                },
                component: () => import('@/views/backend/Record')
            },
            {
                path: 'record/:id',
                name: 'backend.record.detail',
                meta: {
                    title: '后台-记录'
                },
                component: () => import('@/views/backend/RecordDetail')
            },
            {
                path: 'theme',
                name: 'backend.theme',
                meta: {
                    title: '后台-主题'
                },
                component: () => import('@/views/backend/Theme'),
            },
        ]
    },
];

let router = new VueRouter({
    routes,
    // mode: 'history'
});

router.beforeEach((to, from, next)=> {
    store.commit('toggleLoading', true)
    document.title = to.meta.title || '未知页面';
    // 是否加载 markdown(include hljs) css
    let mdStyle = document.head.querySelector('#markdown-stylesheet');
    if (['article.detail', 'backend.md.detail', 'msgBoard'].indexOf(to.name) !== -1) {
        mdStyle.href = `${originPrefix}/markdown.css?ran=${new Date().getTime()}`;
    } else {
        mdStyle.href = ''
    }
    next()
});
router.afterEach(() => {
    store.commit('toggleLoading', false)
})

export default router