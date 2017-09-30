<template>
  <el-row class="m-transfer">
    <el-transfer filterable :filter-method="filterMethod" filter-placeholder="搜索" :titles="titles" v-model="inRoleValue" :data="allList"></el-transfer>
    <el-col :span="24" style="text-align: center;margin-top: 15px;">
      <el-button type="info" @click="confirm">确定</el-button>
    </el-col>
  </el-row>
</template>
<script>
    export default {
        props:['relationData'],
        data () {
            return {
              allList: [],
              data: [],
              inRoleValue: [],
              titles:[],
              filterMethod(query, item) {
                return item.label.indexOf(query) > -1;
              },
            }
        },
      watch:{
        'relationData.id'(val, oldVal) {
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
          const that = this;
          if(that.relationData.id){
            that.titles = ['未授权角色', '已授权角色'];
            let config = {
              url: '/mrole/getUserRoles',
              data: {
                "compId": that.COMPID,
                "userId": that.relationData.id,
              }
            };
            this.axios(config).then(function (res) {
              if(res.data.code){
                let data = res.data.data;
                let noInRole = data.noInRole;
                let inRole = data.inRole;
                that.data = noInRole.concat(inRole);
                for(let i = 0;i<inRole.length;i++){
                  that.inRoleValue.push(inRole[i].roleId);
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
        },
        confirm(){
          let that = this, config;
          config = {
            url: '/manager/userAwardRole',
            data: {
              "compId": that.COMPID,
              "userId": that.relationData.id,
              "roleId": that.inRoleValue,
            }
          };
          that.axios(config).then(function (res) {
            if(res.data.code){
              that.close(true);
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
        close(refresh){
          this.$emit('relationStatus', refresh);
        },
        emptyData(){
          this.allList=[];
          this.data=[];
          this.inRoleValue= [];
        },
      },
    }
</script>
