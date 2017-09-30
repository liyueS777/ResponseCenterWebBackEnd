<template>
  <div class="container">
    <div class="g-flex">
      <span><i class="red_heart">*</i>图标名称：</span>
      <el-input :title="title" v-model="title" placeholder="请输入名称" :disabled="!isType0"></el-input>
    </div>
    <div class="g-flex" v-show="chartData.data && !chartData.data.isPre">
      <span><i class="red_heart">*</i>图表类型：</span>
      <el-select v-model="value" placeholder="请选择" :disabled="!chartData.data.isPre ? true :false">
          <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
    </div>
    <div class="g-flex">
      <span><i class="red_heart">*</i>企业名称：</span>
      <el-select v-model="selectCompId" placeholder="请选择企业名称" :disabled = "chartData.op == 'edit'?true: false">
        <el-option v-for="(item,index) in compList" :key="index" :label="item.compName" :value="item.compId"></el-option>
      </el-select>
    </div>
    <div class="g-flex">
      <span>图形地址(Url)：</span>
      <el-input :title="chartUrl" v-model="chartUrl" placeholder="请输入链接地址" :disabled="!isType0"></el-input>
    </div>
    <div class="g-flex">
      <span><i class="red_heart">*</i>缩略图：</span>
      <el-upload class="upload-wrap"
          :action="HOST+'/FileUpload/uploadFile'"
          :on-remove="handleRemove"
          :file-list="fileList"
          list-type="picture"
          :on-success="uploadSuccess"
          :before-upload="beforeAvatarUpload">
          <el-button size="small" type="primary" :disabled="canUpload">点击上传</el-button>
        </el-upload>
    </div>
    <div class="g-flex">
       <el-button type="info" @click="confirm">确定</el-button>
        <el-button :plain="true" type="info" @click="close(false)">取消</el-button>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['chartData', 'compList'],
    data () {
      return {
        fileList: [],
        canUpload: false,
        isType0: false,
        title: '',
        chartUrl: '',
        options: [{
          value: '1',
          label: '折线图'
        }, {
          value: '2',
          label: '柱状图'
        }, {
          value: '3',
          label: '饼图'
        },{
          value: '4',
          label: '预定义图'
        }],
        value: '4',
        selectCompId: ''
      };
    },
    watch: {
      fileList(val, oldVal){
        if(val){
          this.canUpload = val.length === 1;
        }
      },
      'chartData.op'(val, oldVal) {
        if(val){
          this.initData();
        }
      }
    },
    mounted(){
      this.initData();
    },
    methods: {
      handleRemove(file, fileList){
        this.fileList = [];
        if(this.isUploadImg(this.chartUrl)){
          this.chartUrl = '';
        }
      },
      uploadSuccess(res, file, fileList){
        this.fileList = [{url: res.data}]
      },
      beforeAvatarUpload(file) {
        const isImg = file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png' || file.type === 'image/gif';
        const isLt2KB = file.size /1024 < 200;
        if (!isImg) {
          this.$message.error('上传头像图片只能是 jpeg/jpg/png/gif 格式!');
        }
        if (!isLt2KB) {
          this.$message.error('上传头像图片大小不能超过 200KB!');
        }
        return isImg && isLt2KB;
      },
      isUploadImg(url){
        if(url.indexOf('.jpg')>-1 || url.indexOf('.JPG')>-1 || url.indexOf('.JPEG')>-1 || url.indexOf('.jpeg')>-1 || url.indexOf('.png')>-1 || url.indexOf('.PNG')>-1 || url.indexOf('.GIF')>-1 ||url.indexOf('.gif')>-1){
          return true;
        }else{
          return false;
        }
      },
      initData(){
        if (this.chartData.op == 'edit') {
          let ChartData = this.chartData.data;
          this.isType0 = ChartData.isPre !== 0;
          this.fileList = [{url: ChartData.imageUrl}];
          this.chartUrl = ChartData.chartUrl;
          this.title = ChartData.title;
          this.value = ChartData.chartType+'';
          this.selectCompId  = ChartData.compId;
        }else {
          this.emptyData();
          if(this.compList && this.compList.length){
            this.selectCompId = this.compList[0].compId;
          }
        }
      },
      confirm(){
        let that = this, ajaxData, config;
        if(that.fileList && !that.fileList.length){
          that.$message({
            type: 'error',
            message: '请上传缩略图',
            duration: 1500
          });
          return;
        }
        if(that.chartData.op ==="add"){
          config = {
            method: 'post',
            url: that.HOST + '/Chart/addChart',
            data: {
              "compId": that.selectCompId,
              "title":that.title,
              "imageUrl":that.fileList[0].url,
              "chartUrl":that.chartUrl?that.chartUrl:that.fileList[0].url,
              "isPre":1
            },
          };
        }else {
          if(that.chartData.data.isPre === 0){
            ajaxData = {
              "compId": that.selectCompId,
              "chartId": that.chartData.data.id,
              "newImageUrl": that.fileList && that.fileList.length && that.fileList[0].url,
              "isPre": 0
            }
          }else {
            ajaxData = {
              "compId": that.selectCompId,
              "chartId": that.chartData.data.id,
              "newTitle": that.title,
              "newChartUrl":that.chartUrl? that.chartUrl : that.fileList && that.fileList.length && that.fileList[0].url,
              "newImageUrl": that.fileList && that.fileList.length && that.fileList[0].url,
              "isPre": 1
            };
          }
          config = {
            method: 'post',
            url: that.HOST + '/Chart/updateChart',
            data: ajaxData,
          };
        }
        that.axios(config).then(function (res) {
          if (res.data.code) {
            that.close(false);
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
      },
      close(refresh){
        this.$emit('chartStatus', refresh)
      },
      emptyData(){
        this.isType0 = true;
        this.fileList = [];
        this.title = "";
        this.chartUrl = "";
        this.value = '4';
      }
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .addChart-wrap{
    @include dialogwidth;
    @include upload;
  }
</style>
