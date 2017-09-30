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
          <div class="input-group">
            <el-input placeholder="请输入名称" v-model="departName" style="width: 600px;">
              <el-select style="width: 200px;" v-model="selectCompId" placeholder="请选择企业" filterable clearable slot="prepend" @change="getDataList(1)">
                <el-option v-for="item in compList" :key="item.compName" :label="item.compName" :value="item.compId">  </el-option>
              </el-select>
              <el-button slot="append" icon="search" @click="getDataList()">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <!--<el-button @click="deleteSelect('all')"><i class="el-icon-close"></i> 批量删除</el-button>
            <el-button type="info" @click="addDepartAndUser">同步OA部门</el-button>-->
            <el-button type="info" @click="editDepart"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <el-table  ref="multipleTable"  :data="tableData.list"  border tooltip-effect="dark" style="width: 100%"  @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">  </el-table-column>
            <el-table-column label="名称" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.orgName}}</span>
              </template>
            </el-table-column>
            <el-table-column  label="描述" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.orgDesc}}</span>
              </template>
            </el-table-column>
            <el-table-column  label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template scope="scope">
                <el-button size="small" @click="relation(scope.row.id)">关联</el-button>
                <el-button  size="small"  @click="editDepart(scope.row)">编辑 </el-button>
                <el-button size="small"  @click="deleteDepart(scope.row)">删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination  @size-change="getDataList"  @current-change="getDataList" :page-size="pageSize" layout="total, prev, pager, next"  :total="tableData.totalCount"  ref="paginations">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog class="editdepart-wrap" :title="viewData.title" :visible.sync="dialogViewListVisible" size="small" top="3%" @close="closeView(true)">
        <editDepart :compList="compList" :viewData="viewData" @viewStatus="closeView"></editDepart>
      </el-dialog>
      <el-dialog :title="relationData.title" :visible.sync="dialogRelationVisible" ref="relation" top="3%" @close="closeRelation">
        <relationDepart :relationData="relationData" @relationStatus="closeRelation" :selectCompId="selectCompId"></relationDepart>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import editDepart from "./edit-add/editDepart.vue";
  import relationDepart from './edit-add/relationDepart.vue';
  export default {
    props: ["breadcrumb"],
    components:{
      editDepart,
      relationDepart,
    },
    data () {
      return {
        departName: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogRelationVisible: false,
        dialogViewListVisible: false,
        relationData: {
          title: '关联',
          id: ''
        },
        viewData: {
          title: '新增部门',
          data: {},
          op: ''
        },
        loading:false,
        compList: [],
        selectCompId: '',
        stopRequest: false
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.departName = '';
          this.emptyData();
          this.getCompany();
        }
      },
      'selectCompId'(val, oldVal){
        if(val){
          this.$refs.paginations.internalCurrentPage = 1;
        }
      }
    },
    beforeMount(){
      this.getCompany();
    },
    methods: {
      emptyData(){
        this.tableData = {};
        this.$refs.paginations.internalCurrentPage = 1;
      },
      getDataList(pageIndex){
        if(this.stopRequest) return;
        this.stopRequest = true;
        const that = this;
        let config = {
          url: '/depart/queryPageDepart',
          data: {
            "compId": that.selectCompId,
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "name": that.departName
          }
        };
        that.axios(config).then(function (res) {
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
      editDepart(obj){
        this.dialogViewListVisible = true;
        if(obj.id){
          this.viewData = {
            title: '编辑部门',
            data: obj,
            op: 'edit'
          };
        }else{
          this.viewData = {
            title: '新增部门',
            data: {},
            op: 'add'
          };
        }       
      },
      deleteDepart(obj){
        this.$confirm('确定要删除当前部门吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.loading = true;
          let config = {
            url:  '/depart/deleteDepart',
            data: {
              "compId": this.selectCompId,
              "departId": obj.id
            }
          }

          this.axios(config).then((res)=>{
            this.loading = false;
            if(res.data.code){
              this.getDataList(this.$refs.paginations.internalCurrentPage);
              this.$message({
                type: 'info',
                message: res.data.msg,
                duration: 1500
              });
            }else{
              this.$message({
                type: 'error',
                message: res.data.msg,
                duration: 1500
              });
            }
          }).catch((error)=>{
            console.log(error);
          })
        }, ()=>{});
      },
      relation(id){
        this.dialogRelationVisible = true;
        this.relationData.id=id;
        this.$nextTick(function(){
          this.$refs.relation.$el.getElementsByClassName('el-dialog--small')[0].style.width='800px';
        });
      },
      closeView(refresh){
        this.dialogViewListVisible = false;
        this.viewData = {
            title: '',
            data: {},
            op: ''
        }
        refresh && this.getDataList(this.$refs.paginations.internalCurrentPage);
        
      },
      closeRelation(){
        this.dialogRelationVisible = false;
        this.relationData = {
          title:'',
          id: ""
        };
      },
      addDepartAndUser(){
        const that = this;
        that.loading = true;
        let config = {
          url: '/depart/addDepartAndUser',
          data: {
            "compId": that.COMPID,
          }
        };
        that.axios(config).then(function (res) {
          that.loading = false;
           if(res.data.code){
             that.getDataList();
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
          console.log(error);
        });
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
            that.selectCompId = that.compList[0].compId;
          }
        }).catch((error)=>{
          console.log(error);
        });
      }
    }
  }
</script>

