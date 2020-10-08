<template>
  <section class="the-head">
    <div class="body" flex>
      <router-link class="favicon" :to="{name: 'home'}">
        <img :src="selfImage"/>
      </router-link>
      <b class="txt" @mouseenter="toggle(true)" @mouseleave="toggle(false)" flex>
        Simple Code,Simple Life
      </b>
    </div>
  </section>
</template>

<script>
import Headroom from "headroom.js";
import selfImage from '@/image/i.png'

export default {
  name: "TheHead",
  data() {
    return {
      selfImage,
    }
  },
  mounted() {
    new Headroom(this.$el, {
      offset: this.$el.scrollHeight,
      scroller: document.querySelector('section.body')
    }).init()
  },
  methods: {
    toggle(b) {
      this.$emit('toggle', b)
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";
.the-head {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: $head-height;
  background: rgba(0, 0, 0, 0.1);
  transition: all .15s linear;
  z-index: $z-index-head;
  &.headroom--unpinned{
    background: rgba(0, 0, 0, 0.6);
  }
  &:hover{
    background: rgba(0, 0, 0, 0.3);
  }
  &.show-bg{
    background: transparent !important;
    .favicon{
      opacity: 0 !important;
    }
  }
  > .body{
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    justify-content: space-between;
    > .favicon{
      margin-left: 1rem;
      height: 88%;
      border-radius: 0.4rem;
      box-shadow: 0 0 0.4rem rgba(255, 255, 255, 0.3);
      >img{
        border-radius: inherit;
        height: 100%;
        object-fit: contain;
      }
    }
    > .txt{
      margin: 0 1rem 0 auto;
      height: 100%;
      color: white;
      cursor: pointer;
      font-size: 0.95rem;
      font-family: "Source Code Pro", serif;
    }
  }
}
</style>