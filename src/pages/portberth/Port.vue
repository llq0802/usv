<template>
  <div class="port-content">
    <div class="port-search">
      <table-search
        class="port-search-main"
        :placeholder="'请选择港口'"
        :autoClear="true"
        @selectPort="selectPort"
      />
      <el-button type="primary" class="port-search-btn" @click="handleAddPortClick"
        >添加港口</el-button
      >
    </div>

    <!-- 封装的表格 -->
    <port-table
      :tableIndex="false"
      :berthList="berthList"
      :pointList="pointList"
      :portList="portList"
      :procedureList="procedureList"
      :transitionList="transitionList"
      :tableOption="tableOption"
      :isShowPortDetail="isShowPortDetail"
      @buttonClick="tableButtonClick"
      @rowClick="tableRowClick"
      @handleSwitchChange="handleSwitchChange"
      @handleAddBtn="handleAddBtn"
    />
    <Amap ref="amap" :isEdit="isClickMap" @getMapBounds="getMapBounds" @getLngLat="getMapLngLat">
      <template #port_berth>
        <!-- 港口航道 -->
        <template v-if="waterwayList">
          <el-amap-polyline
            v-for="item in waterwayList"
            :key="item.id + '22'"
            :path="item.fixesArray"
            :strokeColor="item.color"
            :strokeWeight="item.strokeWeight || 3"
            :extData="item"
            :events="waterwayEvents"
            lineJoin="round"
          >
          </el-amap-polyline>
        </template>
        <!-- 港口航标-->
        <template v-if="navaList">
          <el-amap-marker
            v-for="item in navaList"
            :key="item.id"
            :position="item.locationArr"
            :offset="[-5, -5]"
          >
            <NavaMarker :item="item"></NavaMarker>
          </el-amap-marker>
        </template>
        <!-- 港口 -->
        <template v-if="portList.length">
          <template v-for="port in portList">
            <el-amap-marker :key="port.id + '11'" :position="port.locationArr" :zIndex="108">
              <PortDialog
                :port="port"
                :currentPort="currentPort"
                @handleCurrentClick="handleCurrentClick"
                @handleBoxClose="handleBoxClose"
                @handleDelete="handleDelete"
                @handleEdit="handleEdit"
              ></PortDialog>
            </el-amap-marker>
            <!-- 港口范围-->
            <el-amap-polygon
              v-if="currentPort.id"
              :key="port.id + 'aa'"
              :path="cachePortBoundList"
              :editable="currentPort.isPortEdit"
              strokeColor="#242f42"
              fillColor="#71b8fe"
              :extData="port"
              :events="portLineEvents"
              :zIndex="50"
              :bubble="true"
            ></el-amap-polygon>
          </template>
        </template>
        <!-- 新增港口 -->
        <template v-if="addPortData && addPortData.latitude">
          <el-amap-marker
            :position="[addPortData.longitude, addPortData.latitude]"
            :offset="[-18, -15]"
            :zIndex="999"
          >
            <AddPortDialog
              :port="addPortData"
              :isCtrl="isCtrl"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            ></AddPortDialog>
          </el-amap-marker>
          <!-- 新增港口范围 -->
          <el-amap-polygon
            v-if="addPortData.bounds.length"
            :editable="true"
            :path="addPortData.bounds"
            strokeColor="#dfc3cb"
            fillColor="#dfc3cb"
            strokeWeight="1"
            :zIndex="999"
            :events="addPortLineEvents"
          ></el-amap-polygon>
        </template>
        <!-- 泊位 -->
        <template v-if="berthList.length">
          <el-amap-marker
            v-for="berth in berthList"
            :key="berth.id + '33'"
            :position="berth.locationArr"
            :offset="[-3, -3]"
            :zIndex="currentBerth && currentBerth.id === berth.id ? 1000 : 100"
          >
            <BerthDialog
              :value="berth"
              :currentValue="currentBerth"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleDelete="handleDelete"
              @handleEdit="handleEdit"
            />
          </el-amap-marker>
          <!-- 泊位范围 -->
          <el-amap-polygon
            v-for="bound in berthList"
            :key="bound.id + 'bb'"
            :path="bound.boundList"
            strokeColor="#2f343e"
            strokeStyle="solid"
            fillColor="#74a5e5"
            :events="BerthLineEvents"
            :extData="bound"
            :bubble="true"
            :editable="currentBerth && currentBerth.id === bound.id"
            :strokeWeight="currentBerth && currentBerth.id === bound.id ? 2 : 1"
            :zIndex="currentBerth && currentBerth.id === bound.id ? 1000 : 100"
          ></el-amap-polygon>
        </template>
        <!-- 新增泊位 -->
        <template v-if="addBerthData && addBerthData.latitude">
          <el-amap-marker
            :position="[addBerthData.longitude, addBerthData.latitude]"
            :offset="[-18, -15]"
            :zIndex="999"
          >
            <AddBerthDialog
              :value="addBerthData"
              :isCtrl="isCtrl"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
          <!-- 新增泊位范围 -->
          <el-amap-polygon
            v-if="addBerthData.bounds.length"
            :editable="true"
            :path="addBerthData.bounds"
            strokeColor="#1dd1a1"
            strokeStyle="solid"
            strokeWeight="1"
            fillColor="#74a5e5"
            :strokeOpacity="0.8"
            :fillOpacity="0.8"
            :zIndex="999"
          ></el-amap-polygon>
        </template>
        <!-- 端点-->
        <template v-if="pointList.length">
          <el-amap-marker
            v-for="(point, index) in pointList"
            :key="index + 'ee'"
            :position="point.locationArr"
            :offset="[-3, -3]"
            :events="pointEvents"
            :extData="point"
            :draggable="currentPoint && currentPoint.id === point.id"
            :zIndex="currentPoint && currentPoint.id == point.id ? 1000 : 100"
          >
            <PointDialog
              :value="point"
              :currentValue="currentPoint"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleDelete="handleDelete"
              @handleEdit="handleEdit"
            />
          </el-amap-marker>
        </template>
        <!--新增端点-->
        <template v-if="addPointData && addPointData.latitude">
          <el-amap-marker
            :position="[addPointData.longitude, addPointData.latitude]"
            :draggable="true"
            :offset="[-3, -3]"
            :zIndex="999"
            :bubble="true"
          >
            <AddPointDialog
              :value="addPointData"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
        </template>
        <!--进出港程序-->
        <template v-if="procedureList.length">
          <div ref="procedure">
            <template v-for="item in procedureList">
              <el-amap-polyline
                :key="item.id + 'cc'"
                :strokeColor="item.type === 1 ? '#00000' : ' #8af22d'"
                strokeStyle="dashed"
                :geodesic="true"
                :path="item.boundList"
                :strokeWeight="
                  currentProcedure && currentProcedure.id === item.id ? 6 : item.strokeWeight
                "
                :events="procedureLineEvents"
                :bubble="true"
                :editable="currentProcedure && currentProcedure.id === item.id"
                :extData="item"
                lineJoin="round"
                :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
              >
              </el-amap-polyline>
              <el-amap-marker
                :key="item.id + 'hh'"
                :position="item.centerPoint"
                :events="procedureMarkerEvents"
                :extData="item"
                :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
              >
                <ProcedureMarker :value="item" @handleCurrentClick="handleCurrentClick" />
              </el-amap-marker>
              <template v-if="currentProcedure && currentProcedure.id === item.id">
                <el-amap-marker
                  :key="item.id + 'jj'"
                  :position="item.centerPoint"
                  :extData="item"
                  :zIndex="currentProcedure && currentProcedure.id === item.id ? 1000 : 100"
                >
                  <!-- 程序信息框 -->
                  <ProcedureDialog
                    :value="item"
                    :currentValue="currentProcedure"
                    :pointList="pointList"
                    @handleBoxClose="handleBoxClose"
                    @handleDelete="handleDelete"
                    @handleEdit="handleEdit"
                  />
                </el-amap-marker>
              </template>
            </template>
          </div>
        </template>
        <!-- 新增进出港程序 -->
        <template v-if="addProcedureData && addProcedureData.path.length">
          <el-amap-polyline
            :path="addProcedureData.path"
            strokeColor="#9F6732"
            :editable="true"
            :zIndex="999"
            lineJoin="round"
          >
          </el-amap-polyline>
          <el-amap-marker :position="addProcedureData.centerPoint" :offset="[-3, -3]" :zIndex="200">
            <AddProcedureDialog
              :value="addProcedureData"
              :isCtrl="isCtrl"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
        </template>
        <!--过渡路径-->
        <template v-if="transitionList.length">
          <div ref="transition">
            <template v-for="(item, index) in transitionList">
              <el-amap-polyline
                :key="index + 'ff'"
                :path="item.path"
                :events="transitionLineEvents"
                :extData="item"
                lineJoin="round"
                :strokeColor="item.direction === 1 ? '#976F02' : '#00C227'"
                :editable="currentTransition && currentTransition.id === item.id"
                :strokeWeight="
                  currentTransition && currentTransition.id === item.id ? 6 : item.strokeWeight
                "
                :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
              >
              </el-amap-polyline>
              <el-amap-marker
                :key="index + 'kk'"
                :position="item.centerPoint"
                :events="transitionMarkerEvents"
                :extData="item"
                :zIndex="currentTransition && currentTransition.id === item.id ? 1000 : 100"
              >
                <TransitionMarker :value="item" @handleCurrentClick="handleCurrentClick" />
              </el-amap-marker>
              <template v-if="currentTransition && currentTransition.id === item.id">
                <el-amap-marker
                  :position="item.centerPoint"
                  :events="transitionMarkerEvents"
                  :key="index + 'll'"
                >
                  <!-- 过渡路径信息框 -->
                  <TransitionDialog
                    :value="item"
                    :currentValue="currentTransition"
                    :pointList="pointList"
                    :navaList="navaList"
                    :berthList="berthList"
                    @handleBoxClose="handleBoxClose"
                    @handleDelete="handleDelete"
                    @handleEdit="handleEdit"
                  />
                </el-amap-marker>
              </template>
            </template>
          </div>
        </template>
        <!-- 新增过渡路径 -->
        <template v-if="addTransitionData && addTransitionData.path">
          <el-amap-polyline
            :path="addTransitionData.path"
            strokeColor="#9F6732"
            :editable="true"
            :zIndex="999"
            lineJoin="round"
          >
          </el-amap-polyline>
          <el-amap-marker
            v-if="addTransitionData && addTransitionData.path.length"
            :position="addTransitionData.centerPoint"
            :zIndex="900"
            :bubble="true"
          >
            <AddTransitionDialog
              :value="addTransitionData"
              :isCtrl="isCtrl"
              @handleAddBoxClose="handleAddBoxClose"
              @handleAddSava="handleAddSava"
            />
          </el-amap-marker>
        </template>
      </template>
    </Amap>
  </div>
</template>
<script>
import Port from './Port';
export default Port;
</script>
<style scoped lang="less">
@import './Port.less';
</style>
