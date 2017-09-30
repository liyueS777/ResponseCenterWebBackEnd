<template>
  <div class="container order-wrap">
    <div class="row" v-loading.body="loading">
      <div class="g-flex">
        <span><i class="red_heart">*</i>工单类型：</span>
        <el-cascader ref="cascader" style="width: 250px;" placeholder="请选择工单类型" :clearable="true" expand-trigger="hover" :options="options" v-model="selectOrderType" @change="handleChange"></el-cascader>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>问题描述：</span>
        <el-input type="textarea" :rows="6" v-model="textdesc" :maxlength="300" placeholder="不超过300字"></el-input>
      </div>
      <div class="g-flex g-button">
        <el-button type="info" @click="confirm" >确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props:['saveData'],
  data(){
    return {
      loading: false,
      options: [],
      selectOrderType: [],
      selectId: '',
      textdesc:''
    }
  },
  components:{
  },
  watch:{
  },
  beforeMount(){
    this.getOrderTypeList();
  },
  methods:{
    handleChange(value){
      this.selectOrderType = value;
      this.selectId = Array.from(value).pop();
    },
    close(refresh){
      this.$emit('viewStatus', refresh);
    },
    getOrderTypeList(){
      this.loading = true;
      this.axios.post('/customer/getAllOrderType').then( (res)=> {
          this.loading = false;
          if (res.data.code) {
            if(!res.data.data.length) return;
            let lists = res.data.data, orderTypeList = [], ordertype = {};
            lists.length && lists.map((pItem, pKey)=>{
              ordertype = {
                label: pItem.name,
                value: pItem.id
              }
              let children = [];
              pItem.childOrderType && pItem.childOrderType.length && pItem.childOrderType.map((item, key)=>{
                children.push({
                  label: item.name,
                  value: item.id
                })
              })
              if(children.length){
                ordertype.children = children;
              }
              orderTypeList.push(ordertype);
            })
            this.options = orderTypeList;
          } else {
            this.$message({
              type: 'error',
              message: res.data.msg,
              duration: 1500
            });
          }
        }).catch( (error) =>{
          this.loading = false;
          console.log(error);
        });
    },
    confirm(){
      const that = this;
      if(!that.textdesc){
         that.$message({
          type: 'info',
          message: '请输入问题描述',
          duration: 1500
        });
        return;
      }
      let config = {
          methods: 'post',
          url: '/customer/addOrder',
          data: {
            "compId": that.COMPID,
            "serverId": that.saveData.serverId,
            "serverName": that.saveData.serverName,
            "customerId": that.saveData.customerId,
            "customerName": that.saveData.customerName,
            'customerDepartId': that.saveData.customerDepartId,
            "customerTelphone": that.saveData.customerTelphone,
            "customerImageUrl": that.saveData.customerImageUrl,
            "departId": that.saveData.departId,
            "orderType": that.selectId,
            "desc": that.textdesc
          }
      };
      that.loading = true;
      that.axios(config).then(function (res) {
          that.loading = false;
          if (res.data.code) {
            that.close(false);
            that.$message({
              type: 'info',
              message: res.data.msg,
              duration: 1500
            });
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
    }
  }
}
</script>

<style lang="scss">
  @import '~@/assets/style/add.scss';
  .order-wrap{
    position: fixed;
    width: 500px; 
    height: 340px;
    top: 125px;
    right: 0; 
    border: 1px solid #eaeaea;
    box-shadow: 1px 2px 10px #888888;
    background: white;
    font-size: 14px;
    padding-top: 20px;
    box-sizing: border-box;
  }
</style>
