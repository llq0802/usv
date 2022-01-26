<template>
  <div class="port-content">
    <table-search buttonName="添加港口" class="port-search" />

    <Amap ref="amap" :isEdit="isClickMap" @getMapBounds="getMapBounds" @getLngLat="getLngLat">
      <template #port_berth>
        <!-- 港口航标-->
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="item in navaList"
            :key="item.id"
            :position="item.locationArr"
            :offset="[-5, -5]"
            :zIndex="9"
          >
            <div class="nava-maker"></div>
            <div class="nava-box shadow text-style">{{ item.ident }}</div>
          </el-amap-marker>
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

        <!-- 港口 -->
        <template v-if="portList.length">
          <template v-for="port in portList">
            <el-amap-marker :key="port.id + '11'" :position="port.locationArr" :zIndex="108">
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
                    <el-input type="text" v-model="port.name" size="mini" />
                  </div>
                </div>
                <div class="item-box">
                  <div>层级</div>
                  <el-input type="text" v-model="port.zoomLevel" size="mini" />
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
                  <el-button
                    type="danger"
                    size="mini"
                    @click.stop="handleDelete(port.id, 'apiDelPort')"
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
                :zIndex="50"
              ></el-amap-polygon>
            </div>
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
                  <el-input type="text" v-model="berth.ident" size="mini" />
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
                <el-button
                  type="danger"
                  size="mini"
                  @click.stop="handleDelete(berth.id, 'apiDelBerth')"
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
            :events="BerthLineEvents"
            :extData="bound"
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
            :draggable="currentPoint && currentPoint.id === point.id"
            :events="pointEvents"
            :extData="point"
            :zIndex="currentPoint && currentPoint.id == point.id ? 1000 : 100"
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
                  <el-input type="text" v-model="point.ident" size="mini" />
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
                <el-button
                  type="danger"
                  @click.stop="handleDelete(point.id, 'apiDelPoint')"
                  size="mini"
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
                :offset="[-9, -4]"
                :events="procedureMarkerEvents"
                :extData="item"
                :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
              >
                <div class="text-style" @click.stop="handleCurrentClick('procedure', item)">
                  {{ item.ident + BASE_CONSTANTS.procedureType(item.type) }}
                </div>
              </el-amap-marker>

              <template v-if="currentProcedure && currentProcedure.id === item.id">
                <el-amap-marker
                  :key="item.id + 'jj'"
                  :position="item.centerPoint"
                  :offset="[-3, -3]"
                  :extData="item"
                  :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
                >
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
                      <div>名称</div>
                      <div>
                        <el-input type="text" v-model="item.ident" size="mini" />
                      </div>
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
                      <el-button
                        type="danger"
                        @click.stop="handleDelete(item.id, 'apiDelProcedure')"
                        size="mini"
                        >删除</el-button
                      >
                      <el-button type="primary" @click.stop="editProcedure(item)" size="mini"
                        >保存</el-button
                      >
                    </div>
                  </div>
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
                :strokeColor="item.direction === 1 ? '#976F02' : '#00C227'"
                :strokeWeight="
                  currentTransition && currentTransition.id === item.id ? 6 : item.strokeWeight
                "
                :events="transitionLineEvents"
                :editable="currentTransition && currentTransition.id === item.id"
                :extData="item"
                :geodesic="true"
                lineJoin="round"
                :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
              >
              </el-amap-polyline>

              <el-amap-marker
                :key="index + 'kk'"
                :position="item.centerPoint"
                :offset="[-3, -6]"
                :events="transitionMarkerEvents"
                :extData="item"
                :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
              >
                <span class="text-style" @click.stop="handleCurrentClick('transition', item)"
                  >{{ item.direction === 1 ? 'TO' : 'FROM' }} {{ item.ident }}</span
                >
              </el-amap-marker>

              <template v-if="currentTransition && currentTransition.id === item.id">
                <el-amap-marker
                  :position="item.centerPoint"
                  :offset="[-20, -15]"
                  :events="transitionMarkerEvents"
                  :key="index + 'll'"
                >
                  <!-- 过渡路径信息框 -->
                  <div
                    class="port-box"
                    @mousemove="eventStopPropagation('div', $event)"
                    @mousedown="eventStopPropagation('div', $event)"
                    @mouseenter="eventStopPropagation('input')"
                  >
                    <i class="el-icon-close" @click="handleBoxClose('transition')"></i>
                    <div class="item-box-title">
                      {{ item.direction == 1 ? '进港' : '出港'
                      }}{{ item.type == 1 ? '泊位' : '航标' }}过渡路径
                    </div>
                    <div v-show="item.type === 2" class="item-box">
                      <div>航标</div>
                      <div class="item-select">
                        <el-select
                          v-model="item.navaidId"
                          placeholder="请选择"
                          clearable
                          size="mini"
                        >
                          <el-option
                            v-for="nava in navaList"
                            :key="nava.id"
                            :label="nava.ident"
                            :value="nava.id"
                          >
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                    <div v-show="item.type == 1" class="item-box">
                      <div>泊位</div>
                      <div class="item-select">
                        <el-select
                          v-model="item.berthId"
                          placeholder="请选择"
                          clearable
                          size="mini"
                        >
                          <el-option
                            v-for="berth in berthList"
                            :key="berth.id"
                            :label="berth.ident"
                            :value="berth.id"
                          >
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                    <div class="item-box">
                      <div>端点</div>
                      <div class="item-select">
                        <el-select
                          v-model="item.procedureEndpointId"
                          placeholder="请选择"
                          size="mini"
                        >
                          <el-option
                            v-for="point in pointList"
                            :key="point.id"
                            :label="point.ident"
                            :value="point.id"
                          >
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                    <div class="item-box">
                      <div>方向</div>
                      <div class="item-select">
                        <el-radio-group
                          v-model="item.direction"
                          @change="(val) => (item.path = item.path.reverse())"
                        >
                          <el-radio :label="2">离港</el-radio>
                          <el-radio :label="1">进港</el-radio>
                        </el-radio-group>
                      </div>
                    </div>
                    <div class="port-btn-box">
                      <el-button
                        type="danger"
                        @click.stop="handleDelete(item.id, 'apiDelTransition')"
                        size="mini"
                        >删除</el-button
                      >
                      <el-button type="primary" @click.stop="editTransition(item)" size="mini"
                        >保存</el-button
                      >
                    </div>
                  </div>
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
import * as portApi from 'api/port';
import { apiGetNavaByQuery } from 'api/nava';
import { apiGetWayByQuery } from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path, path2Str } from '@/utils/handleLngLat';
import { debounce, deepClone, confirmMsg } from '@/utils';
import { BASE_CONSTANTS, PAGE_SIZE } from '@/config';

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
      currentPort: { isPortEdit: false },
      cacheBoundList: [],
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

      // 地图事件
      waterwayEvents: Object.freeze({}),
      transitionMarkerEvents: Object.freeze({}),
      procedureMarkerEvents: Object.freeze({}),
      transitionLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentTransition) {
            const id = e.target.getExtData().id;
            // let transition = this.transitionList.find((item) => item.id === id);
            // transition = e.target.getPath();
            this.currentTransition.path = e.target.getPath();
          }
        },
        click: (e) => {
          if (this.transitionList.length) {
            const item = e.target.getExtData();
            // this.currentTransition = item;
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
            let location = e.target.getPosition();
            let id = e.target.getExtData().id;
            const point = this.pointList.find((item) => item.id === id);
            point.locationObj.latitude = location.lat;
            point.locationObj.longitude = location.lng;
            this.currentPoint.location = turnLngLat(location);
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
            const item = e.target.getExtData();
            // this.currentTransition = item;
          }
        }
      }),
      portLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (!this.currentPort.id) return;
          let bounds = e.target.getPath();
          this.currentPort.bounds = path2Str(bounds);
          // let area = Math.round(AMap.GeometryUtil.ringArea(bounds));
        }
      }),
      BerthLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
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
          this.$set(item, 'locationObj', turnLngLatObj(item.location)); //响应式
          item.locationArr = turnLngLat(item.location);
          item.boundList = str2Path(item.bounds);
          item.area = +item.area.toFixed(2);
        }
        // console.log(this.portList);
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
          this.$set(item, 'locationObj', turnLngLatObj(item.location)); //响应式
          item.locationArr = turnLngLat(item.location);
          item.boundList = str2Path(item.bounds);
          item.area = +item.area.toFixed(2);
        }
        // console.log(this.berthList);
      }
    },
    /**
     * 获取端点信息
     */
    async getPointList(id) {
      const { data, errorCode } = await portApi.apiGetPointById(id);
      if (+errorCode === 0) {
        this.pointList = data;
        for (const item of data) {
          // item.locationObj = turnLngLatObj(item.location);
          this.$set(item, 'locationObj', turnLngLatObj(item.location)); //响应式
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
        for (let item of data.result) {
          item.boundList = str2Path(item.path);
          item.ident = item.ident.toLocaleUpperCase();
          this.$set(item, 'strokeWeight', 2);
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
     * 获取过渡路径信息
     */
    async getTransitionList(id) {
      this.publicQuery['Condition.Id'] = id;
      const { data, errorCode } = await portApi.apiGetTransitionByQuery(this.publicQuery);
      if (+errorCode === 0) {
        //item.direction == 1 ? '进港' : '出港' , item.type == 1 ? '泊位' : '航标'
        this.transitionList = data.result;
        this.transitionList = this.transitionList.map((item) => {
          this.$set(item, 'strokeWeight', 2);

          item.path = str2Path(item.path);
          item.centerPoint =
            item.path.length % 2 == 0
              ? item.path[item.path.length / 2]
              : item.path[(item.path.length - 1) / 2];
          item.procedureEndpointIdent = item.procedureEndpoint.ident.toUpperCase();
          item.ident = item.ident.toUpperCase();
          item.showPath =
            (item.direction === 1 && item.type === 1) || (item.direction === 2 && item.type === 2)
              ? `${item.procedureEndpoint.ident.toUpperCase()} → ${item.ident}`
              : `${item.ident} → ${item.procedureEndpoint.ident.toUpperCase()}`;

          return item;
        });
        // console.log(this.transitionList);
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

      //显示距离地图正中心最近的港口信息
      if (
        currentPort.id &&
        this.portList.find((item) => item.id === currentPort.id) &&
        clitentArea < currentPort.area * 50
      ) {
        //显示距离正中心最近的港口信息
        this.currentPort = { ...currentPort, ...this.currentPort };
        if (this.isRequest) this.showPortArea(this.currentPort, amap);
      } else {
        // 重置数据
        this.currentPort = { isPortEdit: false };
        this.currentBerth = null;
        this.currentPoint = null;
        this.currentProcedure = null;
        this.currentTransition = null;
        this.berthList.length = 0;
        this.pointList.length = 0;
        this.procedureList.length = 0;
        this.transitionList.length = 0;
        currentPort = null;
        // 可以继续请求数据
        this.isRequest = true;
      }
    }, 400),
    /**
     * 显示当前港口详情范围
     */
    showPortArea(currentPort, amap) {
      const { id, ident, name } = currentPort;
      console.log('当前港口:', name);
      this.getBerthList(id); // 泊位列表方法
      this.getPointList(id); //端点数据的方法
      this.getProcedureList(id); //程序路径列表方法  程序
      this.getTransitionList(id); //过渡路径数据的方法  过渡
    },

    getLngLat(p) {
      console.log(p);
    },

    /**
     * 点击不同的maker标显示信息
     */
    handleCurrentClick(type, value) {
      if (type === 'port') {
        this.currentPort = { ...value, isPortEdit: true };
        this.cacheBoundList = deepClone(this.currentPort.boundList);
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
        this.currentPort.boundList = this.cacheBoundList; //港口范围缓存
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
        this.$message.success('修改成功');
        this.currentPort.isPortEdit = false;
        this.getPortList(this.publicQuery);
      }
      this.isRequest = true;
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
        this.$message.success('修改成功');
        this.currentBerth = null;
        this.getBerthList(this.currentPort.id);
      }
      this.isRequest = true;
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
        this.currentPoint = null;
        this.getPointList(this.currentPort.id);
      }
      this.isRequest = true;
    },
    /**
     * 修改程序
     */
    async editProcedure(val) {
      const params = {
        id: val.id,
        ident: val.ident,
        startId: val.startId,
        endId: val.endId,
        path: this.currentProcedure.path,
        type: val.type
      };
      const { errorCode } = await portApi.apiEditProcedure(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentProcedure = null;
        this.getProcedureList(this.currentPort.id);
      }
      this.isRequest = true;
    },
    /**
     * 修改过渡路径
     */
    async editTransition(val) {
      const params = {
        id: val.id,
        targetId: val.type === 1 ? val.berthId : val.navaidId, //1为泊位,2为航标
        procedureEndpointId: val.procedureEndpointId,
        direction: val.direction,
        path: path2Str(this.currentTransition.path)
      };
      const { errorCode } = await portApi.apiEditTransition(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentTransition = null;
        this.getTransitionList(this.currentPort.id);
      }
      this.isRequest = true;
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
