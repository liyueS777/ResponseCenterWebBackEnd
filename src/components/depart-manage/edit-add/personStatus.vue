<template>
  <div style="height:100%;">
    <el-row class="g-body">
      <el-col :span="24">
        <div class="search-body">
          <el-select v-model="companyId" placeholder="选择企业" @change="getDepartList(companyId)" :disabled="statusData.op=='selectLeader'? true: false" style="width: 200px;">
            <el-option v-for="(item, index) in compList" :key="index" :label="item.compName" :value="item.compId"></el-option>
          </el-select>
          <el-input placeholder="请输入姓名" v-model="selectUser">
            <el-select ref="depart" v-model="departId" filterable clearable slot="prepend" placeholder="选择部门" @change="getUserList(1)">
              <el-option v-for="item in departList" :key="item.id" :label="item.departName"  :value="item.id"></el-option>
            </el-select>
            <el-button slot="append" icon="search" @click="getUserList(1)">查找</el-button>
          </el-input>
        </div>
        <div class="m-body">
          <div class="m-buttons" style="margin-bottom: 10px;">
            <el-button type="info" @click="editUser"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <div v-if="statusData.op ==='selectUser'">
            <el-table ref="multipleTable" v-loading.body="loading" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
              <el-table-column type="selection" width="55">
              </el-table-column>
              <el-table-column label="姓名" width="80">
                <template scope="scope">{{scope.row.fullname!="null"?scope.row.fullname: ''}}</template>
              </el-table-column>
              <el-table-column label="字号" width="80">
                <template scope="scope">{{scope.row.aliaName!="null" ? scope.row.aliaName: ''}}</template>
              </el-table-column>
              <el-table-column label="部门" show-overflow-tooltip>
                <template scope="scope">{{ scope.row.orgName }}</template>
              </el-table-column>
              <el-table-column label="职位" show-overflow-tooltip>
                <template scope="scope">{{scope.row.posName!= "null" ? scope.row.posName: ''}}</template>
              </el-table-column>
              <el-table-column label="Email" show-overflow-tooltip>
                <template scope="scope">{{ scope.row.email}}</template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template scope="scope">
                  <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
                  <el-button size="small" @click="deleteUser(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <editUser v-if="dialogEditUserVisible" :viewData="viewData" @viewStatus="closeView(true)" :compList="compList"></editUser>
          </div>
          <el-table ref="multipleTable" v-loading.body="loading" highlight-current-row :data="tableData.list" border tooltip-effect="dark" style="width: 100%" @current-change="handleCurrentChange" v-if="statusData.op ==='selectLeader'">
            <el-table-column label="#" width="60" style="overflow: hidden">
              <template scope="scope"><el-radio class="radio" v-model="currentRow" :label="scope.row.id"></el-radio></template>
            </el-table-column>
            <el-table-column label="姓名" width="80">
              <template scope="scope">{{scope.row.fullname!="null"?scope.row.fullname: ''}}</template>
            </el-table-column>
            <el-table-column label="字号" width="80">
              <template scope="scope">{{scope.row.aliaName}}</template>
            </el-table-column>
            <el-table-column label="部门" show-overflow-tooltip>
              <template scope="scope">{{ scope.row.orgName }}</template>
            </el-table-column>
            <el-table-column label="职位" show-overflow-tooltip>
              <template scope="scope">{{scope.row.posName}}</template>
            </el-table-column>
            <el-table-column label="Email" show-overflow-tooltip>
              <template scope="scope">{{scope.row.email}}</template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getUserList" @current-change="getUserList" :page-size="pageSize" layout="total, prev, pager, next" :total="tableData.totalCount" ref="paginations">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-col style="text-align: center;margin-top: 15px;" v-show="tableData.list && tableData.list.length > 0">
        <el-button class="large-button"  type="info" size="large" @click="confirm" :disabled="(multipleSelection.length || currentRow )? false : true">确定</el-button>
      </el-col>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
