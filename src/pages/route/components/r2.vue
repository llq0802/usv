<template>
  <div class="routePanel">
  <hr>
    <!-- 名称和港口 -->
    <span>名称</span>
    <el-input v-model="routeInfo.name"></el-input>
    <span>始发地</span>
    <keyword-search 
      :placeholder="routeInfo.departureId ? routeInfo.departure.name : '始发地'"
      @selectPort="selectPort(0, $event)"
    >
    </keyword-search>
    <span>目的地</span>
    <keyword-search
      :placeholder="routeInfo.destinationId ? routeInfo.destination.name : '目的地'"
      @selectPort="selectPort(1, $event)"
    >
    </keyword-search>
    <!-- VIA - TO -->
    <el-header>
      <el-row class="navigation-via-to">
        <el-col :span="12">VIA</el-col>
        <el-col :span="12">TO</el-col>
      </el-row>
    </el-header>
    <!-- 航段信息 -->
    <el-main>
      <span class="myholder" v-if="!navigationInfo.length">
        无数据<i class="el-icon-circle-plus-outline" title="添加航段" @click="addRow(null)"> </i>
      </span>
      <div class="navigation-query-part" v-for="(navigation, index) in navigationInfo" :key="index">
        <!-- 航段不连续信息 -->
        <el-row v-show="info.segment == index" v-for="(info, i) in uncontinueInfo" :key="i">
          <el-col :span="24" class="el-col-warning">
            <el-popover placement="right-start" title="" width="200" trigger="hover">
              <i class="el-icon-warning" slot="reference"></i>
              {{ info.reason }}
            </el-popover>
            航段不连续
          </el-col>
        </el-row>
        <span @click="highlightRow(index)" class="scollbar">
          <!-- ------------------离港航段------------------- -->
          <el-row v-if="(!index && navigation[0].includes('.')) || (!index && isOutPort)" ref="rowDom">
            <!-- 港内信息 -->
            <el-col :span="8">
              <el-popover placement="right" width="300" trigger="manual" v-model="isShowOutPortPopover">
                <!-- 弹出框按钮 -->
                <el-button
                  slot="reference"
                  style="width: 130px; font-size: 15px"
                  @click.native="isShowOutPortPopover = !isShowOutPortPopover"
                >
                  <span v-if="navigation[0].length"> {{ navigation[0] }} </span>
                  <span v-else> &nbsp; </span>
                </el-button>
                <!-- 港内信息 -->
                <div class="in-out-nav">
                  <div class="close-popover">
                    <i class="el-icon-close" @click="isShowOutPortPopover = false"></i>
                  </div>
                  <el-row>
                    <!-- 泊位 -->
                    <el-col :span="8">离港泊位</el-col>
                    <el-col :span="14">
                      <el-select
                        clearable
                        placeholder="离港泊位"
                        v-model="outPortInfo.berth"
                        :loading="loading"
                        @visible-change="querySearchOutPortInfo($event, 1)"
                        @change="assignNavId($event, 1)"
                        @clear="clearSelectInfo(1)"
                      >
                        <el-option
                          v-for="berth in searchResult"
                          :key="berth.id"
                          :label="berth.ident"
                          :value="berth.ident"
                          @mouseenter.native="highlightPoint"
                          @mouseleave.native="clearHighPoint"
                        >
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  <el-row>
                    <!-- 离港程序 -->
                    <el-col :span="8">离港程序</el-col>
                    <el-col :span="14">
                      <el-select
                        clearable
                        placeholder="离港程序"
                        v-model="outPortInfo.procedure"
                        :loading="loading"
                        @visible-change="querySearchOutPortInfo($event, 2)"
                        @change="assignNavId($event, 2)"
                        @clear="clearSelectInfo(2)"
                      >
                        <el-option
                          v-for="procedure in searchResult"
                          :key="procedure.id"
                          :label="procedure.ident"
                          :value="procedure.ident"
                          @mouseenter.native="highlightPortNav($event, (type = 4))"
                          @mouseleave.native="clearHighPolyline"
                        >
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  <el-row>
                    <!-- 离港航标 -->
                    <el-col :span="8">离港航标</el-col>
                    <el-col :span="14">
                      <el-select
                        clearable
                        placeholder="离港航标"
                        v-model="outPortInfo.navaid"
                        :loading="loading"
                        @visible-change="querySearchOutPortInfo($event, 3)"
                        @change="assignNavId($event, 3)"
                        @clear="clearSelectInfo(3)"
                      >
                        <el-option
                          v-for="navaid in searchResult"
                          :key="navaid.id"
                          :label="navaid.ident"
                          :value="navaid.ident"
                          @mouseenter.native="highlightPoint"
                          @mouseleave.native="clearHighPoint"
                        >
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="4">—</el-col>
            <!-- 离港航标 -->
            <el-col :span="8">
              <el-select
                clearable
                placeholder="离港航标"
                style="width: 130px"
                :loading="loading"
                v-model="outPortInfo.navaid"
                @click.native="highlightRow(index)"
                @visible-change="querySearchOutPortInfo($event, 3)"
                @change="assignNavId($event, 3)"
                @clear="clearSelectInfo(3)"
              >
                <el-option
                  v-for="navaid in searchResult"
                  :key="navaid.id"
                  :label="navaid.ident"
                  :value="navaid.ident"
                  @mouseenter.native="highlightPoint"
                  @mouseleave.native="clearHighPoint"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-dropdown  placement="right" @command="addRow">
                <span class="el-dropdown-link">
                  <i class="el-icon-circle-plus-outline"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="index + 'down'">向下插入航段</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <i class="el-icon-remove-outline" @click="deleteRow(index, 1)"></i>
            </el-col>
          </el-row>

          <!-- ------------------进港航段------------------- -->
          <el-row
            v-else-if="
              (index == navigationInfo.length - 1 && navigation[0].includes('.')) || (index == navigationInfo.length - 1 && isInPort)
            "
            ref="rowDom"
          >
            <!-- 港内信息 -->
            <el-col :span="8">
              <el-popover placement="right" width="300" trigger="manual" v-model="isShowInPortPopover">
                <!-- 弹出框按钮 -->
                <el-button
                  slot="reference"
                  style="width: 130px; font-size: 15px"
                  @click.native="isShowInPortPopover = !isShowInPortPopover"
                >
                  <span v-if="navigation[0].length"> {{ navigation[0] }} </span>
                  <span v-else> &nbsp; </span>
                </el-button>
                <!-- 港内信息 -->
                <div class="in-out-nav">
                  <div class="close-popover">
                    <i class="el-icon-close" @click="isShowInPortPopover = false"></i>
                  </div>
                  <el-row>
                    <!-- 进港航标 -->
                    <el-col :span="8">进港航标</el-col>
                    <el-col :span="14">
                      <el-select
                        clearable
                        placeholder="进港航标"
                        v-model="inPortInfo.navaid"
                        :loading="loading"
                        @visible-change="querySearchInPortInfo($event, 4)"
                        @change="assignNavId($event, 4)"
                        @clear="clearSelectInfo(4)"
                      >
                        <el-option
                          v-for="navaid in searchResult"
                          :key="navaid.id"
                          :label="navaid.ident"
                          :value="navaid.ident"
                          @mouseenter.native="highlightPoint"
                          @mouseleave.native="clearHighPoint"
                        >
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  <el-row>
                    <!-- 进港程序 -->
                    <el-col :span="8">进港程序</el-col>
                    <el-col :span="14">
                      <el-select
                        clearable
                        placeholder="进港程序"
                        v-model="inPortInfo.procedure"
                        :loading="loading"
                        @visible-change="querySearchInPortInfo($event, 5)"
                        @change="assignNavId($event, 5)"
                        @clear="clearSelectInfo(5)"
                      >
                        <el-option
                          v-for="procedure in searchResult"
                          :key="procedure.id"
                          :label="procedure.ident"
                          :value="procedure.ident"
                          @mouseenter.native="highlightPortNav($event, (type = 5))"
                          @mouseleave.native="clearHighPolyline"
                        >
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                  <el-row>
                    <!-- 进港泊位 -->
                    <el-col :span="8">进港泊位</el-col>
                    <el-col :span="14">
                      <el-select
                        clearable
                        placeholder="进港泊位"
                        :loading="loading"
                        v-model="inPortInfo.berth"
                        @visible-change="querySearchInPortInfo($event, 6)"
                        @change="assignNavId($event, 6)"
                        @clear="clearSelectInfo(6)"
                      >
                        <el-option
                          v-for="berth in searchResult"
                          :key="berth.id"
                          :label="berth.ident"
                          :value="berth.ident"
                          @mouseenter.native="highlightPoint"
                          @mouseleave.native="clearHighPoint"
                        >
                        </el-option>
                      </el-select>
                    </el-col>
                  </el-row>
                </div>
              </el-popover>
            </el-col>
            <el-col :span="4">—</el-col>
            <!-- 进港泊位 -->
            <el-col :span="8">
              <el-select
                clearable
                placeholder="进港泊位"
                style="width: 130px"
                v-model="inPortInfo.berth"
                :loading="loading"
                @click.native="highlightRow(index)"
                @visible-change="querySearchInPortInfo($event, 6)"
                @change="assignNavId($event, 6)"
                @clear="clearSelectInfo(6)"
              >
                <el-option
                  v-for="berth in searchResult"
                  :key="berth.id"
                  :label="berth.ident"
                  :value="berth.ident"
                  @mouseenter.native="highlightPoint"
                  @mouseleave.native="clearHighPoint"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-dropdown  placement="right" @command="addRow">
                <span class="el-dropdown-link">
                  <i class="el-icon-circle-plus-outline"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item :command="index + 'up'">向上插入航段</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <i class="el-icon-remove-outline" @click="deleteRow(index, 2)"></i>
            </el-col>
          </el-row>

          <!-- ------------------中间航段------------------- -->
          <el-row v-else ref="rowDom">
            <el-col :span="8">
              <!-- VIA远程搜索 -->
              <el-select
                filterable
                clearable
                style="width: 130px"
                v-model="navigation[0]"
                @click.native="highlightRow(index)"
                @visible-change="getChannelSelectList($event, index)"
                @change="handleData(true, index)"
                :loading="loading"
              >
                <el-option
                  v-for="(item, i) in searchResult"
                  :key="i"
                  :label="item.ident"
                  :value="item.ident"
                  @mouseenter.native="highlightChannel"
                  @mouseleave.native="clearHighChannel"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4">—</el-col>
            <el-col :span="8">
              <!-- TO远程搜索 -->
              <!-- 拾取坐标或航标 -->
              <el-input
                v-if="navigation[0] == 'DIRECT' || !navigation[0]"
                style="width: 130px"
                v-model="navigation[1]"
                @input="toUpperCaseTo"
                @blur="handleData(true, index)"
                @keydown.enter.native="handleData(true, index)"
              >
                <i slot="suffix" class="el-icon-map-location" ref="pickupCoordDom" @click="pickupCoord(index, $event)"></i>
              </el-input>
              <!-- 选择航标 -->
              <el-select
                v-else
                filterable
                clearable
                style="width: 130px"
                v-model="navigation[1]"
                @click.native="highlightRow(index)"
                @visible-change="getNavaidSelectList($event, index)"
                @change="handleData(true, index)"
                :loading="loading"
              >
                <i ref="pickupCoordDom"></i>
                <el-option
                  v-for="(item, i) in searchResult"
                  :key="i"
                  :label="item.ident"
                  :value="item.ident"
                  @mouseenter.native="highlightPoint"
                  @mouseleave.native="clearHighPoint"
                >
                </el-option>
              </el-select>
            </el-col>
            <el-col :span="4"
              ><div>
                <el-dropdown  placement="right" @command="addRow">
                  <span class="el-dropdown-link">
                    <i class="el-icon-circle-plus-outline"></i>
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :command="index + 'up'">向上插入航段</el-dropdown-item>
                    <el-dropdown-item :command="index + 'down'">向下插入航段</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
                <i class="el-icon-remove-outline" @click="deleteRow(index)"></i></div
            ></el-col>
          </el-row>
        </span>
      </div>
    </el-main>
























    
  </div>
