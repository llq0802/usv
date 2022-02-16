export default {
  data() {
    return {
      waterwayEvents: Object.freeze({
        mouseover: (e) => {
          const waterway = e.target.getExtData();
          waterway.strokeWeight = 9;
          e.target.setOptions({ showDir: true });
          const wayIdent = this.$refs.wayIdent;
          wayIdent.style.top = e.originEvent.offsetY + 'px';
          wayIdent.style.left = e.originEvent.offsetX + 'px';
          wayIdent.style.color = waterway.color;
          this.currentWayIdent = waterway.ident;
          this.isShowWayIdent = true;
        },
        mouseout: (e) => {
          const waterway = e.target.getExtData();
          waterway.strokeWeight = 4;
          e.target.setOptions({ showDir: false });
          this.isShowWayIdent = false;
          this.currentWayIdent = '';
        },
        click: (e) => {
          const waterway = e.target.getExtData();
          // 获得父组件航道信息框是否打开
          this.currentWay = [];
          this.currentWay.push(waterway);
          this.resetNavaAddData();
          this.isShowHighlightWay = true;
          this.$nextTick(() => {
            [...this.$refs.waterwayLine].map((item) => {
              item.$$getInstance().setOptions({ showDir: true });
            });
          });
        }
      }),
      navaEvents: Object.freeze({
        // 航标拖动事件
        dragging: async (e) => {
          if (this.isShowWayDialog) return;
          this.isRequest = false;
          const isAddNava = e.target.getExtData();
          if (!isAddNava.id) {
            //添加时
            this.navaAddData.longitude = e.lnglat.lng;
            this.navaAddData.latitude = e.lnglat.lat;
          } else {
            this.currentNava.locationObj.longitude = e.lnglat.lng;
            this.currentNava.locationObj.latitude = e.lnglat.lat;
          }
        }
      }),
      currentWayEvents: Object.freeze({})
    };
  },

  methods: {}
};
