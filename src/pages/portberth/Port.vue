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
      :isShowPortDetail="isShowPortDetail"
      @buttonClick="tableButtonClick"
      @rowClick="tableRowClick"
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
              :bubble="true"
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
            :bubble="true"
            :editable="currentBerth && currentBerth.id === bound.id"
            :strokeWeight="currentBerth && currentBerth.id === bound.id ? 2 : 1"
            :zIndex="currentBerth && currentBerth.id === bound.id ? 1000 : 100"
          ></el-amap-polygon>
        </template>
        <!-- 新增泊位 -->
        <template v-if="addBerthData && addBerthData.latitude">
          <el-amap-marker
            :position="[addBerthData.longitude, addBerthData.latitude]"
            :offset="[-18, -15]"
            :zIndex="999"
          >
            <AddBerthDialog
              :value="addBerthData"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
          <!-- 新增泊位范围 -->
          <el-amap-polygon
            v-if="addBerthData.bounds.length"
            :editable="true"
            :path="addBerthData.bounds"
            strokeColor="#1dd1a1"
            strokeStyle="solid"
            strokeWeight="1"
            fillColor="#74a5e5"
            :strokeOpacity="0.8"
            :fillOpacity="0.8"
            :zIndex="999"
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
        <!--新增端点-->
        <template v-if="addPointData && addPointData.latitude">
          <el-amap-marker
            :position="[addPointData.longitude, addPointData.latitude]"
            :draggable="true"
            :offset="[-3, -3]"
            :zIndex="999"
            :bubble="true"
          >
            <AddPointDialog
              :value="addPointData"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
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
        <!-- 新增进出港程序 -->
        <template v-if="addProcedureData && addProcedureData.path.length">
          <el-amap-polyline
            :path="addProcedureData.path"
            strokeColor="#9F6732"
            :editable="true"
            :zIndex="999"
            lineJoin="round"
          >
          </el-amap-polyline>
          <el-amap-marker :position="addProcedureData.centerPoint" :offset="[-3, -3]" :zIndex="200">
            <AddProcedureDialog
              :value="addProcedureData"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
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

        <!-- 新增过渡路径 -->
        <template v-if="addTransitionData && addTransitionData.path">
          <el-amap-polyline
            :path="addTransitionData.path"
            strokeStyle="dashed"
            strokeColor="#9F6732"
            :editable="true"
            :zIndex="999"
            lineJoin="round"
          >
          </el-amap-polyline>
          <el-amap-marker
            v-if="addTransitionData && addTransitionData.path.length"
            :position="addTransitionData.centerPoint"
            :zIndex="900"
            :bubble="true"
          >
            <AddTransitionDialog
              :value="addTransitionData"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
