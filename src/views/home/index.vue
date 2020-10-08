<template>
  <div class="home" flex>
    <div class="btns" flex>
      <router-link :to="{name: 'article.list'}" flex>
        <svg-icon :name="'article'"/>
        <span class="name">文章</span>
        <span write-font class="tip">"技术"文章</span>
      </router-link>
      <router-link :to="{name: 'record'}" flex>
        <svg-icon :name="'record'"/>
        <span class="name">记录</span>
        <span write-font class="tip">一框琐事</span>
      </router-link>
      <router-link :to="{name: 'msgBoard'}" flex>
        <svg-icon :name="'comments'"/>
        <span class="name">留言板</span>
        <span write-font class="tip">谁的话语</span>
      </router-link>
    </div>
    <div class="info" flex>
      <div class="head" flex>
        <img :src="selfImage"/>
        <span write-font class="name">{{ config.name }}</span>
      </div>
      <div class="body" flex>
        <span write-font>{{ config.describe }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import selfImage from '@/image/i.png'
import {mapState} from "vuex";

export default {
  name: "Home",
  data() {
    return {
      selfImage,
    }
  },
  computed: {
    ...mapState(['config'])
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/style/public";

.home {
  width: 100%;
  height: calc(100% - #{$footer-height});
  justify-content: space-around;
  > .btns {
    flex-direction: column;
    width: 30%;
    justify-content: center;

    > a {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 0.8rem;
      padding: 1rem 1.5rem;
      margin: 1rem 0;
      text-decoration: none;
      transition: all .15s ease-out;
      box-shadow: 0 0 0.8rem rgba(255, 255, 255, 0.6);

      &:hover {
        background: rgba(0, 0, 0, 0.5);

        > .tip {
          width: 6rem;
          opacity: 1;
        }
      }

      > svg {
        width: 2.4rem;
        height: 2.4rem;
      }

      > .name {
        color: white;
        font-size: 1.2rem;
        text-align: center;
        width: 5rem;
      }

      > .tip {
        width: 0;
        transition: all .15s ease-out;
        opacity: 0;
        font-size: 1.05rem;
        color: white;
        word-break: keep-all;
        white-space: nowrap;
        text-align: center;
      }
    }
  }

  > .info {
    width: 70%;
    justify-content: center;
    flex-direction: column;

    > .head {
      > img {
        width: 4rem;
        height: 4rem;
        border-radius: 0.3rem;
        margin-right: 2rem;
      }

      > span {
        padding: 0.6rem 0 0.6rem 2rem;
        font-size: 1.6rem;
        font-weight: bold;
        border-left: 2px solid white;
        color: white;
      }
    }

    > .body {
      margin-top: 1rem;

      > span {
        padding: 1rem;
        background: rgba(255, 255, 255, 0.4);
        word-break: break-all;
        font-size: 1.1rem;
      }
    }
  }
  @include media{
    flex-direction: column;
    justify-content: flex-start;
    >.btns{
      width: 100%;
      margin: 2rem 0;
      >a{
        >.tip{
          width: 6rem;
          opacity: 1;
        }
      }
    }
    >.info{
      width: 95%;
      margin-top: 4rem;
    }
  }
}
</style>