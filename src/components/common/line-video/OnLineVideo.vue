<template>
  <div style="width: 100%">
    <div id="video-container" ref="videoRef"></div>
  </div>
</template>

<script>
import EZUIKit from 'ezuikit-js';

export default {
  name: 'OnlineVideo',
  props: {
    accessToken: {
      type: String
    },
    url: {
      type: String
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    template: {
      type: String,
      default: 'security'
    },
    width: {
      type: Number,
      default: 800
    },
    height: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      player: null
    };
  },
  methods: {
    showPlayer() {
      if (this.player) {
        // 销毁实例
        this.player.stop();
        this.player = null;
        this.$refs.videoRef.innerHTML = '';
        // console.log('showPlayer-stop');
      }
      // console.log('showPlayer-start');
      if (this.url && this.accessToken) {
        // 创建实例
        this.player = new EZUIKit.EZUIKitPlayer({
          id: 'video-container',
          accessToken: this.accessToken,
          url: this.url,
          template: this.template, //  极简版;standard-标准版;security - 安防版(预览回放);voice-语音版；
          audio: 1, // 是否默认开启声音 0 - 关闭 1 - 开启
          autoplay: this.autoplay,
          handleSuccess: () => {
            // console.log('EZUIKit', '成功');
          },
          handleError: () => {
            // console.log('EZUIKit', '出错');
          },
          width: this.width,
          height: this.height
          // 视频上方头部控件
          // header: ["capturePicture", "save", "zoom"], // 如果templete参数不为simple,该字段将被覆盖
          //plugin: ['talk'],                       // 加载插件，talk-对讲
          // 视频下方底部控件
          // footer: ["talk", "broadcast", "hd", "fullScreen"], // 如果template参数不为simple,该字段将被覆盖
          // openSoundCallBack: data => console.log("开启声音回调", data),
          // closeSoundCallBack: data => console.log("关闭声音回调", data),
          // startSaveCallBack: data => console.log("开始录像回调", data),
          // stopSaveCallBack: data => console.log("录像回调", data),
          // capturePictureCallBack: data => console.log("截图成功回调", data),
          // fullScreenCallBack: data => console.log("全屏回调", data),
          // getOSDTimeCallBack: data => console.log("获取OSDTime回调", data),
          // player.stop(); // 方法调用示例，10秒后关闭视频
        });
      }
    },

    // 关闭监控
    colseVideo() {
      this.player.stop();
    },
    // 开启监控
    openVideo() {
      this.player.play();
    }
  },
  mounted() {
    this.showPlayer();
  },
  watch: {
    // 监听到token,url变化渲染视频组件
    accessToken() {
      if (this.url && this.accessToken) {
        this.showPlayer();
      }
    },
    url() {
      if (this.url && this.accessToken) {
        this.showPlayer();
      }
    }
  }
};
</script>
