<template>
  <el-row v-loading.body="loading">
    <el-col :span="24" align="right" v-show="showCreateThumb" style="margin-bottom: 10px;">
      <el-button
          size="small"
          @click="uploadThumb">生成缩略图
    </el-button>
    </el-col>
    <el-col :span="24" v-show="typeof chartId === 'number' ">
      <div class="echart" ref="echartDetail" style="width:100%;height:455px;"></div>
    </el-col>
    <el-col :span="24" style="height:455px;" v-show="typeof chartId === 'object' ">
      <iframe ref="iframe" :src="chartData.chartUrl" frameborder="0" width="100%" height="100%"></iframe>
    </el-col>
  </el-row>
</template>
<script>
  let echarts = require('echarts/lib/echarts');
  // 引入折现图
  require('echarts/lib/chart/line');
  // 引入柱状图
  require('echarts/lib/chart/bar');
  // 引入饼图
  require('echarts/lib/chart/pie');
  // 引入提示框和标题组件
  require('echarts/lib/component/tooltip');
  require('echarts/lib/component/title');
  require('echarts/lib/component/toolbox');
  export default {
    props: ['chartId'],
    data()
    {
      return {
        chartData: {},
        chart:null,
        showCreateThumb:false,
        loading:false,
      }
    }
    ,
    watch: {
      chartId(val, oldVal){
        if (val === "") {
          this.emptyData();
        } else if(typeof val === 'number'){
          this.createdChart(val);
        }else if(typeof val === 'object'){
          this.createdUrl(val);
        }
      }
    },
    mounted(){
      this.initPage(this.chartId);
    },
    methods: {
      initPage(val){
        if (val === "") {
          this.emptyData();
        } else if(typeof val === 'number'){
          this.createdChart(val);
        }else if(typeof val === 'object'){
          this.createdUrl(val);
        }
      },
      createdUrl(val){
          this.showCreateThumb = false;
          this.chartData = val ? val : this.chartId;
      },
      createdChart(val){
        const that = this;
        let chartId = val ? val : that.chartId;
        let config = {
          method: 'post',
          url: that.HOST + '/Chart/queryNewEstDataChart',
          data: {
            "compId": that.COMPID,
            "chartId": chartId
          }
        };
        that.axios(config).then(function (res) {
          if (res.data.code) {
            that.showCreateThumb = true;
            that.chartData = res.data.data;
            let option;
            switch(that.chartData.chart.chartType){
              case 1://折线图
                option = {
                  title : {
                    text: that.chartData.chart.title,
                    x:'center',
                    textStyle:{ color:'#fff' },
                  },
                  color: ['#e6e6e6'],
                  tooltip: {
                    trigger: 'axis',
                    formatter: "{b} : {c}"
                  },
                  textStyle:{
                    color: '#e6e6e6',
                    fontSize: 16
                  },
                  grid: {
                    left: '3%',
                    right: '6%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis: {
                    type: 'category',
                    axisLine: {onZero: false},
                    axisLabel: {
                      formatter: '{value}'
                    },
                    boundaryGap: false,
                    data:JSON.parse(that.chartData.dataChart.nameData)
                  },
                  yAxis: {
                    type: 'value',
                    axisLabel: {
                      formatter: '{value}'
                    },
                  },
                  series: [
                    {
                      name: that.chartData.chart.title,
                      type: 'line',
                      smooth: true,
                      lineStyle: {
                        normal: {
                          shadowColor: 'rgba(0,0,0,0.4)',
                          shadowBlur: 10,
                          shadowOffsetY: 10
                        }
                      },
                      data:JSON.parse(that.chartData.dataChart.valueData)
                    }
                  ]
                };
                  break;
              case 2://柱状图
                option = {
                  title : {
                    text: that.chartData.chart.title,
                    x:'center',
                    textStyle:{ color:'#fff' },
                  },
                  color: ['#fff'],
                  legend: {
                    textStyle:{ color:'#fff' },
                  },
                  textStyle:{
                    color: '#e6e6e6',
                    fontSize: 16
                  },
                  tooltip : {
                    trigger: 'axis',
                    axisPointer : {
                      type : 'shadow'
                    },
                  },
                  grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                  },
                  xAxis : [
                    {
                      type : 'category',
                      data : JSON.parse(that.chartData.dataChart.nameData),
                      axisTick: {
                        alignWithLabel: true
                      }
                    }
                  ],
                  yAxis : [
                    {
                      type : 'value'
                    }
                  ],
                  series : [
                    {
                      name:that.chartData.chart.title,
                      type:'bar',
                      barWidth: '60%',
                      data:JSON.parse(that.chartData.dataChart.valueData),
                    }
                  ]
                };
                break;
              case 3://饼图
                option = {
                  title : {
                    text: that.chartData.chart.title,
                    x:'center',
                    textStyle:{ color:'#fff' },
                  },
                  tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                  },
                  color:['white','#ff9b12','#5bae16','#0a7faa'],
                  series : [
                    {
                      name: that.chartData.chart.title,
                      type: 'pie',
                      radius : '55%',
                      center: ['50%', '60%'],
                      data:JSON.parse(that.chartData.dataChart.valueData),
                      itemStyle: {
                        emphasis: {
                          shadowBlur: 10,
                          shadowOffsetX: 0,
                          shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                      },
                      label: {
                        normal: {
                          textStyle: {
                            color: '#e6e6e6'
                          }
                        }
                      },
                      labelLine: {
                        normal: {
                          lineStyle: {
                           color: 'rgba(255, 255, 255, 0.3)'
                          },
                          smooth: 0.2,
                          length: 10,
                          length2: 20
                        }
                      }
                    }
                  ]
                };
                 break;
            }
            that.chart = echarts.init(that.$refs['echartDetail']);
            that.chart.setOption(option);
            window.addEventListener('resize',that._chartResize,false);
          } else {
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
      _chartResize(){
        this.chart.resize();
      },
      emptyData(){
        if(this.chart !== null){
          this.chart.dispose(this.$refs['echartDetail']);
          this.chart = null;
        }
        this.chartData = {};
        window.removeEventListener('resize',this._chartResize,false);
      },
      //转换base64图片元数据为 blob，用于 FormData
      dataURItoBlob(base64Data) {
        let byteString;
        if (base64Data.split(',')[0].indexOf('base64') >= 0){
          byteString = atob(base64Data.split(',')[1]);
        } else{
          byteString = unescape(base64Data.split(',')[1]);
        }
        let mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
        let ia = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ia], {type:mimeString});
      },
      //创建缩略图
      createThumb(){
        let echartCanvas = this.$refs.echartDetail.firstChild.firstChild;
        let canvas = document.createElement('canvas');
        //饼状图宽度调小
        let isPie = this.chartData.chart.chartType === 3;
        let echartwidth = isPie ? echartCanvas.width * 2/3 : echartCanvas.width;
        let echartHeight = echartCanvas.height-50;
        canvas.width = 300;
        canvas.height = 300;
        let context = canvas.getContext("2d");
        //解决PNG透明图绘制背景黑色的问题
        context.fillStyle = "#275F97";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(echartCanvas, isPie ? echartCanvas.width/6 : 0, isPie ? 60 : 50, echartwidth, echartHeight, 0, 0, 300, 300);
        return canvas.toDataURL("image/jpeg");
      },
      //上传缩略图
      uploadThumb(){
        let that=this,
          formData = new FormData(document.forms[0]);
          formData.append("file", that.dataURItoBlob(that.createThumb()), 'image.jpeg');
          that.loading = true;
          that.axios({
            method: 'post',
            url: that.HOST + '/FileUpload/uploadFile',
            data: formData
          }).then(function (res) {
            if(res.data.code === 1){
              that.updateThumb(res.data.data);
            }else{
              that.loading = false;
              that.$message({
                type: 'error',
                message: res.data.msg,
                duration: 1500
              });
            }
          }).catch(function (error) {
            that.loading = false;
            console.log(error);
          });
      },
      //更新缩略图
      updateThumb(url){
        let that=this,
          config = {
            method: 'post',
            url: that.HOST + '/Chart/updateChart',
            data: {
              "compId": that.COMPID,
              "chartId": that.chartData.chart.id,
              "newImageUrl": url,
              "isPre": 0
            },
          };
          that.axios(config).then(function (res) {
            that.loading = false;
            if (res.data.code) {
              that.$message({
                type: 'success',
                message: '更新缩略图成功',
                duration: 1500
              });
              that.close(true);
            } else {
              that.$message({
                type: 'error',
                message: res.data.msg,
                duration: 1500
              });
            }
          }).catch(function (error) {
            that.loading = false;
            console.log(error);
          });
      },
      close(refresh){
        this.$emit('detailStatus',refresh);
      }
    }
  }
</script>
<style lang="scss" scoped>
.el-button{
  margin-right: 20px;
}
  .echart {
    background-color: #2e567d !important;
    background-color: rgba(255, 255, 255, 0.4) !important;
    background-color: #2e567d !important;
  }
</style>
