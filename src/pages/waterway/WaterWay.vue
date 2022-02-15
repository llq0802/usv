<template>
  <div class="way-content">
    <div class="add-nava">
      <keyword-search
        class="search-main-box"
        :placeholder="'关键字搜索航道或航标'"
        :autoClear="true"
        :isShowWaterway="true"
        @selectNavaAndWay="selectNavaAndWay"
      />
      <el-button type="primary" @click="handleAddNava">添加航标</el-button>
      <el-button type="primary" @click="handleAddWay">添加航道</el-button>
    </div>

    <way-dialog
      class="way-dialog"
      ref="waydialog"
      v-if="currentWay.length"
      :wayList="currentWay"
      @handleEdit="handleEdit"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
    />

    <edit-or-add-way
      ref="editaddway"
      class="edit-or-add-way"
      v-if="isShowWayDialog"
      :currentWay="currentWayDialog"
      :isAutoPlan="!wayAddData.plan"
      @handleNavaClick="handleNavaClick"
      @handleDelCurrentWayDialog="handleDelCurrentWayDialog"
      @handleDelWayPrevOrNext="handleDelWayPrevOrNext"
      @handleWaySave="handleWaySave"
      @autoPlanRequest="autoPlanRequest"
      @handleWayCancel="handleWayCancel"
    />

    <Amap ref="amap" :isEdit="isClickMap" @getLngLat="getMapLngLat" @getMapBounds="getMapBounds">
      <template #chanel>
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
            :events="waterwayEvents"
            lineJoin="round"
          >
          </el-amap-polyline>
        </template>
        <!-- 鼠标经过航道显示dient -->
        <div ref="wayIdent" v-show="isShowWayIdent" class="wayIdent">{{ currentWayIdent }}</div>
        <!-- 当前选中的航道 -->
        <template v-if="isShowHighlightWay">
          <el-amap-polyline
            v-for="(item, index) in currentWay"
            :extData="item"
            :key="index + 'b'"
            :path="item.fixesArray"
            :strokeStyle="item.connectivity === 2 ? 'solid' : 'dashed'"
            :strokeColor="item.color"
            :strokeWeight="8"
            :events="currentWayEvents"
            :zIndex="60"
            lineJoin="round"
            ref="currentWay"
          ></el-amap-polyline>
        </template>
        <!-- 航标 -->
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="(item, index) in navaList"
            :key="index"
            :position="[item.locationObj.longitude, item.locationObj.latitude]"
            :draggable="currentNava && currentNava.id === item.id && !isShowWayDialog"
            :zIndex="currentNava && currentNava.id === item.id ? 900 : 100"
            :events="navaEvents"
            :extData="item"
            :offset="[-5, -5]"
          >
            <nava-dialog
              :value="item"
              :currentNava="currentNava"
              :isDisable="isShowWayDialog"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleEdit="handleEdit"
              @handleDelete="handleDelete"
            />
          </el-amap-marker>

          <template v-for="(nava, index) in navaList">
            <el-amap-circle
              v-if="currentNava && currentNava.id === nava.id"
              :key="index + 'bb'"
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
        <!--  修改航道中的航标(高亮) -->
        <template v-if="currentWayDialog && currentWayDialog.fixes.length">
          <el-amap-marker
            v-for="(item, index) in currentWayDialog.fixes"
            :key="index + 'i'"
            :zIndex="999"
            :offset="[-5, -5]"
            :position="[item.navaid.locationObj.longitude, item.navaid.locationObj.latitude]"
          >
            <div class="nava-box light-nava" @click="handleClickHighlightNava(item, index)">
              <!-- 航标ident信息 -->
              {{ item.navaid.ident }}
            </div>
          </el-amap-marker>
        </template>

        <!-- 新增航标 -->
        <template v-if="navaAddData && navaAddData.latitude">
          <el-amap-marker
            :position="[navaAddData.longitude, navaAddData.latitude]"
            :draggable="true"
            :offset="[-3, -3]"
            :zIndex="1000"
            :events="navaEvents"
          >
            <AddNavaDialog
              :value="navaAddData"
              @handleAddSave="handleAddSave"
              @handleAddBoxClose="handleAddBoxClose"
            ></AddNavaDialog>
          </el-amap-marker>
          <!-- 新增航标半径 -->
          <el-amap-circle
            :center="[navaAddData.longitude, navaAddData.latitude]"
            :radius="navaAddData.radius"
            :fill-opacity="0.5"
            strokeColor="#75CAE7"
            fillColor="#86D4D8"
            :bubble="true"
          ></el-amap-circle>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
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
import getList from './mixins-js/getList';
import delList from './mixins-js/delList';
import editList from './mixins-js/editList';
import amapEvents from './mixins-js/amapEvents';
import utils from './mixins-js/utils';
import { BASE_CONSTANTS } from '@/config';

