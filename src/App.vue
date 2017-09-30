<template>
  <div id="app">
		<transition name="fade" mode="out-in">
			<router-view></router-view>
		</transition>
	</div>
</template>

<script>
import emoji from 'node-emoji';
export default {
  name: 'app',
  components:{
  },
  beforeMount(){
    if(this.$store.getters.isLogin){
      let userid = this.$store.state.userInfo.id,
          isManage = this.$store.state.userInfo.isManage,
          isPlatManager = !this.$store.state.userInfo.compId ? true : false,
          isCustomer = this.$store.state.userInfo.isCustomer,
          param = {
            userid,
            isManage,
            isPlatManager,
            isCustomer
          }
      this.getMenuList(param);
    }
  },
  created(){
      console.log(this.$router);
  },
  methods:{
    getMenuList(param){
      let config, reqUrl,
        userid = param.userid,
        isManage = param.isManage,
        isPlatManager = param.isPlatManager,
        isCustomer = param.isCustomer;
      if(isCustomer){
          reqUrl = '/mresource/getAllCustomerResources';
      }else{
        if(isPlatManager){
          reqUrl = '/mresource/getAllSystemResources';
        }else{
          reqUrl = isManage ? '/mresource/getAllResources': '/mresource/getMResourceByManager';
        }
      }
      config = {
        url: reqUrl,
        data: !isCustomer ? { "managerId": userid} : ''
      };
      this.axios(config).then((res)=> {
        debugger;
        if(res.data.code){
          if(!res.data.data.length){
            this.$message({
              type: 'error',
              message: '该账号没有分配权限，请先分配！',
              duration: 1500
            });
            return;
          }
          let menuList = this.$router.options.setRoutes(res.data.data);
          console.log(menuList)
          this.$router.addRoutes(menuList);
          this.$store.commit('modify', {type: 'menuList', val: menuList});
          this.$router.push({path: '/'});
        }else {
          this.$message({
            type: 'error',
            message: res.data.msg,
            duration: 1500
          });
        }
      }).catch((error)=>{
        console.log(error);
      });
    }
  },
  mounted(){
    // console.log('this.$store', this.$store);
    window.emoji = emoji
  }
}
</script>

<style lang="scss" scoped>
  $letfWidth: 240px;
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    height: 100%;
    margin:0;
  }
</style>
<style lang="scss">
  @import '~@/assets/style/main.scss';
  @import '~@/assets/style/add.scss';
</style>
