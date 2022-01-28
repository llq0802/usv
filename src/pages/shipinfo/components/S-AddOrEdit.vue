<template>
  <el-dialog
    :title="this.title === 'add' ? '添加无人船' : '修改无人船'"
    :visible.sync="isShow"
    width="33%"
    center
    :before-close="cancalClick"
    @open="openDialog"
  >
    <el-form ref="form" label-width="110px" :rules="rules" :model="form">
      <el-form-item label="序列号" prop="serialNumber">
        <el-input v-model="form.serialNumber" placeholder="请输入无人船序列号"></el-input>
      </el-form-item>
      <el-form-item label="无人船名称" prop="displayName">
        <el-input v-model="form.displayName" placeholder="请输入无人船名称"></el-input>
      </el-form-item>
      <el-form-item label="所属机构" prop="organizationId">
        <el-select placeholder="请选择所属机构" v-model="form.organizationId" clearable>
          <el-option
            v-for="item in organInfoList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="摄像机序列号" prop="cameraSN">
        <el-input v-model="form.cameraSN" placeholder="请输入摄像机序列号"></el-input>
      </el-form-item>
      <el-form-item label="摄像机验证码" prop="cameraValidationCode">
        <el-input v-model="form.cameraValidationCode" placeholder="请输入摄像机验证码"></el-input>
      </el-form-item>
      <el-form-item label="最低电压(V)" prop="minimumBatteryVoltage">
        <el-input v-model="form.minimumBatteryVoltage" placeholder="请输入最低电压(V)"></el-input>
      </el-form-item>
      <el-form-item label="最高电压(V)" prop="maximumBatteryVoltage">
        <el-input v-model="form.maximumBatteryVoltage" placeholder="请输入最高电压(V)"></el-input>
      </el-form-item>
    </el-form>
    <!-- 底部开始 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="cancalClick">取 消</el-button>
      <el-button type="primary" @click="handleClick" :loading="loading">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { deepClone } from '@/utils';
import * as shipApi from 'api/shipinfo';
export default {
  props: {
    isShow: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'edit' //'edit','add'
    },
    organInfoList: {
      type: Array,
      default: () => []
    },
    currentRow: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    // 电压是否10-30
    let checkVoltage = (rule, value, cb) => {
      //验证输入的电量范围
      const regVoltage = /^([12][0-9]|30)$/;
      if (regVoltage.test(value)) {
        return cb();
      }
      cb(new Error('请输入10-30的数值'));
    };

    return {
      loading: false,
      // 新增数据表单数据
      form: {
        serialNumber: '',
        displayName: '',
        cameraSN: '',
        organizationId: null,
        cameraValidationCode: '',
        minimumBatteryVoltage: '',
        maximumBatteryVoltage: ''
      },
      // 添加验证规则
      rules: Object.freeze({
        serialNumber: [{ required: true, message: '请输入无人船序列号', trigger: 'blur' }],
        displayName: [{ required: true, message: '请输入无人船名称', trigger: 'blur' }],
        cameraSN: [{ required: true, message: '请输入摄像机序列号', trigger: 'blur' }],
        organizationId: [{ required: true, message: '请选择组织机构', trigger: 'change' }],
        cameraValidationCode: [
          { required: true, message: '请输入摄像机验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '摄像机验证码长度为6', trigger: ['blur', 'change'] }
        ],
        minimumBatteryVoltage: [
          { required: true, message: '请输入最低电压值10-30V', trigger: 'blur' },
          {
            validator: checkVoltage,
            trigger: ['blur', 'change']
          }
        ],
        maximumBatteryVoltage: [
          { required: true, message: '请输入最高电压值10-30V', trigger: 'blur' },
          {
            validator: checkVoltage,
            trigger: ['blur', 'change']
          }
        ]
      })
    };
  },
  methods: {
    /**
     * 组件打开的回调
     */
    openDialog() {
      if (this.title === 'add') {
        this.$nextTick(() => {
          this.$refs.form.resetFields();
        });
      } else {
        this.$nextTick(() => {
          this.$refs.form.clearValidate();
          this.form = deepClone(this.currentRow);
        });
      }
    },
    /**
     *确定添加或者修改
     */
    async handleClick() {
      this.loading = true;
      if (this.title === 'add') {
        await shipApi.apiAddShip(this.form);
        this.$message.success('添加成功');
      } else {
        await shipApi.apiEditShip(this.form);
        this.$message.success('修改成功');
      }
      this.cancalClick();
      this.loading = false;
      this.$parent.getShipList();
    },

    /**
     * 取消
     */
    cancalClick() {
      this.$emit('update:isShow');
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .el-select {
  width: 100%;
}
</style>
