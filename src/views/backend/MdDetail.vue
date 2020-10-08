<template>
  <div class="md-detail" flex>
    <div class="operate" flex>
      <div class="back" @click="$router.push({name: 'backend.md'})" flex="">
        <svg-icon :name="'back'"/>
        <span>返回</span>
      </div>
      <a @click="showGuide = true" flex>
        <svg-icon :name="'info'"/>
        markdown语法指南
      </a>
      <loading-button :loading="saving.b" :text="'上传'" :icon="'save'" @click.native="save"/>
      <span class="state">{{ saving.state }}</span>
    </div>
    <div class="head" flex>
      <float-input @input="inputTitle" :name="'标题'" :size="1.3" :value="info.name"/>
      <float-input class="summary" @input="inputSummary" :name="'简介'" :size="1"
                   :value="info.summary"/>
    </div>
    <div class="info" flex>
      <div class="cover">
        <loading-img :src="info.cover" :size="[20, 15]"/>
        <label flex>
          <span>封面链接:</span>
          <input :value="info.cover" @focusout="changeCover"/>
        </label>
      </div>
      <div class="tags-time" flex>
        <div class="tags" flex>
          <span class="tag-icon" flex>
            <svg-icon :name="'tag'"/>
          </span>
          <div v-for="(tag, idx) in info.tags" :class="{editing: tagEditIndex===idx}" :key="tag">
            <input :disabled="tagEditIndex!==idx" @focusout="editTag" :data-old="tag" :data-idx="idx" :value="tag"/>
            <div flex="">
              <span @click="clickTrash(idx)" title="删除">
                <svg-icon :name="'trash'"/>
              </span>
              <span @click="clickEdit" :data-idx="idx" title="编辑">
                <svg-icon :name="'edit'"/>
              </span>
            </div>
          </div>
          <span class="add" @click="addTag" title="添加标签" flex>
            <svg-icon :name="'add'"/>
          </span>
        </div>
        <div class="time" flex>
          <span><span>创建:</span>{{ (info ? info.time : 0) | time(false) }}</span>
          <span><span>修改:</span>{{ (info ? info.modifyTime : 0) | time(false) }}</span>
        </div>
      </div>
    </div>
    <div class="text" flex ref="text">
      <div class="markdown" :style="{width: mdWidth}" flex>
        <div ref="textarea" class="textarea"></div>
      </div>
      <resizer :orient="'h'" @start="startResize" @resize="doResize"/>
      <div class="html" flex>
        <span class="--markdown" v-html="htmlText"></span>
      </div>
    </div>
    <markdown-help v-show="showGuide" @click.native.self="showGuide=false"/>
  </div>
</template>

<script>
import {originPrefix} from "@/main";
import {getText, parseAjaxError, parseMarkdown, sortByTime} from "@/utils";
import {mapState} from 'vuex'
import FloatInput from "@/components/FloatInput";

import LoadingButton from "@/components/LoadingButton";


import CodeMirror from 'codemirror';
import 'codemirror/mode/markdown/markdown';

import 'codemirror/lib/codemirror.css';
import '@/assets/style/code-mirror/codeMirror.scss';

import '@/assets/style/code-mirror/light-markdown.scss';
import '@/assets/style/code-mirror/dracula-markdown.scss';
import Resizer from "@/components/Resizer";
import MarkdownHelp from "@/views/block/MarkdownHelp";
import LoadingImg from "@/components/LoadingImg";

