<template>
  <div class="back-end">
    <div class="menu" :class="{hide: !showMenu}" flex>
      <div class="pendant" flex="">
        <span class="toggle-menu" :class="{opened: showMenu}" @click="toggleMenu">
          <svg viewBox="0 0 100 100">
            <path class="line line1"
                  d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"/>
            <path class="line line2" d="M 20,50 H 80"/>
            <path class="line line3"
                  d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"/>
          </svg>
        </span>
        <router-link class="home" :to="{name: 'home'}" flex="">
          <img :src="selfImage"/>
        </router-link>
      </div>
      <router-link v-for="item in menu" :key="item.name" :to="{name: item.pathName}"
                   :class="{active: $route.name.indexOf(item.pathName)===0}" class="item" flex>
        <span class="icon">
          <svg-icon :name="item.icon"/>
        </span>
        <span class="name">{{ item.name }}</span>
      </router-link>
      <loading-button class="update" :loading="updating" :text="'更新'" :icon="'update'" @click.native="getConfig"/>
      <loading-button :icon="'account'" :text="'登录'" @click.native="showLogin = true"/>
    </div>
    <login v-show="showLogin" @save="loginFinish" @hide="showLogin = false"/>
    <div class="body">
      <keep-alive>
        <router-view @login="showLogin = true"></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Login from "./Login";
import {getText, parseAjaxError} from "@/utils";
import LoadingButton from "@/components/LoadingButton";
import {originPrefix} from "@/main";
import selfImage from '@/image/i.png'

export default {
  name: "index",
  components: {LoadingButton, Login},
  data() {
    return {
      selfImage,
      showMenu: true,
      showLogin: false,
      updating: false,
      menu: [
        {
          name: '配置',
          pathName: 'backend.config',
          icon: 'config'
        },
        {
          name: '文章',
          pathName: 'backend.md',
          icon: 'article'
        },
        {
          name: '记录',
          pathName: 'backend.record',
          icon: 'record'
        },
        {
          name: '主题',
          pathName: 'backend.theme',
          icon: 'brash'
        },
      ]
    }
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu
    },
    loginFinish(withUpdate) {
      this.showLogin = false;
      if (withUpdate) {
        this.getConfig()
      }
      this.$message.success('保存成功!')
    },
    async getConfig() {
      if (this.updating) return;
      this.updating = true;
      let res = await getText(`${originPrefix}/config.json`);
      if (res[0]) {
        this.$store.commit('updateJson', {
          key: 'config',
          json: JSON.parse(res[1])
        });
        this.$message.success('从服务器获取配置成功!')
      } else {
        this.$message.error(parseAjaxError(res[1]))
      }
      this.updating = false
    },
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";

.back-end {
  width: 100%;
  height: 100%;
  position: relative;
  flex-shrink: 0;
  $menu-width: 9rem;

  > .menu {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: $menu-width;
    background: rgba(43, 43, 48, 0.92);
    flex-direction: column;
    box-shadow: 0 0 0.8rem rgba(75, 75, 75, 0.5);
    z-index: $z-index-body+1;
    transition: all .2s ease-out;

    &.hide {
      transform: translateX(-100%);

      ~ .body {
        width: 100%;
      }
    }

    > .pendant {
      position: absolute;
      top: 0;
      left: 100%;
      flex-direction: column;
      background: black;

      > .toggle-menu, > .home {
        width: 2.2rem;
        height: 2.2rem;
      }

      > .toggle-menu {
        > svg {
          box-shadow: 0 0 0.4rem #00000063;
          cursor: pointer;
          transition: background .1s linear;

          &:hover {
            background: #1e1e1e;
          }

          > .line {
            fill: none;
            stroke: #00ffff;
            stroke-width: 6;
            transition: stroke-dasharray .4s cubic-bezier(0.4, 0, 0.2, 1), stroke-dashoffset .4s cubic-bezier(0.4, 0, 0.2, 1);
            @each $i, $n in (1, 207), (2, 60), (3, 207) {
              &.line#{$i} {
                stroke-dasharray: 60 $n;
              }
            }
          }
        }

        @each $i, $n, $s in (1, -134, 90 207), (2, -30, 1 60), (3, -134, 90 207) {
          &.opened > svg > .line#{$i} {
            stroke-dasharray: $s;
            stroke-dashoffset: $n;
          }
        }
      }

      > .home {
        > img {
          width: 100%;
          height: 100%;
        }
      }
    }

    > .item {
      font-size: 1rem;
      color: black;
      text-decoration: none;
      justify-content: center;
      padding: 1rem 0;
      width: calc(100% - 0.2rem);
      border-left: 0.2rem solid transparent;

      &.active {
        background: rgb(31, 31, 31, 0.87);
        border-color: #5fff88;
      }

      &:not(.active):hover {
        background: rgba(255, 255, 255, 0.15);
      }

      > .icon {
        width: 2.2rem;
        height: 2.2rem;
        display: flex;

        > svg {
          width: 100%;
          height: 100%;
        }
      }

      > .name {
        margin-left: 1rem;
        color: white;
      }
    }

    ::v-deep .loading-button {
      background: #ac60ff;
      margin-bottom: 1rem;

      &:not(.loading):hover {
        background: #8c8e8d;
      }

      &.update {
        background: #4a91ff;
        margin: auto 0 1rem 0;
      }

      &.loading {
        background: #8c8e8d;
      }
    }
  }

  > .body{
    position: absolute;
    width: calc(100% - #{$menu-width});
    height: 100%;
    overflow-y: auto;
    right: 0;
    top: 0;
    align-items: flex-start;
    transition: all .2s ease-out;
    > div{
      background: white;
      width: calc(100% - 4rem);
      margin: 1rem 1rem 1rem 3rem;
      border-radius: 0.6rem;
      box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    }
  }
  ::v-deep .check-box{
    display: block;
    width: 1.5rem;
    height: 1.5rem;
    cursor: pointer;
    border: 1px solid gray;
    border-radius: 50%;
    &.active{
      background: #ff3700;
    }
  }
  ::v-deep .single-button.del-btn{
    border-radius: 0.2rem;
    background: #ff344f;
    width: 2.4rem;
    margin: 0 0.5rem;
    &[deleting]{
      background: #727272;
      cursor: not-allowed;
    }
    &:not([deleting]):hover{
      background: #f1314a;
    }
  }
}
</style>