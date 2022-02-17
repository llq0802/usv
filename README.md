## 一、 安装步骤

```
npm install  // 安装项目依赖，等待安装完成之后，安装失败可用 cnpm 或 yarn

// 开启服务器，浏览器访问 http://localhost:8080
npm  start

// 执行构建命令，生成的dist文件夹放在服务器下即可访问
npm run build

```

### 目录结构

```
src
│  App.vue
│  main.js 项目入口
│
├─api
│  │  request.js 封装的axios
│  │
│  ├─camera 视频
│  │      index.js
│  │
│  ├─geography
│  │      index.js
│  │
│  ├─login 登录
│  │      index.js
│  │
│  ├─nava 航标
│  │      index.js
│  │
│  ├─organization 组织
│  │      index.js
│  │
│  ├─plan 计划
│  │      index.js
│  │
│  ├─port 港口
│  │      index.js
│  │
│  ├─route 航线
│  │      index.js
│  │
│  ├─shipinfo  船舶
│  │      index.js
│  │
│  ├─user 用户
│  │      index.js
│  │
│  ├─usv
│  │      index.js
│  │
│  └─waterway 航道
│          index.js
│
├─assets 资源文件
│  ├─css 样式
│  │  │  map-style.less
│  │  │  reset.less
│  │  │
│  │  ├─theme-dark
│  │  │      color-dark.less
│  │  │
│  │  └─theme-green
│  │      │  color-green.less
│  │      │  index.less
│  │      │
│  │      └─fonts
│  │              element-icons.ttf
│  │              element-icons.woff
│  │
│  └─img 图片
│      ├─avatar
│      │      avatar.jpg
│      │
│      ├─login
│      │      login.jpg
│      │
│      └─map
│              marker.png
│              precise-marker.png
│              ship.png
│
├─components
│  ├─amap 公共地图组件
│  │      Amap.vue
│  │
│  └─common
│      ├─dialog 弹窗组件
│      │      Dialog.vue
│      │
│      ├─keyword-search 搜索组件
│      │      KeywordSearch.vue
│      │
│      ├─layout 布局组件
│      │      Breadcrumb.vue
│      │      Header.vue
│      │      Index.vue
│      │      Sidebar.vue
│      │      Tags.vue
│      │
│      ├─line-video 视频组件
│      │      OnLineVideo.vue
│      │
│      ├─port-btn
│      │      PortBtn.vue
│      │
│      ├─table 公共表格组件
│      │      Mytable.vue
│      │
│      └─table-search 搜索 按钮组件
│              TableSearch.vue
│
├─config 全局常量配置
│      index.js
│
├─pages 路由页面
│  ├─404
│  │      404.vue
│  │
│  ├─chartshow 航图管理
│  │  │  ChartShow.vue
│  │  │
│  │  └─components
│  │          S-NavaDialog.vue
│  │          S-PortDialog.vue
│  │          S-WayDialog.vue
│  │
│  ├─home 运行状态
│  │  │  HomePage.vue
│  │  │
│  │  └─components
│  │          ShipTable.vue
│  │
│  ├─login 登录
│  │      Login.vue
│  │
│  ├─organization 组织管理
│  │  │  Organ.vue
│  │  │
│  │  └─components
│  │          S-AddOrEdit.vue
│  │
│  ├─permissions 权限
│  │      Permission.vue
│  │
│  ├─plan 计划管理
│  │  │  Plan.vue
│  │  │
│  │  ├─components
│  │  │      ActionDialog.vue
│  │  │      AddDialog.vue
│  │  │      DrawPointDialog.vue
│  │  │      EditDialog.vue
│  │  │      TrackingDialog.vue
│  │  │
│  │  └─mixins
│  │          aboutMap.js
│  │
│  ├─portberth 港口泊位管理
│  │  │  Port.js
│  │  │  Port.less
│  │  │  Port.vue
│  │  │
│  │  ├─components
│  │  │      S-AddBerthDialog.vue
│  │  │      S-AddPointDialog.vue
│  │  │      S-AddPortDialog.vue
│  │  │      S-AddProcedureDialog.vue
│  │  │      S-AddTransitionDialog.vue
│  │  │      S-BerthDialog.vue
│  │  │      S-NavaMarker.vue
│  │  │      S-PointDialog.vue
│  │  │      S-PortDialog.vue
│  │  │      S-PortTable.vue
│  │  │      S-ProcedureDialog.vue
│  │  │      S-ProcedureMarker.vue
│  │  │      S-TransitionDialog.vue
│  │  │      S-TransitionMarker.vue
│  │  │
│  │  └─mixins 混入
│  │          addList.js
│  │          amapEvents.js
│  │          delList.js
│  │          editList.js
│  │          getList.js
│  │          tableEvents.js
│  │          utils.js
│  │
│  ├─route 航线管理
│  │  │  Route.vue
│  │  │
│  │  ├─components
│  │  │      RouteDetail.vue
│  │  │      Table.vue
│  │  │
│  │  └─mixins
│  │          aboutMap.js
│  │          detail.js
│  │
│  ├─shipinfo 船舶信息管理
│  │  │  ShipInfo.vue
│  │  │
│  │  └─components
│  │          S-AddOrEdit.vue
│  │          S-EditConfig.vue
│  │          S-LineVideo.vue
│  │          S-StateInfo.vue
│  │
│  ├─shipRunningState 运行详情
│  │  │  ShipRunningState.vue
│  │  │
│  │  ├─components
│  │  │      Calibration.vue
│  │  │      ShipPanel.vue
│  │  │      SpeedPanel.vue
│  │  │      StyleDashboard.vue
│  │  │
│  │  └─mixins
│  │          plan.js
│  │          watch.js
│  │
│  ├─user
│  │  │  User.vue
│  │  │
│  │  └─components
│  │          S-AddOrEdit.vue
│  │
│  └─waterway 航道航标管理
│      │  WaterWay.js
│      │  WaterWay.less
│      │  WaterWay.vue
│      │
│      ├─components
│      │      S-AddNavaDialog.vue
│      │      S-EditOrAddWay.vue
│      │      S-NavaDialog.vue
│      │      S-WayDialog.vue
│      │
│      └─mixins
│              addList.js
│              amapEvents.js
│              delList.js
│              editList.js
│              getList.js
│              utils.js
│
├─plugins 插件
│      amap.js 地图
│      directives.js 全局自定义指令
│      elementui.js ui
│
│
├─router 路由
│      index.js
│
└─utils 工具方法
        bgBeautify.js 登录背景
        bus.js 事件中心
        handleLngLat.js 地图中经纬度数据格式相互转换
        index.js 防抖 节流 深克隆 等
        localStorage.js 封装本地存储
        rotate.js 旋转
        signalR.js 实时通讯
        token.js 解析token和过期时间



```

