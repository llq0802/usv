import * as portApi from 'api/port';

export default {
  methods: {
    /**
     * 统一修改 港口,泊位,端点等
     */
    handleEdit(type, value) {
      if (type === 'port') {
        this.editPort(value);
      } else if (type === 'berth') {
        this.editBerth(value);
      } else if (type === 'procedure') {
        this.editProcedure(value);
      } else if (type === 'point') {
        this.editPoint(value);
      } else if (type === 'transition') {
        this.editTransition(value);
      }
    },
    /**
     * 修改港口
     */
    async editPort(port) {
      const params = {
        id: port.id,
        name: port.name,
        zoomLevel: port.zoomLevel,
        bounds: this.currentPort.bounds
      };
      const { errorCode } = await portApi.apiEditPort(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentPort.isPortEdit = false;
        this.getPortList(this.publicQuery);
      }
      this.isRequest = true;
    },
    /**
     * 修改泊位
     */
    async editBerth(berth) {
      const params = {
        id: berth.id,
        ident: berth.ident,
        bounds: this.currentBerth.bounds
      };
      const { errorCode } = await portApi.apiEditBerth(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentBerth = null;
        this.getBerthList(this.currentPort.id);
      }
      this.isRequest = true;
    },
    /**
     * 修改端点
     */
    async editPoint(point) {
      const params = {
        Id: point.id,
        Ident: point.ident,
        Location: this.currentPoint.location
      };
      const { errorCode } = await portApi.apiEditPoint(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentPoint = null;
        this.getPointList(this.currentPort.id);
      }
      this.isRequest = true;
    },
    /**
     * 修改程序
     */
    async editProcedure(val) {
      const params = {
        id: val.id,
        ident: val.ident,
        startId: val.startId,
        endId: val.endId,
        path: this.currentProcedure.path,
        type: val.type
      };
      const { errorCode } = await portApi.apiEditProcedure(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentProcedure = null;
        this.getProcedureList(this.currentPort.id);
      }
      this.isRequest = true;
    },
    /**
     * 修改过渡路径
     */
    async editTransition(val) {
      const params = {
        id: val.id,
        targetId: val.type === 1 ? val.berthId : val.navaidId, //1为泊位,2为航标
        procedureEndpointId: val.procedureEndpointId,
        direction: val.direction,
        path: path2Str(this.currentTransition.path)
      };
      const { errorCode } = await portApi.apiEditTransition(params);
      if (+errorCode === 0) {
        this.$message.success('修改成功');
        this.currentTransition = null;
        this.getTransitionList(this.currentPort.id);
      }
      this.isRequest = true;
    }
  }
};
