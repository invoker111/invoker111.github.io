import mutations from "@/store/mutation";
import actions from "@/store/action";
import getters from "@/store/getter";

import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)


export default new Vuex.Store({
    state: {
        gitUtil: null,
        nowMdFile: 0,
        config: {},
        md: [],
        record: [],
        loading: true
    },
    mutations,
    actions,
    getters
})