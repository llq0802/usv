<template>
  <div class="port-content">
    <table-search buttonName="添加港口" class="port-search" />

    <Amap ref="amap" @getMapBounds="getMapBounds">
      <template #port_berth>
        <!-- 港口航标-->
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="item in navaList"
            :key="item.id"
            :position="item.locationArr"
            :offset="[-5, -5]"
          >
            <div class="nava-maker"></div>
            <div class="nava-box shadow text-style">{{ item.ident }}</div>
          </el-amap-marker>
        </template>

        <!-- 港口 -->
        <template v-if="portList.length">
          <template v-for="port in portList">
            <el-amap-marker :key="port.id + '11'" :position="port.locationArr">
              <div
                class="port-maker text-style shadow"
                @click.stop="handleCurrentClick('port', port)"
              >
                <i class="iconfont el-icon-gangkou"></i>
                {{ port.name }}
              </div>

              <div
                class="port-box shadow"
                v-show="currentPort.isPortEdit && currentPort.id === port.id"
                @mousemove="eventStopPropagation('div', $event)"
                @mousedown="eventStopPropagation('div', $event)"
                @mouseenter="eventStopPropagation('input')"
              >
                <i class="el-icon-close" @click.stop="handleBoxClose('port')"></i>
                <div class="item-box-title">{{ port.name }} 港口</div>
                <div class="item-box">
                  <div>名称</div>
                  <div>
                    <el-input type="text" v-model="port.name" />
                  </div>
                </div>
                <div class="item-box">
                  <div>层级</div>
                  <el-input type="text" v-model="port.zoomLevel" />
                </div>
                <div class="item-box">
                  <div>面积</div>
                  <div>{{ port.area.toFixed(2) }} ㎡</div>
                </div>
                <div class="item-box">
                  <div>坐标</div>
                  <div>
                    {{
                      port.locationObj.latitude.toFixed(6) +
                      '，' +
                      port.locationObj.longitude.toFixed(6)
                    }}
                  </div>
                </div>
                <div class="port-btn-box">
                  <el-button type="danger" size="mini" @click.stop="deletePort(port.id)"
                    >删除</el-button
                  >
                  <el-button type="primary" size="mini" @click.stop="editPort(port)">
                    保存</el-button
                  >
                </div>
              </div>
            </el-amap-marker>
            <!-- 港口范围-->
            <div v-if="currentPort && currentPort.id" :key="port.id + 'aa'">
              <el-amap-polygon
                :bubble="true"
                :path="currentPort.boundList"
                :editable="currentPort.isPortEdit"
                strokeColor="#242f42"
                strokeStyle="solid"
                :strokeWeight="2"
                fillColor="#71b8fe"
                :extData="port"
                :events="portLineEvents"
              ></el-amap-polygon>
            </div>
          </template>
        </template>

        <!-- 港口航道 -->
        <template v-if="waterwayList.length">
          <el-amap-polyline
            v-for="item in waterwayList"
            :key="item.id + '22'"
            :path="item.fixesArray"
            strokeStyle="solid"
            :strokeColor="item.color"
            :strokeWeight="item.strokeWeight || 3"
            :zIndex="99"
            :extData="item"
            :events="waterwayEvents"
            lineJoin="round"
          >
          </el-amap-polyline>
        </template>

        <!-- 泊位 -->
        <template v-if="berthList.length">
          <el-amap-marker
            v-for="berth in berthList"
            :key="berth.id + '33'"
            :position="berth.locationArr"
            :offset="[-3, -3]"
          >
            <div class="berth-point" @click.stop="handleCurrentClick('berth', berth)"></div>
            <div
              class="berth-maker text-style shadow"
              @click.stop="handleCurrentClick('berth', berth)"
            >
              {{ berth.ident }}
            </div>
            <!-- 泊位信息框 -->
            <div
              class="port-box shadow"
              v-show="currentBerth && currentBerth.id === berth.id"
              @mousemove="eventStopPropagation('div', $event)"
              @mousedown="eventStopPropagation('div', $event)"
              @mouseenter="eventStopPropagation('input')"
            >
              <i class="el-icon-close" @click.stop="handleBoxClose('berth')"></i>
              <div class="item-box-title">{{ berth.ident }} 泊位</div>
              <div class="item-box">
                <div>名称</div>
                <div>
                  <el-input type="text" v-model="berth.ident" />
                </div>
              </div>
              <div class="item-box">
                <div>面积</div>
                <div>{{ berth.area }} ㎡</div>
              </div>
              <div class="item-box">
                <div>坐标</div>
                <div>
                  {{
                    berth.locationObj.latitude.toFixed(6) +
                    '，' +
                    berth.locationObj.longitude.toFixed(6)
                  }}
                </div>
              </div>
              <div class="port-btn-box">
                <el-button type="danger" size="mini" @click.stop="deleteBreth(berth.id)"
                  >删除</el-button
                >
                <el-button type="primary" size="mini" @click.stop="editBerth(berth)"
                  >保存</el-button
                >
              </div>
            </div>
          </el-amap-marker>
          <!-- 泊位范围 -->
          <el-amap-polygon
            v-for="bound in berthList"
            :key="bound.id + 'bb'"
            :bubble="true"
            :editable="currentBerth && currentBerth.id === bound.id"
            :path="bound.boundList"
            strokeColor="#2f343e"
            strokeStyle="solid"
            fillColor="#74a5e5"
            :strokeWeight="currentBerth && currentBerth.id === bound.id ? 2 : 1"
            :events="BerthEvents"
            :extData="bound"
          ></el-amap-polygon>
        </template>

        <!-- 端点-->
        <template v-if="pointList.length">
          <el-amap-marker
            v-for="(point, index) in pointList"
            :key="index + 'ee'"
            :position="point.locationArr"
            :offset="[-3, -3]"
            :draggable="currentPoint && currentPoint.id === point.id"
            :events="pointEvents"
            :extData="point"
          >
            <div class="point-point" @click.stop="handleCurrentClick('point', point)"></div>
            <div class="text-style shadow" @click.stop="handleCurrentClick('point', point)">
              {{ point.ident }}
            </div>
            <!-- 端点信息框 -->
            <div
              class="port-box"
              v-show="currentPoint && currentPoint.id === point.id"
              @mousemove="eventStopPropagation('div', $event)"
              @mousedown="eventStopPropagation('div', $event)"
              @mouseenter="eventStopPropagation('input')"
            >
              <i class="el-icon-close" @click="handleBoxClose('point')"></i>
              <div class="item-box-title">{{ point.ident }} 端点</div>
              <div class="item-box">
                <div>名称</div>
                <div>
                  <el-input type="text" v-model="point.ident" />
                </div>
              </div>
              <div class="item-box">
                <div>坐标</div>
                <div>
                  {{
                    point.locationObj.latitude.toFixed(6) +
                    '，' +
                    point.locationObj.longitude.toFixed(6)
                  }}
                </div>
              </div>
              <div class="port-btn-box">
                <el-button type="danger" @click.stop="deletePoint(point.id)" size="mini"
                  >删除</el-button
                >
                <el-button type="primary" @click.stop="editPoint(point)" size="mini"
                  >保存</el-button
                >
              </div>
            </div>
          </el-amap-marker>
        </template>

        <!--进出港程序-->
        <template v-if="procedureList.length" id="procedure">
          <div v-for="item in procedureList" :key="item.id + 'cc'">
            <el-amap-polyline
              :strokeColor="item.type === 1 ? '#00000' : ' #8af22d'"
              strokeStyle="solid"
              :geodesic="true"
              :path="item.boundList"
              :strokeWeight="currentProcedure && currentProcedure.id === item.id ? 6 : 2"
              :events="procedureLineEvents"
              :bubble="true"
              :editable="currentProcedure && currentProcedure.id === item.id"
              :extData="item"
              lineJoin="round"
            >
            </el-amap-polyline>

            <el-amap-marker
              :position="item.centerPoint"
              :offset="[-9, -4]"
              :events="procedureMarkerEvents"
              :extData="item"
            >
              <div class="text-style" @click.stop="handleCurrentClick('procedure', item)">
                {{ item.ident + BASE_CONSTANTS.procedureType(item.type) }}
              </div>
            </el-amap-marker>

            <template v-if="currentProcedure && currentProcedure.id === item.id">
              <el-amap-marker :position="item.centerPoint" :offset="[-3, -3]" :extData="item">
                <!-- 程序信息框 -->
                <div
                  class="port-box"
                  @mousemove="eventStopPropagation('div', $event)"
                  @mousedown="eventStopPropagation('div', $event)"
                  @mouseenter="eventStopPropagation('input')"
                >
                  <i class="el-icon-close" @click.stop="handleBoxClose('procedure')"></i>
                  <div class="item-box-title">
                    {{ BASE_CONSTANTS.procedureType(item.type) }}程序 {{ item.ident }}
                  </div>
                  <div class="item-box">
                    <div>起点</div>
                    <div class="item-select">
                      <el-select v-model="item.startId" placeholder="请选择" size="mini">
                        <el-option
                          v-for="(point, index) in pointList"
                          :key="index + 'ee'"
                          :label="point.ident"
                          :value="point.id"
                        >
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="item-box">
                    <div>终点</div>
                    <div class="item-select">
                      <el-select v-model="item.endId" placeholder="请选择" size="mini">
                        <el-option
                          v-for="(point, index) in pointList"
                          :key="index + 'dd'"
                          :label="point.ident"
                          :value="point.id"
                        >
                        </el-option>
                      </el-select>
                    </div>
                  </div>
                  <div class="port-btn-box">
                    <el-button type="danger" @click="deleteProcedure(item.id)" size="mini"
                      >删除</el-button
                    >
                    <el-button type="primary" @clic.stop="editProcedure(item)" size="mini"
                      >保存</el-button
                    >
                  </div>
                </div>
              </el-amap-marker>
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
import * as portApi from 'api/port';
import { apiGetNavaByQuery } from 'api/nava';
import { apiGetWayByQuery } from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path, path2Str } from '@/utils/handleLngLat';
import { debounce, confirmMsg } from '@/utils';
import { BASE_CONSTANTS } from '@/config';

