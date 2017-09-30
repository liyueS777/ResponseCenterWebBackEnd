<template>
  <div>
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
        <div class="m-input-group" v-if="$route.path==='/chartPage'">
          <div class="input-group">
            <el-select v-model="selectCompId" placeholder="选择企业" filterable clearable slot="prepend" style="width: 200px;">
              <el-option v-for="item in compList" :key="item.compName" :label="item.compName" :value="item.compId"></el-option>
            </el-select>
            <el-input placeholder="请输入图表名称" v-model="input" style="width: 400px;">
              <el-select v-model="selectValue" filterable clearable slot="prepend" placeholder="请选择类型" @change="getDataList(1)">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
              <el-button slot="append" icon="search" @click="getDataList(1)">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-input-group" v-if="$route.path!=='/chartPage'">
          <div class="input-group">
            <el-select v-model="selectCompId" placeholder="选择企业" filterable clearable slot="prepend" style="width: 200px;">
              <el-option v-for="item in compList" :key="item.compName" :label="item.compName" :value="item.compId"></el-option>
            </el-select>
            <el-input :placeholder="$route.path==='/cameraPage'?'请输入视频名称':'请输入名称'" v-model="input" style="width: 400px;">
              <el-button slot="append" icon="search" @click="getDataList(1)">查找</el-button>
            </el-input>
          </div>
        </div>
        <div class="m-body">
          <div class="m-buttons">
            <el-button type="info" @click="editData"><i class="el-icon-plus"></i> 新增</el-button>
          </div>
          <!--图形列表-->
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%"
               @selection-change="handleSelectionChange" v-show="$route.path === '/chartPage'">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column :label="'图表名称'" show-overflow-tooltip>
              <template scope="scope" >
                <span @click="showDetail(scope.row)" class="z-name">{{scope.row.title}}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型">
              <template scope="scope">
                {{scope.row.chartType == '1' ? '折线图' : scope.row.chartType == '2' ? '柱状图' : scope.row.chartType == '3' ? '饼图' : '预定图'}}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template scope="scope">
                <el-button size="small" @click="editData(scope.$index)">编辑</el-button>
                <el-button size="small" @click="deleteSelect(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--视频列表-->
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%"
               @selection-change="handleSelectionChange" v-show="$route.path ==='/cameraPage'">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column :label="'视频名称'" show-overflow-tooltip>
              <template scope="scope" >
                <span @click="showDetail(scope.row)" class="z-name">{{scope.row.name}}</span>
              </template>
            </el-table-column>
            <el-table-column label="位置" show-overflow-tooltip>
              <template scope="scope">
                {{scope.row.position}}
              </template>
            </el-table-column>
            <el-table-column label="创建时间" show-overflow-tooltip>
              <template scope="scope">{{scope.row.createTime}}</template>
            </el-table-column>
            <el-table-column label="操作" width="150">
              <template scope="scope" >
                <el-button size="small" @click="editData(scope.$index)">编辑</el-button>
                <el-button size="small" @click="deleteSelect(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!--通讯屏-->
          <el-table ref="multipleTable" :data="tableData.list" border tooltip-effect="dark" style="width: 100%" 
              @selection-change="handleSelectionChange" v-show="$route.path==='/mailPage'">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column label="名称" width="120">
                <template scope="scope">
                  <span class="z-name" @click="showDetail(scope.row)">{{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column show-overflow-tooltip label="邮箱">
                <template scope="scope">{{ scope.row.email }}</template>
              </el-table-column>
              <el-table-column label="手机" width="130">
                <template scope="scope">{{ scope.row.mobile }}</template>
              </el-table-column>
              <el-table-column label="部门" width="120">
                <template scope="scope">{{ scope.row.departName }}</template>
              </el-table-column>
              <el-table-column label="职位">
                <template scope="scope">{{ scope.row.position}}</template>
              </el-table-column>
              <el-table-column label="创建时间" show-overflow-tooltip>
                <template scope="scope">{{scope.row.createTime}}</template>
              </el-table-column>
              <el-table-column label="操作" width="150">
              <template scope="scope">
                <el-button size="small" @click="editData(scope.$index)">编辑</el-button>
                <el-button size="small" @click="deleteSelect(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="g-footer">
            <div style="margin-top: 20px" v-show="tableData.totalCount">
              <el-pagination @size-change="getDataList" @current-change="getDataList" :page-size="pageSize" layout="total, prev, pager, next" :total="tableData.totalCount" ref="paginations">
              </el-pagination>
            </div>
          </div>
        </div>
      </el-col>
      <!--图形-->
      <el-dialog class="addChart-wrap" :title="chartData.title" :visible.sync="dialogChartVisible" size="small" top="3%" @close="closeChart(true)">
        <addChart :chartData='chartData' :compList="compList" @chartStatus="closeChart"></addChart>
      </el-dialog>
      <el-dialog title="" :visible.sync="dialogChartDetailVisible" size="small" top="3%" @close="closeDetail">
        <EchartDetail :chartId="chartId" @detailStatus="closeDetail"></EchartDetail>
      </el-dialog>
      <!--视频-->
      <el-dialog class="addCamera-wrap" :title="cameraData.title" :visible.sync="dialogCameraVisible" size="small" top="3%" @close="closeCamera(true)">
        <addCamera :Data="cameraData" :compList="compList" @cameraStatus="closeCamera"></addCamera>
      </el-dialog>
      <el-dialog :title="webVideo.name" :visible.sync="dialogCameraDetailVisible" top="3%" ref="videoDialog" @close="webVideo = {}">
        <webVideo :videoData="webVideo"></webVideo>
        <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="downLoadPlugin">获取浏览器插件</el-button>
        </span>
      </el-dialog>
      <!--通讯-->
      <el-dialog class="addMail-wrap" :title="mailList.title" :visible.sync="dialogmailListVisible" size="small" top="3%" @close="closeMail">
        <addMail :mailList="mailList" :compList="compList" @mailStatus="closeMail"></addMail>
      </el-dialog>
    </el-row>
  </div>
</template>
<script>
var reqTimer = null;
  import addChart from './edit-add/addChart.vue';
  import EchartDetail from './edit-add/echartDetail.vue';
  import addCamera from './edit-add/addCamera.vue';
  import webVideo from "./edit-add/webVideo.vue";
  import addMail from "./edit-add/addMail.vue";
  export default {
    props: ["breadcrumb"],
    components:{
        addChart,
        EchartDetail,
        addCamera,
        webVideo,
        addMail,
    },
    data () {
      return {
        input: "",
        pageSize: 10,
        tableData: {},
        multipleSelection: [],
        dialogChartVisible: false,
        dialogChartDetailVisible:false,
        dialogCameraVisible:false,
        dialogCameraDetailVisible:false,
        dialogmailListVisible:false,
        chartData:{
          title:'新增图形',
          data:{},
          op: ''
        },
        cameraData:{
          title:'',
          data:{},
          op: ''
        },
        chartId:'',
        webVideo:{},
        mailList:{
          title:'',
          data:{},
          op: ''
        },
        options: [
          {value: 5, label: '全部'},
          {value: 1,label: '折线图'}, 
          {value: 2,label: '柱状图'}, 
          {value: 3,label: '饼图'},
          {value: 4,label: '预定义'}
        ],
        selectValue: 5,
        stopRequest: false,
        selectCompId: '',
        compList: []
      }
    },
    watch: {
      '$route'(val, oldVal){
        if (val) {
          this.input = '';
          let oldCompId = this.selectCompId;
          this.selectCompId = this.compList[0].compId;
          this.emptyList();
          if(oldCompId == this.selectCompId){
            this.getDataList();
          } 
        }
      },
      'selectCompId'(val, oldVal){
        if(val){
          this.selectValue = 5;
          this.$refs.paginations.internalCurrentPage = 1;
          this.getDataList();
        }
      }
    },
    beforeMount(){
      this.getCompany();
    },
    methods: {
      getCompany(){
        let that =this,
         option = {
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
      getDataList(pageIndex){
        if(this.stopRequest) return;
        this.stopRequest = true;
        let that = this,  ajaxUrl;
        if (that.$route.path === '/chartPage') {
          ajaxUrl = that.HOST + '/Chart/queryPageChart';
        } else if (that.$route.path=== '/cameraPage') {
          ajaxUrl = that.HOST + '/camera/queryPageCamera';
        }else if(that.$route.path === '/mailPage'){
          ajaxUrl = that.HOST + '/mailList/queryPageMailList';
        }
        // debugger;
        let config = {
          method: 'post',
          url: ajaxUrl,
          data: {
            "compId": that.selectCompId,
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "title": that.input ? that.input : '',
          }
        };
        if(that.$route.path === '/mailPage'){
          config.data = {
            "compId": that.selectCompId,
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "name": that.input ? that.input : '',
          }
        }else if(that.$route.path === '/chartPage'){
          config.data = {
            "compId": that.selectCompId,
              "pageIndex": pageIndex ? pageIndex : 1,
              "pageSize": that.pageSize,
              "title": that.input ? that.input : '',
              "type" : that.selectValue && that.selectValue!==5 ? that.selectValue : "",
          }
        }else if(that.$route.path === '/cameraPage'){
          config.data =  {
            "compId": that.selectCompId,
            "pageIndex": pageIndex ? pageIndex : 1,
            "pageSize": that.pageSize,
            "title": that.input ? that.input : '',
          }
        }
        that.axios(config).then(function (res) {
          if(res.data.code){
            that.tableData = res.data.data;
          }else {
            that.emptyList();
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
            if (that.$route.path === '/chartPage') {
              tip = '是否要批量删除图形？';
            }
            else if (that.$route.path === '/cameraPage') {
              tip = '是否要批量删除视频？';
            }
            else if (that.$route.path === '/mailPage') {
              tip = '是否要批量删除通讯屏？';
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
          return;
        }
        else {
          if (that.$route.path === '/chartPage') {
            ajaxUrl = '/Chart/deleteChart';
            ajaxData = {
              "compId": that.selectCompId,
              "chartId": index
            };
            tip = '是否要删除图形？';
          }
          else if (that.$route.path === '/cameraPage') {
            ajaxUrl = '/camera/deleteCamera';
            ajaxData = {
              "compId": that.selectCompId,
              "cameraId": index
            };
            tip = '是否要删除视频？';
          }
          else if (that.$route.path === '/mailPage') {
            ajaxUrl = '/mailList/deleteMailList';
            ajaxData = {
              "compId": that.selectCompId,
              "mailListId": index
            };
            tip = '是否要删除通讯屏？';
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
              that.getDataList();
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
      editData(index){
        if(this.$route.path === '/chartPage'){
          if (typeof index === 'number') {
            this.chartData = {
              title: '编辑图形',
              data: this.tableData.list[index],
              op: 'edit'
            };
          }
          else {
            this.chartData = {
              title: '新增图形',
              data: {},
              op: 'add'
            };
          }
          this.dialogChartVisible = true;
        }else if(this.$route.path === '/cameraPage'){
          if (typeof index === 'number') {
            this.cameraData = {
              title: '编辑视频',
              data: this.tableData.list[index],
            };
          }
          else {
            this.cameraData = {
              title: '新增视频',
              data:{}
            };
          }
          this.cameraData.op = typeof index === 'number' ? 'edit': 'add'

            this.dialogCameraVisible = true;
        }else if(this.$route.path === '/mailPage'){
          if (typeof index === 'number') {
            this.mailList = {
              title: '编辑通讯屏',
              data: this.tableData.list[index],
              op: 'edit'
            };
          }
          else {
            this.mailList = {
              title: '新增通讯屏',
              data:{},
              op: 'add'
            };
          }
          this.dialogmailListVisible = true;
        }
      },
      showDetail(chart){
          if(this.$route.path === '/chartPage'){
            if(chart.isPre){
              this.chartId = chart;
            }else {
              this.chartId = chart.id;
            }
            this.dialogChartDetailVisible = true;
          }else if(this.$route.path=== '/cameraPage'){
            this.dialogCameraDetailVisible = true;
            this.showVideo(chart);
          }else if(this.$route.path === '/mailPage'){
            this.mailList = {
              title: '查看通讯屏',
              data: chart,
              op: 'detail'
            };
            this.dialogmailListVisible = true;
          }
      },
      closeChart(refresh){
        this.dialogChartVisible = false;
        this.chartData = {
          title: '新增图形',
          data:{},
          op: ''
        };
        refresh && this.getDataList();
      },
      closeCamera(refresh){
        this.dialogCameraVisible = false;
        this.cameraData = {
          title: '',
          data: {},
          op: ''
        };
        refresh && this.getDataList();
      },
      closeDetail(refresh){
        if(refresh){ //生成缩略图需要刷新数据
          this.getDataList(this.$refs.paginations.internalCurrentPage);
        }else{
          this.chartId = "";
          this.dialogChartDetailVisible = false;
        }
      },
      closeMail(refresh){
        this.dialogmailListVisible = false;
        refresh && this.getDataList();
        this.mailList = {
          title: '',
          data:{},
          op: ''
        };
      },
      showVideo(obj){
        const that = this;
        that.webVideo = obj;
        that.$nextTick(function () {
          that.$refs.videoDialog.$el.getElementsByClassName('el-dialog--small')[0].style.width = '840px';
          that.$refs.videoDialog.$el.getElementsByClassName('el-dialog__body')[0].style.paddingTop = '4px';
        });
      },
      downLoadPlugin(){
        let url ='http://'+ window.location.host +  window.location.pathname + 'static/webVideo/codebase/WebComponents.exe';
        window.location.href = url;
      },
      emptyList(){
        this.tableData = {};
        this.$refs.paginations.internalCurrentPage = 1;
      }
    }
  }
</script>
