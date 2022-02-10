import * as apiNava from 'api/nava';
import * as apiWay from 'api/waterway';
import { confirmMsg } from '@/utils';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { BASE_CONSTANTS } from '@/config';

export default {
  methods: {
    /**
     * 删除航道中的当前航标
     */
    handleDelCurrentWayDialog(nava, index) {
      let navaList = this.currentWayDialog.fixes;
      navaList.splice(index, 1);
      this.$refs.editaddway.cursorInsertIndex = navaList.length - 1; // 默认插入航标的位置
      let pathArr = this.isSplitWaterway();
      this.lineInstance = this.addPolyLine(this.mapInstance, pathArr, this.lineInstance);
      this.currentWayDialog.totalDistance = this.getDistanceOfLine(pathArr);
    },
    /**
     * 删除航道中的航标(前面或者后面所有)
     */
    handleDelWayPrevOrNext(index, type, nava) {
      let navaList = this.currentWayDialog.fixes;
      type === 'next' ? navaList.splice(index) : navaList.splice(0, index + 1);
      this.$refs.editaddway.cursorInsertIndex = navaList.length - 1; // 默认插入航标的位置
      let pathArr = this.isSplitWaterway();
      this.lineInstance = this.addPolyLine(this.mapInstance, pathArr, this.lineInstance);
      this.currentWayDialog.totalDistance = this.getDistanceOfLine(pathArr);
    },
    /**
     * 删除航标,航道网络请求
     */
    async handleDelete(id, type, func) {
      const confirmResult = await confirmMsg(this);
      if (confirmResult === 'confirm') {
        let index;
        if (type === 'nava') {
          const { errorCode } = await apiNava[func](id);
          index = this.navaList.findIndex((item) => item.id === id);
          this.navaList.splice(index, 1);
          if (+errorCode !== 0) return;
        } else if (type === 'way') {
          const { errorCode } = await apiWay[func](id);
          index = this.waterwayList.findIndex((item) => item.id === id);
          this.waterwayList.splice(index, 1);
          if (+errorCode !== 0) return;
        }
        this.$message.success('删除成功');
      }
    }
  }
};
