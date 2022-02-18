import Amap from 'components/amap/Amap';
import KeywordSearch from 'components/common/keyword-search/KeywordSearch';
import WayDialog from './components/S-WayDialog';
import NavaDialog from './components/S-NavaDialog';
import AddNavaDialog from './components/S-AddNavaDialog';
import EditOrAddWay from './components/S-EditOrAddWay';
import * as navaApi from 'api/nava';
import * as wayApi from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { debounce, deepClone } from '@/utils';
import addList from './mixins/addList';
import getList from './mixins/getList';
import delList from './mixins/delList';
import editList from './mixins/editList';
import amapEvents from './mixins/amapEvents';
import utils from './mixins/utils';
import { BASE_CONSTANTS } from '@/config';

export default {
  name: 'WaterWay',
  mixins: [getList, delList, editList, amapEvents, utils, addList],
  components: {
    Amap,
    NavaDialog,
    WayDialog,
    AddNavaDialog,
    EditOrAddWay,
    KeywordSearch
  },
  data() {
    return {
      isShowWayDialog: false, // 是否为显示航道操作栏弹窗
      isClickMap: false, //是否可以点击地图
      isRequest: true, //是否可以请求数据
      isShowHighlightWay: false,
      isShowWayIdent: false,
      currentNava: null,
      currentWay: [], //当前地图选中的航道
      currentWayIdent: '',
      currentWayDialog: { fixes: [] }, //航道操作栏的当前航道
      mapInstance: null, //地图实例
      lineInstance: Object.freeze([]), //动态添加航道线段实例
      toNavaInstance: Object.freeze([]), //获取所有可以直接到达指定航标的线段实例
      publicQuery: {
        //公共的请求参数
        'Condition.Rect.TopLeft': '',
        'Condition.Rect.TopRight': '',
        'Condition.Rect.BottomLeft': '',
        'Condition.Rect.BottomRight': '',
        'Condition.ZoomLevel': null,
        'Condition.Keyword': '',
        Page: 1,
        Size: 1e5
      }
    };
  },
  methods: {
    /**
     * 搜索后点击选中的航道或航标
     */
    async selectNavaAndWay(value) {
      const amap = this.$refs.amap;
      this.resetNavaAddData();
      if (value.type === 1) {
        //航标的情况
        this.$set(value, 'locationObj', turnLngLatObj(value.location));
        value.locationArr = turnLngLat(value.location);
        await amap.setMapFitView(value.locationArr, false);
        this.currentNava = value;
      } else if (value.type === 2) {
        //航道的情况
        if (this.isShowWayDialog) {
          this.$message.warning('请先关闭当前航道操作栏再搜索');
          return;
        }
        value.fixesArray = str2Path(value.bounds);
        await amap.setMapFitView(value.fixesArray);
        const { data, errorCode } = await wayApi.apiGetWaysByIdent(value.ident);
        if (+errorCode !== 0) return;
        let en = data.ident.charAt(0).toUpperCase(); // 根据标识开头字母设置不同的颜色
        this.$set(data, 'color', BASE_CONSTANTS.colorArray(en));
        this.$set(data, 'strokeWeight', 4);
        data.fixes.sort((a, b) => a.order - b.order); //  航标点排序
        data.fixesArray = []; // 为每一项添加二维航道路线数组
        for (let x of data.fixes) {
          const fixesArrays = data.fixesArray; // 处理航标坐标组成航道线
          x.navaid.locationObj = turnLngLatObj(x.navaid.location); // 经纬度转换
          fixesArrays.push([x.navaid.locationObj.longitude, x.navaid.locationObj.latitude]); // 轨迹数组创建
        }
        this.currentWay = [data];
        this.isShowHighlightWay = true;
      }
    },

    /**
     * 点击航道操作框里的高亮中的航标
     */
    handleClickHighlightNava(value, index) {
      return;
    },
    /**
     * 点击航道操作框里的航标
     */
    handleNavaClick(nava, index) {
      const editaddway = this.$refs.editaddway;
      const navaid = nava.navaid;
      const autoPlanData = editaddway.autoPlanData;
      const navaLsit = this.currentWayDialog.fixes;
      editaddway.cursorInsertIndex = index;
      if (this.zoomLevel < 15) {
        this.$refs.amap.setMapFitView(
          [navaid.locationObj.longitude, navaid.locationObj.latitude],
          false
        );
      }
      //自动规划
      if (this.wayAddData.plan === 0) {
        //查找当前点击航标是否在本航道之中
        const flag = autoPlanData.selectWaterwayId.some((iid) => iid === navaid.id);
        if (autoPlanData.startNava.ident && autoPlanData.endNava.ident) {
          this.$message.warning('如要修改起点或终点航标,请先清除已选择的航标');
          return;
        }
        //将点击的航标赋值给自动规划中的起点和终点(深克隆)
        if (!autoPlanData.isStart) {
          if (autoPlanData.endNava.id && autoPlanData.endNava.id === navaid.id) {
            this.$message.warning('不能选择同一航标进行自动规划');
            return;
          }
          // 查找起点的下标
          let startIndex = navaLsit.findIndex((item) => item.navaidId === navaid.id);
          if (autoPlanData.endNava.id) {
            let index = navaLsit.findIndex((item) => item.navaidId === autoPlanData.endNava.id);
            if (index <= startIndex) {
              this.$message.warning('终点航标不能在起点航标之前');
              return;
            }
          }
          autoPlanData.startNava = deepClone(navaid);
          if (!flag) {
            autoPlanData.selectWaterwayId = [...autoPlanData.selectWaterwayId, navaid.id];
          }
          autoPlanData.isStart = !autoPlanData.isStart;
        } else if (autoPlanData.isStart && !autoPlanData.isEnd) {
          if (autoPlanData.startNava.id === navaid.id) {
            this.$message.warning('不能选择同一航标进行自动规划');
            return;
          }
          // 查找终点的下标
          let endIndex = navaLsit.findIndex((item) => item.navaidId === navaid.id);
          if (autoPlanData.startNava.id) {
            let index = navaLsit.findIndex((item) => item.navaidId === autoPlanData.startNava.id);
            if (index >= endIndex) {
              this.$message.warning('终点航标不能在起点航标之前!!');
              return;
            }
          }
          autoPlanData.endNava = deepClone(navaid);
          // autoPlanData.selectWaterwayId = flag
          //   ? autoPlanData.selectWaterwayId.filter(iid => iid !== navaid.id)
          //   : [...autoPlanData.selectWaterwayId, navaid.id];
          if (!flag) {
            autoPlanData.selectWaterwayId = [...autoPlanData.selectWaterwayId, navaid.id];
          }
          autoPlanData.isEnd = !autoPlanData.isEnd;
        }
      } else {
        console.log('手动');
        this.currentNava = navaid;
      }
    },
    /**
     * 关闭新增的航标Dialog
     */
    handleAddBoxClose() {
      if (this.toNavaInstance.length) {
        this.toNavaInstance = this.addPolyLine(this.mapInstance, [], this.toNavaInstance);
      }
      this.resetNavaAddData();
    },
    /**
     * 点击当前航标
     */
    handleCurrentClick(type, value) {
      this.resetNavaAddData();
      let lng = value.locationObj.longitude,
        lat = value.locationObj.latitude;
      this.currentNava = value;
      for (let way of this.waterwayList) {
        //判断点击的航标所在的航道
        const flag = way.fixesArray.some((item) => {
          let wayLng = +item.lng.toFixed(6),
            wayLat = +item.lat.toFixed(6);
          return wayLat === lat && wayLng === lng;
        });
        if (flag && this.currentWay.every((item) => item.id !== way.id)) {
          this.currentWay.push(way);
          this.isShowHighlightWay = true;
        }
      }
      // 当航道操作栏打开时点击航标后续操作
      if (this.isShowWayDialog) {
        this.waterwayAddNava(value, this.currentWay);
      }
      // 显示当前航标能到达的所有航标
      this.showLineClickNava(value);
      this.$nextTick(() => {
        [...this.$refs.waterwayLine].map((item) => {
          item.$$getInstance().setOptions({ showDir: true });
        });
      });
    },
    /**
     * 点击航标插入到航道中
     */
    waterwayAddNava(currentNava, currentWayList) {
      const editaddway = this.$refs.editaddway;
      const wayAddData = this.wayAddData;
      const navaList = this.currentWayDialog.fixes;
      // 判断点击的航标是否在本航道中
      const isFlag = navaList.some((item) => item.navaidId == currentNava.id);
      //修改模式手动规划点击时 true,1 默认最后一个航标插入
      if (!wayAddData.isClick && wayAddData.plan === 1) {
        // console.log('修改模式下,手动规划');
        // 当前点击的点是不是在航道操作栏修改的点中
        if (isFlag) {
          this.$message.warning('不能点击本航道中的航标插入');
          return;
        }
        // 当在第一个航标前插入 直接在数组前面添加channelAddData.isClickFirstNava
        if (editaddway.cursorInsertIndex === -1) {
          navaList.unshift({ navaid: currentNava, navaidId: currentNava.id });
          // 显示点击航标半径和可导航范围
        } else {
          // 插入该点的后面
          navaList.splice(editaddway.cursorInsertIndex + 1, 0, {
            navaid: currentNava,
            navaidId: currentNava.id
          });
          // 默认光标位置channelAddData.cursorInsertIndex++;
          editaddway.cursorInsertIndex = navaList.length - 1;
        }
        //实时显示航道长度航道的起点和终点
        this.showLineAndDistance();
      }
      // 修改模式,自动规划 或者 新增模式,自动规划
      else if (
        (wayAddData.isClick && wayAddData.plan === 0) ||
        (!wayAddData.isClick && !wayAddData.plan === 0)
      ) {
        // console.log('修改模式下,自动规划 或者 新增模式下,自动规划');
        // 判断点击的航标是否在本航道中
        // 当有长度时只能在本航道点击
        if (navaList.length) {
          if (!isFlag) {
            this.$message.warning('请选择本航道中的航标自动规划');
            return;
          }
          //将点击的航标赋值给自动规划中的起点和终点
          if (!editaddway.autoPlanData.isStart) {
            if (currentNava.id === editaddway.autoPlanData.endNava.id) {
              this.$message.warning('不能选择同一航标进行自动规划');
              return;
            }
            // 查找起点的下标
            let startIndex = navaList.findIndex((item) => item.navaidId === currentNava.id);
            if (editaddway.autoPlanData.endNava.id) {
              let index = navaList.findIndex(
                (item) => item.navaidId === editaddway.autoPlanData.endNava.id
              );
              if (index <= startIndex) {
                this.$message.warning('终点航标不能在起点航标之前!');
                return;
              }
            }
            editaddway.autoPlanData.startNava = deepClone(currentNava);
            editaddway.autoPlanData.isStart = !editaddway.autoPlanData.isStart;
          } else if (editaddway.autoPlanData.isStart && !editaddway.autoPlanData.isEnd) {
            if (currentNava.id === editaddway.autoPlanData.startNava.id) {
              this.$message.warning('不能选择同一航标进行自动规划');
              return;
            }
            // 查找终点的下标
            let endIndex = navaList.findIndex((item) => item.navaidId === currentNava.id);
            if (editaddway.autoPlanData.startNava.id) {
              let index = navaList.findIndex(
                (item) => item.navaidId === editaddway.autoPlanData.startNava.id
              );
              if (index >= endIndex) {
                this.$message.warning('终点航标不能在起点航标之前!!');
                return;
              }
            }
            editaddway.autoPlanData.endNava = deepClone(currentNava);
            editaddway.autoPlanData.isEnd = !editaddway.autoPlanData.isEnd;
          }
        } else {
          //将点击的航标赋值给自动规划中的起点和终点
          if (!editaddway.autoPlanData.isStart) {
            if (currentNava.id === editaddway.autoPlanData.endNava.id) {
              this.$message.warning('不能选择同一航标进行自动规划');
              return;
            }
            editaddway.autoPlanData.startNava = deepClone(currentNava);
            editaddway.autoPlanData.isStart = !editaddway.autoPlanData.isStart;
            // map.ChannelRadiusCircle = currentNava;
          } else if (editaddway.autoPlanData.isStart && !editaddway.autoPlanData.isEnd) {
            if (currentNava.id === editaddway.autoPlanData.startNava.id) {
              this.$message.warning('不能选择同一航标进行自动规划');
              return;
            }
            editaddway.autoPlanData.endNava = deepClone(currentNava);
            editaddway.autoPlanData.isEnd = !editaddway.autoPlanData.isEnd;
          }
        }
        //实时显示航道长度航道的起点和终点
        this.showLineAndDistance();
      }

      //新增模式 手动规划  false,1
      else if (wayAddData.isClick && wayAddData.plan === 1) {
        // console.log('新增模式下,手动规划');
        if (!navaList.length) {
          // 手动规划新增
          this.$set(navaList, navaList.length, {
            navaidId: currentNava.id,
            navaid: currentNava
          });
          //默认光标位置
          editaddway.cursorInsertIndex = 0;
        } else {
          if (isFlag) {
            this.$message.warning('不能选择本航道中的航标插入');
            return;
          }
          // 手动规划新增
          this.$set(navaList, navaList.length, {
            navaidId: currentNava.id,
            navaid: currentNava
          });
          //默认光标位置
          editaddway.cursorInsertIndex = navaList.length - 1;
        }
        //实时显示航道长度航道的起点和终点
        this.showLineAndDistance();
      }
      //新增模式,自动规划
      // else if (!wayAddData.isClick && !wayAddData.plan) {}
      // console.log('插入位置' + editaddway.cursorInsertIndex);
    },
    /**
     * 关闭航道,航标的信息框
     */
    handleBoxClose(type) {
      if (type === 'nava') {
        if (this.isShowWayDialog) {
          this.currentNava = null;
          return;
        }
        this.currentNava = null;
      } else if (type === 'way') {
        this.currentWayDialog = { fixes: [] };
        this.currentNava = null;
      }
      this.resetPublicData();
    },
    /**
     * 关闭航道操作栏
     */
    handleWayCancel() {
      this.currentWayDialog = { fixes: [] };
      this.currentNava = null;
      this.resetPublicData();
    },
    /**
     * 重置新增航标数据
     */
    resetNavaAddData() {
      this.isRequest = true;
      this.isClickMap = false;
      this.navaAddData = {
        isClick: false,
        ident: '',
        latitude: null,
        longitude: null,
        radius: 1000,
        zoomLevel: 3
      };
    },
    /**
     * 重置一些公共数据
     */
    resetPublicData() {
      this.resetNavaAddData();
      if (this.lineInstance.length) {
        this.lineInstance = this.addPolyLine(this.mapInstance, [], this.lineInstance);
      }
      if (this.toNavaInstance.length) {
        this.toNavaInstance = this.addPolyLine(this.mapInstance, [], this.toNavaInstance);
      }
      this.isShowWayDialog = false;
      this.wayAddData.isShowTips = false;
      this.currentWay = [];
    },
    /**
     * 防抖: 缩放,拖拽地图时请求数据
     */
    getMapBounds: debounce(async function (boundPath, zoomLevel, mapCenter, mapInstance) {
      this.mapInstance = mapInstance;
      this.zoomLevel = zoomLevel;
      this.publicQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath.TopLeft);
      this.publicQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath.TopRight);
      this.publicQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath.BottomLeft);
      this.publicQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath.BottomRight);
      this.publicQuery['Condition.ZoomLevel'] = zoomLevel;
      if (!this.isRequest) return;
      await Promise.all([this.getNavaList(), this.getWaterwayList()]);
      // if (this.currentNava && !this.navaList.find((item) => item.id === this.currentNava.id)) {
      //   this.currentNava = null;
      // }
      if (this.toNavaInstance.length && this.currentNava) {
        // 显示当前航标能到达的所有航标
        this.showLineClickNava(this.currentNava);
      }
      if (this.navaAddData.latitude) {
        this.showLineClickNava(this.navaAddData);
      }
    }, 500),

    /**
     * 点击地图获取坐标
     */
    getMapLngLat(p) {
      if (!this.isClickMap) return;
      let lng = p.lng,
        lat = p.lat;
      this.navaAddData.latitude = lat;
      this.navaAddData.longitude = lng;
      this.showLineClickNava(this.navaAddData);
    },
    /**
     * 点击航标添加
     */
    handleAddNava() {
      this.isRequest = false;
      this.handleWayCancel();
      this.navaAddData.isClick = true;
      this.isClickMap = true;
      this.$message.info('开启了航标新增，请点击地图');
    },
    /**
     * 点击航道添加
     */
    handleAddWay() {
      this.resetNavaAddData();
      this.handleWayCancel();
      this.isShowWayDialog = true;
      this.wayAddData.isClick = true;
      this.wayAddData.plan = 1; //手动规划
      this.$message.info('开启了新增航道，请点击地图航标或者开启自动规划');
    }
  }
};
