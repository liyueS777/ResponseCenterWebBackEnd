<template>
  <div class="container history-wrap">
     <ul id="chat-list" class="chat-list" v-if="messageList && messageList.length">
        <li v-for="(item, index) in messageList" :class="[item.fromUserId == $store.state.userInfo.customerId ? 'myTalk': 'otherTalk']">
          <img :src="[item.fromUserId == $store.state.userInfo.customerId? $store.state.userInfo.imageUrl: item.imageUrl]">
          <div class="talkinfo">
              <h3><span class="name">{{item.fromName}}</span><span class="time">{{item.createTime}}</span></h3>
              <div class="msg-wrap">
                <p class="msg" v-if="item.type == 0">{{item.context}}</p>
                <div v-if="item.type == 1">
                  <a :href="item.downUrl" class="img-wrap file-wrap">
                    <p>图片名称：{{item.filename}}</p>
                  </a>
                  <img :src="item.fileUrl" @click="enlarge(item)" style="width: 100px; height: 100px; display: block;"/>
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
    <div style="text-align:center;" v-else>
      此工单无消息记录
    </div>
    <enlargePicture v-if="dialogEnlargeVisible" :fileParam="fileParam" @viewStatus="closeView"></enlargePicture>
  </div>
</template>
<script>
  import enlargePicture from "../../common/enlarge.vue";
  export default {
    props: ['queryParam'],
    components:{
      enlargePicture
    },
    data () {
      return {
        messageList: [],
        dialogEnlargeVisible: false,
        fileParam: {}
      }
    },
    watch: {
      'queryParam.id'(val, oldVal){
        if(val){
          this.queryHistoryMsg();
        }
      }
    },
    beforeMount(){
      this.queryHistoryMsg();
    },
    mounted(){
      let left = (document.body.clientWidth - this.$parent.$refs.dialog.clientWidth)/2 + 'px';
      this.$parent.$refs.dialog.style.left = left;
    },
    methods: {
      close(refresh){
        this.$emit('viewStatus', refresh);
      },
      closeView(){
        this.dialogEnlargeVisible = false;
      },
      enlarge(obj){
        this.fileParam = {
          'filename': obj.filename,
          'fileUrl': obj.fileUrl,
          'downUrl': obj.downUrl
        }
        this.dialogEnlargeVisible =  true;
      },
      queryHistoryMsg(){
        let that = this, reqData; 
        reqData = {
          "compId": that.queryParam.compId,
          "orderId": that.queryParam.id,
        };
        that.axios.post('/customer/getMessageByOrder', reqData).then(function (res) {
            if(res.data.code){
              if(!res.data.data.length) return;
              let msgList = res.data.data;
              msgList = msgList.map((item, key)=>{
                if(item.type!= 0){
                  item.filename = item.context;
                  item.downUrl = that.HOST + '/FileUpload/download?realFileName='+ item.fileUrl + '&newFileName=' + item.context;
                }
                return item;
              })
              that.messageList = msgList;
            }else {
              that.$message({
                type: 'info',
                message: res.data.msg,
                duration: 1500
              });
            }

        }).catch(function (error) {
          console.log(error);
        });
      }
    }
  }
</script>
<style lang="scss">
  .history-msg-wrap{
    .el-dialog--small{
      width: 60%;
    }
    .el-dialog{
      transform: none;
      position: absolute;
      left: 0;
    }
  }
  .history-wrap{
    .chat-list{
      height: 550px;
      border: 1px solid #eaeaea;
      padding-top: 20px;
    }
  }
</style>