export default {
  name: 'WaterWay',
  mixins: [getList, delList, editList, amapEvents, utils],
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
      },
      // 新增航标数据
      navaAddData: {
        isClick: false,
        ident: '',
        latitude: null,
        longitude: null,
        radius: 1000,
        zoomLevel: 3
      },
      // 新增航道数据
      wayAddData: {
        isShowTips: false,
        isClick: false, // 是否点击了新增航道按钮 点击了为新增,没点击为修改
        wayDistance: 0,
        // verify: false,
        ident: '',
        plan: 1 //0自动规划, 1手动规划
      }
    };
  },
  methods: {
    async selectNavaAndWay(value) {
      const amap = this.$refs.amap;
      if (value.type === 1) {
        this.$set(value, 'locationObj', turnLngLatObj(value.location));
        value.locationArr = turnLngLat(value.location);
        await amap.setMapFitView(value.locationArr, false);
        this.currentNava = value;
      } else if (value.type === 2) {
        if (this.isShowWayDialog) {
          this.$message.warning('请先关闭当前航道操作栏');
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
        console.log(data);
        this.currentWay = [data];
        this.isShowHighlightWay = true;
      }
    },
    // 通过新增航道获取航道id
    async getAddWayIdent(ident = this.wayAddData.ident) {
      const { data, errorCode } = await wayApi.apiAddWay({ ident });
      if (+errorCode === 0) return data.id;
    },
    /**
     * 航道操作框新增 修改保存(网络请求)
     */
    async handleWaySave(val) {
      const navaList = val.fixes;
      const editaddway = this.$refs.editaddway;
      if (navaList.length >= 2) {
        let waterwayId;
        if (this.wayAddData.isClick) {
          const reg = /^[A-Z]\d{1,3}$/;
          // 新增航道的情况
          if (!reg.test(this.wayAddData.ident)) {
            this.$message.warning('航道名称首字母大写并跟随1-3个数字');
            return;
          }
          waterwayId = await this.getAddWayIdent();
          if (!waterwayId) return;
        } else {
          // 修改航道的情况
          waterwayId = val.id;
        }
        let arr = navaList.map((item, i) => {
          item.order = Number.parseInt(i) + 1;
          return {
            order: item.order,
            navaidId: item.navaidId
          };
        });
        const fixes = deepClone(arr);
        let data = { waterwayId, fixes };
        try {
          editaddway.loading = true;
          const { errorCode } = await wayApi.apiEditWay(data);
          editaddway.loading = false;
          if (+errorCode === 0) {
            this.$message.success('修改成功');
            data = null;
            this.handleWayCancel();
            this.getNavaList();
            this.getWaterwayList();
          }
        } catch (error) {
          editaddway.loading = false;
        }
      } else {
        this.$message.warning('一条航道必须拥有两个及两个以上的航标');
      }
    },
    /**
     * 点击航道操作框里的高亮中的航标
     */
    handleClickHighlightNava(value, index) {
      console.log(value, index);
      this.currentNava = value;
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
     * 关闭新增的Dialog
     */
    handleAddBoxClose() {
      if (this.toNavaInstance.length) {
        this.toNavaInstance = this.addPolyLine(this.mapInstance, [], this.toNavaInstance);
      }
      this.resetNavaAddData();
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
        console.log(this.currentWay);
      }
      // 当航道操作栏打开时点击航标后续操作
      if (this.isShowWayDialog) {
        this.waterwayAddNava(value, this.currentWay);
      }
      // 显示当前航标能到达的所有航标
      this.showLineClickNava(value);
    },
    /**
     * 点击航标插入到航道中
     */
    waterwayAddNava(currentNava, currentWayList) {
      const map = this.$refs.amap;
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
          // const currentNava =navaList[editaddway.cursorInsertIndex].navaid;
          // this.showNavigationLine(currentNava);
          return;
        }
        // 当在第一个航标前插入 直接在数组前面添加channelAddData.isClickFirstNava
        if (editaddway.cursorInsertIndex === -1) {
          navaList.unshift({ navaid: currentNava, navaidId: currentNava.id });
          // 显示点击航标半径和可导航范围
          // const currentNava =navaList[0].navaid;
          // this.showNavigationLine(currentNava);
        } else {
          // 插入该点的后面
          navaList.splice(editaddway.cursorInsertIndex + 1, 0, {
            navaid: currentNava,
            navaidId: currentNava.id
          });
          // 默认光标位置channelAddData.cursorInsertIndex++;
          editaddway.cursorInsertIndex = navaList.length - 1;
          // 显示航标半径,异步获取数据（实时添加航标返回内可导航的航标）
          // this.buttonClickData.clickNavaidInfo = navaList[navaList.length - 1].navaid;
          // const currentNava = navaList[navaList.length - 1].navaid;
          // this.showNavigationLine(currentNava);
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
            // map.ChannelRadiusCircle = currentNava;
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
            // map.ChannelRadiusCircle = currentNava;
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
            // map.ChannelRadiusCircle = currentNava;
          }
        }
        //实时显示航道长度航道的起点和终点
        this.showLineAndDistance();
      }

      //新增模式 手动规划  false,1
      else if (wayAddData.isClick && wayAddData.plan === 1) {
        console.log('新增模式下,手动规划');
        if (!navaList.length) {
          // 手动规划新增
          this.$set(navaList, navaList.length, {
            navaidId: currentNava.id,
            navaid: currentNava
          });
          //默认光标位置
          editaddway.cursorInsertIndex = 0;
          // 显示航标半径,异步获取数据（实时添加航标返回内可导航的航标）
          // this.showNavigationLine(currentNava);
          // this.buttonClickData.clickNavaidInfo = currentNava;
        } else {
          if (isFlag) {
            this.$message.warning('不能选择本航道中的航标插入');
            // const currentNava = navaList[navaList.length - 1].navaid;
            // this.showNavigationLine(currentNava);
            return;
          }
          // 手动规划新增
          this.$set(navaList, navaList.length, {
            navaidId: currentNava.id,
            navaid: currentNava
          });
          //默认光标位置
          editaddway.cursorInsertIndex = navaList.length - 1;
          // 显示航标半径,异步获取数据（实时添加航标返回内可导航的航标）
          // this.buttonClickData.clickNavaidInfo = currentNava;
          // this.showNavigationLine(currentNava);
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
    },
    /**
     * 添加航标请求
     */
    async handleAddSave() {
      let data = deepClone(this.navaAddData);
      const regIdent = /^[A-Z0-9]{5}$/;
      const regZoom = /^\d{1,2}$/;
      if (!regIdent.test(data.ident)) {
        this.$message.warning('标识为长度为5的大写字母和数字');
        return;
      }
      if (!regZoom.test(+data.zoomLevel)) {
        this.$message.warning('层级为3-20的数字');
        return;
      }
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await navaApi.apiAddNava(data);
      if (+errorCode === 0) {
        this.resetNavaAddData();
        data = null;
        this.$message.success('添加成功');
        this.getNavaList();
      }
    },
    // 自动航道规划网络请求展示到手动规划中修改
    async autoPlanRequest(StartNavaidId, EndNavaidId) {
      const editaddway = this.$refs.editaddway;
      let navaList = this.currentWayDialog.fixes;
      let startIndex = navaList.findIndex((item) => item.navaidId === StartNavaidId);
      let endIndex = navaList.findIndex((item) => item.navaidId === EndNavaidId);
      if (startIndex !== -1 && endIndex !== -1 && startIndex >= endIndex) {
        this.$message.warning('终点航标不能在起点航标之前');
        return;
      }
      try {
        editaddway.loading = true;
        const { data, errorCode } = await wayApi.apiGetWayBestShort({ StartNavaidId, EndNavaidId });
        editaddway.loading = false;
        if (+errorCode !== 0) return;
        // 设置航道中的航标数组
        let setFixArray = [];
        // 添加航标 处理数据
        for (let item of data) {
          item.navaid.locationObj = turnLngLatObj(item.navaid.location);
          // 设置手动规划、修改路线
          setFixArray.push({
            navaidId: item.id,
            navaid: item.navaid
          });
        }
        //变成修改模式
        // 替换的项数
        let index = Math.abs(endIndex - startIndex) + 1;
        !navaList.length
          ? navaList.push(...setFixArray) // 之前没航标
          : navaList.splice(startIndex, index, ...setFixArray); // 替换之前的航标(开始索引,项数)
        //默认插入的航标位置
        editaddway.cursorInsertIndex = navaList.length - 1;
        this.showLineAndDistance();
        editaddway.handleCancelAuto();
      } catch (error) {
        editaddway.loading = false;
      }
    }
  }
};
</script>

<style scoped lang="less">
.way-content {
  height: 100%;
  position: relative;
  .way-dialog {
    position: absolute;
    right: 0;
    z-index: 99;
    background: rgba(250, 250, 250, 0.9);
    padding: 10px;
  }
  .add-nava {
    position: absolute;
    left: 0;
    top: -1px;
    z-index: 99;
    .search-main-box {
      display: inline-block;
      margin-right: 10px;
    }
  }
  .edit-or-add-way {
    position: absolute;
  }
  .wayIdent {
    position: absolute;
    font-size: 20px;
    cursor: default;
    transform: translate(-50%, -150%);
    font-weight: bold;
    text-shadow: 1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff;
  }
  .nava-box {
    position: absolute;
    top: 26px;
    left: -11px;
    padding: 3px;
    text-align: center;
    border-radius: 3px;
    &::after {
      content: '';
      width: 0;
      height: 0;
      border-bottom: 8px solid #ffa35c;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      position: absolute;
      top: -8px;
      left: 15px;
    }
  }

  .light-nava {
    background: #ffa35c !important;
    z-index: 999 !important;
  }
}
</style>
