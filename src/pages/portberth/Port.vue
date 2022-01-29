<template>
  <div class="port-content">
    <table-search buttonName="添加港口" class="port-search" @handleDrag="handleAddPortClick" />
    <!-- 封装的表格 -->
    <port-table
      :tableIndex="false"
      :berthList="berthList"
      :pointList="pointList"
      :portList="portList"
      :procedureList="procedureList"
      :transitionList="transitionList"
      :tableOption="tableOption"
      @buttonClick="tableButtonClick"
      @handleTabClick="handleTabClick"
      @handleSwitchChange="handleSwitchChange"
      @handleAddBtn="handleAddBtn"
    />

    <Amap ref="amap" :isEdit="isClickMap" @getMapBounds="getMapBounds" @getLngLat="getMapLngLat">
      <template #port_berth>
        <!-- 港口航道 -->
        <template v-if="waterwayList">
          <el-amap-polyline
            v-for="item in waterwayList"
            :key="item.id + '22'"
            :path="item.fixesArray"
            :strokeColor="item.color"
            :strokeWeight="item.strokeWeight || 3"
            :extData="item"
            :events="waterwayEvents"
            lineJoin="round"
          >
          </el-amap-polyline>
        </template>
        <!-- 港口航标-->
        <template v-if="navaList">
          <el-amap-marker
            v-for="item in navaList"
            :key="item.id"
            :position="item.locationArr"
            :offset="[-5, -5]"
          >
            <NavaMarker :item="item"></NavaMarker>
          </el-amap-marker>
        </template>
        <!-- 港口 -->
        <template v-if="portList.length">
          <template v-for="port in portList">
            <el-amap-marker :key="port.id + '11'" :position="port.locationArr" :zIndex="108">
              <PortDialog
                :port="port"
                :currentPort="currentPort"
                @handleCurrentClick="handleCurrentClick"
                @handleBoxClose="handleBoxClose"
                @handleDelete="handleDelete"
                @handleEdit="handleEdit"
              ></PortDialog>
            </el-amap-marker>
            <!-- 港口范围-->
            <el-amap-polygon
              v-if="currentPort.id"
              :key="port.id + 'aa'"
              :path="cachePortBoundList"
              :editable="currentPort.isPortEdit"
              strokeColor="#242f42"
              fillColor="#71b8fe"
              :extData="port"
              :events="portLineEvents"
              :zIndex="50"
            ></el-amap-polygon>
          </template>
        </template>

        <!-- 新增港口 -->

        <template v-if="addPortData && addPortData.latitude">
          <el-amap-marker
            :position="[addPortData.longitude, addPortData.latitude]"
            :offset="[-18, -15]"
            :zIndex="999"
          >
            <AddPortDialog
              :port="addPortData"
              :currentPort="addPortData"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            ></AddPortDialog>
          </el-amap-marker>
          <!-- 新增港口范围 -->
          <el-amap-polygon
            v-if="addPortData.bounds.length"
            :editable="true"
            :path="addPortData.bounds"
            strokeColor="#dfc3cb"
            fillColor="#dfc3cb"
            strokeWeight="1"
            :zIndex="999"
            :events="addPortLineEvents"
          ></el-amap-polygon>
        </template>

        <!-- 泊位 -->
        <template v-if="berthList.length">
          <el-amap-marker
            v-for="berth in berthList"
            :key="berth.id + '33'"
            :position="berth.locationArr"
            :offset="[-3, -3]"
            :zIndex="currentBerth && currentBerth.id === berth.id ? 1000 : 100"
          >
            <BerthDialog
              :value="berth"
              :currentValue="currentBerth"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleDelete="handleDelete"
              @handleEdit="handleEdit"
            />
          </el-amap-marker>

          <!-- 泊位范围 -->
          <el-amap-polygon
            v-for="bound in berthList"
            :key="bound.id + 'bb'"
            :path="bound.boundList"
            strokeColor="#2f343e"
            strokeStyle="solid"
            fillColor="#74a5e5"
            :events="BerthLineEvents"
            :extData="bound"
            :editable="currentBerth && currentBerth.id === bound.id"
            :strokeWeight="currentBerth && currentBerth.id === bound.id ? 2 : 1"
            :zIndex="currentBerth && currentBerth.id === bound.id ? 1000 : 100"
          ></el-amap-polygon>
        </template>
        <!-- 端点-->
        <template v-if="pointList.length">
          <el-amap-marker
            v-for="(point, index) in pointList"
            :key="index + 'ee'"
            :position="point.locationArr"
            :offset="[-3, -3]"
            :events="pointEvents"
            :extData="point"
            :draggable="currentPoint && currentPoint.id === point.id"
            :zIndex="currentPoint && currentPoint.id == point.id ? 1000 : 100"
          >
            <PointDialog
              :value="point"
              :currentValue="currentPoint"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleDelete="handleDelete"
              @handleEdit="handleEdit"
            />
          </el-amap-marker>
        </template>
        <!--进出港程序-->
        <template v-if="procedureList.length">
          <div ref="procedure">
            <template v-for="item in procedureList">
              <el-amap-polyline
                :key="item.id + 'cc'"
                :strokeColor="item.type === 1 ? '#00000' : ' #8af22d'"
                strokeStyle="dashed"
                :geodesic="true"
                :path="item.boundList"
                :strokeWeight="
                  currentProcedure && currentProcedure.id === item.id ? 6 : item.strokeWeight
                "
                :events="procedureLineEvents"
                :bubble="true"
                :editable="currentProcedure && currentProcedure.id === item.id"
                :extData="item"
                lineJoin="round"
                :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
              >
              </el-amap-polyline>
              <el-amap-marker
                :key="item.id + 'hh'"
                :position="item.centerPoint"
                :events="procedureMarkerEvents"
                :extData="item"
                :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
              >
                <ProcedureMarker :value="item" @handleCurrentClick="handleCurrentClick" />
              </el-amap-marker>
              <template v-if="currentProcedure && currentProcedure.id === item.id">
                <el-amap-marker
                  :key="item.id + 'jj'"
                  :position="item.centerPoint"
                  :extData="item"
                  :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
                >
                  <!-- 程序信息框 -->
                  <ProcedureDialog
                    :value="item"
                    :currentValue="currentProcedure"
                    :pointList="pointList"
                    @handleBoxClose="handleBoxClose"
                    @handleDelete="handleDelete"
                    @handleEdit="handleEdit"
                  />
                </el-amap-marker>
              </template>
            </template>
          </div>
        </template>
        <!--过渡路径-->
        <template v-if="transitionList.length">
          <div ref="transition">
            <template v-for="(item, index) in transitionList">
              <el-amap-polyline
                :key="index + 'ff'"
                :path="item.path"
                :events="transitionLineEvents"
                :extData="item"
                lineJoin="round"
                :strokeColor="item.direction === 1 ? '#976F02' : '#00C227'"
                :editable="currentTransition && currentTransition.id === item.id"
                :strokeWeight="
                  currentTransition && currentTransition.id === item.id ? 6 : item.strokeWeight
                "
                :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
              >
              </el-amap-polyline>
              <el-amap-marker
                :key="index + 'kk'"
                :position="item.centerPoint"
                :events="transitionMarkerEvents"
                :extData="item"
                :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
              >
                <TransitionMarker :value="item" @handleCurrentClick="handleCurrentClick" />
              </el-amap-marker>
              <template v-if="currentTransition && currentTransition.id === item.id">
                <el-amap-marker
                  :position="item.centerPoint"
                  :events="transitionMarkerEvents"
                  :key="index + 'll'"
                >
                  <!-- 过渡路径信息框 -->
                  <TransitionDialog
                    :value="item"
                    :currentValue="currentTransition"
                    :pointList="pointList"
                    :navaList="navaList"
                    :berthList="berthList"
                    @handleBoxClose="handleBoxClose"
                    @handleDelete="handleDelete"
                    @handleEdit="handleEdit"
                  />
                </el-amap-marker>
              </template>
            </template>
          </div>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
