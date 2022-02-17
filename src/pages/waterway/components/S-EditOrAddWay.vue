<template>
  <div class="shadow content">
    <!-- 新增航道标识 -->
    <div class="content-top" v-if="$parent.wayAddData.isClick">
      <el-input
        v-model="$parent.wayAddData.ident"
        ref="addInput"
        placeholder="输入新增航道名称"
        size="mini"
        style="width: 200px"
        @blur="verifyAddWayIdent($parent.wayAddData.ident)"
      />
      <div
        class="input-verify"
        v-show="$parent.wayAddData.isClick && $parent.wayAddData.isShowTips"
      >
        首字母大写并跟随1-3个数字
      </div>
    </div>

    <div class="auto-plan-content">
      <!-- 自动规划起始点 -->
      <div class="auto-plan-box" v-if="isAutoPlan">
        <!-- 起点 -->
        <div class="add-auto">
          <span>起点：</span>
          <div
            :class="{ 'text-content': !autoPlanData.startNava.ident }"
            style="margin-right: 10px"
          >
            {{ autoPlanData.startNava.ident }}
          </div>
          <i
            class="el-icon-close auto-plan-close"
            @click="handleCloseAutoData('start', autoPlanData.startNava)"
          ></i>
        </div>
        <!-- 终点 -->
        <div class="add-auto">
          <span>终点：</span>
          <div :class="{ 'text-content': !autoPlanData.endNava.ident }" style="margin-right: 10px">
            {{ autoPlanData.endNava.ident }}
          </div>
          <i
            class="el-icon-close auto-plan-close"
            @click="handleCloseAutoData('end', autoPlanData.endNava)"
          ></i>
        </div>
        <span>
          <el-button type="primary" size="mini" @click="handleAutoPlanOk" :loading="loading"
            >确定规划</el-button
          >
          <el-button size="mini" @click="handleCancelAuto">关闭自动</el-button>
        </span>
      </div>
      <el-button type="primary" size="mini" class="open-auto-btn" v-else @click="handleOpenAutoPlan"
        >开启自动规划</el-button
      >
    </div>

    <!-- 规划路径 -->
    <div style="min-height: 6vh">
      <div v-if="currentWay && currentWay.fixes" class="waterway-box">
        <!-- 规划起点光标 -->
        <div
          @click="handleCursorInsert(-1)"
          class="first-nava"
          v-if="currentWay.fixes.length"
        ></div>
        <span id="cursor-2" v-if="cursorInsertIndex === -1 && currentWay.fixes.length"></span>
        <div v-for="(nava, index) in currentWay.fixes" :key="nava.id" class="nava-box">
          <!-- 方向标 -->
          <span
            class="arrows"
            @click="handleCursorInsert(index, 'arrows')"
            v-if="isShowArrows(nava, index)"
          >
            →
          </span>
          <!-- 两点不能连接的时候用分割 -->
          <span
            class="arrows"
            @click="handleCursorInsert(index, 'arrows')"
            v-else
            style="color: red"
          >
            ≠≠
          </span>
          <!-- 信息 -->
          <div class="nava-item shadow">
            <span
              @click="handleCurrentClick(nava, index)"
              class="nava-item-ident"
              :class="{
                'light-nava':
                  ($parent.currentNava && $parent.currentNava.id === nava.navaidId) ||
                  autoPlanData.selectWaterwayId.includes(nava.navaidId)
              }"
              >{{ nava.navaid.ident }}</span
            >
            <!-- 删除框 -->
            <el-popover trigger="hover" placement="top" v-show="currentWay.fixes.length !== 1">
              <el-button
                size="mini"
                type="danger"
                @click="handleBeforeDelete(nava, index, 'prev')"
                v-show="index !== 0"
                >删除前面</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="handleAfterDelete(nava, index, 'next')"
                v-show="index !== currentWay.fixes.length - 1"
                >删除后面</el-button
              >
              <!-- 删除当前 -->
              <div class="delete-nava" slot="reference" @click="handleCurrentDelete(nava, index)">
                <i class="el-icon-close"></i>
              </div>
            </el-popover>
            <!-- 长度1时,解决不能显示el-popover问题 -->
            <div
              class="delete-nava"
              v-if="currentWay.fixes.length === 1"
              @click="handleCurrentDelete(nava, index)"
            >
              <i class="el-icon-close"></i>
            </div>
          </div>
          <!-- 光标 -->
          <span id="cursor-1" v-show="cursorInsertIndex === index"></span>
        </div>
        <!-- 规划终点光标 -->
        <span
          class="arrows"
          @click="handleCursorInsert(currentWay.fixes.length - 1)"
          v-if="currentWay.fixes.length"
        >
          →
        </span>
        <div
          class="first-nava"
          @click="handleCursorInsert(currentWay.fixes.length - 1)"
          v-if="currentWay.fixes.length"
        ></div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="btn-box">
      <el-button size="mini" @click="handleBoxClose">取消</el-button>
      <el-button type="primary" size="mini" @click="handleEdit" :loading="loading">保存</el-button>
    </div>
  </div>
