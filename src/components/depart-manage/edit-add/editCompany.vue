<template>
  <div class="container">
    <div class="row video-add">
      <div class="g-flex">
        <span><i class="red_heart">*</i>企业名称：</span>
        <el-input type="text" v-model="viewData.data.compName" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>企业编码：</span>
        <el-input type="text" v-model="viewData.data.compCode" :disabled="viewData.op=='edit'?true: false"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>图片：</span>
        <el-upload
          class="upload-wrap"
          :action="HOST+'/FileUpload/uploadFile'"
          :on-remove="handleRemove"
          :file-list="fileList"
          list-type="picture"
          :on-success="uploadSuccess"
          :before-upload="beforeAvatarUpload">
          <el-button size="small" type="primary" :disabled="uploadDisabled">点击上传</el-button>
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
        fileList:[],
        readyOnly:false,
        uploadDisabled: false,
        disabled: false
      }
    },
    watch: {
      fileList(val, oldVal){
        if(val){
          this.uploadDisabled = val.length === 1;
        }
      },
      'viewData.op'(val, oldVal) {
        if(val){
          this.initData();
        }
      },
    },
    mounted(){
      this.initData();
    },
    methods: {
      initData(){
        const that = this;
        if (that.viewData.op == 'edit') {
          let imgUrl = that.viewData.data.imageUrl
          this.fileList = imgUrl ? [{url: imgUrl}] : [];
        } else {
          that.disabled = false;
          that.emptyData();
        }
      },
      emptyData(){
        this.fileList = [];
        this.viewData.data.compName = '';
        this.viewData.data.compCode = '';
      },
      confirm(){
        let that = this, config;
        if(!that.viewData.data.compName){
          that.$message({
              type: 'error',
              message: '请输入企业名称！',
              duration: 1500
            });
            return;
        }
        if(!that.viewData.data.compCode){
          that.$message({
              type: 'error',
              message: '请输入企业编码！',
              duration: 1500
            });
            return;
        }
        if(that.fileList && !that.fileList.length){
            that.$message({
              type: 'error',
              message: '请上传图片！',
              duration: 1500
            });
            return;
          }
        if(that.viewData.op==='add'){
          config = {
            url: '/company/addCompany',
            data: {
              "parentCompId": that.COMPID,
              "compCode": that.viewData.data.compCode,
              "compName": that.viewData.data.compName,
              "imageUrl": that.fileList && that.fileList[0] && that.fileList[0].url || ''
            }
          };
        }else if(that.viewData.op==='edit'){
          config = {
            url: '/company/updateCompanyImage',
            data: {
              "compId": that.viewData.data.compId,
              "newImageUrl": that.fileList && that.fileList[0] && that.fileList[0].url || ''
            }
          };
        }
        that.axios(config).then(function (res) {
          if (res.data.code) {
            if(that.viewData.op==='add'){
              that.close(false);
            }else{
              config = {
                url: '/company/updateCompany',
                data: {
                  "compId": that.viewData.data.compId,
                  "newCompCode": that.viewData.data.compCode,
                  "newCompName": that.viewData.data.compName,
                  "newImageUrl": that.fileList && that.fileList[0] && that.fileList[0].url || ''
                }
              };
              that.axios(config).then(function (res) {
                if(res.data.code){
                  that.close(false);
                }else{
                  that.$message({
                    type: 'error',
                    message: res.data.msg,
                    duration: 1500
                  });
                }
              })
            }
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
        this.$emit('viewStatus', refresh);
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
  .editcompany-wrap{
    @include dialogwidth(450px, 450px);
    
    @include upload;
  }
</style>
