<template>
  <div>
    <div class="text-style" @click.stop="handleCurrentClick">
      {{ value.ident + BASE_CONSTANTS.procedureType(value.type) }}
    </div>
  </div>
</template>

<script>
import { BASE_CONSTANTS } from '@/config';

export default {
  name: 's-proceduremarker',
  data() {
    return {
      BASE_CONSTANTS: Object.freeze(BASE_CONSTANTS)
    };
  },
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: 'procedure'
    }
  },
  methods: {
    handleCurrentClick() {
      this.$emit('handleCurrentClick', this.type, this.value);
    }
  }
};
</script>

<style scoped lang="less"></style>
