<template>
  <div class="list" flex>
    <div ref="list" class="items" flex>
      <div class="item" v-for="item in items" :key="item.id" flex>
        <a class="avatar" target="_blank" :href="item.site">
          <img :src="item.avatar"/>
        </a>
        <div flex>
          <div class="body" flex>
            <div class="head" flex>
              <a :href="item.site" target="_blank">{{ item.nick }}</a>
            </div>
            <div class="content">
              <span class="--markdown" v-html="calcMdToHtml(item.content, false)"></span>
            </div>
            <div class="foot">
              <a class="time">{{ item.time | time(false) }}</a>
              <span class="reply" @click="clickReply(item, null)">回复</span>
              <span v-if="login===item.nick||login===siteConfig.owner" class="delete"
                    @click="closeComment(item.id)">删除</span>
              <write-comment v-if="replayItem === item && replyChild === null" :cancel="true"
                             :init-height="'100px'" :loading="submitting"
                             @cancel="replayItem = null" @submit="replayComment"/>
            </div>
          </div>
          <div v-if="item.children.length" class="children">
            <div v-for="child in item.children" class="child">
              <div class="content" flex>
                <a :href="child.site" class="avatar" target="_blank">
                  <img :src="child.avatar"/>
                </a>
                <div>
                  <a :href="child.site" target="_blank">{{ child.nick }}</a>
                  <span class="--markdown" v-html="calcMdToHtml(child.content, true)"></span>
                </div>
              </div>
              <div class="foot">
                <a class="time">{{ child.time | time(false) }}</a>
                <span class="reply" @click="clickReply(item, child)">回复</span>
                <span v-if="login===child.nick||login===siteConfig.owner" class="delete"
                      @click="deleteReply(child.id)">删除</span>
                <write-comment v-if="replayItem === item && replyChild === child" :cancel="true"
                               :init-height="'100px'"
                               :loading="submitting" @cancel="replayItem = null" @submit="replayComment"/>
              </div>
            </div>
            <div class="page" v-if="item.page.hasPreviousPage&&item.page.hasNextPage" flex>
              <span :disabled="!item.page.hasPreviousPage" class="left" flex
                    @click='toReply(!item.page.hasPreviousPage, item, `,before: "${item.page.startCursor}"`)'><svg-icon
                  :name="'right'"/></span>
              <span :disabled="!item.page.hasNextPage" class="right" flex
                    @click='toReply(!item.page.hasNextPage, item, `,after: "${item.page.endCursor}"`)'><svg-icon
                  :name="'right'"/></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="page" flex>
      <span :disabled="!pageInfo.hasPreviousPage" class="left" flex
            @click='toComment(!pageInfo.hasPreviousPage, -1)'><svg-icon
          :name="'right'"/></span>
      <span :disabled="!pageInfo.hasNextPage" class="right" flex
            @click='toComment(!pageInfo.hasNextPage, 1)'><svg-icon
          :name="'right'"/></span>
    </div>
  </div>
</template>

<script>
import {
  logError,
  getPageComment,
  createReply,
  close_deleteComment, deleteReply, getCommentChildren
} from "@/views/comment/utils";
import WriteComment from "@/views/comment/Write";
import {parseAjaxError, parseMarkdown} from "@/utils";
import hljs from "highlight.js";
import siteConfig from '@/site-config'

