<template>
  <div class="container">
    <div class="row video-add">
      <div class="g-flex">
        <span><i class="red_heart">*</i>名字：</span>
        <el-input type="text" placeholder="请输入名字" v-model="mailData.name" :disabled="readyOnly"></el-input>
      </div>
      <div class="g-flex">
        <span>昵称：</span>
        <el-input type="text" placeholder="请输入昵称" v-model="mailData.nick" :disabled="readyOnly"></el-input>
      </div>
      <div class="g-flex">
        <span>邮箱：</span>
        <el-input type="text" placeholder="请输入邮箱" v-model="mailData.email" :disabled="readyOnly"></el-input>
      </div>
      <div class="g-flex">
        <span>手机号：</span>
        <el-input type="text" placeholder="请输入手机号" v-model="mailData.mobile" :disabled="readyOnly"></el-input>
      </div>
      <div class="g-flex">
        <span>性别：</span>
        <el-radio-group v-model="sex" :disabled="readyOnly">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>企业名称：</span>
        <el-select v-model="selectCompId" placeholder="请选择企业名称" :disabled = "mailList.op != 'add'? true: false">
          <el-option v-for="(item,index) in compList" :key="index" :label="item.compName" :value="item.compId"></el-option>
        </el-select>
      </div>
      <div class="g-flex">
        <span>部门名称：</span>
        <el-input type="text" placeholder="请输入部门名称" v-model="mailData.departName" :disabled="readyOnly"></el-input>
      </div>
      <div class="g-flex" v-show="readyOnly">
        <span>图片：</span>
        <img :src="mailData.photo" style="width:170px;height:170px;">
      </div>
      <div class="g-flex" v-show="!readyOnly">
        <span><i class="red_heart">*</i>图片：</span>
        <el-upload class="uppload-wrap"
                   :action="HOST+'/FileUpload/uploadFile'"
                   :on-remove="handleRemove"
                   :file-list="fileList"
                   list-type="picture"
                   :on-success="uploadSuccess"
                   :before-upload="beforeAvatarUpload">
          <el-button size="small" type="primary" :disabled="canUpload">选择文件</el-button>
        </el-upload>
      </div>
      <div class="g-flex">
        <span>职位：</span>
        <el-input type="text" placeholder="请输入职位" v-model="mailData.position" :disabled="readyOnly"></el-input>
      </div>
      <div class="g-flex" v-show="!readyOnly">
        <el-button type="info" @click="confirm" >确定</el-button>
        <el-button @click="close(true)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["mailList", "compList"],
    data () {
      return {
        fileList: [],
        mailData: {},
        dialogCameraDetailVisible: false,
        canUpload: false,
        webIframeSrc:"",
        webVideo:{},
        sex: 1,
        readyOnly:false,
        selectCompId: ''
      }
    },
    watch: {
      fileList(val, oldVal){
        this.canUpload = val.length === 1;
      },
      'mailList.op'(val, oldVal) {
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
        const that = this;
        if (that.mailList.op!='add') {
            that.mailData = that.mailList.data;
            let imgUrl = that.mailData.photo;
            that.fileList = imgUrl ? [{url: that.mailData.photo}] : [];
            that.sex = that.mailData.sex;
            that.selectCompId = that.mailData.compId
            that.readyOnly = that.mailList.op === "detail" ? true: false;
        } else {
          that.emptyData();
          if(that.compList && that.compList.length){
            that.selectCompId = that.compList[0].compId;
          }
        }
      },
      handleRemove(){
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
      },
      confirm(){
        let that = this, config, reqUrl, data;
    
        let regEmail =  /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
        if(that.mailData.email && !regEmail.test(that.mailData.email)){
          that.infoNotice('error', '邮箱格式不正确，请重新输入！'); return;
        }
        let regMobile = /^((13)|(14)|(15)|(18))[\d]{9}$/; 
        if(that.mailData.mobile && !regMobile.test(that.mailData.mobile)){
          that.infoNotice('error', '手机号格式不正确，请重新输入'); return;
        }
        if(!that.fileList.length){
          that.infoNotice('error', '请添加图片'); return;
        }
        if(that.mailList.op === 'add'){
          data = {
            "compId": that.selectCompId,
            "name": that.mailData.name,
            "nick": that.mailData.nick,
            "email": that.mailData.email,
            "mobile": that.mailData.mobile,
            "sex": that.sex,
            "departName": that.mailData.departName,
            "position": that.mailData.position,
            "photo": that.fileList.length ? that.fileList[0].url:""
          }
        }else {
          data = {
            "compId": that.selectCompId,
            "mailListId": that.mailData.id,
            "newName": that.mailData.name,
            "newNick": that.mailData.nick,
            "newEmail": that.mailData.email,
            "newMobile": that.mailData.mobile,
            "newSex": that.sex,
            "newDepartName": that.mailData.departName,
            "newPosition": that.mailData.position,
            "newPhoto": that.fileList.length ? that.fileList[0].url:""
          }
        }
        reqUrl = that.mailList.op=='add'? '/mailList/addMailList' : '/mailList/updateMailList';
        config = {
          method: 'post',
          url: that.HOST + reqUrl,
          data
        }
        that.axios(config).then(function (res) {
          if (res.data.code) {
            that.close(true);
          } else {
            that.infoNotice('error', res.data.msg);
          }
        }).catch(function (error) {
          console.log(error);
        });
      },
      close(refresh){
        this.emptyData();
        this.$emit('mailStatus', refresh)
      },
      emptyData(){
        this.fileList = [];
        this.mailData = {};
        this.sex = 1;
        this.readyOnly = false;
      },
      infoNotice(type, msg){
        this.$message({
          type: type,
          message: msg,
          duration: 1500
        });
      }
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .addMail-wrap{
    @include dialogwidth;
    
    @include upload;
  }

</style>
