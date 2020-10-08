<template>
  <footer flex>
    <router-link :to="{name: 'backend'}" class="favicon" flex title="后台管理">
      <svg-icon :name="'halberd'"/>
    </router-link>
    <div class="social-media" flex>
      <a v-for="k in links" :key="k" target="_blank" :href="config[k]" :title="k" flex>
        <svg-icon :name="k"/>
      </a>
    </div>
    <div class="copyright" flex>
      <span>Copyright (c) {{ config.copyright }} <b write-font>{{ config.name }}</b><b> | {{ domain }}</b></span>
      <span>All right reserved</span>
    </div>
  </footer>
</template>

<script>
import selfImage from '@/image/i.png'
import {mapState} from "vuex";

export default {
  name: "Footer",
  data() {
    return {
      selfImage,
      links: ['github', 'bilibili', 'email']
    }
  },
  computed: {
    ...mapState(['config']),
    domain() {
      return location.hostname
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";

footer{
  width: 100%;
  background: #2b2b2b;
  margin-top: auto;
  height: $footer-height;
  box-shadow: 0 0 1rem #020202;
  z-index: $z-index-footer;
  >.favicon {
    margin: 0 1.6rem;
    height: 3.5rem;
    width: 3.5rem;
    background: #cdcdcd;
    border-radius: 0.5rem;
    justify-content: center;
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.4);
    transition: all .15s linear;
    flex-shrink: 0;
    &:hover{
      background: white;
    }
    > svg{
      height: 90%;
      width: 90%;
    }
  }
  > .social-media{
    > a{
      margin: 0 0.8rem;
      background: white;
      border-radius: 0.25rem;
      padding: 0.2rem 0.4rem;
      justify-content: center;
      transition: all .15s linear;
      &:hover{
        background: #e3e3e3;
      }
      > svg{
        width: 1.4rem;
        height: 1.4rem;
      }
    }
  }
  >.copyright{
      height: 100%;
      justify-content: center;
      flex-direction: column;
      margin: 0 1rem 0 auto;
      > span {
        color: #bbbbbb;
        font-size: 0.8rem;
        margin: 0.5rem 0;

        > b {
          color: #ddd;
        }
      }
  }
  @include media{
    flex-wrap: wrap;
    padding: 1rem 0 0 0;
    height: unset;
    >.copyright{
      width: 100%;
      height: 3.6rem;
      margin: 0;
      justify-content: space-around;
      >span{
        margin: 0;
      }
    }
  }
}
</style>