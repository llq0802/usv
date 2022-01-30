import * as portApi from 'api/port';
import { confirmMsg } from '@/utils';

export default {
  data() {
    return {
      tableOption: Object.freeze({
        label: '操作',
        width: 80,
        options: [
          {
            label: '删除',
            type: 'danger',
            size: 'mini',
            methods: (row, index) => this.handleDelete(row.id, row.delApi)
          }
        ]
      })
    };
  },
  methods: {
    /**
     * 表格操作项按钮事件调用
     */
    tableButtonClick(options) {
      options.methods.call(this, options.row, options.index);
    },
    /**
     * 点击表格某一行事件
     */
    tableRowClick(row) {
      this.handleCurrentClick(row.uid, row);
    },
    /**
     * 点击Switch按钮事件
     */
    async handleSwitchChange(value, row, index) {
      this.enableAndDisable(value, row);
    },
    /**
     * 统一设置泊位 程序 过渡路径是否生效
     */
    async enableAndDisable(value, row) {
      const id = row.id;
      const type = row.uid;
      let nameFun = type.slice(0, 1).toUpperCase() + type.slice(1);
      let apiFunc = value ? `apiEn${nameFun}` : `apiDis${nameFun}`;
      const confirmRes = await confirmMsg(this, `此操作将设置成${value ? '' : '不'}生效`);
      const { errorCode } = await portApi[apiFunc](id);
      if (confirmRes === 'confirm') {
        if (+errorCode === 0) {
          this.$message.success('设置成功');
          if (type === 'berth') {
            this.getBerthList(this.currentPort.id);
          } else if (type === 'procedure') {
            this.getProcedureList(this.currentPort.id);
          } else if (type === 'transition') {
            this.getTransitionList(this.currentPort.id);
          }
        }
      }
    }
  }
};
