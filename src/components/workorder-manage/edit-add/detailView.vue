<template>
  <div class="container orderdetail-wrap">
    <div class="row orderdetail-row" v-loading.body="loading">
      <div class="g-flex">
        <p style="width: 200px;">
          <span>工单单号：</span>
          <el-input type="text" :title="viewData.data.orderNo" v-model="viewData.data.orderNo" :disabled="disabled"></el-input>
        </p>
      </div>
      <div class="g-flex">
        <p>
          <span>工单类型：</span>
          <el-input type="text" :title="order.orderType" v-model="order.orderType" :disabled="disabled"></el-input>
        </p>
        <p>
          <span>处理状态：</span>
          <el-input type="text" :title="order.orderStatus" v-model="order.orderStatus" :disabled="disabled"></el-input>
        </p>
      </div>
      <div class="g-flex">
        <p>
          <span>客户名称：</span>
          <el-input type="text" :title="viewData.data.customerName" v-model="viewData.data.customerName" :disabled="disabled"></el-input>
        </p>
        <p>
          <span>联系方式：</span>
          <el-input type="text" :title="viewData.data.customerTelphone" v-model="viewData.data.customerTelphone" :disabled="disabled"></el-input>
        </p>
      </div>  
      <div class="g-flex">
        <p>
          <span>企业名称：</span>
          <el-input type="text" :title="compName" v-model="compName" :disabled="disabled"></el-input>
        </p>
        <p>
          <span>部门名称：</span>
          <el-input type="text" :title="deptName" v-model="deptName" :disabled="disabled"></el-input>
        </p>
      </div>
      <div class="g-flex">
        <p>
          <span>问题描述：</span>
          <el-input type="textarea"  :title="viewData.data.orderDesc" :autosize="{minRows: 2}" placeholder="" v-model="viewData.data.orderDesc" :disabled="disabled"></el-input>
        </p>
      </div>
      <div class="g-flex">
        <p style="padding-right: 0;">
          <span>备注：</span>
          <div style="width: 100%; height: 100%;">
            <p v-if="viewData.data.handleTime">{{viewData.data.remark}}，{{viewData.data.handleTime}} -- {{viewData.data.serverName}} </p>
            <el-input type="textarea" :title="viewData.data.remark" :autosize="{minRows: 3}" placeholder="不超过1000字" v-model="viewData.data.remark" :disabled="readOnly"></el-input>
          </div>
        </p>
      </div>
      <div class="g-flex">
        <p>
          <span>创建时间：</span>
          <el-input type="text" :title="viewData.data.createTime" v-model="viewData.data.createTime" :disabled="disabled"></el-input>
        </p>
        <p>
           <span v-if="readOnly">完成时间：</span>
           <el-input v-if="readOnly" :title="viewData.data.handleTime" type="text" v-model="viewData.data.handleTime" :disabled="disabled"></el-input>
        </p>
      </div>
      <div class="g-flex g-button" v-if="!readOnly">
        <el-button type="info" @click="confirm('save')" >保存</el-button>
        <el-button @click="confirm('complete')" v-if="viewData.data.status == 2">完成</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData", "deptName", "compName", "orderTypeList"],
    data () {
      return {
        loading: false,
        disabled: true,
        order:{
          orderType: '',
          orderStatus: ''
        },
        readOnly: false
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
        if (this.viewData.op =='detail') {
          let orderData = this.viewData.data, oType = orderData.orderType,
              orderStatusObj = {
                '0': '未处理', '1': '已处理', '2': '处理中'
              }

          this.orderTypeList.some((pItem, pKey)=>{
            if(pItem.value == oType){
              this.order.orderType = pItem.label;
              return true;
            }else{
              pItem.children && pItem.children.some((item, key)=>{
                if(item.value == oType){
                  this.order.orderType = pItem.label + '-' + item.label;
                  return true;
                }
              })
            }
          })
          this.readOnly = orderData.status == 1 ? true: false;
          this.order.orderStatus = orderStatusObj[orderData.status];
        }
      },
      confirm(type){
        let that = this, config, 
            status = type == 'complete'? 1 : 2;  // 0:未处理， 1：已处理， 2： 处理中
        
        if(!that.viewData.data.remark){
          that.infoNotice('info', '请先填写备注！'); return;
        }
        config = {
          method: 'post',
          url: that.HOST + '/customer/updateOrderStatus',
          data: {
            "compId": that.viewData.data.compId,
            "orderId": that.viewData.data.id,
            status,
            "remark":that.viewData.data.remark
          }
        };
        that.loading = true;
        that.axios(config).then(function (res) {
            that.loading = false;
            if (res.data.code) {
              that.close(false);
            } else {
              that.infoNotice('error', res.data.msg);
            }
          }).catch(function (error) {
            that.loading = false;
            console.log(error);
          });
      },
      close(refresh){
        this.$emit('viewStatus', refresh);
      },
      infoNotice(type, msg){
         this.$message({
            type: type,
            message: msg,
            duration: 1500
          });
      }
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .orderdetail-wrap{
    max-height: 550px;
    overflow: auto;
    .g-flex{
      padding: 0;
      p{
        flex: 1;
        display: flex;
        align-items: center;
        padding-right: 5%;
        box-sizing: border-box;
        margin: 8px 0;
        span{
          min-width: 80px;
          text-align: right;
        }
      }
      .down-time{
        display: flex;
        align-items: center;
        margin-left: -18px;
      }
    }
  }
  .orderdetail-row{
    padding-left: 10px;
  }
  .g-button{
    margin-top: 20px;
    .el-button{
      width: 80px;
      margin-right: 20px;
    }
  }
  .el-dialog--small{
    width: 60%;
  }
</style>
