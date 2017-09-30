<template>
  <div>
    <div class="g-head">
      <i :class="$route.meta.icon" class="title-icon"></i>
      <h2>{{breadcrumbTitle[1]}}</h2>
      <el-breadcrumb separator=">">
        <i class="el-icon-share"></i>
        <el-breadcrumb-item v-for="(item,index) in breadcrumbTitle" :key="index">{{item}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-row class="g-body">
      <el-col :span="24">
        <div class="m-input-group">
          <div class="input-group">
            <el-select v-model="selectCompId" placeholder="选择企业" filterable clearable slot="prepend" style="width: 200px;">
              <el-option v-for="item in compList" :key="item.compName" :label="item.compName" :value="item.compId"></el-option>
            </el-select>
            <el-input placeholder="请输入名称" v-model="viewName" style="width: 400px;">
              <el-select ref="depart" v-model="departId" filterable clearable slot="prepend" placeholder="选择类型" @change="getViewList(1)">
                <el-option  v-for="item in departList"  :key="item.value"  :label="item.label"  :value="item.value">
                </el-option>
              </el-select>
              <el-button slot="append" icon="search" @click="getViewList(1)">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="editData"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="名称" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.viewName}}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.type === 1 ? '企业' : scope.row.type === 2 ? '部门' : '用户'}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="220">
              <template scope="scope">
                <el-button size="small" @click="relation(scope.row.id)">关联</el-button>
                <el-button size="small" @click="editData(scope.row)">编辑 </el-button>
                <el-button size="small" @click="deleteSelect(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getViewList" @current-change="getViewList" :page-size="pageSize" layout="total, prev, pager, next" :total="tableData.totalCount"
                ref="paginations"></el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog class="view-list-wrap" :title="viewData.title" :visible.sync="dialogViewListVisible" size="small" top="3%" @close="closeView(true)">
        <addView :viewData="viewData" @mailStatus="closeView" :compList="compList"></addView>
      </el-dialog>
      <el-dialog :title="relationData.title" :visible.sync="dialogRelationVisible" ref="relation" top="3%" @close="closeRelation">
        <relationPage :relationData="relationData" @relationStatus="closeRelation" :selectCompId="selectCompId"></relationPage>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import addView from "./edit-add/addview.vue";
  import relationPage from './edit-add/relation.vue';
  export default {
    props: ["breadcrumb"],
    components:{
      addView,
      relationPage,
    },
    data () {
      return {
        viewName: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogViewListVisible: false,
        dialogRelationVisible: false,
        viewData:{
          title:'',
          data:{},
          op: ''
        },
        relationData:{
          title:'',
          id: ''
        },
        breadcrumbTitle:[],
        departList: [{
          value: 1,
          label: '企业'
        }, {
          value: 2,
          label: '部门'
        }, {
          value: 3,
          label: '用户'
        }],
        departId: 3,
        stopRequest: false,
        selectCompId: '',
        compList: []
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.viewName = '';
          this.emptyData();
        }
      },
      'selectCompId'(val, oldVal){
        if(val){
          this.departId = 1;
          this.$refs.paginations.internalCurrentPage = 1;
          this.getViewList();
        }
      }
    },
    beforeMount(){
      this.getCompany();
      this.departId = 1;
      if(this.breadcrumb && this.breadcrumb.length){
        this.breadcrumbTitle = this.breadcrumb;
      }
    },
    methods: {
      emptyData(){
        this.tableData = {};
        this.$refs.paginations.internalCurrentPage = 1;
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
      },
      getViewList(pageIndex){
        if(this.stopRequest) return;
        this.stopRequest = true;
        let that = this, ajaxUrl;
        ajaxUrl = that.HOST + '/view/queryPageView';
        let config = {
          method: 'post',
          url: ajaxUrl,
          data: {
            "compId": that.selectCompId,
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "name": that.viewName ? that.viewName : '',
            "type": that.departId ? that.departId:'',
          }
        };
        that.$refs.paginations.internalCurrentPage = pageIndex || 1;
        that.axios(config).then(function (res) {
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
      deleteSelect(index){
        let that = this, ajaxUrl, ajaxData, tip;
        if (index === 'all') {
          if (that.multipleSelection.length === that.tableData.list.length) {
            if (that.$route.path === '/viewPage') {
              tip = '是否要批量删除视界？';
            }
          }
          else {
            that.$message({
              type: 'info',
              message: '请勾选全部!',
              duration: 700
            });
            return;
          }
        }
        else {
          if (that.$route.path === '/viewPage') {
            ajaxUrl = '/view/deleteView';
            ajaxData = {
              "compId": that.selectCompId,
              "viewId": index
            };
            tip = '是否要删除视界？';
          }
        }
        that.$confirm(tip, '', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let config = {
            method: 'post',
            url: that.HOST + ajaxUrl,
            data: ajaxData
          };
          that.axios(config).then(function (res) {
            if (res.data.code) {
              that.getViewList();
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
        }, ()=>{})
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      editData(obj){
        this.dialogViewListVisible = true;
        if(obj.id) {
          this.viewData = {
            title: '编辑视界',
            data: obj || {},
          };
        }
        else {
          this.viewData = {
            title: '新增视界',
            data: {}
          };
        }
        this.viewData.op = obj && obj.id ? 'edit': 'add';
        this.$nextTick(function(){
          this.$refs.relation.$el.getElementsByClassName('el-dialog--small')[0].style.width='300px';
        });
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
        };
        refresh && this.getViewList();
      },
      closeRelation(refresh){
        this.dialogRelationVisible = false;
        this.relationData = {
          title:'',
          id: ''
        };
        refresh && this.getViewList();
      },
    }
  }
</script>
