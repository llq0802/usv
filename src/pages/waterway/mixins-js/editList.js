import * as apiNava from 'api/nava';
import * as apiWay from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { BASE_CONSTANTS } from '@/config';

export default {
  methods: {
    /**
     * 航标,航道 的更新编辑
     */
    async handleEdit(type, val) {
      if (type === 'nava') {
        this.editNava(val);
      } else if (type === 'way') {
        this.isShowWayDialog = true;
        this.currentWayDialog = val;
        this.currentWay = [val];
        await this.$nextTick();
        this.$refs.editaddway.cursorInsertIndex = this.currentWayDialog.fixes.length - 1;
        this.wayAddData.plan = 0;
      }
    },
    /**
     * 航标更新请求
     */
    async editNava(val) {
      let data = deepClone(val);
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
      data.location = turnLngLat(data.locationObj);
      const { errorCode } = await apiNava.apiEditNava(data);
      if (+errorCode !== 0) return;
      this.$message.success('修改成功');

      this.currentNava = null;
      data = null;
      this.isRequest = true;
      this.currentWay = [];

      this.getNavaList();
    }
  }
};
