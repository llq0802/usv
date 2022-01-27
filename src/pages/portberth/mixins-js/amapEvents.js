export default {
  data() {
    return {
      waterwayEvents: Object.freeze({}),
      transitionMarkerEvents: Object.freeze({}),
      procedureMarkerEvents: Object.freeze({}),
      transitionLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentTransition) this.currentTransition.path = e.target.getPath();
        },
        click: (e) => {
          if (this.transitionList.length) {
            const value = e.target.getExtData();
            this.handleCurrentClick('transition', value);
          }
        },
        mouseover: (e) => {
          if (this.transitionList.length) {
            this.$refs.transition.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 6;
          }
        },
        mouseout: (e) => {
          if (this.transitionList.length) {
            this.$refs.transition.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 2;
          }
        }
      }),
      pointEvents: Object.freeze({
        // 鼠标拖动修改对应的经纬度
        dragging: debounce((e) => {
          // 港口端点拖动事件
          if (this.currentPoint) {
            const id = e.target.getExtData().id;
            const point = this.pointList.find((item) => item.id === id);
            point.locationObj.latitude = location.lat;
            point.locationObj.longitude = location.lng;
            this.currentPoint.location = turnLngLat(e.target.getPosition());
          }
        })
      }),
      procedureLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentProcedure) {
            let path = e.target.getPath();
            this.currentProcedure.path = path2Str(path);
          }
        },
        mouseover: (e) => {
          if (this.procedureList.length) {
            this.$refs.procedure.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 6;
          }
        },
        mouseout: (e) => {
          if (this.procedureList.length) {
            this.$refs.procedure.style.cursor = 'pointer';
            e.target.getExtData().strokeWeight = 2;
          }
        },
        click: (e) => {
          if (this.procedureList.length) {
            const value = e.target.getExtData();
            this.handleCurrentClick('procedure', value);
          }
        }
      }),
      portLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (!this.currentPort.id) return;
          const id = e.target.getExtData().id;
          const bounds = e.target.getPath();
          this.currentPort.bounds = path2Str(bounds);
          let area = Math.round(AMap.GeometryUtil.ringArea(bounds));
          this.portList.find((item) => item.id === id).area = area;
        }
      }),
      BerthLineEvents: Object.freeze({
        adjust: (e) => {
          this.isRequest = false;
          if (this.currentBerth) this.currentBerth.bounds = path2Str(e.target.getPath());
        },
        click: (e) => {
          this.handleCurrentClick('berth', e.target.getExtData());
        }
      })
    };
  }
};
