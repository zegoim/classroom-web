import { __IS_ELECTRON__ } from "./electron";
import * as faker from "faker/locale/en";

const appVersion = "国内版";
const useCorsApi = true;

export class LiveRoom {
  appId: number;
  signKey?: number[];
  zegoClient: any;
  ZEGOCONSTANTS: any;

  roomId: string;
  userId?: string;
  userName?: string;
  enableLayerCodec: boolean = false;
  sdkIsInitial: boolean = false;
  publishStreamId: string = "";
  publishViewEl: HTMLVideoElement | HTMLCanvasElement;
  streamList: any[] = [];
  playingStreamIds: string[] = [];

  loginToken: string;
  loginTokenUrl: string;

  constructor(props: {
    appId: number;
    signKey?: number[];
  }) {
    this.appId = props.appId;
    this.signKey = props.signKey;

    if (this.zegoClient) return;

    if (__IS_ELECTRON__) {
      const ZegoLiveRoom = window.require("./zegoliveroom/ZegoLiveRoom.js");
      const ZEGOCONSTANTS = window.require("./zegoliveroom/ZegoConstant.js");
      this.ZEGOCONSTANTS = ZEGOCONSTANTS;
      this.zegoClient = new ZegoLiveRoom();

      this.zegoClient.onEventHandler("onStreamUpdated", res => {
        let { streamList } = this;
        const ids = streamList.map(stream => stream.stream_id);
        const streamIds = streamList.map(stream => stream.stream_id);
        if (res.stream_update_type === ZEGOCONSTANTS.ZegoStreamUpdateType.StreamAdded) {
          if (res.stream_list) {
            res.stream_list.forEach(stream => {
              if (!ids.includes(stream.stream_id)) {
                streamList.push(stream);
              }
            });
          }
        } else {
          if (res.stream_list) {
            const removedIds = res.stream_list.map(stream => stream.stream_id);
            removedIds.forEach(id => {
              this.zegoClient.stopPlayingStream({ stream_id: id });
              const index = streamIds.indexOf(id);
              if (index > -1) {
                streamList.splice(index, 1);
                const playingIndex = this.playingStreamIds.indexOf(id);
                if (playingIndex > -1) {
                  this.playingStreamIds.splice(playingIndex, 1);
                }
              }
            });
          }
        }

        if (this.handleStreamsChange) {
          this.handleStreamsChange(this.streamList);
        }
      });
    } else {
      const { ZegoClient } = require("webrtc-zego");
      this.zegoClient = new ZegoClient();
      const idName = faker.random.uuid();
      this.userId = idName;
      const nickName = faker.name.findName();
      this.userName = nickName;
      this.loginTokenUrl = appVersion === "国内版" ? `https://wsliveroom${this.appId}-api.zego.im:8282/token` : `https://wsliveroom${this.appId}-api.zegocloud.com:8282/token`;

      const zegoConfig = {
        appid: this.appId,
        server: appVersion === "国内版" ? `wss://wsliveroom${this.appId}-api.zego.im:8282/ws` : `wss://wsliveroom${this.appId}-api.zegocloud.com:8282/ws`,
        idName,
        nickName,
        loginTokenUrl: this.loginTokenUrl,
        logUrl: "",
        remoteLogLevel: 0,
        logLevel: 0
      };

      this.zegoClient.onStreamUpdated = (type?: number, newStreamList?: any[]) => {
        const { streamList } = this;
        const streamListIds = streamList.map(stream => stream.stream_id);
        const newStreamListIds = newStreamList.map(stream => stream.stream_id);
        if (type === 0) {
          newStreamListIds.forEach((id, index) => {
            if (!streamListIds.includes(id)) {
              let newStream = newStreamList[index];
              streamList.push(newStream);
            }
          });
        } else {
          newStreamListIds.forEach((id, index) => {
            const startIndex = streamListIds.indexOf(id);
            if (startIndex > -1) {
              this.zegoClient.stopPlayingStream(id);
              streamList.splice(startIndex, 1);
              const playingIndex = this.playingStreamIds.indexOf(id);
              if (playingIndex > -1) {
                this.playingStreamIds.splice(playingIndex, 1);
              }
            }
          });
        }
        if (this.handleStreamsChange) {
          this.handleStreamsChange(streamList);
        }
      };

      this.zegoClient.config(zegoConfig);
      this.zegoClient.setUserStateUpdate(true);
    }
  }

