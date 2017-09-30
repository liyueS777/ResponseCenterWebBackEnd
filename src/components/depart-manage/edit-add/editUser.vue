<template>
  <div class="container user-wrap">    
    <div class="row user-main">
      <p>新增用户</p>
      <div class="g-flex">
        <span>账号：</span>
        <el-input type="text" v-model="viewData.data.account" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span>姓名：</span>
        <el-input type="text" v-model="viewData.data.fullname" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span>字号：</span>
        <el-input type="text" v-model="viewData.data.aliaName" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>企业名称：</span>
        <el-select v-model="selectCompId" placeholder="请选择企业名称" :disabled="viewData.op=='edit'? true: false" @change="getDepartList">
          <el-option v-for="(item,index) in compList" :key="index" :label="item.compName" :value="item.compId"></el-option>
        </el-select>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>部门：</span>
        <el-select ref="depart" v-model="selectDepartId" filterable clearable slot="prepend" placeholder="选择部门" :disabled="viewData.op=='edit'? true: false">
          <el-option v-for="(item, index) in departList" :key="index" :label="item.departName" :value="item.id"></el-option>
        </el-select>
      </div>
      <div class="g-flex">
        <span>工号：</span>
        <el-input type="text" v-model="viewData.data.staffNo" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span>性别：</span>
        <el-radio-group v-model="sex" >
          <el-radio :label="1">男</el-radio>
          <el-radio :label="0">女</el-radio>
        </el-radio-group>
      </div>
      <div class="g-flex">
        <span>职称：</span>
        <el-input type="text" v-model="viewData.data.posName" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span>联系方式：</span>
        <el-input type="text" v-model="viewData.data.mobile" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex">
        <span><i class="red_heart">*</i>Email：</span>
        <el-input type="text" v-model="viewData.data.email" :disabled="disabled"></el-input>
      </div>
      <div class="g-flex g-button" v-show="!readyOnly">
        <el-button type="info" @click="confirm">确定</el-button>
        <el-button @click="close(false)">取消</el-button>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    props: ["viewData", "compList"],
    data () {
      return {
        readyOnly:false,
        disabled: false,
        departList: [],
        selectCompId: '',
        selectDepartId: '',
        sex: 1
      }
    },
    watch: {
      'viewData.op'(val, oldVal) {
        if(val){
          this.initData();
        }
      }
    },
    beforeMount(){
      this.initData();
    },
    methods: {
      getDepartList(){
        const that = this;
        let config = {
          url: '/depart/getDepartMethod',
          data: {
            "compId": that.selectCompId
          }
        };
        that.axios(config).then(function (res) {
          if (res.data.code) {
            if(!res.data.data.length) return;
            that.departList = res.data.data;
            that.selectDepartId = that.viewData.op=='edit'? that.viewData.data.departId : res.data.data[0].id;
          } else {
            that.departList = [];
            that.infoNotice('info', res.data.msg);
          }
        }).catch(function (error) {
          console.log(error);
        });
      },
      initData(){
        const that = this;
        if (that.viewData.op == 'edit') {
          that.viewData.data.staffNo = that.viewData.data.staffNo!="null" ?that.viewData.data.staffNo: ''
          that.viewData.data.posName = that.viewData.data.posName!="null" ?that.viewData.data.posName: ''
          that.viewData.data.mobile = that.viewData.data.mobile!="null" ?that.viewData.data.mobile: ''
          that.selectCompId = that.viewData.data.compId;
          that.sex = parseInt(that.viewData.data.sex);
        } else {
          that.disabled = false;
          that.emptyData();
          this.selectCompId = this.compList[0].compId;
        }
        this.getDepartList()
      },
      emptyData(){
        this.viewData.data.account = '';
        this.viewData.data.fullname = '';
        this.viewData.data.aliaName = '';
        this.viewData.data.staffNo = '';
        this.viewData.data.posName = '';
        this.viewData.data.mobile = '';
        this.viewData.data.email = '';
      },
      infoNotice(type, msg){
         this.$message({
            type: type,
            message: msg,
            duration: 1500
          });
      },
      confirm(){
        let that = this,  config;
        if(!that.viewData.data.email){
           that.infoNotice('error', '邮箱不能为空'); return;
        }
        const regTel = /^((13)|(14)|(15)|(18))[\d]{9}$/;  
        if(that.viewData.data.mobile && !regTel.test(that.viewData.data.mobile)){
          that.infoNotice('error', '联系方式格式不正确'); return;
        }
        const regEmail = /^[a-zA-Z0-9]+([._\\-]*[a-zA-Z0-9])*@([a-zA-Z0-9]+[-a-zA-Z0-9]*[a-zA-Z0-9]+.){1,63}[a-zA-Z0-9]+$/;
        if(!regEmail.test(that.viewData.data.email)){
          that.infoNotice('error', '邮箱格式不正确'); return;
        }
        if(that.viewData.op==='add'){
          config = {
            url: '/user/addUser',
            data: {
              "compId": that.selectCompId,
              "departId": that.selectDepartId,
              "account": that.viewData.data.account,
              "aliasName": that.viewData.data.aliaName,
              "fullName": that.viewData.data.fullname,
              "email": that.viewData.data.email,
              "telphone": that.viewData.data.mobile,
              "postName": that.viewData.data.posName,
              "sex": that.sex,
              "staffNo": that.viewData.data.staffNo
            }
          };
        }else if(that.viewData.op==='edit'){
          config = {
            url: '/user/updateUser',
            data: {
              "userId": that.viewData.data.id,
              "newAccount": that.viewData.data.account,
              "newAliasName": that.viewData.data.aliaName,
              "newEmail": that.viewData.data.email,
              "newFullName":that.viewData.data.fullname,
              "newTelphone": that.viewData.data.mobile,
              "newPostName": that.viewData.data.posName,
              "newSex": that.sex,
              "newStaffNo": that.viewData.data.staffNo
            }
          };
        }
        that.axios(config).then(function (res) {
          if (res.data.code) {
            that.close(false);
            that.infoNotice('info', res.data.msg);
          } else {
            that.infoNotice('error', res.data.msg);
          }
        }).catch(function (error) {
          console.log(error);
        });
      },
      close(refresh){
        this.$emit('viewStatus', refresh);
      }
    }
  }
</script>
<style lang="scss">
  @import '~@/assets/style/add.scss';
  .user-wrap{
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    z-index: 88888;
    background: rgba(0, 0, 0, .3);
    display: flex;
    justify-content: center;
    align-items: center;
    .user-main{
      width: 40%;
      min-width: 400px;
      background: white;
      p{
        line-height: 1;
        font-size: 16px;
        font-weight: 700;
        color: #1f2d3d;
        padding: 20px 20px 0;
      }
      .g-button{
        margin-bottom: 30px;
      }
    }
  }
</style>
