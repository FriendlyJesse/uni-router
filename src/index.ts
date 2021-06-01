import { json2params, deepClone } from '@friendlyjesse/library'

import { Route, InterceptEvent } from '../typings'

/**
 * 路由跳转方法
 * @author Jesse <jessexinyu@foxmail.com>
 */
class Router {
  routes: Route[] = []
  interceptEvent: InterceptEvent = {}

  constructor (routes: Route[]) {
    this.routes = routes
  }

  /**
   * 保留当前页面，跳转到应用内的某个页面，使用uni.navigateBack可以返回到原页面。
   * @param options
   * @param params
   * @param params.name name
   * @param params.url url
   * @param params.animationType animationType
   * @param params.animationDuration animationDuration
   * @param params.events 监听打开页面发送到放弃页面的数据
   * @param params.success 接口调用成功的回调函数，可在其中触发打开页面的监听函数
   * @param params.fail 接口调用失败的回调函数
   * @param params.complete 接口调用结束的回调函数（调用成功、失败都会执行）
   * @example
   * navigateTo(url, params)
   * routerInstance.navigateTo({
   *  name: url,
   *   params: {
   *     cid: item.cid,
   *     goodsId: item.goods_id
   *   },
   *   success(res) {
   *     // 通过eventChannel向被打开页面传送数据
   *     res.eventChannel.emit('acceptDataFromOpenerPage', { data: 'test' })
   *   }
   * })
   *
   */
  navigateTo (...reset: any[]) {
    this.execute('navigateTo', ...reset)
  }

  /**
   * 如 navigateTo
   */
  redirectTo (...reset: any[]) {
    this.execute('redirectTo', ...reset)
  }

  /**
   * 如 navigateTo
   * @param  {...any} reset
   */
  switchTab (...reset: any[]) {
    this.execute('switchTab', ...reset)
  }

  /**
   * 如 navigateTo
   * @param  {...any} reset
   */
  reLaunch (...reset: any[]) {
    this.execute('reLaunch', ...reset)
  }

  /**
   * 如 navigateTo
   * @param  {...any} reset
   */
  navigateBack (...reset: any[]) {
    this.execute('navigateBack', ...reset)
  }

  install (Vue: any) {
    Object.defineProperty(Vue.prototype, '$Router', {
      get: () => { return this }
    })
  }

  async execute (type: string, ...reset: any[]) {
    if (type === 'navigateBack') {
      (uni as any)[type](...reset)
      return
    }
    const mergeOption = this.mixinOption(...reset)
    const to = mergeOption
    const from = this.getRoute(this.getCurrentUrl(), 'path')
    // 拦截器
    const result: any = await new Promise((resolve, reject) => {
      this.intercept(to, from, resolve)
    })
    if (result) {
      const { type, ...options } = result
      if (['navigateTo', 'redirectTo', 'switchTab', 'reLaunch', 'navigateBack'].includes(type)) {
        (this as any)[type](options)
      } else {
        throw Error('next 不存在这个 type ！')
      }
    } else {
      this.interceptEvent.afterEach && this.interceptEvent.afterEach(to, from);
      (uni as any)[type](mergeOption)
    }
  }

  /**
   * 整合 options
   * @ignore
   * @param options
   * @param params
   * @returns 合并后的 options
   */
  mixinOption (options: object | string = {}, params: object = {}) {
    let mergeOption: any
    if (typeof options === 'string') { // 如果 options 为字符串，则为 navigateTo(url, params) 的形式
      const isName = options.indexOf('/') === -1
      const route = this.getRoute(options, isName ? 'name' : 'path')
      mergeOption = Object.assign({}, route, { params })
      mergeOption.url = route.path + '?' + (params && json2params(params))
    } else {
      mergeOption = deepClone(options)
      const { name, params } = mergeOption
      const route = this.getRoute(name)
      mergeOption = Object.assign({}, route, mergeOption)
      mergeOption.url = route.path + '?' + (params && json2params(params))
    }
    return mergeOption
  }

  /**
   * 根据 name / path 获取路由
   * @param param 参数
   * @param name / path
   * @returns 路由信息
   */
  getRoute (param: string, type = 'name') {
    const route = this.routes.find((item: any) => item[type] === param)
    if (route) {
      return route
    } else {
      throw Error(`${param}对应的路由不存在`)
    }
  }

  /**
   * 获取当前 url
   * @returns {string} 当前的 url
   */
  getCurrentUrl (): string {
    // eslint-disable-next-line no-undef
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    return '/' + currentPage.route as string
  }

  /**
   * 拦截器
   * @ignore
   * @param {*} to 即将要进入的目标
   * @param {*} from 当前导航正要离开的路由
   * @param {*} next 一定要调用该方法来 resolve 这个钩子
   */
  intercept (to: object, from: object, next: Function) {
    const events = Object.keys(this.interceptEvent)
    if (events.length) {
      this.interceptEvent.beforeEach && this.interceptEvent.beforeEach(to, from, next)
    } else {
      next()
    }
  }

  /**
   * 全局前置守卫
   * @param callback 前置守卫回调
   */
  beforeEach (callback: Function) {
    this.interceptEvent.beforeEach = callback
  }

  /**
   * 全局后置守卫
   * @param callback 后置守卫回调
   */
  afterEach (callback: Function) {
    this.interceptEvent.afterEach = callback
  }
}

export default Router
