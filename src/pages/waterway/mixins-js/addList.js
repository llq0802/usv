import * as apiNava from 'api/nava';
import * as apiWay from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';
import { deepClone } from '@/utils';

export default {
  data() {
    return {
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
     * 自动航道规划网络请求展示到手动规划中修改
     */
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
