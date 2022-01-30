export default {
  methods: {
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
      lineArr = deepClone(lineArr);
      let endPoint = pointArr[pointArr.length - 1];
      let minPoint = lineArr
        .map((item) => {
          let startPoint = [item.locationObj.longitude, item.locationObj.latitude];
          item.minDis = AMap.GeometryUtil.isPointInRing(endPoint, item.boundList) //点是否在范围内
            ? AMap.GeometryUtil.distance(endPoint, startPoint) //点到中心点的距离
            : AMap.GeometryUtil.distanceToLine(endPoint, item.boundList); //点到线的距离
          return item;
        })
        .reduce((p, c) => (p.minDis < c.minDis ? p : c));
      return lineArr.find((item) => item.id === minPoint.id);
    }
  }
};
