<template>
  <el-row class="m-transfer">
    <el-transfer
      filterable
      :filter-method="filterMethod"
      filter-placeholder="搜索"
      :titles="['待选中视界集合', '已选中视界集合']"
      v-model="value"
      :data="allList">
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
            config = {
              url: '/depart/getDepartView',
              data: {
                "compId": that.selectCompId,
                "departId": that.relationData.id,
              }
            };
            this.axios(config).then(function (res) {
             if(res.data.code){
               let data = res.data.data;
               let noInView = data.noInView;
               let inView = data.inView;
               that.data = noInView.concat(inView);
               for(let i = 0;i<inView.length;i++){
                 that.value.push(noInView.length + i);
               }
               for (let i = 0; i < that.data.length; i++) {
                 that.allList.push({
                   label: that.data[i].viewName,
                   key: i
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
          let that = this, viewIds = [], config;
          for(let i = 0;i<that.value.length;i++){
            viewIds.push(that.data[that.value[i]].viewId);
          }
          config = {
            url: '/depart/departUpdateRelationView',
            data: {
              "compId":that.selectCompId,
              "departId":that.relationData.id,
              "viewIds":viewIds,
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
