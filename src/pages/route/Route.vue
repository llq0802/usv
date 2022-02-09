<template>
  <div class="container">
    <!-- 左边状态栏 -->
    <div class="left-panel-part">
      <!-- 表格部分 -->
      <div class="table-part">
        <table-part @getRow="getRouteInfo"></table-part>
      </div>
      <!-- 航线细节 -->
      <div class="route-detail-part">
        <template v-if="routeInfo">
          <route-detail
            ref="routeDetail"
            :routeInfo="routeInfo"
            @updateRoute="updateRoute"
            @pickupCoord="getLocationSignal"
          >
          </route-detail>
        </template>
      </div>
    </div>
    <!-- 右边地图 -->
    <div class="right-map-part">
      <!-- 地图 -->
      <Map ref="map" :isEdit="isEdit" @getLngLat="getLngLat" @getMapBounds="getMapBounds">
        <template #route>
          <!-- 高亮显示的折线 -->
          <template v-if="highLightPolyline.length">
            <el-amap-polyline
              :path="highLightPolyline"
              :strokeStyle="highLightPolyline.strokeStyle"
              :strokeColor="highLightPolyline.strokeColor"
              :strokeWeight="highLightPolyline.strokeWeight"
              geodesic="true"
              :zIndex="1000"
            ></el-amap-polyline>
          </template>
          <!-- 计划航线 -->
          <template>
            <el-amap-polyline
              v-for="(path, index) in routePathList"
              :key="index + 'route'"
              :path="path"
              strokeStyle="solid"
              :strokeColor="path.strokeColor"
              :strokeWeight="path.strokeWeight"
              :geodesic="true"
              :events="routePolyEvent"
              :extData="path"
              :zIndex="999"
            ></el-amap-polyline>
          </template>
          <!-- 坐标点 -->
          <template v-if="coordPoint.length">
            <el-amap-marker
              :position="coordPoint"
              :draggable="true"
              :events="pointEvents"
              :extData="coordPoint"
              :offset="offset"
            >
              <div class="marker"></div>
            </el-amap-marker>
          </template>

          <!-- 航道 -->
          <template v-if="waterwayList">
            <el-amap-polyline
              v-for="item in waterwayList"
              :key="item.id + '22'"
              :path="item.fixesArray"
              :strokeColor="item.color"
              :strokeWeight="item.strokeWeight || 3"
              lineJoin="round"
            >
            </el-amap-polyline>
          </template>
          <!-- 航标-->
          <template v-if="navaList">
            <el-amap-marker
              v-for="item in navaList"
              :key="item.id"
              :position="item.locationArr"
              :offset="[-5, -5]"
            >
              <div class="nava-maker"></div>
              <div class="nava-box shadow text-style" @click="clickNava(item.ident)">{{ item.ident }}</div>
            </el-amap-marker>
          </template>
          <!-- 港口 -->
          <template v-if="portList.length">
            <template v-for="port in portList">
              <el-amap-marker :key="port.id + '11'" :position="port.locationArr" :zIndex="108">
                <div class="port-maker text-style shadow">
                  <i class="iconfont el-icon-gangkou"></i>
                  {{ port.name }}
                </div>
              </el-amap-marker>
              <!-- 港口范围-->
              <el-amap-polygon
                v-if="currentPort.id"
                :key="port.id + 'aa'"
                :path="cachePortBoundList"
                :editable="false"
                strokeColor="#242f42"
                fillColor="#71b8fe"
                :zIndex="50"
                :bubble="true"
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
              <div class="berth-point"></div>
              <div class="berth-maker text-style shadow">
                {{ berth.ident }}
              </div>
            </el-amap-marker>
            <!-- 泊位范围 -->
            <el-amap-polygon
              v-for="bound in berthList"
              :key="bound.id + 'bb'"
              :path="bound.boundList"
              strokeColor="#2f343e"
              strokeStyle="solid"
              fillColor="#74a5e5"
              :extData="bound"
              :bubble="true"
              :editable="false"
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
              :draggable="false"
              :zIndex="currentPoint && currentPoint.id == point.id ? 1000 : 100"
            >
              <div class="point-point"></div>
              <div class="text-style shadow">
                {{ point.ident }}
              </div>
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
                  :bubble="true"
                  :editable="false"
                  lineJoin="round"
                  :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
                >
                </el-amap-polyline>
                <el-amap-marker
                  :key="item.id + 'hh'"
                  :position="item.centerPoint"
                  :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
                >
                  <div class="text-style">
                    {{ item.ident + BASE_CONSTANTS.procedureType(item.type) }}
                  </div>
                </el-amap-marker>
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
                  :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
                >
                  <div class="text-style">
                    {{ item.direction === 1 ? 'TO' : 'FROM' }} {{ item.ident }}
                  </div>
                </el-amap-marker>
              </template>
            </div>
          </template>
        </template>
      </Map>
    </div>
    
  </div>
