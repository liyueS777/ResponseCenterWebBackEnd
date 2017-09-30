<template>
  <div v-loading.body="loading" element-loading-text="拼命加载中" style="height:100%;" class="system-list-wrap">
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
            <el-input
              placeholder="请输入变量名"
              v-model="systemName">
            </el-input>
            <el-input
              placeholder="请输入变量值"
              v-model="systemValue">
            </el-input>
            <el-button slot="append" icon="search" @click="getDataList()">查找</el-button>
          </div>
        </div>
        <div class="m-body">
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
              label="变量名"
              show-overflow-tooltip width="250">
              <template scope="scope">
                <span>{{scope.row.configKey}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="变量值"
              show-overflow-tooltip>
              <template scope="scope">{{scope.row.configValue}}</template>
            </el-table-column>
            <el-table-column label="操作" width="80">
              <template scope="scope">
                <el-button
                  size="small"
                  @click="editData(scope.row)">编辑
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
      <el-dialog :title="viewData.title" :visible.sync="dialogEditViewVisible" size="small" top="3%" @close="closeView(true)">
        <editView :viewData="viewData" @viewStatus="closeView"></editView>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
  import editView from "./edit-add/editSystemView.vue";
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
        systemName:'',
        systemValue:'',
        multipleSelection: [],
        dialogEditViewVisible:false,
        viewData: {
          title: '修改配置',
          data: {},
          op:''
        },
        loading:false,
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.input = '';
          this.tableData = {};
          this.getDataList();
        }
      }
    },
    mounted(){
      this.$nextTick(function () {
       this.getDataList();
      })
    },
    methods: {
      getDataList(pageIndex, input){
        const that = this;
        if (!pageIndex) {
          this.$refs.paginations.internalCurrentPage = 1;
        }
        let reqData = {
          "pageIndex": pageIndex ? pageIndex : 1,
          "pageSize": that.pageSize,
          "key": that.systemName,
          "value": that.systemValue,
        };
        that.axios.post('/systemConfig/queryPageSystemConfig', reqData).then(function (res) {
            if(res.data.code){
              that.tableData = res.data.data;
            }else {
              that.tableData = {};
              that.$message({
                type: 'info',
                message: res.data.msg,
                duration: 1500
              });
            }

        }).catch(function (error) {
          console.log(error);
        });
      },
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      editData(obj){
        this.viewData = {
          title: obj ? '修改配置' : '新增配置',
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
    }
  }
</script>
<style lang="scss" scoped>
.system-list-wrap{
  .m-input-group {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    .input-group {
      display: flex;
      flex-flow: row nowrap;
      .el-input{
        width: 206px;
      }
    }
  }
}
    
</style>
