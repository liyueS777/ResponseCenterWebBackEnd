<template>
  <div v-loading.body="loading" element-loading-text="拼命加载中" style="height:100%;">
    <div class="g-head">
      <i :class="$route.meta.icon" class="title-icon"></i>
      <h2>{{breadcrumb[1]}}</h2>
      <el-breadcrumb separator=">">
        <i class="el-icon-share"></i>
        <el-breadcrumb-item v-for="(item,index) in breadcrumb" :key="index">{{item}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-row class="g-body">
      <el-col :span="24">
        <div class="m-input-group">
          <div class="input-group">
            <el-input placeholder="请输入账号" v-model="account" style="width: 600px;">
              <el-select style="width: 200px;" v-model="selectCompId" placeholder="请选择企业" filterable clearable slot="prepend" @change="getDataList(1)">
                <el-option v-for="item in enterpriseList" :key="item.compName" :label="item.compName" :value="item.compId"></el-option>
              </el-select>
              <el-button slot="append" icon="search" @click="getDataList()">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="editData()"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="账号" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.username}}</span>
              </template>
            </el-table-column>
            <el-table-column label="性别" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.sex ? '男':'女'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="客服" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.isCustomer ? '是':'否'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip width="200">
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template scope="scope">
                <el-button size="small" @click="editData(scope.row)">编辑</el-button>
                <el-button size="small" @click="deleteAccount(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getDataList" @current-change="getDataList" :page-size="pageSize" layout="total, prev, pager, next" :total="tableData.totalCount" ref="paginations"></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog class="editplatform-wrap" :title="viewData.title" :visible.sync="dialogEditViewVisible" size="small" top="3%" @close="closeView(true)">
        <editView :viewData="viewData" @viewStatus="closeView" :enterpriseList ="enterpriseList"></editView>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
  var reqTimer = null;
  import editView from "./edit-add/editPlatformView.vue";
  export default {
    props: ["breadcrumb"],
    components:{
      editView,
    },
    data () {
      return {
        account: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogEditViewVisible:false,
        viewData: {
          title: '',
          data: {},
          op: ''
        },
        loading:false,
        selectCompId: '',
        enterpriseList: [],
        stopRequst: false,
      }
    },
    watch: {
      '$route'(val, oldVal){ 
        if (val) {
          this.account = '';
          this.emptyData();
          this.getEnterprise();
        }
      }
    },
    beforeMount(){
      this.getEnterprise();
    },
    methods: {
      emptyData(){
        this.tableData = {};
        this.$refs.paginations.internalCurrentPage = 1;
      },
      getEnterprise(){
        let that =this;
        let config = {
          method:'post',
          url:'/company/getEnterpriseList'
        };
        that.axios(config).then((res)=>{ 
          if(res.data.code){
            that.enterpriseList = res.data.data;
            that.selectCompId = that.enterpriseList[0].compId;
          }
        }).catch((error)=>{
          console.log(error);
        });
      },
      getDataList(pageIndex){
        if(this.stopRequst) return;
        this.stopRequst = true;
        let that = this,
          reqData = {
            "compId": that.selectCompId || '',
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "username": that.account
          };
        that.axios.post('/manager/queryPageCompanyManager', reqData).then(function (res) {
            if(res.data.code){
              that.tableData = res.data.data;
            }else {
              that.emptyData();
              that.infoNotice('info', res.data.msg);
            }
            clearTimeout(reqTimer);
            reqTimer = setTimeout(()=>{
              that.stopRequst = false;
            }, 0);

        }).catch(function (error) {
          console.log(error);
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      editData(obj){
        this.viewData = {
          title: obj ? '修改账号' : '新增账号',
          data: obj || {},
        }
        this.viewData.op = obj && obj.id ? 'edit': 'add';
        this.dialogEditViewVisible = true;
      },
      closeView(refresh){
        this.dialogEditViewVisible = false;
        this.viewData = {
          title: '',
          data: {},
          op: ''
        };
        refresh && this.getDataList(this.$refs.paginations.internalCurrentPage);
      },
      deleteAccount(id){
        this.$confirm('确定要删除当前账号吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteAccountInfo(id);
        }, ()=>{});
      },
      deleteAccountInfo(id){
        let that = this,
            reqData = {
              "compId": that.selectCompId,
              "managerId": id
            };
        that.loading = true;
        that.axios.post('/manager/deleteManager', reqData).then(function (res) {
          that.loading = false;
           if(res.data.code){
             that.getDataList(that.$refs.paginations.internalCurrentPage);
             that.infoNotice('info', res.data.msg);
           }else {
             that.infoNotice('error', res.data.msg);
           }
        }).catch(function (error) {
          that.loading = false;
          console.log(error);
        });
      }, 
      infoNotice(type, msg){
         this.$message({
            type: type,
            message: msg,
            duration: 1500
          });
      },
    }
  }
</script>