</template>

<script>
// 地图
import Map from 'components/amap/Amap';
// 组件
import TablePart from './components/Table.vue';
import RouteDetail from './components/RouteDetail.vue';

import { deepClone, debounce } from '@/utils';
import { turnLngLat, translatePath } from '@/utils/handleLngLat';
import bus from '@/utils/bus';

import Port from 'pages/portberth/Port';

export default {
  mixins: [Port],
  components: {
    Map, TablePart, RouteDetail
  },
  data () {
    return {
      routeInfo: null,
      /********************* 地图相关 *********************/
      // 航线中航段事件
      routePolyEvent: {
        mouseover: e => {
          let i = parseInt(e.target.getExtData().index);
          this.$set(this.routePathList[i], 'strokeColor', '#011932');
          this.$set(this.routePathList[i], 'strokeWeight', 5);
          this.$forceUpdate();
        },
        mouseout: e => {
          if (!this.highlightNavigation
            || this.highlightNavigation
            && this.highlightNavigation.index != e.target.getExtData().index) {
            let i = parseInt(e.target.getExtData().index);
            this.$set(this.routePathList[i], 'strokeColor', '#227be0');
            this.$set(this.routePathList[i], 'strokeWeight', 3);
          }
        },
        click: e => {
          for (let i in this.routePathList) {
            if (i != e.target.getExtData().index) {
              this.$set(this.routePathList[i], 'strokeColor', '#227be0');
              this.$set(this.routePathList[i], 'strokeWeight', 3);
            }
          }
          let i = parseInt(e.target.getExtData().index);
          this.highlightNavigation = this.routePathList[i];
          this.$refs.routeDetail.highlightRowByMap(i);
          this.$refs.map.onCompleted(() => {
            this.$refs.map.setMapFitView(this.highlightNavigation);
          });
        }
      },
      // 坐标点事件
      pointEvents: {
        dragging: debounce(e => {
          this.coordPoint = [e.lnglat.lng, e.lnglat.lat];
          if (this.routePathList[this.currentIndex]) {
            this.$set(this.routePathList[this.currentIndex], 1, this.coordPoint);
            if (!this.currentIndex) {
              this.$set(this.routePathList[this.currentIndex], 0, this.coordPoint);
            }
            if (this.currentIndex && this.currentIndex < this.routePathList.length - 1) {
              this.$set(this.routePathList[this.currentIndex + 1], 0, this.coordPoint);
            }
          }
        }),
        dragend: e => {
          this.$refs.routeDetail.getPointLatLng(`${e.lnglat.lat},${e.lnglat.lng}`);
        },
      },
      isEdit: false,
      // marker偏移量
      offset: [-16, -31],
      // 航线路径数组
      routePathList: [],
      // 高亮显示的航段
      highlightNavigation: null,
      // 高亮显示的折线
      highLightPolyline: [],
      // 坐标点
      coordPoint: [],
      currentIndex: null,
    }
  },
  methods: {
    
    getRouteInfo(row) {
      this.routeInfo = row;
    },
    /**
     * 更新地图航线
     * @routePath
     * @Bool
     * @navigationList
     * @currentIndex
     */
    updateRoute(routePath, Bool, navigationList, currentIndex) {
      if (routePath.length) {
        for (let i = routePath.length - 1; i >= 0; i--) {
          if (!routePath[i]) routePath.splice(i, 1);
        }
      }
      let fitPath = deepClone(routePath);
      fitPath = translatePath(fitPath);
      this.routePathList = [];
      for (let navigation of routePath) {
        let path = translatePath(navigation);
        this.routePathList.push(path);
      }
      if (!this.routePathList.length) return;
      for (let i in this.routePathList) {
        this.$set(this.routePathList[i], 'index', i);
        if (navigationList[i]) {
          this.$set(this.routePathList[i], 'type', navigationList[i].type);
        }
        this.$set(this.routePathList[i], 'strokeWeight', 3);
        this.$set(this.routePathList[i], 'strokeColor', '#227be0');
        // 高亮显示航段
        if (i == currentIndex) {
          this.$set(this.routePathList[i], 'strokeWeight', 5);
          this.$set(this.routePathList[i], 'strokeColor', '#011932');
          this.highlightNavigation = this.routePathList[i];
          fitPath = this.routePathList[i];
        }
      }
      // 如果点击的index信息不完整,取消高亮显示,不调用地图自适应
      if (currentIndex != null && (currentIndex + '').indexOf('noHighlight') != -1) {
        Bool = true;
      }
      // 地图自适应
      if (!Bool) {
        this.$refs.map.onCompleted(() => this.$refs.map.setMapFitView(fitPath));
      }
    },
    // 获取坐标或航标信息 navigationIdent为underfined则获取坐标 isExists表示当前是否存在坐标点
    getLocationSignal(flag, index, coord) {
      if (flag) {
        this.isEdit = true;
        this.currentIndex = index;
        // 已存在坐标点
        if (coord && coord.indexOf(',') != -1) {
          this.coordPoint = turnLngLat(coord);
        }
        // 坐标点为空
        else {
          this.coordPoint = [];
        }
      }
      // 取消拾取
      else {
        this.isEdit = false;
        this.coordPoint = [];
      }
    },
    // 获取坐标点
    getLngLat(point) {
      this.coordPoint = point.pointArray;
      this.$refs.routeDetail.getPointLatLng(point.location);
    },
    // 获取航标
    clickNava(navaIdent) {
      if (!this.isEdit) return;
      this.$refs.routeDetail.getIdent(navaIdent);
    }
  },
  created() {
    bus.$on('highPolyline', path => {
      this.highLightPolyline = path;
    })
  },
  beforeDestroy() {
    bus.$off('highPolyline');
  }
}
</script>

