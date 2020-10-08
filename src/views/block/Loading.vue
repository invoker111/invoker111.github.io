<template>
  <transition name="fade">
    <div v-show="loading" class="loading" flex>
      <svg-icon :name="'loading'"/>
    </div>
  </transition>
</template>

<script>
import {mapState} from "vuex";

export default {
  name: "Loading",
  data() {
    return {}
  },
  computed: {
    ...mapState(['loading'])
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";

.loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: $z-index-loading;
  background: rgba(255, 255, 255, 0.9);
  justify-content: center;
  transition: opacity .5s;

  &.fade-enter, &.fade-enter-to, &.fade-leave {
    opacity: 1;
  }

  &.fade-leave-to {
    opacity: 0;
  }

  > svg {
    width: 4rem;
    height: 4rem;
  }
}
</style>