<template>
  <div class="container">
    <h3 v-show="isEdit" class="title">{{ currentPlan && currentPlan.name }}</h3>
    <!--表格区域-->
    <div class="table-part" v-show="!isEdit">
      <!-- 搜索组件 -->
      <table-search
        :buttonName="'添加航线'"
        :placeholder="'请输入计划航线名称'"
        @keydownEnter="keywordSearch"
        @buttonSearch="keywordSearch"
        @handleDrag="addPlanDialog"
        @clear="keyword = ''"
      >
      </table-search>
      <!-- 表格 -->
      <my-table
        ref="planTable"
        :showHeader="false"
        :tableIndex="false"
        :highlightCurrentRow="true"
        :total="total"
        :tableLoading="tableLoading"
        :tableData="tableData"
        :tableColumn="tableColumn"
        :tableOption="tableOption"
        :paginationOptions="paginationOptions"
        @rowClick="handleRowClick"
        @buttonClick="clickButton"
        @pageChange="pageChange"
      ></my-table>
    </div>
    <!-- 编辑航线按钮区域 -->
    <div class="plan-edit">
      <input class="upload-track-tail" ref="uploadFile" type="file" @change="readFile"/>
      <el-button v-if="!realRouteTrack.length" type="warning" @click="uploadTrack">加载轨迹</el-button>
      <el-button v-if="realRouteTrack.length" type="danger" @click="clearTrack">清除轨迹</el-button>
      <el-button v-if="realRouteTrack.length" type="success" @click="downloadTrack">下载轨迹</el-button>
      <el-button v-if="isEdit && realRouteTrack.length" type="warning" @click="drawPointlogVisible=true">生成航线</el-button>
      <el-button v-if="!isTracking && !realRouteTrack.length" type="success" @click="trackinglogVisible=true">轨迹跟踪</el-button>
      <el-button v-if="isTracking" type="danger">停止轨迹跟踪</el-button>
      <el-button v-if="isEdit" type="warning" @click="reversePoint">反转航线方向</el-button>
      <el-button v-if="isEdit" type="primary" @click="updateRoute">确认上传</el-button>
      <el-button v-if="isEdit" type="danger" @click="cancelEdit">取消编辑</el-button>
    </div>
    <!-- 两种轨迹类型 -->
    <div class="track-type-area" v-show="realRouteTrack.length">
      <el-checkbox v-model="trackType.showReal">实际轨迹</el-checkbox>
      <el-checkbox v-model="trackType.showSmooth">平滑轨迹</el-checkbox>
    </div>
    <!--计划对话框-->
    <!-- 添加航线 -->
    <add-dialog :addlogVisible="addlogVisible"></add-dialog>
    <!-- 修改计划信息 -->
    <template v-if="editlogVisible">
      <edit-dialog
        :editlogVisible="editlogVisible"
        :editForm="currentPlan"
        @getEditForm="handleTableInfo"
      ></edit-dialog>
    </template>
    <!-- 轨迹跟踪 -->
    <template v-if="trackinglogVisible">
      <tracking-dialog :trackinglogVisible="trackinglogVisible" @getUsvId="trackingRoute"></tracking-dialog>
    </template>
    <!-- 执行计划 -->
    <template v-if="actionlogVisible">
      <action-dialog :actionlogVisible="actionlogVisible" :planId="currentPlan.id"> </action-dialog>
    </template>
    <!-- 生成计划点 -->
    <drawpoint-dialog 
      :drawPointlogVisible="drawPointlogVisible"
      :realRouteTrack="realRouteTrack"
      :smoothRouteTrack="smoothRouteTrack"
      @generatePoint="generatePoint">
    </drawpoint-dialog>

    <!-- 地图 -->
    <Map :isEdit="isEdit" :preventClickMap="preventClickMap" @getLngLat="getLngLat">
      <template #plan>
        <!-- 坐标点 -->
        <template v-if="pointList.length">
          <el-amap-marker
            v-for="point in pointList"
            :key="point.order"
            :position="point.position"
            :draggable="isEdit"
            :offset="offset"
            :events="pointEvents"
            :extData="point"
          >
            <div :class="point.requirePrecisionNavigation ? 'precise-marker' : 'marker'" @click="showPointInfo">
              {{ point.order }}
            </div>
            <!--删除计划点-->
            <div v-if="isEdit" class="del-marker" @click="deletePoint(point.order)"><i class="el-icon-close"></i></div>
            <!-- 气泡框 -->
            <div
              class="point-bubble"
              v-if="currentOrder === point.order"
              @mouseenter="preventClickMap = true"
              @mouseleave="preventClickMap = false"
              @mousemove="preventEvent"
              @mousedown="preventEvent"
            >
              <div class="long-demo"></div>
              <div class="close-Btn" @click="currentOrder = null; preventClickMap = false;">×</div>
              <div v-if="point.order < 3"><span class="span-text">离港航点</span></div>
              <div v-else-if="point.order > pointList.length - 2">
                <span class="span-text">进港航点</span>
              </div>
              <div v-else>
                <span class="precise-point">精确导航航点
                  <el-checkbox v-model="point.requirePrecisionNavigation" :disabled="!isEdit"></el-checkbox>
                </span>
              </div>
              <div>
                <span class="span-text">坐标(GCJ-02): </span>
                <span v-if="!isEditCoordGCJ" class="span-coord" @click="switchInput('gcj02')">
                  {{ point.gcj02 }}
                </span>
                <el-input
                  v-else
                  ref="inputGCJ"
                  v-model="point.gcj02"
                  @blur="closeInput"
                  @change="changeCoord($event, 'gcj02')"
                >
                </el-input>
              </div>
              <div>
                <span class="span-text">坐标(WGS-84): </span>
                <span v-if="!isEditCoordWGS" class="span-coord" @click="switchInput('wgs84')">
                  {{ point.wgs84 }}
                </span>
                <el-input
                  v-else
                  ref="inputWGS"
                  v-model="point.wgs84"
                  @blur="closeInput"
                  @change="changeCoord($event, 'wgs84')"
                >
                </el-input>
              </div>
            </div>
          </el-amap-marker>
        </template>
        <!-- 折线 -->
        <template>
          <!-- 计划点航线 -->
          <el-amap-polyline
            geodesic="true"
            stype="dashed"
            strokeColor="#26bef0"
            strokeStyle="dashed"
            strokeWeight="1"
            editable="true"
            zIndex="100"
            :path="path"
          ></el-amap-polyline>
          <!-- 精确导航区间航线 -->
          <template v-if="precisePath.length">
            <el-amap-polyline
              geodesic="true"
              editable="true"
              strokeColor="green"
              strokeStyle="solid"
              strokeWeight="2"
              v-for="(path, index) in precisePath"
              :key="index + '$'"
              :path="path"
            ></el-amap-polyline>
          </template>
          <!-- 实际轨迹线 -->
          <el-amap-polyline
            v-if="trackType.showReal"
            geodesic="true"
            strokeColor="#777"
            strokeStyle="solid"
            strokeWeight="1"
            :path="realRouteTrack"
          ></el-amap-polyline>
          <!-- 平滑轨迹线 -->
          <el-amap-polyline
            v-if="trackType.showSmooth"
            geodesic="true"
            strokeColor="#0b7b54"
            strokeStyle="solid"
            strokeWeight="2"
            :path="smoothRouteTrack"
          ></el-amap-polyline>
        </template>
      </template>
    </Map>
  </div>
