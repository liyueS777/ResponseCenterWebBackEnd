<template>
  <div v-loading.body="loading" element-loading-text="拼命加载中" style="height:100%;">
    <div class="g-head">
      <i :class="$route.meta.icon" class="title-icon"></i>
      <h2>{{breadcrumb[1]}}</h2>
      <el-breadcrumb separator=">">
        <i class="el-icon-share"></i>
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">{{item}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-row class="g-body">
      <el-col :span="24">
        <div class="m-input-group">
          <div class="custom-group">
            <div v-if="$route.path == '/personPage'" style="display: flex;flex-flow: row nowrap;">
              <el-select  style="width: 200px;" v-model="selectCompId" placeholder="请选择企业" @change="getDepartList(selectCompId)">
                <el-option  v-for="item in compList" :key="item.compName" :label="item.compName" :value="item.compId"></el-option>
              </el-select>
              <el-input placeholder="请输入姓名" v-model="input" style="width: 400px;">
                <el-select style="width: 140px;" ref="depart" v-model="departId" filterable clearable slot="prepend" placeholder="选择部门" @change="getDataList(1)">
                  <el-option v-for="item in departList" :key="item.id" :label="item.departName" :value="item.id"></el-option>
                </el-select>
                <el-button slot="append" icon="search" @click="getDataList(1)">查找</el-button>
              </el-input>
            </div>
            <el-input placeholder="请输入公司名称" v-model="input" v-if="$route.path == '/companyPage'" style="width: 400px;">
              <el-button slot="append" icon="search" @click="getDataList(1)">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="addView"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <div>
            <el-table ref="multipleTable" :data="tableData.list"  border tooltip-effect="dark" style="width: 100%" :row-class-name="tableRowClassName"  @selection-change="handleSelectionChange"
              v-if="$route.path == '/personPage'">
              <el-table-column type="selection" width="45"></el-table-column>
              <el-table-column  width="90" label="姓名" show-overflow-tooltip>
                <template scope="scope" >{{scope.row.fullname}}</template>
              </el-table-column>
              <el-table-column width="70" label="字号" show-overflow-tooltip>
                <template scope="scope">{{scope.row.aliaName}}</template>
              </el-table-column>
              <el-table-column label="部门" width="130" show-overflow-tooltip>
                <template scope="scope">{{ scope.row.orgName }}</template>
              </el-table-column>
              <el-table-column label="职位" width="130" show-overflow-tooltip>
                <template scope="scope" >{{scope.row.posName}}</template>
              </el-table-column>
              <el-table-column label="Email" show-overflow-tooltip>
                <template scope="scope">{{scope.row.email}}</template>
              </el-table-column>
              <el-table-column label="领导"  width="110" show-overflow-tooltip>
                <template scope="scope">
                  <el-switch v-model="scope.row.isLead" on-text="是" off-text="否" @change="changeLead(scope.row)"></el-switch>
                </template>
              </el-table-column>
              <el-table-column label="创建时间" show-overflow-tooltip>
                <template scope="scope" >{{scope.row.createTime}}</template>
              </el-table-column>
              <el-table-column label="操作" width="220">
                <template scope="scope">
                  <el-button size="small"  @click="relation(scope.row.id)">关联视界</el-button>
                  <el-button size="small"  @click="roleSet(scope.row.id)">授权 </el-button>
                  <el-button size="small"  @click="deletePerson(scope.row.id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-table fit ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" :row-class-name="tableRowClassName"
            @selection-change="handleSelectionChange"  v-if="$route.path == '/companyPage'" >
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="企业名称" show-overflow-tooltip>
              <template scope="scope" >{{scope.row.compName}}</template>
            </el-table-column>
            <el-table-column label="企业编码" show-overflow-tooltip>
              <template scope="scope">{{scope.row.compCode}}</template>
            </el-table-column>
            <el-table-column label="领导字号" show-overflow-tooltip>
              <template scope="scope">{{scope.row.aliasName === 'null' ? '' :scope.row.aliasName}}</template>
            </el-table-column>
            <el-table-column label="操作" width="280">
              <template scope="scope">
                <el-button size="small" @click="relation(scope.row.compId)">关联</el-button>
                <el-button size="small" @click="editData(scope.row)">编辑</el-button>
                <el-button size="small" @click="editUserStatus(scope.row)">指派领导</el-button>
                <el-button size="small" @click="deleteCompany(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getDataList" @current-change="getDataList" :page-size="pageSize" layout="total, prev, pager, next" :total="tableData.totalCount"
                ref="paginations"></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog :title="relationData.title" :visible.sync="dialogRelationPersonVisible" ref="relationPerson" top="3%" @close="closeRelationPerson(true)">
        <relationPerson :relationData="relationData" @relationStatus="closeRelationPerson" :selectCompId="selectCompId"></relationPerson>
      </el-dialog>
      <el-dialog  class="person-status-wrap" :title="statusData.title" :close-on-click-modal='false' :visible.sync="dialogPersonStatusVisible" ref="personStatus" top="3%" @close="closePersonStatus(true)">
        <personStatus :statusData="statusData" :compList="compList" @personStatus="closePersonStatus"></personStatus>
      </el-dialog>
      <el-dialog class="editcompany-wrap" :title="viewData.title" :visible.sync="dialogEditUserLeadVIsible" ref="editPersonPos" top="3%" @close="closeView(true)">
        <editCompany :viewData="viewData" @viewStatus="closeView" v-if="$route.path == '/companyPage'"></editCompany>
        <editUserLead :viewData="viewData" @editStatus="closeView" v-if="$route.path == '/personPage'"></editUserLead>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import relationPerson from './edit-add/relationPerson.vue';
  import personStatus from './edit-add/personStatus.vue';
  import editUserLead from'./edit-add/editUserLead.vue';
  import editCompany from './edit-add/editCompany.vue';
  export default {
    props: ["breadcrumb"],
    components:{
      relationPerson,
      personStatus,
      editCompany,
      editUserLead
    },
    data () {
      return {
        input: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogEditUserLeadVIsible: false,
        dialogRelationPersonVisible: false,
        dialogPersonStatusVisible:false,
        dialogEditCompanyVisible: false,
        relationData: {
          title: '',
          id: '',
          op: ''
        },
        viewData: {
          title: '',
          op: 'add',
          data: {},
        },
        statusData: {
          title: '',
          data:{},
          op: ''
        },
        loading:false,
        departList: [],
        departId: '',
        compList: [],
        selectCompId: '',
        stopRequest: false 
      }
    },
    computed:{
      addView(){
        return this.$route.path == '/personPage'? this.editUserStatus : this.editData
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.input = '';
          this.emptyData();
          if(this.$route.path == '/companyPage'){
            this.getDataList();
          }
          this.getCompany();
        }
      }
    },
    beforeMount(){
      if(this.$route.path == '/companyPage'){
         this.getDataList();
      }
      this.selectCompId = '';
      this.departId = '';
      this.getCompany();
    },
    methods: {
      getDataList(pageIndex){
        if(this.stopRequest) return; //阻止因为分页页码变化，再次请求数据
        this.stopRequest = true;
        let that = this, config;
        if(that.$route.path == '/personPage'){
          if(!that.departId) {
             this.stopRequest = false;
             return;
          };
          config = {
            url: '/user/queryPageUser',
            data: {
              "compId": that.selectCompId,
              "pageIndex": pageIndex ? pageIndex : 1,
              "pageSize": that.pageSize,
              "name": that.input,
              "departId": that.departId,
              "show": 1
            }
          };
        } else if (that.$route.path == '/companyPage') {
          config = {
            url: '/company/queryPageCompany',
            data: {
              "compId":that.COMPID,
              "pageIndex":pageIndex ? pageIndex : 1,
              "pageSize":that.pageSize,
              "name":that.input,
            }
          }
        }
        that.axios(config).then(function (res) {
            if(res.data.code){
              if(that.$route.path == '/personPage'){
                  for(let i = 0;i<res.data.data.list.length;i++){
                    res.data.data.list[i].isLead = res.data.data.list[i].isLead ? true:false;
                  }
              }
              that.tableData = res.data.data;
            }else {
              that.tableData = {};
              that.infoNotice('info', res.data.msg);
            }
            clearTimeout(reqTimer);
            reqTimer = setTimeout(()=>{
              that.stopRequest = false;
            }, 0);

        }).catch(function (error) {
          console.log(error);
        });
      },
      getDepartList(selectCompId){
        const that = this;
        let axiosConfig = {
          url: '/depart/getDepartMethod',
          data: {
            "compId": selectCompId
          }
        };
        that.axios(axiosConfig).then(function (res) {
          if (res.data.code) {
            if(!res.data.data.length) return;
            that.departList = res.data.data;
            that.departId = res.data.data[0].id;
          } else {
            that.emptyData();
            that.infoNotice('warning', res.data.msg);
          }
        }).catch(function (error) {
          console.log(error);
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      editData(obj){
        this.dialogEditUserLeadVIsible = true;
        this.dialogEditCompanyVisible = true;
        if(this.$route.path == '/companyPage'){
          if(obj.compId){
            this.viewData = {
              title: '修改企业',
              data: obj,
              op: 'edit'
            };
          }else{
            this.viewData = {
              title:'新增企业',
              data: {},
              op: 'add'
            };
          }
          this.$nextTick(function(){
            this.$refs.editPersonPos.$el.getElementsByClassName('el-dialog--small')[0].style.width='400px';
          });
        }
      },
      closeView(refresh){
        this.dialogEditUserLeadVIsible = false;
        this.dialogEditCompanyVisible = false;
        this.viewData = {
            title: '',
            data: {},
            op: ''
        }
        refresh && this.getCompany();
        refresh && this.getDataList(this.$refs.paginations.internalCurrentPage);
      },
      relation(id){
        this.dialogRelationPersonVisible = true;
        if(this.$route.path == '/personPage'){
          this.relationData = {
              title:'人员关联',
              op: 'person',
              id
          }
        }else if(this.$route.path == '/companyPage'){
          this.relationData = {
            title:'视界集关联',
            op: 'views',
            id
          }
        }
        this.$nextTick(function(){
          this.$refs.relationPerson.$el.getElementsByClassName('el-dialog--small')[0].style.width='800px';
        });
      },
      closeRelationPerson(){ 
        this.dialogRelationPersonVisible = false;
        this.relationData = {
          title:'人员关联',
          id: '',
          op: ''
        };
      },
      deletePerson(id){
        this.$confirm('确定要删除当前用户吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.editPersonStatus(id);
        }, ()=>{});
      },
      deleteCompany(row){
        this.$confirm('确定要删除当前企业吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          let config = {
            url:  '/company/deleteCompany',
            data: {
              "compId": row.compId
            }
          }

          this.axios(config).then((res)=>{
            this.loading = false;
            if(res.data.code){
              this.getDataList(this.$refs.paginations.internalCurrentPage);
              this.infoNotice('info', res.data.msg);
            }else{
              this.infoNotice('error', res.data.msg);
            }
          }).catch((error)=>{
            console.log(error);
          })
        }, ()=>{});
      },
      editPersonStatus(id){
        let that = this,
            config = {
              url:  '/user/deleteUserById',
              data: {
                "compId": that.selectCompId,
                "userId":id
              }
            };
        that.loading = true;
        that.axios(config).then(function (res) {
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
      editUserStatus(obj){
        if(!obj.compId){
          this.statusData = {
            title:'选择用户',
            data:{},
            op: 'selectUser'
          };
        }else{
          this.statusData = {
            title: '选择领导人',
            data: obj,
            op: 'selectLeader'
          }
        }
        this.dialogPersonStatusVisible = true;
        this.$nextTick(function(){
          this.$refs.personStatus.$el.getElementsByClassName('el-dialog--small')[0].style.width='850px';
        });
      },
      closePersonStatus(refresh){ 
        this.dialogPersonStatusVisible = false;
        this.statusData = {
          title: '',
          data: {},
          op: ''
        }
        refresh && this.getDataList();
      },
      tableRowClassName(row, index){
        return row.isLead === true ? 'positive-row' : 'normal';
      },
      roleSet(id){
        this.dialogRelationPersonVisible = true;
        this.relationData={
          title: '角色授权',
          id,
          op: 'role'
        };
      },
      getCompany(){
        let that =this;
        let option = {
          method:'post',
          url:'/company/getCompanyAllMethod',
          data:{
            "compId":that.COMPID,
          }
        };
        that.axios(option).then((res)=>{
          if(res.data.code){
            that.compList = res.data.data;
            that.selectCompId = res.data.data[0].compId;
          }
        }).catch((error)=>{
          console.log(error);
        });
      },
      changeLead(obj){
        let that = this,
          config = {
            url: '/user/updateUserLead',
            data: {
              'compId': obj.compId,
              'userId': obj.id,
              'departId': obj.departId,
              'isLead': obj.isLead == true ? 1 : 0,
            }
          };
        that.loading = true;
        that.axios(config).then(function (res) {
          that.loading = false;
          if (res.data.code) {
              that.getDataList(that.$refs.paginations.internalCurrentPage);
          } else {
            that.infoNotice('error', res.data.msg);
          }
        }).catch(function (error) {
          that.loading = false;
          console.log(error);
        });
      },
      emptyData(){
        this.tableData = {};
        this.$refs.paginations.internalCurrentPage = 1;
        this.departList= [];
        this.departId= '';
        this.selectCompId = '';
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
<style lang="scss">
  .el-table {
    .positive-row {
      .cell {
        font-family: sans-serif;
        font-weight: bold;
        white-space: nowrap;
      }
    }
    .normal {
      .cell {
        white-space: nowrap;
      }
    }
  }
</style>
