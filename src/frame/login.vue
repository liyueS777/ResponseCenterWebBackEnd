<template>
  <div class="login-app">
    <el-form :model="ruleForm" :rules="rule" ref="ruleForm" label-position="left" label-width="0px" class="demo-ruleForm login-container">
        <h3 class="title">响应中心管理系统登录</h3>
        <el-form-item prop="account">
        <el-input type="text" v-model="ruleForm.account" auto-complete="off" placeholder="账号" :disabled="logining" @keyup.enter.native="submit"></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
          <el-input type="password" v-model="ruleForm.checkPass" auto-complete="off" placeholder="密码" :disabled="logining" @keyup.enter.native="submit"></el-input>
        </el-form-item>
        <el-radio-group v-model="identityId" style="width:100%;margin:10px 0;">
          <el-radio :label="1">平台管理员</el-radio>
          <el-radio :label="0">企业管理员</el-radio>
        </el-radio-group>
        <el-form-item prop="compCode" v-if="identityId == 0">
           <el-input ref="compcode" type="text" v-model="ruleForm.compCode" auto-complete="off" placeholder="企业编码" :disabled="logining" @keyup.enter.native="submit"></el-input>
        </el-form-item>
        <!-- <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox> -->
        <el-form-item style="width:100%;">
            <el-button type="primary" style="width:100%;margin-top:10px;" @click.native.prevent="submit" :loading="logining">登录</el-button>
        </el-form-item>
    </el-form>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        logining: false,
        ruleForm: {
          account: '',
          checkPass: '',
          compCode: ''
        },
        rule: {
          account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
          ],
          checkPass: [
            { required: true, message: '请输入密码', trigger: 'blur' },
          ],
          compCode: [
            { required: true, message: '请输入企业编码', trigger: 'blur' },
          ]
        },
        checked: true,
        identityId: 1
      };
    },
    methods: {
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
      },
      submit(ev) {
        const that = this;
        that.$refs.ruleForm.validate((valid) => {
          if (valid) {
              that.logining = true;
              let reqData = {
                "userName": that.ruleForm.account,
                "password": that.ruleForm.checkPass,
                "compCode": !that.identityId ? that.ruleForm.compCode : ''
              };
              that.axios.post('/manager/loginMethod', reqData).then(function (res) {
                  that.logining = false;
                  if (res.data.code) {
                    if(!res.data.data) return;
                    if(res.data.data.compId && that.identityId){
                      that.$message({
                          type: 'warning',
                          message: '请输入企业编码！',
                          duration: 1500
                      });
                      that.identityId = 0;
                      return;
                    }
                    let isCustomer = res.data.data.isCustomer;                                    
                    //compId字段为空：平台管理员，不为空：企业管理员或普通账户
                    let isPlatManager = !res.data.data.compId ? true: false
                    
                    if(isCustomer){
                      document.title = '响应中心客服管理系统'
                    }else{
                      if(isPlatManager){
                        document.title = '响应中心平台管理系统'
                      }else{
                        document.title = '响应中心企业管理系统'
                      }
                    }
                    let param = {
                      userid: res.data.data.id,
                      isManage: res.data.data.isManage,
                      isPlatManager,
                      isCustomer
                    }
                    that.getMenuList(param); 
                    that.$store.commit('updateUser',res.data.data);
                    localStorage.setItem('loginout', false);
                  } else {
                      that.$message({
                          type: 'warning',
                          message: res.data.msg,
                          duration: 1500
                      });
                  }
              }).catch(function (error) {
                  that.logining = false;
                  console.log(error);
              });
          } else {
              return false;
          }
        });
      }
    },
    mounted(){
    }
  }
</script>

<style lang="scss" scoped>
  .login-app{
      min-height: 100%;
      background-image: url(../../static/images/main-bg.jpg);
      background-size: 100%;
  }
  .login-container {
    -webkit-border-radius: 5px;
    border-radius: 5px;
    -moz-border-radius: 5px;
    background-clip: padding-box;
    left: 38%;
    top: 23%;
    position: absolute;
    width: 350px;
    padding: 35px 35px 15px 35px;
    background: #fff;
    border: 1px solid #eaeaea;
    box-shadow: 0 0 25px #cac6c6;
    .title {
      margin: 0px auto 40px;
      text-align: center;
      color: #505458;
    }
    .remember {
      margin: 0px 0px 35px 0px;
    }
  }
</style>