export default {
  name: 'portberth',
  components: {
    Amap,
    TableSearch
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
      currentPort: {
        isPortEdit: false
      },
      currentBerth: null,
      currentPoint: null,
      currentProcedure: null,

      isRequst: true,
      zoomLevel: 15,
      publicQuery: {
        'Condition.PortId': '',
        'Condition.Type': null, //1代表离港，2代表进港
        'Condition.IsInEffect': true,
        'Condition.Rect.TopLeft': '',
        'Condition.Rect.TopRight': '',
        'Condition.Rect.BottomLeft': '',
        'Condition.Rect.BottomRight': '',
        'Condition.ZoomLevel': 15,
        'Condition.Keyword': '',
        Page: 1,
        Size: 10
      },
      portList: [], //港口数据
      berthList: [], //泊位数据
      navaList: [], //航标数据
      waterwayList: [], //航道数据
      pointList: [], //端点数据
      procedureList: [], //程序数据

      // 航道事件
      waterwayEvents: Object.freeze({}),
      pointEvents: Object.freeze({
        // 鼠标拖动修改对应的经纬度
        dragging: (e) => {
          // 港口端点拖动事件
          if (this.currentPoint) {
            let location = e.target.getPosition();
            this.currentPoint.location = turnLngLat(location);
          }
        }
      }),
      procedureLineEvents: Object.freeze({}),
      procedureMarkerEvents: Object.freeze({}),
      portLineEvents: Object.freeze({
        adjust: (e) => {
          if (!this.currentPort.id) return;
          let bounds = e.target.getPath();
          this.currentPort.bounds = path2Str(bounds);
          // let area = Math.round(AMap.GeometryUtil.ringArea(bounds));
        }
      }),
      BerthEvents: Object.freeze({
        adjust: (e) => {
          if (this.currentBerth) {
            let bounds = e.target.getPath();
            this.currentBerth.bounds = path2Str(bounds);
          }
        }
      })
    };
  },
  methods: {
    /**
     * 阻止航标信息框以及input冒泡到地图
     */
    eventStopPropagation(type, event) {
      if (type === 'input') {
        const stop = (e) => {
          e.stopPropagation();
        };
        const inps = document.querySelectorAll('input');
        [...inps].map((itemInput) => {
          itemInput.onkeydown = stop;
        });
      } else {
        event.stopPropagation();
      }
    },
    /**
     * 获取航道信息
     */
    async getWaterwayList() {
      const { data, errorCode } = await apiGetWayByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.waterwayList = data.result;
        for (let item of data.result) {
          // 根据标识开头字母设置不同的颜色
          let en = item.ident.charAt(0).toUpperCase();
          item.color = BASE_CONSTANTS.colorArray(en);
          // 航标点排序
          item.fixes.sort((a, b) => a.order - b.order);
          // 为每一项添加二维航道路线数组
          item.fixesArray = [];
          // 处理航标坐标组成航道线
          for (let x of item.fixes) {
            const fixesArrays = item.fixesArray;
            // 经纬度转换
            x.navaid.locationObj = turnLngLatObj(x.navaid.location);
            // 轨迹数组创建
            fixesArrays.push([x.navaid.locationObj.longitude, x.navaid.locationObj.latitude]);
          }
        }
        // console.log('getWaterwayList', this.waterwayList);
      }
    },
    /**
     * 获取航标信息
     */
    async getNavaList() {
      const { data, errorCode } = await apiGetNavaByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.navaList = data.result;
        for (let item of data.result) {
          item.locationObj = turnLngLatObj(item.location);
          item.locationArr = turnLngLat(item.location);
        }
      }
    },
    /**
     * 获取港口信息
     */
    async getPortList() {
      const { data, errorCode } = await portApi.apiGetPortByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.portList = data.result;
        for (let item of data.result) {
          item.locationObj = turnLngLatObj(item.location);
          item.locationArr = turnLngLat(item.location);
          item.boundList = str2Path(item.bounds);
          item.area = +item.area.toFixed(2);
        }
        // console.log(this.portList);
      }
    },
    /**
     * 获取端点信息
     */
    async getPointLsit(id) {
      const { data, errorCode } = await portApi.apiGetPointById(id);
      if (+errorCode === 0) {
        this.pointList = data;
        for (const item of data) {
          item.locationObj = turnLngLatObj(item.location);
          item.locationArr = turnLngLat(item.location);
          item.ident = item.ident.toLocaleUpperCase();
        }
        // console.log(data);
      }
    },
    /**
     *
     * 获取程序信息
     */
    async getProcedureList(id) {
      this.publicQuery['Condition.PortId'] = id;
      const { data, errorCode } = await portApi.apiGetProcedureByQuery(this.publicQuery);
      if (+errorCode === 0) {
        for (const item of data.result) {
          item.boundList = str2Path(item.path);
          item.ident = item.ident.toLocaleUpperCase();
          item.centerPoint =
            item.boundList.length % 2 == 0
              ? item.boundList[item.boundList.length / 2]
              : item.boundList[(item.boundList.length - 1) / 2];

          item.tableShowPoint = `${item.start.ident.toLocaleUpperCase()} → ${item.end.ident.toLocaleUpperCase()}`;
        }
        this.procedureList = data.result.sort((a, b) => a.type - b.type); //type: 1离港,2进港
        console.log(this.procedureList);
      }
    },

    /**
     * 根据港口id获取泊位信息
     */
    async getBerthList(id) {
      const { data, errorCode } = await portApi.apiGetBerthById(id);
      if (+errorCode === 0) {
        this.berthList = data;
        for (let item of data) {
          item.locationObj = turnLngLatObj(item.location);
          item.locationArr = turnLngLat(item.location);
          item.boundList = str2Path(item.bounds);
          item.area = +item.area.toFixed(2);
        }
        // console.log(this.berthList);
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
      await Promise.all([
        this.getPortList(this.publicQuery),
        this.getNavaList(this.publicQuery),
        this.getWaterwayList(this.publicQuery)
      ]);
      // if(this.isRequst){
      //   this.getWaterwayList(this.publicQuery)
      // }

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

      //显示距离地图正中心最近的港口信息
      if (
        currentPort.id &&
        this.portList.find((item) => item.id === currentPort.id) &&
        clitentArea < currentPort.area * 50
      ) {
        //显示距离正中心最近的港口信息
        this.currentPort = { ...currentPort, ...this.currentPort };
        // console.log(this.currentPort);
        this.showPortArea(this.currentPort, amap);
      } else {
        // 重置数据
        this.currentPort = { isPortEdit: false };
        this.currentBerth = null;
        this.currentPoint = null;
        this.berthList.length = 0;
        this.pointList.length = 0;
        currentPort = null;
      }
    }, 400),
    /**
     * 显示当前港口详情范围
     */
    showPortArea(currentPort, amap) {
      const { id, ident, name } = currentPort;
      console.log('当前港口:', name);

      this.getBerthList(id); // 泊位列表方法
      this.getPointLsit(id); //端点数据的方法
      this.getProcedureList(id); //程序路径列表方法  程序

      this.getTransitionList(); //过渡路径数据的方法  过渡
    },

    async getTransitionList(id) {},

    /**
     * 点击不同的maker标显示信息
     */
    handleCurrentClick(type, value) {
      if (type === 'port') {
        this.currentPort = { ...value, isPortEdit: true };
        this.currentBerth = null;
        this.currentPoint = null;
        this.currentProcedure = null;
      } else if (type === 'berth') {
        this.currentBerth = value;
        this.currentPort.isPortEdit = false;
        this.currentPoint = null;
        this.currentProcedure = null;
      } else if (type === 'point') {
        this.currentPoint = value;
        this.currentPort.isPortEdit = false;
        this.currentBerth = null;
        this.currentProcedure = null;
      } else if (type === 'procedure') {
        this.currentProcedure = value;
        console.log(this.pointList);
        this.currentPort.isPortEdit = false;
        this.currentPoint = null;
        this.currentBerth = null;
      }
    },
    /**
     * 关闭信息框
     */
    handleBoxClose(type) {
      if (type === 'port') {
        this.currentPort.isPortEdit = false;
      } else if (type === 'berth') {
        this.currentBerth = null;
      } else if (type === 'procedure') {
        this.currentProcedure = null;
      } else if (type === 'point') {
        this.currentPoint = null;
      }
    },
    /**
     * 修改港口
     */
    async editPort(port) {
      const params = {
        id: port.id,
        name: port.name,
        zoomLevel: port.zoomLevel,
        bounds: this.currentPort.bounds
      };
      const { errorCode } = await portApi.apiEditPort(params);
      if (+errorCode === 0) {
        this.getPortList(this.publicQuery);
        this.$message.success('修改成功');
        this.currentPort.isPortEdit = false;
      }
    },
    /**
     * 修改泊位
     */
    async editBerth(berth) {
      const params = {
        id: berth.id,
        ident: berth.ident,
        bounds: this.currentBerth.bounds
      };
      const { errorCode } = await portApi.apiEditBerth(params);
      if (+errorCode === 0) {
        this.getBerthList(this.publicQuery);
        this.$message.success('修改成功');
        this.currentBerth = null;
      }
    },
    /**
     * 修改端点
     */
    async editPoint(point) {
      const params = {
        Id: point.id,
        Ident: point.ident,
        Location: this.currentPoint.location
      };
      const { errorCode } = await portApi.apiEditPoint(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
      }
    },

    async editProcedure(val) {},

    /**
     * 删除程序
     */
    async deleteProcedure(id) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await portApi.apiDelProcedure(id);
        if (+errorCode === 0) {
          this.$message.success('删除成功');
        }
      }
    },

    /**
     * 删除端点
     */
    async deletePoint(id) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await portApi.apiDelPoint(id);
        if (+errorCode === 0) {
          this.$message.success('删除成功');
        }
      }
    },
    /**
     * 删除过渡路径
     */
    async deleteTransition(id) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await portApi.apiDelTransition(id);
        if (+errorCode === 0) {
          this.$message.success('删除成功');
        }
      }
    },
    /**
     * 删除港口
     */
    async deletePort(id) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await portApi.apiDelPort(id);
        if (+errorCode === 0) {
          this.$message.success('删除成功');
        }
      }
    },
    /**
     * 删除泊位
     */
    async deleteBreth(id) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await portApi.apiDeleteBerth(id);
        if (+errorCode === 0) {
          this.$message.success('删除成功');
        }
      }
    }
  }
};
</script>

