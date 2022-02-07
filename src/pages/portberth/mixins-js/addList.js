import { path2Str } from '@/utils/handleLngLat';
import { deepClone } from '@/utils';
import * as portApi from 'api/port';
export default {
  data() {
    return {
      addPortData: {
        isClick: false, //是否点击了新增港口按钮
        isStartDraw: false,
        name: '',
        ident: '',
        bounds: [],
        longitude: null,
        latitude: null,
        area: ''
      },
      addBerthData: {
        isClick: false, //是否点击了新增泊位按钮
        isStartDraw: false,
        portId: null,
        ident: '',
        bounds: [],
        longitude: null,
        latitude: null,
        area: ''
      },
      addPointData: {
        isClick: false, //是否点击了新增端点按钮
        longitude: null,
        latitude: null,
        Id: null,
        Ident: '',
        Location: null
      },
      addProcedureData: {
        startPoint: null,
        endPoint: null,
        isClick: false, //是否点击了新增程序按钮
        id: null,
        ident: '',
        startId: null,
        endId: null,
        path: [],
        type: 1 //1代表离港，2代表进港
      },
      addTransitionData: {
        startMinPoint: null,
        endMinPoint: null,
        isClick: false, //是否点击了新增过渡路径按钮
        procedureEndpointId: null,
        direction: null,
        type: null,
        path: [],
        targetId: null
      }
    };
  },
  methods: {
    /**
     * 添加按钮提交
     */
    handleAddSava(type, value) {
      if (type === 'port') {
        this.addPort();
      } else if (type === 'berth') {
        this.addBerth();
      } else if (type === 'point') {
        this.addPoint();
      } else if (type === 'procedure') {
        this.addProcedure();
      } else if (type === 'transition') {
        this.addTransition();
      }
    },
    /**
     * 新增港口请求
     */
    async addPort() {
      const identReg = /^[A-Z]{4}$/;
      console.log(this.addPortData);
      let data = deepClone(this.addPortData);
      if (!identReg.test(data.ident)) {
        this.$message.warning('标识应由四个大写字母组成');
        return;
      }
      data.bounds = path2Str(data.bounds);
      if (!data.bounds) {
        this.$message.warning('港口的范围不能为空');
        return;
      }
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await portApi.apiAddPort(data);
      console.log(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getPortList(this.publicQuery);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData();
        this.$message.success('添加成功');
      }
    },
    /**
     * 新增泊位请求
     */
    async addBerth() {
      let data = deepClone(this.addBerthData);
      const reg = /^[A-Z0-9]{2,4}$/;
      if (!reg.test(this.addBerthData.ident)) {
        this.$message.warning('识别码应由二到四个大写字母或数字组成');
        return;
      }
      data.bounds = path2Str(data.bounds);
      if (!data.bounds) {
        this.$message.warning('泊位的范围不能为空');
        return;
      }
      data.portId = this.currentPort.id;
      data.location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await portApi.apiAddBerth(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getBerthList(this.currentPort.id);
        this.resetAddData();
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.$message.success('添加成功');
      }
    },
    /**
     * 新增端点请求
     */
    async addPoint() {
      const reg = /^[A-Z]{3}$/;
      let data = deepClone(this.addPointData);
      if (!reg.test(data.Ident)) {
        this.$message.warning('标识是长度为3的英文大写字母');
        return;
      }
      data.Id = this.currentPort.id;
      data.Location = `${data.latitude},${data.longitude}`;
      const { errorCode } = await portApi.apiAddPoint(data);
      console.log(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getPointList(this.currentPort.id);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData();
        this.$message.success('添加成功');
      }
    },
    /**
     *  新增程序,程序路径不包含起始端点和结束端点
     */
    async addProcedure() {
      const reg = /^[0-9A-Z]{1,10}$/;
      let data = deepClone(this.addProcedureData);
      if (!reg.test(data.ident)) {
        this.$message.warning('识别码由大写字母和数字组成，长度在十个字符以内');
        return;
      }
      data.startId = data.startPoint.id;
      data.endId = data.endPoint.id;
      data.path = path2Str(data.path);
      data.id = this.currentPort.id;
      if (data.startId == data.endId) {
        this.$message.warning('开始端点不能与结束端点相同');
        return;
      }
      const { errorCode } = await portApi.apiAddProcedure(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getProcedureList(this.currentPort.id);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData();
        this.$message.success('添加成功');
      }
    },
    /**
     *   新增过渡路径
     */
    async addTransition() {
      let data = deepClone(this.addTransitionData);
      data.path = path2Str(data.path);
      // 数据处理
      if ((data.direction === 1 && data.type === 1) || (data.direction === 2 && data.type === 2)) {
        data.targetId = data.endMinPoint.id;
        data.procedureEndpointId = data.startMinPoint.id;
      }
      if ((data.direction === 1 && data.type === 2) || (data.direction === 2 && data.type === 1)) {
        data.targetId = data.startMinPoint.id;
        data.procedureEndpointId = data.endMinPoint.id;
      }
      const { errorCode } = await portApi.apiAddTransition(data);
      if (+errorCode === 0) {
        data = null; //清理内存
        await this.getTransitionList(this.currentPort.id);
        this.isRequest = true; //新增完成后可以进行网络请求
        this.isClickMap = false; //新增完成后不能点击地图获取坐标
        this.resetAddData();
        this.$message.success('添加成功');
      }
    },
    /**
     * 关闭新增弹框
     */
    handleAddBoxClose(type) {
      this.resetAddData();
    },
    /**
     * 重置新增数据
     */
    resetAddData(type) {
      if (!type) {
        this.addPortData = {
          isClick: false, //是否点击了新增港口按钮
          isStartDraw: false,
          name: '',
          ident: '',
          zoomLevel: 0,
          bounds: [],
          longitude: null,
          latitude: null,
          area: ''
        };
      }

      this.addBerthData = {
        isClick: false, //是否点击了新增泊位按钮
        isStartDraw: false,
        portId: null,
        ident: '',
        bounds: [],
        longitude: null,
        latitude: null,
        area: ''
      };
      this.addPointData = {
        isClick: false, //是否点击了新增端点按钮
        longitude: null,
        latitude: null,
        Id: null,
        Ident: '',
        Location: null
      };
      this.addProcedureData = {
        isClick: false, //是否点击了新增程序按钮
        id: null,
        ident: '',
        startId: null,
        endId: null,
        path: [],
        type: 1, //1代表离港，2代表进港
        startPoint: null,
        endPoint: null
      };
      this.addTransitionData = {
        isClick: false, //是否点击了新增过渡路径按钮
        procedureEndpointId: null,
        direction: null,
        path: [],
        targetId: null,
        startMinPoint: null,
        endMinPoint: null
      };
    }
  }
};
