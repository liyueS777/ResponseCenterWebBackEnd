<template>
  <div class="container">
    <div class="row video-add">
      <div class="g-flex">
        <span><i class="red_heart">*</i>视频监控标题：</span>
        <el-input type="text" placeholder="请输入视频监控标题" v-model="cameraData.name"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>企业名称：</span>
        <el-select v-model="selectCompId" placeholder="请选择企业名称" :disabled = "Data.op == 'edit'? true: false">
          <el-option v-for="(item,index) in compList" :key="index" :label="item.compName" :value="item.compId"></el-option>
        </el-select>
      </div>
      <div class="g-flex">
        <span>设备模式：</span>
        <el-input type="text" placeholder="请输入设备模式" v-model="cameraData.equipmentModle"></el-input>
      </div>
      <div class="g-flex">
        <span>服务器地址：</span>
        <el-input type="text" placeholder="请输入服务器地址" v-model="cameraData.serverUrl"></el-input>
      </div>
      <div class="g-flex">
        <span>服务器端口：</span>
        <el-input type="text" placeholder="请输入服务器端口" v-model="cameraData.serverPort"></el-input>
      </div>
      <div class="g-flex">
        <span>设备标识：</span>
        <el-input type="text" placeholder="请输入设备标识" v-model="cameraData.equipmentId"></el-input>
      </div>
      <div class="g-flex">
        <span>IP：</span>
        <el-input type="text" placeholder="请输入IP" v-model="cameraData.ip"></el-input>
      </div>
      <div class="g-flex">
        <span>图片：</span>
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
      <div class="g-flex">
        <span>端口：</span>
        <el-input type="text" placeholder="请输入端口" v-model="cameraData.port"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>用户名：</span>
        <el-input type="text" placeholder="请输入用户名" v-model="cameraData.userName"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>密码：</span>
        <el-input type="password" placeholder="请输入密码" v-model="cameraData.pwd"></el-input>
      </div>
      <div class="g-flex">
        <span>设备端口：</span>
        <el-input type="text" placeholder="请输入设备端口" v-model="cameraData.equipmentPort"></el-input>
      </div>
      <div class="g-flex">
        <span>设备地址：</span>
        <el-input type="text" placeholder="请输入设备地址" v-model="cameraData.position"></el-input>
      </div>
      <div class="g-flex">
        <el-button type="info" @click="confirm" >确定</el-button>
        <el-button type="info" @click="show" >预览(可选)</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
    <el-dialog :title="cameraData.name" :visible.sync="dialogCameraDetailVisible" size="small" top="3%" :modal="false" @close="webVideo = {}">
     <!-- <iframe class="webVideo" width="800" height="500"
              :src="webIframeSrc"
              frameborder="0" scrolling="no" ref="webVideo"></iframe>-->
      <webVideo :videoData="webVideo"></webVideo>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="downLoadPlugin">获取浏览器插件</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
  import webVideo from "./webVideo.vue";
  export default {
    props: ["Data", "compList"],
    components:{
      webVideo,
    },
    data () {
      return {
        fileList: [],
        cameraData: {},
        dialogCameraDetailVisible: false,
        canUpload: false,
        webIframeSrc:"",
        webVideo:{},
        selectCompId: ''
      }
    },
    watch: {
      fileList(val, oldVal){
        this.canUpload = val.length === 1;
      },
      'Data.op'(val, oldVal) {
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
        if (this.Data.op=='edit') {
          this.cameraData = this.Data.data;
          this.fileList =this.cameraData.imageUrl ?  [{url: this.cameraData.imageUrl}]: [];
          this.selectCompId = this.cameraData.compId;
        } else {
          this.emptyData();
          if(this.compList && this.compList.length){
            this.selectCompId = this.compList[0].compId;
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
          this.infoNotice('error', '上传头像图片只能是 jpeg/jpg/png/gif 格式!');
        }
        if (!isLt2KB) {
          this.infoNotice('error', '上传头像图片大小不能超过 200KB!');
        }
        return isImg && isLt2KB;
      },
      confirm(){
        let that = this, config, regPsw = /^(\w){6,20}$/;
        if(!that.cameraData.userName){
          that.infoNotice('error', '请输入用户名！'); return;
        }
        if(!that.cameraData.pwd){
          that.infoNotice('error', "请输入密码！");return;
        }
        if(!regPsw.test(that.cameraData.pwd)){
          that.infoNotice('error', "密码格式不正确！"); return;
        }
        if(that.Data.op === "add"){
          config = {
            method: 'post',
            url: that.HOST + '/camera/addCamera',
            data: {
              "compId": that.selectCompId,
              "title": that.cameraData.name,
              "equipmentModle": that.cameraData.equipmentModle,
              "serverUrl": that.cameraData.serverUrl,
              "serverPort": that.cameraData.serverPort,
              "equipmentId": that.cameraData.equipmentId,
              "ip": that.cameraData.ip,
              "port": that.cameraData.port,
              "userName": that.cameraData.userName,
              "pwd": that.cameraData.pwd,
              "equipmentPort": that.cameraData.equipmentPort,
              "position": that.cameraData.position,
              "imageUrl": that.fileList.length ? that.fileList[0].url:"",
            }
          };
        }else {
          config = {
            method: 'post',
            url: that.HOST + '/camera/updateCamera',
            data: {
              "compId": that.selectCompId,
              "cameraId": that.cameraData.id,
              "newTitle": that.cameraData.name,
              "newEquipmentModle": that.cameraData.equipmentModle,
              "newServerUrl": that.cameraData.serverUrl,
              "newServerPort": that.cameraData.serverPort,
              "newEquipmentId": that.cameraData.equipmentId,
              "newIp": that.cameraData.ip,
              "newPort": that.cameraData.port,
              "newUserName": that.cameraData.userName,
              "newPwd": that.cameraData.pwd,
              "newEquipmentPort": that.cameraData.equipmentPort,
              "newPosition": that.cameraData.position,
              "newImageUrl":that.fileList.length ? that.fileList[0].url:"",
            }
          };
        }
        that.axios(config).then(function (res) {
            if (res.data.code) {
              that.cameraData = {};
              that.close(false);
            } else {
              that.infoNotice('error', res.data.msg);
            }
          }).catch(function (error) {
            console.log(error);
          });
      },
      close(refresh){
        this.$emit('cameraStatus', refresh)
      },
      emptyData(){
        this.fileList = [];        
        this.cameraData.name = '';
        this.cameraData.equipmentModle = '';
        this.cameraData.serverUrl = '';
        this.cameraData.serverPort = '';
        this.cameraData.equipmentId = '';
        this.cameraData.ip = '';
        this.cameraData.userName = '';
        this.cameraData.pwd = '';
        this.cameraData.equipmentPort = '';
        this.cameraData.position = '';
        this.cameraData.port = '';
      },
      downLoadPlugin(){
        let url ='http://'+ window.location.host +  window.location.pathname + 'static/webVideo/codebase/WebComponents.exe';
        window.location.href = url;
      },
      show(){
        const that = this;
        that.dialogCameraDetailVisible = true;

        that.webVideo = {
          ip: that.cameraData.ip,
          port: that.cameraData.port,
          userName: that.cameraData.userName,
          pwd: that.cameraData.pwd,
        };
        that.$nextTick(function () {
          that.$el.getElementsByClassName('el-dialog--small')[0].style.width = '840px';
          that.$el.getElementsByClassName('el-dialog__body')[0].style.paddingTop = '4px';
        });
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
  .addCamera-wrap{
    @include dialogwidth;
    
    @include upload;
  }
</style>
