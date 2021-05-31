import { json2params, deepClone } from '@friendlyjesse/library'

import { route } from '../typings'

/**
 * 路由跳转方法
 * @author Jesse <jessexinyu@foxmail.com>
 */
class Router {
  routes: route[] = []
  interceptEvent: Function[] = []

  constructor (routes: route[]) {
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

  async execute (type: string, ...reset: any[]) {
    const mergeOption = this.mixinOption(...reset)

    // 拦截器
    await new Promise((resolve, reject) => {
      const to = this.getRoute(mergeOption.name)
      const from = this.getRoute(this.getCurrentUrl(), 'path')
      this.intercept(to, from, resolve)
    });
    (uni as any)[type](mergeOption)
  }

  /**
   * 整合 options
   * @ignore
   * @param options
   * @param params
   * @returns 合并后的 options
   */
  mixinOption (options: object | string = {}, params: object = {}) {
    const mergeOption = deepClone(options)
    if (typeof options === 'string') { // 如果 options 为字符串，则为 navigateTo(url, params) 的形式
      mergeOption.url = options + '?' + json2params(params)
    } else {
      const { name, url, params } = mergeOption
      const currentUrl = (name ? this.getRoute(name).path : url) + '?' + json2params(params)
      mergeOption.url = currentUrl
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
    const route = this.routes.find((item: any) => item[type] === (type === 'name' ? param : '/' + param))
    if (route) {
      return route
    } else {
      throw Error(`${name}对应的路由不存在`)
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
    return currentPage.route as string
  }

  /**
   * 拦截器
   * @ignore
   * @param {*} to 即将要进入的目标
   * @param {*} from 当前导航正要离开的路由
   * @param {*} next 一定要调用该方法来 resolve 这个钩子
   */
  intercept (to: object, from: object, next: Function) {
    if (this.interceptEvent.length) {
      this.interceptEvent.forEach((callback: Function) => {
        callback(to, from, next)
      })
    } else {
      next()
    }
  }

  /**
   * 全局前置守卫
   * @param {*} callback 前置守卫回调
   */
  beforeEach (callback: Function) {
    this.interceptEvent.push(callback)
  }
}

export default Router
