import Vue from 'vue'
import IconSvg from '@/icons/IconSvg'// svg组件

// register globally
Vue.component('svg-icon', IconSvg)

const requireAll = requireContext => requireContext.keys().map(requireContext)
const req = require.context('./svg', true, /\.svg$/)
requireAll(req)