</template>

<script>
import { strArrToTdArr } from '@/utils/handleLngLat';
import { deepClone, confirmMsg } from '@/utils';
import bus from '@/utils/bus';
import { BASE_CONSTANTS } from '@/config';
// api
import { apiGetWayByQuery } from 'api/waterway';
import {
  apiGetRouteString, apiPostValidRoute, apiPostParsePath, apiPostParseRouteStr, apiPostUpdateRoute
} from 'api/route';
import {
  apiGetBerthById, apiGetPortByIdent, apiGetTransition, apiGetTransitionNavaids
} from 'api/port';
import { apiGetNavaByQuery } from 'api/nava';
// 组件
import KeywordSearch from 'components/common/keyword-search/KeywordSearch';
export default {
  props: {
    routeInfo: Object,
  },
  components: {
    KeywordSearch
  },
  data() {
    return {
      // 港口id
      depPortId: null,
      desPortId: null,













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
      // 港口始发地和目的地
      portInfo: {
        departureId: null,
        departure: '',
        departureIdent: '',
        destinationId: null,
        destination: '',
        destinationIdent: '',
      },
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
    };
  },
  methods: {
    // 选择港口
    selectPort(a, port) {
      // 始发港口
      if (a === 0) {
        if (!port) return this.depPortId = null;
        this.depPortId = port.id;
      }
      // 目的港口
      else {
        if (!port) return this.desPortId = null;
        this.desPortId = port.id;
      }
    },














































































    // 获取所有航道
    async getChannelList() {
      // console.log('获取航道接口API');
      const res = await apiGetWayByQuery({
        Page: 1, Size:9999
      })
      if (!res.errorCode) {
        this.channelList = res.data.result;
      }
    },
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
        const res = apiGetRouteString(this.routeInfo.id);
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
              this.inPortInfo.navaidId = navaid.id;
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
      if (!res.errorCode) {
        if (res.data.length) {
          // 当第一个航段为坐标航段时，将目标点赋值给他
          if (!res.data[0].length && res.data.length > 1) {

            let temp = JSON.parse(JSON.stringify(res.data[1]));
            res.data[0] = temp.split(' ')[0];
          }
          // 存在空航段或航段不完整,修正高亮显示的行索引
          let index = deepClone(this.currentRowIndex);
          let $index = null;
          if (index) $index = index.toString();
          let num = 0;
          for (let i in this.navString) {
            if (this.navString[i].length < 2) num++;
            if (i == $index) {
              index -= num;
              break;
            }
          }
          // console.log(num,index);
          // res.data--------------需要转为的字符串数组
          // Bool------------------是否调用地图自适应的标志
          // this.navigationList---各航段信息
          // index-------高亮显示行的索引
          let navigationList = deepClone(this.navigationList);
          // console.log(navigationList);
          // 如果当前行存在空航段或航段不完整，取消高亮航段
          if (
            (this.currentRowIndex >= 0 && this.navString[this.currentRowIndex] && !this.navString[this.currentRowIndex].split(' ')[0]) ||
            (this.currentRowIndex >= 0 && this.navString[this.currentRowIndex] && !this.navString[this.currentRowIndex].split(' ')[1])
          ) {
            this.$emit('updateRoute', res.data, Bool, navigationList, index + 'noHighlight');
          } else {
            this.$emit('updateRoute', res.data, Bool, navigationList, index);
          }
        }
      } else {
        this.$message.warning(res.message)
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
    async getRoutePortId() {
      if (this.routeInfo.originData && this.routeInfo.originData.departureId) {
        this.depPortId = this.routeInfo.originData.departureId;
        if (this.routeInfo.originData.departure) {
          this.portInfo.departure = this.routeInfo.originData.departure.name;
          this.portInfo.departureIdent = this.routeInfo.originData.departure.ident;
        }
      }
      if (this.routeInfo.originData && this.routeInfo.originData.destinationId) {
        this.desPortId = this.routeInfo.originData.destinationId;
        if (this.routeInfo.originData.destination) {
          this.portInfo.destination = this.routeInfo.originData.destination.name;
          this.portInfo.destinationIdent = this.routeInfo.originData.destination.ident;
        }
      }
      await this.extractPortNav();
      // this.$parent.allLoading = false;
    },
    // 初始化始发地目的地
    initPortInfo(outPort, inPort) {
      if (outPort) {
        this.portInfo.departure = '';
        this.portInfo.departureId = null;
        this.portInfo.departureIdent = '';
        this.isOutPort = false;
      }
      if (inPort) {
        this.portInfo.destination = '';
        this.portInfo.destinationId = null;
        this.portInfo.destinationIdent = '';
        this.isInPort = false;
      }
    },
    // 初始化港口信息
    initOutInPortWithInfo(outPort, inPort) {
      if (outPort) {
        this.outPortInfo = {
          berth: '',
          berthId: null,
          procedure: '',
          procedureId: null,
          navaid: '',
          navaidId: null,
        };
        if (this.isOutPort && this.navigationInfo[0]) {
          this.navigationInfo[0][0] = '';
        }

        // if (this.$parent.routePathList[0] && this.$parent.routePathList[0].type == 4) {
        //   this.$parent.routePathList.shift();
        //   if (this.$parent.routePathList.length) {
        //     let clonePath = deepClone(this.$parent.routePathList[0]);
        //     this.$parent.routePathList.unshift(clonePath);
        //   }
        // }
      }
      if (inPort) {
        this.inPortInfo = {
          berth: '',
          berthId: null,
          procedure: '',
          procedureId: null,
          navaid: '',
          navaidId: null,
        };
        if (this.isInPort && this.navigationInfo[0]) {
          this.navigationInfo[this.navigationInfo.length - 1][0] = '';
        }
        // if (
        //   this.$parent.routePathList[this.$parent.routePathList.length - 1] &&
        //   this.$parent.routePathList[this.$parent.routePathList.length - 1].type == 5
        // ) {
        //   this.$parent.routePathList.pop();
        // }
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
      if (flag) {
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
          // 前一行不为坐标
          if (this.navigationInfo[index - 1][1] && this.navigationInfo[index - 1][1].includes(',')) {
            let preNavaidIdent = this.navigationInfo[index - 1][1];
            const { data: res } = await this.$http.get(`/api/navaid/waterways?ident=` + preNavaidIdent);
            if (!res.errorCode) {
              this.searchResult = deepClone(res.data);
              this.searchResult.unshift({ ident: 'DIRECT' });
              if (res.data.length) {
                for (let item of res.data) {
                  const { data: channelRes } = await this.$http.get(`/api/waterway/get?ident=` + item.ident);
                  if (!channelRes.errorCode) {
                    this.searchChannelList.push(channelRes.data);
                  }
                }
              }
            } else {
              // console.log(res);
              this.searchResult = [{ ident: 'DIRECT' }];
            }
          } else {
            this.searchResult = [{ ident: 'DIRECT' }];
          }
        }
        this.loading = false;
      }
    },
    // 根据同列前一个数据确定航标下拉框内容
    async getNavaidSelectList(flag, index) {
      if (flag) {
        this.loading = true;
        this.searchResult = [];
        // 同一行中未选择航道
        if (!this.navigationInfo[index][0]) {
          const { data: res } = await apiGetNavaByQuery({
            Page: 1, Size: 9999
          });
          if (!res.errorCode) {
            this.searchResult = res.data.result;
          } else {
            // console.log(res);
          }
          this.loading = false;
        }
        // 同一行中选择了航道
        else {
          const { data: res } = await this.$http.get(`/api/waterway/get?ident=` + this.navigationInfo[index][0]);
          if (!res.errorCode) {
            for (let item of res.data.fixes) {
              this.searchResult.push(item.navaid);
            }
          } else {
            // console.log(res);
          }
          this.loading = false;
        }
      }
    },
    // 限制搜索离港信息 o---搜索对象
    async querySearchOutPortInfo(flag, o) {
      if (flag) {
        this.loading = true;
        this.searchResult = [];
        let params = {port: this.depPortId, type: 1};
        // 离港泊位
        if (o === 1) {
          if (this.outPortInfo.procedureId && this.outPortInfo.navaidId) {
            params.push({procedureId: this.outPortInfo.procedureId, navaidId: this.outPortInfo.navaidId});
          } else if (this.outPortInfo.procedureId && !this.outPortInfo.navaidId) {
            params.push({procedureId: this.outPortInfo.procedureId});
          } else if (!this.outPortInfo.procedureId && this.outPortInfo.navaidId) {
            params.push({navaidId: this.outPortInfo.navaidId});
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
            params.push({berthId: this.outPortInfo.berthId, navaidId: this.outPortInfo.navaidId});
          } else if (this.outPortInfo.berthId && !this.outPortInfo.navaidId) {
            params.push({berthId: this.outPortInfo.berthId});
          } else if (!this.outPortInfo.berthId && this.outPortInfo.navaidId) {
            params.push({navaidId: this.outPortInfo.navaidId});
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
            params.push({berthId: this.outPortInfo.berthId, procedureId: this.outPortInfo.procedureId});
          } else if (this.outPortInfo.berthId && !this.outPortInfo.procedureId) {
            params.push({berthId: this.outPortInfo.berthId});
          } else if (!this.outPortInfo.berthId && this.outPortInfo.procedureId) {
            params.push({procedureId: this.outPortInfo.procedureId});
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
      }
    },
    // 限制搜索进港信息 o---搜索对象
    async querySearchInPortInfo(flag, o) {
      if (flag) {
        this.loading = true;
        this.searchResult = [];
        let params = { port: this.desPortId, type: 2 };
        // 进港泊位
        if (o === 6) {
          if (this.inPortInfo.procedureId && this.inPortInfo.navaidId) {
            params.push({procedureId: this.inPortInfo.procedureId, navaidId: this.inPortInfo.navaidId});
          } else if (this.inPortInfo.procedureId && !this.inPortInfo.navaidId) {
            params.push({procedureId: this.inPortInfo.procedureId});
          } else if (!this.inPortInfo.procedureId && this.inPortInfo.navaidId) {
            params.push({navaidId: this.inPortInfo.navaidId});
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
            params.push({berthId: this.inPortInfo.berthId, navaidId: this.inPortInfo.navaidId});
          } else if (this.inPortInfo.berthId && !this.inPortInfo.navaidId) {
            params.push({berthId: this.inPortInfo.berthId});
          } else if (!this.inPortInfo.berthId && this.inPortInfo.navaidId) {
            params.push({navaidId: this.inPortInfo.navaidId});
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
          if (this.inPortInfo.berthId && this.outPoinPortInfortInfo.procedureId) {
            params.push({berthId: this.inPortInfo.berthId, procedureId: this.inPortInfo.procedureId});
          } else if (this.inPortInfo.berthId && !this.inPortInfo.procedureId) {
            params.push({berthId: this.inPortInfo.berthId});
          } else if (!this.inPortInfo.berthId && this.inPortInfo.procedureId) {
            params.push({procedureId: this.inPortInfo.procedureId});
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
      }
    },
    // 高亮显示鼠标经过的下拉框内的进出港航段
    highlightPortNav(e, type) {
      let ident = e.target.innerText;
      let navigation = this.searchResult.find(nav => nav.ident == ident);
      if (navigation) {
        let highlightPolyline = ConversionArray(navigation.path.split(' '));
        highlightPolyline.forEach(item => item.reverse());
        // console.log(highlightPolyline);
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
        this.$parent.drawHighlightPolyline(highlightPolyline);
      }
    },
    // 定位鼠标经过的下拉框内的航标、泊位
    highlightPoint(e) {
      let ident = e.target.innerText;
      let position = this.searchResult.find(navaid => navaid.ident == ident).location;
      let point = [+position.split(',')[1], +position.split(',')[0]];
      this.$parent.drawHighlightPoint(point);
    },
    // 高亮显示鼠标经过的下拉框内的航道
    highlightChannel(e) {
      let ident = e.target.innerText;
      if (ident != 'DIRECT') {
        this.isExistChannel = true;
        let channel = this.channelList.find(item => item.ident == ident);
        let path = [];
        channel.fixes.sort(function(a, b) {
          return a.order - b.order;
        });
        for (let navaid of channel.fixes) {
          let point = [+navaid.navaid.location.split(',')[1], +navaid.navaid.location.split(',')[0]];
          path.push(point);
        }
        path.strokeColor = BASE_CONSTANTS.colorArray(channel.ident.slice(0, 1));
        this.$parent.drawHighlightChannel(path);
      } else {
        this.isExistChannel = false;
      }
    },
    // 鼠标离开，清除高亮
    clearHighPolyline() {
      this.$parent.drawHighlightPolyline([]);
    },
    clearHighPoint() {
      this.$parent.drawHighlightPoint([]);
    },
    clearHighChannel() {
      if (this.isExistChannel) {
        this.$parent.drawHighlightChannel([]);
      }
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
      this.$parent.highlightNavigation = null;
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
    getPointLatLng(point) {
      let pointString = [point.position[1], point.position[0]].toString();
      this.navigationInfo[this.pickupCoordIndex][1] = pointString;
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
    // 提交航线---更新
    async submit() {
      this.trimNavInfo();
      if (this.isFull) {
        this.addRouteForm.id = this.routeInfo.id;
        this.addRouteForm.name = this.routeInfo.name;
        this.addRouteForm.departure = this.depPortId;
        this.addRouteForm.destination = this.desPortId;
        this.addRouteForm.segments = this.navString;
        const res = await this.$http.post(`/api/route/update`, this.addRouteForm);
        if (!res.errorCode) {
          this.$message.success('更新成功!');
        } else {
          this.$alert(res.technicalInformation || res.message);
          // console.log(res);
        }
        this.initCSS();
      }
    },
    // 取消更新
    async cancel() {
      this.initCSS();
      this.initPortInfo(true, true);
      await this.getNavigationInfo();
      await this.getRoutePortId();
    },
    // 提交航线---新增
    async submitNew() {
      this.$refs.addFormRef.validate(async val => {
        if (val) {
          this.trimNavInfo();
          if (this.isFull) {
            this.addRouteForm.departure = this.depPortId;
            this.addRouteForm.destination = this.desPortId;
            this.addRouteForm.segments = this.navString;
            const { data: res } = await this.$http.post(`/api/route/add`, this.addRouteForm);
            if (!res.errorCode) {
              this.$message.success('上传成功!');
              this.initCSS();
              this.$parent.routeQuery.page = 1;
              this.$parent.getPlanRouteDate();
            }
          } else {
            this.$message.warning('航段信息不完整!');
          }
        }
      });
    },
    // 取消新增
    async cancelNew() {
      this.initCSS();
      this.initPortInfo(true, true);
      let oldRow = JSON.parse(localStorage.getItem('oldRouteInfo'));
      if (oldRow.id) {
        this.$parent.changeRow(oldRow);
      }
    },
  },
  watch: {
    routeInfo: {
      async handler(newVal, oldVal) {
        // 切换航线
        if (newVal.id && newVal.id !== oldVal.id) {
          console.log('切换航线')
          this.initCSS();
          this.initOutInPortWithInfo(true, true);
          this.initPortInfo(true, true);
          await this.getNavigationInfo();
          await this.getRoutePortId();
          this.isShowOutPortPopover = false;
          this.isShowInPortPopover = false;
        }
        // 新增航线
        if (!this.routeInfo.id) {
          console.log('新增航线')
          this.isShowOutPortPopover = false;
          this.isShowInPortPopover = false;
          this.currentRowIndex = null;
          this.navigationInfo = [];
          this.navString = [];
          this.initOutInPortWithInfo(true, true);
          this.initPortInfo(true, true);
        }
      },
      deep: true,
    },
    $route() {
      this.isShowOutPortPopover = false;
      this.isShowInPortPopover = false;
    },
  },
  created() {
    this.getNavigationInfo();
    this.getRoutePortId();
  },
};
</script>

<style lang="less" scoped>
.routePanel {
  width: 396px;
  font-size: 13px !important;
  text-align: center;
  .el-input {
    width: 100px;
    /deep/ .el-input__inner {
      padding: 0;
    }
  }
  /deep/ .el-input--small .el-input__inner  {
    height: 26px;
  }
  /deep/ .keyword-search-area {
    width: 92px;
    display: inline-block;
    .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin-bottom: 0;
    }
    .el-input {
      padding: 0;
      .el-input__suffix {
        right: 0;
      }
      /deep/ .el-input__inner {
        padding: 0;
      }
    }
  }
}
.el-header {
  padding: 0;
  height: 35px !important;
  color: rgb(55, 85, 85);
}
@keyframes clickRow {
  from {
    transform: scale3d(0.95, 0.95, 0.95);
  }
  to {
    transform: scale3d(1, 1, 1);
  }
}
.el-main {
  padding: 0;
  max-height: 350px;
}
.in-out-nav {
  margin-left: 0;
  width: 200px;
  line-height: 30px;
  box-sizing: border-box;
  .el-row {
    margin: 8px 0 8px 0;
  }
  .close-popover {
    position: absolute;
    right: 0;
    top: 0;
    background: #fff;
    .el-icon-close {
      color: #ccc;
      font-size: 20px;
      &:hover {
        color: red;
        cursor: pointer;
      }
    }
  }
}
.navigation-query-part .el-row {
  position: relative;
  margin-bottom: 5px;
  background: #fff;
  line-height: 30px;
  cursor: pointer;
  border: 1px solid rgb(195, 212, 212);
  &:hover {
    background: #aad4ff;
  }
  i {
    font-size: 20px;
    vertical-align: middle;
    color: rgb(158, 153, 153);
  }
  .el-icon-circle-plus-outline {
    color: #409eff;
  }
  .el-icon-map-location {
    margin-left: -30px;
    background: #fff;
  }
  .el-icon-remove-outline {
    color: red;
    margin-left: 2px;
  }
  .el-icon-warning {
    color: rgb(204, 95, 95);
    font-size: 16px;
    padding-bottom: 3px;
  }
  .el-col-warning {
    font-size: 14px;
    color: rgb(204, 95, 95);
  }
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.navigation-dep-des,
.navigation-via-to {
  margin-bottom: 5px;
  font-weight: 600;
  line-height: 35px;
  .el-icon-circle-plus-outline {
    color: #409eff;
    font-size: 16px;
    vertical-align: middle;
    cursor: pointer;
  }
  .el-button--mini,
  .el-button--mini.is-round {
    padding: 0 !important;
  }
}
.navigation-via-to {
  margin: 0 auto;
  line-height: 30px;
  border: 1px solid rgb(195, 212, 212);
  background: #fff;
}
.navigation-dep-des {
  font-size: 14px;
  font-weight: normal;
}
.myholder {
  display: block;
  color: #ccc;
  margin-top: 10px;
  margin-bottom: 10px;
  .el-icon-circle-plus-outline {
    margin-left: 20px;
    font-size: 20px;
    color: rgb(66, 167, 66);
    vertical-align: bottom;
    &:hover {
      cursor: pointer;
    }
  }
}
/deep/ .current-row {
  background: #aad4ff !important;
}
.pickup-status {
  font-weight: 700;
  color: #409eff !important;
}
/deep/ .el-input__suffix {
  right: -3px;
}
/deep/ .el-input__inner {
  padding: 0 2px;
  font-size: 12px;
  text-align: center;
}
.el-footer {
  padding-top: 5px;
  height: 40px !important;
}
</style>
