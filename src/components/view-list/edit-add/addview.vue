<template>
  <div class="container">
    <div class="row">
      <div class="g-flex">
        <span><i class="red_heart">*</i>名字：</span>
        <el-input type="text" placeholder="请输入名字" v-model="viewName" style="width: 420px;"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>企业名称：</span>
        <el-select v-model="selectCompId" placeholder="请选择企业名称" :disabled = "viewData.op == 'edit'? true: false">
          <el-option v-for="(item,index) in compList" :key="index" :label="item.compName" :value="item.compId"></el-option>
        </el-select>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>类型：</span>
        <el-select v-model="typeValue" placeholder="请选择类型">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </div>
      <div class="g-flex">
        <el-button type="info" @click="confirm">确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData", "compList"],
    data () {
      return {
        viewList: {},
        viewName:"",
        options: [{
          value: 1,
          label: '企业'
        }, {
          value: 2,
          label: '部门'
        }, {
          value: 3,
          label: '用户'
        }],
        typeValue: 1,
        selectCompId: ''
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
        const that = this;
        if (that.viewData.op=='edit') {
          that.viewList = that.viewData.data;
          that.viewName = that.viewList.viewName;
          that.typeValue = that.viewData.data.type;
          that.selectCompId = that.viewData.data.compId;
        } else {
          this.emptyData();
          if(that.compList && that.compList.length){
            that.selectCompId = that.compList[0].compId;
          }
        }
      },
      confirm(){
        let that = this, config;
        if(!that.viewName){
          that.$message({
            type: 'error',
            message: '请输入视界名称！',
            duration: 1500
          });
          return;
        }
        if(that.viewData.op=='add'){
          config = {
            method: 'post',
            url: that.HOST + '/view/addView',
            data: {
              "compId": that.selectCompId,
              "viewName": that.viewName,
              "type":that.typeValue
            }
          };
        }else {
          config = {
            method: 'post',
            url: that.HOST + '/view/updateView',
            data: {
              "compId": that.selectCompId,
              "viewId":that.viewList.id,
              "newViewName":that.viewName,
              "newType":that.typeValue,
            }
          };
        }
        that.axios(config).then(function (res) {
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
          console.log(error);
        });
      },
      close(refresh){
        this.$emit('mailStatus', refresh)
      },
      emptyData(){
        this.viewName = '';
        this.typeValue = 1;
      },
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .view-list-wrap{
    @include dialogwidth(500px, 500px);
    
    @include upload;
  }
</style>
