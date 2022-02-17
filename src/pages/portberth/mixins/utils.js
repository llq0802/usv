import { throttle } from '@/utils';
export default {
  methods: {
    //节流:港口在文档中添加ctrl按下事件
    keydown: throttle(function ($event) {
      let e = $event || window.$event || arguments.callee.caller.arguments[0];
      if (e && e.keyCode === 17) {
        this.isCtrl = !this.isCtrl;
      }
    }),
    /**
     * 判断一个点到点的数组中最短距离
     * pathArr新增时的path路径,pointsArr遍历的每一个点
     */
    getMinPoint(pathArr, pointsArr) {
      let endPoint = pathArr.length === 1 ? pathArr[0] : pathArr[pathArr.length - 1];
      return pointsArr.reduce((p, c) => {
        let pre = AMap.GeometryUtil.distance(endPoint, [
          p.locationObj.longitude,
          p.locationObj.latitude
        ]);
        let cur = AMap.GeometryUtil.distance(endPoint, [
          c.locationObj.longitude,
          c.locationObj.latitude
        ]);
        return pre > cur ? c : p;
      });
    },
    /**
     * 封装判断一个点到范围的最短距离(范围中心的距离或者范围线的距离)
     */
    getDistanceToLine(pointArr, lineArr) {
      let endPoint = pointArr[pointArr.length - 1];
      const minPoint = lineArr
        .map((item) => {
          let startPoint = [item.locationObj.longitude, item.locationObj.latitude];
          item.minDis = AMap.GeometryUtil.isPointInRing(endPoint, item.boundList) //点是否在范围内
            ? AMap.GeometryUtil.distance(endPoint, startPoint) //点到中心点的距离
            : AMap.GeometryUtil.distanceToLine(endPoint, item.boundList); //点到线的距离
          return item;
        })
        .reduce((p, c) => (p.minDis < c.minDis ? p : c));
      return minPoint;
      // return lineArr.find((item) => item.id === minPoint.id);
    },
    /**
     * 点击地图新增程序线段绘制
     */
    addProcedureClick(lng, lat) {
      const addProcedureData = this.addProcedureData;
      addProcedureData.path.push([lng, lat]);
      let num = addProcedureData.path.length > 2 ? 2 : 1;
      //计算线段中的展示的点
      addProcedureData.centerPoint = addProcedureData.path[addProcedureData.path.length - num];
      // 定义最近开始端点
      let startPoint;
      // //计算最近开始端点只能第一次 否则会覆盖
      if (addProcedureData.path.length === 1) {
        startPoint = this.getMinPoint(addProcedureData.path, this.pointList);
        this.$set(addProcedureData, 'startPoint', startPoint);
      }
      // 每点击一次就更新最近结束端点
      let endPoint = this.getMinPoint(addProcedureData.path, this.pointList);
      this.$set(addProcedureData, 'endPoint', endPoint);
    },
    /**
     * 点击地图新增过渡路径线段绘制
     */
    addTransitionClick(lng, lat) {
      const addTransitionData = this.addTransitionData;
      addTransitionData.path.push([lng, lat]);
      let num = addTransitionData.path.length > 2 ? 2 : 1;
      //计算线段中的展示的点
      addTransitionData.centerPoint = addTransitionData.path[addTransitionData.path.length - num];
      //算出开始点只计算一次
      if (addTransitionData.path.length === 1) {
        let startNavaPoint, startBerthPoint, startPoint;
        if (this.navaList.length)
          startNavaPoint = this.getMinPoint(addTransitionData.path, this.navaList);
        //点到泊位中心点的距离
        // startBerthPoint = this.getMinPoint(addTransitionData.path, this.berthList);
        //点到泊位线的距离
        startBerthPoint = this.getDistanceToLine(addTransitionData.path, this.berthList);
        // 调用计算函数
        startPoint = this.getMinPoint(addTransitionData.path, this.pointList);
        // 比较在 泊位点 航标点 端点当中距离最短的点
        let startTempArr = this.navaList.length
          ? [startNavaPoint, startBerthPoint, startPoint]
          : [startBerthPoint, startPoint];
        let startMinPoint = this.getMinPoint(addTransitionData.path, startTempArr);
        //根据点自动计算类型,方向  direction:1进港 2离港  type:1泊位 2航标
        if (this.navaList.some((item) => item.id === startMinPoint.id)) {
          addTransitionData.direction = 1; //1进港-航道
          addTransitionData.type = 2;
          console.log('获得最近航标');
        } else if (this.berthList.some((item) => item.id === startMinPoint.id)) {
          // 通过最短的点找到这个点是否在泊位中
          addTransitionData.direction = 2; //2离港-泊位
          addTransitionData.type = 1;
          console.log('获得最近泊位');
        }
        //存储最近的开始点
        this.$set(addTransitionData, 'startMinPoint', startMinPoint);
      }
      //开始计算结束点
      let endNavaPoint;
      if (this.navaList.length) {
        endNavaPoint = this.getMinPoint(addTransitionData.path, this.navaList);
      }
      //点到泊位中心点的距离
      // let endBerthPoint = this.getMinPoint(addTransitionData.path, this.berthList);
      //点到泊位范围的距离
      let endBerthPoint = this.getDistanceToLine(addTransitionData.path, this.berthList);
      console.log(endBerthPoint);
      let endPoint = this.getMinPoint(addTransitionData.path, this.pointList);
      // 比较在 泊位点 航标点 端点当中距离最短的结束点
      let endTempArr = this.navaList.length
        ? [endNavaPoint, endBerthPoint, endPoint]
        : [endBerthPoint, endPoint];
      let endMinPoint = this.getMinPoint(addTransitionData.path, endTempArr);
      this.$set(addTransitionData, 'endMinPoint', endMinPoint); //存储最近的结束点

      //根据开始点和结束点自动计算类型,方向 // direction:1进港 2离港  type:1泊位 2航标
      if (
        this.pointList.some((item) => item.id === endMinPoint.id) &&
        addTransitionData.path.length !== 1 // 通过结束最短的点找到这个点是否在端点中
      ) {
        if (addTransitionData.type === 2) {
          addTransitionData.type = 2;
          addTransitionData.direction = 1;
        } else {
          addTransitionData.type = 1;
          addTransitionData.direction = 2;
        }
      } else if (
        this.navaList.some((item) => item.id === endMinPoint.id) &&
        addTransitionData.path.length !== 1 // 通过结束最短的点找到这个点是否在航标中
      ) {
        addTransitionData.type = 2;
        addTransitionData.direction = 2;
      } else if (
        this.berthList.some((item) => item.id === endMinPoint.id) &&
        addTransitionData.path.length !== 1 // 通过结束最短的点找到这个点是否在泊位中
      ) {
        addTransitionData.type = 1;
        addTransitionData.direction = 1;
      }
      console.log(addTransitionData);
    }
  }
};
