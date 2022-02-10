import { confirmMsg } from '@/utils';
import * as portApi from 'api/port';
export default {
  methods: {
    /**
     * 统一删除港口,泊位,程序,端点,过渡路径
     */
    async handleDelete(id, api) {
      const requestFun = portApi[api];
      const confirmRlust = await confirmMsg(this);
      if (confirmRlust === 'confirm') {
        const { errorCode } = await requestFun(id);
        if (+errorCode !== 0) return;
        const list = `${api.slice(6).toLowerCase()}List`;
        let index = this[list].findIndex((item) => item.id === id);
        this[list].splice(index, 1);
        this.$message.success('删除成功');
      }
    }
  }
};