</template>

<script>
// 地图组件
import Map from 'components/amap/Amap';
// 表格
import MyTable from 'components/common/table/Mytable';
import TableSearch from 'components/common/table-search/TableSearch';
// dialog对话框
import AddDialog from './components/AddDialog.vue';
import EditDialog from './components/EditDialog.vue';
import ActionDialog from './components/ActionDialog.vue';
import DrawpointDialog from './components/DrawPointDialog.vue';
import TrackingDialog from './components/TrackingDialog.vue';
// 工具函数
import { confirmMsg, deepClone, throttle, debounce, getTime } from '@/utils';
import { turnLngLat, turnLngLatObj } from '@/utils/handleLngLat';
// 常量
import { PAGE_SIZE, BASE_CONSTANTS } from '@/config';
// api
import { apiGetPlan, apiPostPlanInfo, apiPostDeletePlan, apiPostUpdatePlan } from 'api/plan';
import { convert } from 'api/geography';
import { apiGetShipById } from 'api/usv';

export default {
  components: {
    Map, MyTable, TableSearch, AddDialog, EditDialog, ActionDialog, DrawpointDialog, TrackingDialog,
  },
  data () {
    return {
      // 表格数据
      tableData: [],
      total: 0,
      tableLoading: false,
      // 表头配置
      tableColumn: Object.freeze([
        { prop: 'id', label: 'id', width: 60 },
        { prop: 'name', label: 'name', width: 180 },
      ]),
      // 操作配置
      tableOption: Object.freeze({
        label: '操作',
        options: [
          {
            label: '执行计划',
            type: 'success',
            size: 'mini',
            methods: this.executePlanConfig
          },
          {
            label: '修改信息',
            type: 'warning',
            size: 'mini',
            methods: this.changePlanInfo
          },
          {
            label: '编辑航线',
            type: 'primary',
            size: 'mini',
            methods: this.editPlanRoute
          },
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: this.deletePlan
          }
        ]
      }),
      // 分页配置
      paginationOptions: {
        page: PAGE_SIZE.page,
        size: PAGE_SIZE.size,
        isSmall: true
      },
      keyword: '',
      // 是否正在编辑
      isEdit: false,
      // 当前计划
      currentPlan: null,
      // 原始计划数据
      originPlanData: null,

      /********************* 计划dialog *********************/
      addlogVisible: false,
      editlogVisible: false,
      actionlogVisible: false,
      drawPointlogVisible: false,
      trackinglogVisible: false,

      /********************* 地图相关 *********************/
      pointEvents: {
        // 鼠标拖动修改对应的经纬度
        dragging: e => {
          // 获取覆盖物的附加数据
          const orig = deepClone(e.target.getExtData());
          // 当拖动的点的信息层打开状态时提高当前节点层级，提升性能
          if (orig.order === this.currentOrder || e.target.getContentDom().parentNode.style.zIndex < 101) {
            // 恢复父节点层级
            let divDom = e.target.getContentDom().offsetParent.parentNode;
            for (let domNode of divDom.children) {
              domNode.style.zIndex = 100;
            }
            e.target.getContentDom().parentNode.style.zIndex = 101;
          };
          // 将坐标改为拖动后的坐标
          orig.location = `${e.lnglat.lat},${e.lnglat.lng}`;
          orig.position = [e.lnglat.lng, e.lnglat.lat];
          // 用新的数据覆盖旧的，触发重新渲染
          this.pointList.splice(orig.order - 1, 1, orig);
        },
        // 点击可以查看经纬度
        click: e => {
          // 恢复父节点层级
          let divDom = e.target.getContentDom().offsetParent.parentNode;
          for (let domNode of divDom.children) {
            domNode.style.zIndex = 100;
          }
          // 提高当前节点层级
          e.target.getContentDom().parentNode.style.zIndex = 101;
        },
      },
      // marker偏移量
      offset: [-16, -31],
      // 坐标点
      pointList: [],
      // 计划航线
      path: [],
      precisePath: [],
      // 当前计划点order
      currentOrder: null,
      // 防止点击地图
      preventClickMap: false,
      // 是否编辑坐标
      isEditCoordGCJ: false,
      isEditCoordWGS: false,
      // 轨迹显示类型
      trackType: {
        showReal: true,
        showSmooth: true
      },
      // 实际航线
      realRouteTrack: [],
      // 平滑航线
      smoothRouteTrack: [],
      // 轨迹跟踪
      isTracking: false,
    }
  },
  methods: {
    // 获取计划列表
    async getPlanList () {
      this.tableLoading = true;
      const { data: res } = await apiGetPlan({
        page: this.paginationOptions.page,
        size: 10,
        'Condition.Keyword': this.keyword
      });
      this.tableLoading = false;
      this.tableData = res.result;
      this.total = res.total;
      // 默认选中第一行数据
      if (this.total > 0) {
        this.handleRowClick(this.tableData[0]);
      }
    },
    // 关键字搜索
    keywordSearch (keyword) {
      this.keyword = keyword;
      this.getPlanList();
    },
    // 翻页
    pageChange (page) {
      this.paginationOptions.page = page;
      this.getPlanList();
    },
    // 添加航线弹框信息 
    addPlanDialog () {
      this.addlogVisible = true;
    },
    // 修改表格信息
    async handleTableInfo (form) {
      const res = await apiPostPlanInfo(form);
      if (!res.errorCode) {
        this.$message.success('计划信息修改成功！');
        this.editlogVisible = false;
        this.getPlanList();
      } else {
        this.$message.warning(res.message);
      }
    },
    // 点击行
    handleRowClick (row) {
      this.currentPlan = row;
      this.pointList = row.fixes;
      if (this.pointList.length) {
        this.pointList.sort((a, b) => a.order - b.order);
        for (let point of this.pointList) {
          if (typeof point.location == 'string') {
            point.position = turnLngLat(point.location);
          } else {
            point.position = [point.longitude, point.latitude];
          }
          this.$set(point, 'gcj02', '');
          this.$set(point, 'wgs84', '');
        }
      }
      // 设置高亮
      this.$refs.planTable.$refs.table.setCurrentRow(row);
    },
    // 点击操作按钮
    clickButton (option) {
      // option.event.stopPropagation();
      option.methods.call(this, option.row);
    },
    // 修改计划信息
    changePlanInfo () {
      this.editlogVisible = true;
    },
    // 执行计划
    executePlanConfig () {
      this.actionlogVisible = true;
    },
    // 编辑航线
    editPlanRoute () {
      this.isEdit = true;
      this.currentOrder = null;
    },
    // 删除计划
    async deletePlan (row) {
      const cf = await confirmMsg(this, `即将删除${row.name}`);
      if (cf === 'cancel') return;
      const res = await apiPostDeletePlan(row.id);
      if (!res.errorCode) {
        this.$message.success(`${row.name} 删除成功！`);
        // this.tableData.filter(v => v.id != row.id);
        // 用数组的splice方法促发重新渲染
        let i = this.tableData.findIndex(v => v.id === row.id);
        this.tableData.splice(i, 1);
        this.total--;
      }
    },
    // 反转航线方向
    reversePoint () {
      this.currentOrder = null;
      this.pointList.reverse();
      for (let i in this.pointList) {
        this.$set(this.pointList[i], 'order', +i + 1);
      }
    },
    // 更新计划航线
    async updateRoute () {
      if (this.pointList.length < 3) {
        this.$alert('计划航点应不少于 3 个！');
        return;
      }
      let newPlan = {};
      newPlan.fixes = deepClone(this.pointList);
      for (let point of newPlan.fixes) {
        newPlan.telemetryPlanId = point.telemetryPlanId;
        this.$delete(point, 'id');
        this.$delete(point, 'gcj02');
        this.$delete(point, 'wgs84');
        this.$delete(point, 'position');
      };
      console.log(newPlan);
      const res = await apiPostUpdatePlan(newPlan);
      if (!res.errorCode) {
        this.$message.success('更新成功！');
        this.isEdit = false;
      }
    },
    // 取消编辑
    async cancelEdit () {
      this.isEdit = false;
      this.currentOrder = null;
      this.getPlanList();
    },
    
    /********************* 地图相关 *********************/
    // 上传轨迹
    uploadTrack() {
      this.$refs.uploadFile.click();
    },
    // 读取文件
    readFile() {
      let file = this.$refs.uploadFile.files[0];
      if (!file) return;
      if (file.name.substr(file.name.length - 3, 3) != 'txt') {
        this.$message.warning('文件类型识别出错!');
        return;
      }
      this.realRouteTrack = [];
      this.smoothRouteTrack = [];
      let reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      let self = this;
      reader.onload = function() {
        let tempArray = reader.result.split('\n').slice(1, reader.result.split('\n').length - 1);
        let index = tempArray.findIndex(val => val == '平滑轨迹');
        let strOne = tempArray.slice(0, index);
        let strTwo = tempArray.slice(index + 1);
        // 实际轨迹
        strOne.forEach(point => {
          let arr = point.split(',');
          if (arr.length) {
            self.realRouteTrack.push([+arr[1], +arr[0]]);
          }
        })
        // 平滑轨迹
        strTwo.forEach(point => {
          let arr = point.split(',');
          if (arr.length) {
            self.smoothRouteTrack.push([+arr[1], +arr[0]]);
          }
        })
        
      }
    },
    // 下载轨迹
    async downloadTrack() {
      let arr = [];
      let simpleArr = [];
      let str = '';
      let realLine = deepClone(this.realRouteTrack);
      let smoothLine = deepClone(this.smoothRouteTrack);
      let time = getTime();
      // 实际轨迹
      for (let item of realLine) {
        if (Object.prototype.toString.call(item) === '[object Array]') {
          arr.push(item.reverse().toString());
        } else {
          let _item = item.Q + ',' + item.R;
          arr.push(_item);
        }
      }
      arr.unshift('实际轨迹');
      // 平滑轨迹
      for (let item of smoothLine) {
        if (Object.prototype.toString.call(item) === '[object Array]') {
          simpleArr.push(item.reverse().toString());
        } else {
          let _item = item.Q + ',' + item.R;
          simpleArr.push(_item);
        }
      }
      // simpleArr = await this.simpleTrack(simpleArr);
      // simpleArr.unshift('简化轨迹');
      simpleArr.unshift('平滑轨迹');
      for (let item of simpleArr) {
        arr.push(item.toString());
      }
      for (let i in arr) {
        str += arr[i];
        str += '\n';
      }
      // console.log(str);
      this.$prompt('请输入文件名：', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: '轨迹坐标' + '-' + time,
        inputErrorMessage: '输入不能为空',
        inputValidator: value => {
          if (!value) {
            return '输入不能为空';
          }
        },
      })
        .then(({ value }) => {
          const blob = new Blob([str]);
          let fileURL = window.webkitURL.createObjectURL(blob);
          // 创建一个虚拟标签元素
          const fileDownload = document.createElement('a');
          fileDownload.download = value + '.txt';
          fileDownload.href = fileURL;
          fileDownload.click();
        })
        .catch(err => err);
    },
    // 清除轨迹
    clearTrack() {
      this.realRouteTrack = [];
      this.smoothRouteTrack = [];
      this.$refs.uploadFile.files = [];
    },
    // 轨迹跟踪，绘制轨迹
    async trackingRoute(usvId) {
      const res = await apiGetShipById(usvId);
      if (res.errorCode) return;
      let { data: { runtimeInfo: { state } } } = res;
      if (state === 0 || state === 1) {
        this.$message.warning(`当前船只处于${BASE_CONSTANTS.usvState(state)}状态,无法绘制轨迹`);
        return;
      }

    },
    // 生成计划点
    generatePoint(path) {
      this.pointList = [];
      for(let p of path) {
        let point = {
          location: `${p[1]},${p[0]}`,
          order: this.pointList.length + 1,
          telemetryPlanId: this.currentPlan.id,
          position: p,
          gcj02: '',
          wgs84: '',
          requirePrecisionNavigation: false
        };
        this.pointList.push(point);
      }
    },
    // 添加点，获取经纬度
    getLngLat (data) {
      let point = {
        location: data.location,
        order: this.pointList.length + 1,
        position: data.pointArray,
        telemetryPlanId: this.currentPlan.id,
        gcj02: '',
        wgs84: '',
        requirePrecisionNavigation: false
      };
      this.$set(this.pointList, this.pointList.length, point);
    },
    // 删除计划点
    async deletePoint(order) {
      const cf = await confirmMsg(this, `删除${order}计划点`);
      if (cf === 'cancel') return;
      this.pointList.splice(order - 1, 1);
      for (let i in this.pointList) {
        this.$set(this.pointList[i], 'order', +i + 1);
      }
    },
    // 转换wsg84和gcj02坐标
    async convertCoord (coord, srid) {
      const res = await convert({ coord, srid });
      if (!res.errorCode) {
        let coordArr = res.data.split(',');
        return parseFloat(coordArr[0]).toFixed(7) + ',' + parseFloat(coordArr[1]).toFixed(7);
      }
    },
    // 处理精确点航线
    handlePrecisePath(precisePointList) {
      let precisePathALL = [];
      // 精确点之间的非精确点数量
      let betweenPointNum = 0;
      // 判断精确点奇偶数量
      if (precisePointList.length % 2 == 0) {
        for (let i = 0; i < precisePointList.length; i += 2) {
          precisePathALL.push(precisePointList.slice(i, i + 2));
        }
      } else {
        for (let i = 0; i < precisePointList.length - 1; i += 2) {
          precisePathALL.push(precisePointList.slice(i, i + 2));
        }
      }
      // 插入中间计划点
      for(let val of precisePathALL) {
        betweenPointNum = val[1].order - val[0].order - 1;
        if (betweenPointNum > 0) {
          // 如果两精确点之间存在非精确点，添加进去
          for (betweenPointNum; betweenPointNum > 0; betweenPointNum--) {
            for (let needAddPoint of this.pointList) {
              if (needAddPoint.order == val[0].order + betweenPointNum) {
                val.splice(1, 0, needAddPoint);
              }
            }
          }
        }
      }
      // 提取坐标
      for(let val of precisePathALL) {
        let tempArr = [];
        for (let i = 0; i < val.length; i++) {
          tempArr.push(val[i].position);
        }
        this.precisePath.push(tempArr);
      }
    },
    // 展示计划点信息
    async showPointInfo (e) {
      this.currentOrder = parseInt(e.target.innerHTML);
      let point = this.pointList[this.currentOrder - 1];
      // 获取wgs84和gcj02坐标
      point.gcj02 = await this.convertCoord(point.location, 'gcj02');
      point.wgs84 = await this.convertCoord(point.location, 'wgs84');
    },
    // 阻止冒泡和默认事件
    preventEvent (e) {
      e.stopPropagation();
    },
    // 改变坐标值更新点
    async changeCoord (coord, srid) {
      if (coord.indexOf(',') == -1) {
        this.$message.warning('无法识别坐标 ' + coord);
        return;
      }
      const location = await this.convertCoord(coord, srid);
      this.$set(this.pointList[this.currentOrder - 1], 'location', location);
      this.$set(this.pointList[this.currentOrder - 1], 'position', turnLngLat(location));
      this.isEditCoordGCJ = false;
      this.isEditCoordWGS = false;
    },
    // 切换输入框
    switchInput (type) {
      if (!this.isEdit) return;
      this.isEditCoordGCJ = type === 'gcj02';
      this.isEditCoordWGS = !this.isEditCoordGCJ;
      this.$nextTick(() => {
        let input;
        if (this.isEditCoordGCJ) {
          input = this.$refs.inputGCJ[0].$el.children[0];
        } else {
          input = this.$refs.inputWGS[0].$el.children[0];
        };
        input.focus();
        input.onmousemove = this.preventEvent;
        input.onkeydown = this.preventEvent;
        input.onclick = this.preventEvent;
      });
    },
    // 关闭坐标输入框
    closeInput () {
      if (this.isEditCoordWGS || this.isEditCoordGCJ) {
        this.isEditCoordGCJ = false;
        this.isEditCoordWGS = false;
      }
    },

  },
  watch: {
    // 计划点改变时更新计划航线
    pointList: {
      handler() {
        this.path = [];
        this.precisePath = [];
        // 定义所有精确点的数组
        let precisePointList = [];
        for(let point of this.pointList) {
          this.path.push(point.position);
          // 集合精确点
          if (point.requirePrecisionNavigation) {
            precisePointList.push(point);
          }
          // 处理精确点航线
          if (precisePointList.length) {
            this.handlePrecisePath(precisePointList);
          }
        }
      },
      deep: true
    },
    // 切换行
    'currentPlan.id' () {
      // 关闭计划点信息
      this.currentOrder = null;
    },
    // 切换点
    currentOrder () {
      // 关闭gcj02 wgs84输入框
      this.isEditCoordGCJ = false;
      this.isEditCoordWGS = false;
    },
  },
  created () {
    this.getPlanList();
  }
}
</script>

