<template>
  <div>
    <div class="nava-maker"></div>
    <div class="nava-box shadow text-style">{{ item.ident }}</div>
  </div>
</template>

<script>
export default {
  name: 's-navamarker',
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  methods: {}
};
</script>

<style scoped lang="less">
@nava-background-color: rgba(80, 114, 209, 0.8);
@nava-maker-color: rgba(90, 115, 141, 1);

/**航标点样式 */
.nava-maker {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 3px solid @nava-maker-color;
}
/*航标信息框*/
.nava-box {
  position: absolute;
  top: 26px;
  left: -11px;
  padding: 0 3px;
  text-align: center;
  border-radius: 3px;
  color: rgb(76, 113, 212);
  background: @nava-background-color;

  &::after {
    content: '';
    width: 0;
    height: 0;
    border-bottom: 8px solid @nava-background-color;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    position: absolute;
    top: -8px;
    left: 15px;
  }
}
</style>
