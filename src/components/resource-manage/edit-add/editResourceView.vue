<template>
  <div class="container">
    <div class="row resource-add" v-loading.body="loading">
      <div class="g-flex">
        <span><i class="red_heart">*</i>权限名称：</span>
        <el-input type="text" placeholder="请输入权限名称" v-model="resourceData.resName"></el-input>
      </div>
      <div class="g-flex">
         <span><i class="red_heart">*</i>权限类型：</span>
         <el-select v-model="rescode" placeholder="请选择">
            <el-option v-for="item in rescodeList" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
      </div>
      <div class="g-flex">
        <span>权限描述：</span>
        <el-input type="text" placeholder="请输入权限描述" v-model="resourceData.resDesc"></el-input>
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
    props: ["resData"],
    data () {
      return {
        resourceData: {},
        rescodeList: [{
          value: '101',
          label: '消息'
        }, {
          value: '102',
          label: '音频'
        }, {
          value: '103',
          label: '视频'
        }, {
          value: '201',
          label: '公司'
        }, {
          value: '202',
          label: '部门'
        }, {
          value: '203',
          label: '员工'
        }],
        readyOnly:false,
        canUpload: false,
        loading: false,
        rescode: '101' //  101:消息、102：音频、103：视频，201：公司、202：部门、203：员工
      }
    },
    watch: {
      'resData.op'(val, oldVal) {
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
        if (this.resData.op == 'edit') {
          this.resourceData = this.resData.data;
          this.rescode = this.resourceData.resCode;
        } else {
          this.emptyData();
        }
      },
      confirm(){
        let that = this, config;
        config = {
            data: {
              "compId": that.COMPID,
              "resName": that.resourceData.resName,
              "resCode":that.rescode,
              "resDesc": that.resourceData.resDesc
            }
        };
        if(!that.resourceData.resName){
          that.$message({
              type: 'error',
              message: '请输入权限名称！',
              duration: 1500
            });
            return;
        }
        if(that.resData.op == 'edit'){
          config.data.resourceId = that.resourceData.id;
          config.url = '/resource/updateResourcesMethod';
        }else {
          config.url = '/resource/addResourcesMethod';
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
          });
      },
      close(refresh){
        this.$emit('viewStatus', refresh);
      },
      emptyData(){
        this.resourceData = {};
        this.loading = false;
      }
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .editresource-wrap{
    @include dialogwidth(550px, 550px);
    
    @include upload;
  }
</style>
