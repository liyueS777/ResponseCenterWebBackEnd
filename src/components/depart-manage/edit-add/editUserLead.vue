<template>
  <div class="container">
    <div class="row video-add" v-loading.body="loading">
      <div class="g-flex">
        <span>姓名：</span>
        <el-input type="text" v-model="userData.fullname" disabled></el-input>
      </div>
      <div class="g-flex">
        <span>字号：</span>
        <el-input type="text" v-model="userData.aliaName" disabled></el-input>
      </div>
      <div class="g-flex">
        <span>部门：</span>
        <el-input type="text" v-model="userData.orgName" disabled></el-input>
      </div>
      <div class="g-flex">
        <span>职位：</span>
        <el-input type="text" v-model="userData.posName" disabled></el-input>
      </div>
      <div class="g-flex">
        <span>Email：</span>
        <el-input type="text" v-model="userData.email" disabled></el-input>
      </div>
      <div class="g-flex">
        <span>是否为领导：</span>
        <el-select v-model="isLead" size="small" placeholder="请选择">
          <el-option label="是" value="1"></el-option>
          <el-option label="否" value="0"></el-option>
        </el-select>
      </div>
      <div class="g-flex" style="height: 40px;text-align:center;padding-top:15px;">
        <el-button type="info" @click="confirm" style="height: 40px;">确定</el-button>
        <el-button @click="close(true)" style="height: 40px;">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData"],
    data () {
      return {
        userData: {},
        isLead: 0,
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
          this.userData = this.viewData.data;
          this.isLead = this.userData.isLead + '';
        } else {
          this.emptyData();
        }
      },
      confirm(){
        const that = this;
        if(that.value === ''){
          that.$message({
            type: 'warning',
            message: '请选择是否为领导',
            duration: 1500
          });
            return;
        }
        let config = {
            url: '/user/updateUserLead',
            data: {
              'compId': that.COMPID,
              'userId': that.userData.id,
              'departId': that.userData.departId,
              'isLead': that.isLead
            }
        };
        that.loading = true;
        that.axios(config).then(function (res) {
            that.loading = false;
            if (res.data.code) {
              that.close(true);
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
        this.$emit('editStatus', refresh);
      },
      emptyData(){
        this.userData = {};
        this.isLead = 0;
        this.loading = false;
      },
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
</style>