<style lang="less" scoped>
@elColor: #409eff;
@markerPath: "../../assets/img/map/marker.png";
@markerSize: 32px;
@nava-background-color: rgba(80, 114, 209, 0.8);
@nava-maker-color: rgba(90, 115, 141, 1);
@port-background-color: #1c6db9;
@port-color: #242f42;
@berth-background-color: rgba(137, 128, 145, 1);
@point-background-color: rgb(29, 57, 136);

.container {
  padding: 0 !important;
  width: 100%;
  height: 100%;
}
.left-panel-part {
  float: left;
  background: #f0f0f0;
  height: 100%;
  padding-right: 10px;
  .table-part {
    min-height: 278px;
  }
}
.right-map-part {
  float: right;
  width: calc(100% - 406px);
  height: 100%;
}
/*************** 地图相关 ***************/
/* 坐标点 */
.marker{
  position: relative;
  width: @markerSize;
  height: @markerSize;
  background: url(@markerPath);
}
/**航标点样式 */
.nava-maker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 3px solid @nava-maker-color;
}
/*航标信息框*/
.nava-box {
  position: absolute;
  top: 26px;
  left: -11px;
  padding: 0 3px;
  text-align: center;
  border-radius: 3px;
  color: rgb(76, 113, 212);
  background: @nava-background-color;

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-bottom: 8px solid @nava-background-color;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    position: absolute;
    top: -8px;
    left: 15px;
  }
}
/* 港口maker */
.port-maker {
  padding: 0 8px;
  text-align: center;
  border-radius: 18px;
  font-weight: bold;
  font-size: 14px;
  line-height: 25px;
  white-space: nowrap;
  background-color: @port-background-color;
  color: @port-color;
}
/* 泊位圆点 */
.berth-point {
  width: 7px;
  height: 7px;
  background-color: @berth-background-color;
  border-radius: 50%;
}
.berth-maker {
  border: 2px solid @berth-background-color;
  border-radius: 50%;
}
/* 端点圆点 */
.point-point {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: @point-background-color;
}
</style>