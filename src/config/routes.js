// 子路由索引
import childrouter from '../frame/childrouter.vue'
// zip压缩下载预览
import property from '../page/property/index.vue'
// zip压缩下载预览
import uploadreview from '../page/property/upload_review.vue'
import uploadreviewdetails from '../page/property/upload_review_details.vue'
import uploadreviewfile from '../page/property/upload_review_file.vue'

// 配置路由
export default [
  {
    path: '/',
    component: property
  },
  { // zip压缩下载预览
    path: '/property/',
    component: childrouter,
    children: [
      {path: 'uploadreview', component: uploadreview}, // zip压缩下载预览
      {path: 'uploadreviewdetails', component: uploadreviewdetails}, // zip压缩下载预览深入
      {path: 'uploadreviewfile', component: uploadreviewfile} // zip压缩下载预览文件
    ]
  }
]
