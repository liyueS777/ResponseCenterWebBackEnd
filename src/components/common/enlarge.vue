<template>
  <div class="container enlarge-wrap">
    <div class="enlarge-main">
      <i class="el-icon-circle-close icon-close" @click="close"></i>
      <img :src="fileParam.fileUrl">
      <a :href="fileParam.downUrl">图片名称：{{fileParam.filename}}</a>
    </div>
  </div>
</template>
<script>
  export default {
    props: ['fileParam'],
    data () {
      return {
      }
    },
    beforeMount(){
    },
    methods: {
      close(){
        this.$emit('viewStatus');
      }
    }
  }
</script>
<style lang="scss">
  .enlarge-wrap{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, .6);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .enlarge-main{
      width: 800px;
      height: 550px;
      background: white;
      border-radius: 4px;
      position: relative;
      padding: 25px 25px 45px;
      box-sizing: border-box;
      img{
        width: 100%;
        height: 100%;
        user-select: none;
      }
      a{
        display: block;
        text-decoration: underline;
        font-size: 16px;
        color: #20a0ff;
        font-weight: 600;
        padding: 10px 0;
        text-align: center;
      }
      .icon-close{
        font-size: 25px;
        opacity: 0.8;
        position: absolute;
        right: 2px;
        top: 2px;
        cursor: pointer;
      }
    }
    
  }
</style>
