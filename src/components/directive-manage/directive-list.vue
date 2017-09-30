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
            <el-input placeholder="请输入指令名称" v-model="input" style="width: 400px;">
              <el-button slot="append" icon="search" @click="getDataList()">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="editData()"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <el-table
            ref="multipleTable"
            :data="tableData.list"
            border
            tooltip-effect="dark"
            style="width: 100%"
            @selection-change="handleSelectionChange"
          >
            <el-table-column
              type="selection"
              width="55">
            </el-table-column>
            <el-table-column
              label="指令名称"
              show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="服务地址"
              show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.serverUrl}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="创建时间"
              show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template scope="scope">
                <el-button
                  size="small"
                  @click="editData(scope.row)">编辑
                </el-button>
                <el-button
                  size="small"
                  @click="deleteDirective(scope.row.id)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination
                @size-change="getDataList"
                @current-change="getDataList"
                :page-size="pageSize"
                layout="total, prev, pager, next"
                :total="tableData.totalCount"
                ref="paginations"
              >
              </el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <el-dialog class="editdirective-wrap" :title="viewData.title" :visible.sync="dialogEditViewVisible" size="small" top="3%" @close="closeView(true)">
        <editView :viewData="viewData" @viewStatus="closeView"></editView>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import editView from "./edit-add/editDirectiveView.vue";
  export default {
    props: ["breadcrumb"],
    components:{
      editView,
    },
    data () {
      return {
        input: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogEditViewVisible:false,
        viewData: {
          title: '修改指令',
          data: {},
          op: ''
        },
        loading:false,
        stopRequest: false
      }
    },
    watch: {
      'breadcrumb'(val, oldVal){
        if(val) {
          this.input = '';
          this.emptyData();
        }
      }
    },
    mounted(){
      this.$nextTick(function () {
       this.getDataList();
      })
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
        let reqData = {
          "compId": that.COMPID,
          "pageIndex": pageIndex ? pageIndex : 1,
          "pageSize": that.pageSize,
          "name": that.input
        }
        that.axios.post('/directive/queryPageDirective', reqData).then(function (res) {
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
          title: obj ? '修改指令' : '新增指令',
          data: obj || {},
        }
        this.viewData.op = obj && obj.id ? 'edit': 'add';
        this.dialogEditViewVisible = true;
      },
      closeView(refresh){
        this.dialogEditViewVisible = false;
        this.viewData = {
          title: '修改指令',
          data: {},
          op: ''
        }
        refresh && this.getDataList(this.$refs.paginations.internalCurrentPage);
      },
      deleteDirective(id){
        this.$confirm('确定要删除当前指令吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteDirectiveInfo(id);
        }, ()=>{});
      },
      /**
       * 删除指令
       */
      deleteDirectiveInfo(id){
        let that = this,
            reqData = {
              "id":id
            };
        that.loading = true;
        that.axios.post('/directive/deleteDirective', reqData).then(function (res) {
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
      }
    }
  }
</script>