export default {
  name: "MdDetail",
  components: {LoadingImg, MarkdownHelp, Resizer, LoadingButton, FloatInput},
  data() {
    return {
      showGuide: false,
      tagEditIndex: -1,
      mdText: '',
      codeMirror: null,
      mdWidth: '40%',
      resizeStart: {
        pos: false,
        size: false
      },
      saving: {
        b: false,
        state: ''
      },
      info: {},
      newInfo: {
        name: "编辑标题",
        file: "",
        cover: "",
        time: "",
        modifyTime: "",
        summary: "编辑简介",
        tags: []
      },
    }
  },
  computed: {
    ...mapState(['gitUtil', 'md']),
    id() {
      return this.$route.params.id
    },
    htmlText() {
      return parseMarkdown(this.mdText)
    }
  },
  async mounted() {
    await this.init()
  },
  watch: {
    async $route() {
      if (this.$route.name === 'backend.md.detail') {
        await this.init()
      }
    }
  },
  methods: {
    async init() {
      // 初始化信息
      this.info = JSON.parse(JSON.stringify(this.id === 'new' ? this.newInfo : this.md.find(v => v.file === this.id)));
      this.mdText = '';
      // 标题
      document.title = '后台-文章-' + this.id;
      if (this.$route.params.id !== 'new') {
        await this.getMdText()
      }
      this.codeMirror = new CodeMirror(this.$refs.textarea, {
        indentUnit: 2,
        tabSize: 2,
        theme: 'dracula',
        lineNumbers: true,
        line: true,
        mode: 'markdown',
      });
      this.codeMirror.on('change', () => {
        this.mdText = this.codeMirror.getValue()
      });
      this.codeMirror.setValue(this.mdText);
    },
    async getMdText() {
      let res = await getText(`${originPrefix}/md/${this.id}/index.md`);
      if (res[0]) {
        this.mdText = res[1];
      } else {
        this.$message.error(parseAjaxError(res[1]))
      }
    },

    inputTitle(payload) {
      this.info.name = payload[1]
    },
    inputSummary(payload) {
      this.info.summary = payload[1]
    },
    changeCover(e) {
      this.info.cover = e.target.value;
    },
    clickTrash(idx) {
      this.info.tags.splice(idx, 1)
    },
    clickEdit(e) {
      let span = e.currentTarget;
      this.tagEditIndex = parseInt(span.getAttribute('data-idx'));
      this.$nextTick(() => {
        span.parentElement.previousElementSibling.focus()
      })
    },
    editTag(e) {
      let info = this.info,
          input = e.target;
      this.tagEditIndex = -1;
      for (let i of info.tags) {
        if (i !== input.getAttribute('data-old') && i === input.value) {
          return this.$message.warning('标签不能重复!');
        }
      }
      info.tags.splice(parseInt(input.getAttribute('data-idx')), 1, input.value);
    },
    addTag() {
      this.info.tags.push('输入标签' + this.info.tags.length)
    },
    startResize (startPos){
      this.resizeStart = {
        pos: startPos,
        size: this.$refs.text.querySelector('.markdown').scrollWidth
      };
    },
    doResize (delta){
      let parentWidth = this.$refs.text.scrollWidth;
      let newSize = this.resizeStart.size + (delta-this.resizeStart.pos);
      if (newSize > parentWidth/5 && newSize < parentWidth*4/5){
        this.mdWidth = `${newSize}px`;
      }
    },
    async save() {
      if (this.saving.b) return;
      if (this.gitUtil) {
        let info = this.info;
        if (!info.name || !info.summary || !info.tags.length || !info.cover) {
          return this.$message.warning('标题,简介,标签和封面均不能为空!')
        }
        this.saving = {
          b: true,
          state: '保存中...'
        };
        let folderId = new Date().getTime();
        info.modifyTime = folderId;
        if (this.id !== 'new') {
          // 不改folder
          folderId = this.id;
        } else {
          // 添加
          // md +1
          info.file = folderId.toString();
          info.time = folderId;
          this.md.push(JSON.parse(JSON.stringify(info)));
        }
        // 执行更新
        // 更新本地md
        for (let i in this.md) {
          if (this.md[i].file === this.id) {
            this.md[i] = info;
            break
          }
        }
        this.saving.state = '更新:md.json';
        sortByTime(this.md);
        let res = await this.gitUtil.updateJsonFile('md.json', this.md);
        if (res[0]) {
          // 更新 md 和 html文件
          let res = await this.gitUtil.updateMd({
            folder: folderId,
            md: this.mdText,
            html: this.htmlText
          }, this.saving);
          if (res[0]) {
            this.$message.success('上传成功!');
            await this.$router.push({name: 'backend.md'})
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

.md-detail {
  flex-direction: column;
  position: relative;

  > .operate{
    margin-bottom: 0.5rem;
    justify-content: space-between;
    width: calc(100% - 0.5rem);
    padding: 0.2rem 0.2rem 0 0.2rem;
    flex-wrap: wrap;
    > .back{
      cursor: pointer;
      padding: 0.4rem 0.8rem;
      border-radius: 0.2rem;
      box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
      justify-content: center;
      background: #ff8595;
      transition: all .15s linear;

      &:hover {
        background: #ee647e;
      }

      > svg {
        width: 1.4rem;
        height: 1.4rem;
      }

      > span {
        font-size: 0.9rem;
        margin-left: 0.5rem;
      }
    }

    > a {
      font-size: 0.9rem;
      cursor: pointer;

      &:hover {
        color: #ff3c00;
        text-decoration: underline;

        > svg {
          fill: #ff3c00;
        }
      }

      > svg {
        width: 1.2rem;
        height: 1.2rem;
        margin-right: 0.8rem;
      }
    }

    > ::v-deep .loading-button {
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
    > .state{
      width: 100%;
      text-align: right;
      color: red;
      height: 1rem;
      font-size: 0.8rem;
      padding: 0.2rem 0;
    }
  }

  > .head {
    flex-direction: column;
    margin: 3rem 0;
    width: 100%;

    > .float-input {
      width: 60%;

      ::v-deep input {
        text-align: center !important;
      }

      &.summary {
        margin-top: 3rem;
        width: 70%;
      }
    }
  }

  > .info {
    width: 100%;
    justify-content: space-around;
    align-items: stretch;

    > .cover {
      margin: 0 2rem;
      border-radius: 0.8rem;
      padding: 0.5rem;
      justify-content: space-around;
      flex-direction: column;
      border: 1px solid gray;
      box-shadow: 0 0 0.8rem rgba(0, 0, 0, 0.15);
      ::v-deep .loading-img{
        img{
          object-fit: contain;
        }
      }
      > label {
        margin: 1rem 0 0.5rem 0;

        > span {
          font-size: 0.88rem;
          margin-right: 0.5rem;
        }

        > input {
          border: 1px solid gray;
          padding: 0.15rem;
          font-size: 0.95rem;
        }
      }
    }

    > .tags-time {
      flex-direction: column;
      flex-grow: 1;

      > .tags {
        align-content: start;
        flex-wrap: wrap;

        > .tag-icon {
          margin-right: 2rem;

          > svg {
            width: 2.6rem;
            height: 2.6rem;
          }
        }

        > div {
          margin: 1rem 0.8rem;
          border-radius: 0.2rem;
          justify-content: center;
          position: relative;
          height: 2.5rem;
          box-shadow: 0 0 0.6rem rgba(0, 0, 0, 0.26);

          > input {
            font-size: 0.96rem;
            width: 12rem;
            height: 100%;
            border-radius: inherit;
            text-align: center;
            background: white;
            color: black;
            border: 1px solid gray;
            transition: all .2s linear;

            &:disabled {
              color: white;
              width: 6rem;
              background: #3e41ff;
              border-color: transparent;
            }
          }

          > div {
            display: none;
            position: absolute;
            border-radius: inherit;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            justify-content: space-around;
            background: rgba(0, 0, 0, 0.4);

            > span {
              cursor: pointer;
              padding: 0.15rem 0.4rem;
              border-radius: 0.2rem;

              &:hover {
                background: rgba(255, 255, 255, 0.31);
              }

              > svg {
                width: 1.4rem;
                height: 1.4rem;
              }
            }
          }

          &:not(.editing):hover {
            > div {
              display: flex;
            }
          }
        }

        > .add {
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          background: #ffc722;
          justify-content: center;
          margin-left: 1rem;
          box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);

          &:hover {
            background: #eab61f;
          }

          > svg {
            width: 1.2rem;
            height: 1.2rem;
            fill: white;
          }
        }
      }

      > .time {
        width: 100%;
        height: 3rem;
        justify-content: space-around;
        margin-top: auto;

        > span {
          color: #0003ff;
          font-size: 0.9rem;

          > span {
            font-size: 0.9em;
            color: black;
            margin-right: 0.5rem;
          }
        }
      }
    }
  }

  > .text {
    margin: 1rem 0 0.4rem 0;
    width: 99%;
    max-height: 50rem;
    min-height: 10rem;
    align-items: stretch;
    border: 1px solid #656565;

    > .markdown {
      align-items: stretch;
      flex-shrink: 0;

      > .textarea {
        width: 100%;

        > ::v-deep .CodeMirror {
          height: 100%;
          font-size: 0.9rem;
        }
      }
    }
    > ::v-deep .resizer{
      background: #828282;
      width: 0.3rem;
      flex-shrink: 0;
      &[resizing]{
        background: #505050;
      }
    }
    > .html {
      overflow-y: auto;
      display: block;
      flex-grow: 1;

      > span {
        display: block;
        word-break: break-all;
        white-space: pre-line;
        width: 100%;
      }
    }
  }
  @include media{
    width: 99% !important;
    margin-left: 0.5% !important;
    > .info {
      flex-direction: column;
      >.cover{
        ::v-deep .loading-img{
          width: 100% !important;
        }
      }
    }
  }
}
</style>