<style scoped lang="less">
@port-maker-color: #1c6db9;
@port-box_color: rgba(255, 255, 255, 0.9);
@nava-box_color: rgba(80, 114, 209, 0.8);
@nava-maker-color: rgba(90, 115, 141, 1);
.shadow {
  box-shadow: 0 0 8px -2px;
}
/**公共信息框中的字体样式*/
.text-style {
  white-space: nowrap;
  font-size: 14px;
  font-weight: bold;
  text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
}

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
  /*航标信息框*/
  .nava-box {
    position: absolute;
    top: 26px;
    left: -11px;
    padding: 0 3px;
    text-align: center;
    border-radius: 3px;
    color: rgb(76, 113, 212);
    background: @nava-box_color;

    &::after {
      content: '';
      width: 0;
      height: 0;
      border-bottom: 8px solid rgba(80, 114, 209, 0.397);
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      position: absolute;
      top: -8px;
      left: 15px;
    }
  }

  /**航标点样式 */
  .nava-maker {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    border: 3px solid @nava-maker-color;
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
    background-color: @port-maker-color;
    color: #242f42;
  }
  /* 泊位圆点 */
  .berth-point {
    width: 7px;
    height: 7px;
    background-color: rgb(137, 128, 145);
    border-radius: 50%;
  }

  .berth-maker {
    border: 2px solid rgb(137, 128, 145);
    border-radius: 50%;
  }
  /* 端点圆点 */
  .point-point {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: rgb(29, 57, 136);
  }

  /**公共框中的每一项*/
  .item-box {
    display: flex;
    margin-bottom: 12px;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;
    > div:first-child {
      margin-right: 18px;
      padding-left: 2px;
    }
  }
  .item-select {
    width: 170px;
  }
  /**公共框中的标题项*/
  .item-box-title {
    font-size: 16px;
    line-height: 35px;
    font-weight: bold;
  }
  /**公共框*/
  /deep/ .port-box {
    position: absolute;
    left: 15px;
    top: 50px;
    padding: 10px 15px 15px 15px;
    border-radius: 10px;
    font-size: 15px;
    background-color: @port-box_color;
    &:hover {
      cursor: default;
    }
    &::after {
      content: '';
      width: 0;
      height: 0;
      border-bottom: 10px solid @port-box_color;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      position: absolute;
      top: -10px;
      left: 10px;
    }
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
  /**信息框按钮 */
  .port-btn-box {
    text-align: center;
  }
}
</style>
