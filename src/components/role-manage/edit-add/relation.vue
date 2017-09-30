<template>
  <el-row class="m-transfer">
    <el-transfer filterable :filter-method="filterMethod" filter-placeholder="搜索" :titles="titles" v-model="inResourceValue" :data="allList"></el-transfer>
    <el-col :span="24" style="text-align: center;margin-top: 15px;">
      <el-button  type="info" @click="confirm">确定</el-button>
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
            inResourceValue: [], //已选择的权限指
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
          let that = this, config;
          if(that.relationData.id){
            that.titles = ['未授权权限', '已授权权限'];
            config = {
              url: '/resource/getRoleResources',
              data: {
                "compId": that.COMPID,
                "roleId": that.relationData.id,
              }
            };
            this.axios(config).then(function (res) {
              if(res.data.code){
                let data = res.data.data;
                let noInView = data.noInResource;
                let inView = data.inResource;
                that.data = noInView.concat(inView);
                for(let i = 0;i<inView.length;i++){
                  that.inResourceValue.push(inView[i].resourceId);
                }
                for (let i = 0; i < that.data.length; i++) {
                  let dataTemp = that.data[i];
                  that.allList.push({
                    label: dataTemp.resourceName,
                    key: dataTemp.resourceId
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
            url: '/roleResource/roleAwardResource',
            data: {
              "compId":that.COMPID,
              "roleId":that.relationData.id,
              "resourceId":that.inResourceValue,
            }
          };
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
          this.$emit('relationStatus');
        },
        emptyData(){
          this.allList=[];
          this.data=[];
          this.inResourceValue= [];
        },
      },
    }
</script>
