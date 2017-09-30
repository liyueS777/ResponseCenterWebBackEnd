<template>
  <el-row>
    <el-row class="m-transfer">
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="搜索"
        :titles="['待选中视界', '已选中视界']"
        v-model="value"
        :data="allList">
      </el-transfer>
      <el-col :span="24" style="text-align: center;margin-top: 15px;">
        <el-button  type="info" @click="confirmFn">确定</el-button>
      </el-col>
    </el-row>
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
        this.getData()
      },
      methods:{
        getData(){
          let that = this, config
          if(that.relationData.id){
            config = {
              method: 'post',
              url: that.HOST+'/view/getViewContext',
              data: {
                "compId": that.selectCompId,
                "viewId": that.relationData.id,
              }
            };
            this.axios(config).then(function (res) {
                if(res.data.code){
                  let data = res.data.data;
                  let noInView = data.noInView;
                  let inView = data.inView;
                  that.data = noInView.concat(inView);
                  for (let i = 0; i < inView.length; i++) {
                    that.value.push(noInView.length + i);
                  }
                  for (let i = 0; i < that.data.length; i++) {
                    that.allList.push({
                      label: that.data[i].title?that.data[i].title:that.data[i].name,
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
        confirmFn(){
          let that = this, chartIds = [], cameraIds = [], mailListIds = [], config;
          for(let i = 0;i<that.value.length;i++){
            let m = that.data[that.value[i]];
            if (m.type === 1) {
              cameraIds.push(m.cameraId);
            } else if (m.type === 2) {
              chartIds.push(m.chartId);
            } else if (m.type === 3) {
              mailListIds.push(m.mailListId);
            }
          }
          config = {
            method: 'post',
            url: that.HOST+'/view/viewRelation',
            data: {
              "compId":that.selectCompId,
              "viewId":that.relationData.id,
              "chartIds":chartIds,
              "cameraIds":cameraIds,
              "mailListIds":mailListIds
            }
          };
          that.axios(config).then(function (res) {
            if(res.data.code){
              that.close(false);
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
          this.$emit('relationStatus', refresh)
        },
        emptyData(){
          this.allList=[];
          this.data=[];
          this.value= [];
        },
      },
    }
</script>