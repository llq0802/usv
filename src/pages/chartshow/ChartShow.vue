<template>
  <div class="show-content">
    <keyword-search
      class="search-container"
      :placeholder="'搜索航道航标港口'"
      :autoClear="true"
      :isShowChart="true"
      :paramsArray="[1, 2, 4]"
      @selectNavaAndWay="selectNavaAndWay"
    />

    <Amap ref="amap" @getMapBounds="getMapBounds">
      <template #show>
        <!-- 航道 -->
        <template v-if="waterwayList.length">
          <el-amap-polyline
            v-for="item in waterwayList"
            :key="item.id + 'a'"
            :path="item.fixesArray"
            :strokeStyle="item.connectivity === 2 ? 'solid' : 'dashed'"
            :strokeColor="item.color"
            :strokeWeight="item.strokeWeight"
            :zIndex="50"
            :extData="item"
            lineJoin="round"
            :events="waterwayEvents"
          >
          </el-amap-polyline>
        </template>
        <!-- 航道信息框 -->
        <el-amap-marker
          v-if="currentWay && currentWay.lnglat"
          :position="[currentWay.lnglat.lng, currentWay.lnglat.lat]"
          :offset="[-3, -3]"
          :zIndex="1000"
        >
          <WayDialog :way="currentWay" @handleBoxClose="handleBoxClose" />
        </el-amap-marker>
        <el-amap-polyline
          v-if="currentWay"
          :path="currentWay.fixesArray"
          :strokeStyle="currentWay.connectivity === 2 ? 'solid' : 'dashed'"
          :strokeColor="currentWay.color"
          :strokeWeight="8"
          :zIndex="50"
          lineJoin="round"
          ref="waterwayLine"
        >
        </el-amap-polyline>
        <!-- 鼠标经过航道显示dient -->
        <div ref="wayIdent" v-show="isShowWayIdent" class="wayIdent">{{ currentWayIdent }}</div>
        <!-- 航标 -->
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="(item, index) in navaList"
            :key="index"
            :position="[item.locationObj.longitude, item.locationObj.latitude]"
            :draggable="currentNava && currentNava.id === item.id"
            :zIndex="currentNava && currentNava.id === item.id ? 1000 : 100"
            :extData="item"
            :offset="[-5, -5]"
          >
            <nava-dialog
              :value="item"
              :currentNava="currentNava"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
            />
          </el-amap-marker>

          <template v-for="(nava, index) in navaList">
            <el-amap-circle
              v-if="currentNava && currentNava.id === nava.id"
              :key="index + 'cc'"
              :center="[nava.locationObj.longitude, nava.locationObj.latitude]"
              :radius="nava.radius"
              :fill-opacity="0.5"
              strokeColor="#409eff"
              :strokeWeight="1"
              fillColor="#86D4D8"
              :bubble="true"
              :extData="nava"
              :zIndex="999"
            >
            </el-amap-circle>
          </template>
        </template>

        <!-- 航图港口 -->
        <template v-for="(port, index) in portList">
          <el-amap-marker
            :position="[port.locationObj.longitude, port.locationObj.latitude]"
            :offset="[-3, -3]"
            :zIndex="999"
            :key="index + 'aa'"
          >
            <PortDialog
              :port="port"
              :currentPort="currentPort"
              @handleBoxClose="handleBoxClose"
              @handleCurrentClick="handleCurrentClick"
            >
            </PortDialog>
          </el-amap-marker>
          <el-amap-polygon
            :key="index + 'bb'"
            v-if="isShowPortPolygon"
            :path="port.boundList"
            strokeColor="#242f42"
            :strokeWeight="currentPort && currentPort.id === port.id ? 3 : 1"
            fillColor="#71b8fe"
            :zIndex="50"
            :extData="port"
          ></el-amap-polygon>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
