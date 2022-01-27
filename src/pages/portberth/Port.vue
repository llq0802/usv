<template>
  <div class="port-content">
    <table-search buttonName="添加港口" class="port-search" />
    <Amap ref="amap" :isEdit="isClickMap" @getMapBounds="getMapBounds" @getLngLat="getLngLat">
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
              :path="currentPort.boundList"
              :editable="currentPort.isPortEdit"
              strokeColor="#242f42"
              fillColor="#71b8fe"
              :extData="port"
              :events="portLineEvents"
              :zIndex="50"
            ></el-amap-polygon>
          </template>
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
import TableSearch from 'components/common/table-search/TableSearch';
import NavaMarker from './components/S-NavaMarker';
import ProcedureMarker from './components/S-ProcedureMarker';
import TransitionMarker from './components/S-TransitionMarker';
import PortDialog from './components/S-PortDialog.vue';
import BerthDialog from './components/S-BerthDialog.vue';
import PointDialog from './components/S-PointDialog.vue';
import ProcedureDialog from './components/S-ProcedureDialog.vue';
import TransitionDialog from './components/S-TransitionDialog.vue';
import * as portApi from 'api/port';
import { turnLngLat, path2Str } from '@/utils/handleLngLat';
import { debounce, deepClone, confirmMsg } from '@/utils';
import { BASE_CONSTANTS, PAGE_SIZE } from '@/config';
//提取的公共js文件
import getLsit from './js/getList';
import editList from './js/editList';

export default {
  name: 'portberth',
  mixins: [getLsit, editList], //混入的js
  components: {
    Amap,
    TableSearch,
    NavaMarker,
    ProcedureMarker,
    TransitionMarker,
    PortDialog,
    BerthDialog,
    PointDialog,
    ProcedureDialog,
    TransitionDialog
  },
  created() {
    // this.getNavaList();
  },
  mounted() {
    // console.log(this.$refs.amap.mapInstance);
    // console.log(window.AMap);
  },
  data() {
    return {
      BASE_CONSTANTS: Object.freeze(BASE_CONSTANTS),
      currentPort: { isPortEdit: false },
      cacheCurrentPort: {}, //缓存当前港口
      currentBerth: null,
      currentPoint: null,
      currentProcedure: null,
      currentTransition: null,
      isRequest: true, //是否可以请求港口信息
      isClickMap: true, //是否可以点击地图获取坐标
      zoomLevel: 15,
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
        Page: PAGE_SIZE.page,
        Size: PAGE_SIZE.size
      },
      portList: [], //港口数据
      berthList: [], //泊位数据
      navaList: [], //航标数据
      waterwayList: [], //航道数据
      pointList: [], //端点数据
      procedureList: [], //程序数据
      transitionList: [], //过渡路径数据
      waterwayEvents: Object.freeze({}),
      transitionMarkerEvents: Object.freeze({}),
      procedureMarkerEvents: Object.freeze({}),
      transitionLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentTransition) this.currentTransition.path = e.target.getPath();
        },
        click: (e) => {
          if (this.transitionList.length) {
            const value = e.target.getExtData();
            this.handleCurrentClick('transition', value);
          }
        },
        mouseover: (e) => {
          if (this.transitionList.length) {
            this.$refs.transition.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 6;
          }
        },
        mouseout: (e) => {
          if (this.transitionList.length) {
            this.$refs.transition.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 2;
          }
        }
      }),
      pointEvents: Object.freeze({
        // 鼠标拖动修改对应的经纬度
        dragging: debounce((e) => {
          // 港口端点拖动事件
          if (this.currentPoint) {
            const id = e.target.getExtData().id;
            const point = this.pointList.find((item) => item.id === id);
            point.locationObj.latitude = location.lat;
            point.locationObj.longitude = location.lng;
            this.currentPoint.location = turnLngLat(e.target.getPosition());
          }
        })
      }),
      procedureLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentProcedure) {
            let path = e.target.getPath();
            this.currentProcedure.path = path2Str(path);
          }
        },
        mouseover: (e) => {
          if (this.procedureList.length) {
            this.$refs.procedure.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 6;
          }
        },
        mouseout: (e) => {
          if (this.procedureList.length) {
            this.$refs.procedure.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 2;
          }
        },
        click: (e) => {
          if (this.procedureList.length) {
            const value = e.target.getExtData();
            this.handleCurrentClick('procedure', value);
          }
        }
      }),
      portLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (!this.currentPort.id) return;
          const id = e.target.getExtData().id;
          const bounds = e.target.getPath();
          this.currentPort.bounds = path2Str(bounds);
          let area = Math.round(AMap.GeometryUtil.ringArea(bounds));
          this.portList.find((item) => item.id === id).area = area;
        }
      }),
      BerthLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentBerth) this.currentBerth.bounds = path2Str(e.target.getPath());
        },
        click: (e) => {
          this.handleCurrentClick('berth', e.target.getExtData());
        }
      })
    };
  },
  methods: {
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
      }
      if (!this.portList.length) return;
      //获取距离地图正中心最近的港口
      let currentPort = {};
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
      if (
        currentPort.id &&
        clitentArea <= currentPort.area * 80 //如果当前港口视口面积为地图视口面积的80倍
      ) {
        //显示距离正中心最近的港口信息
        this.currentPort = { ...this.currentPort, ...currentPort };
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
      console.log('当前港口:', name);
      this.getBerthList(id); // 泊位列表方法
      this.getPointList(id); //端点数据的方法
      this.getProcedureList(id); //程序路径列表方法  程序
      this.getTransitionList(id); //过渡路径数据的方法  过渡
    },
    /**
     * 点击地图获取坐标
     */
    getLngLat(p) {
      console.log(p);
    },

    /**
     * 点击不同的maker标显示信息
     */
    handleCurrentClick(type, value) {
      if (type === 'port') {
        this.currentPort = { ...value, isPortEdit: true };
        this.cacheCurrentPort = deepClone(this.currentPort); //缓存当前港口
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
    handleBoxClose(type) {
      //关闭编辑或者成功编辑过会打开网络请求
      this.isRequest = true;
      if (type === 'port') {
        this.currentPort.isPortEdit = false;
        this.currentPort.boundList = this.cacheCurrentPort.boundList; //从上一次港口取值
        this.getPortList(this.publicQuery);
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
      console.log();
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
