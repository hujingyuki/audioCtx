/** @format */

import component from './audioCtx.vue';

export function install(Vue) {
  if (install.installed) return;
  install.installed = true;
  Vue.component('audioCtx', component);
}

const plugin = {
  install
};
//全局定义
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

export default component;
