<template>
  <div class="record-detail" flex>
    <div class="operate" flex>
      <div class="back" @click="$router.push({name: 'backend.record'})" flex>
        <svg-icon :name="'back'"/>
        <span>返回</span>
      </div>
      <span class="state">{{ saving.state }}</span>
      <loading-button :loading="saving.b" :text="'上传'" :icon="'save'" @click.native="save"/>
    </div>
    <div class="time" flex>
      <span><span>创建:</span>{{ (info ? info.time : 0) | time(false) }}</span>
      <span><span>修改:</span>{{ (info ? info.modifyTime : 0) | time(false) }}</span>
    </div>
    <div class="edit">
      <div class="images" flex>
        <span class="head" flex>
          <svg-icon :name="'picture'"/>
          封面
        </span>
        <div class="item" v-for="(i,idx) in info.images" :key="idx" flex>
          <loading-img :src="i" :size="[12, 8]"/>
          <div class="bottom" flex>
            <input :value="i" :data-idx="idx" @focusout="editImg"/>
            <single-button class="del-btn" @click.native="delImg(idx)" :text="'删除'"/>
          </div>
        </div>
        <span class="add" @click="addImg" flex>
          <svg-icon :name="'add'"/>
        </span>
      </div>
      <div class="text">
        <p>文本:</p>
        <textarea v-model="text"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import LoadingButton from "@/components/LoadingButton";
import LoadingImg from "@/components/LoadingImg";
import SingleButton from "@/components/Button";
import {getText, parseAjaxError, sortByTime} from "@/utils";
import {originPrefix} from "@/main";

export default {
  name: "RecordDetail",
  components: {SingleButton, LoadingImg, LoadingButton},
  data() {
    return {
      saving: {
        b: false,
        state: ''
      },
      text: '',
      info: {},
      newInfo: {
        file: '',
        time: 0,
        modifyTime: 0,
        summary: '',
        images: []
      },
    }
  },
  computed: {
    ...mapState(['record', 'gitUtil']),
    id() {
      return this.$route.params.id
    },
  },
  async mounted() {
    await this.init()
  },
  watch: {
    async $route() {
      if (this.$route.name === 'backend.record.detail') {
        await this.init()
      }
    }
  },
  methods: {
    async init() {
      this.info = JSON.parse(JSON.stringify(this.id === 'new' ? this.newInfo : this.record.find(v => v.file === this.id)));
      if (this.id !== 'new') {
        let res = await getText(`${originPrefix}/record/${this.id}.txt`);
        if (res[0]) {
          this.text = res[1]
        } else {
          this.$message.error(parseAjaxError(res[1]))
        }
      }
    },
    delImg(idx) {
      this.info.images.splice(idx, 1)
    },
    editImg(e) {
      this.info.images.splice(parseInt(e.target.getAttribute('data-idx')), 1, e.target.value)
    },
    addImg() {
      this.info.images.push('')
    },
    async save() {
      if (this.saving.b) return;
      if (this.gitUtil) {
        let info = this.info;
        if (!info.images.length) {
          return this.$message.warning('封面不能为空!')
        }
        this.saving = {
          b: true,
          state: '保存中...'
        };
        // summary
        info.summary = this.text.substr(0, 30) + (this.text.length >= 30 ? '... ...' : '')
        let file = new Date().getTime();
        info.modifyTime = file;
        if (this.id !== 'new') {
          // 不改file
          file = this.id;
        } else {
          // 添加
          // record +1
          info.time = file;
          info.file = file.toString();
          this.record.push(JSON.parse(JSON.stringify(info)));
        }
        // 执行更新
        // 更新本地record
        for (let i in this.record) {
          if (this.record[i].file === this.id) {
            this.record[i] = info;
            break
          }
        }
        this.saving.state = '更新:record.json'
        sortByTime(this.record)
        let res = await this.gitUtil.updateJsonFile('record.json', this.record);
        if (res[0]) {
          // 更新 txt 文件
          let res = await this.gitUtil.updateRecord({
            file: file,
            txt: this.text
          }, this.saving);
          if (res[0]) {
            this.$message.success('上传成功!');
            await this.$router.push({name: 'backend.record'})
          } else {
            this.$message.error(parseAjaxError(res[1]))
          }
        } else {
          this.$message.error(parseAjaxError(res[1]))
        }
        this.saving = {
          b: false,
          state: ''
        }
      } else {
        this.$message.warning('请先登录!');
        this.$emit('login')
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";

.record-detail{
  flex-direction: column;
  > .operate{
    margin-bottom: 0.5rem;
    justify-content: space-between;
    width: calc(100% - 0.5rem);
    padding: 0.2rem 0.2rem 0 0.2rem;
    > .back{
      cursor: pointer;
      padding: 0.4rem 0.8rem;
      border-radius: 0.2rem;
      box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
      justify-content: center;
      background: #ff8595;
      transition: all .15s linear;

      &:hover{
        background: #ee647e;
      }

      > svg{
        width: 1.4rem;
        height: 1.4rem;
      }

      > span{
        font-size: 0.9rem;
        margin-left: 0.5rem;
      }
    }
    > .state{
      color: red;
      height: 1rem;
      font-size: 0.8rem;
    }
    > ::v-deep .loading-button{
      padding: 0.4rem 0.8rem;
      background: #66dded;
      box-shadow: 0 0 0.3rem #00000078;
      color: black;
      &:not(.loading):hover{
        background: #62c7db;
      }
      &.loading{
        background: gray;
        color: white;
      }
    }
  }
  > .time{
    width: 60%;
    height: 3rem;
    justify-content: space-around;
    margin-left: auto;

    > span{
      color: #0003ff;
      font-size: 0.9rem;

      > span{
        font-size: 0.9em;
        color: black;
        margin-right: 0.5rem;
      }
    }
  }
  > .edit{
    margin: 1rem;
    width: calc(100% - 2rem);
    > .images{
      flex-wrap: wrap;
      > .head{
        margin-right: 1rem;
        font-size: 0.95rem;
        > svg{
          width: 2.6rem;
          height: 2.6rem;
          margin-right: 0.5rem;
        }
      }
      > .item{
        flex-direction: column;
        margin: 0.6rem 1rem;
        > .bottom{
          margin-top: 0.5rem;
          > input{
            width: 8rem;
            font-size: 0.85rem;
            padding: 0.2rem;
          }
        }
      }
      > .add{
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        background: #ffc722;
        justify-content: center;
        margin-left: 1rem;
        box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);

        &:hover{
          background: #eab61f;
        }

        > svg{
          width: 1.2rem;
          height: 1.2rem;
          fill: white;
        }
      }
    }
    > .text{
      width: 95%;
      padding: 0 2.5%;
      margin: 2rem 0;
      > p{
        font-size: 1.1rem;
        margin-bottom: 1rem;
      }
      > textarea{
        width: calc(100% - 0.6rem);
        min-height: 10rem;
        font-size: 0.95rem;
        padding: 0.3rem;
      }
    }
  }
  @include media{
    width: 99% !important;
    margin-left: 0.5% !important;
  }
}
</style>