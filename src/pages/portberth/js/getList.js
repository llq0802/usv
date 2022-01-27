import * as portApi from 'api/port';
import { apiGetNavaByQuery } from 'api/nava';
import { apiGetWayByQuery } from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { BASE_CONSTANTS } from '@/config';

export default {
  data() {
    return {
      BASE_CONSTANTS: Object.freeze(BASE_CONSTANTS)
    };
  },
  methods: {
    /**
     * 获取航道信息
     */
    async getWaterwayList() {
      const { data, errorCode } = await apiGetWayByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.waterwayList = data.result;
        for (let item of data.result) {
          let en = item.ident.charAt(0).toUpperCase(); // 根据标识开头字母设置不同的颜色
          item.color = BASE_CONSTANTS.colorArray(en);
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
          this.$set(item, 'area', +item.area.toFixed(2));
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
          this.$set(item, 'area', +item.area.toFixed(2));
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
        // console.log(this.procedureList);
      }
    },

    /**
     * 获取过渡路径信息
     */
    async getTransitionList(id) {
      this.publicQuery['Condition.Id'] = id;
      const { data, errorCode } = await portApi.apiGetTransitionByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.transitionList = data.result; //item.direction == 1 ? '进港' : '出港' , item.type == 1 ? '泊位' : '航标'
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
    }
  }
};
