interface Route {
  path: string,
  name?: string,
  style?: Object
}

interface InterceptEvent {
  beforeEach?: Function,
  afterEach?: Function
}

export {
  Route,
  InterceptEvent
}
