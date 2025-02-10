import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
const history = createWebHistory();
const routes : Array<RouteRecordRaw> = [
    {
        path: '/front',
        name: 'Front',
        component: () => import('../views/front/main.vue'),
        children: [
            {
                path: 'index',
                name: 'FrontIndex',
                component: () => import('../views/front/index.vue')
            },
            {
                path: 'goods_list',
                name: 'FrontGoodsList',
                component: () => import('../views/front/goods_list.vue')
            },
            {
                path: 'goods/:id',
                name: 'FrontGoods',
                component: () => import('../views/front/goods.vue')
            },
            {
                path: 'customer',
                name: 'FrontCustomer',
                component: () => import('../views/front/customer.vue'),
                children: [
                    {
                        path: 'mine',
                        name: 'FrontMine',
                        component: () => import('../views/front/mine.vue')
                    },
                    {
                        path: 'order_list',
                        name: 'FrontOrderList',
                        component: () => import('../views/front/order_list.vue')
                    },
                    {
                        path: 'customer_im',
                        name: 'FrontCustomerIm',
                        component: () => import('../views/front/customer_im.vue')
                    },
                    {
                        path: 'appointment_list',
                        name: 'FrontAppointmentList',
                        component: () => import('../views/front/appointment_list.vue')
                    }
                ]
            },
            {
                path: 'goods_snapshot/:id/:mode',
                name: 'FrontGoodsSnapshot',
                component: () => import('../views/front/goods_snapshot.vue')
            }
        ]
    },

    {
        path: '/mis',
        name: 'Main',
        component: () => import('../views/mis/main.vue'),
        children: [
            {
                path: 'home',
                name: 'MisHome',
                component: () => import('../views/mis/home.vue'),
                meta: {
                    title: 'ホーム'
                }
            },
            {
                path: 'dept',
                name: 'MisDept',
                component: () => import('../views/mis/dept.vue'),
                meta: {
                    title: '部署管理',
                    isTab: true
                }
            },
            {
                path: 'role',
                name: 'MisRole',
                component: () => import('../views/mis/role.vue'),
                meta: {
                    title: '役割管理',
                    isTab: true
                }
            },
            {
                path: 'user',
                name: 'MisUser',
                component: () => import('../views/mis/user.vue'),
                meta: {
                    title: 'ユーザー管理',
                    isTab: true
                }
            },
            {
                path: 'goods',
                name: 'MisGoods',
                component: () => import('../views/mis/goods.vue'),
                meta: {
                    title: '健康診断コース',
                    isTab: true
                }
            },
            {
                path: 'order',
                name: 'MisOrder',
                component: () => import('../views/mis/order.vue'),
                meta: {
                    title: '注文管理',
                    isTab: true
                }
            },
            {
                path: 'rule',
                name: 'MisRule',
                component: () => import('../views/mis/rule.vue'),
                meta: {
                    title: 'プロモーション',
                    isTab: true
                }
            },
            {
                path: 'customer_im',
                name: 'MisCustomerIm',
                component: () => import('../views/mis/customer_im.vue'),
                meta: {
                    title: 'サポートチャット',
                    isTab: true
                }
            },
            {
                path: 'appointment',
                name: 'MisAppointment',
                component: () => import('../views/mis/appointment.vue'),
                meta: {
                    title: '健診予約',
                    isTab: true
                }
            },
            {
                path: 'customer_checkin',
                name: 'MisCustomerCheckin',
                component: () => import('../views/mis/customer_checkin.vue'),
                meta: {
                    title: '健康診断の受付',
                    isTab: true
                }
            },
            {
                path: 'checkup',
                name: 'MisDoctorCheckup',
                component: () => import('../views/mis/doctor_checkup.vue'),
                meta: {
                    title: '医師の検査',
                    isTab: true
                }
            },
            {
                path: 'flow_regulation',
                name: 'MisFlowRegulation',
                component: () => import('../views/mis/flow_regulation.vue'),
                meta: {
                    title: '人数制限',
                    isTab: true
                }
            },
            {
                path: 'checkup_report',
                name: 'MisCheckupReport',
                component: () => import('../views/mis/checkup_report.vue'),
                meta: {
                    title: '健康診断報告書',
                    isTab: true
                }
            },
        ]
    },
    {
        path: '/mis/login',
        name: 'MisLogin',
        component: () => import('../views/mis/login.vue')
    },
    {
        path: '/404',
        name: '404',
        component: () => import('../views/404.vue')
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/404'
    }
];
const router = createRouter({
    history,
    routes
});

router.beforeEach((to, _, next) => {
    let permissions = localStorage.getItem('permissions');
    let token = localStorage.getItem('token');
    let fullPath = to.fullPath;
    if (fullPath.startsWith('/mis') && fullPath != '/mis/login') {
        if (permissions == null || permissions == '' || token == null || token == '') {
            next({ name: 'MisLogin' });
        } else {
            return next();
        }
        return next();
    } else if (fullPath.startsWith('/front/customer') || fullPath.startsWith('/front/goods_snapshot')) {
        if (token == null || token == '') {
            next({ name: 'FrontIndex' });
        } else {
            return next();
        }
    } else {
        return next();
    }
});

export default router;

