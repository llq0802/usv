<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="$route.path"
      :collapse="collapse"
      background-color="#324157"
      text-color="#bfcbd9"
      active-text-color="#20a0ff"
      unique-opened
      router
    >
      <template v-for="item in items">
        <template v-if="item.children">
          <el-submenu :index="item.index" :key="item.index">
            <template slot="title">
              <i :class="item.icon" class="sidebar-icon"></i>
              <span slot="title">{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.children">
              <el-submenu v-if="subItem.children" :index="subItem.index" :key="subItem.index">
                <template slot="title">{{ subItem.title }}</template>
                <el-menu-item
                  v-for="(threeItem, i) in subItem.children"
                  :key="i"
                  :index="threeItem.index"
                  >{{ threeItem.title }}</el-menu-item
                >
              </el-submenu>
              <el-menu-item v-else :index="subItem.index" :key="subItem.index">{{
                subItem.title
              }}</el-menu-item>
            </template>
          </el-submenu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <i :class="item.icon" class="sidebar-icon"></i>
            <span slot="title">{{ item.title }}</span>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script>
import bus from '@/utils/bus';
import { routes } from '@/router';
export default {
  data() {
    return {
      collapse: false,
      routes: Object.freeze(routes)
    };
  },
  computed: {
    items() {
      const value = this.routes.find((item) => {
        if (item.children && item.children.length > 0) return item;
      });
      return value.children
        .filter((item) => {
          if (item.path !== '/404' && !item.meta.hidden) return item;
        })
        .map((item) => {
          return {
            // 如果是有二级菜单则添加children属性
            index: item.path,
            title: item.meta.title,
            icon: item.meta.icon
          };
        });
    }
  },
  mounted() {
    // 通过 Event Bus 进行组件间通信，来折叠侧边栏
    bus.$on('collapse', (msg) => {
      this.collapse = msg;
      bus.$emit('collapse-content', msg);
    });
  }
};
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
  width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
  width: 200px;
}
.sidebar > ul {
  height: 100%;
}
.sidebar-icon {
  margin-right: 15px;
  font-size: 18px;
}
</style>
