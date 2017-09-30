<template>
  <div style="height:100%;" :class="{'collapsed':collapsed}" ref="home">
    <div class="g-left">
      <div class="g-logo">
        <img src="../../static/images/logo.png" style="cursor: pointer"  @click="toIndex">
        <transition name="fold">
          <span v-show="!collapsed" class="example">响应中心管理</span>
        </transition>
      </div>
      <div class="g-nav">
        <!--菜单展开时的显示情况-->
				<el-menu v-show="!collapsed" :default-active="$route.path" theme="dark"
					 unique-opened router :unique-opened="true" :default-openeds="[$route.meta.parent]" class="my-menu">
					 <!--第一层菜单-->
					 <div v-for="(item,index) in menuList" v-if="item.name != ''" :key="index">
						<el-submenu :index="item.name" v-if="item.children && item.children.length>1">
              <template slot="title"><i :class="item.icon"></i>{{item.name}}</template>
							<!--第二层菜单-->
						  <el-menu-item :index="child.path"  v-for="child in item.children" :key="child.path">{{child.name}}</el-menu-item>
						</el-submenu>
						<el-menu-item :index="item.children[0].path" v-if="item.children && item.children.length===1 && item.name!=='账号管理'" :key="item.children[0].path"><i :class="item.icon"></i>{{item.name}}</el-menu-item>
            <el-menu-item :index="item.children[0].path" v-if="item.children && item.children.length===1 && item.name==='账号管理'&&$store.getters.user.isManage" :key="item.children[0].path"><i :class="item.icon"></i>{{item.name}}</el-menu-item>
					 </div>
				</el-menu>

      </div>
    </div>
    <!--菜单折叠后的显示情况-->
    <ul v-show="collapsed" class="el-menu collapsed" ref="menuCollapsed">
      <template v-for="(item,index) in menuList" v-if="item.name != ''">
        <li v-if="item.children&&item.children.length>1" :index="index+''" style="position: relative;" >
          <div class="el-submenu__title" style="padding-left: 20px;" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)"
               :class="$route.meta.parent===item.name?'is-active':''"><i :class="item.icon"></i></div>
          <ul class="el-menu submenu" :class="'submenu-hook-'+index" @mouseover="showMenu(index,true)" @mouseout="showMenu(index,false)">
            <li v-for="term in item.children" :key="term.path" v-if="item.children" class="el-menu-item" style="padding-left: 20px;" :class="$route.path==term.path?'is-active':''"
                @click="$router.push(term.path)">{{term.name}}</li>
          </ul>
        </li>
        <li v-else-if="item.children && item.children.length===1 && item.name!=='账号管理'" class="el-menu-item el-submenu__title" :class="$route.path===item.children[0].path?'is-active':''" @click="$router.push(item.children[0].path)">
          <i :class="item.icon"></i>
        <li v-else-if="item.children && item.children.length===1 && item.name==='账号管理' && $store.getters.user.isManage" class="el-menu-item el-submenu__title" :class="$route.path===item.children[0].path?'is-active':''" @click="$router.push(item.children[0].path)">
          <i :class="item.icon"></i>
        </li>
      </template>
    </ul>
    <!--展开折叠开关-->
    <div class="menu-toggle" @click.prevent="collapse">
      <i class="el-icon-d-arrow-left" v-show="!collapsed"></i>
      <i class="el-icon-d-arrow-right" v-show="collapsed"></i>
    </div>
    <div class="g-right">
      <div class="content-view" ref="contentView">
        <div class="userinfo-area" ref="userarea">
          <el-dropdown trigger="hover">
            <span class="el-dropdown-link"><img :src="getLoginImg"><u>{{$store.getters.user.name || $store.state.userInfo.username}}</u></span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
        <router-view :breadcrumb="breadcrumb" :receiveParam="receiveParam"></router-view>
      </div>
      <p class="footer" ref="copyright">版权所有&copy;象翌微链科技发展有限公司 桂ICP备1300904号</p>
    </div>
  </div>