// 子组件
import Amap from 'components/amap/Amap';
import PortTable from './components/S-PortTable.vue';
import TableSearch from 'components/common/table-search/TableSearch';
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
// 网络请求api
import * as portApi from 'api/port';
// 工具方法
import { turnLngLat, path2Str } from '@/utils/handleLngLat';
import { debounce, deepClone, confirmMsg } from '@/utils';
//提取的本页公共js文件
import amapEvents from './mixins-js/amapEvents';
import getLsit from './mixins-js/getList';
import editList from './mixins-js/editList';
import tableEvents from './mixins-js/tableEvents';
export default {
  name: 'portberth',
  mixins: [amapEvents, getLsit, editList, tableEvents], //混入的js
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
    // this.getNavaList();
  },
  mounted() {
    // console.log(this.$refs.amap.mapInstance);
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
      isShowPortDetail: false,
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
      },

      addPortData: {
        isClick: false, //是否点击了新增港口按钮
        isStartDraw: false,
        name: '',
        ident: '',
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
        isClick: false, //是否点击了新增端点按钮
        longitude: null,
        latitude: null,
        Id: null,
        Ident: '',
        Location: null
      },
      addProcedureData: {
        isClick: false, //是否点击了新增程序按钮
        id: null,
        ident: '',
        startId: null,
        endId: null,
        path: [],
        type: 1 //1代表离港，2代表进港
      },
      addTransitionData: {
        isClick: false, //是否点击了新增过渡路径按钮
        procedureEndpointId: null,
        direction: null,
        type: null,
        path: [],
        targetId: null
      }
    };
  },
  methods: {
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
      if (addProcedureData.isClick) {
        if (this.pointList.length < 2) {
          this.$message.error(',当前港口没有两个及以上端点，请先新增端点');
          return false;
        }
        addProcedureData.path.push([lng, lat]);
        let num = addProcedureData.path.length > 2 ? 2 : 1;
        //计算线段中的展示的点
        addProcedureData.centerPoint = addProcedureData.path[addProcedureData.path.length - num];
        // 定义最近开始端点
        let startPoint;
        // //计算最近开始端点只能第一次 否则会覆盖
        if (addProcedureData.path.length === 1) {
          startPoint = this.getMinPoint(addProcedureData.path, this.pointList);
          this.$set(addProcedureData, 'startPoint', startPoint);
        }
        // 每点击一次就更新最近结束端点
        let endPoint = this.getMinPoint(addProcedureData.path, this.pointList);
        this.$set(addProcedureData, 'endPoint', endPoint);
      }

      //点击新增过渡路径
      if (addTransitionData.isClick) {
        if (!this.pointList.length || !this.berthList.length) {
          this.$message.error('请先新增端点和泊位');
          return false;
        }
        addTransitionData.path.push([lng, lat]);
        let num = addTransitionData.path.length > 2 ? 2 : 1;
        //计算线段中的展示的点
        addTransitionData.centerPoint = addTransitionData.path[addTransitionData.path.length - num];
        //算出开始点只计算一次
        if (addTransitionData.path.length === 1) {
          let startNavaPoint, startBerthPoint, startPoint;
          if (this.navaList.length)
            startNavaPoint = this.getMinPoint(addTransitionData.path, this.navaList);
          //点到泊位中心点的距离
          // startBerthPoint = this.getMinPoint(addTransitionData.path, this.berthList);
          //点到泊位线的距离
          startBerthPoint = this.getDistanceToLine(addTransitionData.path, this.berthList);
          // 调用计算函数
          startPoint = this.getMinPoint(addTransitionData.path, this.pointList);
          // 比较在 泊位点 航标点 端点当中距离最短的点
          let startTempArr = this.navaList.length
            ? [startNavaPoint, startBerthPoint, startPoint]
            : [startBerthPoint, startPoint];
          let startMinPoint = this.getMinPoint(addTransitionData.path, startTempArr);
          //根据点自动计算类型,方向  direction:1进港 2离港  type:1泊位 2航标
          if (this.navaList.some((item) => item.id === startMinPoint.id)) {
            addTransitionData.direction = 1; //1进港-航道
            addTransitionData.type = 2;
            console.log('获得最近航标');
          } else if (this.berthList.some((item) => item.id === startMinPoint.id)) {
            // 通过最短的点找到这个点是否在泊位中
            addTransitionData.direction = 2; //2离港-泊位
            addTransitionData.type = 1;
            console.log('获得最近泊位');
          }
          //存储最近的开始点
          this.$set(addTransitionData, 'startMinPoint', startMinPoint);
        }
        //开始计算结束点
        let endNavaPoint;
        if (this.navaList.length) {
          endNavaPoint = this.getMinPoint(addTransitionData.path, this.navaList);
        }
        //点到泊位中心点的距离
        // let endBerthPoint = this.getMinPoint(addTransitionData.path, this.berthList);
        //点到泊位范围的距离
        let endBerthPoint = this.getDistanceToLine(addTransitionData.path, this.berthList);
        let endPoint = this.getMinPoint(addTransitionData.path, this.pointList);
        // 比较在 泊位点 航标点 端点当中距离最短的结束点
        let endTempArr = this.navaList.length
          ? [endNavaPoint, endBerthPoint, endPoint]
          : [endBerthPoint, endPoint];
        let endMinPoint = this.getMinPoint(addTransitionData.path, endTempArr);
        console.log(endMinPoint);

        this.$set(addTransitionData, 'endMinPoint', endMinPoint); //存储最近的结束点
        //根据开始点和结束点自动计算类型,方向 // direction:1进港 2离港  type:1泊位 2航标
        if (
          this.pointList.some((item) => item.id === endMinPoint.id) &&
          addTransitionData.path.length !== 1 // 通过结束最短的点找到这个点是否在端点中
        ) {
          if (addTransitionData.type === 2) {
            addTransitionData.type = 2;
            addTransitionData.direction = 1;
          } else {
            addTransitionData.type = 1;
            addTransitionData.direction = 2;
          }
        } else if (
          this.navaList.some((item) => item.id === endMinPoint.id) &&
          addTransitionData.path.length !== 1 // 通过结束最短的点找到这个点是否在航标中
        ) {
          addTransitionData.type = 2;
          addTransitionData.direction = 2;
        } else if (
          this.berthList.some((item) => item.id === endMinPoint.id) &&
          addTransitionData.path.length !== 1 // 通过结束最短的点找到这个点是否在泊位中
        ) {
          addTransitionData.type = 1;
          addTransitionData.direction = 1;
        }
        console.log(addTransitionData);
      }
    },

    /**
     * 判断一个点到点的数组中最短距离
     * pathArr新增时的path路径,pointsArr遍历的每一个点
     */
    getMinPoint(pathArr, pointsArr) {
      let endPoint = pathArr.length === 1 ? pathArr[0] : pathArr[pathArr.length - 1];
      return pointsArr.reduce((p, c) => {
        let pre = AMap.GeometryUtil.distance(endPoint, [
          p.locationObj.longitude,
          p.locationObj.latitude
        ]);
        let cur = AMap.GeometryUtil.distance(endPoint, [
          c.locationObj.longitude,
          c.locationObj.latitude
        ]);
        return pre > cur ? c : p;
      });
    },
    /**
     * 封装判断一个点到范围的最短距离(范围中心的距离或者范围线的距离)
     */
    getDistanceToLine(pointArr, lineArr) {
      let minPoint = lineArr
        .map((item) => {
          let endPoint = pointArr[pointArr.length - 1];
          let startPoint = [item.locationObj.longitude, item.locationObj.latitude];
          item.minDis = AMap.GeometryUtil.isPointInRing(endPoint, item.boundList) //点是否在范围内
            ? AMap.GeometryUtil.distance(endPoint, startPoint) //点到中心点的距离
            : AMap.GeometryUtil.distanceToLine(endPoint, item.boundList); //点到线的距离
          return item;
        })
        .reduce((p, c) => (p.minDis < c.minDis ? p : c));
      return lineArr.find((item) => item.id === minPoint.id);
    },

    handleTabClick(type, current) {
      // console.log(type);
    },
    /**
     * 点击了港口新增按钮
     */
    handleAddPortClick() {
      this.addPortData.isClick = true;
      this.isClickMap = true;
      this.$message.info('开启了港口添加，请点击地图');
      if (this.currentPort.isPortEdit) this.handleBoxClose('port');
      if (this.currentBerth) this.handleBoxClose('berth');
      if (this.addBerthData.latitude) this.resetAddData('berth');
      if (this.addBerthData.latitude) this.resetAddData('berth');
      if (this.addBerthData.latitude) this.resetAddData('berth');

      console.log('点击了新增港口按钮');
    },
    /**
     * 点击了泊位,端点,过渡路径,程序的新增按钮
     */
    handleAddBtn(type) {
      this.isClickMap = true;
      if (type === 'berth') {
        this.$message.info('开启了泊位添加，请点击地图');
        this.addBerthData.isClick = true;
        if (this.addPortData.latitude) this.resetAddData('port');
        if (this.addPointData.latitude) this.resetAddData('point');
        if (this.currentPoint) this.handleBoxClose('point');
        if (this.currentBerth) this.handleBoxClose('berth');
        if (this.currentPort.isPortEdit) this.handleBoxClose('port');
      }
      if (type === 'point') {
        this.$message.info('开启了端点添加，请点击地图');
        this.addPointData.isClick = true;
        if (this.addBerthData.latitude) this.resetAddData('berth');
        if (this.addPortData.latitude) this.resetAddData('port');
        if (this.currentPoint) this.handleBoxClose('point');
        if (this.currentPort.isPortEdit) this.handleBoxClose('port');
        if (this.currentBerth) this.handleBoxClose('berth');
      }
      if (type === 'procedure') {
        this.$message.info('开启了程序添加，请点击地图');
        this.addProcedureData.isClick = true;
        if (this.addBerthData.latitude) this.resetAddData('berth');
        if (this.addPortData.latitude) this.resetAddData('port');
        if (this.currentPoint) this.handleBoxClose('point');
        if (this.currentPort.isPortEdit) this.handleBoxClose('port');
        if (this.currentBerth) this.handleBoxClose('berth');
      }
      if (type === 'transition') {
        this.$message.info('开启了过渡路径添加，请点击地图');
        this.addTransitionData.isClick = true;
        if (this.addBerthData.latitude) this.resetAddData('berth');
        if (this.addPortData.latitude) this.resetAddData('port');
        if (this.currentPoint) this.handleBoxClose('point');
        if (this.currentPort.isPortEdit) this.handleBoxClose('port');
        if (this.currentBerth) this.handleBoxClose('berth');
      }
    },
    /**
     * 关闭新增港口弹框
     */
    handleAddBoxClose(type) {
      console.log('handleAddBoxClose ', type);
      if (type === 'port') {
        this.resetAddData('port');
      } else if (type === 'berth') {
        this.resetAddData('berth');
      } else if (type === 'point') {
        this.resetAddData('point');
      } else if (type === 'procedure') {
        this.resetAddData('procedure');
      } else if (type === 'transition') {
        this.resetAddData('transition');
      }
    },

    /**
     * 港口新增保存
     */
    handleAddSava(type, value) {
      if (type === 'port') {
        this.addPort();
      } else if (type === 'berth') {
        this.addBerth();
      } else if (type === 'point') {
        this.addPoint();
      } else if (type === 'procedure') {
        this.addProcedure();
      }
    },
    /**
     * 新增港口请求
     */
    async addPort() {
      const identReg = /^[A-Z]{4}$/;
      console.log(this.addPortData);
      let data = deepClone(this.addPortData);
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
      console.log(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getPortList(this.publicQuery);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData('port');
        this.$message.success('添加成功');
      }
    },
    /**
     * 新增泊位请求
     */
    async addBerth() {
      let data = deepClone(this.addBerthData);
      const reg = /^[A-Z0-9]{2,4}$/;
      if (!reg.test(this.addBerthData.ident)) {
        this.$message.warning('识别码应由二到四个大写字母或数字组成');
        return;
      }
      data.bounds = path2Str(data.bounds);
      if (!data.bounds) {
        this.$message.warning('泊位的范围不能为空');
        return;
      }
      data.portId = this.currentPort.id;
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await portApi.apiAddBerth(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getBerthList(this.currentPort.id);
        this.resetAddData('berth');
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.$message.success('添加成功');
      }
    },

    /**
     * 新增端点请求
     */
    async addPoint() {
      const reg = /^[A-Z]{3}$/;
      let data = deepClone(this.addPointData);
      if (!reg.test(data.Ident)) {
        this.$message.warning('标识是长度为3的英文大写字母');
        return;
      }
      data.Id = this.currentPort.id;
      data.Location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await portApi.apiAddPoint(data);
      console.log(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getPointList(this.currentPort.id);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData('point');
        this.$message.success('添加成功');
      }
    },
    /**
     *  新增程序,程序路径不包含起始端点和结束端点
     */
    async addProcedure() {
      const reg = /^[0-9A-Z]{1,10}$/;
      let data = deepClone(this.addProcedureData);
      if (!reg.test(data.ident)) {
        this.$message.warning('识别码由大写字母和数字组成，长度在十个字符以内');
        return;
      }
      data.startId = data.startPoint.id;
      data.endId = data.endPoint.id;
      data.path = path2Str(data.path);
      data.id = this.currentPort.id;
      if (data.startId == data.endId) {
        this.$message.warning('开始端点不能与结束端点相同');
        return;
      }
      const { errorCode } = await portApi.apiAddProcedure(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getProcedureList(this.currentPort.id);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData('procedure');
        this.$message.success('添加成功');
      }
    },
    /**
     *   新增过渡路径
     */
    async addTransition() {
      let data = this.addTransitionData;
      // 确定方向
      data.direction = data.direction;
      // 数据处理
      if ((data.direction == 1 && data.type == 1) || (data.direction == 2 && data.type == 2)) {
        data.targetId = this.addTransitionPoint.endPoint.id;
        data.procedureEndpointId = this.addTransitionPoint.startPoint.id;
      }
      if ((data.direction == 1 && data.type == 2) || (data.direction == 2 && data.type == 1)) {
        data.targetId = this.addTransitionPoint.startPoint.id;
        data.procedureEndpointId = this.addTransitionPoint.endPoint.id;
      }
    },
    /**
     * 重置新增数据
     */
    resetAddData(type) {
      if (!type) {
        return;
      }
      if (type === 'port') {
        this.addPortData = {
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
      } else if (type === 'berth') {
        this.addBerthData = {
          isClick: false, //是否点击了新增泊位按钮
          isStartDraw: false,
          portId: null,
          ident: '',
          bounds: [],
          longitude: null,
          latitude: null,
          area: ''
        };
      } else if (type === 'point') {
        this.addPointData = {
          isClick: false, //是否点击了新增端点按钮
          longitude: null,
          latitude: null,
          Id: null,
          Ident: '',
          Location: null
        };
      } else if (type === 'procedure') {
        this.addProcedureData = {
          isClick: false, //是否点击了新增程序按钮
          id: null,
          ident: '',
          startId: null,
          endId: null,
          path: [],
          type: 1 //1代表离港，2代表进港
        };
      } else if (type === 'transition') {
        this.addTransitionData = {
          isClick: false, //是否点击了新增过渡路径按钮
          procedureEndpointId: null,
          direction: null,
          path: [],
          targetId: null
        };
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
    }, 500),
    /**
     * 显示当前港口详情
     */
    showPortArea(currentPort) {
      const { id } = currentPort;
      // console.log('当前港口:', name);
      this.getBerthList(id); // 泊位列表方法
      this.getPointList(id); //端点数据的方法
      this.getProcedureList(id); //程序路径列表方法
      this.getTransitionList(id); //过渡路径数据的方法
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
        if (!this.isShowPortDetail) await amap.setMapFitView(value.boundList); //地图自适应
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
