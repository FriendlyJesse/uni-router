# 使用

```bash
npm i @friendlyjesse/uni-router
```

## 第一步，引入 uni-router
在根目录新建`router`文件夹，然后在其中新建`index.js`，内容如下：

```javascript
import router from '@friendlyjesse/uni-router'
import routes from './pages.json'

const routerInstance = new router(routes)

routerInstance.beforeEach((to, from, next) => {
  console.log('to:', to)
  console.log('from:', from)
  next()
})

export default routerInstance
```

*注意*：这里的`pages.json`由`@friendlyjesse/uni-extract`插件生成的路由，详情请看：https://github.com/FriendlyJesse/uni-extract

## 第二步，绑定`Vue`对象
在`main.js`中绑定`router`

```javascript
import router from '@/router'
Vue.use(router)
```

# api

## 跳转方法

```javascript
this.$Router.navigateTo(url, params) // 使用路径跳转
this.$Router.navigateTo(name, params) // 使用name跳转
this.$Router.navigateTo({ // option 式跳转
  name: url,
  params: {
    cid: item.cid,
    goodsId: item.goods_id
  },
  success(res) {
    // 通过eventChannel向被打开页面传送数据
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
  }
})
```
目前支持的有：`navigateTo`、`redirectTo`、`switchTab`、`reLaunch`、`navigateBack`
配置详情同：https://uniapp.dcloud.net.cn/api/router?id=navigateto

## 获取当前url
```javascript
this.$Router.getCurrentUrl()
```

## 获取路由
```javascript
this.$Router.getRoute(name)
this.$Router.getRoute(path)
```

## 全局钩子

### 前置钩子
```javascript
routerInstance.beforeEach((to, from, next) => {
  console.log('to:', to)
  console.log('from:', from)
  next() // 进入路由
  next({ type: 'switchTab', name: 'message—index'}) // 跳转到一个不同的地址
})
```
*注意*：
* 全局钩子不支持监听`navigateBack`
* 如果跳转到一个不同的路由需要设置条件，否则会导致死循环

### 后置钩子
```javascript
routerInstance.afterEach((to, from) => {
  console.log('to:', to)
  console.log('from:', from)
  next()
})
```