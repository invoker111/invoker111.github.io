<template>
  <div class="comment" flex>
    <div class="token" flex>
      <div v-if="logined" class="logined" flex>
        <img :src="loginInfo.avatar"/>
        <a :href="loginInfo.url" target="_blank">{{ loginInfo.nick }}</a>
        <single-button :size="0.9" :text="'退出'" @click.native="logout"/>
      </div>
      <div v-else class="login" flex>
        <float-input :name="'token'" :size="0.9" :value="token||''" @input="inputToken"/>
        <single-button :size="0.9" :text="'生成token'" @click.native="genToken"/>
        <loading-button :icon="'account'" :loading="loging" :size="0.9" :text="'登录'" @click.native="doLogin(true)"/>
        <a ref="a"
           :href="`https://github.com/settings/tokens/new?description=comment to ${name}&scopes=public_repo%2Cread%3Auser`"
           target="_blank"></a>
      </div>
    </div>
    <write-comment @submit="submit" :loading="submitting"/>
    <list-comment ref="list" :title="this.title" :login="loginInfo.nick"/>
  </div>
</template>

<script>
import WriteComment from "@/views/comment/Write";
import ListComment from "@/views/comment/List";
import {createComment, getLoginInfo, getRepoId, logError, removeToken} from "@/views/comment/utils";
import {parseAjaxError} from "@/utils";
import FloatInput from "@/components/FloatInput";
import SingleButton from "@/components/Button";
import LoadingButton from "@/components/LoadingButton";
import {mapState} from "vuex";

const tokenKey = 'comment-token';

export default {
  name: "TheComment",
  components: {LoadingButton, SingleButton, FloatInput, ListComment, WriteComment},
  props: {
    title: {
      type: String,
      default: ''
    },

  },
  data() {
    return {
      token: null,
      loging: false,
      logined: false,
      loginInfo: {},
      submitting: false
    }
  },
  computed: {
    ...mapState(['config']),
    name() {
      return this.config.name
    }
  },
  async created() {
    this.token = localStorage.getItem(tokenKey);
    if (this.token) {
      await this.doLogin(false);
      await getRepoId();
    }
  },
  methods: {
    inputToken(payload) {
      this.token = payload[1]
    },
    genToken() {
      this.$refs.a.click()
    },
    async doLogin(remind) {
      if (this.loging) return;
      this.loging = true;
      let res = await getLoginInfo(this.token);
      if (res[0]) {
        localStorage.setItem(tokenKey, this.token);
        if (remind) {
          this.$message.success('登录成功!');
        }
        this.logined = true;
        let data = res[1].data.data.viewer;
        this.loginInfo = {
          avatar: data.avatarUrl,
          url: data.url,
          nick: data.login,
        }
      } else {
        removeToken();
        if (remind) {
          this.$message.error(parseAjaxError(res[1]));
        }
      }
      this.loging = false;
    },
    logout() {
      this.logined = false;
      this.token = '';
      localStorage.removeItem(tokenKey);
      removeToken()
    },
    async submit(payload) {
      this.submitting = true;
      let res = await createComment({
        title: this.title,
        body: payload.text
      });
      if (logError.call(this, res, '评论成功!', '评论失败')) {
        setTimeout(async () => {
          await this.$refs.list.updatePage()
        }, 1000)
      }
      this.submitting = false;
    },
  }
}
</script>

<style scoped lang="scss">
.comment {
  background: white;
  flex-direction: column;
  padding: 1rem 0;

  > .token {
    width: 100%;
    margin-bottom: 2rem;

    > div {
      width: calc(100% - 2rem);
      padding: 0 1rem;
    }

    > .login {
      > .float-input {
        width: 15rem;
      }

      > ::v-deep.single-button {
        background: #ff7b19;
        margin: 0 1rem;

        &:hover {
          background: #ff852c;
        }
      }
    }

    > .logined {
      > img {
        border-radius: 50%;
        width: 2rem;
        height: 2rem;
        object-fit: cover;
      }

      > a {
        margin: 0 1rem;
        color: #000000;
        text-decoration: none;

        &:hover {
          color: #0040ff;
        }
      }

      > .single-button {
        background: #ff5f5f;

        &:hover {
          background: #ff3c3c;
        }
      }
    }
  }
}
</style>