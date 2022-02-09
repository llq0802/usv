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
                  @mouseleave.native="clearHighPolyline"
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
    <!-- 提交上传 -->
    <el-footer>
      <el-button v-if="routeInfo.id" type="primary" @click="submit">更新</el-button>
      <el-button v-if="routeInfo.id" type="danger" @click="cancel">取消</el-button>
      <el-button v-if="!routeInfo.id" type="primary" @click="submitNew">上传</el-button>
      <el-button v-if="!routeInfo.id" type="danger" @click="cancelNew">取消</el-button>
    </el-footer>
  </div>
</template>

<script>
import { str2Path } from '@/utils/handleLngLat';
// api
import { apiGetWaysByIdent, apiGetWayByQuery } from 'api/waterway';
import {
  apiAddRoute, apiGetRouteString, apiPostValidRoute, apiPostParsePath, apiPostParseRouteStr, apiPostUpdateRoute
} from 'api/route';
import {
  apiGetBerthById, apiGetPortByIdent, apiGetTransition, apiGetTransitionNavaids
} from 'api/port';
import { apiGetNavaByQuery, apiGetNavidsByIdent } from 'api/nava';
// 组件
import KeywordSearch from 'components/common/keyword-search/KeywordSearch';
// 混入
import detail from '../mixins/detail';
export default {
  props: {
    routeInfo: Object,
  },
  mixins: [detail],
  components: {
    KeywordSearch
  },
  data() {
    return {
      // 港口id
      depPortId: null,
      desPortId: null,
      channelList: []
    }
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
    
    // 提交航线---更新
    async submit() {
      this.trimNavInfo();
      if (this.isFull) {
        this.addRouteForm.id = this.routeInfo.id;
        this.addRouteForm.name = this.routeInfo.name;
        this.addRouteForm.departure = this.depPortId;
        this.addRouteForm.destination = this.desPortId;
        this.addRouteForm.segments = this.navString;
        const res = await apiPostUpdateRoute(this.addRouteForm);
        if (!res.errorCode) {
          this.$message.success('更新成功!');
        }
        this.initCSS();
      }
    },
    // 取消更新
    async cancel() {
      this.initCSS();
      await this.getNavigationInfo();
      this.getRoutePortId();
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
            const res = await apiAddRoute(this.addRouteForm);
            if (!res.errorCode) {
              this.$message.success('上传成功!');
              this.initCSS();
            }
          } else {
            this.$message.warning('航段信息不完整!');
          }
        }
      });
    },
    // 取消新增
    cancelNew() {
      this.initCSS();
    },
  },
  watch: {
    routeInfo: {
      async handler(newVal, oldVal) {
        // 切换航线
        if (newVal.id && newVal.id !== oldVal.id) {
          this.depPortId = newVal.departureId;
          this.destinationId = newVal.destinationId;

          this.initCSS();
          this.initOutInPortWithInfo(true, true);
          await this.getNavigationInfo();
          this.getRoutePortId();
          this.isShowOutPortPopover = false;
          this.isShowInPortPopover = false;
        }
        // 新增航线
        if (!this.routeInfo.id) {
          this.isShowOutPortPopover = false;
          this.isShowInPortPopover = false;
          this.currentRowIndex = null;
          this.navigationInfo = [];
          this.navString = [];
          this.initOutInPortWithInfo(true, true);
        }
      },
      deep: true,
    },
  },
  created() {
    this.getNavigationInfo();
    this.getRoutePortId();
  }
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
    span {
      font-size: 12px;
    }
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
