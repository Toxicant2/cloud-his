import enter from './enter'

const install = function(Vue) {
  Vue.directive('el-enter-next', enter)
}

if (window.Vue) {
  window['el-enter-next'] = enter
  Vue.use(install); // eslint-disable-line
}

enter.install = install
export default enter
