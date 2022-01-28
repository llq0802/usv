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
-src
│
│  App.vue 根组件
│  main.js 根入口js
│
│
├─api 网络请求api
│  │  request.js 封装的axios请求
│  │
│  └─login
│          index.js
│
├─assets
│  ├─css 样式文件
│  │  │  base.css 公共样式文件
│  │  │  color-dark.css 暗黑主题样式
│  │  │  icon.css 图标样式
│  │  │
│  │  └─theme-green 浅绿色主题样式
│  │      │  color-green.css
│  │      │  index.css
│  │      │
│  │      └─fonts 字体图标
│  │              element-icons.ttf
│  │              element-icons.woff
│  │
│  └─img 图片文件
│          img.jpg
│          login-bg.jpg
│          logo.png
│
├─components
│  ├─amap 地图组件
│  │      Amap.vue
│  │
│  └─common 页面公共组件
│          Header.vue
│          Home.vue
│          Sidebar.vue
│          Tags.vue
│
├─config 配置文件
│      index.js
│
├─lang 国际化语言
│      i18n.js
│
├─pages 路由页面
│  ├─403
│  │      403.vue
│  │
│  ├─404
│  │      404.vue
│  │
│  ├─home
│  │      Dashboard.vue
│  │
│  ├─login
│  │      Login.vue
│  │
│  └─Permission
│          Permission.vue│
│
├─router 路由配置
│      index.js
│
└─utils 工具函数
        bus.js
        directives.js
        index.js

```

## 二、如何切换主题色呢？

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

## 三、说明

1.  航段的类型未指定 'Unspecified' type = 0
    坐标导航航段 'DirectToLocation' type = 1
    航标导航航段 'DirectToNavaid' type = 2
    航道导航航段 'ViaWaterway' type = 3
    标准离港程序航段 'Sid' type = 4
    标准进港程序航段 'Star' type = 5
    进港泊位过渡段 'InboundBerthTransition' type = 6
    离港泊位过渡段 'OutboundBerthTransition' type = 7
    进港航道过渡段 'InboundEnrouteTransition' type = 8
    离港航道过渡段 'OutboundEnrouteTransition' type = 9

2.  当前航线:'#227be0', 进港航段:'#976F02', 离港航段:'#00C227';
    航道高亮:'#26A4BA', 航段高亮:'#011932';

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

6. vue 文件名必须大写字母开头，文件代码控制在 500 行内，必要时应抽取部分代码在对应页面下的 mixins-js 文件中 并以模块或者功能分类

7. 事件处理方法命名由 "handle" + "相关元素" + "事件名" 组成。 如处理导航栏子元素点击事件的方法 `handleNavItemClick`

8. 网请求函数命名由 api + '其他' ，命名要根据请求内容合理命名。