  setupElectron = () => {
    this.zegoClient.activateMediaSideInfo({ channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN });
    this.zegoClient.setLogDir({ log_dir: "" });
    this.zegoClient.setLatencyMode(4);
    this.zegoClient.enableTrafficControl({ control_property: 1, enable: false });
    this.zegoClient.setVideoCodecId({
      codec_id: this.enableLayerCodec ? 1 : 0,
      channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN
    });
    this.zegoClient.enableTrafficControl({ control_property: 1, enable: false });
    this.zegoClient.enableCaptureMirror({ enable: true, channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN });
  }

  initSDK = (options?: {
    userId?: string;
    userName?: string;
  }) => {
    if (__IS_ELECTRON__) {
      return new Promise((resolve, reject) => {
        if (this.sdkIsInitial) {
          this.setupElectron();
          resolve({});
        } else {
          const user_id = (options && options.userId) ? options.userId : faker.random.uuid();
          this.userId = user_id;
          this.zegoClient.initSDK({
            app_id: this.appId,
            sign_key: this.signKey,
            user_id,
            user_name: (options && options.userName) ? options.userName : faker.name.findName()
          }, res => {
            if (res.error_code === 0) {
              this.sdkIsInitial = true;
              this.setupElectron();
              resolve(res);
            } else {
              this.sdkIsInitial = false;
              reject(res);
              this.unInitSDK();
            }
          });
        }
      });
    }
  }

  unInitSDK = () => this.zegoClient.unInitSDK();

  loginRoom = async (param: { roomId: string; roomName?: string; }) => {
    this.roomId = param.roomId;
    if (__IS_ELECTRON__) {
      return new Promise((resolve, reject) => {
        if (__IS_ELECTRON__) {
          this.zegoClient.loginRoom({
            room_id: param.roomId,
            room_name: param.roomName || param.roomId,
            role: this.ZEGOCONSTANTS.ZegoRoomRole.Audience
          }, res => {
            if (res.error_code === 0) {
              this.streamList = res.stream_list;
              if (this.handleStreamsChange) {
                this.handleStreamsChange(this.streamList);
              }
              resolve(res);
            } else {
              reject(res);
            }
          });
        }
      });
    } else {
      const getLoginToken = () => {
        return new Promise((resolve, reject) => {
          fetch(`${this.loginTokenUrl}?app_id=${this.appId}&id_name=${this.userId}`, {
            method: "GET",
            headers:  (__DEV__ && !useCorsApi) ? {
              responseType: "text"
            } : void 0
          })
          .then(res => {
            if (typeof res === "string") {
              resolve(res as string);
            } else {
              res.text().then((text: any) => {
                resolve(text as string);
              });
            }
            return res;
          })
          .catch(reject);
        });
      };
      if (!this.loginToken) {
        this.loginToken = await getLoginToken() as string;
      }

      return new Promise((resolve, reject) => {
        this.zegoClient.login(decodeURIComponent(param.roomId), 2, this.loginToken, streamList => {
          this.streamList = streamList;
          resolve({ streamList });
          if (this.handleStreamsChange) {
            this.handleStreamsChange(streamList);
          }
        }, reject);
      });
    }
  }