import Amap from 'components/amap/Amap';
import PortTable from './components/S-PortTable.vue';
import TableSearch from 'components/common/table-search/TableSearch';
import NavaMarker from './components/S-NavaMarker';
import ProcedureMarker from './components/S-ProcedureMarker';
import TransitionMarker from './components/S-TransitionMarker';
import PortDialog from './components/S-PortDialog.vue';
import AddPortDialog from './components/S-AddPortDialog.vue';
import BerthDialog from './components/S-BerthDialog.vue';
import PointDialog from './components/S-PointDialog.vue';
import ProcedureDialog from './components/S-ProcedureDialog.vue';
import TransitionDialog from './components/S-TransitionDialog.vue';
import * as portApi from 'api/port';
import { turnLngLat, path2Str } from '@/utils/handleLngLat';
import { debounce, deepClone, confirmMsg } from '@/utils';
import { BASE_CONSTANTS, PAGE_SIZE } from '@/config';
//提取的公共js文件
import amapEvents from './mixins-js/amapEvents';
import getLsit from './mixins-js/getList';
import editList from './mixins-js/editList';

export default {
  name: 'portberth',
  mixins: [amapEvents, getLsit, editList], //混入的js
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
    AddPortDialog
  },
  created() {
    // this.getNavaList();
  },
  mounted() {
    // console.log(this.$refs.amap.mapInstance);
  },
  data() {
    return {
      radio3: '',

      tableOption: Object.freeze({
        label: '操作',
        width: 80,
        options: [
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: (row, index) => this.handleDelete(row.id, row.delApi)
          }
        ]
      }),
      BASE_CONSTANTS: Object.freeze(BASE_CONSTANTS),
      total: 0,
      tableData: [],
      currentPort: { isPortEdit: false },
      cachePortBoundList: Object.freeze({}), //当前港口范围路径
      currentBerth: null,
      currentPoint: null,
      currentProcedure: null,
      currentTransition: null,
      isRequest: true, //是否可以请求港口信息
      isClickMap: false, //是否可以点击地图获取坐标
      zoomLevel: 15,
      isSetView: true,
      publicQuery: {
        'Condition.Id': '',
        'Condition.PortId': '',
        'Condition.Type': null, //在程序Procedure中1代表离港，2代表进港
        'Condition.IsInEffect': true,
        'Condition.Rect.TopLeft': '',
        'Condition.Rect.TopRight': '',
        'Condition.Rect.BottomLeft': '',
        'Condition.Rect.BottomRight': '',
        'Condition.ZoomLevel': 15,
        'Condition.Keyword': '',
        Page: 1,
        Size: 1e6
      },

      addPortData: {
        isClick: false, //是否点击了新增港口按钮
        isStartDraw: false,
        name: '',
        ident: '',
        zoomLevel: 0,
        bounds: [],
        longitude: null,
        latitude: null,
        area: ''
      },
      addBerthData: {
        isClick: false, //是否点击了新增泊位按钮
        isStartDraw: false,
        portId: null,
        ident: '',
        bounds: [],
        longitude: null,
        latitude: null,
        area: ''
      },
      addPointData: {
        isClick: false, //是否点击了新增泊位按钮
        longitude: null,
        latitude: null,
        Id: null,
        Ident: '',
        Location: null
      }
    };
  },
  methods: {
    //点击Switch按钮事件
    async handleSwitchChange(value, row, index) {
      console.log(value, row);
      this.enableAndDisable(value, row);
    },
    handleAddBtn(type) {
      console.log(type);
      if (type === 'berth') {
      }
    },
    // 设置泊位 程序 过渡路径是否生效
    async enableAndDisable(value, row) {
      const id = row.id;
      const type = row.uid;
      let nameFun = type.slice(0, 1).toUpperCase() + type.slice(1);
      let apiFunc = value ? `apiEn${nameFun}` : `apiDis${nameFun}`;
      const confirmRes = await confirmMsg(this, `此操作将设置成${value ? '' : '不'}生效`);
      const { errorCode } = await portApi[apiFunc](id);
      if (confirmRes === 'confirm') {
        if (+errorCode === 0) {
          this.$message.success('设置成功');
          if (type === 'berth') {
            this.getBerthList(this.currentPort.id);
          } else if (type === 'procedure') {
            this.getProcedureList(this.currentPort.id);
          } else if (type === 'transition') {
            this.getTransitionList(this.currentPort.id);
          }
        }
      }
    },

    handleTabClick(type, current) {
      return;
      if (type === 'port') {
        this.tableData = this.portList;
        this.tableColumn = [
          { prop: 'name', label: '名称' },
          {
            prop: 'locationObj',
            label: '坐标',
            render: (val) => `${val.longitude.toFixed(6)}，${val.latitude.toFixed(6)} `
          },
          {
            prop: 'area',
            label: '面积',
            render: (val) => `${val} ㎡`
          }
        ];
        console.log(this.tableData);
      } else if (type === 'berth') {
        this.tableData = this.berthList;

        console.log(this.tableData);
      }
    },
    handleAddPortClick() {
      this.addPortData.isClick = true;
      this.isClickMap = true;
      console.log('点击了新增港口按钮');
    },
    handleAddBoxClose(type) {
      console.log('handleAddBoxClose ', type);
    },
    handleAddSava(type, value) {
      console.log('handleAddSava', value);
      if (type === 'port') {
        this.addPort();
      }
    },
    /**
     * 新增港口
     */
    async addPort() {
      const identReg = /^[A-Z]{4}$/;
      const data = this.addPortData;
      if (!identReg.test(data.ident)) {
        this.$message.warning('标识应由四个大写字母组成');
        return;
      }
      data.bounds = path2Str(data.bounds);
      if (!data.bounds) {
        this.$message.warning('港口的范围不能为空');
        return;
      }
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await portApi.apiAddPort(data);
      if (+errorCode === 0) {
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        data = {
          isClick: false, //是否点击了新增港口按钮
          isStartDraw: false,
          name: '',
          ident: '',
          zoomLevel: 0,
          bounds: [],
          longitude: null,
          latitude: null,
          area: ''
        };
        this.$message.success('添加成功');
      }
    },

    /**
     * 点击地图获取坐标
     */
    getMapLngLat(p) {
      if (!this.isClickMap) return;
      let lng = p.lng,
        lat = p.lat;
      const addPortData = this.addPortData;
      const addBerthData = this.addBerthData;
      this.isRequest = false; //当新增,不允许网络请求
      // 第一次点击,确定港口坐标点,第二次才开始绘制
      if (addPortData.isStartDraw) {
        addPortData.bounds.push([lng, lat]); //控制是否可以绘制范围的标识
        let area = Math.round(AMap.GeometryUtil.ringArea(addPortData.bounds));
        addPortData.area = area;
      }
      if (addPortData.isStartDraw) {
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
    },

    /**
     * 防抖: 缩放,拖拽地图时请求数据
     */
    getMapBounds: debounce(async function (boundPath, zoomLevel, center) {
      const amap = this.$refs.amap;
      this.zoomLevel = zoomLevel;
      let clitentArea = Math.round(AMap.GeometryUtil.ringArea(boundPath));
      this.publicQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath[3]);
      this.publicQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath[2]);
      this.publicQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath[1]);
      this.publicQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath[0]);
      this.publicQuery['Condition.ZoomLevel'] = zoomLevel;
      this.getWaterwayList(this.publicQuery);
      if (this.isRequest) {
        await Promise.all([this.getPortList(this.publicQuery), this.getNavaList(this.publicQuery)]);
        this.tableData = this.portList;
      }
      if (!this.portList.length) return;
      let currentPort = {}; //获取距离地图正中心最近的港口
      if (this.portList.length === 1) {
        currentPort = currentPort = this.portList[0];
      } else if (this.portList.length > 1) {
        currentPort = this.portList.reduce((p, c) => {
          let pre = AMap.GeometryUtil.distance(
            [center.lng, center.lat],
            [p.locationObj.longitude, p.locationObj.latitude]
          );
          let cur = AMap.GeometryUtil.distance(
            [center.lng, center.lat],
            [c.locationObj.longitude, c.locationObj.latitude]
          );
          return pre > cur ? c : p;
        });
      }
      this.isSetView = clitentArea <= currentPort.area * 80;
      if (
        currentPort.id &&
        this.isSetView //如果当前港口视口面积为地图视口面积的80倍
      ) {
        //显示距离正中心最近的港口信息
        this.currentPort = { ...this.currentPort, ...currentPort };
        this.cachePortBoundList = deepClone(this.currentPort.boundList); //缓存当前港口的范围
        if (this.isRequest) this.showPortArea(this.currentPort, amap);
      } else {
        // 重置数据
        this.currentPort = { isPortEdit: false };
        this.currentBerth = null;
        this.currentPoint = null;
        this.currentProcedure = null;
        this.currentTransition = null;
        this.berthList = [];
        this.pointList = [];
        this.procedureList = [];
        this.transitionList = [];
        currentPort = null;
        this.isRequest = true; // 可以继续请求数据
      }
    }, 400),
    /**
     * 显示当前港口详情范围
     */
    showPortArea(currentPort, amap) {
      const { id, name } = currentPort;
      // console.log('当前港口:', name);
      this.getBerthList(id); // 泊位列表方法
      this.getPointList(id); //端点数据的方法
      this.getProcedureList(id); //程序路径列表方法  程序
      this.getTransitionList(id); //过渡路径数据的方法  过渡
    },
    /**
     * 点击不同的maker标显示信息
     */
    async handleCurrentClick(type, value) {
      const amap = this.$refs.amap;
      if (type === 'port') {
        this.currentPort = { ...value, isPortEdit: true };
        this.isRequest = false;
        this.cachePortBoundList = deepClone(this.currentPort.boundList); //当前港口的范围
        if (!this.isSetView) await amap.setMapFitView(value.boundList); //地图自适应
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
    },

    /**
     * 删除港口,泊位,程序,端点,过渡路径
     */
    async handleDelete(id, api) {
      const requestFun = portApi[api];
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await requestFun(id);
        if (+errorCode === 0) {
          const list = `${api.slice(6).toLowerCase()}List`;
          let index = this[list].findIndex((item) => item.id === id);
          this[list].splice(index, 1);
          this.$message.success('删除成功');
        }
      }
    },

    //表格操作项调用事件
    tableButtonClick(options) {
      options.methods.call(this, options.row, options.index);
    }
  }
};
</script>
<style scoped lang="less">
.port-content {
  position: relative;
  width: 100%;
  height: 100%;
  .port-search {
    position: absolute;
    top: 0px;
    z-index: 99;
    width: 70%;
  }
}

/**地图中的公共框中的X*/
/deep/.port-box {
  .el-icon-close {
    padding: 0 3px 3px;
    position: absolute;
    right: 10px;
    font-size: 18px;
    &:hover {
      cursor: pointer;
    }
  }
}
</style>
