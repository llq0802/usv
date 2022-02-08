import * as apiNava from 'api/nava';
import * as apiWay from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { BASE_CONSTANTS } from '@/config';

export default {
  data() {
    return {
      navaList: [],
      waterwayList: []
    };
  },

  methods: {
    /**
     * 获取航道信息
     */
    async getWaterwayList() {
      const { data, errorCode } = await apiWay.apiGetWayByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.waterwayList = data.result;
        for (let item of data.result) {
          let en = item.ident.charAt(0).toUpperCase(); // 根据标识开头字母设置不同的颜色
          this.$set(item, 'color', BASE_CONSTANTS.colorArray(en));
          this.$set(item, 'strokeWeight', 4);
          item.fixes.sort((a, b) => a.order - b.order); //  航标点排序
          item.fixesArray = []; // 为每一项添加二维航道路线数组
          for (let x of item.fixes) {
            const fixesArrays = item.fixesArray; // 处理航标坐标组成航道线
            x.navaid.locationObj = turnLngLatObj(x.navaid.location); // 经纬度转换
            fixesArrays.push([x.navaid.locationObj.longitude, x.navaid.locationObj.latitude]); // 轨迹数组创建
          }
        }
        // console.log(this.waterwayList);
      }
    },
    /**
     * 获取航标信息
     */
    async getNavaList() {
      const { data, errorCode } = await apiNava.apiGetNavaByQuery(this.publicQuery);
      if (+errorCode === 0) {
        this.navaList = data.result;
        for (let item of data.result) {
          // item.locationObj = turnLngLatObj(item.location);
          this.$set(item, 'locationObj', turnLngLatObj(item.location));
          item.locationArr = turnLngLat(item.location);
        }
        console.log(this.currentNava);
        // console.log(this.navaList);
      }
    }
  }
};
