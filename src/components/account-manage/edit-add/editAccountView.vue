<template>
  <div class="container">
    <div class="row video-add" v-loading.body="loading">
      <div class="g-flex">
        <span><i class="red_heart">*</i>用户账号：</span>
        <el-input type="text" placeholder="用户账号" v-model="accountData.username"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>用户密码：</span>
        <el-input type="password" placeholder="用户密码" v-model="accountData.password"></el-input>
      </div>
      <div class="g-flex">
        <span>用户名称：</span>
        <el-input type="text" placeholder="用户名称" v-model="accountData.name"></el-input>
      </div>
      <div class="g-flex">
        <span>性别：</span>
        <el-radio-group v-model="sex" :disabled="readyOnly">
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>头像图片：</span>
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
        <el-button type="info" @click="confirm" >确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData", "activeName"],
    data () {
      return {
        accountData: {},
        fileList:[],
        readyOnly:false,
        canUpload: false,
        loading: false,
        sex: 1
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
          this.accountData = this.viewData.data;
          this.sex = this.accountData.sex;
          let imgUrl = this.accountData.imageUrl;
          this.fileList = imgUrl ? [{url: imgUrl}] : [];
        } else {
          this.emptyData();
        }
      },
      confirm(){
        let that = this, config, regPsw = /^(\w){6,20}$/;
        if(!that.accountData.username){
          that.infoNotice('error', '请输入账号名称！'); return;
        }
        if(!that.accountData.password){
          that.infoNotice('error', '请输入密码！'); return;
        }
        if(!regPsw.test(that.accountData.password)){
          that.infoNotice('error', '密码格式不正确!'); return;
        }
        if(that.fileList && !that.fileList.length){
          that.infoNotice('error', '请输入头像!'); return;
        }
        if(that.viewData.op == 'edit'){
          config = {
            method: 'post',
            url: that.HOST + '/manager/updateManager',
            data: {
              "compId": that.viewData.data.compId || '',
              "managerId": that.accountData.id,
              "newUserName":that.accountData.username,
              "newPassword":that.accountData.password,
              "newSex":that.sex,
              "newName":that.accountData.name,
              "newImageUrl":that.fileList.length ? that.fileList[0].url:"",
            }
          };
        }else {
          config = {
            method: 'post',
            url: that.HOST + '/manager/addManager',
            data: {
              "compId": that.$store.state.userInfo.compId, //不为空，为企业管理员新增账号
              "username":that.accountData.username,
              "password":that.accountData.password,
              "sex":that.sex,
              "name":that.accountData.name,
              "imageUrl":that.fileList && that.fileList.length ? that.fileList[0].url:"",
            }
          };
          config.data.isCustomer = this.activeName == 'company' ? 0 : 1
        }
        that.loading = true;
        that.axios(config).then(function (res) {
            that.loading = false;
            if (res.data.code) {
              that.close(false);
            } else {
              that.infoNotice('error', res.data.msg);
            }
          }).catch(function (error) {
            that.loading = false;
            console.log(error);
          });
      },
      close(refresh){
        this.$emit('viewStatus', refresh);
      },
      emptyData(){
        // this.accountData = {};
        this.sex = 1;
        this.fileList = [];
        this.accountData.username = '';
        this.accountData.password = '';
        this.accountData.name = '';
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
          this.infoNotice('error', '上传头像图片只能是 jpeg/jpg/png/gif 格式!');
        }
        if (!isLt2KB) {
          this.infoNotice('error', '上传头像图片大小不能超过 200KB!');
        }
        return isImg && isLt2KB;
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
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .editaccount-wrap{
    @include dialogwidth(500px, 500px);
    
    @include upload;
  }

</style>
