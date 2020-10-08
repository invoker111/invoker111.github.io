<template>
  <div class="record-detail" v-if="info.hasOwnProperty('images')" is-dialog @click.self="$emit('close')">
    <div class="inner">
      <a @click="$emit('close')">关闭</a>
      <div class="image" flex>
        <loading-img v-for="i in info.images" :src="i"/>
      </div>
      <span write-font>{{ text }}</span>
    </div>
  </div>
</template>

<script>
import LoadingImg from "@/components/LoadingImg";
import {getText, parseAjaxError} from "@/utils";
import {originPrefix} from "@/main";

export default {
  name: "Detail",
  components: {LoadingImg},
  props: {
    info: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      text: ''
    }
  },
  watch: {
    async info() {
      let res = await getText(`${originPrefix}/record/${this.info.file}.txt`);
      if (res[0]) {
        this.text = res[1]
      } else {
        this.$message.error(parseAjaxError(res[1]))
        this.text = ''
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";

.record-detail{
  > .inner{
    width: 80%;
    height: 90%;
    overflow-y: auto;
    > .image{
      width: 100%;
      flex-wrap: wrap;
      ::v-deep .loading-img{
        width: calc(50% - 2rem) !important;
        height: 15rem !important;
        margin: 1rem;
        &:not(:last-of-type){
          border-bottom: 1px solid white;
        }
        img{
          object-fit: contain;
        }
      }
    }
    > span{
      width: 95%;
      border-top: 1px solid gray;
      font-size: 0.95rem;
      margin: 1rem 0 5rem 0;
      white-space: pre-wrap;
      padding-top: 0.8rem;
    }
    >a{
      display: none;
    }
  }
  @include media{
    >.inner{
      width: 100%;
      height: calc(100% - #{$head-height});
      position: absolute;
      top: $head-height;
      border-radius: 0;
      >a{
        display: flex;
        position: fixed;
        right: 0;
        top: $head-height;
        background: rgba(255, 0, 0, 0.6);
        color: white;
        padding: 0.3rem 1rem;
        font-size: 0.95rem;
        z-index: 2;
      }
    }
  }
}
</style>