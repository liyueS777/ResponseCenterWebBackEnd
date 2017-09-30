<template>
  <div class="inform-wrapper" ref="infoWrap" style="height:100%;">
    <div class="g-head" ref="infoHead">
      <i :class="$route.meta.icon" class="title-icon"></i>
      <h2>{{breadcrumb[1]}}</h2>
      <el-breadcrumb separator=">">
        <i class="el-icon-share"></i>
        <el-breadcrumb-item v-for="(item, index) in breadcrumb" :key="index">{{item}}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="g-body" ref="infoBody">
      <el-row >
        <el-col :span="6">
          <ul class="card-list" v-if="customList.length">
            <li v-for="(item, index) in customList" :class="[index === readIdx? 'active': '']" :key="index" class="card-item" @click="chooseCustomer(item, index)">
              <span class="unread" v-if="item.count && readIdx!=index">
                <i>{{item.count}}</i>
              </span>
              <img :src="item.user && item.user.imageUrl" ><span>{{ item.user && item.user.aliasName || item.user && item.user.fullname }}</span>
            </li>
          </ul>
          <p v-else class="no-customer">暂未与任何客户进行聊天！</p>
        </el-col>
        <el-col :span="18">
          <div class="notice-wrap">
            <div class="m-buttons notice-buttons">
              <el-button type="info" @click="editData"><i class="el-icon-plus"></i>工单</el-button>
            </div>
            <ul id="chat-list" ref="chatlist" class="chat-list" @scroll="onScroll($event)"  v-loading.body="loading" element-loading-text="拼命加载中">
                <li v-for="(item, index) in messageList" :class="[item.fromUserId == $store.state.userInfo.customerId ? 'myTalk': 'otherTalk']">
                  <img :src="[item.fromUserId == $store.state.userInfo.customerId? $store.state.userInfo.imageUrl: curCustom.user.imageUrl]">
                  <div class="talkinfo">
                      <h3><span class="name">{{item.fromName}}</span><span class="time">{{item.createTime}}</span></h3>
                      <div class="msg-wrap">
                        <p class="msg" v-if="item.type == 0">{{item.context}}</p>
                        <div v-if="item.type == 1">
                          <a :href="item.downUrl" class="img-wrap file-wrap">
                            <p>图片名称：{{item.filename}}</p>
                          </a>
                          <img :src="item.fileUrl" @click="enlarge(item)"/>
                        </div>
                        <div v-if="item.type == 2">
                          <a :href="item.downUrl" class="img-wrap file-wrap">
                            <p class="msg"><i class="el-icon-document"></i>{{item.filename}}</p>
                          </a>
                        </div>
                      </div>
                  </div>
                </li>
            </ul>
            <div class="enter-center">
              <textarea ref="talkWrite" class="talkWrite" id="talkWrite" @paste='pasteEvent($event)' placeholder="按ctrl+enter键换行" @keyup="send($event)" ></textarea>
              <span class="upload-file">
                <i class="el-icon-upload2"></i>
                <form id="uploadform">
                  <input type="file" class="file-btn" :disabled="!this.customList.length" @change="uploadEvent($event)" name="file"/>
                </form>
              </span>
              <el-button class="btn-send" type="info" @click="sendInfo(0)">发送</el-button>
            </div>
          </div>
        </el-col>
        <el-dialog :title="'是否上传图片？'" :visible.sync="dialogUploadVisible" size="small" top="3%" @close="closeView(true)">
          <div class="row">
            <p class="desc" v-if="JSON.stringify(fileInfo)!='{}'"><span>{{fileInfo.name}}</span>-<span>{{filesize}}</span></p>
            <div class="g-flex">
              <el-input type="text" v-model="fileInfo.name" placeholder="文件名" ></el-input>
            </div>
            <p class="desc">上传文件不可超过60M</p>
            <div class="g-flex g-button">
              <el-button @click="closeView(false)">取消</el-button>
              <el-button type="info" @click="uploadFile" >上传</el-button>
            </div>
          </div>
        </el-dialog>
        <enlargePicture v-if="dialogEnlargeVisible" :fileParam="fileParam" @viewStatus="closeView"></enlargePicture>
      </el-row>
    </div>
    <editView v-if="dialogEditViewVisible" @viewStatus="closeView" :saveData = "saveData"></editView>
  </div>
