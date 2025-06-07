import router from './router'
import { ElMessage } from 'element-plus'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken } from '@/utils/auth'
import { isHttp } from '@/utils/validate'
import { isRelogin } from '@/utils/request'
import useUserStore from '@/store/modules/user'
import useSettingsStore from '@/store/modules/settings'
import usePermissionStore from '@/store/modules/permission'

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/register'];
console.log('当前路由信息111:', router.getRoutes()) // 查看当前路由信息

router.beforeEach((to, from, next) => {
  NProgress.start()
  console.log('当前路由信息2222:', router.getRoutes()) // 查看当前路由信息
  if (getToken()) {
    to.meta.title && useSettingsStore().setTitle(to.meta.title)
    /* has token*/
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      if (useUserStore().roles.length === 0) {
        isRelogin.show = true
        // 判断当前用户是否已拉取完user_info信息
        useUserStore().getInfo().then(() => {
          isRelogin.show = false
          usePermissionStore().generateRoutes().then(accessRoutes => {
            accessRoutes.forEach(route => {
              if (!isHttp(route.path)) {
                try {
                  router.addRoute(route)
                  console.debug(`成功添加路由: ${route.path}`)
                } catch (error) {
                  console.error(`添加路由失败: ${route.path}`, error)
                }
              }
            })
            if (!router.hasRoute('Elderly')) {
              router.addRoute('Manage', {  // 注意这里添加了父路由 'Manage'
                path: 'elderly',           // 子路由不需要前导斜杠
                component: () => import('@/views/manage/elderly/index.vue'),
                name: 'Elderly',
                meta: { 
                  title: '老人信息', 
                  icon: 'elderly',
                  permissions: ['manage:elderly:list']  // 添加权限标识
                }
              });
              console.log('[动态添加路由]', '/manage/elderly');
            }
            if (!router.hasRoute('Items')) {
              router.addRoute('Manage', {  // 注意这里添加了父路由 'Manage'
                path: '/manage/items',           // 子路由不需要前导斜杠
                component: () => import('@/views/manage/items/index.vue'),
                name: 'Items',
                meta: { 
                  title: '订单项信息', 
                  icon: 'Items',
                  permissions: ['manage:items:list']  // 添加权限标识
                }
              });
              console.log('[动态添加路由]', '/manage/items');
            }
              if (!router.hasRoute('Orders')) {
                router.addRoute('Manage', {  // 注意这里添加了父路由 'Manage'
                  path: '/manage/orders',           // 子路由不需要前导斜杠
                  component: () => import('@/views/manage/orders/index.vue'),
                  name: 'Orders',
                  meta: { 
                    title: '订单信息', 
                    icon: 'orders',
                    permissions: ['manage:orders:list']  // 添加权限标识
                  }
                });
                console.log('[动态添加路由]', '/manage/orders');
            }
            next({ ...to, replace: true }) // hack方法 确保addRoutes已完成
          })
        }).catch(err => {
          useUserStore().logOut().then(() => {
            ElMessage.error(err)
            next({ path: '/' })
          })
        })
      } else {
        next()
      }
    }
  } else {
    // 没有token
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
