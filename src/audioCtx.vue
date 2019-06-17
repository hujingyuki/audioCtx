<template>
  <div class="my-audio" v-if="visible">
    <span :class="['op',playing && !pause?'pause':'play',{'disabled':totalTime==0}]" @click="playOrPause"></span>
    <div class="slider" id="slider" @click="clickHandler">
      <span class="dot" :style="{width: sliderBar + '%'}" id="dot"></span>
    </div>
    <span class="time">{{ currentTime | formatSecond}}/{{ totalTime | formatSecond}}</span>
  </div>
</template>
<script>
import { constants } from 'fs';
export default {
  name:'audioCtx',
  props: {
    //播放源
    //  src: 音频地址
    //  buffer: 音频流
    //  autoplay: 是否自动播放 
    //  loop: 是否循环播放
    options: {
      type: Object,
      default: ()=>{
        return {
          src:'',
          autoplay: false,
          arrayBuffer: null,
          loop: false
        }
      }
    },
     //是否需要显示
    visible: {
      type: Boolean,
      default:true
    }
  },
  data() {
    return {
      //播放状态
      playing: false,
      //是否暂停
      pause: true,
      //最大时长
      totalTime: 0,
      //播放当前时刻
      currentTime: 0,
      //时间校准
      timeFix:0,
      //进度条时间
      sliderBar: 0,
      //音频播放对象
      AudioContext: window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext,
      //对象实例
      audioCtx: null,
      //arraybuffersourceNode
      source: null,
      //播放缓存buffer
      audioBuffer: null,
      //是否触发down事件
      hasDown: false,
      //手动触发stop事件
      handStop: false,
      timer:null
    }
  },
  beforeDestroy(){
    if (this.audioCtx) {
      this.audioCtx.close();
    }
  },
  mounted () {
    this.init();
    //拖拽功能
    let slider = document.getElementById('slider');
    slider.onmousedown = this.downHandler;
    document.onmouseup = () => {
      if(this.hasDown){
        this.hasDown = false;
        if( this.playing){
          this.handStop = true;
          this.playSound();
        }
      }
      document.onmousemove = null; //弹起鼠标不做任何操作
    }
  },
  methods: {
    /**
     * @param {*} options 
     */
    init() {
      let self = this;
      if (!self.options) return;
      self.audioCtx = new self.AudioContext();
      return new Promise(resolve => {
        if (self.options.src) {
          self.loadAudioFile().then(() => {
            resolve();
          });
        } else if (self.options.arrayBuffer) {
          self.initSound(resolve);
        }
      });
    },
    loadAudioFile() {
      let self = this;
      return new Promise(resolve => {
        let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
        xhr.withCredentials = true;
        xhr.open('GET', self.options.src, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
          //下载完成
          self.options.arrayBuffer = this.response;
          self.initSound(resolve);
        };
        xhr.send();
      });
    },
    initSound(resolve) {
      let self = this;
      self.audioCtx.decodeAudioData(
        self.options.arrayBuffer,
        function(buffer) {
          //解码成功时的回调函数
          self.audioBuffer = buffer;
          self.totalTime = self.audioBuffer.duration;
          if (self.options.autoplay) {
            self.playSound();
          } 
          resolve();
        },
        function(e) {
          //解码出错时的回调函数
          console.log('Error decoding file', e);
        }
      );
    },
    playSound() {
      let self = this;
      if(!self.totalTime) {
        return;
      }
      self.stopSound();
      self.source = self.audioCtx.createBufferSource();
      self.source.buffer = self.audioBuffer;
      self.source.connect(self.audioCtx.destination);
      self.source.loop = self.options.loop;
      if(self.totalTime - self.currentTime < 1){
        self.currentTime = 0;
        self.sliderBar = 0;
      }
      self.timeFix = self.audioCtx.getOutputTimestamp().contextTime - self.currentTime;
      self.onTimeupdate();
      self.source.start(0, self.currentTime);
      if(!self.playing){
        self.$emit('start');
      }
      self.playing = true;
      self.pause = false;
      //如果不是自当播放的需要加上时间校准
      self.source.onended = () => {
        if(!self.handStop){
          self.pause = true;
          self.playing = false;
          clearInterval(self.timer);
          self.$emit('end');
        }
        self.handStop = false;
      };
    },
    stopSound() {
      if (this.source) {
        this.source.stop(0); //立即停止
      }
    },
    //播放还是暂停
    playOrPause(){
      let self = this;
      //如果正在播放就暂停或者继续
      if(!self.totalTime){
        return;
      }
      if(self.playing){
        self.pause = !self.pause;
        if(self.audioCtx.state == 'running') {
          self.audioCtx.suspend();
          self.$emit('pause');
        } else if (self.audioCtx.state == 'suspended') {
          self.audioCtx.resume();
          self.$emit('resume');
        } 
      } else {
        //如果没有播放则重新链接资源
        self.pause = false;
        self.playSound();
      }
    },
    // 当timeupdate事件每秒一次，用来更新音频流的当前播放时间
    onTimeupdate() {
      this.timer = setInterval(()=>{
        if(this.totalTime - this.currentTime < 1){
          clearInterval(this.timer);
          return;
        }
        if(!this.pause && !this.hasDown){
          this.handStop = false;
          let timestamp = this.audioCtx.getOutputTimestamp().contextTime;
          if (timestamp) {
            let timespan = timestamp - this.timeFix
            this.currentTime =  timespan >= this.totalTime ? this.totalTime : timespan;
            this.sliderBar = this.currentTime/this.totalTime * 100;
          }
        } 
      },1000);
    },
    // 拖动进度条，改变当前时间，index是进度条改变时的回调函数的参数0-100之间，需要换算成实际时间
    changeCurrentTime(index) {
      this.$refs.audio.currentTime = parseInt(index / 100 * this.totalTime);
    },
    // 鼠标拖拽事件
    downHandler(event) {
      let self = this;
      if(!self.totalTime){
        return;
      }
      if(self.playing){
        self.pause = true;
        self.handStop = true;
        self.stopSound();
      }
      let barleft = 0;
      let scroll = document.getElementById('slider');
      let bar = document.getElementById('dot');
      var event = event || window.event;
      //左边进度条的长度
      var leftVal = event.target.offsetLeft;
      var startX = event.clientX;
        // 拖动一定写到 down 里面才可以
      document.onmousemove = function(event){
        var event = event || window.event;
        var endX = event.clientX > scroll.offsetWidth +leftVal
          ? scroll.offsetWidth + leftVal
          : event.clientX;
        barleft = endX - leftVal >= 0 ? endX - leftVal : 0; 
        self.sliderBar = barleft/scroll.offsetWidth * 100;
        self.hasDown = true;
        self.currentTime = self.totalTime * self.sliderBar /100;
        //防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
      }
    },
    clickHandler(event){
      if(!this.totalTime){
        return;
      }
      var event = event || window.event;
      let scroll = document.getElementById('slider');
      this.sliderBar = (event.clientX - event.target.offsetLeft) /scroll.offsetWidth * 100;
      this.currentTime = this.totalTime * this.sliderBar /100;
      this.handStop = true;
      if(this.playing){
        this.pause = true;
        this.playSound();
      }
    }
  },
  filters: {
    // 将整数转化成时分秒
    formatSecond(second = 0) {
      let secondType = typeof second, returnStr = '00:00';
      if (secondType === 'number' || secondType === 'string') {
        second = Math.round(second);
        let hours = Math.floor(second / 3600);
        second = second - hours * 3600;
        let mimute = Math.floor(second / 60);
        second = second - mimute * 60;
        if (hours) {
          returnStr = hours + ':' + ('0' + mimute).slice(-2) + ':' + ('0' + second).slice(-2);
        } else {
          returnStr =  ('0' + mimute).slice(-2) + ':' + ('0' + second).slice(-2);
        }
      } 
      return returnStr;
    }
  }
}

