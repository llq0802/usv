export default {
  methods: {
    /**
     * 计算两点的距离
     */
    getDistance(start, end) {
      let startPoint, endPoint;
      if (end.locationObj) {
        (startPoint = [start.locationObj.longitude, start.locationObj.latitude]),
          (endPoint = [end.locationObj.longitude, end.locationObj.latitude]);
      } else {
        (startPoint = [start.locationObj.longitude, start.locationObj.latitude]),
          (endPoint = [end.longitude, end.latitude]);
      }
      return AMap.GeometryUtil.distance(startPoint, endPoint);
    },

    /**
     * 点击航标根据获取附近可导航航标
     */
    getNavaToByRadius(navaid) {
      const toNavaList = [];
      const navaList = [];
      this.navaList.forEach((item) => {
        const flag = navaid.radius >= this.getDistance(item, navaid);
        if (flag && navaid.id !== item.id) {
          navaList.push(item);
          if (navaid.locationObj) {
            toNavaList.push([
              [navaid.locationObj.longitude, navaid.locationObj.latitude],
              [item.locationObj.longitude, item.locationObj.latitude]
            ]);
          } else {
            toNavaList.push([
              [navaid.longitude, navaid.latitude],
              [item.locationObj.longitude, item.locationObj.latitude]
            ]);
          }
        }
      });
      return { toNavaList, navaList };
    },
    /**
     * 封装航道操作,操作航标时使当前航道拆分成多段航道线段函数
     */
    isSplitWaterway() {
      const navaList = this.currentWayDialog.fixes;
      // 存储的航道数组
      let pathArr = [];
      // 存储的航道每一段线段
      let lineArr = [];
      for (let i = 0; i < navaList.length; i++) {
        // 第一次线段为0时直接加入第一个点
        if (lineArr.length === 0) {
          lineArr.push([
            navaList[i].navaid.locationObj.longitude,
            navaList[i].navaid.locationObj.latitude
          ]);
        } else {
          if (
            navaList[i - 1].navaid.radius <
            this.getDistance(navaList[i - 1].navaid, navaList[i].navaid)
          ) {
            pathArr.push(lineArr);
            // 清空数组,重新开始压入
            lineArr = [];
            // 从当前断开的端点重新压入线段
            i--;
          } else {
            // 两点可以连接 直接将当前点压入数组
            lineArr.push([
              navaList[i].navaid.locationObj.longitude,
              navaList[i].navaid.locationObj.latitude
            ]);
          }
        }
      }
      // 遍历完成后,检查lineArr压入pathArr
      if (lineArr.length) pathArr.push(lineArr);
      return pathArr;
    },
    /**
     * 计算线段拆分后最新的长度
     */
    getDistanceOfLine(pathArr) {
      const temp = [];
      if (pathArr.length) {
        pathArr.map((item) => temp.push(AMap.GeometryUtil.distanceOfLine(item)));
        return temp.reduce((t, l) => t + l);
      } else {
        return 0;
      }
    },
    /**
     * 实时渲染点击航标根据获取附近可导航航标组成的航道
     */
    showLineClickNava(value) {
      let { toNavaList } = this.getNavaToByRadius(value);
      this.toNavaInstance = this.addPolyLine(this.mapInstance, toNavaList, this.toNavaInstance, {
        strokeColor: '#006400',
        strokeWeight: 4,
        zIndex: 1000
      });
    },

    /**
     * 实时渲染修改航道操作栏中的航标后组成的航道
     */
    showLineAndDistance() {
      let pathArr = this.isSplitWaterway();
      this.lineInstance = this.addPolyLine(this.mapInstance, pathArr, this.lineInstance);
      this.currentWayDialog.totalDistance = this.getDistanceOfLine(pathArr);
    },
    /**
     * 动态在地图上添加航道线段
     */
    addPolyLine(amap, pathArrs, polylineInstance, options = {}) {
      options = { strokeColor: '000000', strokeWeight: 8, zIndex: 900, ...options };
      // 循环清空之前的地图显示的Polyline
      if (polylineInstance.length) {
        for (const removePolyline of polylineInstance) amap.remove(removePolyline);
      }
      // 清空折线实例
      polylineInstance = [];
      if (pathArrs.length) {
        for (let item of pathArrs) {
          const polyline = new AMap.Polyline({
            path: item, // 设置线覆盖物路径
            strokeColor: options.strokeColor, // 线颜色
            strokeWeight: options.strokeWeight, // 线宽
            zIndex: options.zIndex, // 线宽
            strokeOpacity: 1,
            showDir: true, //方向标识
            dirColor: '#fff', //方向标识颜色
            lineJoin: 'round'
          });
          polylineInstance.push(polyline);
        }
        // 在地图中循环添加Polyline实例线段
        for (const item of polylineInstance) amap.add(item);
      }
      // 返回出线段实例(数组)
      return polylineInstance;
    }
  }
};
