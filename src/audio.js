/** @format */
let AudioContext =
  window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.msAudioContext;

const audioCtx = {
  context: new AudioContext(),
  source: null,
  fileUrl: null,
  audioBuffer: null,
  autoplay: false,
  stopSound() {
    if (this.source) {
      this.source.stop(0); //立即停止
    }
  },
  playSound() {
    let self = this;
    return new Promise(resolve => {
      self.source = self.context.createBufferSource();
      self.source.buffer = self.audioBuffer;
      self.source.connect(self.context.destination);
      self.source.start(0); //立即播放
      resolve();
    });
  },
  initSound(arrayBuffer, resolve) {
    let self = this;
    self.context.decodeAudioData(
      arrayBuffer,
      function(buffer) {
        //解码成功时的回调函数
        self.audioBuffer = buffer;
        if(self.autoplay) {
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
  loadAudioFile() {
    let self = this;
    return new Promise(resolve => {
      let xhr = new XMLHttpRequest(); //通过XHR下载音频文件
      xhr.withCredentials = true;
      xhr.open('GET', self.fileUrl, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function(e) {
        //下载完成
        self.initSound(this.response, resolve);
      };
      xhr.send();
    });
  },
  /**
   * 
   * @param {*} options 
   * {
   *    url: 音频地址
   *    buffer: 音频流
   *    autoplay: 是否自动播放 
   * }
   */
  init(options) {
    let self = this;
    if (!options) return;
    return new Promise(resolve => {
      self.fileUrl = options.url;
      self.autoplay = options.autoplay || false;
      let buffer = options.buffer;
      if (self.fileUrl) {
        self.loadAudioFile().then(() => {
          resolve();
        });
      } else if (buffer) {
        self.initSound(buffer, resolve);
      }
    })
  }
};

export default audioCtx;
