<template>
  <div class="text-style" @click.stop="handleCurrentClick">
    {{ value.direction === 1 ? 'TO' : 'FROM' }} {{ value.ident }}
  </div>
</template>

<script>
export default {
  name: 's-transitionmarker',
  props: {
    value: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: 'transition'
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
