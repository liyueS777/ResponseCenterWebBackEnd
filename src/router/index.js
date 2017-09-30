import Vue from 'vue'
import Router from 'vue-router'
import Home from '../frame/home.vue'
import Login from '../frame/login.vue'
import DataList from '../components/view-manage/dataList.vue'
import viewPage from '../components/view-list/view-page.vue'
import departPage from '../components/depart-manage/depart-page.vue'
import personPage from '../components/depart-manage/person-page.vue'
import directiveList from '../components/directive-manage/directive-list.vue'
import accountList from '../components/account-manage/account-list.vue'
import resourceList from '../components/resource-manage/resource-list.vue'
import roleList from '../components/role-manage/role-list.vue'
import systemList from '../components/system-manage/system-list.vue'
import templateList from '../components/template-manage/template-list.vue'
import platformList from '../components/platform-manage/platform-list.vue'

import informationList from '../components/information-manage/information-list.vue'
import workOrderList from '../components/workorder-manage/workorder-list.vue'

Vue.use(Router);
const vueRoute = new Router({
  routes: [
    {
      path: '/login',
      name: '',
      component: Login
    },
    {
        path: '/',
        component: Home,
        name: '视界管理',
        icon:'el-icon-picture',
        isPlat: false,
        children: [
            { path: '/chartPage', component: DataList, name: '图形列表', meta: {parent: '视界管理',icon:'el-icon-picture'}},
            { path: '/cameraPage', component: DataList, name: '视频列表', meta: {parent: '视界管理',icon:'el-icon-picture'}},
            { path: '/mailPage', component: DataList, name: '通讯屏', meta: {parent: '视界管理',icon:'el-icon-picture'}}
        ]
    },
    {
        path: '/',
        component: Home,
        name: '视界集合',
        icon:'el-icon-document',
        isPlat: false,
        children: [
            { path: '/viewPage', component: viewPage, name: '视界列表', meta: {parent: '视界集合',icon:'el-icon-document'}}
        ]
    },
    {
        path: '/',
        component: Home,
        name: '组织管理',
        icon:'el-icon-date',
        isPlat: false,
        children: [
            { path: '/departPage', component: departPage, name: '部门管理', meta: {parent: '组织管理',icon:'el-icon-date'}},
            { path: '/personPage', component: personPage, name: '人员管理', meta: {parent: '组织管理',icon:'el-icon-date'}},
            { path: '/companyPage', component: personPage, name: '企业管理', meta: {parent: '组织管理',icon:'el-icon-date'}}
        ]
    },
    {
      path: '/',
      component: Home,
      name: '权限管理',
      icon:'el-icon-star-on',
      isPlat: false,
      children: [
        { path: '/resourceList', component: resourceList, name: '权限列表', meta: {parent: '权限管理',icon:'el-icon-star-on'}}
      ]
    },{
      path: '/',
      component: Home,
      name: '角色管理',
      icon:'el-icon-circle-check',
      isPlat: false,
      children: [
        { path: '/roleList', component: roleList, name: '角色列表', meta: {parent: '角色管理',icon:'el-icon-circle-check'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '指令管理',
      icon:'el-icon-edit',
      isPlat: false,
      children: [
        { path: '/directiveList', component: directiveList, name: '指令列表', meta: {parent: '指令管理',icon:'el-icon-edit'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '账号管理',
      icon:'el-icon-information',
      isPlat: false,
      children: [
        { path: '/accountList', component: accountList, name: '账号列表', meta: {parent: '账号管理',icon:'el-icon-information'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '系统管理',
      icon:'el-icon-setting',
      isPlat: false,
      children: [
        { path: '/systemList', component: systemList, name: '系统管理', meta: {parent: '系统管理',icon:'el-icon-setting'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '模板导入',
      icon:'el-icon-star-on',
      isPlat: true,
      children: [
        { path: '/templateList', component: templateList, name: '模板导入', meta: {parent: '模板导入',icon:'el-icon-star-on'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '平台管理',
      icon:'el-icon-star-on',
      isPlat: true,
      children: [
        { path: '/platformList', component: platformList, name: '平台管理', meta: {parent: '平台管理',icon:'el-icon-star-on'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '消息管理',
      icon:'el-icon-information',
      children: [
        { path: '/informationList', component: informationList, name: '消息管理', meta: {parent: '消息管理',icon:'el-icon-information'}}
      ]
    },
    {
      path: '/',
      component: Home,
      name: '工单管理',
      icon:'el-icon-setting',
      children: [
        { path: '/workOrderList', component: workOrderList, name: '工单管理', meta: {parent: '工单管理',icon:'el-icon-setting'}}
      ]
    }
  ],
});


export default vueRoute

