import Vue from 'vue'
import Vuex from 'vuex'
import 'babel-polyfill';
Vue.use(Vuex);
const store = new Vuex.Store({
  state: {
    userInfo: { //保存用户信息
    }
  },
  getters: {
    /**
     * 获取用户信息
     */
    user: state => {
      if(isEmptyObject(state.userInfo)){
        state.userInfo = JSON.parse(sessionStorage['userInfo'] || '{}');
      }
      return state.userInfo;
    },
    /**
     * 是否登录
     */
    isLogin: state => {
      if(isEmptyObject(state.userInfo)){
        state.userInfo = JSON.parse(sessionStorage['userInfo'] || '{}');
      }
      return !isEmptyObject(state.userInfo);
    }
  },
  mutations: {
    /**
     * 更新用户数据
     * @param {*} state
     * @param {*} newUserInfo
     */
    updateUser(state, newUserInfo) {
      if(newUserInfo){
        state.userInfo = newUserInfo;
        sessionStorage['userInfo'] = JSON.stringify(newUserInfo);
      }
    },
    modify(state, data){
      if(data){
        state[data.type] = data.val;
      }
    }
  }
})
/**
 * 是否为空对象
 * @param {*} obj
 */
function isEmptyObject(obj) {
 	for (var key in obj) {
 		return false;
 	}
 	return true;
 }
export default store;
