# AudioContext Playper

<p text-align="center">
    <img alt="GitHub release" src="https://img.shields.io/badge/version-1.0.0-brightgreen.svg?style=for-the-badge"/>
    <img alt="vue" src ="https://img.shields.io/badge/vue-2.5.16-blue.svg?style=for-the-badge"/>
</p>

> A audio player based on AudioContext which can realize autoplay in chrome
>
> 用于规避谷歌浏览器必须用户点击才能播放音频的规定，也可用作一般音频播放器

------

### 一、使用示例

 ![](./image/demo.gif)

### 二、组件功能

- 可自动播放短音频
- 播放可暂停/继续
- 可拖动/点击设置播放进度
- 可配置插件样式是否显示
- 可配置是否循环播放音频
- 支持加载ArrayBuffer二进制流文件



### 三、组件参数及事件

**参数**

| 参数        | 说明                                                         | 类型        | 默认值                                                   |
| ----------- | ------------------------------------------------------------ | ----------- | -------------------------------------------------------- |
| visible     | 是否需要显示                                                 | Boolean     | true                                                     |
| options     | 传入参数对象                                                 | Object      | {src:'', autoplay: false,arrayBuffer: null, loop: false} |
| src         | 音频文件地址(本地文件require后传入，在线文件记得处理跨域问题) | String      | ''                                                       |
| autoplay    | 是否自动播放文件                                             | Boolean     | false                                                    |
| arrayBuffer | 二进制文件流                                                 | arrayBuffer | null                                                     |
| loop        | 是否循环播放音频                                             | Boolean     | false                                                    |

**方法**

**start**  :开始回调事件。

**pause**  :暂停回调事件。

**resume**  :恢复回调事件。

**end**  :结束回调事件。



### 四、使用方法

- 1、安装依赖

  `npm set registry http://npm.flyui.cn  `
  `npm install @edu/app-audioCtx`

- 2 、页面引用

  `import  from '@edu/app-audioCtx'`

  <template>
    <audioCtx :options="options" 
              :visible="visible"
              @pause="pause"
              @resume="resume"
              @start="start"
              @end="end"
              v-if="load"></audioCtx>
  </template>

### 五、版本更新日志

**日志**

| Version | Description                                                  |
| ------- | ------------------------------------------------------------ |
| 1.0.0   | A audio player based on AudioContext which can realize autoplay in chrome |

