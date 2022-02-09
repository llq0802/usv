
// 工具函数
import { confirmMsg, deepClone, getTime } from '@/utils';
import { turnLngLat } from '@/utils/handleLngLat';
// 常量
import { BASE_CONSTANTS } from '@/config';
// api
import { convert } from 'api/geography';
import { apiGetShipById } from 'api/usv';

export default {
  data() {
    return {
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
}