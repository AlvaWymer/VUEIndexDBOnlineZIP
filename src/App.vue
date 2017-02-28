<template>
  <div id="app">
  	<!-- 路由出口 -->
	  <!-- 路由匹配到的组件将渲染在这里 -->
    <router-view class="view" keep-alive transition transition-mode="out-in"></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style lang="scss">
  @import "./style/style";
</style>
