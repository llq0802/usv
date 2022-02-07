// 子组件
import Amap from 'components/amap/Amap';
import PortTable from './components/S-PortTable.vue';
import TableSearch from 'components/common/keyword-search/KeywordSearch';
import NavaMarker from './components/S-NavaMarker';
import ProcedureMarker from './components/S-ProcedureMarker';
import TransitionMarker from './components/S-TransitionMarker';
import PortDialog from './components/S-PortDialog.vue';
import BerthDialog from './components/S-BerthDialog.vue';
import PointDialog from './components/S-PointDialog.vue';
import ProcedureDialog from './components/S-ProcedureDialog.vue';
import TransitionDialog from './components/S-TransitionDialog.vue';
import AddPortDialog from './components/S-AddPortDialog.vue';
import AddBerthDialog from './components/S-AddBerthDialog.vue';
import AddPointDialog from './components/S-AddPointDialog.vue';
import AddProcedureDialog from './components/S-AddProcedureDialog.vue';
import AddTransitionDialog from './components/S-AddTransitionDialog.vue';
// 工具方法
import { turnLngLat, str2Path } from '@/utils/handleLngLat';
import { debounce, deepClone } from '@/utils';
//提取的本页公共js文件
import amapEvents from './mixins-js/amapEvents';
import tableEvents from './mixins-js/tableEvents';
import getLsit from './mixins-js/getList';
import editList from './mixins-js/editList';
import addList from './mixins-js/addList';
import delList from './mixins-js/delList';
import utils from './mixins-js/utils';
export default {
  name: 'port',
  mixins: [amapEvents, getLsit, editList, addList, delList, tableEvents, utils], //混入的js
  components: {
    Amap,
    PortTable,
    TableSearch,
    NavaMarker,
    ProcedureMarker,
    TransitionMarker,
    PortDialog,
    BerthDialog,
    PointDialog,
    ProcedureDialog,
    TransitionDialog,
    AddPortDialog,
    AddBerthDialog,
    AddPointDialog,
    AddProcedureDialog,
    AddTransitionDialog
  },
  created() {
    this.$nextTick(() => {
      document.addEventListener('keydown', this.keydown);
    });
  },
  activated() {
    this.$nextTick(() => {
      document.addEventListener('keydown', this.keydown);
    });
  },
  deactivated() {
    document.removeEventListener('keydown', this.keydown);
  },
  data() {
    return {
      currentPort: { isPortEdit: false },
      cachePortBoundList: Object.freeze([]), //当前港口范围路径
      currentBerth: null,
      currentPoint: null,
      currentProcedure: null,
      currentTransition: null,
      isRequest: true, //是否可以请求港口信息
      isClickMap: false, //是否可以点击地图获取坐标
      isShowPortDetail: false, //是否展示当前港口详情
      isCtrl: false,
      publicQuery: {
        //公共的请求参数
        'Condition.Id': '',
        'Condition.PortId': '',
        'Condition.Type': null, //在程序Procedure中1代表离港，2代表进港
        'Condition.IsInEffect': true,
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
     * 搜索框选择港口
     */
    selectPort(value) {
      this.isShowPortDetail = false;
      value.boundList = str2Path(value.bounds);
      this.handleCurrentClick('port', value);
    },
    /**
     * 点击地图事件,获取坐标
     */
    getMapLngLat(p) {
      if (!this.isClickMap) return;
      let lng = p.lng,
        lat = p.lat;
      const addPortData = this.addPortData;
      const addBerthData = this.addBerthData;
      const addPointData = this.addPointData;
      const addProcedureData = this.addProcedureData;
      const addTransitionData = this.addTransitionData;
      this.isRequest = false; //当新增,不允许网络请求
      // 第一次点击,确定港口坐标点,第二次才开始绘制
      if (addPortData.isStartDraw) {
        addPortData.bounds.push([lng, lat]); //控制是否可以绘制范围的标识
        let area = Math.round(AMap.GeometryUtil.ringArea(addPortData.bounds));
        addPortData.area = area;
      }
      if (addBerthData.isStartDraw) {
        // 第一次点击,确定泊位坐标点,第二次才开始绘制
        addBerthData.bounds.push([lng, lat]);
        let area = Math.round(AMap.GeometryUtil.ringArea(addBerthData.bounds));
        addBerthData.area = area;
      }
      if (addPortData.isClick) {
        addPortData.isStartDraw = true;
        addPortData.latitude = lat;
        addPortData.longitude = lng;
        addPortData.isClick = false;
      }
      if (addBerthData.isClick) {
        addBerthData.isStartDraw = true;
        addBerthData.latitude;
        addBerthData.latitude = lat;
        addBerthData.longitude = lng;
        addBerthData.isClick = false;
      }
      if (addPointData.isClick) {
        addPointData.latitude = lat;
        addPointData.longitude = lng;
        addPointData.isClick = false;
      }
      //点击新增程序
      if (addProcedureData.isClick) {
        if (this.pointList.length < 2) {
          this.$message.error(',当前港口没有两个及以上端点，请先新增端点');
          return false;
        }
        this.addProcedureClick(lng, lat);
      }
      //点击新增过渡路径
      if (addTransitionData.isClick) {
        if (!this.pointList.length || !this.berthList.length) {
          this.$message.error('请先新增端点和泊位');
          return false;
        }
        this.addTransitionClick(lng, lat);
      }
    },
    /**
     * 点击了港口新增按钮
     */
    handleAddPortClick() {
      this.resetAddData();
      this.handleBoxClose();
      this.addPortData.isClick = true;
      this.isClickMap = true;
      this.isRequest = false;
      this.$message.info('开启了港口添加，请点击地图');
      console.log('点击了新增港口按钮');
    },
    /**
     * 点击了泊位,端点,过渡路径,程序的新增按钮
     */
    handleAddBtn(type) {
      this.resetAddData();
      this.isClickMap = true;
      if (type === 'berth') {
        this.$message.info('开启了泊位添加，请点击地图');
        this.addBerthData.isClick = true;
        this.handleBoxClose();
      }
      if (type === 'point') {
        this.$message.info('开启了端点添加，请点击地图');
        this.addPointData.isClick = true;
        this.handleBoxClose();
      }
      if (type === 'procedure') {
        this.$message.info('开启了程序添加，请点击地图');
        this.addProcedureData.isClick = true;
        this.handleBoxClose();
      }
      if (type === 'transition') {
        this.$message.info('开启了过渡路径添加，请点击地图');
        this.addTransitionData.isClick = true;
        this.handleBoxClose();
      }
    },
    /**
     * 防抖: 缩放,拖拽地图时请求数据
     */
    getMapBounds: debounce(async function (boundPath, zoomLevel, center) {
      let clitentArea = Math.round(AMap.GeometryUtil.ringArea(boundPath));
      this.publicQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath[3]);
      this.publicQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath[2]);
      this.publicQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath[1]);
      this.publicQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath[0]);
      this.publicQuery['Condition.ZoomLevel'] = zoomLevel;
      if (this.isRequest) {
        this.getPortList(this.publicQuery);
      }
      await Promise.all([
        this.getNavaList(this.publicQuery),
        this.getWaterwayList(this.publicQuery)
      ]);
      if (!this.portList.length) return;
      let currentPort = {};
      if (this.portList.length === 1) {
        currentPort = currentPort = this.portList[0];
      } else if (this.portList.length > 1) {
        currentPort = this.getMinPoint([[center.lng, center.lat]], this.portList); //获取距离地图正中心最近的港口
      }
      this.isShowPortDetail = clitentArea <= currentPort.area * 80;
      if (
        currentPort.id &&
        this.isShowPortDetail //如果当前港口视口面积为地图视口面积的80倍
      ) {
        this.currentPort = { ...this.currentPort, ...currentPort };
        this.cachePortBoundList = deepClone(this.currentPort.boundList); //缓存当前港口的范围
        if (this.isRequest) this.showPortArea(this.currentPort); //显示距离正中心最近的港口信息
      } else {
        currentPort = null;
        this.resetMapBounds();
      }
    }, 500),
    /**
     * 显示当前港口详情
     */
    showPortArea(currentPort) {
      const { id } = currentPort;
      this.getBerthList(id); // 泊位列表方法
      this.getPointList(id); //端点数据的方法
      this.getProcedureList(id); //程序路径列表方法
      this.getTransitionList(id); //过渡路径数据的方法
    },
    // 重置数据
    resetMapBounds() {
      this.handleBoxClose();
      this.resetAddData('port');
      this.berthList = [];
      this.pointList = [];
      this.cachePortBoundList = [];
      this.procedureList = [];
      this.transitionList = [];
      this.isRequest = true; // 可以继续请求数据
    },
    /**
     * 点击不同的maker标显示信息
     */
    async handleCurrentClick(type, value) {
      const amap = this.$refs.amap;
      this.resetAddData();
      if (type === 'port') {
        this.currentPort = { ...value, isPortEdit: true };
        this.isRequest = false;
        this.cachePortBoundList = deepClone(this.currentPort.boundList); //当前港口的范围
        if (!this.isShowPortDetail) {
          await amap.setMapFitView(value.boundList); //地图自适应显示图标
          this.isShowPortDetail = true;
        }
        this.isRequest = true;
        this.currentBerth = null;
        this.currentPoint = null;
        this.currentProcedure = null;
        this.currentTransition = null;
      } else if (type === 'berth') {
        this.currentBerth = value;
        this.currentPort.isPortEdit = false;
        this.currentPoint = null;
        this.currentProcedure = null;
        this.currentTransition = null;
      } else if (type === 'point') {
        this.currentPoint = value;
        this.currentPort.isPortEdit = false;
        this.currentBerth = null;
        this.currentProcedure = null;
        this.currentTransition = null;
      } else if (type === 'procedure') {
        this.currentProcedure = value;
        this.currentPort.isPortEdit = false;
        this.currentPoint = null;
        this.currentBerth = null;
        this.currentTransition = null;
      } else if (type === 'transition') {
        this.currentTransition = value;
        this.currentPort.isPortEdit = false;
        this.currentPoint = null;
        this.currentBerth = null;
        this.currentProcedure = null;
      }
    },
    /**
     * 关闭信息框
     */
    async handleBoxClose(type) {
      if (!type) {
        if (this.currentPort.boundList) {
          this.cachePortBoundList = deepClone(this.currentPort.boundList); //缓存当前港口的范围
        }
        this.currentPort = { isPortEdit: false };
        this.currentBerth = null;
        this.currentTransition = null;
        this.currentPoint = null;
        this.currentProcedure = null;
        return;
      }
      this.isRequest = true; //关闭编辑或者成功编辑过会打开网络请求
      if (type === 'port') {
        await this.getPortList(this.publicQuery);
        this.cachePortBoundList = deepClone(this.currentPort.boundList); //缓存当前港口的范围
        this.currentPort.isPortEdit = false;
      } else if (type === 'berth') {
        this.currentBerth = null;
        this.getBerthList(this.currentPort.id);
      } else if (type === 'procedure') {
        this.currentProcedure = null;
        this.getProcedureList(this.currentPort.id);
      } else if (type === 'point') {
        this.currentPoint = null;
        this.getPointList(this.currentPort.id);
      } else if (type === 'transition') {
        this.currentTransition = null;
        this.getTransitionList(this.currentPort.id);
      }
    }
  }
};
