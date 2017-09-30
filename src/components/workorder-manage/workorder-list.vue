<template>
  <div v-loading.body="loading" element-loading-text="拼命加载中" style="height:100%;">
    <div class="g-head">
      <i :class="$route.meta.icon" class="title-icon"></i>
      <h2>{{breadcrumb[1]}}</h2>
      <el-breadcrumb separator=">">
        <i class="el-icon-share"></i>
        <el-breadcrumb-item v-for="item in breadcrumb" :key="item">{{item}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-row class="g-body">
      <el-col :span="24">
        <el-form :inline="true" :model="formInline" class="demo-form-inline wordorder-form">
          <el-form-item label="工单单号：">
            <el-input v-model="formInline.orderNo" :title="formInline.orderNo" placeholder="工单单号"></el-input>
          </el-form-item>
          <el-form-item label="工单类型：">
            <el-cascader style="width: 200px;" placeholder="选择工单类型" :clearable="true" expand-trigger="hover" :options="options" v-model="selectOrderType" @change="handleChange"></el-cascader>
          </el-form-item>
          <el-form-item label="工单状态：">
            <el-select v-model="formInline.selectStatus" placeholder="工单状态" @change="getDataList(1)">
              <el-option label="未处理" :value="0"></el-option>
              <el-option label="处理中" :value="2"></el-option>
              <el-option label="已处理" :value="1"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="客户名称：">
            <el-input v-model="formInline.customerName" :title="formInline.customerName" placeholder="客户名称"></el-input>
          </el-form-item>
           <el-form-item style="marginRight: 0;" label="创建时间：">
            <el-col :span="11">
              <el-date-picker type="datetime" @change="getStartTime($event)" placeholder="选择时间" v-model="formInline.startTime" style="width: 100%;"></el-date-picker>
            </el-col>
            <el-col class="line" :span="1">-</el-col>
            <el-col :span="11">
              <el-date-picker type="datetime" @change="getEndTime($event)" placeholder="选择时间" v-model="formInline.endTime" style="width: 100%;"></el-date-picker>
            </el-col>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getDataList(1)">查询</el-button>
          </el-form-item>
        </el-form>
        <div class="m-body">
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="工单单号" show-overflow-tooltip>
              <template scope="scope" >
                <span @click="showDetail(scope.row)" style="cursor: pointer; color: #20a0ff;">{{scope.row.orderNo}}</span>
              </template>
            </el-table-column>
            <el-table-column label="企业名称" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{(()=>{
                    let compname = ''
                    compList && compList.length && compList.some((item, key)=>{
                      if(item.compId==scope.row.compId){
                        compname = item.compName;
                        return true;
                      }
                    })
                    return compname;
                  })()}}</span>
              </template>
            </el-table-column>
            <el-table-column label="客户名称" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.customerName}}</span>
              </template>
            </el-table-column>
            <el-table-column label="客服名称" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.serverName}}</span>
              </template>
            </el-table-column>
            <el-table-column label="处理状态" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{(()=>{
                    let statusObj = {
                      '0': '未处理', '1': '已处理', '2': '处理中'
                    }
                    return statusObj[scope.row.status]
                  })()}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="130">
              <template scope="scope">
                <el-button size="small" @click="showHistoryMsg(scope.row)">查看聊天记录</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getDataList" @current-change="getDataList" :page-size="pageSize"
                layout="total, prev, pager, next" :total="tableData.totalCount" ref="paginations"></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog :title="viewData.title" :visible.sync="dialogDetailViewVisible" size="small" top="3%" @close="closeView(true)">
        <detailView :viewData="viewData" :compName="compName" :deptName="deptName" :orderTypeList="options" @viewStatus="closeView"></detailView>
      </el-dialog>
      <el-dialog class="history-msg-wrap" :title="'消息记录'" ref="historyMsg" :visible.sync="dialogHistoryMsgVisible" size="small" top="3%" @close="closeHistoryView(true)">
        <historyMsg :queryParam="queryParam"></historymsg>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import moment from 'moment';
  import detailView from './edit-add/detailView.vue';
  import historyMsg from './edit-add/historyMsg.vue';
  export default {
    props: ["breadcrumb"],
    components:{
      detailView,
      historyMsg
    },
    data () {
      return {
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogDetailViewVisible: false,
        dialogHistoryMsgVisible: false,
        viewData: {
          title: '',
          data: {},
          op: ''
        },
        loading:false,
        formInline: {
          selectStatus: 0,
          customerName: '',
          orderNo: '',
          startTime: '',
          endTime: '',
          queryStartTime: '',
          queryEndTime: ''
        },
        queryParam: {},
        compList: [],
        compName: '',
        deptName: '',
        stopRequest: false,
        options: [],
        selectOrderType: [],
        selectId: '', //工单类型选中的集合中的最后一个id
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.emptyData();
          this.getDataList();
        }
      }
    },
    beforeMount(){
      this.getDataList();
      this.getCompany();
      this.getOrderTypeList();
    },
    mounted(){
    },
    methods: {
      getStartTime(value){
        this.formInline.queryStartTime = (Date.parse(new Date(value)))/1000;
      },
      getEndTime(value){
        this.formInline.queryEndTime = (Date.parse(new Date(value)))/1000;
        if(this.formInline.queryEndTime < this.formInline.queryStartTime){
          this.$message({
            type: 'error',
            message: '查询结束时间不能早于查询开始时间！',
            duration: 1500
          });
        }
      },
      handleChange(value){
        this.selectOrderType = value;
        this.selectId = Array.from(value).pop();
        this.getDataList(1);
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
      getDataList(pageIndex){
        if(this.stopRequest) return;  //阻止重复请求 
        this.stopRequest = true;
        let that = this, reqData, isCustomer; 
        reqData = {
          "compId": that.COMPID,
          "serverId": that.$store.state.userInfo.customerId,
          "status": that.formInline.selectStatus, //0未处理 1已处理
          "customerName": that.formInline.customerName,
          "orderType": that.selectId,
          "orderNo": that.formInline.orderNo,
          "startTime": that.formInline.startTime ? moment(that.formInline.startTime).format('YYYY-MM-DD HH:mm:ss'): '',
          "endTime": that.formInline.endTime ? moment(that.formInline.endTime).format('YYYY-MM-DD HH:mm:ss'): '',
          "pageIndex": pageIndex ? pageIndex : 1,
          "pageSize": that.pageSize
        };
        that.axios.post('/customer/queryCustomOrder', reqData).then(function (res) {
            if(res.data.code){
              that.tableData = res.data.data;
            }else {
              that.emptyData();
              that.$message({
                type: 'error',
                message: res.data.msg,
                duration: 1500
              });
            }
            clearTimeout(reqTimer);
            reqTimer = setTimeout(()=>{
              that.stopRequest = false;
            }, 0);
        }).catch(function (error) {
          console.log(error);
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      getCompany(){
        let that =this,
        option = {
          method:'post',
          url:'/company/getCompanyAllMethod',
          data:{
            "compId": that.COMPID,
          }
        };
        that.axios(option).then((res)=>{ 
          if(res.data.code){
            if(!res.data.data.length) return;
            that.compList = res.data.data;
          }
        }).catch((error)=>{
          console.log(error);
        });
      },
      closeView(refresh){
        this.dialogDetailViewVisible = false;
        this.viewData = {
          title: '',
          data: {},
          op: ''
        };
        refresh && this.getDataList();
      },
      closeHistoryView(){
        this.dialogHistoryMsgVisible = false;
      },
      showDetail(obj){
        // console.log('工单详情：', obj);
        this.viewData = {
          title: '查看工单详情',
          data: obj,
          op: 'detail'
        }
        this.compList && this.compList.length && this.compList.some((item, key)=>{
          if(item.compId == obj.compId){
            this.compName = item.compName;
            return true;
          }
        })
        this.getDepartList(obj.compId, obj.customerDepartId);
        this.dialogDetailViewVisible = true;
      },
      getDepartList(companyId, deptId){
        if(companyId){
          let that = this, axiosConfig;
            axiosConfig = {
              url: '/depart/getDepartMethod',
              data: {
                "compId": companyId
              }
            };
          that.axios(axiosConfig).then(function (res) {
            if (res.data.code) {
              if(!res.data.data.length) return;
              let departList = res.data.data;
              departList.some((item, key)=>{
                if(item.id == deptId){
                  that.deptName = item.departName;
                  return true;
                }
              })
            }
          }).catch(function (error) {
            console.log(error);
          });
        }
      },
      emptyData(){
        this.tableData = {};
        this.formInline.orderNo = '';
        this.formInline.customerName = '';
        this.$refs.paginations.internalCurrentPage = 1;
      },
      showHistoryMsg(obj){
        this.queryParam = obj;
        this.dialogHistoryMsgVisible = true;
      }
  }
}
</script>
<style lang="scss">
.wordorder-form {
  padding: 10px 15px;
  background-color: #fff;
  min-width: 960px;
  .el-form-item{
    margin-bottom: 10px;
  }
  .el-col-1{
    text-align: center;
  }
  .el-select {
    width: 192px;
  }
}
.el-cascader-menus{
  .el-cascader-menu{
    padding: 0;
  }
}
</style>
