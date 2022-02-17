<template>
  <div class="way-content">
    <div class="add-nava">
      <keyword-search
        class="search-main-box"
        :placeholder="'关键字搜索航道或航标'"
        :autoClear="true"
        :isShowWaterway="true"
        @selectNavaAndWay="selectNavaAndWay"
      />
      <el-button type="primary" @click="handleAddNava">添加航标</el-button>
      <el-button type="primary" @click="handleAddWay">添加航道</el-button>
    </div>

    <way-dialog
      class="way-dialog"
      ref="waydialog"
      v-if="currentWay.length"
      :wayList="currentWay"
      @handleEdit="handleEdit"
      @handleBoxClose="handleBoxClose"
      @handleDelete="handleDelete"
    />

    <edit-or-add-way
      ref="editaddway"
      class="edit-or-add-way"
      v-if="isShowWayDialog"
      :currentWay="currentWayDialog"
      :isAutoPlan="!wayAddData.plan"
      @handleNavaClick="handleNavaClick"
      @handleDelCurrentWayDialog="handleDelCurrentWayDialog"
      @handleDelWayPrevOrNext="handleDelWayPrevOrNext"
      @handleWaySave="handleWaySave"
      @autoPlanRequest="autoPlanRequest"
      @handleWayCancel="handleWayCancel"
    />

    <Amap ref="amap" :isEdit="isClickMap" @getLngLat="getMapLngLat" @getMapBounds="getMapBounds">
      <template #chanel>
        <!-- 航道 -->
        <template v-if="waterwayList.length">
          <el-amap-polyline
            v-for="item in waterwayList"
            :key="item.id + 'a'"
            :path="item.fixesArray"
            :strokeStyle="item.connectivity === 2 ? 'solid' : 'dashed'"
            :strokeColor="item.color"
            :strokeWeight="item.strokeWeight"
            :zIndex="50"
            :extData="item"
            :events="waterwayEvents"
            lineJoin="round"
          >
          </el-amap-polyline>
        </template>
        <!-- 鼠标经过航道显示dient -->
        <div ref="wayIdent" v-show="isShowWayIdent" class="wayIdent">{{ currentWayIdent }}</div>
        <!-- 当前选中的航道 -->
        <template v-if="isShowHighlightWay">
          <el-amap-polyline
            v-for="(item, index) in currentWay"
            :extData="item"
            :key="index + 'b'"
            :path="item.fixesArray"
            :strokeStyle="item.connectivity === 2 ? 'solid' : 'dashed'"
            :strokeColor="item.color"
            :strokeWeight="8"
            :events="currentWayEvents"
            :zIndex="60"
            lineJoin="round"
            ref="waterwayLine"
          ></el-amap-polyline>
        </template>
        <!-- 航标 -->
        <template v-if="navaList.length">
          <el-amap-marker
            v-for="(item, index) in navaList"
            :key="index"
            :position="[item.locationObj.longitude, item.locationObj.latitude]"
            :draggable="currentNava && currentNava.id === item.id && !isShowWayDialog"
            :zIndex="currentNava && currentNava.id === item.id ? 900 : 100"
            :events="navaEvents"
            :extData="item"
            :offset="[-5, -5]"
          >
            <nava-dialog
              :value="item"
              :currentNava="currentNava"
              :isDisable="isShowWayDialog"
              @handleCurrentClick="handleCurrentClick"
              @handleBoxClose="handleBoxClose"
              @handleEdit="handleEdit"
              @handleDelete="handleDelete"
            />
          </el-amap-marker>

          <template v-for="(nava, index) in navaList">
            <el-amap-circle
              v-if="currentNava && currentNava.id === nava.id"
              :key="index + 'bb'"
              :center="[nava.locationObj.longitude, nava.locationObj.latitude]"
              :radius="nava.radius"
              :fill-opacity="0.5"
              strokeColor="#409eff"
              :strokeWeight="1"
              fillColor="#86D4D8"
              :bubble="true"
              :extData="nava"
              :zIndex="999"
            >
            </el-amap-circle>
          </template>
        </template>
        <!--  修改航道中的航标(高亮) -->
        <template v-if="currentWayDialog && currentWayDialog.fixes.length">
          <el-amap-marker
            v-for="(item, index) in currentWayDialog.fixes"
            :key="index + 'i'"
            :zIndex="999"
            :offset="[-5, -5]"
            :position="[item.navaid.locationObj.longitude, item.navaid.locationObj.latitude]"
          >
            <div class="nava-box light-nava" @click="handleClickHighlightNava(item, index)">
              <!-- 航标ident信息 -->
              {{ item.navaid.ident }}
            </div>
          </el-amap-marker>
        </template>

        <!-- 新增航标 -->
        <template v-if="navaAddData && navaAddData.latitude">
          <el-amap-marker
            :position="[navaAddData.longitude, navaAddData.latitude]"
            :draggable="true"
            :offset="[-3, -3]"
            :zIndex="1000"
            :events="navaEvents"
          >
            <AddNavaDialog
              :value="navaAddData"
              @handleAddSave="handleAddSave"
              @handleAddBoxClose="handleAddBoxClose"
            ></AddNavaDialog>
          </el-amap-marker>
          <!-- 新增航标半径 -->
          <el-amap-circle
            :center="[navaAddData.longitude, navaAddData.latitude]"
            :radius="navaAddData.radius"
            :fill-opacity="0.5"
            strokeColor="#75CAE7"
            fillColor="#86D4D8"
            :bubble="true"
          ></el-amap-circle>
        </template>
      </template>
    </Amap>
  </div>
</template>

<script>
import WaterWay from './WaterWay';
export default WaterWay;
</script>

<style scoped lang="less">
@import './WaterWay.less';
</style>
