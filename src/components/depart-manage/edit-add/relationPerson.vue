<template>
  <el-row class="m-transfer">
    <el-transfer filterable :filter-method="filterMethod" filter-placeholder="搜索" :titles="titles" v-model="value" :data="allList">
    </el-transfer>
    <el-col :span="24" style="text-align: center;margin-top: 15px;">
      <el-button type="info" @click="confirm">确定</el-button>
    </el-col>
  </el-row>
</template>
<script>
    export default {
        props:['relationData', 'selectCompId'],
        data () {
            return {
              allList: [],
              data: [],
              value: [],
              titles:[],
              filterMethod(query, item) {
                return item.label.indexOf(query) > -1;
              },
            }
        },
      watch:{
        'relationData.id'(val, oldVal){
          if(val){
            this.emptyData();
            this.getData();
          }
        }
      },
      mounted(){
        this.getData();
      },
      methods:{
        getData(){
          let that = this, config;
          if(that.relationData.op==='person'){
            that.titles = ['未选中视界集合', '已选中视界集合'];
            if(that.relationData.id){
              config = {
                url: '/user/getUserView',
                data: {
                  "compId": that.selectCompId,
                  "userId": that.relationData.id,
                }
              };
              this.axios(config).then(function (res) {
                if(res.data.code){
                  let data = res.data.data;
                  let noInView = data.noInView;
                  let inView = data.inView;
                  that.data = noInView.concat(inView);
                  for(let i = 0;i<inView.length;i++){
                    that.value.push(inView[i].viewId);
                  }
                  for (let i = 0; i < that.data.length; i++) {
                    let dataTemp = that.data[i];
                    that.allList.push({
                      label: dataTemp.viewName,
                      key: dataTemp.viewId
                    });
                  }
                }
              }).catch(function (error) {
                console.log(error);
              });
            }else {
              that.emptyData();
            }
          }else if(that.relationData.op ==='role'){
            that.titles = ['未授权角色', '已授权角色'];
            if(that.relationData.id){
              let config = {
                url: '/role/getUserRoles',
                data: {
                  "compId": that.COMPID,
                  "userId": that.relationData.id,
                }
              };
              this.axios(config).then(function (res) {
                if(res.data.code){
                  let data = res.data.data;
                  let noInView = data.noInRole;
                  let inView = data.inRole;
                  that.data = noInView.concat(inView);
                  for(let i = 0;i<inView.length;i++){
                    that.value.push(inView[i].roleId);
                  }
                  for (let i = 0; i < that.data.length; i++) {
                    let dataTemp = that.data[i];
                    that.allList.push({
                      label: dataTemp.roleName,
                      key: dataTemp.roleId
                    });
                  }

                }
              }).catch(function (error) {
                console.log(error);
              });
            }else {
              that.emptyData();
            }
          }else if(that.relationData.op ==='views'){
            that.titles = ['未选择视界集', '已选择视界集'];
            if(that.relationData.id){
              let config = {
                url: '/company/getCompanyView',
                data: {
                  "compId": that.relationData.id,
                }
              };
              this.axios(config).then(function (res) {
                if(res.data.code){
                  let data = res.data.data;
                  let noInView = data.noInView;
                  let inView = data.inView;
                  that.data = noInView.concat(inView);
                  for(let i = 0;i<inView.length;i++){
                    that.value.push(inView[i].viewId);
                  }
                  for (let i = 0; i < that.data.length; i++) {
                    let dataTemp = that.data[i];
                    that.allList.push({
                      label: dataTemp.viewName,
                      key: dataTemp.viewId
                    });
                  }

                }
              }).catch(function (error) {
                console.log(error);
              });
            }else {
              that.emptyData();
            }
          }
        },
        confirm(){
          let that = this, config;
          if(that.relationData.op==='person'){
            config = {
              url: '/user/userUpdateRelationView',
              data: {
                "compId":that.selectCompId,
                "userId":that.relationData.id,
                "viewIds":that.value,
              }
            };
          }else if(that.relationData.op==='role'){
            config = {
              url: '/userRole/userAwardRole',
              data: {
                "compId":that.COMPID,
                "userId":that.relationData.id,
                "roleId":that.value,
              }
            };
          }else if(that.relationData.op==='views'){
            config = {
              url: '/company/companyUpdateRelationView',
              data: {
                "compId":that.relationData.id,
                "viewIds":that.value,
              }
            };
          }
          that.axios(config).then(function (res) {
            if(res.data.code){
              that.close();
            }else {
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
        close(){
          this.emptyData();
          this.$emit('relationStatus')
        },
        emptyData(){
          this.allList=[];
          this.data=[];
          this.value= [];
        },
      },
    }
</script>
