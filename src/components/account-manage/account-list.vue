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
            <el-input placeholder="请输入账号" v-model="account" style="width: 400px;">
              <el-button slot="append" icon="search" @click="getDataList()">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="editData()"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="企业账号管理" name="company"></el-tab-pane>
            <el-tab-pane label="客服账号管理" name="custom"></el-tab-pane>
          </el-tabs>
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
            <el-table-column label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template scope="scope">
                <el-button size="small" @click="editData(scope.row)">编辑</el-button>
                <el-button size="small" v-if="activeName=='company'" @click="setRelation(scope.row.id)">关联角色</el-button>
                <el-button size="small" @click="deleteAccount(scope.row.id)">删除</el-button>
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
      <el-dialog class="editaccount-wrap" :title="viewData.title" :visible.sync="dialogEditViewVisible" size="small" top="3%" @close="closeView(true)">
        <editView :viewData="viewData" :activeName="activeName" @viewStatus="closeView"></editView>
      </el-dialog>
      <el-dialog :title="relationData.title" :visible.sync="dialogRelationVisible" size="small" top="3%" @close="closeRelation">
        <relation :relationData="relationData" @relationStatus="closeRelation"></relation>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import editView from "./edit-add/editAccountView.vue";
  import relation from './edit-add/relation.vue';
  export default {
    props: ["breadcrumb"],
    components:{
      editView,
      relation
    },
    data () {
      return {
        account: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogEditViewVisible:false,
        dialogRelationVisible: false,
        viewData: {
          title: '',
          data: {},
          op: ''
        },
        relationData: {
          title: '',
          id: '',
        },
        loading:false,
        activeName: 'company',
        stopRequest: false
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.account = '';
          this.emptyData();
          this.getDataList();
        }
      }
    },
    beforeMount(){
      this.getDataList();
    },
    methods: {
      emptyData(){
        this.tableData = {};
        this.$refs.paginations.internalCurrentPage = 1;
      },
      handleClick(tab, event) {
        this.activeName = tab.name;
        this.getDataList();
      },
      getDataList(pageIndex, account){ 
        if(this.stopRequest) return;
        this.stopRequest = true;
        let that = this, reqData, isCustomer;
        isCustomer = this.activeName == 'company' ? 0 : 1
        reqData = {
          "compId": that.COMPID,
          "pageIndex": pageIndex ? pageIndex : 1,
          "pageSize": that.pageSize,
          "username": (account ? account : that.account) || '',
          "isCustomer": isCustomer
        };
        that.axios.post('/manager/queryPageManager', reqData).then(function (res) {
            if(res.data.code){
              that.tableData = res.data.data;
            }else {
              that.emptyData();
              that.$message({
                type: 'info',
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
        refresh && this.getDataList();
      },
      deleteAccount(id){
        this.$confirm('确定要删除当前账号吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteAccountInfo(id);
        },()=>{});
      },
      deleteAccountInfo(id){
        if(!this.COMPID) return;
        let that = this,
            reqData = {
              "compId": that.COMPID,
              "managerId":id
            };
        that.loading = true;
        that.axios.post('/manager/deleteManager', reqData).then(function (res) {
          that.loading = false;
           if(res.data.code){
             that.getDataList(that.$refs.paginations.internalCurrentPage);
             that.$message({
               type: 'info',
               message: res.data.msg,
               duration: 1500
             });
           }else {
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
      setRelation(id){
        this.dialogRelationVisible = true;
        this.relationData = {
          title: '角色授予',
          id,
        };
      },
      closeRelation(refresh){
        this.dialogRelationVisible = false;
        this.relationData = {
          title: '',
          id: '',
        };
        refresh && this.getDataList(this.$refs.paginations.internalCurrentPage);
      },
    }
  }
</script>

