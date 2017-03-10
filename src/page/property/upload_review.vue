<template>
  <div v-loading="loading" element-loading-text="拼命加载中">
    <!-- top -->
    <section class="admin_tool">
      <div class="admin_tool_btn">
        <el-button size="small" @click="gotoBack">
          <i class="fa-chevron-left"></i>
          <span>返回</span>
        </el-button>
      </div>
      <div class="admin_location">
        <el-breadcrumb>
          <el-breadcrumb-item>zip在线预览</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </section>
    <section v-if="nonsupport_indexdb">您的浏览器不支持在线预览，请您下载预览</section>
    <section class="file_review" v-else>
      <h3>文件预览</h3>
      <ul class="file_review_list">
        <li v-for="(valuename, keys, index) in file_obj" @click="selectedFile($event)" @dblclick="openfile(valuename, keys)" :title="keys">
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
import JSZip from 'jszip'
export default {
  data () {
    return {
      upload_review_file_name: [], // 文件名存放
      zipfile_index: {},
      file_obj: {},
      nonsupport_indexdb: false,
      imgUrlArr: null,
      loading: true,
      judgeloaded: 0
    }
  },
  created () {
    window.onunload = function () { // 关闭页面时设定判断关闭加载为true，同时删除数据库
      window.localStorage.judgeCloseLoadIndexDB = true
    }
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB

    if (indexedDB) {
      this.nonsupport_indexdb = false
      if (window.localStorage.judgeCloseLoadIndexDB === 'true') {
        this.getBaseData()
      } else {
        var indexDB = window.indexedDB
        var req = indexDB.open('kangruideIndexDB')
        req.onsuccess = () => {
          var curDb = req.result // curDb为数据库对象，用来操作数据表，维护数据表
          var objectStoreNames = JSON.stringify(curDb.objectStoreNames)

          if (objectStoreNames.indexOf('upload_review') !== -1) {
            this.file_obj = JSON.parse(window.localStorage.file_obj)
            this.zipfile_index = JSON.parse(window.localStorage.zipfile_index) // 存储文件在数组中的索引对象
            this.loading = false
          } else {
            this.getBaseData()
          }
        }
      }
    } else {
      this.$confirm('浏览器不支持在线预览，请进行下载预览', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.nonsupport_indexdb = true
        this.$router.push('/asset/upload_review')
      }).catch(() => {
        this.$alert('取消提交', '提示', {type: 'success'})
      })
    }
  },
  watch: {
    judgeloaded: function () {
      if (this.judgeloaded === 0) {
        this.loading = false
      }
    }
  },
  methods: {
    gotoBack () { // 推出到列表则删除数据库
      window.localStorage.judgeCloseLoadIndexDB = true
      window.localStorage.removeItem('file_obj')
      window.localStorage.removeItem('zipfile_index')
      this.$router.go(-1)
    },
    selectedFile (el) {
      let li = document.getElementsByClassName('file_review_list')[0].children
      for (let i = 0, liL = li.length; i < liL; i++) {
        li[i].className = ''
      }
      el.currentTarget.className = 'on'
    },
    openfile (value, keys) {
      window.localStorage.file_obj = JSON.stringify(this.file_obj) // 存储文件对象树

      window.localStorage.curFileObjBranch = JSON.stringify(value) // 存储当前文件对象分支

      if (!window.localStorage.curFileHierarchy) { // 在localStorage中存储对象在文件对象树上的层级-即当前目录层级
        window.localStorage.curFileBranchHierarchy = 0 // 默认0层
      }
      var curfileIndexDbIndexObj = {} // 存放双击的文件在indexDB中的索引信息对象

      window.localStorage.curFileBranchHierarchy = 1 // 在localStorage中存储对象在文件对象树上的层级-即当前目录层级
      window.localStorage.curFileBranchPath = keys // 在localStorage中存储对象在文件对象树上的层级-即当前目录路径

      if (this.$task.getType(value) === 'obj') { // 判断是不是对象，是对象则为文件夹
        // 如果为文件夹则存入其对象分支，当前对象在文件对象树上的层级，并跳转至文件列表页面

        window.localStorage.zipfile_index = JSON.stringify(this.zipfile_index) // 存储文件在数组中的索引对象
        this.$router.push('/property/uploadreviewdetails')
      } else { // 不是对象则为文件
        // 如果为文件则存入其信息，跳转文件处理页面
        curfileIndexDbIndexObj = {index: this.zipfile_index[keys], filename: keys}
        // 把文件索引信息存入localStorage
        window.localStorage.curfileIndexDbIndexObj = JSON.stringify(curfileIndexDbIndexObj)
        this.$router.push('/property/uploadreviewfile')
      }
      // console.log(window.localStorage.curFileHierarchy)
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
    handleFileName (filename) {
      var returnObj = {}
      var str = ''
      var parentMax = null
      var curParent = null
      // 文件名的处理
      if (filename.indexOf('/') !== -1) {
        var fileNameArr = filename.split('/')
        for (var i = 0; i < fileNameArr.length; i++) {
          if (i === 0) {
            returnObj[fileNameArr[0]] = {}
            parentMax = fileNameArr[0]
          } else {
            if (i === 1) {
              if (this.fileTypeNameJudge(fileNameArr[1]).file_status === 0) {
                returnObj[fileNameArr[0]][fileNameArr[1]] = fileNameArr[1]
              } else {
                returnObj[fileNameArr[0]][fileNameArr[1]] = {}
                curParent = fileNameArr[1]
                str = fileNameArr[1]
              }
            } else {
              str = str + '/' + fileNameArr[i]
            }
          }
        }
      } else {
        // 如果没有'/'则是文件，不是文件夹
        returnObj[filename] = filename
      }
      var firstafter = {}
      if (str !== '') {
        firstafter = this.handleFileName(str)
      }
      if (curParent !== null) {
        returnObj[parentMax] = firstafter
        // console.log(returnObj[parentMax])
      }
      return returnObj
    },
    getBaseData () {
      var self = this
      // var url = 'http://xh.com/api/capital/asset_package?asset_id=' + this.$route.params.id + '&type=insurance_company&is_download=1'
      var url = '/static/lookview.zip'
      var xmlhttp = null
      if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        /* eslint-disable no-new */
        xmlhttp = new window.XMLHttpRequest()
      } else { // code for IE6, IE5
        /* eslint-disable no-new */
        xmlhttp = new window.ActiveXObject('Microsoft.XMLHTTP')
      }
      xmlhttp.open('GET', url, true)
      xmlhttp.withCredentials = true

      // recent browsers
      if ('responseType' in xmlhttp) {
        xmlhttp.responseType = 'arraybuffer'
      }

      // older browser
      if (xmlhttp.overrideMimeType) {
        xmlhttp.overrideMimeType('text/plain; charset=x-user-defined')
      }
      xmlhttp.send()
      xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
          var file = xmlhttp.response || xmlhttp.responseText
          JSZip.loadAsync(file).then(function (zip) {
            zip.forEach(function (relativePath, zipEntry) {
              var fileName = zipEntry.name
              // console.log(zipEntry.name)
              if (zipEntry.name.slice(zipEntry.name.length - 1) !== '/') {
                self.judgeloaded++
                // console.log(zip.folder(zipEntry.name))
                zip.file(zipEntry.name).async('base64').then(function success (text) {
                  var indexDB = window.indexedDB
                  var curDb = null
                  var req = indexDB.open('kangruideIndexDB', 3)
                  req.onupgradeneeded = function () {
                    // 创建表的结构
                    var db = req.result
                    db.createObjectStore('upload_review', {
                      autoIncrement: 'file_id' // 指明当前数据id自增长（indexdb）
                    })
                  }

                  req.onsuccess = function () {
                    // 在成功后对象的result属性为本次申请的结果
                    curDb = req.result // curDb为数据库对象，用来操作数据表，维护数据表
                    var tran = curDb.transaction(['upload_review'], 'readwrite')
                    var objectStore = tran.objectStore('upload_review')
                    // console.log(objectStore)
                    var zipFile = {
                      file_name: fileName,
                      file_content: text
                    }
                    var adduser = objectStore.add(zipFile) // 为当前数据表增加记录
                    adduser.onsuccess = function () {
                      self.zipfile_index[fileName] = adduser.result

                      self.upload_review_file_name.push(fileName)
                      var fileObj = JSON.parse(JSON.stringify(self.file_obj))
                      var fileReturnObj = self.handleFileName(fileName)
                      for (var i in fileReturnObj) {
                        // 先判断这层目录存在与否，如存在则添加，不存在则创建
                        if (fileObj[i]) {
                          fileObj[i] = Object.assign(fileObj[i], fileReturnObj[i])
                        } else {
                          fileObj[i] = fileReturnObj[i]
                        }
                      }
                      self.file_obj = JSON.parse(JSON.stringify(fileObj))
                      self.judgeloaded--
                    }
                  }
                }, function error (e) {
                })
              }
            })
          })
        }
      }
      //  var promise = new Promise(function(resolve, reject) {
      //  if (/* 异步操作成功 */){
      //  resolve(value);
      //  } else {
      //  reject(error);
      //  }
      // });
    }
  }
}
</script>
