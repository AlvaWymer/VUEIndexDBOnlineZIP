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
          <el-breadcrumb-item>zip在线预览</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </section>
    <section class="file_review">
      <h3>文件预览</h3>
      <span class="file_breadcrumb" v-text="breadcrumb"></span>
      <ul class="file_review_list">
        <li class="file_list_other" v-for="(value, keys, index) in curFileObjBranch" @click="selectedFile($event)" @dblclick="openfile(value, keys)">
          <template v-if="fileTypeNameJudge(keys).file_type === 'photo' && fileTypeNameJudge(keys).file_status === 0">
            <i class="icon_photo"></i>
            <span v-text="keys"></span>
          </template>
          <template v-if="fileTypeNameJudge(keys).file_type === 'excel' && fileTypeNameJudge(keys).file_status === 0">
            <i class="icon_excel"></i>
            <span v-text="keys"></span>
          </template>
          <template v-if="fileTypeNameJudge(keys).error_name === '无法识别此文件' && fileTypeNameJudge(keys).file_status === 0">
            <i class="icon_errorfile"></i>
            <span v-text="keys"></span>
          </template>
          <template v-if="fileTypeNameJudge(keys).file_type === 'dir' && fileTypeNameJudge(keys).file_status === 1">
            <i class="icon_finder"></i>
            <span v-text="keys"></span>
          </template>
        </li>
      </ul>
    </section>
  </div>
</template>
<script>
export default {
  data () {
    return {
      file_obj: {},
      zipfile_index: {},
      curFileObjBranch: [],
      imgUrlArr: null,
      breadcrumb: this.$store.get('curFileBranchPath')
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
        this.$router.push('/property/uploadreviewdetails')
        this.getBaseData()
      } else {
        window.localStorage.removeItem('curfileIndexDbIndexObj')
        window.localStorage.removeItem('curFileObjBranch')
        window.localStorage.removeItem('curFileBranchPath')
        window.localStorage.removeItem('curFileBranchHierarchy')
        this.$router.go(-1)
      }
    },
    selectedFile (el) {
      let li = document.getElementsByClassName('file_review_list')[0].children
      for (let i = 0, liL = li.length; i < liL; i++) {
        li[i].className = ''
      }
      el.currentTarget.className = 'on'
    },
    openfile (value, keys) {
      window.localStorage.curFileObjBranch = JSON.stringify(value) // 存储当前文件对象分支
      window.localStorage.curFileBranchHierarchy++ // 加层级-即当前目录层级
      var parentPath = window.localStorage.curFileBranchPath // 获取父级路径
      window.localStorage.curFileBranchPath = parentPath + '/' + keys // 当前目录路径
      var curfileIndexDbIndexObj = {} // 存放双击的文件在indexDB中的索引信息对象
      if (this.$task.getType(value) === 'obj') { // 判断是不是对象，是对象则为文件夹
        // 如果为文件夹则存入其对象分支，当前对象在文件对象树上的层级，并跳转至文件列表页面

        window.localStorage.zipfile_index = JSON.stringify(this.zipfile_index) // 存储文件在数组中的索引对象
        this.$router.push('/property/uploadreviewdetails')
        this.getBaseData()
      } else { // 不是对象则为文件
        // 如果为文件则存入其信息，跳转文件处理页面
        curfileIndexDbIndexObj = {index: this.zipfile_index[parentPath + '/' + keys], filename: keys}
        // 把文件索引信息存入localStorage
        window.localStorage.curfileIndexDbIndexObj = JSON.stringify(curfileIndexDbIndexObj)
        this.$router.push('/property/uploadreviewfile')
      }
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
        // return { file_status: 1, error_name: '读取错误' }
      }
    },
    getBaseData () {
      this.zipfile_index = JSON.parse(window.localStorage.zipfile_index) // 存储文件在数组中的索引对象
      this.curFileObjBranch = JSON.parse(window.localStorage.curFileObjBranch) // 获取当前文件对象分支
      window.localStorage.judgeCloseLoadIndexDB = false // 设定判断关闭indexDB加载为false
    }
  }
}
</script>
