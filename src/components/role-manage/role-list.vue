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
            <el-input placeholder="请输入角色名称" v-model="roleName" style="width: 400px;">
              <el-button slot="append" icon="search" @click="getDataList()">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="editData()"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="终端角色管理" name="foreEnd"></el-tab-pane>
            <el-tab-pane label="平台角色管理" name="backEnd"></el-tab-pane>
          </el-tabs>
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="角色名称" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.roleName}}</span>
              </template>
            </el-table-column>
            <el-table-column label="角色描述" show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.roleDesc}}</span>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="240">
              <template scope="scope">
                <el-button size="small" @click="editData(scope.row)">编辑</el-button>
                <el-button size="small" @click="setData(scope.row.id)">关联权限</el-button>
                <el-button size="small" @click="deleteAccount(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getDataList"  @current-change="getDataList" :page-size="pageSize" layout="total, prev, pager, next"
                :total="tableData.totalCount"  ref="paginations">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog class="editrole-wrap" :title="viewData.title" :visible.sync="dialogEditViewVisible" size="small" top="3%" @close="closeView(true)">
        <editView :viewData="viewData" :activeName="activeName" @viewStatus="closeView"></editView>
      </el-dialog>
      <el-dialog :title="relationData.title" :visible.sync="dialogRelationVisible" size="small" top="3%" @close="closeRelation">
        <relation :relationData="relationData" @relationStatus="closeRelation"></relation>
      </el-dialog>
      <el-dialog :title="powerData.title" :close-on-click-modal='false' :visible.sync="dialogPowerVisible" size="small" top="3%" @close="closePower">
        <power :powerData="powerData" @powerStatus="closePower"></power>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import editView from "./edit-add/editRoleView.vue";
  import relation from './edit-add/relation.vue';
  import power from './edit-add/power.vue';
  export default {
    props: ["breadcrumb"],
    components:{
      editView,
      relation,
      power
    },
    data () {
      return {
        roleName: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogEditViewVisible:false,
        dialogPowerVisible: false, //控制后端权限
        viewData: {
          title: '',
          data: {},
          op: ''
        },
        loading:false,
        relationData: {
          title: '',
          id: ''
        },
        powerData:{
          title: '后端权限授予',
          id: '',
        },
        dialogRelationVisible:false,
        activeName: 'foreEnd',
        stopRequest: false
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.roleName = '';
          this.tableData = {};
          this.getDataList();
        }
      }
    },
    beforeMount(){
      this.getDataList();
    },
    methods: {
      handleClick(tab, event) {
        this.activeName = tab.name;
        this.$refs.paginations.internalCurrentPage = 1;
        this.getDataList();
      },
      getDataList(pageIndex, roleName){
        if(this.stopRequest) return;
        this.stopRequest = true;
        let that = this, config, reqUrl;
        reqUrl = this.activeName == 'foreEnd'? '/role/queryPageRole' : '/mrole/queryPageMRole';
        config = {
          method: 'post',
          url: that.HOST + reqUrl,
          data: {
            "compId": that.COMPID,
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "name": that.roleName
          }
        };
        that.axios(config).then(function (res) {
            if(res.data.code){
              that.tableData = res.data.data;
            }else {
              that.$refs.paginations.internalCurrentPage = 1;
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
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      editData(obj){
        this.viewData = {
          title: obj ? '修改角色' : '新增角色',
          data: obj || {},
        }
        this.viewData.op = obj && obj.id ? 'edit': 'add';
        this.dialogEditViewVisible = true;
      },
      closeView(refresh){
        this.dialogEditViewVisible = false;
        this.viewData = {
          title: '修改角色',
          data: {},
          op: ''
        };
        refresh && this.getDataList(this.$refs.paginations.internalCurrentPage);
      },
      deleteAccount(id){
        this.$confirm('确定要删除当前角色吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteAccountInfo(id);
        }, ()=>{});
      },
      deleteAccountInfo(id){
        let that = this, config, reqUrl;
        reqUrl = that.activeName == 'foreEnd'? '/role/deleteRole' : '/mrole/deleteMRole';
        config = {
          method: 'post',
          url: that.HOST + reqUrl,
          data: {
            "compId":that.COMPID,
            "roleId":id
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
      setData(id){
        if(this.activeName == 'foreEnd'){
          this.dialogRelationVisible = true;
          this.relationData = {
            title: '权限授予',
            id
          };
        }else{
          this.dialogPowerVisible = true;
          this.powerData = {
            title: '后端权限授予',
            id
          }
        }
      },
      closeRelation(){
        this.dialogRelationVisible = false;
        this.relationData = {
          title: '',
          id: '',
        };
      },
      closePower(){
        this.dialogPowerVisible = false;
        this.powerData = {
          title: '',
          id: '',
        };
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