  logoutRoom = () => {
    if (__IS_ELECTRON__) {
      this.zegoClient.stopPublishing({ channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN });
      const device_id = this.zegoClient.getDefaultAudioDeviceId({ device_type: 0 });
      this.zegoClient.setMicDeviceMute({ device_id, is_mute: false });
      this.handleStreamsChange = void 0;
      this.streamList.forEach(stream => {
        this.stopPlayStream({ streamId: stream.stream_id });
      });
      // must have callback.
      this.zegoClient.logoutRoom(() => {});
    } else {
      this.zegoClient.stopPublishingStream(this.publishStreamId);
      this.streamList.forEach((stream, index) => {
        this.zegoClient.stopPlayingStream(stream.stream_id);
      });
      this.zegoClient.logout();
      this.zegoClient.release();
    }

    this.streamList = [];
    this.playingStreamIds = [];
    if (this.handleStreamsChange) {
      this.handleStreamsChange(this.streamList);
    }
  }

  startPreview = (param: { viewEl: HTMLCanvasElement | HTMLVideoElement }) => {
    this.publishViewEl = param.viewEl;
    return new Promise((resolve, reject) => {
      if (__IS_ELECTRON__) {
        let previewing = this.zegoClient.setPreviewView({
          canvas_view: param.viewEl,
          channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN
        });
        previewing = this.zegoClient.startPreview({
          channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN
        });
        this.zegoClient.setViewMode({ mode: 1 });
        resolve(true);
      } else {
        this.zegoClient.startPreview(param.viewEl, {
          audio: true,
          audioInput: null,
          video: true,
          videoInput: null,
          videoQuality: 2,
          horizontal: true
        }, resolve, reject);
      }
    });
  }

  stopPreview = () => {
    if (__IS_ELECTRON__) {
      this.zegoClient.stopPreview({ channel_index: this.ZEGOCONSTANTS.PublishChannelIndex });
    } else {
      this.zegoClient.stopPreview(this.publishViewEl);
    }
  }

  publishStream = (streamId?: string) => {
    this.publishStreamId = streamId ? streamId : faker.random.uuid();
    if (__IS_ELECTRON__) {
      this.zegoClient.startPublishing({
        title: faker.random.uuid(),
        stream_id: this.publishStreamId,
        publish_flag: this.ZEGOCONSTANTS.ZegoPublishFlag.ZEGO_JOIN_PUBLISH
      });

      this.zegoClient.setPublishStreamExtraInfo({ extra_info: JSON.stringify({ enableCamera: true, enableMic: true, enableLayerCodec: this.enableLayerCodec }), channel_index: this.ZEGOCONSTANTS.PublishChannelIndex.PUBLISH_CHN_MAIN });
    } else {
      this.zegoClient.startPublishingStream(this.publishStreamId, this.publishViewEl);
    }
  }

  playStream = (stream: { viewEl: HTMLCanvasElement | HTMLVideoElement, streamId: string }) => {
    if (!this.playingStreamIds.includes(stream.streamId)) {
      if (__IS_ELECTRON__) {
        this.zegoClient.setPreviewViewMode({ mode: 1, stream_id: stream.streamId });

        this.playingStreamIds.push(stream.streamId);
        this.zegoClient.activateVideoPlayStream({
          stream_id: stream.streamId,
          is_active: true,
          video_layer: this.streamList.length > 2 ? 0 : 1
        });
        this.zegoClient.startPlayingStream({
          stream_id: stream.streamId,
          canvas_view: stream.viewEl,
          params: ""
        });
      } else {
        this.playingStreamIds.push(stream.streamId);
        this.zegoClient.startPlayingStream(stream.streamId, stream.viewEl);
      }
    }
  }

  playStreams = (streams: { viewEl: HTMLCanvasElement | HTMLVideoElement, streamId: string; }[]) => {
    streams.forEach(stream => this.playStream(stream));
  }

  stopPlayStream = (stream: { streamId: string; }) => {
    this.zegoClient.stopPlayingStream(__IS_ELECTRON__ ? { stream_id: stream.streamId } : stream.streamId);
  }

  stopPlayStreams = (streams: { streamId: string; }[]) => {
    streams.forEach(stream => {
      this.stopPlayStream({ streamId: stream.streamId });
    });
  }

  handleStreamsChange = (streamList: { stream_id: string; [key: string]: any; }[]) => {};
}

export default LiveRoom;
