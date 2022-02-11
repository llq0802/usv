import { str2Path } from '@/utils/handleLngLat';
import { deepClone, confirmMsg, clearProperties } from '@/utils';
import bus from '@/utils/bus';
import { BASE_CONSTANTS } from '@/config';
// api
import { apiGetWaysByIdent } from 'api/waterway';
import {
  apiGetRouteString, apiPostValidRoute, apiPostParsePath, apiPostParseRouteStr
} from 'api/route';
import {
  apiGetBerthById, apiGetTransition, apiGetTransitionNavaids
} from 'api/port';
import { apiGetNavaByQuery, apiGetNavidsByIdent } from 'api/nava';

export default {
  data() {
    return {
      // 航段信息
      navigationInfo: [],
      // 面板参数字符串格式
      navString: [],
      // 远程搜索加载条
      loading: false,
      // 航段信息列表
      navigationList: [],
      // 当前行索引
      currentRowIndex: null,
      // 航线不连续，警告信息
      uncontinueInfo: [],
      // 拾取信息索引
      pickupCoordIndex: null,
      // 是否显示进出港航段格式
      isInPort: false,
      isOutPort: false,
      // 是否显示进出港弹出框
      isShowOutPortPopover: false,
      isShowInPortPopover: false,
      // 进出港航段
      outPortInfo: {
        berth: '',
        berthId: null,
        procedure: '',
        procedureId: null,
        navaid: '',
        navaidId: null,
      },
      inPortInfo: {
        berth: '',
        berthId: null,
        procedure: '',
        procedureId: null,
        navaid: '',
        navaidId: null,
      },
      searchResult: [],
      // 航道
      channelList: [],
      // 鼠标经过的下拉框是否为航道ident
      isExistChannel: false,
      searchChannelList: [],
      // 提交的航线信息
      isFull: false,
      addRouteForm: {
        id: null,
        name: '',
        departure: '',
        destination: '',
        segments: [],
      },
    }
  },
  methods: {
    // 以字符串的形式返回指定航线的航段信息
    async getNavigationInfo() {
      if (this.routeInfo.id) {
        const res = await apiGetRouteString(this.routeInfo.id);
        if (!res.errorCode) {
          this.navigationInfo = [];
          for (let item of res.data) {
            this.navigationInfo.push(item.split(' '));
          }
          await this.handleData();
        } else {
          this.$message.warning(res.message);
        }
      }
    },
    // 处理数据
    async handleData(Bool, index) {
      // Bool 作为是否地图自适应的标志 Bool为underfined调用地图自适应
      // index 作为索引=> 判断所编辑行的信息是否完整
      let isCompleted = true;
      if (index >= 0) {
        isCompleted = !this.navigationInfo[index].some(item => item.trim().length == 0);
      }
      if (isCompleted && this.navigationInfo.length) {
        // console.log('发起路线请求了');
        await this.translateNavByString();
        await this.validateNavContinue();
        await this.getPath(Bool);
      }
    },
    // 数组信息转化为字符串信息
    arrayToString() {
      this.navString = [];
      for (let item of this.navigationInfo) {
        this.navString.push(item.join(' '));
      }
    },
    // 首次加载时，提取进出港航段的字符串
    async extractPortNav() {
      if (this.routeInfo.id) {
        const res = await apiGetRouteString(this.routeInfo.id);
        if (res.errorCode) return;
        this.isInPort = false;
        this.isOutPort = false;
        for (let i in res.data) {
          // 离港
          if (i == 0 && res.data[i].split(' ')[0].includes('.')) {
            this.isOutPort = true;
            let newStr = res.data[i].split(' ');
            // 提取ident
            this.outPortInfo.navaid = newStr.slice(0, 2)[1];
            this.outPortInfo.berth = newStr[0].split('.').slice(0, 2)[1];
            this.outPortInfo.procedure = newStr[0].split('.').slice(0, 2)[0];
            // 根据ident匹配id
            const berthRes = await apiGetBerthById(this.depPortId);
            if (!berthRes.errorCode) {
              let berth = berthRes.data.find(berth => berth.ident == this.outPortInfo.berth);
              this.outPortInfo.berthId = berth.id;
            }
            const procedureRes = await apiGetTransition({ port:this.depPortId, type: 1 });
            if (!procedureRes.errorCode) {
              let path = procedureRes.data.find(path => path.procedure.ident == this.outPortInfo.procedure);
              this.outPortInfo.procedureId = path.procedure.id;
            }
            const navaidRes = await apiGetTransitionNavaids({ port: this.depPortId, type: 1 });
            if (!navaidRes.errorCode) {
              let navaid = navaidRes.data.find(navaid => navaid.ident == this.outPortInfo.navaid);
              this.outPortInfo.navaidId = navaid.id;
            }
          }
          // 进港
          if (i > 0 && i == res.data.length - 1 && res.data[i].split(' ')[0].includes('.')) {
            this.isInPort = true;
            let newStr = res.data[i].split(' ');
            // 提取ident
            this.inPortInfo.berth = newStr.slice(0, 2)[1];
            this.inPortInfo.navaid = newStr[0].split('.').slice(0, 2)[1];
            this.inPortInfo.procedure = newStr[0].split('.').slice(0, 2)[0];
            // 根据ident匹配id
            const berthRes = await apiGetBerthById(this.desPortId);
            if (!berthRes.errorCode) {
              let berth = berthRes.data.find(berth => berth.ident == this.inPortInfo.berth);
              this.inPortInfo.berthId = berth.id;
            }
            const procedureRes = await apiGetTransition({ port:this.desPortId, type: 2 });
            if (!procedureRes.errorCode) {
              let path = procedureRes.data.find(path => path.procedure.ident == this.inPortInfo.procedure);
              // console.log(path);
              this.inPortInfo.procedureId = path.procedure.id;
            }
            const navaidRes = await apiGetTransitionNavaids({ port: this.desPortId, type: 2 });
            if (!navaidRes.errorCode) {
              let navaid = navaidRes.data.find(navaid => navaid.ident == this.inPortInfo.navaid);
              if (navaid) this.inPortInfo.navaidId = navaid.id;
            }
          }
        }
      }
    },
    // 将字符串作为航段信息解析
    async translateNavByString() {
      this.arrayToString();
      const res = await apiPostParseRouteStr(this.navString);
      if (!res.errorCode) {
        // 将航段信息储存起来
        this.navigationList = res.data;
      }
    },
    // 将字符串直接解析为路径字符串
    async getPath(Bool) {
      this.arrayToString();
      const res = await apiPostParsePath(this.navString);
      if (res.errorCode) return;
      if (!res.data.length) return;
      // 当第一个航段为坐标航段时，将目标点赋值给他
      if (!res.data[0].length && res.data.length > 1) {

        let temp = JSON.parse(JSON.stringify(res.data[1]));
        res.data[0] = temp.split(' ')[0];
      }
      // 存在空航段或航段不完整,修正高亮显示的行索引
      let index = null;
      if (this.currentRowIndex) index = this.currentRowIndex.toString();
      let num = 0;
      for (let i in this.navString) {
        if (this.navString[i].length < 2) num++;
        if (i == index) {
          this.currentRowIndex -= num;
          break;
        }
      }
      // res.data--------------需要转为的字符串数组
      // Bool------------------是否调用地图自适应的标志
      // this.navigationList---各航段信息
      // this.currentRowIndex-------高亮显示行的索引
      let navigationList = deepClone(this.navigationList);
      // 如果当前行存在空航段或航段不完整，取消高亮航段
      if (
        (this.currentRowIndex >= 0 && this.navString[this.currentRowIndex] && !this.navString[this.currentRowIndex].split(' ')[0]) ||
        (this.currentRowIndex >= 0 && this.navString[this.currentRowIndex] && !this.navString[this.currentRowIndex].split(' ')[1])
      ) {
        this.$emit('updateRoute', res.data, Bool, navigationList, this.currentRowIndex + 'noHighlight');
      } else {
        this.$emit('updateRoute', res.data, Bool, navigationList, this.currentRowIndex);
      }
    
    },
    // 验证航段连续性
    async validateNavContinue() {
      this.uncontinueInfo = [];
      const res = await apiPostValidRoute(this.navString);
      if (!res.errorCode) {
        this.uncontinueInfo = res.data;
        this.$forceUpdate();
      }
    },
    // 存在始发地目的地,处理数据
    getRoutePortId() {
      this.depPortId = this.routeInfo.departureId;
      this.desPortId = this.routeInfo.destinationId;
      this.extractPortNav();
    },
    // 初始化港口信息
    initOutInPortWithInfo(outPort, inPort) {
      if (outPort) {
        this.outPortInfo = clearProperties(this.outPortInfo);
        if (this.isOutPort && this.navigationInfo[0]) {
          this.navigationInfo[0][0] = '';
        }
        if (this.$parent.routePathList[0] && this.$parent.routePathList[0].type == 4) {
          this.$parent.routePathList.shift();
          if (this.$parent.routePathList.length) {
            let clonePath = deepClone(this.$parent.routePathList[0]);
            this.$parent.routePathList.unshift(clonePath);
          }
        }
      }
      if (inPort) {
        this.inPortInfo = clearProperties(this.inPortInfo);
        if (this.isInPort && this.navigationInfo[0]) {
          this.navigationInfo[this.navigationInfo.length - 1][0] = '';
        }
        if (
          this.$parent.routePathList[this.$parent.routePathList.length - 1] &&
          this.$parent.routePathList[this.$parent.routePathList.length - 1].type == 5
        ) {
          this.$parent.routePathList.pop();
        }
      }
    },
    // 添加进出港航段
    addPortNav(str) {
      let row = ['', ''];
      // 离港
      if (str == 'dep') {
        if (this.depPortId) {
          this.isOutPort = true;
          this.navigationInfo.unshift(row);
        } else {
          this.$alert('请选择始发地港口!');
        }
        // 进港
      } else {
        if (this.desPortId) {
          if (this.navigationInfo.length) {
            this.isInPort = true;
            this.navigationInfo.push(row);
          } else {
            this.$alert('请先添加进港前航段信息!');
          }
        } else {
          this.$alert('请选择目的地港口!');
        }
      }
    },
    // 增加行
    addRow(index) {
      let row = ['', ''];
      if (index != null) {
        if (index.includes('up')) {
          this.navigationInfo.splice(parseInt(index), 0, row);
        } else {
          this.navigationInfo.splice(parseInt(index) + 1, 0, row);
        }
      } else {
        this.navigationInfo.push(row);
      }
    },
    // 删除行
    async deleteRow(index, portRow) {
      const cf = await confirmMsg(this, '此操作将删除此航段');
      if (cf === 'cancel') return;
      if (index == 0 && this.isOutPort) this.isOutPort = false;
      if (index == this.navigationInfo.length - 1 && this.isInPort) {
        this.isInPort = false;
      }
      this.navigationInfo.splice(index, 1);
      // 取消拾取
      if (this.pickupCoordIndex != null) {
        this.pickupCoordIndex = null;
        let pickupDom = this.$refs.pickupCoordDom;
        for (let item of pickupDom) {
          item.classList.remove('pickup-status');
        }
        this.$emit('pickupCoord', false);
      }
      // 初始化进出港航段
      if (portRow === 1) this.initOutInPortWithInfo(true, false);
      if (portRow === 2) this.initOutInPortWithInfo(false, true);

      await this.handleData(true);
    },
    // 转大写字符
    toUpperCaseTo(string) {
      this.navigationInfo[this.currentRowIndex][1] = string.trim().toUpperCase();
    },
    // 根据前一行数据确定航道下拉框内容
    async getChannelSelectList(flag, index) {
      if (!flag) return;
      this.loading = true;
      if (!this.channelList.length) {
        await this.getChannelList();
      }
      this.searchResult = [];
      this.searchChannelList = [];
      // 第一行
      if (!index) {
        this.searchResult = [{ ident: 'DIRECT' }];
      }
      // 不是第一行
      else {
        let andy = this.navigationInfo[index - 1][0];
        // 前一行是坐标或者未填
        if (!andy || andy === 'DIRECT') {
          this.searchResult = [{ ident: 'DIRECT' }];
        }
        else {
          let preNavaidIdent = this.navigationInfo[index - 1][1];
          const res = await apiGetNavidsByIdent(preNavaidIdent);
          if (!res.errorCode) {
            this.searchResult = deepClone(res.data);
            this.searchResult.unshift({ ident: 'DIRECT' });
            if (res.data.length) {
              for (let item of res.data) {
                const channelRes = await apiGetWaysByIdent(item.ident);
                if (!channelRes.errorCode) {
                  this.searchChannelList.push(channelRes.data);
                }
              }
            }
          } else {
            this.searchResult = [{ ident: 'DIRECT' }];
          }
        }
      }
      this.loading = false;
    },
    // 根据同列前一个数据确定航标下拉框内容
    async getNavaidSelectList(flag, index) {
      if (!flag) return;
      this.loading = true;
      this.searchResult = [];
      // 同一行中未选择航道
      if (!this.navigationInfo[index][0]) {
        const res = await apiGetNavaByQuery({
          Page: 1, Size: 9999
        });
        if (!res.errorCode) {
          this.searchResult = res.data.result;
        }
        this.loading = false;
      }
      // 同一行中选择了航道
      else {
        const res = await apiGetWaysByIdent(this.navigationInfo[index][0]);
        if (!res.errorCode) {
          for (let item of res.data.fixes) {
            this.searchResult.push(item.navaid);
          }
        }
        this.loading = false;
      }
    },
    // 限制搜索离港信息 o---搜索对象
    async querySearchOutPortInfo(flag, o) {
      if (!flag) return;
      this.loading = true;
      this.searchResult = [];
      let params = {port: this.depPortId, type: 1};
      // 离港泊位
      if (o === 1) {
        if (this.outPortInfo.procedureId && this.outPortInfo.navaidId) {
          params.procedureId = this.outPortInfo.procedureId;
          params.navaidId = this.outPortInfo.navaidId;
        } else if (this.outPortInfo.procedureId && !this.outPortInfo.navaidId) {
          params.procedureId = this.outPortInfo.procedureId;
        } else if (!this.outPortInfo.procedureId && this.outPortInfo.navaidId) {
          params.navaidId = this.outPortInfo.navaidId;
        }
        const res = await apiGetTransition(params);
        if (!res.errorCode) {
          for (let item of res.data) {
            if (!this.searchResult.length || !this.searchResult.some(berth => berth.id === item.berth.id)) {
              this.searchResult.push(item.berth);
            }
          }
        }
        this.loading = false;
      }
      // 离港程序航段
      if (o === 2) {
        if (this.outPortInfo.berthId && this.outPortInfo.navaidId) {
          params.berthId = this.outPortInfo.berthId;
          params.navaidId = this.outPortInfo.navaidId;
        } else if (this.outPortInfo.berthId && !this.outPortInfo.navaidId) {
          params.berthId = this.outPortInfo.berthId;
        } else if (!this.outPortInfo.berthId && this.outPortInfo.navaidId) {
          params.navaidId = this.outPortInfo.navaidId;
        }
        const res = await apiGetTransition(params);
        if (!res.errorCode) {
          for (let item of res.data) {
            if (!this.searchResult.length || !this.searchResult.some(procedure => procedure.id === item.procedure.id)) {
              this.searchResult.push(item.procedure);
            }
          }
        }
        this.loading = false;
      }
      // 离港航标
      if (o === 3) {
        if (this.outPortInfo.berthId && this.outPortInfo.procedureId) {
          params.berthId = this.outPortInfo.berthId;
          params.procedureId = this.outPortInfo.procedureId;
        } else if (this.outPortInfo.berthId && !this.outPortInfo.procedureId) {
          params.berthId = this.outPortInfo.berthId;
        } else if (!this.outPortInfo.berthId && this.outPortInfo.procedureId) {
          params.procedureId = this.outPortInfo.procedureId;
        }
        const res = await apiGetTransition(params);
        if (!res.errorCode) {
          for (let item of res.data) {
            if (!this.searchResult.length || !this.searchResult.some(navaid => navaid.id === item.navaid.id)) {
              this.searchResult.push(item.navaid);
            }
          }
        }
        this.loading = false;
      }
    },
    // 限制搜索进港信息 o---搜索对象
    async querySearchInPortInfo(flag, o) {
      if (flag) return;
      this.loading = true;
      this.searchResult = [];
      let params = { port: this.desPortId, type: 2 };
      // 进港泊位
      if (o === 6) {
        if (this.inPortInfo.procedureId && this.inPortInfo.navaidId) {
          params.procedureId = this.inPortInfo.procedureId;
          params.navaidId = this.inPortInfo.navaidId;
        } else if (this.inPortInfo.procedureId && !this.inPortInfo.navaidId) {
          params.procedureId = this.inPortInfo.procedureId;
        } else if (!this.inPortInfo.procedureId && this.inPortInfo.navaidId) {
          params.navaidId = this.inPortInfo.navaidId;
        }
        const res = await apiGetTransition(params);
        if (!res.errorCode) {
          for (let item of res.data) {
            if (!this.searchResult.length || !this.searchResult.some(berth => berth.id === item.berth.id)) {
              this.searchResult.push(item.berth);
            }
          }
        }
        this.loading = false;
      }
      // 进港程序航段
      if (o === 5) {
        if (this.inPortInfo.berthId && this.inPortInfo.navaidId) {
          params.berthId = this.inPortInfo.berthId;
          params.navaidId = this.inPortInfo.navaidId;
        } else if (this.inPortInfo.berthId && !this.inPortInfo.navaidId) {
          params.berthId = this.inPortInfo.berthId;
        } else if (!this.inPortInfo.berthId && this.inPortInfo.navaidId) {
          params.navaidId = this.inPortInfo.navaidId;
        }
        const res = await apiGetTransition(params);
        if (!res.errorCode) {
          for (let item of res.data) {
            if (!this.searchResult.length || !this.searchResult.some(procedure => procedure.id === item.procedure.id)) {
              this.searchResult.push(item.procedure);
            }
          }
        }
        this.loading = false;
      }
      // 进港航标
      if (o === 4) {
        if (this.inPortInfo.berthId && this.inPortInfo.procedureId) {
          params.berthId = this.inPortInfo.berthId;
          params.procedureId = this.inPortInfo.procedureId;
        } else if (this.inPortInfo.berthId && !this.inPortInfo.procedureId) {
          params.berthId = this.inPortInfo.berthId;
        } else if (!this.inPortInfo.berthId && this.inPortInfo.procedureId) {
          params.procedureId = this.inPortInfo.procedureId;
        }
        const res = await apiGetTransition(params);
        if (!res.errorCode) {
          for (let item of res.data) {
            if (!this.searchResult.length || !this.searchResult.some(navaid => navaid.id === item.navaid.id)) {
              this.searchResult.push(item.navaid);
            }
          }
        }
        this.loading = false;
      }
    },
    // 高亮显示鼠标经过的下拉框内的进出港航段
    highlightPortNav(e, type) {
      let ident = e.target.innerText;
      let navigation = this.searchResult.find(nav => nav.ident == ident);
      if (navigation) {
        let highlightPolyline = str2Path(navigation.path);
        if (type === 4) {
          highlightPolyline.strokeStyle = 'solid';
          highlightPolyline.strokeColor = '#00C227';
          highlightPolyline.strokeWeight = 3;
        }
        if (type === 5) {
          highlightPolyline.strokeStyle = 'solid';
          highlightPolyline.strokeColor = '#976F02';
          highlightPolyline.strokeWeight = 3;
        }
        bus.$emit('highPolyline', highlightPolyline);
        // 地图自适应
        this.$parent.$refs.map.onCompleted(() => {
          this.$parent.$refs.map.setMapFitView(highlightPolyline);
        })
      }
    },
    // 定位鼠标经过的下拉框内的航标、泊位
    highlightPoint(e) {
      let ident = e.target.innerText;
      let position = this.searchResult.find(navaid => navaid.ident == ident).location;
      let point = [+position.split(',')[1], +position.split(',')[0]];
      // 地图自适应
      this.$parent.$refs.map.onCompleted(() => {
        this.$parent.$refs.map.setMapFitView([point, point]);
      })
    },
    // 高亮显示鼠标经过的下拉框内的航道
    highlightChannel(e) {
      let ident = e.target.innerText;
      if (ident != 'DIRECT') {
        this.isExistChannel = true;
        let channel = this.channelList.find(item => item.ident == ident);
        let path = [];
        channel.fixes.sort((a, b) => {
          return a.order - b.order;
        });
        for (let navaid of channel.fixes) {
          let point = [+navaid.navaid.location.split(',')[1], +navaid.navaid.location.split(',')[0]];
          path.push(point);
        }
        path.strokeColor = BASE_CONSTANTS.colorArray(channel.ident.slice(0, 1));
        path.strokeWeight = 6;
        path.strokeStyle = 'dashed';
        bus.$emit('highPolyline', path);
        // 地图自适应
        this.$parent.$refs.map.onCompleted(() => {
          this.$parent.$refs.map.setMapFitView(path);
        })
      } else {
        this.isExistChannel = false;
      }
    },
    // 鼠标离开，清除高亮折线
    clearHighPolyline() {
      bus.$emit('highPolyline', []);
    },
    // 选中港内信息,赋值各参数id,限制搜索结果
    assignNavId(ident, o) {
      // 离港泊位
      if (ident && o === 1) {
        let berth = this.searchResult.find(berth => berth.ident == ident);
        this.outPortInfo.berthId = berth.id;
      }
      // 离港程序航段
      if (ident && o === 2) {
        let procedure = this.searchResult.find(procedure => procedure.ident == ident);
        this.outPortInfo.procedureId = procedure.id;
      }
      // 离港航标
      if (ident && o === 3) {
        let navaid = this.searchResult.find(navaid => navaid.ident == ident);
        this.outPortInfo.navaidId = navaid.id;
      }
      // 进港航标
      if (ident && o === 4) {
        let navaid = this.searchResult.find(navaid => navaid.ident == ident);
        this.inPortInfo.navaidId = navaid.id;
      }
      // 进港港程序航段
      if (ident && o === 5) {
        let procedure = this.searchResult.find(procedure => procedure.ident == ident);
        this.inPortInfo.procedureId = procedure.id;
      }
      // 进港泊位
      if (ident && o === 6) {
        let berth = this.searchResult.find(berth => berth.ident == ident);
        this.inPortInfo.berthId = berth.id;
      }
      // 将弹出框内的信息赋值到航段字符串数组中
      this.assignNavInfoStr(o);
    },
    // 将弹出框内的信息赋值到航段字符串数组中
    assignNavInfoStr(o) {
      if (o < 4) {
        this.navigationInfo[0][0] = this.outPortInfo.procedure + '.' + this.outPortInfo.berth;
        this.navigationInfo[0][1] = this.outPortInfo.navaid;
        if (this.outPortInfo.navaid && this.outPortInfo.berth && this.outPortInfo.procedure) {
          this.handleData(false, 0);
        }
      }
      if (o > 3) {
        this.navigationInfo[this.navigationInfo.length - 1][0] = this.inPortInfo.procedure + '.' + this.inPortInfo.navaid;
        this.navigationInfo[this.navigationInfo.length - 1][1] = this.inPortInfo.berth;
        if (this.inPortInfo.navaid && this.inPortInfo.procedure && this.inPortInfo.berth) {
          this.handleData(false, this.navigationInfo.length - 1);
        }
      }
    },
    // 清除ID，解除限制
    clearSelectInfo(o) {
      switch (o) {
        case 1: // 离港泊位
          this.outPortInfo.berthId = null;
          break;
        case 2: // 离港程序航段
          this.outPortInfo.procedureId = null;
          break;
        case 3: // 离港航标
          this.outPortInfo.navaidId = null;
          break;
        case 4: // 进港航标
          this.inPortInfo.navaidId = null;
          break;
        case 5: // 进港程序航段
          this.inPortInfo.procedureId = null;
          break;
        case 6: // 进港泊位
          this.inPortInfo.berthId = null;
          break;
      }
      // 删除进出港航段在地图上的路线
      if (this.$parent.routePathList[0] && this.$parent.routePathList[0].type == 4 && (o == 1 || o == 2 || o == 3)) {
        this.$parent.routePathList.shift();
        if (this.$parent.routePathList.length) {
          let clonePath = deepClone(this.$parent.routePathList[0]);
          this.$parent.routePathList.unshift(clonePath);
        }
      }
      if (
        this.$parent.routePathList[this.$parent.routePathList.length - 1] &&
        this.$parent.routePathList[this.$parent.routePathList.length - 1].type == 5 &&
        (o == 4 || o == 5 || o == 6)
      ) {
        this.$parent.routePathList.pop();
      }
    },
    // 通过点击行高亮显示当前行
    async highlightRow(index, withMap) {
      for (let row of this.$refs.rowDom) {
        row.$el.classList.remove('current-row');
      }
      this.$refs.rowDom[index].$el.classList.add('current-row');
      this.currentRowIndex = index;
      if (!withMap) await this.getPath();
      // 关闭进出港航段弹出框
      if (index && this.isShowOutPortPopover) this.isShowOutPortPopover = false;
      if (index != this.navigationInfo.length - 1 && this.isShowInPortPopover) this.isShowInPortPopover = false;
      // 取消拾取
      if (this.pickupCoordIndex != null && index != this.pickupCoordIndex) {
        this.pickupCoordIndex = null;
        let pickupDom = this.$refs.pickupCoordDom;
        for (let item of pickupDom) {
          item.classList.remove('pickup-status');
        }
        this.$emit('pickupCoord', false);
      }
    },
    // 通过点击地图航段高亮显示当前行 或清除高亮
    highlightRowByMap(index) {
      if (index != null) {
        let strInfo = this.navString[index].split(' ').slice(0, 2);
        for (let i in this.navigationInfo) {
          if (this.navigationInfo[i][0] == strInfo[0] && this.navigationInfo[i][1] == strInfo[1]) {
            this.currentRowIndex = i;
          }
        }
        this.highlightRow(this.currentRowIndex, true);
      }
      // 清除高亮
      else {
        for (let row of this.$refs.rowDom) {
          row.$el.classList.remove('current-row');
        }
        this.currentRowIndex = null;
      }
    },
    // 抹除信息标志
    initCSS() {
      this.currentRowIndex = null;
      // 取消面板行列高亮
      for (let row of this.$refs.rowDom) {
        row.$el.classList.remove('current-row');
      }
      // 取消拾取图标和状态
      this.pickupCoordIndex = null;
      let pickupCoordDom = this.$refs.pickupCoordDom;
      for (let item of pickupCoordDom) {
        item.classList.remove('pickup-status');
      }
      this.$emit('pickupCoord', false);
    },
    // 拾取坐标或航标
    pickupCoord(index, e) {
      let pickupDom = this.$refs.pickupCoordDom;
      let classList = e ? e.target.classList : null;
      // 取消拾取
      if (!e || (classList && classList.contains('pickup-status'))) {
        this.pickupCoordIndex = null;
        for (let item of pickupDom) {
          item.classList.remove('pickup-status');
        }
        this.$emit('pickupCoord', false);
      }
      // 拾取坐标
      else {
        for (let item of pickupDom) {
          item.classList.remove('pickup-status');
        }
        // 存在空航段或航段不完整,且点击的非空航段行,修正高亮显示的行索引
        let $index = index.toString();
        let num = 0;
        let firstFlag = this.navigationInfo[index];
        for (let i in this.navigationInfo) {
          let secondFlag = this.navigationInfo[i];
          if (!secondFlag[0].length || !secondFlag[1].length) num++;
          if (firstFlag[0].length && firstFlag[1].length) {
            if (i == $index) {
              index -= num;
              break;
            }
          }
        }
        this.pickupCoordIndex = Number($index);
        e.target.classList.add('pickup-status');
        // 拾取坐标
        // if (this.navigationInfo[Number($index)][0] == 'DIRECT') {
        let coord = this.navigationInfo[Number($index)][1];
        // 坐标不为空
        if (coord) {
          this.$emit('pickupCoord', true, index, coord);
        }
        // 坐标为空
        else {
          this.$emit('pickupCoord', true, index, false);
        }
        // }
      }
    },
    // 填充坐标
    getPointLatLng(pointStr) {
      this.navigationInfo[this.pickupCoordIndex][1] = pointStr;
      this.$forceUpdate();
      if (this.navigationInfo[this.pickupCoordIndex][0]) {
        this.handleData(true);
      }
    },
    // 填充航标
    getIdent(ident) {
      this.navigationInfo[this.pickupCoordIndex][1] = ident;
      this.$forceUpdate();
      if (this.navigationInfo[this.pickupCoordIndex][0]) {
        this.handleData(true);
      }
    },
    // 校验航线信息是否完整,去除空白行
    trimNavInfo() {
      this.isFull = true;
      for (let i = this.navigationInfo.length - 1; i >= 0; i--) {
        if (!this.navigationInfo[i][0] || !this.navigationInfo[i][1]) {
          this.isFull = false;
          this.$alert('航线信息不完整,请补充完整再提交上传!');
        }
      }
    },
  }
}