</template>
<script>
  import moment from 'moment';
  import '../../static/js/jquery.min.js';
  import '../../static/js/jquery.nicescroll';
  import WebSocketClient from '@/plugins/WebSocketClient'
  export default {
    data () {
      return {
        breadcrumb: [],
        sysUserName: '',
        sysUserAvatar: '',
        collapsed: false,
        menuList: [],
        receiveParam: {}
      }
    },
    watch: {
    '$route' (val, oldVal) {
        if(val){
          this.breadcrumb = [val.meta.parent||'',val.name];
          if(val.path === '/'){
            this.$router.push('/login');
          }
        }
      }
    },
    beforeMount(){
      this.menuList = this.$store.state.menuList;
      this.connectWebsocket();
    },
    computed:{
      getLoginImg(){
        return this.$store.getters.user.imageUrl;
      }
    },
    mounted() {
      //动态处理右侧内容高度
      this.computeHeight();
      window.onresize = () => {
        return (() => {
          this.computeHeight();
        })();
      };
      this.breadcrumb = [this.$route.meta.parent,this.$route.name];
      if(this.$route.path === '/'){ //默认跳转
        this.$router.push(this.menuList[0].children[0].path);
      }
      $('.g-left').niceScroll({
        cursorcolor: "#1f2d3d",//#CC0071 光标颜色
        cursoropacitymax: 0.5, //改变不透明度非常光标处于活动状态（scrollabar“可见”状态），范围从1到0
        touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
        cursorwidth: "10px", //像素光标的宽度
        cursorborder: "0", // 游标边框css定义
        cursorborderradius: "5px",//以像素为光标边界半径
        autohidemode: false, //是否隐藏滚动条
      });
      $('.content-view').niceScroll({
        cursorcolor: "#CCC",
        cursoropacitymax: 0.5,
        touchbehavior: false,
        cursorwidth: "10px",
        cursorborder: "0",
        cursorborderradius: "5px",
        autohidemode: false,
      });
      
    },
    methods: {
      connectWebsocket(){
        let userInfo = this.$store.state.userInfo, that=  this;
        if(userInfo.isCustomer){
          //@param type   service:客服,customer:客户
          //customerWS/{compId}/{userId}/{type}
          let reqWsUrl = HOST.replace(/http/, 'ws')+ '/customerWS/';
          var webSocket = WebSocketClient.init({
            path: reqWsUrl + userInfo.compId + '/' + userInfo.customerId + '/' + 'service',
            open(){
              // console.log('进入websocket连接');
              that.$store.commit('modify',{type:'remoteConnect',val: webSocket});
              webSocket.on('customService', that.getCustomNotice.bind(that));
              setInterval(()=>{
                webSocket.send('ping','keepMsg');
              },50000)
            }
          })   
        }
      },
      getCustomNotice(data){
          // console.log('接收回的数据:', data);
          if(!data) return;
          var receiveData = data;
          var receiveParam = {
              "compId": receiveData.compId,
              "deptId": receiveData.deptId,
              "createTime": receiveData.createTime || moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
              "context": receiveData.context,
              "fromUserId": receiveData.fromUserId,
              "fromName": receiveData.fromName,
              "toName": receiveData.toName,
              "toUserId": receiveData.toUserId,
              "msgType": receiveData.msgType
          }
          if(receiveData.msgType != 0){
            receiveParam.fileUrl = receiveData.fileUrl;
            receiveParam.filename = receiveData.context;
            receiveParam.downUrl = this.HOST + '/FileUpload/download?realFileName='+ receiveData.fileUrl + '&newFileName=' + receiveData.context;
          }
          this.receiveParam = receiveParam;
      },
      collapse: function () {
        this.collapsed = !this.collapsed;
        if(!this.collapsed){
          $('.my-menu').attr('style', '');
        }else{
          $('.nicescroll-rails').css('display', 'none');
        }
      },
      showMenu(i, status){
        this.$refs.menuCollapsed.getElementsByClassName('submenu-hook-' + i)[0].style.display = status ? 'block' : 'none';
      },
      toIndex(){
        this.$router.push('/');
        this.breadcrumb = [];
      },
      computeHeight(){
        if(this.$refs.copyright){
          let contentheight = document.body.clientHeight - this.$refs.copyright.clientHeight;
          this.$refs.contentView.style.height = contentheight + "px";
        }
      },
      logout(){
        const that = this;
				that.$confirm('确认退出吗?', '提示', {
				}).then(() => {
          that.axios.post('/manager/exitLoginMethod', {
            'userName': that.$store.getters.user.username
          }).then(function (res) {
              if (res.data.code) {
                  that.$store.commit('updateUser', {});
                  localStorage.setItem('loginout', true);
                  that.$store.state.remoteConnect && that.$store.state.remoteConnect.close();
                  that.$router.push({
                    path: '/login',
                    query: {redirect: that.$route.fullPath}
                  });
              } else {
                  that.$message({
                      type: 'warning',
                      message: res.data.msg,
                      duration: 1500
                  });
              }
          })
				}, ()=>{});
      }
    }
  }