<style lang="less" scoped>
@elColor: #409eff;
@markerPath: '../../assets/img/map/marker.png';
@preciseMarkerPath: '../../assets/img/map/precise-marker.png';
@markerSize: 32px;

.container {
  padding: 0 !important;
  position: relative;
  width: 100%;
  height: 100%;
  .title {
    position: absolute;
    top: 0;
    left: 8px;
    z-index: 1;
    color: #f5f0f0;
    text-shadow: 1px 1px 0 #333, -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333;
  }
}

/***************表格区域***************/
.table-part {
  position: absolute;
  top: 0;
  left: 0;
  width: 500px;
  overflow: hidden;
  z-index: 1;
  background-color: #f0f0f0;
  .el-header {
    padding: 0;
    height: 30px !important;
    text-align: center;
  }
  /deep/ .el-row {
    width: 900px;
  }
  /deep/ .el-table__body tr.current-row > td.el-table__cell {
    background-color: #add2ff;
    color: #222;
  }
  /deep/ .el-table--small .el-table__cell {
    padding: 3px 0;
    user-select: none;
  }
  /deep/ .el-button--mini,
  .el-button--mini.is-round {
    padding: 5px 3px;
  }
  /deep/ .el-pagination {
    margin-top: 0 !important;
    text-align: center;
  }
  /deep/ .el-pagination__sizes {
    display: none;
  }
}