import editUser from "./editUser.vue";
export default {
  props: ['statusData', 'compList'],
  components:{
    editUser
  },
  data() {
    return {
      selectUser: "",
      pageSize: 10,
      tableData: {},
      multipleSelection: [],
      loading: false,
      departList: [],
      departId: '',
      companyId: '',
      viewData: {
        title: '新增用户',
        data: {},
        op: ''
      },
      currentRow:null,
      dialogEditUserVisible: false,
      stopRequest: false, //阻止table数据清空后，再次请求
    }
  },
  watch: {
    'statusData.op'(val, oldVal) {
      if(val){
        this.selectUser = '';
        this.initData();
      }
    }
  },
  mounted(){
    let left = (document.body.clientWidth - this.$parent.$refs.dialog.clientWidth)/2 + 'px';
    this.$parent.$refs.dialog.style.left = left;
    this.initData();
  },
  methods: {
    initData(){
      this.emptyData();
      if(this.statusData.op == 'selectLeader'){
        let oldcompanyId = this.companyId
        this.companyId = this.statusData.data.compId;
        if(oldcompanyId == this.companyId)  this.getDepartList(this.companyId);
      }else{
        this.companyId = this.compList && this.compList.length && this.compList[0].compId;
        // console.log('部门列表：', this.departList)
        this.departId = this.departList && this.departList.length && this.departList[0].id;
      }
    },
    editUser(obj){
      this.dialogEditUserVisible = true;
      if(obj.id){
        this.viewData = {
          title: '编辑用户',
          data: obj,
          op: 'edit'
        }
      }else{
        this.viewData = {
          title: '新增用户',
          data: {},
          op: 'add'
        }
      }
    },
    infoNotice(type, msg){
      this.$message({
        type: type,
        message: msg,
        duration: 1500
      });
    },
    deleteUser(obj){
      this.$confirm('确定要删除当前用户吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true;
        let config = {
          url:  '/user/deleteUser',
          data: {
            "compId": this.companyId,
            "userId": obj.id
          }
        }
        this.axios(config).then((res)=>{
          this.loading = false;
          if(res.data.code){
            this.getUserList(this.$refs.paginations.internalCurrentPage);
            this.selectUser = '';
            this.infoNotice('info', res.data.msg);
          }else{
            this.infoNotice('error', res.data.msg);
          }
        }).catch((error)=>{
          console.log(error);
        })
      },()=>{});
    },
    closeView(refresh){
      this.dialogEditUserVisible = false;
      this.viewData = {
        title: '',
        data: {},
        op: ''
      }
      refresh && this.getUserList(this.$refs.paginations.internalCurrentPage);
    },
    getUserList(pageIndex) {
      if(this.stopRequest) return;
      this.stopRequest = true;
      if(!this.departId){ //确保部门id不为空的情况下，请求用户列表
        this.stopRequest = false;
        return; 
      } 
      let that = this, axiosConfig;
      axiosConfig = {
        url: '/user/queryPageUser',
        data: {
          "compId": that.companyId,
          "pageIndex": pageIndex ? pageIndex : 1,
          "pageSize": that.pageSize,
          "name": that.selectUser,
          "departId": that.departId,
          "show": that.statusData.op ==='selectUser' ? 0 : 1
        }
      };
      if(that.statusData.data){
        that.currentRow = that.statusData.data.userId;
        that.loading = true;
        that.axios(axiosConfig).then(function (res) {
          that.loading = false;
          if (res.data.code) {
            that.tableData = res.data.data;
          } else {
            that.infoNotice('info', res.data.msg);
            that.tableData = {};
            that.$refs.paginations.internalCurrentPage = 1;
          }
          clearTimeout(reqTimer);
          reqTimer = setTimeout(()=>{
            that.stopRequest = false;
          }, 0);

        }).catch(function (error) {
          that.loading = false;
          console.log(error);
        });
      }
    },
    getDepartList(companyId){
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
            that.departList = res.data.data;
            that.departId = res.data.data[0].id;
          } else {
            that.tableData = {};
            that.departList = [];
            that.departId = '';
            that.infoNotice('info', res.data.msg);
          }
        }).catch(function (error) {
          console.log(error);
        });
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    close(refresh) {
      this.$emit('personStatus', refresh);
    },
    confirm() {
      let that = this, config;
      if(that.statusData.op ==='selectUser'){
        if(this.multipleSelection.length === 0){
          that.infoNotice('info', '请勾选用户!'); return;
        }
        config = {
          url: '/user/updateUserById',
          data: {
            "userIds": that.multipleSelection.map(item => item.id)
          }
        };
      }else if(that.statusData.op ==='selectLeader'){
        config = {
          url:'/companyUser/companyAssignLead',
          data: {
            "compId":that.statusData.data.compId,
            "userId": that.currentRow
          }
        };
      }
      that.loading = true;
      that.axios(config).then(function (res) {
        that.loading = false;
        if (res.data.code) {
          that.close(false);
        } else {
          that.infoNotice('error',  res.data.msg);
        }
      }).catch(function (error) {
        that.loading = false;
        console.log(error);
      });
    },
    emptyData(){
      this.tableData={};
      this.loading = false;
      this.departId = '';
      this.currentRow = null;
    },
    handleCurrentChange(val) {
      if(val){
        this.currentRow = val.id;
      }
    }
  }
}
</script>
<style lang="scss">
.large-button{
  width: 25%;
}
.min-height{
  .el-input__inner{
    height: 35px;
  }
}
.search-body {
    width: 500px;
    margin-bottom: 15px;
    padding: 0 10px;
    display: flex;
    flex-flow: row nowrap;
    .el-select {
      width: 140px;
    }
}
.m-body{
  .el-radio.radio{
    .el-radio__label{
      display: none;
    }
  }
  .edit-user-wrapper{
    .el-dialog--small{
      border: 1px solid #999;
    }
  }
  
}
.person-status-wrap{
  .el-dialog{
    position: absolute;
    left: 0;
    transform: none;
  }
}  
</style>
