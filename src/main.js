import Vue from 'vue'
import App from './App.vue'
import Router from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
import Axios from './axios'
import VueAxios from 'vue-axios'
import store from './store'
import ECharts from 'echarts'
// import routerList from './router'
import Home from './frame/home.vue'
import Login from './frame/login.vue'
import DataList from './components/view-manage/dataList.vue'
import viewPage from './components/view-list/view-page.vue'
import departPage from './components/depart-manage/depart-page.vue'
import personPage from './components/depart-manage/person-page.vue'
import directiveList from './components/directive-manage/directive-list.vue'
import accountList from './components/account-manage/account-list.vue'
import resourceList from './components/resource-manage/resource-list.vue'
import roleList from './components/role-manage/role-list.vue'
import systemList from './components/system-manage/system-list.vue'
import templateList from './components/template-manage/template-list.vue'
import platformList from './components/platform-manage/platform-list.vue'

import informationList from './components/information-manage/information-list.vue'
import workOrderList from './components/workorder-manage/workorder-list.vue'

Vue.use(Router);
var setRoutes =  function (menuList){
  let menuObj = {
    '/': Home,
    '/chartPage': DataList,
    '/cameraPage': DataList,
    '/mailPage': DataList,
    '/viewPage': viewPage,
    '/departPage': departPage,
    '/personPage': personPage,
    '/companyPage': personPage,
    '/resourceList': resourceList,
    '/roleList': roleList,
    '/directiveList': directiveList,
    '/accountList': accountList,
    '/systemList': systemList,
    '/templateList': templateList,
    '/platformList': platformList,
    '/informationList': informationList,
    '/workOrderList': workOrderList
  }
  let routerList = [], routerObj = {};
  menuList && menuList.length && menuList.map((pItem, pKey)=>{
    routerObj = {
      path: '/',
      component: Home,
      name: pItem.resName,
      icon: pItem.resIcon,
    }
    let children = [];
    if(pItem.childResources && pItem.childResources.length){
      pItem.childResources.map((item, key)=>{
        let obj = {};
        obj.path = item.path;
        obj.component = menuObj[item.path];
        obj.name = item.resName;
        obj.meta = {
          parent: pItem.resName,
          icon: pItem.resIcon
        }
        children.push(obj);
      })
    }else{
      let obj = {};
      obj.path = pItem.path;
      obj.name = pItem.resName;
      obj.component = menuObj[pItem.path];
      obj.meta = {
        parent: pItem.resName,
        icon: pItem.resIcon
      }
      children.push(obj);
    }
    routerObj.children = children;
    routerList.push(routerObj);
  })
  console.log(routerList,'RRR')
  return routerList;
}

var router = new Router({
  routes: [{
    path: '/login',
    name: '',
    component: Login
  }],
  setRoutes
  // routes: routerList //测试用
})



//添加一个响应拦截器
Axios.interceptors.response.use(function(res){
  //处理登录超时
  if(res.data.code === 2){
    router.push('/login');
  }
  return res;
},function(err){
  return Promise.reject(error);
});

Vue.use(VueAxios, Axios);
Vue.use(ElementUI);
Vue.use(ECharts);
Vue.prototype.HOST = HOST; //测试地址

router.beforeEach((to, from, next) => {
    if (to.path === '/login') {
      store.commit('updateUser', {});
      store.commit('modify', {type: 'menuList', val: []});
      next();
      return;
    }
    if (!store.getters.isLogin && to.path !== '/login') {
      next({
        path: '/login',
        query: {redirect: to.fullPath}
      });
    } else {
      Vue.prototype.COMPID = store.state.userInfo && store.state.userInfo.compId || '';
      next();
    }
});
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
