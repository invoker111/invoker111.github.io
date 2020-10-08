<template>
  <div class="md" flex>
    <div class="head" flex>
      <div class="delete-state" v-if="deleting.bool" flex>
        <svg-icon :name="'loading'"/>
        <span>{{ deleting.state }}</span>
      </div>
      <single-button class="select-" :active="selecting" :text="selecting?'取消':'选择'"
                     @click.native="selecting=!selecting"/>
      <single-button v-if="selecting" class="del-btn" :text="'删除'" @click.native="deleteSome"/>
      <loading-button :text="selecting?'导出':'新建'" :icon="selecting?'download':'add'" class="new"
                      @click.native="clickBtn"/>
    </div>
    <label class="search">
      <span>搜索</span>
      <input v-model="search"/>
    </label>
    <div class="list" flex>
      <table>
        <thead>
        <tr>
          <td class="cover">封面</td>
          <td class="title">标题</td>
          <td class="summary">简介</td>
          <td class="time">时间</td>
          <td class="tags">标签</td>
          <td class="operate">操作</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in reverseList" :key="item.file">
          <router-link tag="td" class="cover" :to="{name: 'backend.md.detail', params: {id: item.file}}">
            <loading-img :src="item.cover || selfImage" :size="[-1, 8]"/>
          </router-link>
          <td class="title"><span>{{ item.name }}</span></td>
          <td class="summary"><span>{{ item.summary }}</span></td>
          <td class="time">
            <div flex>
              <span>创建:</span>
              <a>{{ item.time | time(true) }}</a>
            </div>
            <div flex>
              <span>修改:</span>
              <a>{{ item.modifyTime | time(true) }}</a>
            </div>
          </td>
          <td class="tags">
            <div flex="">
              <span :style="{background: $options.filters.color(tag)}" v-for="tag in item.tags">{{ tag }}</span>
            </div>
          </td>
          <td class="operate">
            <span v-if="selecting" :class="{active: selectList.indexOf(item)!==-1}" class="check-box"
                  @click="toggleSelect(item)"></span>
            <single-button v-else class="del-btn" :text="'删除'" @click.native="removeMd([item.file])"
                           :deleting="deleting.bool"/>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import SingleButton from "@/components/Button";
import {mapState} from "vuex";
import selfImage from '@/image/i.png'
import LoadingButton from "@/components/LoadingButton";
import {parseAjaxError, sortByTime} from "@/utils";
import jszip from "jszip";
import {originPrefix} from "@/main";
import * as fileSaver from "file-saver";
import LoadingImg from "@/components/LoadingImg";

