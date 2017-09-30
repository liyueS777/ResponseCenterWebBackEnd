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
        <div class="m-body">
          <el-table
            ref="multipleTable"
            :data="tableData.list"
            border
            tooltip-effect="dark"
            style="width: 100%"
          >
            <el-table-column
              label="模板"
              show-overflow-tooltip>
              <template scope="scope" >
                <span>{{scope.row.templateType}}</span>
              </template>
            </el-table-column>
            <el-table-column
              label="下载"
              show-overflow-tooltip>
              <template scope="scope" >
                <el-button
                  size="small"
                  @click="download(scope.row)">下载
                </el-button>
              </template>
            </el-table-column>
            
            <el-table-column label="上传">
              <template scope="scope">
                <el-upload 
                  :action= "HOST+ `${scope.row.uploadUrl}`"
                  :on-remove="handleRemove"
                  :file-list="getFileList"
                  ref="upload"
                  :on-success="uploadSuccess"
                  :before-upload="beforeFileUpload">
                  <el-button size="small" type="primary" :disabled="canUpload" @click="getCurType(scope.row.type, scope.row.idx)">点击上传</el-button>
                </el-upload>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
 
  export default {
    props: ["breadcrumb"],
    components:{
    },
    data () {
      return {
        comFileList: [],
        departFileList: [],
        userFileList: [],
        mailFileList: [],
        canUpload: false,
        curType: '',
        tableData: {
          list: [{
            idx: 0,
            type: 'com',
            templateType: '企业模板',
            downUrl: HOST + '/file/company.xlsx',
            uploadUrl: '/excel/importCompanyExcel'
          },{
            idx: 1,
            type: 'depart',
            templateType: '部门模板',
            downUrl: HOST + '/file/depart.xlsx',
            uploadUrl: '/excel/importDepartExcel'
          },{
            idx: 2,
            type: 'user',
            templateType: '用户模板',
            downUrl: HOST +'/file/user.xlsx',
            uploadUrl: '/excel/importUserExcel'
          },{
            idx: 3,
            type: 'mail',
            templateType: '通讯屏模板',
            downUrl: HOST + '/file/maillist.xlsx',
            uploadUrl: '/excel/importMailListExcel'
          }]
        },
        loading:false,
      }
    },
    computed:{
      getFileList(){
        this.getUploadList()
      }
    },
    watch: {
      fileList(val, oldVal){
        this.canUpload = val.length === 1;
      },
    },
    methods: {
      handleRemove(file, fileList){
        // var fileList = this.getUploadList();
        // fileList = [];
      },
      uploadSuccess(res, file, fileList){
        if(res.code == 0) {
          console.log('上传失败！');
          this.$message.error(res.msg);
          $('.el-upload-list--text').eq(this.index).children(':last').remove();
          return;
        }
      },
      getUploadList(){
        const listData = {
          'com': this.comFileList,
          'depart': this.departFileList,
          'user': this.userFileList,
          'mail': this.mailFileList
        }
        return listData[this.curType];
      },
      getCurType(type, idx){
        if(type==undefined) return;
        this.curType = type;
        this.index = idx;
      },
      beforeFileUpload(file) {
        const isSheet= file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        if (!isSheet) {
          this.$message.error('上传格式只能是xlsx格式!');
        }
      },
      download(row){
        window.location.href = row.downUrl;
      }
    }
  }
</script>
<style lang="scss" scoped>
  .el-dialog__wrapper{
    overflow-x: hidden;
  }
  .g-head {
    position: relative;
    .title-icon {
      position: absolute;
      left:20px;
      top:5px;
      line-height: 36px;
      color:#bfcbd9;
      font-size: 20px;
    }
    border-top: 1px solid transparent;
    background-color: #fff;
    h2 {
      font-weight: 500;
      margin:5px 0;
      text-align: center;
      line-height: 36px;
      color: #484A4B;
    }
    .el-breadcrumb {
      background-color: #F4F5F6;
      line-height: 36px;
      padding:0 20px;
      .el-icon-share{
        float: left;
        color: #ABAFB8;
        line-height:31px;
        font-size: 13px;
        margin-right: 10px;
      }
      .el-breadcrumb__item__inner {
        color: #3AA7F3;
        cursor: text;
      }
      .el-breadcrumb__item:last-child .el-breadcrumb__item__inner {
        color: #444F55;
      }
    }
  }

  .g-body {
    padding: 0 20px;
    .m-input-group {
      display: flex;
      flex-flow: row nowrap;
      justify-content: space-between;
      .input-group {
        width: 500px;
      }
      background-color: #fff;
      padding: 10px;
    }
  }

  .g-footer,.m-buttons {
    display: flex;
    flex-flow: row nowrap;
  }
  .g-footer{
    justify-content: flex-end;
  }
  .m-buttons{
    margin: 5px 0 15px;
    justify-content: flex-start;
    .el-button--default {
      color: #76838F;
    }
  }
  .m-body{
    background-color: #fff;
    margin-top: 10px;
    padding: 10px;
  }

</style>
