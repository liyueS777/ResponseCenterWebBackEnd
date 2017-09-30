<template>
  <div class="container">
    <div class="row video-add" v-loading.body="loading">
      <div class="g-flex">
        <span><i class="red_heart">*</i>指令名称：</span>
        <el-input type="text" placeholder="请输入指令名称" v-model="directiveData.name"></el-input>
      </div>
      <div class="g-flex">
         <span>指令类别：</span>
         <el-select v-model="identification" placeholder="请选择">
            <el-option
              v-for="item in idenList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
      </div>
      <div class="g-flex">
        <span>服务地址：</span>
        <el-input type="text" placeholder="请输入服务地址" v-model="directiveData.serverUrl"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>指令图标：</span>
        <el-upload class="upload-wrap"
                   :action="HOST+'/FileUpload/uploadFile'"
                   :on-remove="handleRemove"
                   :file-list="fileList"
                   list-type="picture"
                   :on-success="uploadSuccess"
                   :before-upload="beforeAvatarUpload">
          <el-button size="small" type="primary" :disabled="canUpload">选择文件</el-button>
        </el-upload>
      </div>
      <div class="g-flex" v-show="!readyOnly">
        <el-button type="info" @click="confirm">确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData"],
    data () {
      return {
        directiveData: {},
        fileList:[],
        idenList: [{
          value: 'message',
          label: '消息'
        }, {
          value: 'frequency',
          label: '音频'
        }, {
          value: 'video',
          label: '视频'
        }],
        readyOnly:false,
        canUpload: false,
        loading: false,
        identification: 'message'
      }
    },
    watch: {
      fileList(val, oldVal){
        this.canUpload = val.length === 1;
      },
      'viewData.op'(val, oldVal) {
        if(val){
          this.initData();
        }
      }
    },
    mounted(){
      this.initData();
    },
    methods: {
      initData(){
        if (this.viewData.op=='edit') {
          this.directiveData = this.viewData.data;
          this.identification = this.directiveData.identification;
          let imgUrl = this.directiveData.imageUrl;
          this.fileList = imgUrl ? [{url: imgUrl}] : [];
        } else {
          this.emptyData();
        }
      },
      confirm(){
        const that = this;
        if(!that.directiveData.name){
          that.$message({
            type: 'error',
            message: '请输入指令名称',
            duration: 1500
          });
          return;
        }
        if(that.fileList && !that.fileList.length){
          that.$message({
            type: 'error',
            message: '请添加指令图标',
            duration: 1500
          });
          return;
        }
        let config = {
            data: {
              "compId": that.COMPID,
              "name": that.directiveData.name,
              "imageUrl": that.fileList && that.fileList[0] && that.fileList[0].url,
              "serverUrl": that.directiveData.serverUrl,
              "identification":that.identification
            }
        };
        if(that.viewData.op == 'edit'){
          config.data.id = that.directiveData.id;
          config.url = '/directive/updateDirective';
        }else {
          config.url = '/directive/addDirective';
        }
        that.loading = true;
        that.axios(config).then(function (res) {
            that.loading = false;
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
            that.loading = false;
            console.log(error);
          });
      },
      close(refresh){
        this.emptyData();
        this.$emit('viewStatus', refresh);
      },
      emptyData(){
        this.fileList = [];
        this.directiveData = {};
        this.identification = 'message';
        this.loading = false;
      },
      handleRemove(file, fileList){
        this.fileList = [];
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
      }
    }


  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .editdirective-wrap{
    @include dialogwidth(550px, 550px);
    
    @include upload;
  }
</style>
