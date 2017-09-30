<template>
  <el-row class="m-tree">
    <el-tree :data="treeData" show-checkbox node-key="id" default-expand-all ref="tree" :props="defaultProps">
    </el-tree>
    <el-col :span="24" style="text-align: center;margin-top: 15px;">
      <el-button type="info" @click="confirm">确定</el-button>
      <el-button @click="close">取消</el-button>
    </el-col>
  </el-row>
</template>
<script>
    export default {
      props:['powerData'],
      data () {
        return {
          treeData: [],
          defaultProps: {
            children: "childResources",
            label: "resName"
          }
        }
      },
      watch:{
        'powerData.id'(val, oldVal){
          if(val){
            this.getRoleResources();
          }
        }
      },
      beforeMount(){
        this.getTreeData();
        this.getRoleResources();
      },
      methods:{
        setCheckedKeys(keys) {
          keys.map((val, index) =>{
            let noExits = false;
            this.treeData.some((tItem, tkey)=>{
              //父节点id存在时，判断其子节点是否都被选中，若没有全选中，则去掉该父节点
              if(tItem.id == val && tItem.parentId == 0 && tItem.childResources.length){
                let ids = [];
                tItem.childResources.map((child, k)=>{
                  ids.push(child.id)
                })
                ids.some((v, k)=>{
                  if(keys.indexOf(v) < 0){
                    noExits = true;
                    return;
                  }
                })
                return;
              }
            })
            if(noExits){
              keys.splice(index, 1);
            }
          })
          this.$refs.tree.setCheckedKeys(keys);
        },
        getRoleResources(){
          let config = {
            url: '/mresource/getRoleResources',
            data: {
              "compId": this.COMPID,
              "roleId": this.powerData.id,
            }
          };
          this.axios(config).then((res)=>{
              if(res.data.code){
                let list = res.data.data, keys=[];
                list && list.length && list.map((item,key)=>{
                  keys.push(item.id);
                })
                this.setCheckedKeys(keys);
              }
            }).catch((error)=>{
              console.log(error);
            });
        },
        getTreeData(){
          this.axios.post('/mresource/getAllResources').then( (res)=> {
            if(res.data.code){
              this.treeData = res.data.data;
            }
          }).catch((error)=> {
            console.log(error);
          });
        },
        confirm(){
          let config = {
            url: '/mrole/roleAwardResource',
            data: {
              "compId": this.COMPID,
              "roleId": this.powerData.id,
              "resourceId": this.$refs.tree.getCheckedKeys(),
            }
          };
          this.axios(config).then((res)=> {
            if(res.data.code){
              this.close();
            }else {
              this.$message({
                type: 'error',
                message: res.data.msg,
                duration: 1500
              });
            }
          }).catch((error)=>{
            console.log(error);
          });
        },
        close(){
          this.$emit('powerStatus');
        }
      }
    }
</script>