</script>
<style lang="scss">
  $leftWidth: 240px;
  $smallLeftWidth: 70px;
  .g-left,.g-right {
    -webkit-transition: width .3s,margin-left .3s;
    -moz-transition: width .3s,margin-left .3s;
    -ms-transition: width .3s,margin-left .3s;
    -o-transition: width .3s,margin-left .3s;
    transition: width .3s,margin-left .3s;
  }
  .g-left {
    width: $leftWidth;
    height: 100%;
    background-color: #324157;
    position: absolute;
    top: 0;
    left: 0;
    padding-top: 100px;
    box-sizing: border-box;
    .g-logo, .g-nav {
      width: 100%;
    }
    .g-logo {
      height: 100px;
      position: absolute;
      left: 0;
      top: 0;
      display: -webkit-flex;
      display: flex;
      flex-flow: row wrap;
      justify-content: center;
      align-items: center;
      span {
        color: #fff;
        font-size: 20px;
        margin-left: 10px;
      }
    }
    .g-nav {
      height: 100%;
      top: 100px;
      .el-submenu__icon-arrow{
        transform: rotateZ(-90deg);
      }
      .el-menu{
        width: $leftWidth;
      }
      .el-menu *{
        user-select: none;
      }
      .el-submenu.is-opened>.el-submenu__title .el-submenu__icon-arrow {
        transform: rotateZ(0deg);
      }
      .my-menu{
        .el-submenu [class^=el-icon-] {
          font-size: 16px;
        }
      }
    }
  }
  .el-menu.collapsed{
    background-color: #324157;
    width:$smallLeftWidth;
    position: absolute;
    top:100px;
    left:0;
    .is-active{
      color:#20a0ff!important;
    }
    li {
      position: relative;
    }
    .el-menu-item [class^=el-icon-] {
      vertical-align: baseline;
      margin-right: 0;
    }
    .el-submenu__title{
      color: #bfcbd9;
      text-align: center;
      font-size: 16px;
      &:hover{
        background-color: #48576a;
        color:#20a0ff;
      }
    }
    .el-menu.submenu{
      position: absolute;
      top:0;
      right:-96px;
      z-index: 1000;
      background-color: #1f2d3d;
      display: none;
      .el-menu-item{
        color: #bfcbd9;
      }
      li {
        text-align: center;
        &:hover{
          background-color: #48576a;
          color:#20a0ff;
        }
      }
    }
  }
  .menu-toggle {
    color: #fff;
    position: absolute;
    left:$leftWidth;
    top:50%;
    width:18px;
    height: 50px;
    text-align: center;
    line-height: 50px;
    cursor: pointer;
    margin-top:-25px;
    background-color: #324157;
    -webkit-border-radius:0 5px 5px 0;
    -moz-border-radius:0 5px 5px 0;
    border-radius:0 5px 5px 0;
    font-size: 12px;
    z-index: 999;
    -webkit-transition: left .3s;
    -moz-transition: left .3s;
    -ms-transition: left .3s;
    -o-transition: left .3s;
    transition: left .3s;
  }
  .el-dropdown-link{
    font-size: 16px;
    cursor:pointer;
    img {
      width: 30px;
      height:30px;
      display: inline-block;
      vertical-align: middle;
      margin-right: 5px;
      -webkit-border-radius:100%;
      -moz-border-radius:100%;
      border-radius:100%;
    }
    u{
      text-decoration: none;
      font-size: 14px;
    }
  }
  .example {
    opacity: 1;
  }
  .fold-enter-active {
    transition:  all 2s ease-out;
  }
  .fold-leave-active {
    transition:  opacity 0.01s ease-out;
  }
  .fold-enter, .fold-leave-active {
    opacity: 0;
  }
  .g-right {
    height: 100%;
    margin-left: $leftWidth;
    background-color: #F4F5F6;
    position: relative;
    .footer{
      position: absolute;
      bottom:0;
      left:0;
      width:100%;
      text-align: center;
      margin: 0;
      color: #000;
      padding: 5px 0;
      background-color: #dedede;
      z-index: 1;
    }
    .userinfo-area{
      position: absolute;
      right:0;
      top:0;
      padding:8px 30px;
      z-index: 99;
      .el-dropdown span{
        color: black;
      }

    }
    .content-view{
      position: relative;
      overflow-y: auto;
    }
  }
  .collapsed {
    .g-left{
      width: $smallLeftWidth;
    }
    .menu-toggle{
      left:$smallLeftWidth;
    }
    .g-right {
      margin-left: $smallLeftWidth;
    }
  }
</style>