</script>
<style scoped>
.my-audio{
  display: inline-block;
  min-width: 360px;
  background: #fff;
  border-radius: 8px;
  height: 40px;
  border: 1px solid #36bcf4;
  user-select: none;
}
.op {
  display: inline-block;
  width: 25px;
  height: 25px;
  cursor: pointer;
  vertical-align: top;
  margin: 8px 15px;
}
.play {
  background: url(./assets/images/play.png)no-repeat center;
  background-size: cover;
}
.pause {
  background: url(./assets/images/pause.png)no-repeat center;
  background-size: cover;
}
.disabled{
  cursor: not-allowed;
}
.slider{
  display: inline-block;
  width: 54%;
  height: 6px;
  background: #ccc;
  margin-top: 17px;
  border-radius: 3px;
  cursor: pointer;
}
.dot {
  display: inline-block;
  position: relative;
  background: #36bcf4;
  height: 6px;
  border-radius: 3px;
  top: -11px;
}
.dot::before{
  display: inline-block;
  content: '';
  width: 12px;
  height: 12px;
  border-radius: 100%;
  background:#36bcf4;
  top: -3px;
  right: -6px;
  position: absolute;
}

.time{
  display: inline-block;
  font-size: 14px;
  color: #333;
  height: 40px;
  line-height: 40px;
  vertical-align: top;
  margin-left: 15px;
}
</style>
