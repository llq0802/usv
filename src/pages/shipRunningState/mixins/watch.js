export default {
  watch: {
    planId: {
      handler (newVal, oldVal) {
        // 清除前面的数据获取编码
        if (oldVal && !newVal) {
          // 执行转查看
          this.unsubscribeFun();
          // 清除航线和  //暂时不清轨迹
          this.pointList.splice(0, this.pointList.length);
          // this.targetDistance.splice(0, this.targetDistance.length);
          this.setMeasurement = null;
        } else if (!oldVal && newVal) {
          // 查看转执行
          this.unsubscribeFun();
          // this.getUsvName();
        } else {
          // 执行的计划被修改了
          this.unsubscribeFun();
        }

        // 页面加载时通过传过来的数据，进行数据获取
        if (this.planId) {
          this.actioniPlan();
          this.$route.meta.title = `${this.usvName}执行中`;
        } else {
          this.ViewRunStatus();
          this.$route.meta.title = `${this.usvName}状态查看`;
        }
        // 重置所有定时器
        this.ActionPlanTime();
      },
      deep: true,
    },
    routerTrackLineLoca: {
      handler () {
        if (this.routerTrackLineLoca && this.routerTrackLineLoca.length) {
          this.routerTrackLine = JSON.parse(JSON.stringify(this.routerTrackLineLoca));
        } else {
          this.routerTrackLine = [];
          // 清空了估计跟踪，船只数据没有清除
          this.shipRealTimeLocation = [];
          this.shipLine = [];
          this.shipLocation = [];
        }
      },
      deep: true,
      immediate: true,
    },
    routerTrackLineTwoLoca: {
      handler () {
        if (this.routerTrackLineTwoLoca && this.routerTrackLineTwoLoca.length) {
          this.routerTrackLineTwo = JSON.parse(JSON.stringify(this.routerTrackLineTwoLoca));
          if (this.$refs.shipMarker) {
            const shipMarker = this.$refs.shipMarker.$$getInstance();
            let toDistance = {};
            toDistance.lat = +this.shipRealTimeLocation[1].toString();
            toDistance.lng = +this.shipRealTimeLocation[0].toString();
            toDistance.Q = +this.shipRealTimeLocation[1].toString();
            toDistance.R = +this.shipRealTimeLocation[0].toString();
            let distance = shipMarker.getPosition().distance(toDistance);
            // 误差大于1米,直接移动到实际位置
            if (distance / (this.speed * 5 * 0.5) > 1) {
              // console.warn(`误差过大(${distance}m),跳过动画直接移至实际点`)
              shipMarker.moveTo(this.shipRealTimeLocation, 36000000);
            } else {
              shipMarker.moveTo(this.shipRealTimeLocation, this.speed * 5);
            }

            let start = this.$refs.map.mapInstance.lngLatToContainer([shipMarker.getPosition().R, shipMarker.getPosition().Q]);
            let end = this.$refs.map.mapInstance.lngLatToContainer(this.shipRealTimeLocation);
            let shipDoms = document.querySelectorAll('.ship-view-marker');
            // console.log(distance)
            if (distance > 100) {
              for (let shipDom of shipDoms) {
                if ((end.x - start.x || end.y - start.y) && shipDom && shipDom.getAttribute('data-id') == this.setmanned.id) {
                  // 相对于下一个点的偏转角度
                  let angel = (360 * Math.atan2(end.y - start.y, end.x - start.x)) / (2 * Math.PI) + 90;
                  shipDom.style.transition = `all .5s`;
                  // 相对于上一个偏角差
                  let diff_angel = parseInt(shipDom.style.transform.slice(7)) - angel;
                  if (diff_angel > 180 || diff_angel < -180) {
                    shipDom.style.transition = `all 0s`;
                  }
                  shipDom.style.transform = `rotate(${angel}deg)`;
                }
              }
            } else {
              for (let shipDom of shipDoms) {
                // console.log(shipDom)
                if (shipDom.getAttribute('data-id') == this.setmanned.id) {
                  shipDom.style.transition = `all .5s`
                  shipDom.style.transform = `rotate(${this.setmanned.yaw}deg)`
                }
              }
            }

          }
        } else {
          this.routerTrackLineTwo = [];
        }
      },
      deep: true,
      immediate: true,
    },
    // 轨迹变换，中心点始终处于最后
    routerTrackLine: {
      handler () {
        if (!this.routerTrackLine) return;
        this.setMapCenter();
        if (!this.setmanned) return;
        this.speed = this.setmanned.velocity;
        if (this.isShowTrack.isShowTrackOne && !this.isShowTrack.isShowTrackTwo) {
          this.shipRealTimeLocation = [this.setmanned.location.longitude, this.setmanned.location.latitude];
        }
        else {
          this.shipRealTimeLocation = [this.setmanned.calibratedLocation.longitude, this.setmanned.calibratedLocation.latitude];
        }
        this.shipLine.push(this.shipRealTimeLocation);
        if ((this.shipLine.length > 1)) {
          this.shipLocation = this.shipLine[this.shipLine.length - 1];
        }
      },
      deep: true,
    },
  },
}