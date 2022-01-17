<template>
    <div class="user-content">
        <base-table :tableData="tableData" :tableColumn="tableColumn" :tableOption="tableOption" />
    </div>
</template>

<script>
import * as userApi from '@/api/user';
import { PAGE_SIZE, ROLE } from '@/config';

import BaseTable from '@/components/common/table/Mytable.vue';
export default {
    name: 'user',
    components: {
        BaseTable
    },
    data() {
        return {
            userParams: {
                Page: PAGE_SIZE.page,
                Size: PAGE_SIZE.size,
                'Condition.Keyword': ''
            },
            total: 0,
            tableData: [],

            tableColumn: Object.freeze([
                {
                    prop: 'id',
                    label: '标识id'
                },
                { prop: 'userName', label: '用户名' },
                {
                    prop: 'organization'
                },
                {
                    prop: 'organizationId'
                },
                {
                    prop: 'role',
                    label: '角色',
                    render: (val) => {
                        return ROLE[val];
                    }
                }
            ]),

            tableOption: Object.freeze({
                label: '操作',
                options: [
                    {
                        label: '编辑'
                    }
                ]
            })
        };
    },
    mounted() {
        this.getUserList();
    },

    methods: {
        async getUserList() {
            const params = this.userParams;
            let { data } = await userApi.apiGetUserByQuery(params);
            if (data.result.length) {
                this.tableData = data.result;
                this.total = data.total;
            }
        }
    }
};
</script>

<style scoped lang='less'>
.user-content {
}
</style>