export default {
  name: "Md",
  components: {LoadingImg, LoadingButton, SingleButton},
  data() {
    return {
      selfImage,
      deleting: {
        bool: false,
        state: ''
      },
      selecting: false,
      selectList: [],
      search: ''
    }
  },
  computed: {
    ...mapState(['md', 'gitUtil']),
    reverseList() {
      if (this.search === '') return this.md;
      let lis = [];
      this.md.forEach(e => {
        if (e.name.search(this.search) !== -1) {
          lis.push(e)
        }
      })
      return lis
    }
  },
  methods: {
    toggleSelect(item) {
      let idx = this.selectList.indexOf(item);
      if (idx === -1) {
        this.selectList.push(item)
      } else {
        this.selectList.splice(idx, 1);
      }
    },
    async deleteSome() {
      if (this.selectList.length) {
        await this.removeMd(this.selectList.filter(v => {
          return v.file
        }));
      }
    },
    async clickBtn() {
      if (this.selecting) {
        if (this.deleting.b) return;
        if (!this.selectList.length) {
          this.$message.warning('请选择需要导出的项目!');
          return
        }
        this.deleting = {
          b: true,
          state: '导出中...'
        }
        let zip = new jszip(),
            ranTime = new Date().getTime();
        try {
          this.deleting.state = '下载:md.json';
          let res = await fetch(`${originPrefix}/json/md.json?ran=${ranTime}`);
          let txt = await res.text();
          zip.file('md.json', txt);
          for (let item of this.selectList) {
            for (let extend of ['md', 'html']) {
              this.deleting.state = `下载:${item.file}/index.${extend}`;
              let zipFolder = zip.folder(`${item.name}-${item.file}`)
              res = await fetch(`${originPrefix}/md/${item.file}/index.${extend}?ran=${ranTime}`);
              txt = await res.text();
              zipFolder.file(`index.${extend}`, txt);
            }
          }
          this.deleting.state = `正在压缩...`;
          let content = await zip.generateAsync({type: "blob"});
          fileSaver.saveAs(content, "md-export.zip");
        } catch (err) {
          this.$message.error(parseAjaxError(err));
        }
        this.deleting = {
          b: false,
          state: ''
        }
      } else {
        await this.$router.push({name: 'backend.md.detail', params: {id: 'new'}})
      }
    },
    async removeMd(files) {
      if (this.deleting.bool) return;
      if (this.gitUtil) {
        if (confirm('确认删除?')) {
          let err = null;
          this.deleting = {
            bool: true,
            state: '更新md.json'
          };
          // 更新md
          let newMdList = [];
          for (let i = 0; i < this.md.length; i++) {
            if (files.indexOf(this.md[i].file) === -1) {
              newMdList.push(this.md[i]);
            }
          }
          sortByTime(newMdList);
          let res = await this.gitUtil.updateJsonFile('md.json', newMdList);
          this.deleting.state = '准备删除';
          if (res[0]) {
            // 删除文件夹
            res = await this.gitUtil.removeSome(files, this.deleting, 'md');
            if (res[0]) {
              this.$message.success('删除成功!');
              this.$store.commit('updateJson', {
                key: 'md',
                json: newMdList
              });
            } else {
              err = res[1];
            }
          }else{
              err = res[1];
          }
          if (err) {
            this.$message.error(parseAjaxError(err));
          }
          this.deleting = {
            bool: false,
            state: ''
          };
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
.md{
  min-height: 90%;
  flex-direction: column;
  > .head{
    width: 100%;
    margin: 1rem 0;
    justify-content: space-between;
    > .delete-state{
      margin-left: 1rem;
      > svg{
        width: 1.5rem;
        height: 1.5rem;
      }
      > span{
        color: red;
        font-size: 0.8rem;
        margin-left: 0.6rem;
      }
    }
    > ::v-deep .new{
      margin: 0 1rem 0 0;
      background: #ffd784;
      padding: 0.6rem 1.2rem;
      box-shadow: 0 0 0.4rem rgba(0, 0, 0, 0.3);
      &:hover{
        background: #efca7c;
      }
      > svg{
        width: 1.4rem;
        height: 1.4rem;
        fill: #000000;
      }
      > span{
        margin-left: 0.5rem;
        font-size: 0.95rem;
        color: black;
      }
    }
    > .select-{
      margin: 0 1rem 0 auto;
      background: #00bb00;
    }
  }
  > .search{
    border-top: 1px solid #f3f3f3;
    padding: 1rem 5%;
    width: 90%;
    > span{
      margin-right: 1rem;
      font-size: 0.95rem;
    }
    > input{
      padding: 0.2rem;
      border-radius: 0.25em;
      font-size: 0.88rem;
      border: 1px solid gray;
      width: 15rem;
    }
  }
  > .list{
    width: 95%;
    margin: 1rem 0;
    > table{
      width: 100%;
      tbody{
        tr{
          height: 8rem;
          td{
            text-align: center;
            &.title, &.summary{
              > span{
                @include text-overflow(4);
              }
            }
            &.cover{
              cursor: pointer;
              width: 15%;
              ::v-deep img{
                height: 8rem !important;
                object-fit: contain !important;
              }
            }
            &.title{
              width: 25%;
              font-size: 1.04rem;
              word-break: break-all;
              white-space: pre-line;
            }
            &.summary{
              width: 26%;
              font-size: 0.85rem;
              color: #545454;
            }
            &.time{
              width: 12%;
              font-weight: 500;
              max-width: 10rem;
              > div{
                flex-direction: column;
                span, a{
                  word-break: keep-all;
                  white-space: nowrap;
                }
                > span{
                  font-size: 0.8rem;
                  margin-right: 0.4rem;
                }
                > a{
                  font-size: 0.88rem;
                  color: #0003ff;
                }
              }
            }
            &.tags{
              width: 15%;
              > div{
                flex-wrap: wrap;
                > span{
                  margin: 0.4rem 0.2rem;
                  padding: 0.3rem 0.8rem;
                  font-size: 0.8rem;
                  border-radius: 0.2rem;
                  color: white;
                }
              }
            }
            &.operate{
              width: 8%;
              > *{
                margin: auto;
              }
            }
          }
        }
      }
    }
  }
  @include media{
    width: 99% !important;
    margin-left: 0.5% !important;
    td.cover{
      width: 30% !important;
    }
    td.summary, td.time, td.tags{
      display: none;
    }
  }
}
</style>