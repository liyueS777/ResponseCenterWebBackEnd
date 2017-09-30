<template>
   <div>
     <iframe class="webVideo" width="800" height="500"
             :src="webIframeSrc"
             frameborder="0" scrolling="no" ref="webVideo">
     </iframe>
   </div>
</template>
<script>
  export default {
    props:["videoData"],
    data () {
      return {
        webIframeSrc:"",
      }
    },
    watch:{
      videoData(val,oldVal){
        this.show();
      }
    },
    mounted(){
      this.show();
    },
    methods:{
      show(){
        const that = this;
        that.dialogCameraDetailVisible = true;
        that.$nextTick(function () {
          let ip,port,userName,pwd;
          ip = this.videoData.ip;
          port = this.videoData.port;
          userName = this.videoData.userName;
          pwd = this.videoData.pwd;
          if (ip && port && userName && pwd) {
            that.webIframeSrc = 'static/webVideo/cn/index.html?szIP=' + encodeURIComponent(ip) + '&szPort=' + port + '&szUsername=' + userName + '&szPassword=' + encodeURIComponent(pwd);
          }else {
            that.webIframeSrc = "";
          }
          that.$refs.webVideo.src = that.webIframeSrc;
        });
      },
    }
  }
</script>
<style lang="scss" scoped>

</style>
