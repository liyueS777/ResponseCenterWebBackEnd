<template>
  <div class="container">
    <div class="row" v-loading.body="loading">
      <div class="g-flex">
        <span><i class="red_heart">*</i>角色名称：</span>
        <el-input type="text" placeholder="角色名称" v-model="accountData.roleName"></el-input>
      </div>
      <div class="g-flex">
        <span>角色描述：</span>
        <el-input type="text" placeholder="角色描述" v-model="accountData.roleDesc"></el-input>
      </div>
      <div class="g-flex" v-show="!readyOnly">
        <el-button type="info" @click="confirm">确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData", "activeName"],
    data () {
      return {
        accountData: {},
        readyOnly:false,
        loading: false
      }
    },
    watch: {
      'viewData.op'(val, oldVal) {
        if(val){
          this.initData();
        }
      }
    },
    mounted(){
      this.initData();
    },
    methods: {
      initData(){
        if (this.viewData.op == 'edit') {
          this.accountData =  this.viewData.data;
        } else {
          this.emptyData();
        }
      },
      confirm(){
        let that = this, config, reqUrl;
        if(!that.accountData.roleName){
          that.$message({
            type: 'error',
            message: '请输入角色名称！',
            duration: 1500
          });
          return;
        }
        if(that.viewData.op == 'edit'){
          reqUrl = that.activeName == 'foreEnd' ? '/role/updateRole' : '/mrole/updateMRole'
          config = {
            method: 'post',
            url: that.HOST + reqUrl,
            data: {
              "compId": that.COMPID,
              "roleId":that.viewData.data.id,
              "roleName":that.accountData.roleName,
              "roleDesc":that.accountData.roleDesc,
            }
          };          
        }else {
          reqUrl = that.activeName == 'foreEnd' ? '/role/updateRole' : '/mrole/addMRole'
          config = {
            method: 'post',
            url: that.HOST + reqUrl,
            data: {
              "compId": that.COMPID,
              "roleName":that.accountData.roleName,
              "roleDesc":that.accountData.roleDesc,
            }
          };
        }
        that.loading = true;
        that.axios(config).then(function (res) {
            that.loading = false;
            if (res.data.code) {
              that.close(false);
            } else {
              that.$message({
                type: 'error',
                message: res.data.msg,
                duration: 1500
              });
            }
          }).catch(function (error) {
            that.loading = false;
            console.log(error);
          });
      },
      close(refresh){
        this.$emit('viewStatus', refresh);
      },
      emptyData(){
        this.accountData = {};
        this.accountData.roleName = '';
        this.accountData.roleDesc = '';
      },
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .editrole-wrap{
    @include dialogwidth(500px, 500px);
    
    @include upload;
  }
</style>
