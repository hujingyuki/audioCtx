<template>
  <div>
    <audioCtx :options="options" 
              :visible="visible"
              @pause="pause"
              @resume="resume"
              @start="start"
              @end="end"
              v-if="load"></audioCtx>
    <!-- <audio :src="require('./test.mp3')" controls></audio> -->
  </div>
</template>
<script>
import audioCtx from '../audioCtx.vue';
export default {
  name:'',
  components:{audioCtx},
  data() {
    return {
      load: true,
      visible: true,
      options:{
        src: require('./test.mp3'),
        autoplay: false,
        arrayBuffer: null,
        loop: false
      }
    }
  },
  methods: {
    pause(){
      console.log('pause');
      // let self = this;
      // this.load = false;
      // let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
      // xhr.withCredentials = true;
      // xhr.open('GET', require('./test1.mp3'), true);
      // xhr.responseType = 'arraybuffer';
      // xhr.onload = function(e) {
      //   self.options = {
      //     src: '',
      //     autoplay: true,
      //     arrayBuffer: this.response
      //   }
      //   setTimeout(()=>{
      //     self.load = true;
      //   },2000);
      // };
      // xhr.send();
    },
    resume(){
      console.log('resume');
    },
    start(){
      console.log('start');
    },
    end(){
      console.log('end');
    }
  }
}
</script>
<style scoped>
</style>

