<template>
  <div class="port-content">
    <Amap ref="amap" @getMapBounds="getMapBounds">
      <template #port_berth>
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="item in navaList"
            :key="item.id"
            :position="item.locationArr"
            :zIndex="9"
          >
            <div class="nava-point"></div>
            <div class="nava-box text-style">{{ item.ident }}</div>
          </el-amap-marker>
        </template>

        <template v-if="portList.length">
          <el-amap-marker
            v-for="port in portList"
            :key="port.id"
            :position="port.locationArr"
            :zIndex="10"
          >
            <div class="port-maker ident-box" @click.stop="clickCurrent(port)">
              <i class="iconfont el-icon-gangkou"></i>
              {{ port.name }}
            </div>

            <div
              class="port-box"
              v-show="currentPortId === port.id"
              @mousemove="eventStopPropagation('div', $event)"
              @mousedown="eventStopPropagation('div', $event)"
              @mouseenter="eventStopPropagation('input')"
            >
              <i class="el-icon-close" @click.stop="closeBox('data')"></i>
              <div class="item-box-title">{{ port.name }} 港口</div>
              <div class="item-box">
                <div>名称</div>
                <div>
                  <el-input type="text" v-model="port.name" size="mini" />
                </div>
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
                    ',' +
                    port.locationObj.longitude.toFixed(6)
                  }}
                </div>
              </div>
              <div class="port-btn-box">
                <el-button type="danger" size="mini" @click.stop="deletePort(port.id)"
                  >删除</el-button
                >
                <el-button type="primary" size="mini">保存</el-button>
              </div>
            </div>
          </el-amap-marker>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
import Amap from 'components/amap/Amap';
import { apiGetNavaByQuery } from 'api/nava';
import { apiGetWayByQuery } from 'api/waterway';
import * as portApi from 'api/port';
import { turnLngLat, turnLngLatObj } from '@/utils/handleLngLat';
import { debounce, confirmMsg } from '@/utils';

export default {
  name: 'portberth',
  components: {
    Amap
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
      currentPortId: null,
      navaQuery: {
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
      waterwayList: [] //航道数据
    };
  },
  methods: {
    //港口阻止航标信息框以及input冒泡
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

    async getWaterwayList() {
      let { data, errorCode } = await apiGetWayByQuery(this.navaQuery);
      if (+errorCode === 0) {
        this.waterwayList = data.result;
        for (let item of data.result) {
        }
        console.log(this.waterwayList);
      }
    },
    async getNavaList() {
      let { data, errorCode } = await apiGetNavaByQuery(this.navaQuery);
      if (+errorCode === 0) {
        this.navaList = data.result;
        for (let item of data.result) {
          item.locationObj = turnLngLatObj(item.location);
          item.locationArr = turnLngLat(item.location);
        }
      }
    },
    async getPortList() {
      let { data, errorCode } = await portApi.apiGetPortByQuery(this.navaQuery);
      if (+errorCode === 0) {
        this.portList = data.result;
        for (let item of data.result) {
          item.locationObj = turnLngLatObj(item.location);
          item.locationArr = turnLngLat(item.location);
        }
        // console.log(this.portList);
      }
    },
    getMapBounds: debounce(function (boundPath, zoom, center) {
      let clitentArea = Math.round(AMap.GeometryUtil.ringArea(boundPath));
      this.navaQuery['Condition.Rect.TopLeft'] = turnLngLat(boundPath[3]);
      this.navaQuery['Condition.Rect.TopRight'] = turnLngLat(boundPath[2]);
      this.navaQuery['Condition.Rect.BottomLeft'] = turnLngLat(boundPath[1]);
      this.navaQuery['Condition.Rect.BottomRight'] = turnLngLat(boundPath[0]);
      this.navaQuery['Condition.ZoomLevel'] = zoom;
      this.getPortList(this.navaQuery);
      this.getNavaList(this.navaQuery);
      this.getWaterwayList(this.navaQuery);
    }, 400),

    clickCurrent(port) {
      this.currentPortId = port.id;
    },

    closeBox() {
      this.currentPortId = null;
    },
    // 删除港口
    async deletePort(id) {
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await portApi.apiDelPort(id);
        if (+errorCode === 0) {
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

  .nava-box {
    position: absolute;
    top: 26px;
    left: -11px;
    padding: 0 3px;
    text-align: center;
    border-radius: 3px;
    color: rgb(76, 113, 212);
    background: rgba(80, 114, 209, 0.8);
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
  //ident字体
  .text-style {
    white-space: nowrap;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
  }
  .nava-point {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 4px solid rgb(90, 115, 141);
  }

  /**每一项**/
  .item-box {
    display: flex;
    margin-bottom: 10px;
    justify-content: space-between;
    align-items: center;
    > div:first-child {
      width: 55px;
      margin-right: 2px;
      padding-left: 2px;
    }
  }
  .item-box-title {
    font-size: 16px;
    line-height: 35px;
    font-weight: bold;
  }

  /deep/ .port-box {
    position: absolute;
    left: 24px;
    top: 50px;
    z-index: 99;
    padding: 15px;
    border-radius: 10px;
    font-size: 15px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 8px -2px;
    &:hover {
      cursor: default;
    }
    &::after {
      content: '';
      width: 0;
      height: 0;
      border-bottom: 10px solid rgba(255, 255, 255, 0.9);
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      position: absolute;
      top: -10px;
      left: 10px;
    }
    .el-icon-close {
      position: absolute;
      right: 10px;
      font-size: 18px;
    }
  }

  .port-btn-box {
    text-align: center;
  }
}
</style>
