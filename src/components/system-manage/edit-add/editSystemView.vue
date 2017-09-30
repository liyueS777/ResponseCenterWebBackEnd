<template>
  <div class="container">
    <div class="row video-add" v-loading.body="loading">
      <div class="g-flex">
        <span>系统变量名：</span>
        <el-input type="text" placeholder="系统变量名" v-model="systemData.configKey" disabled></el-input>
      </div>
      <div class="g-flex">
        <span>系统变量值：</span>
        <el-input type="text" placeholder="系统变量值" v-model="systemData.configValue"></el-input>
      </div>
      <div class="g-flex"  v-show="!readyOnly">
        <el-button type="info" @click="confirm">确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData"],
    data () {
      return {
        systemData: {},
        readyOnly:false,
        loading: false,
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
          this.systemData = this.viewData.data;
        } else {
          this.emptyData();
        }
      },
      confirm(){
        const that = this;
        let config;
        if(that.viewData.op == 'edit'){
          config = {
            method: 'post',
            url:'/systemConfig/updateSystemConfig',
            data: {
              "id": that.systemData.id,
              "newValue": that.systemData.configValue
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
        this.systemData = {};
      },
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
</style>