export default {
  name: "ListComment",
  components: {WriteComment},
  props: {
    title: {
      type: String,
      default: 0
    },
    login: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      siteConfig,
      onePageItemsCount: 2,
      pageInfo: {},
      items: [],
      replayItem: null,
      replyChild: null,
      submitting: false,
      updating: false,
    }
  },
  async created() {
    await this.updatePage();
  },
  methods: {
    async updatePage(cursor) {
      let res = await getPageComment({
        count: this.onePageItemsCount,
        title: this.title,
        cursor: cursor
      });
      if (res[0]) {
        let data = res[1].data.data.search;
        this.pageInfo = data.pageInfo;
        this.items = [];
        for (const e of data.nodes) {
          // 子评论
          let children = [];
          e.comments.nodes.forEach(c => {
            children.push({
              id: c.id,
              avatar: c.author.avatarUrl,
              nick: c.author.login,
              site: c.author.url,
              time: c.createdAt,
              content: c.body,
              identity: c.authorAssociation,
              thumbup: c.reactions.totalCount,
            })
          })
          // 主体
          this.items.push({
            id: e.id,
            number: e.number,
            avatar: e.author.avatarUrl,
            nick: e.author.login,
            site: e.author.url,
            time: e.createdAt,
            content: e.body,
            identity: e.authorAssociation,
            children: children,
            thumbup: e.reactions.totalCount,
            page: e.comments.pageInfo
          });
        }
        this.$nextTick(() => {
          this.$refs.list.querySelectorAll('pre>code:not(.hljs)').forEach(el => {
            el.innerText = el.innerText.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
            hljs.highlightBlock(el);
          })
        })
      } else {
        this.$message.error(parseAjaxError(res[1]))
      }
    },
    calcMdToHtml(text, isReply) {
      text = text.replaceAll('<', '&lt;').replace(/(?<!^|\n)>/g, '&gt;')
      if (isReply) {
        let matcher = text.match(/^@(\S+)([\s\S]*)/);
        if (matcher) {
          text = `<span class="reply">回复<a target="_blank" href="https://gtihub.com/${matcher[1]}">@${matcher[1]}</a></span>` + matcher[2];
        }
      }
      return parseMarkdown(text)
    },
    async toComment(cant, p) {
      if (cant) return
      if (this.updating) return;
      this.updating = true;
      let cursor = '';
      if (p === 1) {
        cursor = `,after: "${this.pageInfo.endCursor}"`
      } else {
        cursor = `,before: "${this.pageInfo.startCursor}"`
      }
      await this.updatePage(cursor);
      this.updating = false
    },
    async toReply(cant, item, cursor) {
      if (cant) return
      if (this.updating) return;
      this.updating = true;
      let res = await getCommentChildren(item.id, this.onePageItemsCount, cursor);
      if (res[0]) {
        let data = res[1].data.data.node.comments;
        item.page = data.pageInfo;
        item.children = [];
        data.nodes.forEach(c => {
          item.children.push({
            id: c.id,
            avatar: c.author.avatarUrl,
            nick: c.author.login,
            site: c.author.url,
            time: c.createdAt,
            content: c.body,
            identity: c.authorAssociation,
            thumbup: c.reactions.totalCount,
          })
        })
      }
      this.updating = false
    },

    clickReply(o, t) {
      this.replayItem = o;
      this.replyChild = t;
    },
    async replayComment(payload) {
      this.submitting = true;
      let res = await createReply({
        id: this.replayItem.id,
        body: (this.replyChild ? `@${this.replyChild.nick} ` : '') + payload.text
      });
      if (logError.call(this, res, '回复成功!', '回复失败')) {
        await this.toReply(false, this.replayItem)
        this.replayItem = null;
        this.replyChild = null;
      }
      this.submitting = false;
    },
    async closeComment(id) {
      let res = await close_deleteComment('close', id);
      if (logError.call(this, res, '删除成功!', '删除失败')) {
        setTimeout(async () => {
          await this.updatePage()
        }, 1000)
      }
    },
    async deleteReply(id) {
      let res = await deleteReply(id);
      if (logError.call(this, res, '删除成功!', '删除失败')) {

      }
    }
  }
}
</script>

<style scoped lang="scss">
.list{
  width: 100%;
  margin: 2rem 0 1rem 0;
  padding-top: 2rem;
  border-top: 2px solid gray;
  flex-direction: column;
  > .items{
    width: 90%;
    flex-direction: column;

    > .item {
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      width: 100%;
      margin-bottom: 0.5rem;
      padding-bottom: 0.5rem;
      align-items: flex-start;

      > .avatar {
        margin: 0.3rem 1rem 0 0;

        > img {
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 50%;
          object-fit: cover;
        }
      }

      > div {
        width: calc(100% - 3.4rem);
        flex-direction: column;

        > .body {
          width: 100%;
          flex-direction: column;

          > .head {
            width: 100%;
            justify-content: space-between;
            padding: 0.4rem 0;

            > a {
              font-size: 0.84rem;
              color: black;
              text-decoration: none;
            }
          }
          > .content{
            width: 100%;
            flex-grow: 1;
            padding: 0.4rem 0 0.3rem 0;
            > span{
              font-size: 0.95rem;
              line-height: 1.5rem;
            }
          }
        }
        > .children{
          width: 100%;
          margin-top: 0.6rem;
          border-top: 1px dotted rgba(0, 0, 0, 0.1);

          > .child {
            padding-top: 0.3rem;
            margin-top: 0.3rem;

            > .content {
              align-items: flex-start;

              > a {
                margin-right: 0.8rem;

                > img {
                  width: 1.6rem;
                  height: 1.6rem;
                  border-radius: 50%;
                  object-fit: cover;
                }
              }
              > div {
                line-height: 1.5rem;

                > a {
                  margin-right: 0.8rem;
                  font-size: 0.84rem;
                  text-decoration: none;
                  color: #000000;
                }

                > span {
                  width: 100%;
                  font-size: 0.95rem;

                  ::v-deep span.reply {
                    font-size: 0.84rem;

                    > a {
                      text-decoration: none;
                      color: #007bff;
                      margin-left: 0.3rem;
                    }
                  }
                }
              }
            }
          }
        }
      }
      .foot{
        width: 100%;
        color: gray;
        margin-top: 0.6rem;
        > .time{
          font-size: 0.7rem;
          margin-right: 0.6rem;
        }

        > span {
          cursor: pointer;
          font-size: 0.65rem;

          &:hover {
            color: #ff1616;
          }

          &.close {
            margin-left: 0.5rem;
          }

          &.delete {
            margin-left: 0.5rem;
          }
        }

        > .write{
          width: 100%;
        }
      }
    }
  }

  .page{
    margin-top: 0.5rem;

    > span{
      margin: 0 0.5rem;
      padding: 0.15rem;
      border-radius: 0.15rem;
      justify-content: center;
      cursor: not-allowed;

      &:not([disabled]){
        cursor: pointer;

        &:hover{
          background: rgba(0, 0, 0, 0.15);
        }
      }

      &[disabled]{
        > svg{
          fill: gray
        }
      }

      > svg{
        width: 1rem;
        height: 1rem;
      }

      &.left{
        transform: rotate(180deg);
      }
    }
  }
}
</style>
