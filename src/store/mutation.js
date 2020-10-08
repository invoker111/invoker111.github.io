export default {
    toggleLoading(state, b) {
        state.loading = b
    },
    changeMd(state, file) {
        state.nowMdFile = file
    },
    updateJson(state, payload) {
        state[payload.key] = payload.json
    },
    updateGitUtil(state, githubUtils) {
        state.gitUtil = githubUtils
    },
}