// 1.引用 vue 没什么要说的
import Vue from 'vue'
// 3.引用路由
import VueRouter from 'vue-router'
// 光引用不成，还得使用
Vue.use(VueRouter)
// 2.入口文件为 src/App.vue 文件 所以要引用
import App from './App.vue'
// 4.引用路由配置文件
import routes from './config/routes'
// 5.引用API文件
import api from './api/api'
// 6.将API方法绑定到全局
Vue.prototype.$api = api
// 使用配置文件规则
const router = new VueRouter({
  routes
})

// 引入task用于引入公用方法
import task from './utils/task'
Vue.prototype.$task = task
// 引入本地存储
import store from 'store'
Vue.prototype.$store = store

// 引用ElementUI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
Vue.use(ElementUI)

/* eslint-disable no-new */
new Vue({
  router,
  el: '#app',
  render: (h) => h(App)
})
