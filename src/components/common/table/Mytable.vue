<template>
  <div class="table">
    <!-- 表格开始 -->
    <el-table
      ref="table"
      style="width: 100%"
      stripe
      fit
      v-loading="tableLoading"
      :data="tableData"
      :border="border"
      :show-header="showHeader"
      :size="tableSize"
      :highlight-current-row="highlightCurrentRow"
      :max-height="maxHeight"
      @sort-change="handleSortChange"
      @cell-click="handleCellClick"
      @row-click="handleRowClick"
      @selection-change="handleSelectionChange"
    >
      <!-- 多选项 -->
      <el-table-column v-if="selectionOption.selection" v-bind="selectionOption"> </el-table-column>
      <!-- 序号项 -->
      <el-table-column type="index" label="序号" align="center" v-if="tableIndex" />
      <!-- 普通项 -->
      <el-table-column
        show-overflow-tooltip
        v-for="(item, index) in tableColumn"
        :key="index"
        v-bind="item"
        :prop="item.prop"
        :align="item.align || 'center'"
        :width="item.width || ''"
      >
        <!-- 作用域插槽 -->
        <template slot-scope="scope">
          <span v-if="item.render">
            {{ item.render(scope.row[item.prop], scope.row) }}
          </span>
          <span v-else-if="item.tag">
            <template v-for="tag in ROLE">
              <el-tag v-if="scope.row[item.prop] === tag.value" :type="tag.type" :key="tag.value">{{
                tag.label
              }}</el-tag>
            </template>
          </span>

          <span
            v-else-if="item.switch"
            @click="handleSwitchChange(scope.row[item.prop], scope.row, scope.$index)"
          >
            <el-switch
              :width="item.width || 36"
              v-model="scope.row[item.prop]"
              active-color="#13ce66"
              inactive-color="#ff4949"
            >
            </el-switch>
          </span>
          <span v-else>{{ scope.row[item.prop] }}</span>
        </template>
      </el-table-column>

      <!-- 操作项 -->
      <el-table-column
        v-if="tableOption.label"
        :label="tableOption.label"
        :align="tableOption.align || 'center'"
        :width="tableOption.width && tableOption.width"
      >
        <template slot-scope="scope">
          <template v-for="(item, index) in tableOption.options">
            <el-dropdown
              v-if="item.dropdown"
              :key="index"
              :size="item.size || 'small'"
              @command="handleCommand"
              placement="bottom-start"
              @visible-change="visibleChange(scope.row)"
              style="margin-right: 10px"
            >
              <el-button type="primary" size="mini">
                {{ item.label }}
                <i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <template v-for="(val, i) in item.items">
                  <template v-if="scope.row.runtimeInfo && scope.row.runtimeInfo.state !== 0">
                    <el-dropdown-item :command="val.command" :key="i">
                      {{ val.label }}
                    </el-dropdown-item>
                  </template>
                  <template v-else-if="val.state !== 0">
                    <el-dropdown-item :command="val.command" :key="i">
                      {{ val.label }}
                    </el-dropdown-item>
                  </template>
                </template>
              </el-dropdown-menu>
            </el-dropdown>
            <el-tooltip
              v-else-if="item.tooltip"
              effect="light"
              placement="right"
              :key="index"
              :size="item.size || 'small'"
              :content="item.content"
            >
              <i
                :class="item.iconClass"
                @click="iconClick($event, item.methods, scope.row, scope.$index)"
              >
              </i>
            </el-tooltip>
            <el-button
              v-else
              :key="index"
              :type="item.type"
              :icon="item.icon"
              :size="item.size || 'mini'"
              @click="handleButton($event, item.methods, scope.row, scope.$index)"
            >
              {{ item.label }}
            </el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>
    <!-- 表格结束 -->

    <!-- 翻页器 -->
    <el-pagination
      v-if="total"
      small
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="paginationOptions.page"
      :page-size="paginationOptions.size"
      :page-sizes="PAGE_SIZE.page_sizes"
      :total="total"
      :background="background"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 25px"
    />
  </div>
</template>

<script>
import { PAGE_SIZE, ROLE } from '@/config';
export default {
  data() {
    return { ROLE, PAGE_SIZE: Object.freeze(PAGE_SIZE) };
  },
  props: {
    // 表格线
    border: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    // 序号
    tableIndex: {
      type: Boolean,
      default: true
    },
    tableSize: {
      type: String,
      default: 'small'
    },
    maxHeight: {
      type: String,
      default: '500'
    },
    // 高亮显示当前行
    highlightCurrentRow: {
      type: Boolean,
      default: false
    },
    // 预加载loading
    tableLoading: {
      type: Boolean,
      default: false
    },
    // 表格数据
    tableData: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 表头配置
    tableColumn: {
      type: Array,
      default: () => {
        return [];
      }
    },
    // 表头操作列的配置
    tableOption: {
      type: Object,
      default: () => {
        return {};
      }
    },
    //复选框配置
    selectionOption: {
      type: Object,
      default: () => {
        return {};
      }
    },

    //******翻页器pagination配置******
    paginationOptions: {
      type: Object,
      default: () => {
        return {
          size: PAGE_SIZE.size,
          page: PAGE_SIZE.page
        };
      }
    },
    total: {
      type: Number,
      default: 0
    },
    background: {
      type: Boolean,
      default: true
    }
  },

  methods: {
    // 切换当前一页展示多少条事件
    handleSizeChange(val) {
      this.$emit('sizeChange', val);
    },
    // 翻页事件
    handleCurrentChange(val) {
      this.$emit('pageChange', val);
    },
    // 按钮点击事件
    // methods方法名 row当前点击列数据 index当前点击的index
    handleButton(event, methods, row, index) {
      this.$emit('buttonClick', { event, methods: methods, row: row, index: index });
    },
    // icon图标点击事件
    iconClick(event, methods, row, index) {
      this.$emit('iconClick', { event, methods, row, index });
    },
    // 当表格的排序条件发生变化的时候会触发该事件	{ column, prop, order }
    handleSortChange(column, prop, order) {
      this.$emit('sortChange', column, prop, order);
    },
    //当表格的当某个单元格被点击时会触发该事件
    handleCellClick(row, column, cell, event) {
      this.$emit('cellClick', row, column, cell, event);
    },
    //当表格的当某一行被点击时会触发该事件
    handleRowClick(row, column, event) {
      this.$emit('rowClick', row, column, event);
    },
    //当表格选择项发生变化时会触发该事件
    handleSelectionChange(selection) {
      this.$emit('selectionChange', selection);
    },
    // 下拉框选择事件
    handleCommand(command) {
      this.$emit('dropdownChange', command);
    },
    //下拉框出现/隐藏时触发
    visibleChange(row) {
      this.$emit('dropdownShow', row);
    },
    // switch按钮改变触发
    handleSwitchChange(newValue, row, index) {
      this.$emit('handleSwitchChange', newValue, row, index);
    }
  }
};
</script>
<style lang="less" scoped>
.el-table {
  margin: 10px 0;
  & td,
  & th {
    text-align: center;
  }
}
.el-pagination {
  text-align: right;
}
</style>
