<template>
    <div class="table">
        <!-- 表格开始 -->
        <el-table
            ref="table"
            v-loading="loading"
            element-loading-text="加载中..."
            :data="tableData"
            :border="border"
            stripe
            fit
            style="width: 100%"
            @sort-change="handleSortChange"
            @cell-click="handleCellClick"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <!-- 多选项 -->
            <el-table-column v-if="selectionOption.selection" v-bind="selectionOption"> </el-table-column>

            <!-- 普通项 -->
            <el-table-column v-for="(item, index) in tableColumn" :key="index" v-bind="item">
                <!-- 因为有些参数需要判定比如性别所以判断一下 -->
                <template slot-scope="scope">
                    <span v-if="item.render">
                        {{ item.render(scope.row[item.prop], scope.row) }}
                    </span>
                    <span v-else>{{ scope.row[item.prop] }}</span>
                </template>
            </el-table-column>
            <!-- 操作项 -->
            <el-table-column
                v-if="tableOption.label"
                :label="tableOption.label"
                :align="tableOption.align || 'center'"
                class-name="small-padding fixed-width"
            >
                <template slot-scope="scope">
                    <el-button
                        v-for="(item, index) in tableOption.options"
                        :key="index"
                        :type="item.type"
                        :icon="item.icon"
                        :size="item.size || 'mini'"
                        @click="handleButton(item.methods, scope.row, scope.$index)"
                    >
                        {{ item.label }}
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 表格结束 -->
        <!-- 翻页 -->
        <el-pagination
            v-if="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="page"
            :page-size="size"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            style="margin-top: 20px"
        />
    </div>
</template>

<script>
import { PAGE_SIZE } from '@/config';
export default {
    props: {
        // 表格线
        border: {
            type: Boolean,
            default: true
        },
        // 预加载loading
        loading: {
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
        selectionOption: {
            type: Object,
            default: () => {
                return {};
            }
        },

        //******翻页器pagination配置******

        //当前页
        page: {
            // 当前页
            type: Number,
            default: () => {
                return PAGE_SIZE.page;
            }
        },
        // 当前页展示的条数
        size: {
            type: Number,
            default: () => {
                return PAGE_SIZE.size;
            }
        },
        // 总页数
        total: {
            type: Number,
            default: () => {
                return 0;
            }
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
        handleButton(methods, row, index) {
            this.$emit('buttonClick', { methods: methods, row: row, index: index });
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
        }
    }
};
</script>

<style lang="less" scoped>
/* .table {
    margin-top: 10px;
} */
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