import Amap from 'components/amap/Amap';
import KeywordSearch from 'components/common/keyword-search/KeywordSearch.vue';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import * as apiNava from 'api/nava';
import * as apiWay from 'api/waterway';
import * as apiPort from 'api/port';
import { BASE_CONSTANTS } from '@/config';
import { debounce } from '@/utils';
import NavaDialog from './components/S-NavaDialog';
import WayDialog from './components/S-WayDialog';
import PortDialog from './components/S-PortDialog';
export default {
  name: 'ChartShow',
  components: {
    Amap,
    NavaDialog,
    WayDialog,
    PortDialog,
    KeywordSearch
  },
  data() {
    return {
      isShowWayIdent: false,
      isShowPortPolygon: false,
      currentWayIdent: '',
      currentNava: null,
      currentWay: null,
      currentPort: null,
      zoomLevel: null,
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
      },
      navaList: [],
      waterwayList: [],
      portList: [],
      waterwayEvents: Object.freeze({
        mouseover: (e) => {
          const waterway = e.target.getExtData();
          waterway.strokeWeight = 9;
          e.target.setOptions({ showDir: true });
          const wayIdent = this.$refs.wayIdent;
          wayIdent.style.top = e.originEvent.offsetY + 'px';
          wayIdent.style.left = e.originEvent.offsetX + 'px';
          wayIdent.style.color = waterway.color;
          this.currentWayIdent = waterway.ident;
          this.isShowWayIdent = true;
        },
        mouseout: (e) => {
          const waterway = e.target.getExtData();
          waterway.strokeWeight = 4;
          e.target.setOptions({ showDir: false });
          this.isShowWayIdent = false;
          this.currentWayIdent = '';
        },
        click: (e) => {
          this.handleBoxClose();
          const waterway = e.target.getExtData();
          // 获得父组件航道信息框是否打开
          this.currentWay = waterway;
          this.currentWay.lnglat = e.lnglat;
          // console.log('打开父组件航道信息框', waterway);
          this.$nextTick(() => {
            this.$refs.waterwayLine.$$getInstance().setOptions({ showDir: true });
          });
          this.$refs.amap.setMapFitView(waterway.fixesArray);
        }
      })
    };
  },
  methods: {
    /**
     * 防抖: 缩放,拖拽地图时请求数据
     */
    getMapBounds: debounce(async function (boundPath, zoomLevel, mapCenter, mapInstance) {
      this.zoomLevel = zoomLevel;
      this.isShowPortPolygon = zoomLevel >= 15;
      this.publicQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath.TopLeft);
      this.publicQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath.TopRight);
      this.publicQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath.BottomLeft);
      this.publicQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath.BottomRight);
      this.publicQuery['Condition.ZoomLevel'] = zoomLevel;
      await Promise.all([this.getNavaList(), this.getWaterwayList()], this.getPortList());
    }, 500),
    /**
     * 搜索后点击选中的航道或航标,港口
     */
    async selectNavaAndWay(value) {
      this.handleBoxClose();
      const amap = this.$refs.amap;
      if (value.type === 1) {
        //航标的情况
        this.$set(value, 'locationObj', turnLngLatObj(value.location));
        value.locationArr = turnLngLat(value.location);
        await amap.setMapFitView(value.locationArr, false);
        this.currentNava = value;
      } else if (value.type === 2) {
        //航道的情况
        value.fixesArray = str2Path(value.bounds);
        await amap.setMapFitView(value.fixesArray);
        const { data, errorCode } = await apiWay.apiGetWaysByIdent(value.ident);
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
        this.currentWay = data;
      } else if (value.type === 4) {
        const port = value.port;
        this.$set(port, 'locationObj', turnLngLatObj(port.location)); //响应式
        port.locationArr = turnLngLat(port.location);
        port.boundList = str2Path(port.bounds);
        this.$set(port, 'area', +port.area.toFixed(2));
        this.currentPort = port;
        await amap.setMapFitView(port.boundList);
      }
    },
    /**
     * 点击航道或航标
     */
    handleCurrentClick(type, value) {
      this.handleBoxClose();
      if (type === 'port') {
        if (this.zoomLevel < 15) this.$refs.amap.setMapFitView(value.boundList);
        this.currentPort = value;
      } else if (type === 'nava') {
        if (this.zoomLevel < 15) this.$refs.amap.setMapFitView(value.locationArr, false);
        this.currentNava = value;
      }
    },
    /**
     * 关闭dialog
     */
    handleBoxClose(type) {
      this.currentNava = null;
      this.currentWay = null;
      this.currentPort = null;
    },
    /**
     * 获取港口信息
     */
    async getPortList() {
      const { data, errorCode } = await apiPort.apiGetPortByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.portList = data.result;
        for (let item of data.result) {
          item.delApi = 'apiDelPort'; //标识删除港口的函数名
          item.uid = 'port'; //标识这是港口 港口页面统一封装处理游泳
          this.$set(item, 'locationObj', turnLngLatObj(item.location)); //响应式
          item.locationArr = turnLngLat(item.location);
          item.boundList = str2Path(item.bounds);
          this.$set(item, 'area', +item.area.toFixed(2));
        }
      }
    },
    /**
     * 获取航道信息
     */
    async getWaterwayList() {
      const { data, errorCode } = await apiWay.apiGetWayByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.waterwayList = data.result;
        for (let item of data.result) {
          let en = item.ident.charAt(0).toUpperCase(); // 根据标识开头字母设置不同的颜色
          this.$set(item, 'color', BASE_CONSTANTS.colorArray(en));
          this.$set(item, 'strokeWeight', 4);
          item.fixes.sort((a, b) => a.order - b.order); //  航标点排序
          item.fixesArray = []; // 为每一项添加二维航道路线数组
          for (let x of item.fixes) {
            const fixesArrays = item.fixesArray; // 处理航标坐标组成航道线
            x.navaid.locationObj = turnLngLatObj(x.navaid.location); // 经纬度转换
            fixesArrays.push([x.navaid.locationObj.longitude, x.navaid.locationObj.latitude]); // 轨迹数组创建
          }
        }
      }
    },
    /**
     * 获取航标信息
     */
    async getNavaList() {
      const { data, errorCode } = await apiNava.apiGetNavaByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.navaList = data.result;
        for (let item of data.result) {
          // item.locationObj = turnLngLatObj(item.location);
          this.$set(item, 'locationObj', turnLngLatObj(item.location));
          item.locationArr = turnLngLat(item.location);
        }
      }
    }
  }
};
</script>

<style scoped lang="less">
.show-content {
  height: 100%;
  position: relative;
  .search-container {
    position: absolute;
    z-index: 99;
    top: -1px;
  }
  .wayIdent {
    position: absolute;
    font-size: 20px;
    cursor: default;
    transform: translate(-50%, -150%);
    font-weight: bold;
    text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
  }
}
</style>
