<template>
  <div class="record" flex>
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
    <div class="body">
      <table>
        <thead>
        <tr>
          <td>图</td>
          <td>文</td>
          <td>操作</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in record" :key="item.file">
          <td>
            <router-link :to="{name: 'backend.record.detail', params: {id: item.file}}" flex>
              <img :src="item.images[0]"/>
            </router-link>
          </td>
          <td>
            <span>{{ item.summary }}</span>
          </td>
          <td>
            <span v-if="selecting" :class="{active: selectList.indexOf(item.file)!==-1}" class="check-box"
                  @click="toggleSelect(item.file)"></span>
            <single-button class="del-btn" v-else @click.native="deleteItem([item.file])" :text="'删除'"/>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import SingleButton from "@/components/Button";
import LoadingButton from "@/components/LoadingButton";
import {parseAjaxError, sortByTime} from "@/utils";
import jszip from "jszip";
import {originPrefix} from "@/main";
import * as fileSaver from "file-saver";

export default {
  name: "Record",
  components: {LoadingButton, SingleButton},
  data() {
    return {
      deleting: {
        b: false,
        state: ''
      },
      selecting: false,
      selectList: []
    }
  },
  computed: {
    ...mapState(['record', 'gitUtil'])
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
          this.deleting.state = '下载:record.json';
          let res = await fetch(`${originPrefix}/json/record.json?ran=${ranTime}`);
          let txt = await res.text();
          zip.file('record.json', txt);
          for (let item of this.selectList) {
            this.deleting.state = `下载:${item}.txt`;
            res = await fetch(`${originPrefix}/record/${item}.txt?ran=${ranTime}`);
            txt = await res.text();
            zip.file(`${item}.txt`, txt);
          }
          this.deleting.state = `正在压缩...`;
          let content = await zip.generateAsync({type: "blob"});
          fileSaver.saveAs(content, "record-export.zip");
        } catch (err) {
          this.$message.error(parseAjaxError(err));
        }
        this.deleting = {
          b: false,
          state: ''
        }
      } else {
        await this.$router.push({name: 'backend.record.detail', params: {id: 'new'}})
      }
    },
    async deleteSome() {
      if (this.selectList.length) {
        await this.deleteItem(this.selectList.slice())
      }
    },
    async deleteItem(files) {
      if (this.deleting.bool) return;
      if (this.gitUtil) {
        if (confirm('确认删除?')) {
          let err = null;
          this.deleting = {
            bool: true,
            state: '更新record.json'
          };
          // 更新record
          let newRecordList = [];
          for (let i = 0; i < this.record.length; i++) {
            if (files.indexOf(this.record[i].file) === -1) {
              newRecordList.push(this.record[i]);
            }
          }
          sortByTime(newRecordList);
          let res = await this.gitUtil.updateJsonFile('record.json', newRecordList);
          this.deleting.state = '准备删除';
          if (res[0]) {
            // 删除文件夹
            res = await this.gitUtil.removeSome(files, this.deleting, 'record');
            if (res[0]) {
              this.$message.success('删除成功!');
              this.$store.commit('updateJson', {
                key: 'record',
                json: newRecordList
              });
            } else {
              err = res[1];
            }
          } else {
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
    },
  }
}
</script>

<style scoped lang="scss">
@import "src/assets/style/public";
.record{
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
  > .body{
    width: 95%;
    margin: 1rem 0;
    > table{
      width: 100%;
      tbody{
        tr{
          height: 8rem;
          td{
            text-align: center;
            &:nth-child(1){
              width: 25%;
            }
            &:nth-child(2){
              width: 65%;
            }
            > a{
              cursor: pointer;
              width: 100%;
              height: 100%;
              img{
                width: 100%;
                object-fit: contain;
              }
            }
            > span{
              @include text-overflow(4);
            }
            > *{
              margin: 0 auto;
            }
          }
        }
      }
    }
  }
  @include media{
    width: 99% !important;
    margin-left: 0.5% !important;
  }
}
</style>