</template>
<script>
  var timer = null, scrollTimer= null;
  import moment from 'moment';
  import editView from "./edit-add/editView.vue";
  import enlargePicture from "../common/enlarge.vue";
  export default {
    props: ["breadcrumb", "receiveParam"],
    components:{
      editView,
      enlargePicture
    },
    data () {
      return {
        loading: false,
        customList: [],
        messageList: [],
        dialogUploadVisible: false,
        dialogEditViewVisible: false,
        dialogEnlargeVisible: false,
        fileInfo: {},
        filesize: '',
        curCustom: {},
        formData: {},
        readIdx: 0,
        queryId: '',
        saveData:{},
        flieType: 0,
        isPasted: false,
        fileParam: {},
        scrollHeight: 0,
        stopRequest: false
      }
    },
    beforeMount(){
      this.getCustomer();
    },
    mounted(){
      //动态处理右侧内容高度
      this.computeHeight();
      window.onresize = () => {
        return (() => {
          this.computeHeight();
        })();
      };
    },
    beforeDestroy(){
      if(JSON.stringify(this.curCustom)=='{}') return;
      this.$store.state.remoteConnect.send('',{'compId': this.COMPID, 'type': 'service', 'customerId': this.curCustom.user.userId , 'serverId': this.$store.state.userInfo.customerId, 'deptId': this.$store.state.userInfo.customerId+this.curCustom.user.userId+''}, 'isRead');
    },
    watch:{
      'curCustom': {
        handler(val, oldVal) {
          this.messageList = [];
          this.getDataList();
          this.stopRequest = false;
        },
        deep: true
      },
      'receiveParam':{
        handler(val, oldVal){
          val.type = val.msgType;
          val.context = emoji.emojify(val.context);
          if(this.customList && this.customList.length){
            if(JSON.stringify(this.curCustom) == '{}') return;
            if(val.fromUserId == this.curCustom.user.userId){
              this.messageList.push(val);
              this.stopRequest = false;
              this.scrollToBottom();
            }else{
              let isExit = false;
              this.customList = this.customList.map((item, key)=>{
                if(item.user.userId == val.fromUserId){
                  isExit = true;
                  item.count++;
                }
                return item;
              })
              if(!isExit){
                this.queryId = '';
                this.getCustomer();
              }
            }
          }else{
            this.getCustomer();
          }
        }
      }
    },
    methods: {
      computeHeight(){
        if(this.$refs.infoHead && this.$parent.$refs.copyright) {
          let contentheight = document.body.clientHeight - this.$refs.infoHead.clientHeight - this.$parent.$refs.copyright.clientHeight;
          this.$refs.infoBody.style.height = contentheight + "px";
        }
      },
      getCustomer(obj){
        let that =this, config;
        config = {
          method:'post',
          url:'/customer/queryCustomer',
          data:{
            "compId": that.COMPID,
            "serverId": that.$store.state.userInfo.customerId
          }
        };
        that.axios(config).then((res)=>{ 
          if(res.data.code){
            if(!res.data.data.length) return;
            that.customList = res.data.data;
            that.curCustom = obj ? obj : res.data.data[0];  //默认显示第一个客户的历史消息列表
          }
        }).catch((error)=>{
          console.log(error);
        });
      },
      getDataList(bool){
        let userid = this.curCustom && this.curCustom.user.userId,
            customerId = this.$store.state.userInfo.customerId,
            that =this, config;
        config = {
          method:'post',
          url:'/customer/queryPageCustomer',
          data:{
            "compId": that.COMPID,
            "deptId": customerId + userid, //房间id(客服id + userId)
            "pageIndex":that.queryId,
            "pageSize": 10,
          }
        };
        that.axios(config).then((res)=>{ 
          if(res.data.code){
            if(!res.data.data) return;
            let msgList = res.data.data;
            if(!msgList.length){
              this.stopRequest =true;
            }
            if(msgList.length){
              msgList = msgList.map((item, key)=>{
                if(item.type!= 0){
                  item.filename = item.context;
                  item.downUrl = that.HOST + '/FileUpload/download?realFileName='+ item.fileUrl + '&newFileName=' + item.context;
                }
                item.context = emoji.emojify(item.context);
                return item;
              })
              that.queryId = msgList[0].id;
            } 
            that.messageList = msgList.reverse().concat(that.messageList);
            if(bool){
              that.scrollToBottom(bool);
            }else{
              that.loading = false;
              that.scrollToBottom()
            }
          }
        }).catch((error)=>{
          console.log(error);
        });
      },
      editData(){
        if(JSON.stringify(this.curCustom) == '{}') return;
        // console.log('当前客户信息：', this.curCustom);
        this.saveData = {
          'serverId': this.$store.state.userInfo.customerId,
          'serverName': this.$store.state.userInfo.name || this.$store.state.userInfo.username,
          'customerId': this.curCustom.user.userId,
          'customerName': this.curCustom.user.aliasName || this.curCustom.user.fullname,
          'customerImageUrl': this.curCustom.user.imageUrl,
          'customerTelphone': this.curCustom.user.mobile,
          'departId': this.$store.state.userInfo.customerId + this.curCustom.user.userId,
          'customerDepartId': this.curCustom.user.departId
        }
        this.dialogEditViewVisible = true;
      },
      send(event){
        let len = 0, hgt = 0;
        if (event.ctrlKey==true && event.keyCode == 13){
          this.$refs.talkWrite.value = this.$refs.talkWrite.value + '\n';
          len = this.$refs.talkWrite.value.split('\n').length-1;
          // 36 为 textarea初始的高度, 16为行间距, 500为textarea的最高高度
          hgt = 36 + len * 16;
          if(hgt >= 500){
            this.$refs.talkWrite.style.height = '500px';
            this.$refs.talkWrite.scrollTop = this.$refs.talkWrite.scrollHeight - this.$refs.talkWrite.clientHeight;
          }else{
            this.$refs.talkWrite.style.height = hgt + 'px';
          }
        }else if(event.commandKey == true && event.keyCode == 86 ){
          this.pasteEvent(event);
        }else{
          if(event.keyCode == 13){
            this.sendInfo(0);
            this.$refs.talkWrite.style.height = '36px';
          }else if(event.keyCode == 8){
             len = this.$refs.talkWrite.value.split('\n').length-1;
             hgt = 36 + len * 16;
             if(hgt >= 500){
               this.$refs.talkWrite.style.height =  '500px';
             }else{
               hgt = 36 + len * 16;
               this.$refs.talkWrite.style.height = hgt + 'px';
             }
          }
        }
      },
      sendInfo(msgType, fileUrl){
        // msgType: (0 :'文本'，1:'图片', 2:' 附件')
        // console.log('上传格式类型：', msgType);
        if(typeof msgType !== 'number')  return;
        if(JSON.stringify(this.curCustom) == '{}') return;
        let context = ''; 
        if(msgType == 0){
          context = this.$refs.talkWrite.value.trim();
          if(!context){
            this.infoNotice('info', '发送内容不能为空！');
            return;
          }
        }else{
          context = this.fileInfo.name;
        }
        let userInfo = this.$store.state.userInfo,
            fromUserId = userInfo.customerId,
            fromUsername = userInfo.name || userInfo.username,
            toUserId =  this.curCustom.user.userId,
            toUsername = this.curCustom.user.fullname,
            deptId = userInfo.customerId + this.curCustom.user.userId +'';
          this.startTalk({
            toUserId,
            toUsername,
            fromUserId,
            fromUsername,
            imageUrl: userInfo.imageUrl, // 发送者的图片地址
            deptId,
            context,
            msgType,
            fileUrl: fileUrl? fileUrl: ''
          })
      },
      startTalk(param){
        // console.log('param-----', param);
        this.$store.state.remoteConnect.send('',{'compId': this.COMPID, 'fromUserId':param.fromUserId, 'fromName': param.fromUsername , 'toUserId': param.toUserId, 'toName': param.toUsername,'deptId':param.deptId,'imageUrl': param.imageUrl, 'context': param.context, "msgType": param.msgType, "fileUrl": param.fileUrl}, 'customService');
        let sendParam = {
          "compId": this.COMPID,
          "deptId": param.deptId,
          "createTime": moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
          "context": param.context,
          "fromUserId": param.fromUserId,
          "fromName": param.fromUsername,
          "toName": param.toName,
          "toUserId": param.toUserId,
          "imageUrl": param.fileUrl  //追加的数据显示返回的图片地址
        }
        sendParam.type = param.msgType;
        if(param.msgType!=0){
          sendParam.filename = param.context;
          sendParam.fileUrl = param.fileUrl;
          sendParam.downUrl = this.HOST + '/FileUpload/download?realFileName='+ param.fileUrl + '&newFileName=' + this.fileInfo.name;
        }
        this.stopRequest = false;
        this.messageList.push(sendParam); 
        this.scrollToBottom();    
        this.$refs.talkWrite.value = '';
      },
      onScroll(event){
        var scrollTop = event.target.scrollTop;
        if(scrollTop===0){
            if(!this.messageList.length) return;
            this.scrollHeight = this.$refs.chatlist.scrollHeight;
            this.queryId = this.messageList[0].id;
            if(this.stopRequest) return; //若无消息加载时，阻止重复请求
            this.loading = true;
            this.getDataList(true);
        }
      },
      scrollToBottom(bool){
        clearTimeout(scrollTimer);
        let ts = bool ? 500 : 0,
          $chatlist = this.$refs.chatlist;
        scrollTimer = setTimeout(()=>{
          if(bool){
            this.loading = false;
            $chatlist.scrollTop = $chatlist.scrollHeight - this.scrollHeight;
          }else{
            $chatlist.scrollTop = $chatlist.scrollHeight - $chatlist.clientHeight;
          }
        }, ts);
      },
      chooseCustomer(obj, index){
        let oldCustom = this.curCustom; //保存上一次离开的房间客户信息
        this.curCustom = obj;
        this.$store.state.remoteConnect.send('',{'compId': this.COMPID, 'type': 'service', 'customerId': oldCustom.user.userId , 'serverId': this.$store.state.userInfo.customerId, 'deptId': this.$store.state.userInfo.customerId+oldCustom.user.userId+''}, 'isRead');
        this.readIdx = index;
        this.queryId = '';
         this.customList = this.customList.map((item, key)=>{
          if(item.user.userId == this.curCustom.user.userId){
            item.count=0;
          }
          return item;
        })
        this.dialogEditViewVisible = false;
      },
      pasteEvent(e){
        if(!e.clipboardData) return;
        if(this.customList && !this.customList.length) return;
        let pasteItems = e.clipboardData.items
        for(let item of pasteItems){
          // console.log('粘贴的文件信息：', item);
          if(item.kind=='string'){
              item.getAsString((value)=>{
                  value = value.replace(/<\/?[^>]*>/g,'')
                  if(value!=''){
                      console.log(value);
                  }
              })
          }else if(item.kind == "file"){
              let file = item.getAsFile();
              if(!(file instanceof File)){
                file = new File([file], 'Clipboard.png', {
                  type: item.type,
                  size: item.size
                });
              }
              this.fileInfo = file;
              this.dialogUploadVisible = true;
              this.isPasted = true;
          }
        }
      },
      uploadEvent(event){
        this.isPasted = false;
        this.fileInfo = event.target.files[0];
        // console.log('上传的文件对象信息：', this.fileInfo);
        if(event.target.files && event.target.files.length){
          this.bytesToSize(this.fileInfo.size);
          var uploadform = document.getElementById('uploadform');
          this.formData = new FormData(uploadform);  
          this.dialogUploadVisible = true;
          clearTimeout(timer);
          timer = setTimeout(()=>{
            event.target.value = '';
          }, 2000)
        }
      },
      uploadFile(){
        if(!this.checkFile(this.fileInfo)) return;
        let oFormData = new FormData();         
        oFormData.append('file', this.fileInfo);
        let config = {
            method: 'post',
            url: this.HOST + '/FileUpload/uploadCustomFile',
            data: this.isPasted ? oFormData : this.formData 
          };
        this.axios(config).then((res)=>{
          if(res.data.code){
            if(!res.data.data) return;
            let fileUrl = res.data.data;
            this.sendInfo(this.fileType, fileUrl);
            this.dialogUploadVisible = false;
          }else{
            this.infoNotice('error', res.data.msg);
          }
        })
      },
      checkFile(file){
        let fType = file.type;
        if(fType.indexOf('application')>-1 || fType.indexOf('text')>-1 || !fType){
          this.fileType = 2;
        }else if(fType.indexOf('image')>-1){
          this.fileType = 1;
        }
        // if(!fType){
        //   this.infoNotice('error', '不支持该文件格式!')
        //   return false;
        // }
        if(file.size > 62914560){ 
          this.infoNotice('error', '上传文件不能大于60M!')
          return false;
        }
        return true;
      },
      closeView(refresh){
        this.dialogUploadVisible = false;
        this.dialogEditViewVisible = false;
        this.dialogEnlargeVisible = false;
      },
      bytesToSize(bytes) {  
        if (bytes === 0) return '0 B';  
        var k = 1024, 
          sizes = ['B','KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
          i = Math.floor(Math.log(bytes) / Math.log(k));     
        var size= (bytes / Math.pow(k, i)).toFixed(2) + sizes[i]; 
        this.filesize = size;                                                                                
      },
      infoNotice(type, msg){
        this.$message({
          type: type,
          message: msg,
          duration: 1500
        });
      },
      enlarge(obj){
        this.fileParam = {
          'filename': obj.filename,
          'fileUrl': obj.fileUrl,
          'downUrl': obj.downUrl
        }
        this.dialogEnlargeVisible =  true;
      }
    }
  }
</script>
<style lang="scss">
@import '~@/assets/style/info.scss';
.inform-wrapper{
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .g-body {
    .el-row{
      background: white;
      height: 100%;
    }
    .el-col{
      height: 100%;
    }  
    .card-list{
      height: 100%;
      box-sizing: border-box;
      border: 1px solid #d1dbe5;
      background-color: #fff;
      overflow-y: auto;
      font-size: 14px;
      .card-item{
        padding: 0 15px;
        height: 40px;
        line-height: 40px;
        display: flex;
        align-items: center;
        position: relative;
        img{
          width: 30px;
          height: 30px;
          margin-right: 10px;
        }
      }
      .unread{
        position: absolute;
        right: 5px;
        height: 40px;
        display: flex;
        align-items: center;
        color: white;
        i{
          display: block;
          background: red;
          border-radius: 50%;
          height: 20px;
          padding: 0 5px;
          display: flex;
          align-items: center;
          font-size: 12px;
          font-style: normal;
        }
      }
      .active{
        background: #bfcbd9;
        cursor: pointer;
      }
      li:hover{
        background: #bfcbd9;
        cursor: pointer;
        opacity: 0.4;
      }
    }
    .no-customer{
      text-align: center; 
      font-size: 14px;
      padding: 10px 0;
    }
  }
  .upload-file{
    width: 50px;
    position: relative;
    color: #fff;
    background-color: #50bfff;
    border-color: #50bfff;
    display: inline-block;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid #c4c4c4;
    margin-right: 2px;
    padding: 10px 15px;
    border-radius: 4px;
    box-sizing: border-box;
    &:hover{
      background: #73ccff;
      border-color: #73ccff;
    }
    i{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .file-btn{
    height: 100%;
    opacity: 0;
    position: absolute;
    width: 40px;
    top: 0;
    left: 0;
  }
  .notice-buttons{
    position: absolute;
    right: 18px;
    top: -3px;
    z-index: 100;
  }
  .el-button+.el-button {
    margin-left: 2px;
  }
  .el-dialog--small {
      width: 500px;
  }
  .g-flex{
    padding-right: 0;
  }
}

</style>
