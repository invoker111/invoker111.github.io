<template>
  <div class="record">
    <div class="list" flex>
      <div class="item" v-for="item in pagedList" :key="item.file" @click="activeInfo=item">
        <a class="time">{{ item.time | time(true) }}</a>
        <div class="img" flex>
          <loading-img v-for="i in item.images" :src="i"/>
        </div>
        <span>{{ item.summary }}</span>
      </div>
    </div>
    <pagination @turn="turnPage" :item-count="this.record.length" :page-now="pageNow" :per-count="perCount"/>
    <detail :info="activeInfo" @close="activeInfo={}"/>
  </div>
</template>

<script>
import {mapState} from "vuex";
import Pagination from "@/components/Pagination";
import LoadingImg from "@/components/LoadingImg";
import Detail from "@/views/record/Detail";

export default {
  name: "index",
  components: {Detail, LoadingImg, Pagination},
  data() {
    return {
      pageNow: 1,
      perCount: 20,
      activeInfo: {}
    }
  },
  computed: {
    ...mapState(['record']),
    pagedList() {
      let start = (this.pageNow - 1) * this.perCount;
      return this.record.slice(start, start + this.perCount)
    }
  },
  methods: {
    turnPage(p) {
      this.pageNow = p;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "src/assets/style/public";

.record{
  width: 90%;
  max-width: 60rem;
  > .list{
    flex-wrap: wrap;
    width: 100%;
    margin: 1rem 0;
    > .item{
      padding: 0.6rem 1rem;
      height: 8rem;
      overflow: hidden;
      position: relative;
      transition: height .15s linear;
      box-shadow: 0 0 1rem rgba(255, 255, 255, 0.6);
      border-radius: 0.2rem;
      background: white;
      cursor: pointer;
      &:hover{
        height: 11rem;
        > .time{
          opacity: 1;
        }
      }
      > .time{
        opacity: 0;
        background: rgba(0, 0, 0, 0.4);
        padding: 0.3rem 1rem;
        font-size: 0.8rem;
        color: white;
        border-radius: 0.3rem;
        right: 0;
        top: 0;
        position: absolute;
        z-index: 2;
      }
      > .img{
        height: 8rem;
        ::v-deep .loading-img{
          height: 100% !important;
          width: unset !important;
          &:not(:last-of-type){
            border-right: 1px solid white;
          }
          img{
            height: 100%;
            width: unset;
            object-fit: contain;
            background: rgba(255, 255, 255, 0.5);
          }
        }
      }
      > span{
        width: calc(100% - 0.4rem);
        padding: 0 0.4rem;
        background: white;
        height: 2.5rem;
        line-height: 1.2rem;
        font-size: 0.8rem;
        @include text-overflow(2)
      }
    }
  }
  > .pagination{
    margin: 1rem 0;
  }
  @include media{
    max-width: 100%;
    width: 100%;
    >.list{
      justify-content: center;
      >.item{
        height: unset;
        width: calc(98% - 2rem);
        &:hover{
          height: unset;
        }
        >.time{
          opacity: 1;
        }
        >.img{
          flex-wrap: wrap;
          height: unset;
          ::v-deep .loading-img{
            height: 100% !important;
            width: calc(50% - 1px) !important;
            &:not(:last-of-type){
              border-right: 1px solid white;
            }
            img{
              height: 100%;
              width: 100%;
              object-fit: contain;
              background: rgba(255, 255, 255, 0.5);
            }
          }
        }
        >span{

        }
      }
    }
  }
}
</style>