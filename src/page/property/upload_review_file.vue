<template>
  <div>
    <!-- top -->
    <section class="admin_tool">
      <div class="admin_tool_btn">
        <el-button size="small" @click="gotoBack">
          <i class="fa-chevron-left"></i>
          <span>返回上一级</span>
        </el-button>
      </div>
      <div class="admin_location">
        <el-breadcrumb>
          <el-breadcrumb-item>zip在线预览-文件查看</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </section>
    <section class="file_review">
      <h3>文件预览</h3>
      <span class="file_breadcrumb" v-text="this.curfile_infor.file_name"></span>
      <div class="review_box" v-if="this.curfile_infor.file_name">
        <template v-if="fileTypeNameJudge(this.curfile_infor.file_name).file_type === 'photo' && fileTypeNameJudge(this.curfile_infor.file_name).file_status === 0">
          <img :src="'data:image/jpeg;base64,' + this.curfile_infor.file_content">
        </template>
        <div class="excel_review" v-if="fileTypeNameJudge(this.curfile_infor.file_name).file_type === 'excel' && fileTypeNameJudge(this.curfile_infor.file_name).file_status === 0">
          <!-- 通过a标签download属性，配合href连接('data:application/vnd.ms-excel;base64,' + base64编码)解码来实现文件下载 -->
          <i class="icon_excel"></i>
          <em v-text="this.curfile_infor.file_name"></em>
          <a :download="this.curfile_infor.file_name" :href="requestfileinfor" @click="downloadExcel(curfile_infor.file_content)">
            <el-button type="primary" size="mini">下载表格</el-button>
          </a>
        </div>
        <span v-if="fileTypeNameJudge(this.curfile_infor.file_name).error_name === '无法识别此文件' && fileTypeNameJudge(this.curfile_infor.file_name).file_status === 0">
          <i class="fa-exclamation-circle fa-2x file-icon"></i>
          {{'无法识别此文件'}}
        </span>
        <span v-if="fileTypeNameJudge(this.curfile_infor.file_name).file_type === 'dir' && fileTypeNameJudge(this.curfile_infor.file_name).file_status === 1">
          <i class="fa-file fa-2x file-icon"></i>
          <span v-text="value.filename"></span>
        </span>
      </div>
    </section>
  </div>
</template>
<script>
export default {
  data () {
    return {
      requestfileinfor: null,
      curlocal_infor: {},
      curfile_infor: {}
    }
  },
  created () {
    this.getBaseData()
  },
  methods: {
    gotoBack () {
      window.localStorage.curFileBranchHierarchy-- // 减层级
      var curFileBranchPath = window.localStorage.curFileBranchPath
      var fileObj = JSON.parse(window.localStorage.file_obj)
      if (curFileBranchPath.indexOf('/') !== -1) { // 判断有无／，如果无则是最顶级，清空所有与目录相关的
        var pathArray = curFileBranchPath.split('/') // 减当前目录路径
        var curFilePath = ''
        var curFileObjBranch = {} // 获取当前文件父级对象分支

        for (var i = 0; i < pathArray.slice(0, pathArray.length - 1).length; i++) {
          if (curFilePath === '') {
            curFilePath = pathArray.slice(0, pathArray.length - 1)[i]
          } else {
            curFilePath = curFilePath + '/' + pathArray.slice(0, pathArray.length - 1)[i]
          }

          if (!this.$task.judgeIsNullObj(curFileObjBranch)) { // 初始时直接file_obj赋值
            curFileObjBranch = fileObj[pathArray.slice(0, pathArray.length - 1)[0]]
          } else {
            // 不是初始值在curFileObjBranch中取
            curFileObjBranch = curFileObjBranch[pathArray.slice(0, pathArray.length - 1)[i]]
          }
        }
        window.localStorage.curFileBranchPath = curFilePath

        window.localStorage.curFileObjBranch = JSON.stringify(curFileObjBranch)
      } else {
        window.localStorage.removeItem('curfileIndexDbIndexObj')
        window.localStorage.removeItem('curFileObjBranch')
        window.localStorage.removeItem('curFileBranchPath')
        window.localStorage.removeItem('curFileBranchHierarchy')
      }
      this.$router.go(-1)
    },
    downloadExcel (filecontent) {
      this.requestfileinfor = 'data:application/vnd.ms-excel;base64,' + filecontent
      // var zip = new JSZip()
      // zip.generateAsync({type: 'base64'}).then(function (filecontent) {
      // window.location.href = 'data:application/vnd.ms-excel;base64,' + filecontent
      // })
    },
    fileTypeNameJudge (fileName) {
      if (fileName.indexOf('.') !== -1) {
        var sliptFileNameArr = fileName.split('.')
        if (sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'jpg' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'png' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'jpeg' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'gif'
        ) {
          return { file_status: 0, file_type: 'photo' }
        } else if (sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'xls' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'xlsx' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'xlsm' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'xltx' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'xltm' ||
            sliptFileNameArr[sliptFileNameArr.length - 1].toLowerCase() === 'xlt'
        ) {
          return { file_status: 0, file_type: 'excel' }
        } else {
          return { file_status: 0, error_name: '无法识别此文件' }
        }
      } else {
        return { file_status: 1, file_type: 'dir' }
      }
    },
    getBaseData () {
      window.localStorage.judgeCloseLoadIndexDB = false // 设定判断关闭indexDB加载为false
      var self = this
      var curfileInfo = window.localStorage.curfileIndexDbIndexObj
      this.curlocal_infor = JSON.parse(curfileInfo)
      var indexDB = window.indexedDB

      var curDb = null
      var requestKeys = this.curlocal_infor.index
      var req = indexDB.open('kangruideIndexDB')
      req.onsuccess = function () {
        curDb = req.result // curDb为数据库对象，用来操作数据表，维护数据表
        var tran = curDb.transaction(['upload_review'], 'readwrite')
        var objectStore = tran.objectStore('upload_review')
        console.log(objectStore)
        // var getall = objectStore.getAll()
        // getall.onsuccess = function () {
        //   console.log(getall.result)
        // }
        // 获取游标
        // var cursor = objectStore.openCursor()
        // cursor.onsuccess = function (e) {
        //   var res = e.target.result
        //   if (res) {
        //     console.log(res.key)
        //     console.dir(res.value)
        //     res.continue()
        //     // continue方法将光标移到下一个数据对象，如果当前数据对象已经是最后一个数据了，则光标指向null。
        //   }
        // }
        var getopenfile = objectStore.get(requestKeys)
        getopenfile.onsuccess = function () {
          // console.log(getopenfile.result)
          self.curfile_infor = getopenfile.result
        }
      }
    }
  }
}
</script>