## 二、如何切换主题色？

第一步：打开 src/plugins 文件找到 elementui.js，换成浅绿色主题。

```javascript
import 'element-ui/lib/theme-default/index.css'; // 默认主题
// import './assets/css/theme-green/index.css';       // 浅绿色主题
```

第二步：打开 src/App.vue 文件，找到 style 标签引入样式的地方，切换成浅绿色主题。

```javascript
@import "./assets/css/main.css";
@import "./assets/css/theme-dark/color-dark.css";     /*深色主题*/
/*@import "./assets/css/theme-green/color-green.css";   /*浅绿色主题*/
```

第三步：打开 src/components/common/Sidebar.vue 文件，找到 el-menu 标签，把 background-color/text-color/active-text-color 属性去掉即可。

## 三、接口文档

[后端接口 Swagger 地址](http://192.168.110.234:8766/openapi/index.html)

## 四、相关规范

### 公共

1. HTML、CSS、JS 等缩进均采用 soft tab（2 个空格）

### CSS、Less、Scss

1. 类名使用小写字母，以中划线分隔 例如'top-box' ;id 采用驼峰式命名

### JS

1. 语句结束后必须加 `;` 分号结尾
2. 变量和方法名采用小驼峰形式，常量名采用全大写加下划线形式，类名采用大驼峰形式

   ```javascript
   // 变量
   let testNum = 1;

   // 方法
   function testFunc() {}

   // 常量
   const MAX_NUM = 20;

   // 类名
   function BigPerson() {}
   class Dep {}
   ```

3. 所有文件名用小写，过长时写加 "-" 分割的形式，如 "cultural-boutique "、 "tourism-boutique，不允许大写文件名"
4. 公共组件，放在 src/components 文件 common 中
5. 私有组件，存放在对应页面下的 "components" 文件夹中，并且组件文件夹以 "S-" 开头命名，如私有 login "S-Login-说明功能 "
6. vue 文件名必须大写字母开头，文件代码控制在 500 行内，必要时应抽取部分代码在对应页面下的 mixins 文件中 并以模块或者功能分类
7. 事件处理方法命名由 "handle" + "相关元素" + "事件名" 组成。 如处理导航栏子元素点击事件的方法 `handleNavItemClick`
8. 网请求函数命名由 api + '其他' ，命名要根据请求内容合理命名。
9. 代码风格按照 Vue2 官方文档的风格指南执行