/***************编辑按钮区域***************/
.plan-edit {
  position: absolute;
  bottom: 8px;
  left: 90px;
  z-index: 1;
  .upload-track-tail {
    width: 0;
    height: 0;
  }
}
.track-type-area {
  position: absolute;
  bottom: 50px;
  left: 10px;
  z-index: 1;
  .el-checkbox {
    font-size: 20px;
    margin-right: 20px;
    /deep/ .el-checkbox__label {
      font-size: 15px;
    }
  }
}
/*************** 地图相关 ***************/
/* 坐标点 */
.marker,
.precise-marker {
  position: relative;
  width: @markerSize;
  height: @markerSize;
  font-size: 12px;
  line-height: 24px;
  color: #fafafa;
  text-align: center;
  background: url(@markerPath);
}
.precise-marker {
  background: url(@preciseMarkerPath);
}
.del-marker {
  margin-top: -@markerSize;
  margin-left: 26px;
  font-size: 14px;
  border-radius: 50%;
  background: rgba(175, 175, 175, 0.5);
  i {
    color: red;
    &:hover {
      transition: all 0.2s;
      transform: rotate(180deg);
    }
  }
  &:hover {
    background: rgba(100, 100, 100, 0.3);
  }
}
.point-bubble {
  position: absolute;
  padding: 10px;
  top: -120px;
  left: -121px;
  height: 90px;
  width: 265px;
  font-size: 14px;
  line-height: 18px;
  text-align: left;
  border-radius: 15px;
  cursor: default;
  background: rgba(80, 114, 209, 0.397);
  z-index: 99;
  .long-demo {
    position: absolute;
    top: 100%;
    left: 45%;
    width: 0px;
    height: 0px;
    border-width: 10px;
    border-style: solid;
    border-color: rgba(80, 114, 209, 0.397) transparent transparent transparent;
    line-height: 0;
    font-size: 0;
  }
  .close-Btn {
    float: right;
    margin-top: -5px;
    font-size: 28px;
    color: #ff6700;
    &:hover {
      color: red;
      cursor: pointer;
    }
  }
  span {
    color: rgb(10, 78, 124);
  }
  .span-text,
  .precise-point {
    display: inline-block;
    width: 95px;
    height: 30px;
    color: #000;
  }
  .precise-point {
    width: 120px;
  }
  .span-coord {
    display: inline-block;
    &:hover {
      cursor: pointer;
    }
  }
  /deep/ .el-input {
    width: 170px;
    font-size: 14px;
  }
  /deep/ .el-input__inner {
    padding: 0 !important;
  }
}
</style>