</template>

<script>
import * as wayApi from 'api/waterway';
import { turnLngLat, turnLngLatObj, str2Path } from '@/utils/handleLngLat';

export default {
  name: 'S-EditOrAddWay',
  data() {
    return {
      cursorInsertIndex: 0, // 默认航标插入的位置
      loading: false,
      autoPlanData: {
        isStart: false,
        // 起点航标数据
        startNava: {},
        isEnd: false,
        // 终点航标数据
        endNava: {},
        // 自动规划中已选中的航标ID
        selectWaterwayId: []
      }
    };
  },
  props: {
    currentWay: {
      type: Object,
      default: () => {}
    },
    isAutoPlan: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'way'
    }
  },
  methods: {
    // 验证新增航道的名称
    verifyAddWayIdent(val) {
      const addInput = this.$refs.addInput.$refs.input;
      const reg = /^[A-Z]\d{1,3}$/;
      if (!reg.test(val)) {
        addInput.style.borderColor = 'red';
        this.$parent.wayAddData.isShowTips = true;
        return;
      }
      addInput.style.borderColor = '';
      this.$parent.wayAddData.isShowTips = false;
    },
    /**
     * 清空自动规划中 起点 终点
     */
    handleCloseAutoData(type, nava) {
      const autoPlanData = this.autoPlanData;
      let resNava = this.currentWay.fixes.find((item) => item.navaidId === nava.id);
      if (type === 'start') {
        (autoPlanData.startNava = {}), (autoPlanData.isStart = false);
        autoPlanData.selectWaterwayId = autoPlanData.selectWaterwayId.filter(
          (iid) => iid !== resNava.navaidId
        );
      } else {
        (autoPlanData.endNava = {}), (autoPlanData.isEnd = false);
        // autoPlanData.selectWaterwayId.splice(1, 1);
        autoPlanData.selectWaterwayId = autoPlanData.selectWaterwayId.filter(
          (iid) => iid !== resNava.navaidId
        );
      }
    },
    /**
     * 自动规划保存,网络请求
     */
    handleAutoPlanOk() {
      const autoPlanData = this.autoPlanData;
      let startDataId = autoPlanData.startNava.id,
        endDataId = autoPlanData.endNava.id;
      if (!autoPlanData.isStart) {
        this.$message.warning('请选择起点航标');
      } else if (!autoPlanData.isEnd) {
        this.$message.warning('请选择终点航标');
      } else {
        if (startDataId === endDataId) {
          this.$message.warning('不能选择同一航标进行自动规划');
          return;
        }
        //  自动规划航道-网络请求
        this.$emit('autoPlanRequest', startDataId, endDataId);
      }
    },
    /**
     * 点击自动规划按钮
     */
    handleOpenAutoPlan() {
      const parent = this.$parent;
      parent.wayAddData.plan = 0;
      parent.currentNava = null;
      this.cursorInsertIndex = this.currentWay.fixes.length - 1;

      this.$message.info('规划时请先选择起点，并按航道的方向进行规划');
    },
    /**
     * 点击取消自动规划按钮
     */
    handleCancelAuto() {
      const parent = this.$parent;
      parent.wayAddData.plan = 1;
      this.autoPlanData = {
        isStart: false,
        // 起点航标数据
        startNava: {},
        isEnd: false,
        // 终点航标数据
        endNava: {},
        // 自动规划中已选中的航标ID
        selectWaterwayId: []
      };
      if (!parent.wayAddData.isClick) {
        parent.currentNava = this.currentWay.fixes[this.currentWay.fixes.length - 1].navaid;
      }
    },
    /**
     * 点击取消按钮
     */
    handleBoxClose() {
      this.$emit('handleWayCancel', this.currentWay);
    },
    /**
     * 点击保存按钮
     */
    handleEdit() {
      this.$emit('handleWaySave', this.currentWay);
    },
    /**
     * 点击当前航标
     */
    handleCurrentClick(nava, index) {
      this.$emit('handleNavaClick', nava, index);
    },
    /**
     * 航标之间插入光标的位置
     */
    handleCursorInsert(index, arrows) {
      const parent = this.$parent;
      this.cursorInsertIndex = arrows ? index - 1 : index;
      if (!this.isAutoPlan) {
        if (index === 0 || index === -1) {
          parent.currentNava = this.currentWay.fixes[0].navaid;
          return;
        }
        if (index === this.currentWay.fixes.length - 1) {
          parent.currentNava = this.currentWay.fixes[index].navaid;
          return;
        }
        parent.currentNava = this.currentWay.fixes[index - 1].navaid;
      }
    },
    /**
     * 删除航道操作栏中当前的航标
     */
    handleCurrentDelete(nava, index) {
      this.$emit('handleDelCurrentWayDialog', nava, index, this.type);
    },
    /**
     * 删除航道操作栏中后面所有航标
     */
    handleAfterDelete(nava, index, type) {
      this.$emit('handleDelWayPrevOrNext', index, type, nava);
    },
    /**
     * 删除航道操作栏中前面所有航标
     */
    handleBeforeDelete(nava, index, type) {
      this.$emit('handleDelWayPrevOrNext', index, type, nava);
    },
    /**
     * 判断是否显示箭头(计算属性不适用,只能函数方法)
     */
    isShowArrows(val, index) {
      const arr = this.currentWay.fixes;
      if (index > 0) {
        return (
          arr[index - 1].navaid.radius >=
          this.$parent.getDistance(arr[index - 1].navaid, val.navaid)
        );
      } else {
        return true;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  box-sizing: border-box;
  position: absolute;
  bottom: -10px;
  left: 0px;
  right: 0px;
  z-index: 99;
  background: rgba(250, 250, 250, 0.9);
  padding: 20px;
  .content-top {
    position: absolute;
    z-index: 88;
    .input-verify {
      color: red;
      font-size: 12px;
    }
  }
  .auto-plan-content {
    position: relative;
    text-align: right;
    .open-auto-btn {
      // position: absolute;
      right: 10px;
    }
    .auto-plan-box {
      display: inline-flex;
      align-items: center;
      line-height: 1.5;
      .add-auto {
        display: flex;
        margin-right: 15px;
        .text-content {
          width: 2.8vw;
          height: 19px;
          border-bottom: 1px solid #333;
          box-sizing: border-box;
        }
        .auto-plan-close {
          font-size: 17px;
          cursor: pointer;
        }
      }
    }
  }
  .waterway-box {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    // justify-content: space-evenly;
    min-height: 6vh;
    padding: 30px 0 15px 0;
    overflow-x: auto;
    .first-nava {
      padding: 14px;
      margin-right: 15px;
      border-radius: 50%;
      background: #409eff;
      cursor: pointer;
    }
    .arrows {
      font-weight: bold !important;
      padding: 0 10px 0 20px;
      // color: #409eff;
      cursor: pointer;
    }
    .nava-box {
      display: flex;
      .nava-item {
        display: flex;
        align-items: center;
        position: relative;
        font-size: 15px;
        margin-right: 10px;
        cursor: pointer;
        color: #fff;
        .nava-item-ident {
          padding: 2px;
          border-radius: 3px;
          background: #409eff;
        }
      }
      .delete-nava {
        position: absolute;
        top: -24px;
        right: -2px;
        font-size: 17px;
        z-index: 2;
        color: #000;
        cursor: pointer;
      }
      // 光标动画
      @keyframes blink {
        0%,
        100% {
          background-color: rgba(0, 0, 0, 0.9);
        }
        50% {
          background-color: transparent;
        }
      }
    }
  }
  .btn-box {
    text-align: center;
  }
  .light-nava {
    background: #ffa35c !important;
    z-index: 999 !important;
    color: #000;
    border: 1px solid #000;
  }
}
// 光标
#cursor-2,
#cursor-1 {
  position: relative;
  z-index: 110;
  height: 22px;
}
#cursor-2::after {
  position: absolute;
  content: '';
  display: inline-block;
  width: 2px;
  height: 22px;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  animation: blink 1.2s infinite steps(1, start);
}
#cursor-1::after {
  position: absolute;
  content: '';
  display: inline-block;
  width: 2px;
  height: 22px;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  animation: blink 1.2s infinite steps(1, start);
}
</style>
