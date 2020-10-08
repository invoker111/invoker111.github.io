<template>
  <div class="article">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "index",
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="scss">
.article {
  width: 100%;
  min-height: 100%;
  position: relative;
  flex-shrink: 0;
}
</style>