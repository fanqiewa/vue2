/*!
 * Vue.js v2.6.10
 */
(function (global, factory) {
  // exports和module.exports是node.js里的模块
  // 二者的联系：exports对象实际上只是对module.exports的引用，
  // 也即：
  // var module = { id: '', exports: {}, /* ... */} 
  // var exports = module.exports
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  // define是amd规范里的模块
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, function () { 
  
  'use strict';

  // Object.freeze()方法可以冻结一个对象
  var emptyObject = Object.freeze({});

  function isUndef (v) {
    return v === undefined || v === null
  }

  function isDef (v) {
    return v !== undefined && v !== null
  }

  function isTrue (v) {
    return v === true
  }

  function isFalse (v) {
    return v === false
  }

  /**
   * 检查值是否为原始值。
   */
  function isPrimitive (value) {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'symbol' ||
      typeof value === 'boolean'
    )
  }

  /**
   * 判断一个对象是否为Object
   */
  function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  // 获取值的原始类型字符串，例如[object object]。
  var _toString = Object.prototype.toString;

  function toRawType (value) {
    return _toString.call(value).slice(8, -1)
  }

  /**
   * 严格的对象类型检查。只对纯JavaScript对象返回true。
   */
  function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }

  /**
   * 检查传入参数是否为正则对象
   */
  function isRegExp (v) {
    return _toString.call(v) === '[object RegExp]'
  }

  /**
   * 检查val是否是有效的数组索引。
   */
  function isValidArrayIndex (val) {
    var n = parseFloat(String(val));
    return n >= 0 && Math.floor(n) === n && isFinite(val)
  }
  
  /**
   * 检查val是否为promise对象
   */
  function isPromise (val) {
    return (
      isDef(val) &&
      typeof val.then === 'function' &&
      typeof val.catch === 'function'
    )
  }

  /**
   * 将值转换为字符串。
   * e.g: 
   * 输入：[1, 2, 3] 
   * 输出："[
   *         1,
   *         2,
   *         3
   *       ]"
   * 
   * 输入：{name: 'fanqiewa', age: 18}
   * 输出："{
   *         "name": "fanqiewa",
   *         "age": 18
   *       }"
   */
  function toString (val) {
    return val == null
      ? ''
      : Array.isArray(val) || (isPlainObject(val) && val.toString === _toString)
        ? JSON.stringify(val, null, 2 /* 缩进 */)
        : String(val)
  }

  /**
   * 将输入值转换为数字。
   * 如果转换失败，返回原始字符串。
   */
  function toNumber (val) {
    var n = parseFloat(val);
    return isNaN(n) ? val : n
  }

  /**
   * 生成一个映射并返回一个函数，用于检查该映射中是否有一个键。
   * 第二个参数决定是否将键转换成大写
   * e.g:
   * 输入：'slot,component', false
   * 输出：function (val) { return map[val]; }
   * 
   * 输入：'slot,component', true
   * 输出：function (val) { return map[val.toLowerCase()]; }
   */
  function makeMap (
    str,
    expectsLowerCase
  ) {
    var map = Object.create(null);
    var list = str.split(',');
    for (var i = 0; i < list.length; i++) {
      map[list[i]] = true;
    }
    return expectsLowerCase
      ? function (val) { return map[val.toLowerCase()]; }
      : function (val) { return map[val]; }
  }

  // 检查标记是否为内置标记。
  var isBuiltInTag = makeMap('slot,component', true);

  // 检查属性是否为保留属性。
  var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

  /**
   * 从数组中移除项。
   */
  function remove (arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);
      if (index > -1) {
        return arr.splice(index, 1)
      }
    }
  }

  // 检查对象是否具有属性。
  var hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn (obj, key) {
    return hasOwnProperty.call(obj, key)
  }

  /**
   * 创建纯函数。返回一个新的缓存函数，
   */
  function cached (fn) {
    var cache = Object.create(null);
    return (function cachedFn (str) {
      var hit = cache[str];
      return hit || (cache[str] = fn(str))
    })
  }

  /**
   * 将中划线命名转成小驼峰命名
   */
  var camelizeRE = /-(\w)/g;
  var camelize = cached(function (str) {
    return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
  });

  /**
   * 大驼峰命名
   */
  var capitalize = cached(function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  });

  /**
   * 将小驼峰转成中划线命名
   */
  var hyphenateRE = /\B([A-Z])/g;
  var hyphenate = cached(function (str) {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
  });

  /**
   * 简单绑定polyfill，适用于不支持它的环境，
   * e.g. PhantomJS 1.x。从技术上讲，我们不再需要这个了，
   * 因为本地绑定在大多数浏览器中的性能已经足够了。
   * 但删除它将意味着破坏能够在PhantomJS 1.x中运行的代码，
   * 因此必须保留这一点以保持向后兼容性。
   */
  function polyfillBind (fn, ctx) {
    function boundFn (a) {
      var l = arguments.length;
      return l
        ? l > 1
          ? fn.apply(ctx, arguments)
          : fn.call(ctx, a)
        : fn.call(ctx)
    }

    boundFn._length = fn.length;
    return boundFn
  }

  function nativeBind (fn, ctx) {
    return fn.bind(ctx)
  }

  var bind = Function.prototype.bind
    ? nativeBind
    : polyfillBind;

  /**
   * 将类数组的对象转换为真数组。
   */
  function toArray (list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
      ret[i] = list[i + start];
    }
    return ret
  }

  /**
   * 将属性混合到目标对象中。
   */
  function extend (to, _from) {
    for (var key in _from) {
      to[key] = _from[key];
    }
    return to
  }

  /**
   * 将一组数组对象合并为一个对象。
   */
  function toObject (arr) {
    var res = {};
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        extend(res, arr[i]);
      }
    }
    return res
  }

  /**
   * 不执行任何操作。
   * https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/
   */
  function noop (a, b, c) {}

  /**
   * 始终返回false。
   */
  var no = function (a, b, c) { return false; };

  /**
   * 返回相同的值。
   * identity含义为相同
   */
  var identity = function (_) { return _; };

  /**
   * 从编译器模块生成包含静态键的字符串。
   * e.g.
   * 输入：[{staticKeys: 'class'}, {staticKeys: 'style', name: 'fanqiewa'}]
   * 输出：class,style
   */
  function genStaticKeys (modules) {
    return modules.reduce(function (keys, m) {
      return keys.concat(m.staticKeys || [])
    }, []).join(',')
  }

  /**
   * 检查两个值是否大致相等-也就是说，如果它们是普通对象，它们的形状是否相同？
   */
  function looseEqual (a, b) {
    if (a === b) { return true }
    var isObjectA = isObject(a);
    var isObjectB = isObject(b);
    if (isObjectA && isObjectB) {
      try {
        var isArrayA = Array.isArray(a);
        var isArrayB = Array.isArray(b);
        if (isArrayA && isArrayB) {
          return a.length === b.length && a.every(function (e, i) {
            return looseEqual(e, b[i])
          })
        } else if (a instanceof Date && b instanceof Date) {
          return a.getTime() === b.getTime()
        } else if (!isArrayA && !isArrayB) {
          var keysA = Object.keys(a);
          var keysB = Object.keys(b);
          return keysA.length === keysB.length && keysA.every(function (key) {
            return looseEqual(a[key], b[key])
          })
        } else {
          return false
        }
      } catch (e) {
        return false
      }
    } else if (!isObjectA && !isObjectB) {
      return String(a) === String(b)
    } else {
      return false
    }
  }

  /**
   * 查找val值在数组arr中的第一个索引
   * （如果值是一个普通对象，则数组必须包含相同形状的对象），如果不存在，则返回-1。
   */
  function looseIndexOf (arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (looseEqual(arr[i], val)) { return i }
    }
    return -1
  }

  /**
   * 确保函数只被调用一次。
   */
  function once (fn) {
    var called = false;
    return function () {
      if (!called) {
        called = true;
        fn.apply(this, arguments);
      }
    }
  }

  // 服务端渲染标志属性
  var SSR_ATTR = 'data-server-rendered';

  // 静态资源
  var ASSET_TYPES = [
    'component',
    'directive',
    'filter'
  ];

  // 生命周期钩子
  var LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated',
    'errorCaptured',
    'serverPrefetch'
  ];

  // 全局配置
  var config = ({
    /**
     * 选项合并策略（用于core/util/options）
     */
    optionMergeStrategies: Object.create(null),

    /**
     * 是否禁止显示警告。
     */
    silent: false,

    /**
     * 启动时显示生产模式提示消息？
     */
    productionTip: "development" !== 'production',

    /**
     * 是否启用devtools
     */
    devtools: "development" !== 'production',

    /**
     * 是否记录性能
     */
    performance: false,

    /**
     * 观察者错误的错误处理程序
     */
    errorHandler: null,

    /**
     * 观察者警告的警告处理程序
     */
    warnHandler: null,

    /**
     * 忽略某些自定义元素
     */
    ignoredElements: [],

    /**
     * v-on的自定义用户密钥别名
     */
    keyCodes: Object.create(null),

    /**
     * 检查标记是否已保留，以便无法将其注册为组件。这取决于平台，可能会被覆盖。
     */
    isReservedTag: no,

    /**
     * 检查某个属性是否被保留，使其不能用作组件属性。这取决于平台，可能会被覆盖。
     */
    isReservedAttr: no,

    /**
     * 检查标记是否未知元素。平台-依赖性。
     */
    isUnknownElement: no,

    /**
     * 获取元素的命名空间
     */
    getTagNamespace: noop,

    /**
     * 解析特定平台的实际标记名。
     */
    parsePlatformTagName: identity,

    /**
     * 检查属性是否必须使用属性绑定
     */
    mustUseProp: no,

    /**
     * 异步执行更新。用于Vue测试实用程序，如果设置为false，则会显著降低性能。
     */
    async: true,

    /**
     * 因遗留原因而暴露
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
  });

  /*  */

  /**
   * 用于解析html标记、组件名称和属性路径的unicode字母。
   * using https://www.w3.org/TR/html53/semantics-scripting.html#potentialcustomelementname
   * 跳过\u10000-\uEFFFF，因为它冻结了PhantomJS
   */
  var unicodeRegExp = /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/;

  /**
   * 检查字符串是否以 `$` 或以 `_` 开头
   */
  function isReserved (str) {
    var c = (str + '').charCodeAt(0);
    return c === 0x24 || c === 0x5F
  }

  /**
   * 定义属性。
   */
  function def (obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
      value: val,
      enumerable: !!enumerable,
      writable: true,
      configurable: true
    });
  }

  /**
   * 解析简单路径。(用于检测watch深层对象的属性是否存在)
   * bailRE = /[^a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD.$_\d]/
   * e.g.
   * 执行parsePath("detail.status.fail")({ detail: { status: { fail: 'fail' } } })
   * 返回 'fail'
   */
  var bailRE = new RegExp(("[^" + (unicodeRegExp.source) + ".$_\\d]"));
  function parsePath (path) {
    if (bailRE.test(path)) {
      return
    }
    var segments = path.split('.');
    return function (obj) {
      for (var i = 0; i < segments.length; i++) {
        if (!obj) { return }
        obj = obj[segments[i]];
      }
      return obj
    }
  }

  // 是否含有prototype
  var hasProto = '__proto__' in {};

  // 浏览器环境检测
  var inBrowser = typeof window !== 'undefined';
  var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
  var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
  var UA = inBrowser && window.navigator.userAgent.toLowerCase();
  var isIE = UA && /msie|trident/.test(UA);
  var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
  var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
  var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  var isPhantomJS = UA && /phantomjs/.test(UA);
  var isFF = UA && UA.match(/firefox\/(\d+)/);

  // Firefox有一个“监视”功能对象.原型...
  var nativeWatch = ({}).watch;

  // 用于标识是否支持passive属性，passive设置为true时，表示回调函数永远不会调用 preventDefault()
  // 参考文档：https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
  var supportsPassive = false;
  if (inBrowser) {
    try {
      var opts = {};
      Object.defineProperty(opts, 'passive', ({
        get: function get () {
          supportsPassive = true;
        }
      })); // https://github.com/facebook/flow/issues/285
      window.addEventListener('test-passive', null, opts);
    } catch (e) {}
  }

  // 这需要延迟计算，因为在vue服务器呈现程序可以设置vue_ENV之前，可能需要vue
  var _isServer;
  // Vue.prototype.$isServer => isServerRendering
  // 判断当前环境是否是服务端渲染
  var isServerRendering = function () {
    if (_isServer === undefined) {
      if (!inBrowser && !inWeex && typeof global !== 'undefined') {
        _isServer = global['process'] && global['process'].env.VUE_ENV === 'server';
      } else {
        _isServer = false;
      }
    }
    return _isServer
  };

  // 检测开发工具
  var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

  /**
   * e.g.
   * 输入：Symbol
   * 输出：true
   * 解释：Symbol.toString()执行返回"function Symbol() { [native code] }"
   */
  function isNative (Ctor) {
    return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
  }

  var hasSymbol =
    typeof Symbol !== 'undefined' && isNative(Symbol) &&
    typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

  var _Set;
  if (typeof Set !== 'undefined' && isNative(Set)) {
    // 如果支持，就用原生的Set
    _Set = Set;
  } else {
    // 不支持，就模拟一个Set
    _Set = (function () {
      function Set () {
        this.set = Object.create(null);
      }
      Set.prototype.has = function has (key) {
        return this.set[key] === true
      };
      Set.prototype.add = function add (key) {
        this.set[key] = true;
      };
      Set.prototype.clear = function clear () {
        this.set = Object.create(null);
      };

      return Set;
    }());
  }

  var warn = noop;
  var tip = noop;
  var generateComponentTrace = (noop); // 绕过流程检查
  var formatComponentName = (noop);

  {
    // 是否含有console
    var hasConsole = typeof console !== 'undefined';
    var classifyRE = /(?:^|[-_])(\w)/g;
    // 将类名转成小驼峰
    var classify = function (str) { 
      return str.replace(classifyRE, function (c) { 
        return c.toUpperCase(); 
      }).replace(/[-_]/g, '');
    };

    // 默认警告函数
    warn = function (msg, vm) {
      var trace = vm ? generateComponentTrace(vm) : '';

      if (config.warnHandler) {
        config.warnHandler.call(null, msg, vm, trace);
      } else if (hasConsole && (!config.silent)) {
        console.error(("[Vue warn]: " + msg + trace));
      }
    };

    // 默认提示函数
    tip = function (msg, vm) {
      if (hasConsole && (!config.silent)) {
        console.warn("[Vue tip]: " + msg + (
          vm ? generateComponentTrace(vm) : ''
        ));
      }
    };

    /**
     * 格式化组件名称
     * 用于发出警告、提示时获取组件名称，或者用于设置vm的_name
     */
    formatComponentName = function (vm, includeFile) {
      if (vm.$root === vm) {
        return '<Root>'
      }
      var options = typeof vm === 'function' && vm.cid != null
        ? vm.options
        : vm._isVue
          ? vm.$options || vm.constructor.options
          : vm;
      var name = options.name || options._componentTag;
      var file = options.__file;
      if (!name && file) {
        var match = file.match(/([^/\\]+)\.vue$/);
        name = match && match[1];
      }

      return (
        (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
        (file && includeFile !== false ? (" at " + file) : '')
      )
    };

    /**
     * 生成重复的字符串
     * e.g:
     * 输入：'name' 3
     * 输出：'namenamename'
     */
    var repeat = function (str, n) {
      var res = '';
      while (n) {
        // 模为1则res += str
        if (n % 2 === 1) { res += str; }
        // 大于1，则str += str; 每循环一次，加一次str
        if (n > 1) { str += str; }
        // 有符号右位移一位
        n >>= 1;
      }
      return res
    };

    // 生成组件行为记录
    generateComponentTrace = function (vm) {
      if (vm._isVue && vm.$parent) {
        var tree = [];
        var currentRecursiveSequence = 0;
        while (vm) {
          if (tree.length > 0) {
            var last = tree[tree.length - 1];
            if (last.constructor === vm.constructor) {
              currentRecursiveSequence++;
              vm = vm.$parent;
              continue
            } else if (currentRecursiveSequence > 0) {
              tree[tree.length - 1] = [last, currentRecursiveSequence];
              currentRecursiveSequence = 0;
            }
          }
          tree.push(vm);
          vm = vm.$parent;
        }
        return '\n\nfound in\n\n' + tree
          .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
              ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
              : formatComponentName(vm))); })
          .join('\n')
      } else {
        return ("\n\n(found in " + (formatComponentName(vm)) + ")")
      }
    };
  }

  // 一个vue记录id
  var uid = 0;

  /**
   * 调度中心，用来收集观察者Watcher和通知观察者目标更新
   */
  var Dep = function Dep () {
    this.id = uid++;
    this.subs = []; // sub => 替代品
  };

  // 收集观察者
  Dep.prototype.addSub = function addSub (sub) {
    this.subs.push(sub);
  };

  // 移除观察者
  Dep.prototype.removeSub = function removeSub (sub) {
    remove(this.subs, sub);
  };

  // 触发观察者原型上的方法，添加依赖
  Dep.prototype.depend = function depend () {
    if (Dep.target) {
      Dep.target.addDep(this);
    }
  };

  // 通知观察者目标更新
  Dep.prototype.notify = function notify () {
    var subs = this.subs.slice();
    if (!config.async) {
      // sub不会在调度程序中排序，如果不运行async，我们现在需要对它们进行排序，以确保它们按正确的顺序启动
      subs.sort(function (a, b) { return a.id - b.id; });
    }
    for (var i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  };

  // 正在运行的当前目标观察程序。
  // 这是全局唯一的，因为一次只能评估一个观察者。
  Dep.target = null;
  var targetStack = [];

  // 添加目标对象到目标栈内存中
  // 给当前目标观察程序赋值
  function pushTarget (target) {
    targetStack.push(target);
    Dep.target = target;
  }

  // 从目标栈中移除最后一项
  // 给当前目标观察程序赋值为目标栈中的最后一项
  function popTarget () {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }

  /**
   * VNode节点构造器
   * @param {*} tag 标签
   * @param {*} data data
   * @param {*} children children
   * @param {*} text text
   * @param {*} elm dom节点
   * @param {*} context 上下文
   * @param {*} componentOptions options
   * @param {*} asyncFactory asyncFactory 异步构造工厂 在创建异步组件时，asyncFactory为Ctor
   */
  var VNode = function VNode (
    tag,
    data,
    children,
    text,
    elm,
    context,
    componentOptions,
    asyncFactory
  ) {
    this.tag = tag;
    this.data = data;
    this.children = children;
    this.text = text;
    this.elm = elm;
    this.ns = undefined;
    this.context = context;
    this.fnContext = undefined;
    this.fnOptions = undefined;
    this.fnScopeId = undefined;
    this.key = data && data.key;
    this.componentOptions = componentOptions;
    this.componentInstance = undefined;
    this.parent = undefined;
    this.raw = false;
    this.isStatic = false;
    this.isRootInsert = true;
    this.isComment = false;
    this.isCloned = false;
    this.isOnce = false;
    this.asyncFactory = asyncFactory;
    this.asyncMeta = undefined;
    this.isAsyncPlaceholder = false;
  };

  // 原型存取器
  var prototypeAccessors = { child: { configurable: true } };

  // 已弃用：用于向后兼容的组件实例的别名。
  prototypeAccessors.child.get = function () {
    return this.componentInstance
  };

  // VNode可以通过child获取到子组件的实例
  Object.defineProperties( VNode.prototype, prototypeAccessors );

  // 创建空节点（注释节点）
  var createEmptyVNode = function (text) {
    if ( text === void 0 ) text = '';

    var node = new VNode();
    node.text = text;
    node.isComment = true;
    return node
  };

  // 创建文本节点
  function createTextVNode (val) {
    return new VNode(undefined, undefined, undefined, String(val))
  }

  // 优化的浅层克隆用于静态节点和插槽节点，
  // 因为它们可以在多个渲染器中重用，因此克隆它们可以避免在DOM操作依赖于它们的elm引用时出错。
  function cloneVNode (vnode) {
    var cloned = new VNode(
      vnode.tag,
      vnode.data,
      // 克隆子数组，以避免在克隆时更改原始数组
      vnode.children && vnode.children.slice(),
      vnode.text,
      vnode.elm,
      vnode.context,
      vnode.componentOptions,
      vnode.asyncFactory
    );
    cloned.ns = vnode.ns;
    cloned.isStatic = vnode.isStatic;
    cloned.key = vnode.key;
    cloned.isComment = vnode.isComment;
    cloned.fnContext = vnode.fnContext;
    cloned.fnOptions = vnode.fnOptions;
    cloned.fnScopeId = vnode.fnScopeId;
    cloned.asyncMeta = vnode.asyncMeta;
    cloned.isCloned = true;
    return cloned
  }

  /*
   * 定义数组原型上的方法，以便使用这些方法时，达到触发视图更新。
   */
  var arrayProto = Array.prototype;
  var arrayMethods = Object.create(arrayProto);

  var methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
  ];

  /**
   * 拦截变异方法并发出事件
   */
  methodsToPatch.forEach(function (method) {
    // 原始缓存方法
    var original = arrayProto[method];
    // mutator => 设置方法
    def(arrayMethods, method, function mutator () {
      var args = [], len = arguments.length;
      while ( len-- ) args[ len ] = arguments[ len ];

      // 触发原始方法
      var result = original.apply(this, args);

      // 触发拦截代码
      var ob = this.__ob__;
      var inserted;
      // 为push，unshift添加元素时，inserted = args; 表示可以接收所有参数
      // 为splice时，只取前面三个参数
      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break
        case 'splice':
          inserted = args.slice(2);
          break
      }
      if (inserted) { ob.observeArray(inserted); }
      // 触发更新
      ob.dep.notify();
      return result
    });
  });

  // Object.getOwnPropertyNames方法返回一个由指定对象的所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性）组成的数组。
  var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

  /**
   * 在某些情况下，我们可能希望禁用组件更新计算中的观察能力。
   */
  var shouldObserve = true;

  // 该方法用来切换是否添加响应式（defineProperty)
  function toggleObserving (value) {
    shouldObserve = value;
  }

  /**
   * Observer类扮演的角色为发布者，主要用来劫持数据，在setter中向Dep添加观察者，在getter中通知观察者更新
   */
  var Observer = function Observer (value) {
    this.value = value;
    this.dep = new Dep();
    this.vmCount = 0;
    def(value, '__ob__', this);
    // 为数组或者对象添加观察者
    if (Array.isArray(value)) {
      if (hasProto) {
        protoAugment(value, arrayMethods);
      } else {
        copyAugment(value, arrayMethods, arrayKeys);
      }
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  };

  /**
   * 遍历所有属性并将它们转换为getter/setter。仅当值类型为Object时才应调用此方法。
   */
  Observer.prototype.walk = function walk (obj) {
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      defineReactive$$1(obj, keys[i]);
    }
  };

  /**
   * 遍历每一项，执行observe方法
   */
  Observer.prototype.observeArray = function observeArray (items) {
    for (var i = 0, l = items.length; i < l; i++) {
      observe(items[i]);
    }
  };

  /**
   * 通过拦截来扩充目标对象或阵列
   */
  function protoAugment (target, src) {
    target.__proto__ = src;
  }

  /**
   * 通过定义隐藏属性来扩充目标对象或数组。
   */
  function copyAugment (target, src, keys) {
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      def(target, key, src[key]);
    }
  }

  /**
   * 订阅者
   * 尝试为一个值创建一个观察者实例，如果观察成功，返回新的观察者，
   * 如果值已经有一个观察者，则返回现有的观察者。
   */
  function observe (value, asRootData) {
    if (!isObject(value) || value instanceof VNode) {
      return
    }
    var ob;
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
      ob = value.__ob__;
    } else if (
      shouldObserve &&
      !isServerRendering() &&
      (Array.isArray(value) || isPlainObject(value)) &&
      // Object.isExtensible方法判断一个对象是否是可扩展的（是否可以在它上面添加新的属性）。
      Object.isExtensible(value) &&
      !value._isVue
    ) {
      ob = new Observer(value);
    }
    if (asRootData && ob) {
      ob.vmCount++;
    }
    return ob
  }

  /**
   * 在对象上添加响应式（重点）
   * @param {Object} obj  给谁加
   * @param {String} key  要加的属性的名字
   * @param {*} val  监听的数据 返回的数据
   * @param {Function} customSetter 监听的数据 日志函数
   * @param {Boolean} shallow 是否要添加__ob__ 属性
   */
  function defineReactive$$1 (obj, key, val, customSetter, shallow) {
    var dep = new Dep();

    // 获取对象上的属性描述符
    var property = Object.getOwnPropertyDescriptor(obj, key);
    if (property && property.configurable === false) {
      return
    }

    // 预定义getter和setter
    var getter = property && property.get;
    var setter = property && property.set;
    // 如果实参只有2位，则val的值为obj设置的key值
    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }
    // 为 val添加__ob__ 属性
    // 递归把val添加到观察者中
    // 返回 new Observer 实例化的对象
    var childOb = !shallow && observe(val);
    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter () {
        var value = getter ? getter.call(obj) : val;
        // Dep.target静态标志，标志了Dep添加了Watcher实例化的对象
        // 观察者执行Watcher.prototype.get获取值时，设置Dep.target
        if (Dep.target) {
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              // 判断是否是数组 如果是数组, 则数组也添加dep
              dependArray(value);
            }
          }
        }
        return value
      },
      set: function reactiveSetter (newVal) {
        var value = getter ? getter.call(obj) : val;
        // 新旧值比较 如果是一样则return
        if (newVal === value || (newVal !== newVal && value !== value)) {
          return
        }
        // 监听的数据 日志函数
        if (customSetter) {
          customSetter();
        }
        if (getter && !setter) { return }
        if (setter) {
          //set方法 设置新的值
          setter.call(obj, newVal);
        } else {
          // 新的值直接给他
          val = newVal;
        }
        // 添加观察者
        childOb = !shallow && observe(newVal);
        // 发布订阅
        dep.notify();
      }
    });
  }

  /**
   * 设置对象的属性。添加新属性并在属性不存在时触发更改通知。
   * 如果 (target).__ob__ 存在则表明该数据以前添加过观察者对象中
   * 通知订阅者ob.value更新数据 添加观察者  define  set get 方法
   */
  function set (target, key, val) {
    // target必须是个对象（或数组）
    if (isUndef(target) || isPrimitive(target)) {
      warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
    }
    //如果是数组并且key是数字则直接更新数组
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val
    }
    // 如果是对象，并且该key值已存在（修改属性值），并且不是原型上的对象，则直接修改属性值
    if (key in target && !(key in Object.prototype)) {
      target[key] = val;
      return val
    }
    // 如果 (target).__ob__ 存在则表明该数据以前添加过观察者对象中 
    var ob = (target).__ob__;
    // Vue实例是指this，根数据对象是指（this.$data）
    // 这里印证了这句 `注意对象不能是 Vue 实例，或者 Vue 实例的根数据对象。`
    // 如果是在对象上新增属性，则程序会走到下面。
    // 修改vue实例（或跟数据对象）上的属性，不会发出警告
    // ----------------------------------------------------------------------
    // 使用target._isVue来判断是不是Vue.js实例，使用ob.vmCount来判断它是不是根数据对象
    // ob.vmCount在使用observe函数时，由第二个参数（asRootData)决定
    if (target._isVue || (ob && ob.vmCount)) {
      warn(
        'Avoid adding reactive properties to a Vue instance or its root $data ' +
        'at runtime - declare it upfront in the data option.'
      );
      return val
    }
    // 说明target不是响应式的
    if (!ob) {
      target[key] = val;
      return val
    }
    // 到这一步则印证了这句话 `向响应式对象中添加一个 property，并确保这个新 property 同样是响应式的，且触发视图更新。`
    // ob存在，则表明target对象是响应式的，印证了`它必须用于向响应式对象上添加新 property，因为 Vue 无法探测普通的新增 property。`
    // 将新增属性转换成getter/setter的形式
    defineReactive$$1(ob.value, key, val);
    // 通知订阅者ob.value更新数据
    ob.dep.notify();
    return val
  }

  /**
   * 删除属性并在必要时触发更改数据。
   */
  function del (target, key) {
    if (isUndef(target) || isPrimitive(target)) {
      warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
    }
    if (Array.isArray(target) && isValidArrayIndex(key)) {
      target.splice(key, 1);
      return
    }
    // 这个属性在new Observer时添加，值为Observeer，如果存在，则表明target是响应式对象
    var ob = (target).__ob__;
    // Vue实例是指this，根数据对象是指（this.$data）
    // 这里印证了这句 `目标对象不能是一个 Vue 实例或 Vue 实例的根数据对象。`
    // 删除vue实例（或跟数据对象）上的属性，会发出警告
    // ----------------------------------------------------------------------
    // 使用target._isVue来判断是不是Vue.js实例，使用ob.vmCount来判断它是不是根数据对象
    // ob.vmCount在使用observe函数时，由第二个参数（asRootData)决定
    if (target._isVue || (ob && ob.vmCount)) {
      warn(
        'Avoid deleting properties on a Vue instance or its root $data ' +
        '- just set it to null.'
      );
      return
    }
    // 如果没有这个属性，直接返回
    if (!hasOwn(target, key)) {
      return
    }
    delete target[key];
    if (!ob) {
      return
    }
    // 如果target是响应式的，触发通知
    ob.dep.notify();
  }

  /**
   * 在接触数组时收集对数组元素的依赖关系，因为我们不能像属性getter那样拦截数组元素访问。
   */
  function dependArray (value) {
    for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
      e = value[i];
      // 为数组中的每一项添加依赖
      e && e.__ob__ && e.__ob__.dep.depend();
      if (Array.isArray(e)) {
        dependArray(e);
      }
    }
  }

  /**
   * 选项覆盖策略是处理如何将父选项值和子选项值合并为最终值的函数。
   * 合并父参数和子参数的策略模式
   */
  var strats = config.optionMergeStrategies;

  /**
   * el和propsData的合并策略
   */
  {
    strats.el = strats.propsData = function (parent, child, vm, key) {
      // 只有通过new创建的实例，在mergeOptions时传入vm
      if (!vm) {
        warn(
          "option \"" + key + "\" can only be used during instance " +
          'creation with the `new` keyword.'
        );
      }
      // 返回默认合并对象的方法
      return defaultStrat(parent, child)
    };
  }

  /**
   * 递归地将两个数据对象合并在一起
   */
  function mergeData (to, from) {
    if (!from) { return to }
    var key, toVal, fromVal;

    var keys = hasSymbol
      ? Reflect.ownKeys(from)
      : Object.keys(from);

    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      // 如果属性值已经添加了响应式，则停止
      if (key === '__ob__') { continue }
      toVal = to[key];
      fromVal = from[key];
      if (!hasOwn(to, key)) {
        set(to, key, fromVal);
      } else if (
        toVal !== fromVal &&
        isPlainObject(toVal) &&
        isPlainObject(fromVal)
      ) {
        mergeData(toVal, fromVal);
      }
    }
    return to
  }

  /**
   * Data合并策略
   */
  function mergeDataOrFn (parentVal, childVal, vm) {
    if (!vm) {
      // 在一个Vue.扩展合并，两者都应该是函数
      if (!childVal) {
        return parentVal
      }
      if (!parentVal) {
        return childVal
      }
      // 当parentVal和childVal都存在时，我们需要返回一个返回两个函数的合并结果的函数。。。
      // 这里不需要检查parentVal是否是函数，因为它必须是一个函数才能传递以前的合并。
      return function mergedDataFn () {
        return mergeData(
          typeof childVal === 'function' ? childVal.call(this, this) : childVal,
          typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
        )
      }
    } else {
      return function mergedInstanceDataFn () {
        // 实例合并
        var instanceData = typeof childVal === 'function'
          ? childVal.call(vm, vm)
          : childVal;
        var defaultData = typeof parentVal === 'function'
          ? parentVal.call(vm, vm)
          : parentVal;
        if (instanceData) {
          return mergeData(instanceData, defaultData)
        } else {
          return defaultData
        }
      }
    }
  }

  // data合并策略
  strats.data = function (parentVal, childVal, vm) {
    if (!vm) {
      if (childVal && typeof childVal !== 'function') {
        warn(
          'The "data" option should be a function ' +
          'that returns a per-instance value in component ' +
          'definitions.',
          vm
        );

        return parentVal
      }
      return mergeDataOrFn(parentVal, childVal)
    }

    return mergeDataOrFn(parentVal, childVal, vm)
  };

  /**
   * 生命周期钩子合并策略
   */
  function mergeHook (parentVal, childVal) {
    var res = childVal
      ? parentVal
        ? parentVal.concat(childVal)
        : Array.isArray(childVal)
          ? childVal
          : [childVal]
      : parentVal;
    return res
      ? dedupeHooks(res)
      : res
  }

  // 数组去重
  function dedupeHooks (hooks) {
    var res = [];
    for (var i = 0; i < hooks.length; i++) {
      if (res.indexOf(hooks[i]) === -1) {
        res.push(hooks[i]);
      }
    }
    return res
  }

  // 生命周期钩子合并策略
  LIFECYCLE_HOOKS.forEach(function (hook) {
    strats[hook] = mergeHook;
  });

  /**
   * 当一个vm存在时（实例创建），我们需要在构造函数选项、实例选项和父选项之间进行三方合并。
   * 静态资源合并策略
   */
  function mergeAssets (parentVal, childVal, vm, key) {
    var res = Object.create(parentVal || null);
    if (childVal) {
      assertObjectType(key, childVal, vm);
      return extend(res, childVal)
    } else {
      return res
    }
  }

  // 静态资源合并策略
  ASSET_TYPES.forEach(function (type) {
    strats[type + 's'] = mergeAssets;
  });

  /**
   * watch合并策略
   *
   * 观察者不应该互相覆盖，所以我们将它们合并为数组。
   */
  strats.watch = function (parentVal, childVal, vm, key) {
    // 处理Firefox的Object.prototype.watch...
    if (parentVal === nativeWatch) { parentVal = undefined; }
    if (childVal === nativeWatch) { childVal = undefined; }
    if (!childVal) { return Object.create(parentVal || null) }
    {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = {};
    extend(ret, parentVal);
    for (var key$1 in childVal) {
      var parent = ret[key$1];
      var child = childVal[key$1];
      if (parent && !Array.isArray(parent)) {
        parent = [parent];
      }
      ret[key$1] = parent
        ? parent.concat(child)
        : Array.isArray(child) ? child : [child];
    }
    return ret
  };

  /**
   * props、methods、inject、computed合并策略
   */
  strats.props =
  strats.methods =
  strats.inject =
  strats.computed = function (parentVal, childVal, vm, key) {
    if (childVal && "development" !== 'production') {
      assertObjectType(key, childVal, vm);
    }
    if (!parentVal) { return childVal }
    var ret = Object.create(null);
    extend(ret, parentVal);
    // 采取直接覆盖的形式
    if (childVal) { extend(ret, childVal); }
    return ret
  };
  // provide合并策略
  strats.provide = mergeDataOrFn;

  /**
   * 默认的合并策略
   */
  var defaultStrat = function (parentVal, childVal) {
    return childVal === undefined
      ? parentVal
      : childVal
  };

  /**
   * 验证所有组件名称
   */
  function checkComponents (options) {
    for (var key in options.components) {
      validateComponentName(key);
    }
  }

  /**
   * 验证组件名称 
   * 必须是大驼峰命名或中划线命名（-）
   */
  function validateComponentName (name) {
    if (!new RegExp(("^[a-zA-Z][\\-\\.0-9_" + (unicodeRegExp.source) + "]*$")).test(name)) {
      warn(
        'Invalid component name: "' + name + '". Component names ' +
        'should conform to valid custom element name in html5 specification.'
      );
    }
    if (isBuiltInTag(name) || config.isReservedTag(name)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + name
      );
    }
  }

  /**
   * 确保所有props对象都符合规范(也就是符合第三种格式)
   * e.g.
   * 1、props: ['name'] => props: { name: { type: null } }
   * 2、props: { age: Number } => props: { age: { type: Number } }
   * 3、props: { age: { type: Number } } => props: { age: { type: Number } }
   */
  function normalizeProps (options, vm) {
    var props = options.props;
    if (!props) { return }
    var res = {};
    var i, val, name;
    // 如果props是个数组
    if (Array.isArray(props)) {
      i = props.length;
      while (i--) {
        val = props[i];
        if (typeof val === 'string') {
          name = camelize(val);
          res[name] = { type: null };
        } else {
          // 数组中的每一项必须都是字符串
          warn('props must be strings when using array syntax.');
        }
      }

    // 如果props是个对象
    } else if (isPlainObject(props)) {
      for (var key in props) {
        val = props[key];
        name = camelize(key);
        res[name] = isPlainObject(val)
          ? val
          : { type: val };
      }
    } else {
      warn(
        "Invalid value for option \"props\": expected an Array or an Object, " +
        "but got " + (toRawType(props)) + ".",
        vm
      );
    }
    options.props = res;
  }

  /**
   * 确保所有inject对象都符合规范
   */
  function normalizeInject (options, vm) {
    var inject = options.inject;
    if (!inject) { return }
    var normalized = options.inject = {};
    if (Array.isArray(inject)) {
      for (var i = 0; i < inject.length; i++) {
        normalized[inject[i]] = { from: inject[i] };
      }
    } else if (isPlainObject(inject)) {
      for (var key in inject) {
        var val = inject[key];
        normalized[key] = isPlainObject(val)
          ? extend({ from: key }, val)
          : { from: val };
      }
    } else {
      warn(
        "Invalid value for option \"inject\": expected an Array or an Object, " +
        "but got " + (toRawType(inject)) + ".",
        vm
      );
    }
  }

  /**
   * 将原始函数指令规范化为对象格式。
   */
  function normalizeDirectives (options) {
    // 注册全局自定义指令时，会在options.directives对象上添加一个key/value
    var dirs = options.directives;
    if (dirs) {
      for (var key in dirs) {
        var def$$1 = dirs[key];
        if (typeof def$$1 === 'function') {
          dirs[key] = { bind: def$$1, update: def$$1 };
        }
      }
    }
  }

  /**
   * 断言value是否是一个纯对象
   */
  function assertObjectType (name, value, vm) {
    if (!isPlainObject(value)) {
      warn(
        "Invalid value for option \"" + name + "\": expected an Object, " +
        "but got " + (toRawType(value)) + ".",
        vm
      );
    }
  }

  /**
   * 将两个选项对象合并为一个新对象。
   * 用于实例化和继承的核心实用程序。
   */
  function mergeOptions (parent, child, vm) {
    {
      checkComponents(child);
    }
    // 如果传入的child(mixin)是个函数，则child(mixin) = child(mixin).options;
    if (typeof child === 'function') {
      child = child.options;
    }

    normalizeProps(child, vm);
    normalizeInject(child, vm);
    normalizeDirectives(child);

    // 合并的child不是Vue时
    if (!child._base) {
      // 如果child单继承了其他组件（对象），则把继承的父对象合并到parent上
      if (child.extends) {
        parent = mergeOptions(parent, child.extends, vm);
      }
      // 使用cli创建的vue文件（组件），通过mixins: [/* 混入对象 */， /* 混入对象 */]来进行混入
      // 如果child使用了混入（多继承），则把混入的对象循环遍历并合并到parent上
      if (child.mixins) {
        for (var i = 0, l = child.mixins.length; i < l; i++) {
          parent = mergeOptions(parent, child.mixins[i], vm);
        }
      }
    }

    var options = {};
    var key;
    for (key in parent) {
      mergeField(key);
    }
    for (key in child) {
      if (!hasOwn(parent, key)) {
        mergeField(key);
      }
    }
    function mergeField (key) {
      // strats[key]为各种类型的合并策略方法
      // 举个栗子：
      // 当key为data时，start = strats.data = function () { //... }
      // 如果没有strats[key]不存在，则使用默认的defaultStrat合并策略
      var strat = strats[key] || defaultStrat;
      options[key] = strat(parent[key], child[key], vm, key);
    }
    return options
  }

  /**
   * 解析静态资源 
   * directives，filters，components
   */
  function resolveAsset (options, type, id, warnMissing) {
    // id = 组件名
    if (typeof id !== 'string') {
      return
    }
    var assets = options[type];
    // 如果静态资源上已存在该项，直接返回该项
    if (hasOwn(assets, id)) { return assets[id] }
    var camelizedId = camelize(id);
    if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
    var PascalCaseId = capitalize(camelizedId);
    if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
    var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
    if (warnMissing && !res) {
      warn(
        'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
        options
      );
    }
    return res
  }

  // 校验prop
  function validateProp (key, propOptions, propsData, vm) {
    var prop = propOptions[key];
    var absent = !hasOwn(propsData, key);
    var value = propsData[key];
    
    // 在mergeOptions时，执行了normalizeProps(即规范化了props)
    // 也就是说：prop.type => props: { name: { type: null } } 或者 props: { age: { type: Number } }
    var booleanIndex = getTypeIndex(Boolean, prop.type);
    // > -1 意味着 prop.type 为一个数组（该数组中含有Boolean类型）或者Boolean类型。为Boolean类型时，booleanIndex = 1
    if (booleanIndex > -1) {
      if (absent && !hasOwn(prop, 'default')) {
        // 父组件没传，并且子组件没设置有default属性时，value = false
        value = false;
      } else if (value === '' || value === hyphenate(key)) {
        // 父组件传了''字符串
        // 或者 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        /*
            props: {
                'data-list': {
                    type: Boolean
                }
            },
            propsData: { // 在执行extractPropsFromVNodeData函数时，会提炼出propsData，也就是我们在组件标签上定义的属性
                dataList: 'data-list'
            },
        */
        // 或者 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        /*
            props: {
                dataList: {
                    type: [Boolean, String]
                }
            },
            propsData: {
                dataList: '' // <MyChild flag ></MyChild> => propsData = { flag: "" }
            },
        */
        var stringIndex = getTypeIndex(String, prop.type);
        // stringIndex < 0表示prop.type不能是String类型
        // booleanIndex < stringIndex表示prop.type数组中'String'的索引大于'Boolean'的索引
        if (stringIndex < 0 || booleanIndex < stringIndex) {
          value = true;
        }
      }
    }
    // 检查默认值，意味着父组件没有传入该属性
    if (value === undefined) {
      // 获取默认值
      value = getPropDefaultValue(vm, prop, key);
      var prevShouldObserve = shouldObserve;
      // 将shouldObserve置为true
      toggleObserving(true);
      // 为value创建一个观察者实例
      observe(value);
      // 将shouldObserve置为上一个的值
      toggleObserving(prevShouldObserve);
    }
    {
      // 断言prop
      assertProp(prop, key, value, vm, absent);
    }
    return value
  }

  /**
   * 获取prop的默认值。
   */
  function getPropDefaultValue (vm, prop, key) {
    // 无默认值，返回undefined
    if (!hasOwn(prop, 'default')) {
      return undefined
    }
    var def = prop.default;
    // 警告：对象或数组默认值必须从一个工厂函数获取
    if (isObject(def)) {
      warn(
        'Invalid default value for prop "' + key + '": ' +
        'Props with type Object/Array must use a factory function ' +
        'to return the default value.',
        vm
      );
    }
    // 返回先前的默认值以避免不必要的监视触发器（也就是从缓存中获取）
    if (vm && vm.$options.propsData &&
      vm.$options.propsData[key] === undefined &&
      vm._props[key] !== undefined
    ) {
      return vm._props[key]
    }
    // props.default是一个工厂函数
    // 如果prop.type是一个函数，那么直接返回props.default
    // 如果prop.type不是函数，则执行工厂函数
    return typeof def === 'function' && getType(prop.type) !== 'Function'
      ? def.call(vm)
      : def
  }

  /**
   * 断言prop
   */
  function assertProp (prop, name, value, vm, absent) {
    if (prop.required && absent) {
      // required并且propsData中不含有key
      // 在执行extractPropsFromVNodeData函数时，会提炼出propsData，也就是我们在组件标签上定义的属性
      // example
      // <MyChild message="hello~"></MyChild> => propsData = { message: "hello~" }
      warn(
        'Missing required prop: "' + name + '"',
        vm
      );
      return
    }
    if (value == null && !prop.required) {
      return
    }
    var type = prop.type;
    var valid = !type || type === true;
    var expectedTypes = [];
    if (type) {
      if (!Array.isArray(type)) {
        // type最终都会被转成数组
        type = [type];
      }
      for (var i = 0; i < type.length && !valid; i++) {
        var assertedType = assertType(value, type[i]);
        expectedTypes.push(assertedType.expectedType || '');
        valid = assertedType.valid;
      }
    }

    // 验证类型失败
    if (!valid) {
      warn(
        // 获取警告消息
        getInvalidTypeMessage(name, value, expectedTypes),
        vm
      );
      return
    }
    // 自定义验证函数
    var validator = prop.validator;
    if (validator) {
      if (!validator(value)) {
        warn(
          'Invalid prop: custom validator check failed for prop "' + name + '".',
          vm
        );
      }
    }
  }

  var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

  /**
   * 类型断言
   * @param {*} value prop -> value
   * @param {*} type prop -> type
   */
  function assertType (value, type) {
    var valid;
    var expectedType = getType(type); // String|Number|Boolean|Function|Symbol
    if (simpleCheckRE.test(expectedType)) {
      var t = typeof value;
      valid = t === expectedType.toLowerCase(); // string|number|boolean|function|symbol
      if (!valid && t === 'object') { // 原始对象
        valid = value instanceof type;
      }
    } else if (expectedType === 'Object') {
      valid = isPlainObject(value);
    } else if (expectedType === 'Array') {
      valid = Array.isArray(value);
    } else {
      valid = value instanceof type;
    }
    return {
      valid: valid,
      expectedType: expectedType
    }
  }

  /**
   * 使用函数字符串名称检查内置类型，因为在不同的vm/iframe上运行时，简单的相等性检查将失败。
   */
  function getType (fn) {
    var match = fn && fn.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ''
  }

  /**
   * 判断传入的两个参数类型是否一致
   */
  function isSameType (a, b) {
    return getType(a) === getType(b)
  }

  /**
   * 获取期待类型在数组中的的索引
   */
  function getTypeIndex (type, expectedTypes) {
    if (!Array.isArray(expectedTypes)) {
      // 如果不是数组，直接判断传入的参数是否相同
      // example =>
      // isSameType(Numer, Boolean) => -1
      return isSameType(expectedTypes, type) ? 0 : -1
    }
    // prop.type = [String, Number, Object]
    // 类似 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    /*
        props: {
            age: {
                type: [String, Number, Object] // vue文档中没有这种写法，相当于扩展吧
            }
        }
    */
    for (var i = 0, len = expectedTypes.length; i < len; i++) {
      if (isSameType(expectedTypes[i], type)) {
        return i
      }
    }
    return -1
  }

  /**
   * 获取警告消息
   */
  function getInvalidTypeMessage (name, value, expectedTypes) {
    var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
      " Expected " + (expectedTypes.map(capitalize).join(', '));
    var expectedType = expectedTypes[0]; // 子组件期望获得的类型：Number | String ...
    var receivedType = toRawType(value); // 父组件传递的值类型
    var expectedValue = styleValue(value, expectedType);  // 子组件期望获得的值
    var receivedValue = styleValue(value, receivedType); // 父组件传递的值
    // 检查是否需要指定的预期值
    if (expectedTypes.length === 1 &&
        isExplicable(expectedType) &&
        !isBoolean(expectedType, receivedType)) {
      // 当类型不为Boolean类型时，message就会添加下面这串
      message += " with value " + expectedValue;
    }
    message += ", got " + receivedType + " ";
    // 检查是否是需要指定接收值
    if (isExplicable(receivedType)) {
      message += "with value " + receivedValue + ".";
    }
    return message
  }

  /**
   * 花式改变值
   */
  function styleValue (value, type) {
    if (type === 'String') {
      return ("\"" + value + "\"")
    } else if (type === 'Number') {
      return ("" + (Number(value)))
    } else {
      /*
        当value = { name: fanqiewa, age: 18 }
        则
        "" + value
        =>
        "[object Object]"
      */
      return ("" + value)
    }
  }

  /**
   * 判断传入的值是否等于值类型
   */
  function isExplicable (value) {
    // 明确的类型
    var explicitTypes = ['string', 'number', 'boolean'];
    return explicitTypes.some(function (elem) { return value.toLowerCase() === elem; })
  }

  /**
   * 只要arguments中有一项是Boolean类型，则返回true
   */
  function isBoolean () {
    var args = [], len = arguments.length;
    while ( len-- ) args[ len ] = arguments[ len ];

    return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
  }

  /**
   * 处理错误函数
   */
  function handleError (err, vm, info) {
    pushTarget();
    try {
      if (vm) {
        var cur = vm;
        while ((cur = cur.$parent)) {
          var hooks = cur.$options.errorCaptured;
          if (hooks) {
            for (var i = 0; i < hooks.length; i++) {
              try {
                var capture = hooks[i].call(cur, err, vm, info) === false;
                // 返回false，阻止错误向上传播
                if (capture) { return }
              } catch (e) {
                globalHandleError(e, cur, 'errorCaptured hook');
              }
            }
          }
        }
      }
      globalHandleError(err, vm, info);
    } finally {
      popTarget();
    }
  }

  /**
   * 执行handler方法
   */
  function invokeWithErrorHandling (handler, context, args, vm, info) {
    var res;
    try {
      res = args ? handler.apply(context, args) : handler.call(context);
      // 当handler执行返回一个promise对象时
      if (res && !res._isVue && isPromise(res) && !res._handled) {
        res.catch(function (e) { return handleError(e, vm, info + " (Promise/async)"); });
         // 避免在嵌套调用时多次触发catch
        res._handled = true;
      }
    } catch (e) {
      handleError(e, vm, info);
    }
    return res
  }

  /**
   * 全局错误处理函数
   */
  function globalHandleError (err, vm, info) {
    if (config.errorHandler) {
      try {
        return config.errorHandler.call(null, err, vm, info)
      } catch (e) {
        if (e !== err) {
          logError(e, null, 'config.errorHandler');
        }
      }
    }
    logError(err, vm, info);
  }

  /**
   * 错误日志
   */
  function logError (err, vm, info) {
    {
      warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
    }
    if ((inBrowser || inWeex) && typeof console !== 'undefined') {
      console.error(err);
    } else {
      throw err
    }
  }
// 是否可用微任务
  var isUsingMicroTask = false;

  // 存储回调函数
  var callbacks = [];
  var pending = false;

  /**
   * 轮询callbacks，执行每一项fn
   */
  function flushCallbacks () {
    pending = false;
    var copies = callbacks.slice(0);
    callbacks.length = 0;
    for (var i = 0; i < copies.length; i++) {
      copies[i]();
    }
  }

  // 这里我们有使用微任务的异步延迟包装器。
  // 在2.5中，我们使用了（宏）任务（与微任务相结合）。
  // 然而，当状态在重新绘制之前被更改时，它会有一些微妙的问题
  // （例如#6813，输出转换）。
  // Also, using (macro) tasks in event handler would cause some weird behaviors
  // 另外，在事件处理程序中使用（宏）任务会导致一些无法避免的奇怪行为（例如#7109、#7153、#7546、#7834、#8109）。
  // 所以我们现在到处都在使用微任务。
  // 这种折衷的一个主要缺点是，在某些情况下，微任务的优先级太高，
  // 并且在假定的顺序事件（例如#4521，#6690，它们有解决方法）之间，
  // 或者甚至在同一事件的冒泡之间（#6566）。
  var timerFunc;

  // nextTick行为利用了微任务队列，它可以通过本机访问答应我。那么或是变异观察者。
  // MutationObserver有更广泛的支持，但是在iOS>=9.3.3的UIWebView中，
  // 当触发intouch事件处理程序时，它会受到严重的错误影响。 It
  // 它在触发几次后完全停止工作。。。因此，如果native Promise可用，我们将使用它：
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve();
    timerFunc = function () {
      p.then(flushCallbacks);
      // 添加到微任务队列中
      // 所以Vue.prototype.$nextTick 在后面执行，因为这里是在异步任务中
      if (isIOS) { setTimeout(noop); }
    };
    isUsingMicroTask = true;
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // 如果当前环境Promise不可用，请使用MutationObserver，
    // e.g. PhantomJS, iOS7, Android 4.4
    // (#6466 IE11 不支持MutationObserver)
    // Mutation Observer API 用来监视 DOM 变动。DOM 的任何变动，比如节点的增减、属性的变动、文本内容的变动，这个 API 都可以得到通知。
    // https://javascript.ruanyifeng.com/dom/mutationobserver.html
    var counter = 1;
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(String(counter));
    observer.observe(textNode, {
      characterData: true // 节点内容或节点文本的变动。
    });
    timerFunc = function () {
      counter = (counter + 1) % 2;
      textNode.data = String(counter);
    };
    isUsingMicroTask = true;
  } else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    // 从技术上讲，它利用了（宏）任务队列，但它仍然是比setTimeout更好的选择。
    // node中的API
    timerFunc = function () {
      setImmediate(flushCallbacks);
    };
  } else {
    // 实在是不行了，只能用setTimeout了
    timerFunc = function () {
      setTimeout(flushCallbacks, 0);
    };
  }
  // 为callbacks收集队列cb函数，并且根据pending状态来决定是否要触发callbacks队列中的函数
  function nextTick (cb, ctx) {
    var _resolve;
    callbacks.push(function () {
      if (cb) {
        try {
          cb.call(ctx);
        } catch (e) {
          handleError(e, ctx, 'nextTick');
        }
      } else if (_resolve) {
        _resolve(ctx);
      }
    });
    if (!pending) {
      pending = true;
      timerFunc(); // 入口，把队列里面的函数取出来执行
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise(function (resolve) {
        _resolve = resolve;
      })
    }
  }

  var mark; // mark方法用来自定义添加标记时间
  var measure; // 在浏览器的指定 start mark 和 end mark 间的性能输入缓冲区中创建一个指定名称的时间戳

  {
    var perf = inBrowser && window.performance;
    if (
      perf &&
      perf.mark &&
      perf.measure &&
      perf.clearMarks &&
      perf.clearMeasures
    ) {
      mark = function (tag) { return perf.mark(tag); };
      measure = function (name, startTag, endTag) {
        perf.measure(name, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
      };
    }
  }

  /*************************************************************/
  var initProxy;

  {
    // 全局属性
    var allowedGlobals = makeMap(
      'Infinity,undefined,NaN,isFinite,isNaN,' +
      'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
      'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
      'require'
    );
    
    // 属性或方法不存在时，打印出警告
    var warnNonPresent = function (target, key) {
      warn(
        "Property or method \"" + key + "\" is not defined on the instance but " +
        'referenced during render. Make sure that this property is reactive, ' +
        'either in the data option, or for class-based components, by ' +
        'initializing the property. ' +
        'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
        target
      );
    };

    // 属性或方法不存在时，打印出警告
    var warnReservedPrefix = function (target, key) {
      warn(
        "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
        'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
        'prevent conflicts with Vue internals' +
        'See: https://vuejs.org/v2/api/#data',
        target
      );
    };

    var hasProxy =
      typeof Proxy !== 'undefined' && isNative(Proxy);

    if (hasProxy) {
      // 内置修饰词（事件）
      var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
      // 给 v-on 自定义键位别名。添加拦截。如果新增的修饰词等于内置修饰词，则发出警告
      config.keyCodes = new Proxy(config.keyCodes, {
        set: function set (target, key, value) {
          if (isBuiltInModifier(key)) {
            warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
            return false
          } else {
            // 自定义键盘事件
            target[key] = value;
            return true
          }
        }
      });
    }

    // proxy has拦截器
    var hasHandler = {
      has: function has (target, key) {
        var has = key in target;
        var isAllowed = allowedGlobals(key) ||
          (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
        if (!has && !isAllowed) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return has || !isAllowed
      }
    };

    // proxy get拦截器
    var getHandler = {
      get: function get (target, key) {
        if (typeof key === 'string' && !(key in target)) {
          if (key in target.$data) { warnReservedPrefix(target, key); }
          else { warnNonPresent(target, key); }
        }
        return target[key]
      }
    };

    // 初始化proxy
    initProxy = function initProxy (vm) {
      if (hasProxy) {
        var options = vm.$options;
        var handlers = options.render && options.render._withStripped
          ? getHandler
          : hasHandler;
        vm._renderProxy = new Proxy(vm, handlers);
      } else {
        vm._renderProxy = vm;
      }
    };
  }

  /*************************************************************/

  var seenObjects = new _Set();

  /**
   * 递归地遍历一个对象以调用所有已转换的getter，
   * 因此对象中的每个嵌套属性都作为“深层”依赖项收集。
   */
  function traverse (val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
  }

  // 深度监听 deep: true
  function _traverse (val, seen) {
    var i, keys;
    var isA = Array.isArray(val);
    // Object.isFrozen()方法判断一个对象是否被冻结。
    if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
      return
    }
    if (val.__ob__) {
      var depId = val.__ob__.dep.id;
      if (seen.has(depId)) {
        return
      }
      seen.add(depId);
    }
    if (isA) {
      i = val.length;
      while (i--) { _traverse(val[i], seen); }
    } else {
      keys = Object.keys(val);
      i = keys.length;
      // 对对象中的每一项取值,取值时会执行对应的get方法，就会添加依赖
      while (i--) { _traverse(val[keys[i]], seen); }
    }
  }

  /*************************************************************/

  /**
   * 格式化事件修饰符
   * 如果添加了passive、once、capture修饰词，
   * 则事件名称会被prependModifierMarker方法添加前缀。
   * 
   * 这个函数的作用是剔除掉前缀，返回事件对象
   * 
   */
  var normalizeEvent = cached(function (name) {
    var passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    var once$$1 = name.charAt(0) === '~';
    name = once$$1 ? name.slice(1) : name;
    var capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
      name: name, // 事件名
      once: once$$1, // 设置事件只能触发一次
      capture: capture, // 捕获冒泡
      passive: passive // 该修饰符大概意思用于对DOM的默认事件进行性能优化
    }
  });
  
  /**
   * 如果事件只是个函数就为事件添加多一个静态类， invoker.fns = fns; 
   * 把真正的事件放在fns。而 invoker 则是转义fns然后再运行fns
   */
  function createFnInvoker (fns, vm) {
    function invoker () {
      var arguments$1 = arguments;

      var fns = invoker.fns;
      if (Array.isArray(fns)) {
        var cloned = fns.slice();
        for (var i = 0; i < cloned.length; i++) {
          invokeWithErrorHandling(cloned[i], null, arguments$1, vm, "v-on handler");
        }
      } else {
        return invokeWithErrorHandling(fns, null, arguments, vm, "v-on handler")
      }
    }
    invoker.fns = fns;
    return invoker
  }
  /**
   * 更新事件 并且为新的值添加函数 旧的值删除函数等功能
   */
  function updateListeners (on, oldOn, add, remove$$1, createOnceHandler, vm) {
    var name, def$$1, cur, old, event;
    for (name in on) {
      def$$1 = cur = on[name]; // 事件新值
      old = oldOn[name];
      // 格式化事件 e.g. { capture: true, name: 'click', once: false, passive: false }
      event = normalizeEvent(name);
      if (isUndef(cur)) {
        warn(
          "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
          vm
        );
      } else if (isUndef(old)) { // 判断旧的值是否存在 为空的时候  没有定义旧的事件
        if (isUndef(cur.fns)) { //如果函数不存在 则绑定函数
          cur = on[name] = createFnInvoker(cur, vm);
        }
        // e.g. v-once
        if (isTrue(event.once)) {
          cur = on[name] = createOnceHandler(event.name, cur, event.capture);
        }
        add(event.name, cur, event.capture, event.passive, event.params);
      } else if (cur !== old) {
        old.fns = cur;
        on[name] = old;
      }
    }
    for (name in oldOn) {
      if (isUndef(on[name])) {
        event = normalizeEvent(name);
        // 移除事件
        remove$$1(event.name, oldOn[name], event.capture);
      }
    }
  }


  /**
   * 合并VNode的Hook
   */
  function mergeVNodeHook (def, hookKey, hook) {
    if (def instanceof VNode) {
      def = def.data.hook || (def.data.hook = {});
    }
    var invoker;
    var oldHook = def[hookKey];

    function wrappedHook () {
      hook.apply(this, arguments);
      // 要点：删除合并的钩子以确保只调用一次并防止内存泄漏
      remove(invoker.fns, wrappedHook);
    }

    if (isUndef(oldHook)) {
      // 不存在旧hook
      invoker = createFnInvoker([wrappedHook]);
    } else {
      if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
        // 已经是一个合并的调用程序
        invoker = oldHook;
        invoker.fns.push(wrappedHook);
      } else {
        // 已存在原生的hook
        invoker = createFnInvoker([oldHook, wrappedHook]);
      }
    }

    invoker.merged = true;
    def[hookKey] = invoker;
  }

  /*************************************************************/

  /**
   * 提炼 props
   */
  function extractPropsFromVNodeData (data, Ctor, tag) {
    var propOptions = Ctor.options.props;
    // 如果子组件没有定义props，直接return
    if (isUndef(propOptions)) {
      return
    }
    var res = {};
    var attrs = data.attrs; // 定义在组件标签上的属性
    var props = data.props;
    if (isDef(attrs) || isDef(props)) {
      for (var key in propOptions) {
        var altKey = hyphenate(key);
        {
          var keyInLowerCase = key.toLowerCase();
          if (
            key !== keyInLowerCase &&
            attrs && hasOwn(attrs, keyInLowerCase)
          ) {
            // 两种情况会出现如下提示：
            // 1、当子组件props中的属性采用小驼峰命名时，通过子组件标签传入属性时没有采用中划线命名
            // 2、当子组件props采用中划线命名时，通过子组件标签传入属性时采用了小驼峰命名
            tip(
              "Prop \"" + keyInLowerCase + "\" is passed to component " +
              (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
              " \"" + key + "\". " +
              "Note that HTML attributes are case-insensitive and camelCased " +
              "props need to use their kebab-case equivalents when using in-DOM " +
              "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
            );
          }
        }
        // 校验props，如果校验成功，并将校验成功的prop属性添加到res对象中
        checkProp(res, props, key, altKey, true) ||
        checkProp(res, attrs, key, altKey, false);
      }
    }
    return res
  }

  /**
   * 校验prop
   */
  function checkProp (res, hash, key, altKey, preserve) {
    if (isDef(hash)) {
      if (hasOwn(hash, key)) {
        res[key] = hash[key];
        if (!preserve) { // preserve为false，将删除hash对象的属性名为key的属性
          delete hash[key];
        }
        return true
      } else if (hasOwn(hash, altKey)) {
        res[key] = hash[altKey];
        if (!preserve) {
          delete hash[altKey];
        }
        return true
      }
    }
    return false
  }

  /*************************************************************/
  // 模板编译器试图通过在编译时静态分析模板来尽量减少规范化的需要。
  //
  // 对于纯HTML标记，可以完全跳过规范化，
  // 因为生成的呈现函数保证返回Array<VNode>。有两种情况需要额外规范化：

  // 1. 把所有子节点的数组 子孙连接在一个数组。
  function simpleNormalizeChildren (children) {
    for (var i = 0; i < children.length; i++) {
      if (Array.isArray(children[i])) {
        return Array.prototype.concat.apply([], children)
      }
    }
    return children
  }

  // 2. 创建一个规范的子节点
  function normalizeChildren (children) {
    return isPrimitive(children)
      ? [createTextVNode(children)]
      : Array.isArray(children)
        ? normalizeArrayChildren(children)
        : undefined
  }

  // 检查node节点是否是文本节点
  function isTextNode (node) {
    return isDef(node) && isDef(node.text) && isFalse(node.isComment)
  }

  // 格式化数组的子节点
  function normalizeArrayChildren (children, nestedIndex) {
    var res = [];
    var i, c, lastIndex, last;
    for (i = 0; i < children.length; i++) {
      c = children[i];
      if (isUndef(c) || typeof c === 'boolean') { continue }
      lastIndex = res.length - 1;
      last = res[lastIndex];
      // 嵌套
      if (Array.isArray(c)) {
        if (c.length > 0) {
          c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
          // 合并相邻文本节点
          if (isTextNode(c[0]) && isTextNode(last)) {
            res[lastIndex] = createTextVNode(last.text + (c[0]).text);
            c.shift();
          }
          res.push.apply(res, c);
        }
      } else if (isPrimitive(c)) {
        if (isTextNode(last)) { // 如果最后一个节点为文本节点
          // 合并相邻的文本节点这对于SSR hydration是必要的，
          // 因为文本节点在呈现为HTML字符串时基本上是合并的
          // hydration => 水合，将后端返回的数据填充到对象上
          res[lastIndex] = createTextVNode(last.text + c);
        } else if (c !== '') {
          // 插入第一个
          res.push(createTextVNode(c));
        }
      } else {
        if (isTextNode(c) && isTextNode(last)) {
          res[lastIndex] = createTextVNode(last.text + c.text);
        } else {
          // 嵌套数组子级的默认键（可能由v-for生成）
          if (isTrue(children._isVList) &&
            isDef(c.tag) &&
            isUndef(c.key) &&
            isDef(nestedIndex)) {
            c.key = "__vlist" + nestedIndex + "_" + i + "__";
          }
          res.push(c);
        }
      }
    }
    return res
  }

  /**
   * 初始化provide
   */
  function initProvide (vm) {
    var provide = vm.$options.provide;
    if (provide) {
      // 挂载的vm的_provided上
      vm._provided = typeof provide === 'function'
        ? provide.call(vm)
        : provide;
    }
  }

  /**
   * 初始化inject
   */
  function initInjections (vm) {
    var result = resolveInject(vm.$options.inject, vm);
    if (result) {
      toggleObserving(false);
      // inject属性的改变不会触发视图的更新
      Object.keys(result).forEach(function (key) {
        {
          defineReactive$$1(vm, key, result[key], function () {
            // 避免直接改变注入值，因为只要所提供的组件重新呈现，更改就会被覆盖。
            warn(
              "Avoid mutating an injected value directly since the changes will be " +
              "overwritten whenever the provided component re-renders. " +
              "injection being mutated: \"" + key + "\"",
              vm
            );
          });
        }
      });
      toggleObserving(true);
    }
  }

  /**
   * 解析inject
   * @return { foo: "bar" }
   */
  function resolveInject (inject, vm) {
    if (inject) {
      var result = Object.create(null);

      /*
        Object.keys()主要用于遍历对象自有的可枚举属性，不包括继承自原型的属性和不可枚举的属性。
        Reflect.ownKeys()返回所有自有属性key，不管是否可枚举，但不包括继承自原型的属性
      */
      var keys = hasSymbol
        ? Reflect.ownKeys(inject)
        : Object.keys(inject);

      /*
        inject: {
          foo: {
            from: 'bar',
            default: () => [1, 2, 3]
          }
        }
      */
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key === '__ob__') { continue }
        var provideKey = inject[key].from;
        var source = vm;
        while (source) {
          if (source._provided && hasOwn(source._provided, provideKey)) {
            result[key] = source._provided[provideKey];
            break
          }
          source = source.$parent;
        }
        if (!source) {
          // 处理default默认值
          if ('default' in inject[key]) {
            var provideDefault = inject[key].default;
            result[key] = typeof provideDefault === 'function'
              ? provideDefault.call(vm)
              : provideDefault;
          } else {
            warn(("Injection \"" + key + "\" not found"), vm);
          }
        }
      }
      return result
    }
  }

  /*  */



  /**
   * 用于将原始子VNode解析为slot对象
   * 解析slots
   * @returns { string: VNode } e.g. { default: [VNode], header: [VNode]}
   */
  function resolveSlots (children, context) {
    /*
      e.g.
      <child>
        <div slot="header">
          slot: header
        </div>
      </child>
    */
    if (!children || !children.length) {
      return {}
    }
    var slots = {};
    for (var i = 0, l = children.length; i < l; i++) {
      var child = children[i];
      var data = child.data;
      // 如果节点解析为Vue插槽节点，请删除插槽属性
      if (data && data.attrs && data.attrs.slot) {
        delete data.attrs.slot;
      }
      // 仅当vnode在同一上下文中呈现时，才应考虑命名槽。
      if ((child.context === context || child.fnContext === context) &&
        data && data.slot != null
      ) {
        var name = data.slot;
        var slot = (slots[name] || (slots[name] = []));
        if (child.tag === 'template') {
          slot.push.apply(slot, child.children || []);
        } else {
          slot.push(child);
        }
      } else {
        (slots.default || (slots.default = [])).push(child);
      }
    }
    // 忽略只包含空白的插槽
    for (var name$1 in slots) {
      if (slots[name$1].every(isWhitespace)) {
        delete slots[name$1];
      }
    }
    return slots
  }

  // 是否是空白节点
  function isWhitespace (node) {
    return (node.isComment && !node.asyncFactory) || node.text === ' '
  }

  /**
   * 格式化作用域插槽 
   * 在执行_render时调用
   */
  function normalizeScopedSlots (slots, normalSlots, prevSlots) {
    var res;
    // 是否拥有常规的插槽
    var hasNormalSlots = Object.keys(normalSlots).length > 0;
    // 是否为稳定的
    var isStable = slots ? !!slots.$stable : !hasNormalSlots;
    var key = slots && slots.$key;
    if (!slots) {
      res = {};
    } else if (slots._normalized) {
      // 已经被格式化过了
      // 快速通道 1: 子组件仅重新渲染，父组件未更改
      return slots._normalized
    } else if (
      isStable &&
      prevSlots &&
      prevSlots !== emptyObject &&
      key === prevSlots.$key &&
      !hasNormalSlots &&
      !prevSlots.$hasNormal
    ) {
      // 快速通道 2: 稳定作用域的插槽，没有正常的代理插槽，只需规范化一次
      return prevSlots
    } else {
      res = {};
      for (var key$1 in slots) {
        if (slots[key$1] && key$1[0] !== '$') {
          res[key$1] = normalizeScopedSlot(normalSlots, key$1, slots[key$1]);
        }
      }
    }
    // 暴露scopedSlots上的普通插槽
    for (var key$2 in normalSlots) {
      if (!(key$2 in res)) {
        res[key$2] = proxyNormalSlot(normalSlots, key$2);
      }
    }

    if (slots && Object.isExtensible(slots)) {
      (slots)._normalized = res;
    }
    def(res, '$stable', isStable);
    def(res, '$key', key);
    def(res, '$hasNormal', hasNormalSlots);
    return res
  }

  /**
   * 格式化作用域插槽 
   */
  function normalizeScopedSlot(normalSlots, key, fn) {
    var normalized = function () {
      // 在执行renderSlot时调用
      var res = arguments.length ? fn.apply(null, arguments) : fn({});
      res = res && typeof res === 'object' && !Array.isArray(res)
        ? [res] // single vnode
        : normalizeChildren(res);
      return res && (
        res.length === 0 ||
        (res.length === 1 && res[0].isComment)
      ) ? undefined
        : res
    };
    // 具名插槽添加拦截
    // e.g. vm.$slots.header
    if (fn.proxy) {
      Object.defineProperty(normalSlots, key, {
        get: normalized,
        enumerable: true,
        configurable: true
      });
    }
    return normalized
  }
  // 为插槽内容添加代理
  function proxyNormalSlot(slots, key) {
    return function () { return slots[key]; }
  }

  /************************************************************/

  /**
   * 渲染v-for处理函数
   */
  function renderList (val, render) {
    var ret, i, l, keys, key;
    if (Array.isArray(val) || typeof val === 'string') {
      ret = new Array(val.length);
      for (i = 0, l = val.length; i < l; i++) {
        ret[i] = render(val[i], i);
      }
    } else if (typeof val === 'number') {
      ret = new Array(val);
      for (i = 0; i < val; i++) {
        ret[i] = render(i + 1, i);
      }
    } else if (isObject(val)) {
      if (hasSymbol && val[Symbol.iterator]) {
        ret = [];
        var iterator = val[Symbol.iterator]();
        var result = iterator.next();
        while (!result.done) {
          ret.push(render(result.value, ret.length));
          result = iterator.next();
        }
      } else {
        keys = Object.keys(val);
        ret = new Array(keys.length);
        for (i = 0, l = keys.length; i < l; i++) {
          key = keys[i];
          ret[i] = render(val[key], key, i);
        }
      }
    }
    if (!isDef(ret)) {
      ret = [];
    }
    (ret)._isVList = true;
    return ret
  }

  /************************************************************/

  /**
   * 渲染<slot>助手函数 
   * e.g. <slot name="header"></slot>
   */
  function renderSlot (name, fallback, props, bindObject) {
    var scopedSlotFn = this.$scopedSlots[name];
    var nodes;
    if (scopedSlotFn) { // scoped slot
      props = props || {};
      if (bindObject) {
        if (!isObject(bindObject)) {
          warn(
            'slot v-bind without argument expects an Object',
            this
          );
        }
        props = extend(extend({}, bindObject), props);
      }
      // 执行normalizeScopedSlot函数代理的方法
      nodes = scopedSlotFn(props) || fallback;
    } else {
      nodes = this.$slots[name] || fallback;
    }

    var target = props && props.slot;
    if (target) {
      return this.$createElement('template', { slot: target }, nodes)
    } else {
      return nodes
    }
  }

  /************************************************************/

  /**
   * 解析filters
   */
  function resolveFilter (id) {
    return resolveAsset(this.$options, 'filters', id, true) || identity
  }

  /************************************************************/
  
  /**
   * 两个key是否不相等，否：返回false，是：返回true（有点绕^(oo)^）
   * @param {String | Array} expect 源字符
   * @param {String} actual 目标字符
   */
  function isKeyNotMatch (expect, actual) {
    if (Array.isArray(expect)) {
      return expect.indexOf(actual) === -1
    } else {
      return expect !== actual
    }
  }

  /**
   * 检测keyCodes
   * 检查两个key是否相等，如果不相等返回true 如果相等返回false
   * @param {*} eventKeyCode $event.keyCode 键盘的键码值，如：179
   * @param {*} key 如："esc" || "media-play-pause" || "abc"
   * @param {*} builtInKeyCode 'undefined' || 27(键盘码)
   * @param {*} eventKeyName $event.key // 表示按下键的名称，如abcdef
   * @param {*} builtInKeyName 'undefined' || （keyNames对象中的属性，keyNames为Vue内部定义的对象）
   * @returns boolean
   * @example 
   * 如果返回true，则v-on绑定的函数将不会执行 源码如下：_k表示checkKeyCodes
   * 
   * 1、使用Vue自定义的类型（keyNames），并且用户没有自定义，即没有通过Vue.config.keyCodes设置
   * // => return false
   * 如果按了其他键盘按钮，将会返回true
   * if (!$event.type.indexOf('key') && _k($event.keyCode, "esc", 27, $event.key, ["Esc", "Escape"])) return null;
   * 
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * 
   * 2、用户自定义了Vue.config.keyCodes
   * // => false
   * // 如果按了其他键盘按钮，将会返回true
   * if (!$event.type.indexOf('key') && _k($event.keyCode, "media-play-pause", undefined, $event.key, undefined)) return null;
   * 
   * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
   * 
   * 3、用户既没有自定义Vue.config.keyCodes，也没有使用Vue中自带的keyNames
   * // => return false
   * 如果按了其他键盘按钮，将会返回true
   * if (!$event.type.indexOf('key') && _k($event.keyCode, "a", undefined, $event.key, undefined)) return null;
   * 
   */
  function checkKeyCodes (eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) {
    // 键盘码
    var mappedKeyCode = config.keyCodes[key] || builtInKeyCode;
    // 如果builtInKeyName存在(表明是Vue中自定义的按键），并且按键存在，config.keyCodes用户并没有自定义这个键
    if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
      // 举个栗子：builtInKeyName = Tab    eventKeyName = Tab 则返回false
      return isKeyNotMatch(builtInKeyName, eventKeyName)
      // 表示自定义了按键码: Vue.config.keyCodes = { "media-play-pause": 179, } 暂停
    } else if (mappedKeyCode) {
      // 举个栗子：mappedKeyCode = 179 eventKeyCode = 179 则返回false
      return isKeyNotMatch(mappedKeyCode, eventKeyCode)
      // 表示既没自定义有keyCodes，也没有使用Vue中自带的keyNames
    } else if (eventKeyName) {
      // 举个栗子： eventKeyName = a    key = a 则返回false
      return hyphenate(eventKeyName) !== key
      // hyphenate将按键名变成中划线命名并且转为小写，所以v-on绑定修饰符时，
      // 应该为中划线命名法
    }
  }

  /**
   * 渲染v-bind绑定数组或对象的处理函数 
   * e.g. v-bind="{aa: name}"
   */
  function bindObjectProps (data, tag, value, asProp, isSync) {
    if (value) {
      if (!isObject(value)) {
        // 无参数的v-bind需要一个对象或数组值
        warn(
          'v-bind without argument expects an Object or Array value',
          this
        );
      } else {
        if (Array.isArray(value)) {
          value = toObject(value);
        }
        var hash;
        var loop = function ( key ) {
          if (
            key === 'class' ||
            key === 'style' ||
            isReservedAttribute(key)
          ) {
            hash = data;
          } else {
            var type = data.attrs && data.attrs.type;
            hash = asProp || config.mustUseProp(tag, type, key)
              ? data.domProps || (data.domProps = {})
              : data.attrs || (data.attrs = {});
          }
          var camelizedKey = camelize(key);
          var hyphenatedKey = hyphenate(key);
          if (!(camelizedKey in hash) && !(hyphenatedKey in hash)) {
            hash[key] = value[key];
            // .sync
            if (isSync) {
              var on = data.on || (data.on = {});
              on[("update:" + key)] = function ($event) {
                value[key] = $event;
              };
            }
          }
        };

        for (var key in value) loop( key );
      }
    }
    return data
  }

  /************************************************************/

  /**
   * 渲染静态节点处理函数 
   */
  function renderStatic (index, isInFor) {
    // 缓存静态节点
    var cached = this._staticTrees || (this._staticTrees = []);
    var tree = cached[index];
    // 如果已经呈现了静态树而不是在v-for中，我们可以重新利用相同的树。
    if (tree && !isInFor) {
      return tree
    }
    // 否则，渲染新树。
    // 返回VNode
    tree = cached[index] = this.$options.staticRenderFns[index].call(
      this._renderProxy, // 在initProxy时注册
      null,
      this // for render fns generated for functional component templates
    );
    // 将静态节点树打上标志
    markStatic(tree, ("__static__" + index), false);
    return tree
  }

  /**
   * 渲染v-once处理函数
   */
  function markOnce (tree, index, key) {
    markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
    return tree
  }

  /**
   * 为渲染树添加静态标志
   */
  function markStatic (tree, key, isOnce) {
    if (Array.isArray(tree)) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i] && typeof tree[i] !== 'string') {
          markStaticNode(tree[i], (key + "_" + i), isOnce);
        }
      }
    } else {
      markStaticNode(tree, key, isOnce);
    }
  }

  function markStaticNode (node, key, isOnce) {
    node.isStatic = true;
    node.key = key;
    node.isOnce = isOnce;
  }

  /************************************************************/

  /**
   * 渲染v-on绑定对象处理函数 
   * e.g. v-on="{ click: handlerClick }"
   */
  function bindObjectListeners (data, value) {
    if (value) {
      if (!isPlainObject(value)) {
        warn(
          'v-on without argument expects an Object value',
          this
        );
      } else {
        var on = data.on = data.on ? extend({}, data.on) : {};
        for (var key in value) {
          var existing = on[key];
          var ours = value[key];
          on[key] = existing ? [].concat(existing, ours) : ours;
        }
      }
    }
    return data
  }

  /************************************************************/

  /**
   * 解析<slot>助手函数
   */
  function resolveScopedSlots (fns, res, hasDynamicKeys, contentHashKey) {
    res = res || { $stable: !hasDynamicKeys };
    for (var i = 0; i < fns.length; i++) {
      var slot = fns[i];
      if (Array.isArray(slot)) {
        resolveScopedSlots(slot, res, hasDynamicKeys);
      } else if (slot) {
        if (slot.proxy) {
          // 为slot处理函数添加proxy属性，表明可代理
          slot.fn.proxy = true;
        }
        res[slot.key] = slot.fn;
      }
    }
    if (contentHashKey) {
      (res).$key = contentHashKey;
    }
    return res
  }

  /************************************************************/

  
  /**
   * 渲染动态指令处理函数 
   */
  function bindDynamicKeys (baseObj, values) {
    for (var i = 0; i < values.length; i += 2) {
      var key = values[i];
      if (typeof key === 'string' && key) {
        baseObj[values[i]] = values[i + 1];
      } else if (key !== '' && key !== null) {
        // null是用于显式删除绑定的特殊值
        // 动态指令参数期待值为字符串或null
        warn(
          ("Invalid value for dynamic directive argument (expected string or null): " + key),
          this
        );
      }
    }
    return baseObj
  }

  // 前置修饰符助手函数
  // 将修饰词标记动态附加到事件名称。
  // 确保只有在值已经是string时才追加，否则它将被转换为string并导致类型检查丢失。
  function prependModifier (value, symbol) {
    return typeof value === 'string' ? symbol + value : value
  }

  // 安装渲染期间的助手函数
  function installRenderHelpers (target) {
    target._o = markOnce;
    target._n = toNumber;
    target._s = toString;
    target._l = renderList;
    target._t = renderSlot;
    target._q = looseEqual;
    target._i = looseIndexOf;
    target._m = renderStatic;
    target._f = resolveFilter;
    target._k = checkKeyCodes;
    target._b = bindObjectProps;
    target._v = createTextVNode;
    target._e = createEmptyVNode;
    target._u = resolveScopedSlots;
    target._g = bindObjectListeners;
    target._d = bindDynamicKeys;
    target._p = prependModifier;
  }

  /************************************************************/


  // 函数式组件上下文构造函数
  function FunctionalRenderContext (data, props, children, parent, Ctor) {
    var this$1 = this;

    var options = Ctor.options;
    // 确保函数式组件中的createElement函数获得唯一的上下文
    // 这对于正确的命名槽检查是必需的
    var contextVm;
    if (hasOwn(parent, '_uid')) {
      contextVm = Object.create(parent);
      contextVm._original = parent;
    } else {
      // 传入的上下文vm也是一个函数上下文。
      // 在这种情况下，我们希望确保能够获得一个真正的上下文实例。
      contextVm = parent;
      parent = parent._original;
    }
    // 是否已经编译过
    var isCompiled = isTrue(options._compiled);
    // 是否需要格式化
    var needNormalization = !isCompiled;

    this.data = data;
    this.props = props;
    this.children = children;
    this.parent = parent;
    this.listeners = data.on || emptyObject;
    this.injections = resolveInject(options.inject, parent);
    this.slots = function () {
      if (!this$1.$slots) {
        normalizeScopedSlots(
          data.scopedSlots,
          this$1.$slots = resolveSlots(children, parent)
        );
      }
      return this$1.$slots
    };

    Object.defineProperty(this, 'scopedSlots', ({
      enumerable: true,
      get: function get () {
        return normalizeScopedSlots(data.scopedSlots, this.slots())
      }
    }));

    // 支持编译的函数模板
    if (isCompiled) {
      // 暴露 $options 给 renderStatic()
      this.$options = options;
      this.$slots = this.slots();
      this.$scopedSlots = normalizeScopedSlots(data.scopedSlots, this.$slots);
    }

    if (options._scopeId) {
      this._c = function (a, b, c, d) {
        var vnode = createElement(contextVm, a, b, c, d, needNormalization);
        if (vnode && !Array.isArray(vnode)) {
          vnode.fnScopeId = options._scopeId;
          vnode.fnContext = parent;
        }
        return vnode
      };
    } else {
      // 返回渲染函数
      this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
    }
  }

  // 安装渲染助手函数
  installRenderHelpers(FunctionalRenderContext.prototype);

  // 创建函数式组件
  function createFunctionalComponent (Ctor, propsData, data, contextVm, children) {
    var options = Ctor.options;
    var props = {};
    var propOptions = options.props;
    if (isDef(propOptions)) { // props
      for (var key in propOptions) {
        props[key] = validateProp(key, propOptions, propsData || emptyObject);
      }
    } else { // 属性
      if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
      if (isDef(data.props)) { mergeProps(props, data.props); }
    }

    // 创建函数式组件渲染上下文
    /*
      renderContext = {
        props: {}, // 提供所有 prop 的对象
        children: [], // VNode 子节点的数组
        slots: fn, // 一个函数，返回了包含所有插槽的对象
        scopedSlots: fn get, // 一个暴露传入的作用域插槽的对象。也以函数形式暴露普通插槽。
        data: {}, // 传递给组件的整个数据对象，作为 createElement 的第二个参数传入组件
        parent: {}, // 对父组件的引用
        listeners: {}, // 一个包含了所有父组件为当前组件注册的事件监听器的对象。这是 data.on 的一个别名。
        injections: {} // 如果使用了 inject 选项，则该对象包含了应当被注入的 property。
      }
    */
    var renderContext = new FunctionalRenderContext(
      data,
      props,
      children,
      contextVm,
      Ctor
    );
    
    // 执行render函数，如果options并未提供render函数，发出警告，并返回一个空VNode
    var vnode = options.render.call(null, renderContext._c /* createElement */, renderContext /* context */);

    if (vnode instanceof VNode) {
      return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
    } else if (Array.isArray(vnode)) {
      var vnodes = normalizeChildren(vnode) || [];
      var res = new Array(vnodes.length);
      for (var i = 0; i < vnodes.length; i++) {
        res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
      }
      return res
    }
  }

  // 克隆并标记函数式组件结果
  function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
    // 在设置fnContext之前克隆节点，否则如果重用节点，fnContext将导致不应匹配的命名插槽。
    var clone = cloneVNode(vnode);
    clone.fnContext = contextVm;
    clone.fnOptions = options;
    {
      (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
    }
    if (data.slot) {
      (clone.data || (clone.data = {})).slot = data.slot;
    }
    return clone
  }

  // 合并props
  function mergeProps (to, from) {
    for (var key in from) {
      to[camelize(key)] = from[key];
    }
  }

  /************************************************************/

  // 每个组件都会有（相当于公有钩子函数）
  // 在patch期间在组件vnode上调用的内联钩子
  var componentVNodeHooks = {
    // 初始化
    init: function init (vnode, hydrating) {
      if (
        vnode.componentInstance &&
        !vnode.componentInstance._isDestroyed &&
        vnode.data.keepAlive
      ) {
        // keep-alive组件，且为更新, 视为patch
        var mountedNode = vnode; 
        componentVNodeHooks.prepatch(mountedNode, mountedNode);
      } else {
        // 根据VNode创建组件实例
        var child = vnode.componentInstance = createComponentInstanceForVnode(
          vnode,
          activeInstance
        );
        // 挂载组件
        child.$mount(hydrating ? vnode.elm : undefined, hydrating);
      }
    },

    // 前置patch
    prepatch: function prepatch (oldVnode, vnode) {
      var options = vnode.componentOptions;
      // 旧节点肯定有componentInstance，因为在初始化时执行了init，创建了实例
      // 在patch阶段，新节点没有componentInstance（keep-alive组件除外），所以需要使用旧节点的
      var child = vnode.componentInstance = oldVnode.componentInstance;
      updateChildComponent(
        child,
        options.propsData, // updated props
        options.listeners, // updated listeners
        vnode, // new parent vnode
        options.children // new children
      );
    },

    // insert钩子，不管是初始化还是更新都会组件执行
    insert: function insert (vnode) {
      var context = vnode.context;
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isMounted) {
        componentInstance._isMounted = true;
        callHook(componentInstance, 'mounted');
      }
      if (vnode.data.keepAlive) {
        if (context._isMounted) {
          // 在更新过程中，keep-alive组件的子组件可能会更改，
          // 因此直接遍历此处的树可能会调用错误子组件上的激活挂钩。
          // 相反，我们将它们推入一个队列，在整个修补程序过程结束后将对其进行处理。
          queueActivatedComponent(componentInstance);
        } else {
          // 如果Vue实例不处于挂载阶段，则激活子组件
          activateChildComponent(componentInstance, true /* direct */);
        }
      }
    },

    // 组件被销毁时执行
    destroy: function destroy (vnode) {
      var componentInstance = vnode.componentInstance;
      if (!componentInstance._isDestroyed) {
        if (!vnode.data.keepAlive) {
          // 调用Vue.prototype.$destory进行销毁
          componentInstance.$destroy();
        } else {
          // 属于keep-alive的子组件时执行
          deactivateChildComponent(componentInstance, true /* direct */);
        }
      }
    }
  };

  var hooksToMerge = Object.keys(componentVNodeHooks);

  /**
   * 创建组件
   * @param {*} Ctor VueComponent
   * @param {*} data data
   * @param {*} context 上下文
   * @param {*} children 子Vnode
   * @param {*} tag 标签名
   */
  function createComponent (Ctor, data, context, children, tag) {
    if (isUndef(Ctor)) {
      return
    }

    var baseCtor = context.$options._base;

    // 普通选项对象：将其转换为构造函数
    // e.g. Vue原生定义了一个KeepAlive组件，是一个普通对象 => keepAlive: { name: 'keep-alive' }
    if (isObject(Ctor)) {
      Ctor = baseCtor.extend(Ctor);
    }

    // 如果在这个阶段它不是构造函数或异步组件工厂，那么拒绝。
    if (typeof Ctor !== 'function') {
      {
        warn(("Invalid Component definition: " + (String(Ctor))), context);
      }
      return
    }

    // 异步创建组件 
    // e.g.  
    // new Vue({
    //   el: "#app",
    //   components: {
    //     child: function(resolve, reject) {
    //       resolve({
    //         template: '<div>I am async!</div>'
    //       })
    //     }
    //   },
    // })
    var asyncFactory;
    if (isUndef(Ctor.cid)) {
      asyncFactory = Ctor;
      Ctor = resolveAsyncComponent(asyncFactory, baseCtor);
      if (Ctor === undefined) {
        // 返回异步组件的占位符节点，该节点呈现为注释节点，但保留节点的所有原始信息。
        // 这些信息将用于异步服务器呈现和水合作用。.
        return createAsyncPlaceholder(
          asyncFactory,
          data,
          context,
          children,
          tag
        )
      }
    }

    data = data || {};

    // 解析构造函数选项，以防在创建组件构造函数后应用全局mixin
    resolveConstructorOptions(Ctor);

    // transform component v-model data into props & events
    if (isDef(data.model)) {
      transformModel(Ctor.options, data);
    }

    // 提炼props  如果组件中定义了props，但是extractPropsFromVNodeData只返回在组件标签上定义的属性
    // 比如，router-link组件props上定义了to,tag,exact,appendreplace,activeClass,exactActiveClass,event
    // 但是 这样定义<router-link to="/foo">Go to Foo</router-link> 
    // 则 propsData = { to: '/foo' }
    var propsData = extractPropsFromVNodeData(data, Ctor, tag);

    // functional component
    // router-view是一个函数式（functional）组件
    if (isTrue(Ctor.options.functional)) {
      return createFunctionalComponent(Ctor, propsData, data, context, children)
    }

    // 提取监听器，因为这些监听器需要被视为子组件监听器，而不是DOM监听器
    var listeners = data.on;
    // 替换为具有.native修饰符的侦听器，以便在父组件修补期间对其进行处理。
    data.on = data.nativeOn;

    if (isTrue(Ctor.options.abstract)) {
      // 抽象组件只保留props、listeners和slot之外的任何内容

      // work around flow
      var slot = data.slot;
      data = {};
      if (slot) {
        data.slot = slot;
      }
    }

    // 安装组件hooks(Vue自带的生命周期钩子函数 init、insert、prepatch、destroy)
    installComponentHooks(data);

    // 返回一个占位vnode节点
    var name = Ctor.options.name || tag;
    var vnode = new VNode(
      ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
      data, undefined, undefined, undefined, context,
      { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
      asyncFactory
    );

    return vnode
  }

  // 为VNode节点创建组件实例
  function createComponentInstanceForVnode (vnode, parent) {
    var options = {
      _isComponent: true,
      _parentVnode: vnode,
      parent: parent
    };
    // 检查VNode是否为内联模板
    var inlineTemplate = vnode.data.inlineTemplate;
    if (isDef(inlineTemplate)) {
      options.render = inlineTemplate.render;
      options.staticRenderFns = inlineTemplate.staticRenderFns;
    }
    return new vnode.componentOptions.Ctor(options)
  }

  // 安装组件hooks
  function installComponentHooks (data) {
    var hooks = data.hook || (data.hook = {});
    for (var i = 0; i < hooksToMerge.length; i++) {
      var key = hooksToMerge[i];
      var existing = hooks[key];
      var toMerge = componentVNodeHooks[key];
      if (existing !== toMerge && !(existing && existing._merged)) {
        hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
      }
    }
  }

  // 合并hooks
  function mergeHook$1 (f1, f2) {
    var merged = function (a, b) {
      f1(a, b);
      f2(a, b);
    };
    merged._merged = true;
    return merged
  }

  // 转换v-model指令
  // 将组件v-model（值和回调）分别转换为prop和事件处理程序。
  function transformModel (options, data) {
    var prop = (options.model && options.model.prop) || 'value';
    var event = (options.model && options.model.event) || 'input'
    ;(data.attrs || (data.attrs = {}))[prop] = data.model.value;
    var on = data.on || (data.on = {});
    var existing = on[event];
    var callback = data.model.callback;
    if (isDef(existing)) {
      if (
        Array.isArray(existing)
          ? existing.indexOf(callback) === -1
          : existing !== callback
      ) {
        on[event] = [callback].concat(existing);
      }
    } else {
      on[event] = callback;
    }
  }

  /************************************************************/

  var SIMPLE_NORMALIZE = 1;
  var ALWAYS_NORMALIZE = 2;

  /**
   * 创建element
   * @param {Object} context 上下文
   * @param {*} tag 标签名称
   * @param {*} data 标签数据，包括属性，class style 指令等
   * @param {*} children 子节点
   * @param {*} normalizationType 应该设置为常量ALWAYS_NORMALIZE的值
   * @param {*} alwaysNormalize 布尔值 是否是真的是true
   */
  function createElement (context, tag, data, children, normalizationType, alwaysNormalize) {
    if (Array.isArray(data) || isPrimitive(data)) {
      normalizationType = children;
      children = data;
      data = undefined;
    }
    if (isTrue(alwaysNormalize)) {
      normalizationType = ALWAYS_NORMALIZE;
    }
    return _createElement(context, tag, data, children, normalizationType)
  }

  //创建虚拟dom节点
  function _createElement (context, tag, data, children, normalizationType) {
    /**
     *  如果存在data.__ob__，说明data是被Observer观察的数据
     * 不能用作虚拟节点的data,需要抛出警告，并返回一个空节点
     * 被监控的data不能被用作vnode渲染的数据的原因是：data在vnode渲染过程中可能会被改变，
     * 这样会触发监控，导致不符合预期的操作
     */
    if (isDef(data) && isDef((data).__ob__)) {
      warn(
        "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
        'Always create fresh vnode data objects in each render!',
        context
      );
      return createEmptyVNode()
    }
    //如果定义有数据并且数据中的is也定义了
    if (isDef(data) && isDef(data.is)) {
      tag = data.is;
    }
    if (!tag) {
      return createEmptyVNode()
    }
    if (isDef(data) && isDef(data.key) && !isPrimitive(data.key)) {
      {
        warn(
          'Avoid using non-primitive value as key, ' +
          'use string/number value instead.',
          context
        );
      }
    }
    // 支持单函数子进程作为默认作用域插槽
    if (Array.isArray(children) && typeof children[0] === 'function') {
      data = data || {};
      data.scopedSlots = { default: children[0] };
      children.length = 0;
    }
    // ALWAYS_NORMALIZE = 2 SIMPLE_NORMALIZE = 1
    if (normalizationType === ALWAYS_NORMALIZE) {
      // 创建一个规范的子节点
      children = normalizeChildren(children);
    } else if (normalizationType === SIMPLE_NORMALIZE) {
      // 把所有子节点的数组 子孙连接在一个数组。
      children = simpleNormalizeChildren(children);
    }
    var vnode, ns;
    if (typeof tag === 'string') {
      var Ctor;
      ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag);
      if (config.isReservedTag(tag)) {
        vnode = new VNode(
          config.parsePlatformTagName(tag), data, children,
          undefined, undefined, context
        );
      } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
        // 创建组件 e.g. <child></child>
        vnode = createComponent(Ctor, data, context, children, tag);
      } else {
        // 未知或未列出的命名空间元素会在运行时进行检查，
        // 因为当其父元素规范化子元素时，可能会为其分配命名空间
        vnode = new VNode(
          tag, data, children,
          undefined, undefined, context
        );
      }
    } else {
      vnode = createComponent(tag, data, context, children);
    }
    if (Array.isArray(vnode)) {
      return vnode
    } else if (isDef(vnode)) {
      if (isDef(ns)) { applyNS(vnode, ns); }
      if (isDef(data)) { registerDeepBindings(data); }
      return vnode
    } else {
      return createEmptyVNode()
    }
  }

  function applyNS (vnode, ns, force) {
    vnode.ns = ns;
    if (vnode.tag === 'foreignObject') {
      // 在foreignObject中使用默认命名空间
      ns = undefined;
      force = true;
    }
    if (isDef(vnode.children)) {
      for (var i = 0, l = vnode.children.length; i < l; i++) {
        var child = vnode.children[i];
        if (isDef(child.tag) && (
          isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
          applyNS(child, ns, force);
        }
      }
    }
  }

  // 当深度绑定（如：style和）时，必须确保父级重新呈现 
  function registerDeepBindings (data) {
    if (isObject(data.style)) {
      traverse(data.style);
    }
    if (isObject(data.class)) {
      traverse(data.class);
    }
  }

  /************************************************************/

  /**
   * 初始化渲染 
   * @param {Object} vm Vue实例
   */
  function initRender (vm) {
    vm._vnode = null; // 子树的根
    vm._staticTrees = null; // v-once 缓存树
    var options = vm.$options;
    var parentVnode = vm.$vnode = options._parentVnode; // 父树中的占位符节点
    var renderContext = parentVnode && parentVnode.context;
    //判断children 有没有分发式插槽 并且过滤掉空的插槽,并且收集插槽
    vm.$slots = resolveSlots(options._renderChildren, renderContext);
    vm.$scopedSlots = emptyObject;
    // 将createElement fn绑定到此实例，以便在其中获得正确的呈现上下文。
    // args顺序：标记、数据、子项、规格化类型、alwaysNormalize内部版本由从模板编译的呈现函数使用
    vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
    
    // 规范化始终应用于公共版本
    // 用户编写的渲染功能。
    vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

    var parentData = parentVnode && parentVnode.data;

    {
      defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
        !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
      }, true);
      defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
        !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
      }, true);
    }
  }

  var currentRenderingInstance = null;

  /**
   * 初始化vue需要渲染的函数
   */
  function renderMixin (Vue) {
    // 安装渲染助手
    installRenderHelpers(Vue.prototype);

    Vue.prototype.$nextTick = function (fn) {
      return nextTick(fn, this)
    };

    // 渲染函数
    Vue.prototype._render = function () {
      var vm = this;
      var ref = vm.$options;
      /*
        render 是  虚拟dom，需要执行的编译函数 类似于这样的函数
        (function anonymous(
            ) {
            with(this){return _c('div',{attrs:{"id":"app"}},[_c('input',{directives:[{name:"model",rawName:"v-model",value:(name),expression:"name"}],attrs:{"type":"text"},domProps:{"value":(name)},on:{"input":function($event){if($event.target.composing)return;name=$event.target.value}}}),_v(" "),_c('div',{attrs:{"id":dynamicId}})])}
            })
        */
      // 如果传入的options中有render了，就用传入的render
      var render = ref.render;
      var _parentVnode = ref._parentVnode;

      if (_parentVnode) {
        // 定义$scopedSlots，在renderSlot时需要取值
        vm.$scopedSlots = normalizeScopedSlots(
          _parentVnode.data.scopedSlots,
          vm.$slots,
          vm.$scopedSlots
        );
      }

      // 设置父vnode。这允许呈现函数访问占位符节点上的数据。
      vm.$vnode = _parentVnode;
      // render self
      var vnode;
      try {
        currentRenderingInstance = vm;
        // 真正执行渲染(important) 把ast变成vnode，传入createElement函数，用于创建VNode
        vnode = render.call(vm._renderProxy, vm.$createElement);
      } catch (e) {
        handleError(e, vm, "render");
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
          } catch (e) {
            handleError(e, vm, "renderError");
            vnode = vm._vnode;
          }
        } else {
          vnode = vm._vnode;
        }
      } finally {
        currentRenderingInstance = null;
      }
      // 如果返回的数组只包含一个节点，则赋值第一项
      if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0];
      }
      // 如果呈现函数出错，返回空vnode
      if (!(vnode instanceof VNode)) {
        if (Array.isArray(vnode)) {
          warn(
            'Multiple root nodes returned from render function. Render function ' +
            'should return a single root node.',
            vm
          );
        }
        vnode = createEmptyVNode();
      }
      // set parent
      vnode.parent = _parentVnode;
      return vnode
    };
  }

  /************************************************************/
  // 确认组件的构造工厂
  function ensureCtor (comp, base) {
    if (
      comp.__esModule ||
      (hasSymbol && comp[Symbol.toStringTag] === 'Module')
    ) {
      // 通过import 方式引入的对象
      comp = comp.default;
    }
    return isObject(comp)
      ? base.extend(comp)
      : comp
  }
  // 创建异步占位节点
  function createAsyncPlaceholder (factory, data, context, children, tag) {
    var node = createEmptyVNode();
    node.asyncFactory = factory;
    node.asyncMeta = { data: data, context: context, children: children, tag: tag };
    return node
  }

  // 解析异步创建组件
  function resolveAsyncComponent (factory, baseCtor) {
    // 加载失败时使用的组件
    if (isTrue(factory.error) && isDef(factory.errorComp)) {
      return factory.errorComp
    }

    // 加载失败时使用的组件
    if (isDef(factory.resolved)) {
      return factory.resolved
    }

    var owner = currentRenderingInstance;
    if (owner && isDef(factory.owners) && factory.owners.indexOf(owner) === -1) {
      factory.owners.push(owner);
    }

    // 异步组件加载时使用的组件
    if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
      return factory.loadingComp
    }

    if (owner && !isDef(factory.owners)) {
      var owners = factory.owners = [owner];
      var sync = true;
      var timerLoading = null;
      var timerTimeout = null;
      
      // 添加destroyed生命周期钩子
      (owner).$on('hook:destroyed', function () { return remove(owners, owner); });

      var forceRender = function (renderCompleted) {
        // 强制更新每个实例
        for (var i = 0, l = owners.length; i < l; i++) {
          (owners[i]).$forceUpdate();
        }

        if (renderCompleted) { // 渲染完毕
          owners.length = 0;
          if (timerLoading !== null) {
            clearTimeout(timerLoading);
            timerLoading = null;
          }
          if (timerTimeout !== null) {
            clearTimeout(timerTimeout);
            timerTimeout = null;
          }
        }
      };

      // 成功回调
      var resolve = once(function (res) {
        // 缓存resolved，一个组件
        factory.resolved = ensureCtor(res, baseCtor);
        // 仅当这不是同步解析时调用回调（异步解析在SSR期间填充为同步）
        if (!sync) {
          forceRender(true);
        } else {
          owners.length = 0;
        }
      });

      // 错误回调
      var reject = once(function (reason) {
        warn(
          "Failed to resolve async component: " + (String(factory)) +
          (reason ? ("\nReason: " + reason) : '')
        );
        if (isDef(factory.errorComp)) {
          factory.error = true;
          forceRender(true);
        }
      });

      // 执行异步创建组件的第二个参数
      var res = factory(resolve, reject);

      // 异步组件工厂函数如果返回的是对象形式
      // const AsyncComponent = () => ({
      //   // 需要加载的组件 (应该是一个 `Promise` 对象)
      //   component: import('./MyComponent.vue'),
      //   // 异步组件加载时使用的组件
      //   loading: LoadingComponent,
      //   // 加载失败时使用的组件
      //   error: ErrorComponent,
      //   // 展示加载时组件的延时时间。默认值是 200 (毫秒)
      //   delay: 200,
      //   // 如果提供了超时时间且组件加载也超时了，
      //   // 则使用加载失败时使用的组件。默认值是：`Infinity`
      //   timeout: 3000
      // })
      if (isObject(res)) {
        if (isPromise(res)) {
          // 如果factory返回一个promise对象，且该promise对象不能处于成功状态
          if (isUndef(factory.resolved)) {
            res.then(resolve, reject);
          }
        } else if (isPromise(res.component)) {
          res.component.then(resolve, reject);

          if (isDef(res.error)) {
            factory.errorComp = ensureCtor(res.error, baseCtor);
          }

          if (isDef(res.loading)) {
            factory.loadingComp = ensureCtor(res.loading, baseCtor);
            if (res.delay === 0) {
              factory.loading = true;
            } else {
              timerLoading = setTimeout(function () {
                timerLoading = null;
                if (isUndef(factory.resolved) && isUndef(factory.error)) {
                  factory.loading = true;
                  forceRender(false);
                }
              }, res.delay || 200);
            }
          }

          if (isDef(res.timeout)) {
            timerTimeout = setTimeout(function () {
              timerTimeout = null;
              if (isUndef(factory.resolved)) {
                reject(
                  "timeout (" + (res.timeout) + "ms)"
                );
              }
            }, res.timeout);
          }
        }
      }

      sync = false;
      // 返回同步解决方法
      return factory.loading
        ? factory.loadingComp
        : factory.resolved
    }
  }

  /************************************************************/

  // 判断node节点是否是异步占位节点
  function isAsyncPlaceholder (node) {
    return node.isComment && node.asyncFactory
  }

  /************************************************************/

  // 获取第一个子组件
  function getFirstComponentChild (children) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
          return c
        }
      }
    }
  }

  /************************************************************/

  /**
   * 初始化事件
   */
  function initEvents (vm) {
    vm._events = Object.create(null);
    vm._hasHookEvent = false;
    // 是否有钩子函数
    var listeners = vm.$options._parentListeners;
    if (listeners) {
      updateComponentListeners(vm, listeners);
    }
  }

  var target;

  function add (event, fn) {
    target.$on(event, fn);
  }

  function remove$1 (event, fn) {
    target.$off(event, fn);
  }

  function createOnceHandler (event, fn) {
    var _target = target;
    return function onceHandler () {
      var res = fn.apply(null, arguments);
      if (res !== null) {
        _target.$off(event, onceHandler);
      }
    }
  }

  // 更新组件listener监听的事件
  function updateComponentListeners (vm, listeners, oldListeners) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
    target = undefined;
  }

  /**
   * 初始化事件绑定方法
   */
  function eventsMixin (Vue) {
    var hookRE = /^hook:/;
    Vue.prototype.$on = function (event, fn) {
      var vm = this;
      if (Array.isArray(event)) {
        for (var i = 0, l = event.length; i < l; i++) {
          vm.$on(event[i], fn);
        }
      } else {
        // 在initEvents时初始化，vm._events = Object.create(null);
        (vm._events[event] || (vm._events[event] = [])).push(fn);
        // 当event = 'hook:beforeCreate'时(生命周期函数钩子），vm._hasHookEvent = true
        if (hookRE.test(event)) {
          vm._hasHookEvent = true;
        }
      }
      return vm
    };

    Vue.prototype.$once = function (event, fn) {
      var vm = this;
      function on () {
        vm.$off(event, on);
        fn.apply(vm, arguments);
      }
      on.fn = fn;
      vm.$on(event, on);
      return vm
    };

    Vue.prototype.$off = function (event, fn) {
      var vm = this;
      if (!arguments.length) {
        vm._events = Object.create(null);
        return vm
      }
      if (Array.isArray(event)) {
        for (var i$1 = 0, l = event.length; i$1 < l; i$1++) {
          vm.$off(event[i$1], fn);
        }
        return vm
      }
      var cbs = vm._events[event];
      if (!cbs) {
        return vm
      }
      if (!fn) {
        vm._events[event] = null;
        return vm
      }
      var cb;
      var i = cbs.length;
      while (i--) {
        cb = cbs[i];
        // cb.fn === fn这个主要是处理$once的移除
        if (cb === fn || cb.fn === fn) {
          cbs.splice(i, 1);
          break
        }
      }
      return vm
    };

    Vue.prototype.$emit = function (event) {
      var vm = this;
      {
        var lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
          tip(
            "Event \"" + lowerCaseEvent + "\" is emitted in component " +
            (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
            "Note that HTML attributes are case-insensitive and you cannot use " +
            "v-on to listen to camelCase events when using in-DOM templates. " +
            "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
          );
        }
      }
      var cbs = vm._events[event];
      if (cbs) {
        cbs = cbs.length > 1 ? toArray(cbs) : cbs;
        var args = toArray(arguments, 1);
        var info = "event handler for \"" + event + "\"";
        for (var i = 0, l = cbs.length; i < l; i++) {
          invokeWithErrorHandling(cbs[i], vm, args, vm, info);
        }
      }
      return vm
    };
  }

  /************************************************************/

  var activeInstance = null;
  // 标志，是否更新子组件
  var isUpdatingChildComponent = false;

  function setActiveInstance(vm) {
    var prevActiveInstance = activeInstance;
    activeInstance = vm;
    return function () {
      activeInstance = prevActiveInstance;
    }
  }

  /*
   * 初始化生命周期
   */
  function initLifecycle (vm) {
    var options = vm.$options;
    // undefined或者options上面有父实例
    var parent = options.parent;
    if (parent && !options.abstract) {
      while (parent.$options.abstract && parent.$parent) {
        parent = parent.$parent;
      }
      parent.$children.push(vm);
    }

    // 设置组件的$parent
    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;

    vm.$children = [];
    vm.$refs = {};

    vm._watcher = null;
    vm._inactive = null;
    vm._directInactive = false;
    vm._isMounted = false;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false; // 是否开始销毁
  }

  /*
   * 初始化生命周期混合
   */
  function lifecycleMixin (Vue) {
    // 更新页面
    Vue.prototype._update = function (vnode, hydrating) {
      var vm = this;
      var prevEl = vm.$el; // 获取上一个vue的el节点
      var prevVnode = vm._vnode; // 标志上一个 vonde
      var restoreActiveInstance = setActiveInstance(vm); // 把activeInstance置vm
      vm._vnode = vnode;

      if (!prevVnode) {
        // 初始渲染
        vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
      } else {
        // 更新
        vm.$el = vm.__patch__(prevVnode, vnode);
      }
      // 把activeInstance重置为null
      restoreActiveInstance();

      if (prevEl) {
        prevEl.__vue__ = null;
      }
      if (vm.$el) {
        vm.$el.__vue__ = vm;
      }
      // 如果父级是HOC，则也更新其$el
      if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
        vm.$parent.$el = vm.$el;
      }
      // 调度程序调用updated hook以确保子级在父级的更新钩子中得到更新。
    };

    // 触发更新观察者数据
    Vue.prototype.$forceUpdate = function () {
      var vm = this;
      if (vm._watcher) {
        vm._watcher.update();
      }
    };

    // 销毁前和销毁后
    Vue.prototype.$destroy = function () {
      var vm = this;
      if (vm._isBeingDestroyed) {
        return
      }
      // 触发beforeDestroy钩子
      callHook(vm, 'beforeDestroy');
      vm._isBeingDestroyed = true;
      // 通过父级来移除子节点
      var parent = vm.$parent;
      if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
        remove(parent.$children, vm);
      }
      // 卸载 watchers
      if (vm._watcher) {
        vm._watcher.teardown();
      }
      var i = vm._watchers.length;
      while (i--) {
        vm._watchers[i].teardown();
      }
      // 从数据中删除引用对象可能没有观察者。
      if (vm._data.__ob__) {
        vm._data.__ob__.vmCount--;
      }
      vm._isDestroyed = true;
      // 在当前渲染的树上调用销毁钩子
      vm.__patch__(vm._vnode, null); // 第二个参数不存在，则表示销毁
      // 执行destroyed钩子
      callHook(vm, 'destroyed');
      // 关闭所有实例监听器。
      vm.$off();
      // 移除__vue__引用
      if (vm.$el) {
        vm.$el.__vue__ = null;
      }
      if (vm.$vnode) {
        vm.$vnode.parent = null;
      }
    };
  }

  /**
   * 挂载组件
   */
  function mountComponent (vm, el, hydrating) {
    vm.$el = el;
    if (!vm.$options.render) {
      vm.$options.render = createEmptyVNode;
      {
        if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
          vm.$options.el || el) {
          warn(
            'You are using the runtime-only build of Vue where the template ' +
            'compiler is not available. Either pre-compile the templates into ' +
            'render functions, or use the compiler-included build.',
            vm
          );
        } else {
          warn(
            'Failed to mount component: template or render function not defined.',
            vm
          );
        }
      }
    }
    // 第三个生命周期 beforeMount
    callHook(vm, 'beforeMount');

    var updateComponent;
    // 是否开启性能检测
    if (config.performance && mark) {
      updateComponent = function () {
        var name = vm._name;
        var id = vm._uid;
        var startTag = "vue-perf-start:" + id;
        var endTag = "vue-perf-end:" + id;

        mark(startTag);
        var vnode = vm._render();
        mark(endTag);
        measure(("vue " + name + " render"), startTag, endTag);

        mark(startTag);
        vm._update(vnode, hydrating);
        mark(endTag);
        measure(("vue " + name + " patch"), startTag, endTag);
      };
    } else {
      updateComponent = function () {
        vm._update(vm._render(), hydrating);
      };
    }

    // 添加一个Watcher， 当vm上的属性改变时，触发updateComponent方法
    // updateComponent这里才是真正的执行

    // 在执行_render时，第一次获取data上面的属性值时，会执行pushTarget方法，
    // 把当前Watcher添加到Dep.target上，每次设置值时，会触发notify通知
    // defineReactive$$1监听了data、$attrs、￥listeners、props
    new Watcher(vm, updateComponent, noop, {
      before: function before () {
        if (vm._isMounted && !vm._isDestroyed) {
          callHook(vm, 'beforeUpdate');
        }
      }
    }, true /* isRenderWatcher */);
    hydrating = false;

    if (vm.$vnode == null) {
      vm._isMounted = true;
      // 第四个生命周期mounted
      callHook(vm, 'mounted');
    }
    // new Vue({}).$mount(el) 返回的还是这个实例
    return vm
  }

  // 更新子组件
  function updateChildComponent (vm, propsData, listeners, parentVnode, renderChildren) {
    {
      isUpdatingChildComponent = true;
    }

    // 确定组件是否有插槽子项
    // 我们需要在覆盖$options之前执行此操作

    // 检查是否有动态scopedSlots（手写或编译，但具有动态插槽名称）。
    // 从模板编译的静态作用域插槽具有“$stable”标记。
    var newScopedSlots = parentVnode.data.scopedSlots;
    var oldScopedSlots = vm.$scopedSlots;
    var hasDynamicScopedSlot = !!(
      (newScopedSlots && !newScopedSlots.$stable) ||
      (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
      (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key)
    );

    // 父级中的任何静态插槽子级可能在父级更新期间发生了更改。
    // 动态作用域插槽也可能已更改。在这种情况下，需要强制更新以确保正确性。
    var needsForceUpdate = !!(
      renderChildren ||               // has new static slots
      vm.$options._renderChildren ||  // has old static slots
      hasDynamicScopedSlot
    );

    vm.$options._parentVnode = parentVnode;
    vm.$vnode = parentVnode; // 更新vm的占位符节点而不重新呈现

    if (vm._vnode) { // 更新子树的父级
      vm._vnode.parent = parentVnode;
    }
    vm.$options._renderChildren = renderChildren;

    // update$attrs和$listeners是响应式的
    // 因此如果子对象在渲染期间使用它们，它们可能会触发子对象更新
    vm.$attrs = parentVnode.data.attrs || emptyObject;
    vm.$listeners = listeners || emptyObject;

    // 更新prop
    if (propsData && vm.$options.props) {
      toggleObserving(false);
      var props = vm._props;
      var propKeys = vm.$options._propKeys || [];
      for (var i = 0; i < propKeys.length; i++) {
        var key = propKeys[i];
        var propOptions = vm.$options.props;
        // 将propsData传递给props
        props[key] = validateProp(key, propOptions, propsData, vm);
      }
      toggleObserving(true);
      // 保留一份原始数据
      vm.$options.propsData = propsData;
    }

    // 更新 listeners
    listeners = listeners || emptyObject;
    var oldListeners = vm.$options._parentListeners;
    vm.$options._parentListeners = listeners;
    updateComponentListeners(vm, listeners, oldListeners);

    // 解析插槽，如果有子项则强制更新
    if (needsForceUpdate) {
      vm.$slots = resolveSlots(renderChildren, parentVnode.context);
      vm.$forceUpdate();
    }

    {
      isUpdatingChildComponent = false;
    }
  }

  // 判断vm的父节点是否是活跃的（没有被销毁）
  function isInInactiveTree (vm) {
    while (vm && (vm = vm.$parent)) {
      if (vm._inactive) { return true }
    }
    return false
  }

  // 激活子组件处于活跃状态（即渲染）
  function activateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = false;
      if (isInInactiveTree(vm)) {
        // 如果父组件处于激活状态，则终止函数
        return
      }
    } else if (vm._directInactive) {
      return
    }
    if (vm._inactive || vm._inactive === null) {
      vm._inactive = false;
      for (var i = 0; i < vm.$children.length; i++) {
        // 遍历激活所有子组件
        activateChildComponent(vm.$children[i]);
      }
      // 触发keep-alive子组件的activated钩子
      callHook(vm, 'activated');
    }
  }

  // 停用子组件（）
  function deactivateChildComponent (vm, direct) {
    if (direct) {
      vm._directInactive = true;
      if (isInInactiveTree(vm)) {
        return
      }
    }
    if (!vm._inactive) {
      vm._inactive = true;
      for (var i = 0; i < vm.$children.length; i++) {
        deactivateChildComponent(vm.$children[i]);
      }
      // 触发keep-alive子组件的deactivated钩子
      callHook(vm, 'deactivated');
    }
  }

  /**
   * 触发钩子函数
   */
  function callHook (vm, hook) {
    //调用生命周期钩子时禁用dep集合
    pushTarget();
    var handlers = vm.$options[hook];
    var info = hook + " hook";
    if (handlers) {
      // 在mergeOptions时执行strats上面的方法，将handlers变成数组
      for (var i = 0, j = handlers.length; i < j; i++) {
        invokeWithErrorHandling(handlers[i], vm, null, vm, info);
      }
    }
    // 当手动添加vm.$on('hook:beforeCreate')生命周期钩子函数时，在这里也会触发一次
    // 这里主要是为了Vue内部自己触发'hook:destroyed'钩子函数
    if (vm._hasHookEvent) {
      vm.$emit('hook:' + hook);
    }
    popTarget();
  }

  /************************************************************/

  var MAX_UPDATE_COUNT = 100;

  var queue = [];
  var activatedChildren = [];
  var has = {};
  var circular = {};
  var waiting = false;
  var flushing = false; // 是否正在刷新组件
  var index = 0;

  /**
   * 清空观察者watcher队列中的数据
   */
  function resetSchedulerState () {
    index = queue.length = activatedChildren.length = 0;
    has = {};
    {
      circular = {};
    }
    waiting = flushing = false;
  }

  var currentFlushTimestamp = 0;

  var getNow = Date.now;

  // 确定浏览器正在使用的事件时间戳。令人恼火的是，
  // 时间戳可以是高分辨率（相对于页面加载）或低分辨率（相对于UNIX epoch），因此为了比较时间，
  // 我们在保存刷新时间戳时必须使用相同的时间戳类型。所有IE版本都使用低分辨率事件时间戳，并且时钟实现有问题（#9632）
  if (inBrowser && !isIE) {
    var performance = window.performance;
    if (
      performance &&
      typeof performance.now === 'function' &&
      getNow() > document.createEvent('Event').timeStamp
    ) {
      // 这意味着事件正在使用高分辨率时间戳，我们还需要为事件侦听器时间戳使用高分辨率版本。
      getNow = function () { return performance.now(); };
    }
  }

  /**
   * 执行观察者中的监听队列回调
   */
  function flushSchedulerQueue () {
    currentFlushTimestamp = getNow();
    flushing = true;
    var watcher, id;

    // 刷新前对队列排序。
    // 这样可以确保：
    // 1. 组件从父级更新到子级。（因为父对象总是在子对象之前创建）
    // 2. 组件的用户观察程序在其渲染观察程序之前运行（因为用户观察程序是在渲染观察程序之前创建的）
    // 3. 如果某个组件在父组件的观察程序运行期间被破坏，则可以跳过它的观察程序。
    queue.sort(function (a, b) { return a.id - b.id; });

    // 不要缓存长度，因为在运行现有的观察程序时可能会推送更多的观察程序
    for (index = 0; index < queue.length; index++) {
      watcher = queue[index];

      // new Watcher的第四个参数是个options对象，该对象如果包含了before属性，则watcher运行前会先执行before函数
      if (watcher.before) {
        watcher.before(); 
      }
      id = watcher.id;
      has[id] = null;
      // 执行watcher原型上的run方法，开始运行
      watcher.run();
      // 在dev build中，检查并停止循环更新。
      if (has[id] != null) {
        circular[id] = (circular[id] || 0) + 1;
        if (circular[id] > MAX_UPDATE_COUNT) {
          warn(
            'You may have an infinite update loop ' + (
              watcher.user
                ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                : "in a component render function."
            ),
            watcher.vm
          );
          break
        }
      }
    }

    // 在重置状态之前保留post队列的副本
    var activatedQueue = activatedChildren.slice();
    var updatedQueue = queue.slice();

    // 清空观察者watcher队列中的数据
    resetSchedulerState();

    // 调用组件激活的钩子 activated
    callActivatedHooks(activatedQueue);
    // 第六个生命周期 updated
    callUpdatedHooks(updatedQueue);

    if (devtools && config.devtools) {
      devtools.emit('flush');
    }
  }

  /**
   * 触发更新钩子函数
   * @param {Array} queue watcher
   */
  function callUpdatedHooks (queue) {
    var i = queue.length;
    while (i--) {
      var watcher = queue[i];
      var vm = watcher.vm;
      if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'updated');
      }
    }
  }

  /**
   * 将需要更新的组件添加到队列中
   * @param {*} vm 
   */
  function queueActivatedComponent (vm) {
    // 在这里将“不活动”设置为false，
    // 以便渲染函数可以依赖于检查它是否位于非活动树中（例如，路由器视图）
    vm._inactive = false;
    activatedChildren.push(vm);
  }

  /**
   * 调用组件激活的钩子 activated
   */
  function callActivatedHooks (queue) {
    for (var i = 0; i < queue.length; i++) {
      queue[i]._inactive = true;
      activateChildComponent(queue[i], true /* true */);
    }
  }

  /**
   * 将观察者对象加入 queue 队列中
   */
  function queueWatcher (watcher) {
    var id = watcher.id;
    // 跳过具有重复ID的watcher
    if (has[id] == null) {
      has[id] = true;
      if (!flushing) {
        queue.push(watcher);
      } else {
        // 如果已经刷新，则根据其id拼接观察程序
        var i = queue.length - 1;
        // 如果queue队列中的最后一个watcher的id大于当前要插入队列的watcher的id，则i--
        // 意味着queue的排序规则是根据watcher的id来排序的
        while (i > index && queue[i].id > watcher.id) {
          i--;
        }
        queue.splice(i + 1, 0, watcher);
      }
      // 刷新队列
      if (!waiting) {
        waiting = true;

        if (!config.async) {  // config.async = true，所以不走这里
          flushSchedulerQueue();
          return
        }
        nextTick(flushSchedulerQueue);
      }
    }
  }
  
  /************************************************************/

  var uid$2 = 0;

  /**
   * Watcher类扮演的角色为观察者，主要作用是为观察属性提供回调函数以及收集依赖，当被观察的值发生变化时，会接收到来自Dep的通知，从而触发回调函数。
   * Watcher -- 实现了渲染方法 _render 和 Dep 的关联， 初始化 Watcher 的时候，打上 Dep.target 标识，然后调用 get 方法进行页面渲染。
   * @param {Object} vm Vue实例
   * @param {Fn | String} expOrFn 获取值时触发的回调
   * @param {Fn} cb 设置值时触发的回调
   * @param {Object} options options e.g: immediate deep before
   * @param {Boolean} isRenderWatcher 是否添加_watcher到vm上
   */
  var Watcher = function Watcher (vm, expOrFn, cb, options, isRenderWatcher) {
    this.vm = vm;
    if (isRenderWatcher) {
      vm._watcher = this;
    }
    // initData时有这个属性
    vm._watchers.push(this);
    if (options) {
      this.deep = !!options.deep;
      this.user = !!options.user;
      this.lazy = !!options.lazy;
      this.sync = !!options.sync;
      this.before = options.before;
    } else {
      this.deep = this.user = this.lazy = this.sync = false;
    }
    this.cb = cb;
    this.id = ++uid$2; 
    this.active = true;
    this.dirty = this.lazy; 
    this.deps = [];
    this.newDeps = [];
    this.depIds = new _Set();
    this.newDepIds = new _Set();
    this.expression = expOrFn.toString();
    // getter的解析表达式
    if (typeof expOrFn === 'function') {
      this.getter = expOrFn;
    } else {
      this.getter = parsePath(expOrFn);
      if (!this.getter) {
        this.getter = noop;
        warn(
          "Failed watching path: \"" + expOrFn + "\" " +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        );
      }
    }
    this.value = this.lazy
      ? undefined
      : this.get();
  };

  /**
   * 计算getter，并重新收集依赖项。
   */
  Watcher.prototype.get = function get () {
    // 把当前new Watcher出来this添加到Dep.target中
    pushTarget(this);
    var value;
    var vm = this.vm;
    try {
      // 触发Observer的getter，把this添加的Dep上
      value = this.getter.call(vm, vm);
    } catch (e) {
      if (this.user) {
        handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
      } else {
        throw e
      }
    } finally {
      // "touch"每个属性，以便它们都作为依赖项进行跟踪以进行深入观察
      // 深度监听
      if (this.deep) {
        traverse(value);
      }
      popTarget();
      this.cleanupDeps();
    }
    return value
  };

  /**
   * 添加依赖
   */
  Watcher.prototype.addDep = function addDep (dep) {
    var id = dep.id;
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id);
      this.newDeps.push(dep);
      if (!this.depIds.has(id)) {
        dep.addSub(this);
      }
    }
  };

  /**
   * 清理依赖项集合。
   */
  Watcher.prototype.cleanupDeps = function cleanupDeps () {
    var i = this.deps.length;
    while (i--) {
      var dep = this.deps[i];
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this);
      }
    }
    var tmp = this.depIds;
    this.depIds = this.newDepIds;
    this.newDepIds = tmp;
    this.newDepIds.clear();
    tmp = this.deps;
    this.deps = this.newDeps;
    this.newDeps = tmp;
    this.newDeps.length = 0;
  };

  /**
   * 触发依赖
   * 将在依赖项更改时调用。
   */
  Watcher.prototype.update = function update () {
    if (this.lazy) {
      this.dirty = true;
    } else if (this.sync) {
      this.run();
    } else {
      // 一般来说，都是运行这个
      queueWatcher(this);
    }
  };

  /**
   * 运行watcher，设置值
   */
  Watcher.prototype.run = function run () {
    if (this.active) {
      // 这里执行了一下get()，所以当expOrFn = exupdateComponent时执行了重新渲染。
      var value = this.get();
      if (
        value !== this.value ||
        // 即使在值相同的情况下，深层观察者和对象/数组上的观察者也应激发，因为该值可能已发生变化。
        isObject(value) ||
        this.deep
      ) {
        // 第一个参数为新值，第二个参数为旧值
        var oldValue = this.value;
        this.value = value;
        if (this.user) {
          try {
            this.cb.call(this.vm, value, oldValue);
          } catch (e) {
            handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
          }
        } else {
          this.cb.call(this.vm, value, oldValue);
        }
      }
    }
  };

  /**
   * 这只会被称为懒惰的观察者。
   */
  Watcher.prototype.evaluate = function evaluate () {
    this.value = this.get();
    this.dirty = false;
  };

  /**
   * 添加观察者
   */
  Watcher.prototype.depend = function depend () {
    var i = this.deps.length;
    while (i--) {
      this.deps[i].depend();
    }
  };

  /**
   * 移除观察者
   */
  Watcher.prototype.teardown = function teardown () {
    if (this.active) {
      // 从vm的观察者列表中删除self这是一个有点昂贵的操作，因此如果vm被销毁，我们将跳过它。
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this);
      }
      var i = this.deps.length;
      while (i--) {
        this.deps[i].removeSub(this);
      }
      this.active = false;
    }
  };

  /************************************************************/

  var sharedPropertyDefinition = {
    enumerable: true,
    configurable: true,
    get: noop,
    set: noop
  };

  /**
    var Odata={
      data:{
        name:'yao',
        age:28,
        array:[1,2,3,4,5,6,7,8,9],
        obj:{
          area:'guangxi',
          work:'engineer'
        }
      }
   }
   设置监听观察者, 该函数是可以让对象中的三级key 直接冒泡到1级key中
   比如 name 只能在Odata.data.name 获取到数据，执行 proxy(Odata,'data','name')之后可以Odata.name 获取值
  */
  /** 
   * e.g.
   * target = vm
   * sourceKey = "_data"
   * key = 属性名
   */
  function proxy (target, sourceKey, key) {
    sharedPropertyDefinition.get = function proxyGetter () {
      return this[sourceKey][key]
    };
    sharedPropertyDefinition.set = function proxySetter (val) {
      this[sourceKey][key] = val;
    };
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  /**
   * 初始化状态
   */
  function initState (vm) {
    vm._watchers = [];
    var opts = vm.$options;
    // 初始化props
    if (opts.props) { initProps(vm, opts.props); }
    // 初始化methods
    if (opts.methods) { initMethods(vm, opts.methods); }
    // 初始化data
    if (opts.data) {
      initData(vm);
    } else {
      observe(vm._data = {}, true /* asRootData */);
    }
    // 初始化computed
    if (opts.computed) { initComputed(vm, opts.computed); }
    // 初始化watch
    if (opts.watch && opts.watch !== nativeWatch) {
      initWatch(vm, opts.watch);
    }
  }

  /**
   * 初始化props 
   */
  function initProps (vm, propsOptions) {
    var propsData = vm.$options.propsData || {};
    var props = vm._props = {};
    // 缓存属性键，以便将来属性更新时，可以通过遍历数组获取，而不是通过对象键进行迭代。
    var keys = vm.$options._propKeys = [];
    var isRoot = !vm.$parent;
    // 子组件的时候执行，子组件不添加视图响应
    if (!isRoot) {
      toggleObserving(false);
    }
    var loop = function ( key ) {
      keys.push(key);
      // 验证prop类型
      var value = validateProp(key, propsOptions, propsData, vm);
      {
        // 将传入的字符串驼峰命名变成中划线命名并且转为小写
        var hyphenatedKey = hyphenate(key);
        // Vue保留属性名makeMap('key,ref,slot,slot-scope,is')
        if (isReservedAttribute(hyphenatedKey) ||
            // Vue保留属性名makeMap('style,class')
            config.isReservedAttr(hyphenatedKey)) {
          warn(
            ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
            vm
          );
        }
        // 为pros添加setter，getter
        defineReactive$$1(props, key, value, function () {
          // 子组件且不能更新子组件
          if (!isRoot && !isUpdatingChildComponent) {
            // 避免直接改变属性，因为每当父组件重新渲染时，该值都将被覆盖。相反，请使用基于属性值的数据或计算属性。
            warn(
              "Avoid mutating a prop directly since the value will be " +
              "overwritten whenever the parent component re-renders. " +
              "Instead, use a data or computed property based on the prop's " +
              "value. Prop being mutated: \"" + key + "\"",
              vm
            );
          }
        });
      }
      // this._props.name == this.name
      if (!(key in vm)) {
        proxy(vm, "_props", key);
      }
    };

    for (var key in propsOptions) loop( key );
    toggleObserving(true);
  }

  /**
   * 初始化data，添加响应式监听
   */
  function initData (vm) {
    var data = vm.$options.data;
    // vm.data = vm._data
    data = vm._data = typeof data === 'function'
      ? getData(data, vm)
      : data || {};
    if (!isPlainObject(data)) {
      data = {};
      warn(
        'data functions should return an object:\n' +
        'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
        vm
      );
    }
    var keys = Object.keys(data);
    var props = vm.$options.props;
    var methods = vm.$options.methods;
    var i = keys.length;
    while (i--) {
      var key = keys[i];
      {
        if (methods && hasOwn(methods, key)) {
          // methods和data中有同名的属性时，发出警告。data中已经定义的属性，method将不能再定义
          warn(
            ("Method \"" + key + "\" has already been defined as a data property."),
            vm
          );
        }
      }
      if (props && hasOwn(props, key)) {
        // props和data中有同名的属性时，发出警告。props中已经定义的属性，data将不能再定义
        warn(
          "The data property \"" + key + "\" is already declared as a prop. " +
          "Use prop default value instead.",
          vm
        );
      } else if (!isReserved(key)) {
        // 如果data中的key值不是以$或者_开头的
        // this.data.name == this.name
        // 这就是不用加data的由来
        proxy(vm, "_data", key);
      }
    }
    // 因为data和_data的引用地址一样，所以this.name的时候，也会触发set和get
    observe(data, true /* asRootData */);
  }

  /**
   * 处理data传入的是一个函数时，执行data函数，传入一个实参vm
   * @param {Function} data 
   * @param {Vue实例} vm 
   */
  function getData (data, vm) {
    pushTarget();
    try {
      return data.call(vm, vm)
    } catch (e) {
      handleError(e, vm, "data()");
      return {}
    } finally {
      popTarget();
    }
  }

  var computedWatcherOptions = { lazy: true };

  /**
   * 初始化计算属性
   */
  function initComputed (vm, computed) {
    // 创建一个新的监听者对象空对象
    var watchers = vm._computedWatchers = Object.create(null);
    // 是否是服务端渲染
    var isSSR = isServerRendering();

    for (var key in computed) {
      var userDef = computed[key];
      // computed的属性值如果为函数，则getter为computed的属性值
      var getter = typeof userDef === 'function' ? userDef : userDef.get;
      if (getter == null) {
        // 如果userDef（computed的属性）是一个对象的话，必须提供get方法
        warn(
          ("Getter is missing for computed property \"" + key + "\"."),
          vm
        );
      }

      // 将计算属性的key添加入观察者中
      if (!isSSR) {
        watchers[key] = new Watcher(
          vm,
          getter || noop,
          noop,
          computedWatcherOptions
        );
      }

      if (!(key in vm)) { 
        // 如果computed的属性key 不在vm中
        defineComputed(vm, key, userDef);
      } else {
        if (key in vm.$data) {
          // 如果computed中的属性和data中定义的属性产生冲突
          warn(("The computed property \"" + key + "\" is already defined in data."), vm);
        } else if (vm.$options.props && key in vm.$options.props) {
          // 如果computed中的属性和props中定义的属性产生冲突
          warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
        }
      }
    }
  }

  /**
   * 添加get拦截
   */
  function defineComputed (target, key, userDef) {
    var shouldCache = !isServerRendering();
    if (typeof userDef === 'function') {
      // computed为一个函数    
      sharedPropertyDefinition.get = shouldCache
        // 浏览器环境
        ? createComputedGetter(key)
        : createGetterInvoker(userDef);
      sharedPropertyDefinition.set = noop;
    } else {
      // computed为一个对象，含有get属性
      sharedPropertyDefinition.get = userDef.get
        ? shouldCache && userDef.cache !== false
          ? createComputedGetter(key)
          // 浏览器渲染，且userDef.cache为false
          : createGetterInvoker(userDef.get)
        : noop;
      sharedPropertyDefinition.set = userDef.set || noop;
    }
    if (sharedPropertyDefinition.set === noop) {
      // 如果computed的属性是一个函数，则为只读的
      sharedPropertyDefinition.set = function () {
        warn(
          ("Computed property \"" + key + "\" was assigned to but it has no setter."),
          this
        );
      };
    }
    Object.defineProperty(target, key, sharedPropertyDefinition);
  }

  /**
   * 创建computed的getter函数
   * 具有缓存的computed
   */
  function createComputedGetter (key) {
    return function computedGetter () {
      var watcher = this._computedWatchers && this._computedWatchers[key];
      if (watcher) {
        if (watcher.dirty) {
          watcher.evaluate();
        }
        if (Dep.target) {
          // 添加观察者
          watcher.depend();
        }
        return watcher.value
      }
    }
  }

  /**
   * 创建get的调用函数
   * 无缓存的getter
   */
  function createGetterInvoker(fn) {
    return function computedGetter () {
      return fn.call(this, this)
    }
  }

  /**
   * 初始化methods
   */
  function initMethods (vm, methods) {
    var props = vm.$options.props;
    for (var key in methods) {
      {
        if (typeof methods[key] !== 'function') {
          warn(
            "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
            "Did you reference the function correctly?",
            vm
          );
        }
        if (props && hasOwn(props, key)) {
          warn(
            ("Method \"" + key + "\" has already been defined as a prop."),
            vm
          );
        }
        if ((key in vm) && isReserved(key)) {
          warn(
            "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
            "Avoid defining component methods that start with _ or $."
          );
        }
      }
      vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm);
    }
  }

  /**
   * 初始化Watch
   */
  function initWatch (vm, watch) {
    for (var key in watch) {
      var handler = watch[key];
      if (Array.isArray(handler)) {
        // 如果传入的数组,循环调用
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        // handler是对象，则handler要有一个handler属性，值为字符串或者方法
        // 可以是个字符串
        // 可以直接是个方法
        createWatcher(vm, key, handler);
      }
    }
  }

  /**
   * 创建watcher，返回$watch构造的响应式监听函数
   */
  function createWatcher (vm, expOrFn, handler, options) {
    if (isPlainObject(handler)) {
      options = handler;
      handler = handler.handler;
    }
    // 如果传入的handler长这样handler: { handler: 'getName' }
    // 则getName是从vm上找(methods上定义的方法最终都会被挂载到vm上)
    if (typeof handler === 'string') {
      handler = vm[handler];
    }
    return vm.$watch(expOrFn, handler, options)
  }

  /**
   * 状态混合
   */
  function stateMixin (Vue) {
    var dataDef = {};
    dataDef.get = function () { return this._data };
    var propsDef = {};
    propsDef.get = function () { return this._props };
    {
      dataDef.set = function () {
        warn(
          'Avoid replacing instance root $data. ' +
          'Use nested data properties instead.',
          this
        );
      };
      propsDef.set = function () {
        warn("$props is readonly.", this);
      };
    }
    Object.defineProperty(Vue.prototype, '$data', dataDef);
    Object.defineProperty(Vue.prototype, '$props', propsDef);

    // Vue上的三个实例方法
    Vue.prototype.$set = set;
    Vue.prototype.$delete = del;

    // 初始化watch的时候，走的是这个方法
    Vue.prototype.$watch = function (expOrFn, cb, options) {
      var vm = this;
      // 判断是否是对象 如果是对象则递归 深层 监听 直到它不是一个对象的时候才会跳出递归
      if (isPlainObject(cb)) {
        return createWatcher(vm, expOrFn, cb, options)
      }
      options = options || {};
      options.user = true;
      // 通过创建观察者来实现观察
      var watcher = new Watcher(vm, expOrFn, cb, options);
      if (options.immediate) {
        try {
          cb.call(vm, watcher.value);
        } catch (error) {
          handleError(error, vm, ("callback for immediate watcher \"" + (watcher.expression) + "\""));
        }
      }
      // 返回移除watch函数，执行该函数，将移除监听
      return function unwatchFn () {
        watcher.teardown();
      }
    };
  }

  /************************************************************/

  var uid$3 = 0;

  /**
   * 初始化混合
   */
  function initMixin (Vue) {
    // 初始化函数
    Vue.prototype._init = function (options) {
      var vm = this;
      // a uid
      vm._uid = uid$3++;

      var startTag, endTag; //开始标签 结束标签
            
      /* 浏览器性能监控 https://blog.csdn.net/hb_zhouyj/article/details/89888646 */
      if (config.performance && mark) {
        startTag = "vue-perf-start:" + (vm._uid);
        endTag = "vue-perf-end:" + (vm._uid);
        mark(startTag);
      }

      // 一个避免被观察到的标志
      vm._isVue = true;

      // 合并options
      if (options && options._isComponent) {
        // 优化内部组件实例化，因为动态选项合并非常慢，并且没有任何内部组件选项需要特殊处理。
        initInternalComponent(vm, options);
      } else {
        // 用于当前Vue实例的初始化选项。需要在选项中包含自定义属性时会有用
        vm.$options = mergeOptions(
          // 解析constructor上的options属性的(Vue.options)
          resolveConstructorOptions(vm.constructor),
          options || {},
          vm
        );
      }

      {
        //初始化proxy
        initProxy(vm);
      }

      // 暴露自己
      vm._self = vm;
      initLifecycle(vm); // 初始化生命周期
      initEvents(vm); // 初始化事件
      initRender(vm); // 初始化渲染 
      // 第一个生命周期 beforeCreate
      callHook(vm, 'beforeCreate');
      initInjections(vm); //初始化 inject
      initState(vm);
      initProvide(vm); // 初始化provide, 把provide上的数据添加到vm._provide上
      // 第二个生命周期created
      callHook(vm, 'created');

      /* 浏览器性能监控 https://blog.csdn.net/hb_zhouyj/article/details/89888646 */
      if (config.performance && mark) {
        vm._name = formatComponentName(vm, false);
        mark(endTag);
        measure(("vue " + (vm._name) + " init"), startTag, endTag);
      }

      if (vm.$options.el) {
        // Vue 的$mount()为手动挂载，
        // 在项目中可用于延时挂载（例如在挂载之前要进行一些其他操作、判断等），之后要手动挂载上。
        // new Vue时，el和$mount并没有本质上的不同。
        vm.$mount(vm.$options.el);
      }
    };
  }

  // 初始化内部组件
  function initInternalComponent (vm, options) {
    var opts = vm.$options = Object.create(vm.constructor.options);
    // 这样做是因为它比动态枚举更快。
    var parentVnode = options._parentVnode;
    opts.parent = options.parent;
    opts._parentVnode = parentVnode;

    var vnodeComponentOptions = parentVnode.componentOptions;
    opts.propsData = vnodeComponentOptions.propsData;
    opts._parentListeners = vnodeComponentOptions.listeners;
    opts._renderChildren = vnodeComponentOptions.children;
    opts._componentTag = vnodeComponentOptions.tag;

    if (options.render) {
      opts.render = options.render;
      opts.staticRenderFns = options.staticRenderFns;
    }
  }

  /**
   * 解析new Vue constructor上的options，相当于Vue.options
   * Vue.options又有什么呢？
   * => 在 initGlobalAPI(Vue) 的时候定义了这个值
   * => Vue.options.components = {}
   * => Vue.options.directives = {}
   * => Vue.options.filters = {}
   */
  function resolveConstructorOptions (Ctor) {
    var options = Ctor.options;
    // 如果是组件
    if (Ctor.super) {
      var superOptions = resolveConstructorOptions(Ctor.super);
      var cachedSuperOptions = Ctor.superOptions;
      if (superOptions !== cachedSuperOptions) {
        // 确保子类和父类的options一样
        Ctor.superOptions = superOptions;
        // 检查是否有任何后期修改/附加选项
        var modifiedOptions = resolveModifiedOptions(Ctor);
        if (modifiedOptions) {
          extend(Ctor.extendOptions, modifiedOptions);
        }
        options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
        if (options.name) {
          options.components[options.name] = Ctor;
        }
      }
    }
    return options
  }

  /**
   * 对比前后options
   * 解析修饰词，将新的修饰词返回
   */
  function resolveModifiedOptions (Ctor) {
    var modified;
    var latest = Ctor.options; // 新的option
    var sealed = Ctor.sealedOptions;  // 旧的option
    for (var key in latest) {
      if (latest[key] !== sealed[key]) {
        if (!modified) { modified = {}; }
        modified[key] = latest[key];
      }
    }
    return modified
  }

  /**
   * Vue构造函数
   */
  function Vue (options) {
    //必须使用new关键字来创建对象，因为Vue是一个构造器
    if ( !(this instanceof Vue) ) {
      warn('Vue is a constructor and should be called with the `new` keyword');
    }
    //执行Vue.prototype上的_init方法，完成初始化
    this._init(options);
  }

  // 初始化混合
  initMixin(Vue);


  stateMixin(Vue);
  eventsMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  /************************************************************/

  /**
   * 初始化Vue.use
   */
  function initUse (Vue) {
    Vue.use = function (plugin) {
      // 存储已安装过的插件
      var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
      if (installedPlugins.indexOf(plugin) > -1) { // 多次use，只会加载一次
        return this
      }

      // additional parameters
      var args = toArray(arguments, 1);
      args.unshift(this);
      if (typeof plugin.install === 'function') {
        // 如果plugin是个对象，必须提供 install 方法。
        // 可以传入多个参数 /* ╮(╯▽╰)╭  */，args将会被传入plugin对象中的install方法
        plugin.install.apply(plugin, args);
      } else if (typeof plugin === 'function') {
        // 可以传入多个参数 /* ╮(╯▽╰)╭  */，args将会被传入plugin方法中
        plugin.apply(null, args);
      }
      installedPlugins.push(plugin);
      return this
    };
  }


  /**
   * 初始化Vue.mixin
   */
  function initMixin$1 (Vue) {
    Vue.mixin = function (mixin) {
      // 通过mergeOptions来实现 策略模式
      this.options = mergeOptions(this.options, mixin);
      return this
    };
  }

  /**
   * 初始化Vue.extend
   */
  function initExtend (Vue) {
    /**
     * 每个实例构造函数（包括Vue）都有一个唯一的cid。
     * 这使我们能够为原型继承创建包装好的“子构造函数”并缓存它们。
     */
    Vue.cid = 0;
    var cid = 1;

    // 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。
    Vue.extend = function (extendOptions) {
      extendOptions = extendOptions || {};
      var Super = this;
      var SuperId = Super.cid; // 创建实例的id，每个“子类”的cid都不一样
      var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
      /*
        e.g:
        Vue.extend({
            _Ctor: Profile, // 前提是Profile已经存在
        })
      */
      if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
      }

      // 组件名称，没有则使用父类的
      var name = extendOptions.name || Super.options.name;
      if (name) {
        validateComponentName(name);
      }

      var Sub = function VueComponent (options) {
        this._init(options); // 执行Vue.prototype._init
      };
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.cid = cid++;
      Sub.options = mergeOptions(
        Super.options,
        extendOptions
      );
      Sub['super'] = Super; // 标识组件的父类

      // 对于props和computed属性，
      /// 我们在扩展时在Vue实例上的扩展原型上定义代理getter。
      // 这样可以避免对象定义属性调用创建的每个实例。

      // 初始化props
      if (Sub.options.props) {
        initProps$1(Sub);
      }
      // 初始化computed
      if (Sub.options.computed) {
        initComputed$1(Sub);
      }

      // 允许进一步扩展/混合/插件使用
      Sub.extend = Super.extend;
      Sub.mixin = Super.mixin;
      Sub.use = Super.use;

      // 把父类上的component、directive、filter挂载到子类上
      ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type];
      });

      // 如果有组件名称，则在组件的options.components上添加一个key为name,value为组件
      // 在执行_createElement函数创建虚拟DOM时，
      // 会检测options上面的components属性，然后执行createComponent创建组件
      if (name) {
        Sub.options.components[name] = Sub;
      }

      // 在拓展时保留对父组件的options的引用
      // 稍后在实例化时，我们可以检查Super的选项是否已更新。
      Sub.superOptions = Super.options;
      Sub.extendOptions = extendOptions;
      Sub.sealedOptions = extend({}, Sub.options);

      // 缓存组件，extendOptions._Ctor[SuperId] = Sub;
      cachedCtors[SuperId] = Sub;
      return Sub
    };
  }

  /**
   * 在父组件的prototype上添加响应式数据，当有数据变化时,父组件的prototype._props的值也变化
   * 在Vue.prototype上添加响应式数据，当有数据变化时,Vue.prototype._props的值也变化
   */
  function initProps$1 (Comp) {
    var props = Comp.options.props;
    for (var key in props) {
      proxy(Comp.prototype, "_props", key);
    }
  }

  /**
   * 初始化computed属性
   */
  function initComputed$1 (Comp) {
    var computed = Comp.options.computed;
    for (var key in computed) {
      defineComputed(Comp.prototype, key, computed[key]);
    }
  }

  /**
   * 为Vue添加静态方法Vue.component、Vue.directive、Vue.filter
   * type = component时，即注册全局组件，返回一个function VueCompent(){}  
   */
  function initAssetRegisters (Vue) {
    ASSET_TYPES.forEach(function (type) {
      Vue[type] = function (
        id,
        definition
      ) {
        if (!definition) {
          return this.options[type + 's'][id]
        } else {
          if (type === 'component') {
            validateComponentName(id);
          }

          // 如果definition传入的是Vue.extend({ /* ... */ })返回的function VueCompent,
          // 则不进入此条件判断
          if (type === 'component' && isPlainObject(definition)) {
            definition.name = definition.name || id;
            // Vue.extend
            definition = this.options._base.extend(definition);
          }
          if (type === 'directive' && typeof definition === 'function') {
            definition = { bind: definition, update: definition };
          }
          // options.compoents = { '组件名称': function VueComponent(){}}
          // 通过cli创建的工程，组件的引用需要有components
          this.options[type + 's'][id] = definition;
          return definition
        }
      };
    });
  }

  /************************************************************/

  /**
   * 获取组件名称
   */
  function getComponentName (opts) {
    return opts && (opts.Ctor.options.name || opts.tag)
  }

  // 匹配keep-alive组件的include和exclude名称
  function matches (pattern, name) {
    if (Array.isArray(pattern)) {
      // 匹配数组 (使用 `v-bind`) 
      return pattern.indexOf(name) > -1
    } else if (typeof pattern === 'string') {
      // 匹配逗号分隔字符串
      return pattern.split(',').indexOf(name) > -1
    } else if (isRegExp(pattern)) {
      // 匹配正则表达式 (使用 `v-bind`)
      return pattern.test(name)
    }
    return false
  }

  // 精简缓存（如果匹配不到该组件，即将该组件从缓存中移除）
  function pruneCache (keepAliveInstance, filter) {
    var cache = keepAliveInstance.cache;
    var keys = keepAliveInstance.keys;
    var _vnode = keepAliveInstance._vnode;
    for (var key in cache) {
      var cachedNode = cache[key];
      if (cachedNode) {
        var name = getComponentName(cachedNode.componentOptions);
        if (name && !filter(name)) {
          pruneCacheEntry(cache, key, keys, _vnode);
        }
      }
    }
  }

  // 移除缓存中的组件并销毁该组件
  function pruneCacheEntry (cache, key, keys, current) {
    var cached$$1 = cache[key];
    if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
      cached$$1.componentInstance.$destroy();
    }
    cache[key] = null;
    remove(keys, key);
  }

  var patternTypes = [String, RegExp, Array];

  // keep-alive组件
  var KeepAlive = {
    name: 'keep-alive',
    abstract: true, // 是否为抽象组件

    props: {
      // include 和 exclude prop 允许组件有条件地缓存。二者都可以用逗号分隔字符串、正则表达式或一个数组来表示
      include: patternTypes,
      exclude: patternTypes,
      // 最多可以缓存多少组件实例。一旦这个数字达到了，在新实例被创建之前，已缓存组件中最久没有被访问的实例会被销毁掉。
      max: [String, Number] 
    },

    // created生命周期
    created: function created () {
      this.cache = Object.create(null);
      this.keys = [];
    },

    // destroyed生命周期
    destroyed: function destroyed () {
      for (var key in this.cache) {
        pruneCacheEntry(this.cache, key, this.keys);
      }
    },

    // mounted生命周期
    mounted: function mounted () {
      var this$1 = this;

      // 监听include属性，移除缓存中不属于include包含的组件
      this.$watch('include', function (val) {
        pruneCache(this$1, function (name) { return matches(val, name); });
      });
      // 监听exclude属性，移除缓存中不属于exclude包含的组件
      this.$watch('exclude', function (val) {
        pruneCache(this$1, function (name) { return !matches(val, name); });
      });
    },

    // render函数
    render: function render () {
      var slot = this.$slots.default;
      //  vnode为第一个子组件
      var vnode = getFirstComponentChild(slot);
      // 子组件的options
      var componentOptions = vnode && vnode.componentOptions;
      if (componentOptions) {
        var name = getComponentName(componentOptions);
        var ref = this;
        var include = ref.include;
        var exclude = ref.exclude;
        if (
          // not included
          (include && (!name || !matches(include, name))) ||
          // excluded
          (exclude && name && matches(exclude, name))
        ) {
          return vnode
        }

        var ref$1 = this;
        var cache = ref$1.cache;
        var keys = ref$1.keys;
        var key = vnode.key == null
          // 同一个构造函数可能会注册为不同的本地组件，因此仅使用cid是不够的
          // e.g. 1::child
          ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
          : vnode.key;
        if (cache[key]) {
          // 如果本地缓存有
          vnode.componentInstance = cache[key].componentInstance;
          // 使用当前最新的key
          remove(keys, key);
          keys.push(key);
        } else {
          cache[key] = vnode;
          keys.push(key);
          // 最多可以缓存多少组件实例。一旦这个数字达到了，在新实例被创建之前，
          // 已缓存组件中最久没有被访问的实例会被销毁掉。
          if (this.max && keys.length > parseInt(this.max)) {
            pruneCacheEntry(cache, keys[0], keys, this._vnode);
          }
        }

        vnode.data.keepAlive = true;
      }
      return vnode || (slot && slot[0])
    }
  };

  // 内置组件
  var builtInComponents = {
    KeepAlive: KeepAlive
  };

  /************************************************************/
  
  /**
   * 初始化全局api 
   */
  function initGlobalAPI (Vue) {
    // config
    var configDef = {};
    configDef.get = function () { return config; };
    {
      configDef.set = function () {
        warn(
          'Do not replace the Vue.config object, set individual fields instead.'
        );
      };
    }
    //为Vue构造函数添加config对象，该对象无法设置值，只能取值
    Object.defineProperty(Vue, 'config', configDef);

    /**
     * 暴露的tuil方法
     * 注意：这些方法不是公共API的一部分，应该避免依赖，除非你能够意识到其中的危险
     */
    Vue.util = {
      warn: warn,
      extend: extend,
      mergeOptions: mergeOptions,
      defineReactive: defineReactive$$1
    };

    Vue.set = set;
    Vue.delete = del;
    Vue.nextTick = nextTick;

    // 2.6以后新增的API
    Vue.observable = function (obj) {
      observe(obj);
      return obj
    };

    // Vue的options配置
    Vue.options = Object.create(null);
    ASSET_TYPES.forEach(function (type) {
      Vue.options[type + 's'] = Object.create(null);
    });

    Vue.options._base = Vue;
    // 拓展组件
    // KeepAlive参数中的组件对象 相当于在compoents对象上加一个属性，值为一个对象
    extend(Vue.options.components, builtInComponents);

    initUse(Vue);
    initMixin$1(Vue);
    initExtend(Vue);
    initAssetRegisters(Vue);
  }

  initGlobalAPI(Vue);

  Object.defineProperty(Vue.prototype, '$isServer', {
    get: isServerRendering
  });

  Object.defineProperty(Vue.prototype, '$ssrContext', {
    get: function get () {
      return this.$vnode && this.$vnode.ssrContext
    }
  });

  // 暴露渲染上下文
  Object.defineProperty(Vue, 'FunctionalRenderContext', {
    value: FunctionalRenderContext
  });

  /************************************************************/

  Vue.version = '2.6.10';

  /**
   * 这些是为web保留的，因为它们是在模板编译过程中直接编译掉的
   */
  var isReservedAttr = makeMap('style,class');

  // 应该使用value进行绑定的标签
  var acceptValue = makeMap('input,textarea,option,select,progress');
  var mustUseProp = function (tag, type, attr) {
    return (
      (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
      (attr === 'selected' && tag === 'option') ||
      (attr === 'checked' && tag === 'input') ||
      (attr === 'muted' && tag === 'video')
    )
  };

  // 是否是可枚举属性
  // contenteditable属性指定元素内容是否可编辑
  // draggable属性规定元素是否可拖动
  // spellcheck属性规定是否对元素内容进行拼写检查
  var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

  // events,caret,typing,plaintext-only这几个值还只是草案
  var isValidContentEditableValue = makeMap('events,caret,typing,plaintext-only');

  // 转换枚举属性值为字符串
  var convertEnumeratedValue = function (key, value) {
    return isFalsyAttrValue(value) || value === 'false'
      ? 'false'
      : key === 'contenteditable' && isValidContentEditableValue(value)
        ? value
        : 'true'
  };

  // 检查是否是html中的布尔值属性，就是该属性只能是true或false
  var isBooleanAttr = makeMap(
    'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
    'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
    'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
    'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
    'required,reversed,scoped,seamless,selected,sortable,translate,' +
    'truespeed,typemustmatch,visible'
  );

  // 在XML文档中使用 XLink 来创建链接
  var xlinkNS = 'http://www.w3.org/1999/xlink';
  
  // 判断name是否为xlink属性名
  var isXlink = function (name) {
    return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
  };

  // 获取xlink属性名
  // e.g: name = 'xlink:href'
  // return 'href'
  var getXlinkProp = function (name) {
    return isXlink(name) ? name.slice(6, name.length) : ''
  };

  // 判断val是否是假值
  var isFalsyAttrValue = function (val) {
    return val == null || val === false
  };

  // 为vnode生成class
  function genClassForVnode (vnode) {
    var data = vnode.data;
    var parentNode = vnode;
    var childNode = vnode;
    // 如果vnode为一个组件，则将定义在组件上的class合并到它将要渲染的标签
    /**
      e.g. 
      <child class="wrapper"></child>
      Vue.component("child", {
        data() {
          return {}
        },
        template: `<div class="content">hello world</div>`
      })
     */
    while (isDef(childNode.componentInstance)) {
      childNode = childNode.componentInstance._vnode;
      if (childNode && childNode.data) {
        data = mergeClassData(childNode.data, data);
      }
    }
    // 如果父级存在，则将父级的class合并到当前元素的class
    while (isDef(parentNode = parentNode.parent)) {
      if (parentNode && parentNode.data) {
        data = mergeClassData(data, parentNode.data);
      }
    }
    return renderClass(data.staticClass, data.class)
  }

  // 合并class
  function mergeClassData (child, parent) {
    return {
      staticClass: concat(child.staticClass, parent.staticClass),
      class: isDef(child.class)
        ? [child.class, parent.class]
        : parent.class
    }
  }

  // 渲染class
  function renderClass (staticClass, dynamicClass) {
    if (isDef(staticClass) || isDef(dynamicClass)) {
      return concat(staticClass, stringifyClass(dynamicClass))
    }
    return ''
  }

  function concat (a, b) {
    return a ? b ? (a + ' ' + b) : a : (b || '')
  }

  /**
   * 将class转成json格式
   */
  function stringifyClass (value) {
    if (Array.isArray(value)) {
      return stringifyArray(value)
    }
    if (isObject(value)) {
      return stringifyObject(value)
    }
    if (typeof value === 'string') {
      return value
    }
    return ''
  }

  /**
   * 将数组形式的class转成json格式
   */
  function stringifyArray (value) {
    var res = '';
    var stringified;
    for (var i = 0, l = value.length; i < l; i++) {
      if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
        if (res) { res += ' '; }
        res += stringified;
      }
    }
    return res
  }

  /**
   * 将对象形式的class转成json格式
   */
  function stringifyObject (value) {
    var res = '';
    for (var key in value) {
      if (value[key]) {
        if (res) { res += ' '; }
        res += key;
      }
    }
    return res
  }

  /************************************************************/

  var namespaceMap = {
    svg: 'http://www.w3.org/2000/svg',
    math: 'http://www.w3.org/1998/Math/MathML'
  };

  // HTML内置标签
  var isHTMLTag = makeMap(
    'html,body,base,head,link,meta,style,title,' +
    'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
    'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
    'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
    's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
    'embed,object,param,source,canvas,script,noscript,del,ins,' +
    'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
    'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
    'output,progress,select,textarea,' +
    'details,dialog,menu,menuitem,summary,' +
    'content,element,shadow,template,blockquote,iframe,tfoot'
  );

  // svg标签
  var isSVG = makeMap(
    'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
    'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
    'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
    true
  );
  
  // 是否是pre标签
  var isPreTag = function (tag) { return tag === 'pre'; };
  
  // 是否是保留标签（包含html和svg）
  var isReservedTag = function (tag) {
    return isHTMLTag(tag) || isSVG(tag)
  };

  // 获取标签的命名空间
  function getTagNamespace (tag) {
    if (isSVG(tag)) {
      return 'svg'
    }
    // 对MathML的基本支持
    // 注意，它不支持其他MathML元素作为组件根
    if (tag === 'math') {
      return 'math'
    }
  }

  var unknownElementCache = Object.create(null);
  /**
   * 
   * 判断是否是html原有的标签，判断是否是浏览器标准标签 包括标准html和svg标签
   * 如果不是则返回真，这样就是用户自定义标签
   */
  function isUnknownElement (tag) {
    if (!inBrowser) {
      return true
    }
    if (isReservedTag(tag)) {
      return false
    }
    tag = tag.toLowerCase();
    if (unknownElementCache[tag] != null) {
      return unknownElementCache[tag]
    }
    var el = document.createElement(tag);
    // 判断是否是含有 - 的组件标签
    if (tag.indexOf('-') > -1) {
      // http://stackoverflow.com/a/28210364/1070244
      return (unknownElementCache[tag] = (
        el.constructor === window.HTMLUnknownElement ||
        el.constructor === window.HTMLElement
      ))
    } else {
      // 如果不是HTML原有的标签，则返回true
      // el.toString() = "[object HTMLUnknownElement]" || "[object HTMLDivElement]"
      return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
    }
  }

  // 判断是否是文本类型的input
  var isTextInputType = makeMap('text,number,password,search,email,tel,url');

  /************************************************************/

  /**
   * 查找元素
   * 如果不存在该元素，则创建一个div标签返回
   */
  function query (el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);
      if (!selected) {
        warn(
          'Cannot find element: ' + el
        );
        return document.createElement('div')
      }
      return selected
    } else {
      return el
    }
  }

  /**
   * 创建一个真实的DOM 
   */
  function createElement$1 (tagName, vnode) {
    var elm = document.createElement(tagName);
    if (tagName !== 'select') {
      return elm
    }
    // false或null将删除该属性，但undefined不会
    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }
    return elm
  }

  /**
   * 创建一个真实的dom svg方式
   */
  function createElementNS (namespace, tagName) {
    return document.createElementNS(namespaceMap[namespace], tagName)
  }

  /**
   * 创建一个文本节点
   */
  function createTextNode (text) {
    return document.createTextNode(text)
  }

  /**
   * 创建一个注释节点
   */
  function createComment (text) {
    return document.createComment(text)
  }

  /**
   * 前插
   * reference => 参考
   */
  function insertBefore (parentNode, newNode /* 新节点 */, referenceNode /* 参考节点 */) {
    // 将newNode插到referenceNode前面
    parentNode.insertBefore(newNode, referenceNode);
  }

  /**
   * 移除节点
   */
  function removeChild (node, child) {
    node.removeChild(child);
  }

  /**
   * 后插
   */
  function appendChild (node, child) {
    node.appendChild(child);
  }

  /**
   * 返回当前节点的父节点
   */
  function parentNode (node) {
    return node.parentNode
  }

  /**
   * 返回当前节点的兄弟节点
   */
  function nextSibling (node) {
    return node.nextSibling
  }

  /**
   * 返回当前节点的标签名
   */
  function tagName (node) {
    return node.tagName
  }

  /**
   * 设置节点的文本内容
   */
  function setTextContent (node, text) {
    node.textContent = text;
  }

  /**
   * 设置节点的作用域Id
   */
  function setStyleScope (node, scopeId) {
    node.setAttribute(scopeId, '');
  }

  // 处理节点的options
  var nodeOps = Object.freeze({
    createElement: createElement$1,
    createElementNS: createElementNS,
    createTextNode: createTextNode,
    createComment: createComment,
    insertBefore: insertBefore,
    removeChild: removeChild,
    appendChild: appendChild,
    parentNode: parentNode,
    nextSibling: nextSibling,
    tagName: tagName,
    setTextContent: setTextContent,
    setStyleScope: setStyleScope
  });


  /************************************************************/

  // 创建，更新，销毁
  var ref = {
    create: function create (_, vnode) {
      registerRef(vnode);
    },
    update: function update (oldVnode, vnode) {
      if (oldVnode.data.ref !== vnode.data.ref) {
        // 先销毁，后创建
        registerRef(oldVnode, true);
        registerRef(vnode);
      }
    },
    destroy: function destroy (vnode) {
      registerRef(vnode, true);
    }
  };

  /**
   * 注册ref或者删除ref引用。
   * 比如标签上面设置了ref='abc' 那么该函数就是为this.$refs.abc 注册ref 把真实的dom存进去
   */
  function registerRef (vnode, isRemoval) {
    var key = vnode.data.ref;
    if (!isDef(key)) { return }

    var vm = vnode.context;
    var ref = vnode.componentInstance || vnode.elm;
    var refs = vm.$refs;
    if (isRemoval) {
      if (Array.isArray(refs[key])) {
        remove(refs[key], ref);
      } else if (refs[key] === ref) {
        refs[key] = undefined;
      }
    } else {
      if (vnode.data.refInFor) {
        if (!Array.isArray(refs[key])) {
          refs[key] = [ref];
        } else if (refs[key].indexOf(ref) < 0) {
          refs[key].push(ref);
        }
      } else {
        refs[key] = ref;
      }
    }
  }

  /**
   * 虚拟DOM
   * 不进行类型检查，因为此文件是性能的关键，并且使流理解它的成本不值得。
   */
  var emptyNode = new VNode('', {}, []);

  var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

  /**
   * 判断两个虚拟DOM是否相同
   */
  function sameVnode (a, b) {
    return (
      a.key === b.key /* key值相等 */ && (
        (
          a.tag === b.tag /* 标签一样 */ &&
          a.isComment === b.isComment /* 要么是注释节点，要么都不是 */ &&
          isDef(a.data) === isDef(b.data) /* data都已经定义（不等于undefined或者null） */ &&
          sameInputType(a, b) /* input类型相等 */
        ) || (
          isTrue(a.isAsyncPlaceholder) && // 是异步占位符节点
          a.asyncFactory === b.asyncFactory && // 异步工厂方法
          isUndef(b.asyncFactory.error)
        )
      )
    )
  }
  /**
   * 判断两个虚拟DOM的输入类型是否相等
   */
  function sameInputType (a, b) {
    // 只要a虚拟DOM的标签不等于input，则相等
    if (a.tag !== 'input') { return true }
    var i;
    var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
    var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
    return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
  }

  // 创建vnodes的key对象
  // e.g.
  // map = { "echarts-1": 1, "echarts-2": 2 }
  function createKeyToOldIdx (children /* 旧子节点oldCh */, beginIdx, endIdx) {
    var i, key;
    var map = {};
    for (i = beginIdx; i <= endIdx; ++i) {
      key = children[i].key;
      if (isDef(key)) { map[key] = i; }
    }
    return map
  }

  // 创建patch函数
  function createPatchFunction (backend) {
    var i, j;
    var cbs = {};

    var modules = backend.modules;
    var nodeOps = backend.nodeOps;

    // 把钩子函数添加到cbs对列中
    // hooks = ['create', 'activate', 'update', 'remove', 'destroy'];
    for (i = 0; i < hooks.length; ++i) {
      cbs[hooks[i]] = [];
      for (j = 0; j < modules.length; ++j) {
        if (isDef(modules[j][hooks[i]])) {
          cbs[hooks[i]].push(modules[j][hooks[i]]);
        }
        /*
          e.g.
          cbs = {
            "create": [
              function updateAttrs(),
              // ...
            ]
          }
        */
      }
    }

    // 创建空VNode
    function emptyNodeAt (elm) {
      return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    // 创建移除节点回调函数
    function createRmCb (childElm, listeners /* cbs.remove.length + 1 */) {
      function remove$$1 () {
        if (--remove$$1.listeners === 0) {
          removeNode(childElm);
        }
      }
      remove$$1.listeners = listeners;
      return remove$$1
    }

    // 移除节点
    function removeNode (el) {
      var parent = nodeOps.parentNode(el);
      // 由于v-html/v-text，元素可能已被删除
      if (isDef(parent)) {
        nodeOps.removeChild(parent, el);
      }
    }

    // 判断VNode节点是否为未知的自定义标签
    function isUnknownElement$$1 (vnode, inVPre) {
      return (
        !inVPre &&
        !vnode.ns &&
        !(
          config.ignoredElements.length &&
          config.ignoredElements.some(function (ignore) {
            return isRegExp(ignore)
              ? ignore.test(vnode.tag)
              : ignore === vnode.tag
          })
        ) &&
        config.isUnknownElement(vnode.tag)
      )
    }

    var creatingElmInVPre = 0;

    // 创建Element
    function createElm (
      vnode,
      insertedVnodeQueue,
      parentElm,
      refElm, /* 兄弟节点 */
      nested, /* 嵌套的 (创建子节点时，即为嵌套的) */
      ownerArray, // vnodes 在执行addVnodes添加新的节点时，ownerArray为新的vnodes节点列表
      index // 创建vnode数组的第几个Element
    ) {
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // 此vnode已在以前的渲染中使用！
        // 现在它被用作一个新节点，当它被用作插入引用节点时，重写它的elm将导致潜在的修补程序错误。
        // 相反，在为节点创建关联的DOM元素之前，我们会按需克隆节点。
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      vnode.isRootInsert = !nested; // 为 transition enter 校验
      if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
        return
      }

      var data = vnode.data;
      var children = vnode.children;
      var tag = vnode.tag;
      if (isDef(tag)) {
        {
          if (data && data.pre) {
            // 这里使用++方式而不是使用Boolean方式的原因是：递归子节点时，可能也会存在v-pre属性
            creatingElmInVPre++;
          }
          // 如果有v-pre属性，则跳过检查
          if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
            // 未知的自定义元素：<'+tag+'>-是否正确注册了组件？对于递归组件，请确保提供“name”选项。
            warn(
              'Unknown custom element: <' + tag + '> - did you ' +
              'register the component correctly? For recursive components, ' +
              'make sure to provide the "name" option.',
              vnode.context
            );
          }
        }

        vnode.elm = vnode.ns
          ? nodeOps.createElementNS(vnode.ns, tag)
          : nodeOps.createElement(tag, vnode);
        
        // 设置scopeId，如果存在的话
        setScope(vnode);

        {
          // 创建子节点
          createChildren(vnode, children, insertedVnodeQueue);
          if (isDef(data)) {
            // 如果data存在，则调用create钩子函数
            invokeCreateHooks(vnode, insertedVnodeQueue);
          }
          // 将VNode的元素插入到父元素中
          insert(parentElm, vnode.elm, refElm);
        }

        // 当前节点已经解析完毕，需要将breatingElmInVPre标志位 `--`
        if (data && data.pre) {
          creatingElmInVPre--;
        }
      } else if (isTrue(vnode.isComment)) {
        // 注释节点，直接创建并插入到父节点中
        vnode.elm = nodeOps.createComment(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      } else {
        // 默认情况下为文本节点
        vnode.elm = nodeOps.createTextNode(vnode.text);
        insert(parentElm, vnode.elm, refElm);
      }
    }

    /**
     * 创建组件
     */
    function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i = vnode.data;
      if (isDef(i)) {
        var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
        if (isDef(i = i.hook) && isDef(i = i.init)) {
          i(vnode, false /* hydrating */);
        }
        // 在调用init钩子之后，如果vnode是一个子组件，那么它应该创建一个子实例并挂载它。
        // 子组件还设置了占位符vnode的elm。在这种情况下，我们只需返回元素就可以了。
        if (isDef(vnode.componentInstance)) {
          initComponent(vnode, insertedVnodeQueue);
          insert(parentElm, vnode.elm, refElm);
          if (isTrue(isReactivated)) {
            reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
          }
          return true
        }
      }
    }

    // 初始化组件
    function initComponent (vnode, insertedVnodeQueue) {
      if (isDef(vnode.data.pendingInsert)) {
        insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
        vnode.data.pendingInsert = null;
      }
      vnode.elm = vnode.componentInstance.$el;
      if (isPatchable(vnode)) {
        invokeCreateHooks(vnode, insertedVnodeQueue);
        setScope(vnode);
      } else {
        // 空的根组件
        // 跳过除ref以外的所有元素相关模块
        registerRef(vnode);
        // 确保调用insert钩子
        insertedVnodeQueue.push(vnode);
      }
    }

    // 重新激活keep-alive组件
    function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
      var i;
      // 具有内部转换的重新激活组件不会触发，因为内部节点创建的钩子不会再次调用。
      // 在这里引入特定于模块的逻辑并不理想，但似乎没有更好的方法。
      var innerNode = vnode;
      while (innerNode.componentInstance) {
        innerNode = innerNode.componentInstance._vnode;
        if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
          for (i = 0; i < cbs.activate.length; ++i) {
            cbs.activate[i](emptyNode, innerNode);
          }
          insertedVnodeQueue.push(innerNode);
          break
        }
      }
      //与新创建的组件不同，重新激活的keep-alive组件不会插入自身
      insert(parentElm, vnode.elm, refElm);
    }

    // 将节点插入到父节点中
    function insert (parent, elm, ref$$1) {
      if (isDef(parent)) {
        if (isDef(ref$$1)) { // 在执行diff算法的过程中，可能会存在兄弟节点ref$$1
          if (nodeOps.parentNode(ref$$1) === parent) {
            // 前插
            nodeOps.insertBefore(parent, elm, ref$$1);
          }
        } else {
          nodeOps.appendChild(parent, elm);
        }
      }
    }

    // 创建子节点
    function createChildren (vnode, children, insertedVnodeQueue) {
      if (Array.isArray(children)) {
        {
          checkDuplicateKeys(children);
        }
        for (var i = 0; i < children.length; ++i) {
          createElm(children[i], insertedVnodeQueue, vnode.elm, null, true /* 嵌套的 */, children, i);
        }
      } else if (isPrimitive(vnode.text)) {
        // 对于原始值类型，直接插入
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
      }
    }

    // 判断VNode节点是否可以patch
    function isPatchable (vnode) {
      while (vnode.componentInstance) {
        vnode = vnode.componentInstance._vnode;
      }
      return isDef(vnode.tag)
    }

    // 调用create hook
    function invokeCreateHooks (vnode, insertedVnodeQueue) {
      for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
        cbs.create[i$1](emptyNode, vnode);
      }
      i = vnode.data.hook; // 如果data定义了create或insert钩子，
      if (isDef(i)) {
        if (isDef(i.create)) { 
          i.create(emptyNode, vnode); // 调用自定义的create钩子
        }
        // 调用insert钩子，insert钩子在enter时注册
        if (isDef(i.insert)) { 
          insertedVnodeQueue.push(vnode); // 将自定义的insert插入节点钩子添加到 `插入节点队列` 中
        }
      }
    }

    // 为作用域CSS设置作用域id属性。
    // 这个作为特例实现，以避免执行常规属性修补过程的开销。
    function setScope (vnode) {
      var i;
      if (isDef(i = vnode.fnScopeId)) {
        nodeOps.setStyleScope(vnode.elm, i);
      } else {
        var ancestor = vnode;
        while (ancestor) {
          if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
            nodeOps.setStyleScope(vnode.elm, i);
          }
          ancestor = ancestor.parent;
        }
      }
      // 对于插槽内容，它们还应该从宿主实例获取scopeId。
      if (isDef(i = activeInstance) &&
        i !== vnode.context &&
        i !== vnode.fnContext &&
        isDef(i = i.$options._scopeId)
      ) {
        nodeOps.setStyleScope(vnode.elm, i);
      }
    }

    /**
     * 添加节点
     * @param {Element} parentElm 父元素
     * @param {Element} refElm 兄弟节点
     * @param {VNode} vnodes vnode数组
     * @param {Number} startIdx 开始索引
     * @param {Number} endIdx 结束索引
     * @param {Array} insertedVnodeQueue 插入节点队列
     */
    function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
      for (; startIdx <= endIdx; ++startIdx) {
        createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
      }
    }

    // 触发销毁节点钩子函数
    function invokeDestroyHook (vnode) {
      var i, j;
      var data = vnode.data;
      if (isDef(data)) {
        // e.g.
        // 
        if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
        for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
      }
      // 递归销毁节点，先销毁当前节点，然后再销毁子节点
      if (isDef(i = vnode.children)) {
        for (j = 0; j < vnode.children.length; ++j) {
          invokeDestroyHook(vnode.children[j]);
        }
      }
    }

    // 移除节点
    function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
        var ch = vnodes[startIdx];
        if (isDef(ch)) {
          if (isDef(ch.tag)) {
            removeAndInvokeRemoveHook(ch);
            invokeDestroyHook(ch);
          } else { 
            // 移除文本节点
            removeNode(ch.elm);
          }
        }
      }
    }

    // 移除并调用remove hook
    function removeAndInvokeRemoveHook (vnode, rm) {
      if (isDef(rm) || isDef(vnode.data)) {
        var i;
        var listeners = cbs.remove.length + 1;
        if (isDef(rm)) {
          // we have a recursively passed down rm callback
          // increase the listeners count
          rm.listeners += listeners;
        } else {
          // directly removing
          rm = createRmCb(vnode.elm, listeners);
        }
        // recursively invoke hooks on child component root node
        if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
          removeAndInvokeRemoveHook(i, rm);
        }
        for (i = 0; i < cbs.remove.length; ++i) {
          cbs.remove[i](vnode, rm);
        }
        if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
          i(vnode, rm);
        } else {
          rm();
        }
      } else {
        removeNode(vnode.elm);
      }
    }

    // 更新子节点
    function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
      
      // e.g. 
      // oldCh = [vnode1, vnode2, vnode3, vnode4, vnode5]
      // newCh = [vnode1, newVnode, vnode4, vnode3, vnode5]
      // 1、执行#3
      // oldCh = [vnode2, vnode3, vnode4, vnode5]
      // newCh = [newVnode, vnode4, vnode3, vnode5]
      // 2、执行#4 
      // oldCh = [vnode2, vnode3, vnode4]
      // newCh = [newVnode, vnode4, vnode3]
      // 3、执行#7 
      // oldCh = [vnode2, vnode3, vnode4]
      // newCh = [vnode4, vnode3]
      // 4、执行#6 
      // oldCh = [vnode2, vnode3]
      // newCh = [vnode3]
      // 5、执行#6 
      // oldCh = [vnode2]
      // newCh = []
      // 6、执行#10 
      // oldCh = []
      // newCh = []

      // e.g. 
      // oldCh = [vnode1, vnode2, vnode3, vnode4, vnode5]
      // newCh = [vnode3, newVnode, vnode1, vnode2, vnode4]
      // 1、执行#8
      // oldCh = [vnode1, vnode2, undefined, vnode4, vnode5]
      // newCh = [newVnode, vnode1, vnode2, vnode4]
      // 2、执行#7
      // oldCh = [vnode1, vnode2, undefined, vnode4, vnode5]
      // newCh = [vnode1, vnode2, vnode4]
      // 3、执行#3
      // oldCh = [vnode2, undefined, vnode4, vnode5]
      // newCh = [vnode2, vnode4]
      // 4、执行#3
      // oldCh = [undefined, vnode4, vnode5]
      // newCh = [vnode4]
      // 5、执行#1
      // oldCh = [vnode4, vnode5]
      // newCh = [vnode4]
      // 6、执行#3
      // oldCh = [vnode5]
      // newCh = []
      // 7、执行#10
      // oldCh = []
      // newCh = []

      var oldStartIdx = 0; // 旧开始节点索引
      var newStartIdx = 0; // 新开始节点索引
      var oldEndIdx = oldCh.length - 1; // 旧结束节点索引
      var oldStartVnode = oldCh[0]; // 旧开始节点
      var oldEndVnode = oldCh[oldEndIdx]; // 旧结束节点
      var newEndIdx = newCh.length - 1; // 新结束节点索引
      var newStartVnode = newCh[0]; // 新开始节点
      var newEndVnode = newCh[newEndIdx]; // 新结束节点
      var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

      // removeOnly是一个特殊的标志，仅由<transition group>使用，以确保移除的元素在离开转换期间保持在正确的相对位置
      var canMove = !removeOnly;

      {
        checkDuplicateKeys(newCh); // 检测赋值的keys
      }

      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (isUndef(oldStartVnode) /* #1 */) { // 如果旧开始节点为undefined，则oldStartIdx加1
          oldStartVnode = oldCh[++oldStartIdx];
        } else if (isUndef(oldEndVnode) /* #2 */) { // 如果旧结束节点为undefined，则oldEndIdx减1
          oldEndVnode = oldCh[--oldEndIdx];
        } else if (sameVnode(oldStartVnode, newStartVnode) /* #3 */) { // 如果旧开始子节点和新开始子节点一样
          // 递归对比这两个子节点
          patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          oldStartVnode = oldCh[++oldStartIdx];
          newStartVnode = newCh[++newStartIdx];
        } else if (sameVnode(oldEndVnode, newEndVnode) /* #4 */) { // 如果旧结束子节点和新结束子节点一样
          // 递归对比这两个子节点
          patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          oldEndVnode = oldCh[--oldEndIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldStartVnode, newEndVnode) /* #5 */) { // 旧开始子节点和新结束子节点一样
          // 递归对比这两个子节点
          patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
          // 将旧开始节点移动到最右边
          canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
          oldStartVnode = oldCh[++oldStartIdx];
          newEndVnode = newCh[--newEndIdx];
        } else if (sameVnode(oldEndVnode, newStartVnode) /* #6 */) { // 旧结束子节点和新开始子节点一样
          // 递归对比这两个子节点
          patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
          // 将旧结束节点移动到最左边
          canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
          oldEndVnode = oldCh[--oldEndIdx];
          newStartVnode = newCh[++newStartIdx];
        } else {
          // 使用key时的比较
          // e.g. oldKeyToIdx = { "echarts-1": 1, "echarts-2": 2 }
          if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }

          // 查找新开始节点的key值在旧子节点列表中的索引
          idxInOld = isDef(newStartVnode.key)
            ? oldKeyToIdx[newStartVnode.key]
            : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
          if (isUndef(idxInOld) /* #7 */) { // 找不到相同的key值，视为新元素
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
          } else { /* #8 */
            vnodeToMove = oldCh[idxInOld];
            if (sameVnode(vnodeToMove, newStartVnode)) { // 旧可以移动的子节点和新开始子节点一样
              // 递归对比这两个子节点
              patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);

              // 清除vnode3
              oldCh[idxInOld] = undefined;
              canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
            } else {
              // 相同的键但不同的元素. 视为新元素
              createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
            }
          }
          // newCh的开始索引加1
          newStartVnode = newCh[++newStartIdx];
        }
      }
      if (oldStartIdx > oldEndIdx /* #9 */) {
        refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
        // 如果旧节点数组的开始索引大于旧节点的结束索引，则添加新节点
        addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else if (newStartIdx > newEndIdx /* #10 */) {
        // 删除节点
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }

    // 检测 `key` 是否有重复
    function checkDuplicateKeys (children) {
      var seenKeys = {};
      for (var i = 0; i < children.length; i++) {
        var vnode = children[i];
        var key = vnode.key;
        if (isDef(key)) {
          if (seenKeys[key]) {
            warn(
              ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
              vnode.context
            );
          } else {
            seenKeys[key] = true;
          }
        }
      }
    }

    // 查找新旧子节点相等的索引下标
    function findIdxInOld (node, oldCh, start, end) {
      for (var i = start; i < end; i++) {
        var c = oldCh[i];
        if (isDef(c) && sameVnode(node, c)) { return i }
      }
    }

    // 修补VNode
    function patchVnode (
      oldVnode, // 旧VNode
      vnode, // 新VNode
      insertedVnodeQueue, // 
      ownerArray,
      index,
      removeOnly
    ) {
      if (oldVnode === vnode) {
        return
      }

      // elm 为真实的dom
      if (isDef(vnode.elm) && isDef(ownerArray)) {
        // 克隆Vnode
        vnode = ownerArray[index] = cloneVNode(vnode);
      }

      var elm = vnode.elm = oldVnode.elm;

      // 如果为异步组件，则终止函数
      if (isTrue(oldVnode.isAsyncPlaceholder)) {
        // 如果异步组件状态已加载成功
        if (isDef(vnode.asyncFactory.resolved)) {
          hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
        } else {
          vnode.isAsyncPlaceholder = true;
        }
        return
      }

      // 重用静态元素树
      // 注释我们只在vnode被克隆的情况下才这样做 -
      // 如果新节点没有被克隆，这意味着渲染函数已经被热重新加载api重置，
      // 我们需要进行适当的重新渲染。
      if (isTrue(vnode.isStatic) &&
        isTrue(oldVnode.isStatic) &&
        vnode.key === oldVnode.key &&
        (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
      ) {
        vnode.componentInstance = oldVnode.componentInstance;
        return
      }

      var i;
      var data = vnode.data;
      // 更新组件时，执行组件的前置hook prepatch
      if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
        i(oldVnode, vnode);
      }

      var oldCh = oldVnode.children;
      var ch = vnode.children;

      // 如果data定义了，并且VNode节点可以patch
      if (isDef(data) && isPatchable(vnode)) {
        // updateAttrs、updateClass、updateDOMListeners、updateDOMProps、updateStyle、update、updateDirectives
        for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
        if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
      }
      if (isUndef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) { /* 如果新旧节点都有子节点，并且子节点不一样，则更新children */
          if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
        } else if (isDef(ch)) {
          {
            checkDuplicateKeys(ch);
          }
          // 如果旧节点存在text，则更新elm的文本为空
          if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
          // 添加节点
          addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
        } else if (isDef(oldCh)) {
          // 新节点不存在字节点，则elm移除子节点
          removeVnodes(elm, oldCh, 0, oldCh.length - 1);
        } else if (isDef(oldVnode.text)) {
          // 如果旧节点存在text，则更新elm的文本为空
          nodeOps.setTextContent(elm, '');
        }
      } else if (oldVnode.text !== vnode.text) {
        // 重置elm的文本内容
        nodeOps.setTextContent(elm, vnode.text);
      }
      if (isDef(data)) {
        // 如果后置定义了postpatch钩子，则执行
        // e.g. 
        // 组件更新执行，dirsWithPostpatch缓存了自定义指令的需要更新的指令
        if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
      }
    }

    // 执行插入hook
    function invokeInsertHook (vnode, queue /* 暂存VNode队列 */, initial /* 是否为第一次挂载 */) {
      // 延迟为组件根节点插入钩子，在元素真正插入后调用它们
      if (isTrue(initial) && isDef(vnode.parent)) {
        vnode.parent.data.pendingInsert = queue;
      } else {
        // 如果不为第一次挂载，则遍历queue队列，执行insert方法
        for (var i = 0; i < queue.length; ++i) {
          queue[i].data.hook.insert(queue[i]);
        }
      }
    }

    var hydrationBailed = false;
    // list of modules that can skip create hook during hydration because they
    // are already rendered on the client or has no need for initialization
    // Note: style is excluded because it relies on initial clone for future
    // deep updates (#7063).
    var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

    // 这是一个只支持浏览器的函数，因此我们可以假设elm是DOM节点。
    function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
      var i;
      var tag = vnode.tag;
      var data = vnode.data;
      var children = vnode.children;
      inVPre = inVPre || (data && data.pre);
      vnode.elm = elm;

      if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
        vnode.isAsyncPlaceholder = true;
        return true
      }
      // 断言匹配
      {
        if (!assertNodeMatch(elm, vnode, inVPre)) {
          return false
        }
      }
      if (isDef(data)) {
        if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
        if (isDef(i = vnode.componentInstance)) {
          // 子组件，它应该需要水合自己的节点数
          initComponent(vnode, insertedVnodeQueue);
          return true
        }
      }
      if (isDef(tag)) {
        if (isDef(children)) {
          // empty element, allow client to pick up and populate children
          if (!elm.hasChildNodes()) {
            createChildren(vnode, children, insertedVnodeQueue);
          } else {
            // v-html and domProps: innerHTML
            if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
              if (i !== elm.innerHTML) {
                /* istanbul ignore if */
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('server innerHTML: ', i);
                  console.warn('client innerHTML: ', elm.innerHTML);
                }
                return false
              }
            } else {
              // iterate and compare children lists
              var childrenMatch = true;
              var childNode = elm.firstChild;
              for (var i$1 = 0; i$1 < children.length; i$1++) {
                if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                  childrenMatch = false;
                  break
                }
                childNode = childNode.nextSibling;
              }
              // if childNode is not null, it means the actual childNodes list is
              // longer than the virtual children list.
              if (!childrenMatch || childNode) {
                /* istanbul ignore if */
                if (typeof console !== 'undefined' &&
                  !hydrationBailed
                ) {
                  hydrationBailed = true;
                  console.warn('Parent: ', elm);
                  console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                }
                return false
              }
            }
          }
        }
        if (isDef(data)) {
          var fullInvoke = false;
          for (var key in data) {
            if (!isRenderedModule(key)) {
              fullInvoke = true;
              invokeCreateHooks(vnode, insertedVnodeQueue);
              break
            }
          }
          if (!fullInvoke && data['class']) {
            // ensure collecting deps for deep class bindings for future updates
            traverse(data['class']);
          }
        }
      } else if (elm.data !== vnode.text) {
        elm.data = vnode.text;
      }
      return true
    }

    function assertNodeMatch (node, vnode, inVPre) {
      if (isDef(vnode.tag)) {
        return vnode.tag.indexOf('vue-component') === 0 || (
          !isUnknownElement$$1(vnode, inVPre) &&
          vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
        )
      } else {
        return node.nodeType === (vnode.isComment ? 8 : 3)
      }
    }

    // patch入口是这里
    /* __patch__(
        vm.$el, // 真正的dom
        vnode, // vnode
        hydrating, // 是否为服务端渲染
        false  // removeOnly  ,
        vm.$options._parentElm, // 父节点 空
        vm.$options._refElm // 当前节点 空
      );
    */
    return function patch (oldVnode, vnode, hydrating, removeOnly) {
      // vnode不存在，但是旧节点存在，则直接调用销毁钩子
      if (isUndef(vnode)) {
        if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
        return
      }

      var isInitialPatch = false;
      var insertedVnodeQueue = [];

      if (isUndef(oldVnode)) {
        // 空挂载，创建新的根元素
        isInitialPatch = true;
        createElm(vnode, insertedVnodeQueue);
      } else {
        var isRealElement = isDef(oldVnode.nodeType);
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // 如果oldVnode不是真正的元素节点（为VNode节点），则通过打补丁的方式对比两个VNode
          patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
        } else {
          if (isRealElement) {
            // 挂载真正的元素节点，并检查是否为服务端渲染内容，如果是服务端渲染，则将hydrating标记为true
            if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
              oldVnode.removeAttribute(SSR_ATTR);
              hydrating = true;
            }
            if (isTrue(hydrating)) {
              if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                invokeInsertHook(vnode, insertedVnodeQueue, true);
                return oldVnode
              } else {
                /*
                  客户端呈现的虚拟DOM树与服务器呈现的内容不匹配。
                  这可能是由于不正确的HTML标记造成的，例如在<p>中嵌套块级元素，或者缺少<tbody>。
                */
                warn(
                  'The client-side rendered virtual DOM tree is not matching ' +
                  'server-rendered content. This is likely caused by incorrect ' +
                  'HTML markup, for example nesting block-level elements inside ' +
                  '<p>, or missing <tbody>. Bailing hydration and performing ' +
                  'full client-side render.'
                );
              }
            }
            // 不是服务器渲染，或者水合失败。
            // 创建一个空节点并替换它
            oldVnode = emptyNodeAt(oldVnode);
          }

          // 替换现有元素
          var oldElm = oldVnode.elm;
          var parentElm = nodeOps.parentNode(oldElm);

          // 创建新节点
          createElm(
            vnode,
            insertedVnodeQueue,
            // 极为罕见的 `edge` 案例：如果旧元素处于离开过渡状态，则不要插入。
            // 仅当组合transition + keep-alive + HOCs 时发生。
            oldElm._leaveCb ? null : parentElm,
            nodeOps.nextSibling(oldElm)
          );

          // 递归更新父占位符节点元素 
          if (isDef(vnode.parent)) {
            var ancestor = vnode.parent;
            var patchable = isPatchable(vnode);
            while (ancestor) {
              for (var i = 0; i < cbs.destroy.length; ++i) {
                cbs.destroy[i](ancestor);
              }
              ancestor.elm = vnode.elm;
              if (patchable) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, ancestor);
                }
                // e.g. for directives that uses the "inserted" hook.
                var insert = ancestor.data.hook.insert;
                if (insert.merged) {
                  for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                    insert.fns[i$2]();
                  }
                }
              } else {
                registerRef(ancestor);
              }
              ancestor = ancestor.parent;
            }
          }

          // 销毁旧节点
          if (isDef(parentElm)) {
            removeVnodes(parentElm, [oldVnode], 0, 0);
          } else if (isDef(oldVnode.tag)) {
            invokeDestroyHook(oldVnode);
          }
        }
      }

      invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
      return vnode.elm
    }
  }

  var directives = {
    create: updateDirectives,
    update: updateDirectives,
    destroy: function unbindDirectives (vnode) {
      updateDirectives(vnode, emptyNode);
    }
  };

  // 更新自定义指令
  function updateDirectives (oldVnode, vnode) {
    if (oldVnode.data.directives || vnode.data.directives) {
      _update(oldVnode, vnode);
    }
  }

  // 更新自定义指令
  function _update (oldVnode, vnode) {
    // 是否为创建
    var isCreate = oldVnode === emptyNode;
    // 是否为销毁
    var isDestroy = vnode === emptyNode;
    var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
    var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

    var dirsWithInsert = []; // 保存新指令
    var dirsWithPostpatch = []; // 保存更新指令

    var key, oldDir, dir;
    for (key in newDirs) {
      oldDir = oldDirs[key];
      dir = newDirs[key];
      if (!oldDir) {
        // 新的指令, 触发钩子，bind
        callHook$1(dir, 'bind', vnode, oldVnode);
        if (dir.def && dir.def.inserted /* 被绑定元素插入父节点时调用 */) {
          dirsWithInsert.push(dir);
        }
      } else {
        // 指令已存在, 则update
        dir.oldValue = oldDir.value;
        dir.oldArg = oldDir.arg;
        callHook$1(dir, 'update', vnode, oldVnode);
        if (dir.def && dir.def.componentUpdated) {
          dirsWithPostpatch.push(dir);
        }
      }
    }

    if (dirsWithInsert.length) {
      var callInsert = function () {
        for (var i = 0; i < dirsWithInsert.length; i++) {
          callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
        }
      };
      if (isCreate) {
        // 第一次创建节点时调用
        mergeVNodeHook(vnode, 'insert', callInsert);
      } else {
        // 更新节点时调用
        callInsert();
      }
    }

    if (dirsWithPostpatch.length) {
      // 添加后置hook，在后置postpatch时执行
      mergeVNodeHook(vnode, 'postpatch', function () {
        for (var i = 0; i < dirsWithPostpatch.length; i++) {
          callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
        }
      });
    }

    if (!isCreate) {
      for (key in oldDirs) {
        if (!newDirs[key]) {
          // 不再存在，解除绑定 
          // unbind: 只调用一次，指令与元素解绑时调用。
          callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
        }
      }
    }
  }

  var emptyModifiers = Object.create(null);

  // 格式化自定义指令
  function normalizeDirectives$1 (dirs, vm) {
    var res = Object.create(null);
    if (!dirs) {
      return res
    }
    var i, dir;
    for (i = 0; i < dirs.length; i++) {
      dir = dirs[i];
      if (!dir.modifiers) {
        // 修饰词
        dir.modifiers = emptyModifiers;
      }
      res[getRawDirName(dir)] = dir;
      dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
    }
    return res
  }

  // 获取原始的自定义指令名称 e.g. v-foces
  function getRawDirName (dir) {
    return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
  }

  // 触发钩子函数 e.g. unbind
  function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
    var fn = dir.def && dir.def[hook];
    if (fn) {
      try {
        fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
      } catch (e) {
        handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
      }
    }
  }

  var baseModules = [
    ref,
    directives
  ];
  
  // 更新attrs属性（在patchVNode时执行）
  function updateAttrs (oldVnode, vnode) {
    // componentOptions => 组件的options
    // 在createComponent时创建
    var opts = vnode.componentOptions;
    // 如果vnode为组件，且组件的options.inheritAttrs为false，终止函数
    /*
      e.g:
      <container id="app"></container>

      Vue.component("container", {
        inheritAttrs: false,
        template: `<div></div>`
      });
      前提：子组件的props中未注册父组件传递过来的属性
      inheritAttrs为true时，页面将渲染：<div id="app"></div>;
      inheritAttrs为false时，页面将渲染：<div></div>;
    */
    if (isDef(opts) && opts.Ctor.options.inheritAttrs /* 继承属性 */ === false) {
      return
    }

    // 如果旧vnode和新vnode都没有attrs属性，则终止函数
    if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
      return
    }

    var key, cur, old;
    var elm = vnode.elm;
    var oldAttrs = oldVnode.data.attrs || {};
    var attrs = vnode.data.attrs || {};
    // 如果attrs属性为观察者对象，则需要克隆一下，因为用户可能会改变它
    if (isDef(attrs.__ob__)) {
      attrs = vnode.data.attrs = extend({}, attrs);
    }

    // 循环新attrs属性，如果在旧attrs中没有，则新增
    for (key in attrs) {
      cur = attrs[key];
      old = oldAttrs[key];
      if (old !== cur) {
        setAttr(elm, key, cur);
      }
    }
    // 在IE9中，设置type可以重置input[type=radio]的value
    // IE/Edge强制进度值降到1，然后再设置最大值
    if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
      setAttr(elm, 'value', attrs.value);
    }

    // 循环旧attrs属性，如果新attrs中不存在，则移除
    for (key in oldAttrs) {
      if (isUndef(attrs[key])) {
        if (isXlink(key)) {
          elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
        } else if (!isEnumeratedAttr(key)) {
          elm.removeAttribute(key);
        }
      }
    }
  }

  // 设置attr
  function setAttr (el, key, value) {
    if (el.tagName.indexOf('-') > -1) {
      baseSetAttr(el, key, value);
    } else if (isBooleanAttr(key)) {
      // 如果为空值，则移除该属性
      // e.g. <option disabled>Select one</option>
      if (isFalsyAttrValue(value)) {
        el.removeAttribute(key);
      } else {
        // allowfullscreen用于设置iframe中的信息是否允许开启全屏状态
        // 从技术上讲，allowfullscreen是<iframe>的一个布尔属性，
        // 但是Flash在<embed>标记上使用时需要一个“true”值
        value = key === 'allowfullscreen' && el.tagName === 'EMBED'
          ? 'true'
          : key;
        el.setAttribute(key, value);
      }
    } else if (isEnumeratedAttr(key)) {
      el.setAttribute(key, convertEnumeratedValue(key, value));
    } else if (isXlink(key)) {
      if (isFalsyAttrValue(value)) {
        el.removeAttributeNS(xlinkNS, getXlinkProp(key));
      } else {
        el.setAttributeNS(xlinkNS, key, value);
      }
    } else {
      baseSetAttr(el, key, value);
    }
  }

  /**
   * 设置属性，并且判断是否是ie浏览器
   * 如果是并且不是ie9的时候更新input事件
   */
  function baseSetAttr (el, key, value) {
    if (isFalsyAttrValue(value)) { // 判断value是否是 null或者false
      el.removeAttribute(key); // 从dom中删除属性
    } else {
      // IE10和11在设置占位符时触发输入事件
      // 阻塞第一个输入事件并删除该阻塞程序
      if (
        isIE && !isIE9 &&
        el.tagName === 'TEXTAREA' &&
        key === 'placeholder' && value !== '' && !el.__ieph
      ) {
        var blocker = function (e) {
          // 不仅阻止事件继续分发到其他document,还会将事件分发就地停止，
          // 在当前事件之后注册的其他事件，都不会执行
          e.stopImmediatePropagation();
          el.removeEventListener('input', blocker);
        };
        el.addEventListener('input', blocker);
        // 标志已经添加过 或者更新过input事件
        el.__ieph = true;
      }
      el.setAttribute(key, value);
    }
  }

  var attrs = {
    create: updateAttrs,
    update: updateAttrs
  };

  // 更新class
  function updateClass (oldVnode, vnode) {
    var el = vnode.elm;
    var data = vnode.data;
    var oldData = oldVnode.data;

    // 新vnode和旧vnode都没定义有class，则终止函数
    if (
      isUndef(data.staticClass) &&
      isUndef(data.class) && (
        isUndef(oldData) || (
          isUndef(oldData.staticClass) &&
          isUndef(oldData.class)
        )
      )
    ) {
      return
    }

    var cls = genClassForVnode(vnode);

    // 处理transition组件的classes
    var transitionClass = el._transitionClasses;
    if (isDef(transitionClass)) {
      cls = concat(cls, stringifyClass(transitionClass));
    }

    // 设置class
    if (cls !== el._prevClass) {
      el.setAttribute('class', cls);
      el._prevClass = cls;
    }
  }

  var klass = {
    create: updateClass,
    update: updateClass
  };

  var validDivisionCharRE = /[\w).+\-_$\]]/;

  /**
   * 处理filters
   */
  function parseFilters (exp) {
    var inSingle = false;
    var inDouble = false;
    var inTemplateString = false;
    var inRegex = false;
    var curly = 0;
    var square = 0;
    var paren = 0;
    var lastFilterIndex = 0;
    var c, prev, i, expression, filters;

    for (i = 0; i < exp.length; i++) {
      prev = c;
      c = exp.charCodeAt(i);
      if (inSingle) {
        if (c === 0x27 && prev !== 0x5C) { inSingle = false; }
      } else if (inDouble) {
        if (c === 0x22 && prev !== 0x5C) { inDouble = false; }
      } else if (inTemplateString) {
        if (c === 0x60 && prev !== 0x5C) { inTemplateString = false; }
      } else if (inRegex) {
        if (c === 0x2f && prev !== 0x5C) { inRegex = false; }
      } else if (
        c === 0x7C && // pipe
        exp.charCodeAt(i + 1) !== 0x7C &&
        exp.charCodeAt(i - 1) !== 0x7C &&
        !curly && !square && !paren
      ) {
        if (expression === undefined) {
          // first filter, end of expression
          lastFilterIndex = i + 1;
          expression = exp.slice(0, i).trim();
        } else {
          pushFilter();
        }
      } else {
        switch (c) {
          case 0x22: inDouble = true; break         // "
          case 0x27: inSingle = true; break         // '
          case 0x60: inTemplateString = true; break // `
          case 0x28: paren++; break                 // (
          case 0x29: paren--; break                 // )
          case 0x5B: square++; break                // [
          case 0x5D: square--; break                // ]
          case 0x7B: curly++; break                 // {
          case 0x7D: curly--; break                 // }
        }
        if (c === 0x2f) { // /
          var j = i - 1;
          var p = (void 0);
          // find first non-whitespace prev char
          for (; j >= 0; j--) {
            p = exp.charAt(j);
            if (p !== ' ') { break }
          }
          if (!p || !validDivisionCharRE.test(p)) {
            inRegex = true;
          }
        }
      }
    }

    if (expression === undefined) {
      expression = exp.slice(0, i).trim();
    } else if (lastFilterIndex !== 0) {
      pushFilter();
    }

    function pushFilter () {
      (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim());
      lastFilterIndex = i + 1;
    }

    if (filters) {
      for (i = 0; i < filters.length; i++) {
        expression = wrapFilter(expression, filters[i]);
      }
    }

    return expression
  }

  function wrapFilter (exp, filter) {
    var i = filter.indexOf('(');
    if (i < 0) {
      // _f: resolveFilter
      return ("_f(\"" + filter + "\")(" + exp + ")")
    } else {
      var name = filter.slice(0, i);
      var args = filter.slice(i + 1);
      return ("_f(\"" + name + "\")(" + exp + (args !== ')' ? ',' + args : args))
    }
  }

  /************************************************************/

  /**
   * 基本的警告
   */
  function baseWarn (msg, range) {
    console.error(("[Vue compiler]: " + msg));
  }
  
  // 获取模块功能数组，并移除空的数据
  function pluckModuleFunction (modules, key) {
    return modules
      ? modules.map(function (m) { return m[key]; }).filter(function (_) { return _; })
      : []
  }

  // 添加prop e.g. v-text
  function addProp (el, name, value, range, dynamic) {
    (el.props || (el.props = [])).push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
    // plain 标注该元素是否为普通对象
    el.plain = false;
  }

  // 添加attr e.g. id="app"
  function addAttr (el, name, value, range, dynamic) {
    var attrs = dynamic
      ? (el.dynamicAttrs || (el.dynamicAttrs = []))
      : (el.attrs || (el.attrs = []));
    attrs.push(rangeSetItem({ name: name, value: value, dynamic: dynamic }, range));
    el.plain = false;
  }

  // 添加原生属性 e.g <input :type="type" v-model="counter">
  function addRawAttr (el, name, value, range) {
    el.attrsMap[name] = value;
    el.attrsList.push(rangeSetItem({ name: name, value: value }, range));
  }

  // 添加指令对象
  function addDirective (el, name, rawName, value, arg, isDynamicArg, modifiers, range) {
    (el.directives || (el.directives = [])).push(rangeSetItem({
      name: name,
      rawName: rawName,
      value: value,
      arg: arg,
      isDynamicArg: isDynamicArg,
      modifiers: modifiers
    }, range));
    el.plain = false;
  }

  // 前置修改器标记
  function prependModifierMarker (symbol, name, dynamic) {
    return dynamic
      // e.g. 
      // 输入：<div v-on:[eventType].capture="handler"></div>
      // 输出：_p(event, '!')
      // 在执行助手函数时，如果eventType为string类型，则将其转换成 `!click`
      ? ("_p(" + name + ",\"" + symbol + "\")")
      // e.g. 
      // 输入： <div @click.capture="handler"></div>
      // 输出：`!click`
      : symbol + name // 将事件标记为captured
  }

  // 为el添加原生事件
  function addHandler (el, name, value, modifiers, important, warn, range, dynamic) {
    modifiers = modifiers || emptyObject;
    if (
      warn &&
      modifiers.prevent && modifiers.passive
    ) {
      // .prevent 和 .passive修饰词不能一起使用
      warn(
        'passive and prevent can\'t be used together. ' +
        'Passive handler can\'t prevent default event.',
        range
      );
    }

    // 格式化鼠标右键和中键
    if (modifiers.right) {
      if (dynamic) {
        name = "(" + name + ")==='click'?'contextmenu':(" + name + ")";
      } else if (name === 'click') {
        name = 'contextmenu';
        delete modifiers.right;
      }
    } else if (modifiers.middle) {
      if (dynamic) {
        name = "(" + name + ")==='click'?'mouseup':(" + name + ")";
      } else if (name === 'click') {
        name = 'mouseup';
      }
    }

    // .capture
    if (modifiers.capture) {
      delete modifiers.capture;
      name = prependModifierMarker('!', name, dynamic);
    }
    // .once
    if (modifiers.once) {
      delete modifiers.once;
      name = prependModifierMarker('~', name, dynamic);
    }
    // .passive
    if (modifiers.passive) {
      delete modifiers.passive;
      name = prependModifierMarker('&', name, dynamic);
    }

    var events;
    // .native
    if (modifiers.native) {
      delete modifiers.native;
      events = el.nativeEvents || (el.nativeEvents = {});
    } else {
      events = el.events || (el.events = {});
    }

    var newHandler = rangeSetItem({ value: value.trim(), dynamic: dynamic }, range);
    if (modifiers !== emptyObject) {
      newHandler.modifiers = modifiers;
    }

    var handlers = events[name];
    if (Array.isArray(handlers)) {
      important ? handlers.unshift(newHandler) : handlers.push(newHandler);
    } else if (handlers) {
      events[name] = important ? [newHandler, handlers] : [handlers, newHandler];
    } else {
      events[name] = newHandler;
    }

    el.plain = false;
  }

  // 获取原始绑定的attr
  function getRawBindingAttr (el, name) {
    return el.rawAttrsMap[':' + name] ||
      el.rawAttrsMap['v-bind:' + name] ||
      el.rawAttrsMap[name]
  }

  // 获取v-bind绑定的attr
  function getBindingAttr (el, name, getStatic) {
    var dynamicValue =
      getAndRemoveAttr(el, ':' + name) ||
      getAndRemoveAttr(el, 'v-bind:' + name);
    if (dynamicValue != null) {
      return parseFilters(dynamicValue)
    } else if (getStatic !== false) {
      var staticValue = getAndRemoveAttr(el, name);
      if (staticValue != null) {
        return JSON.stringify(staticValue)
      }
    }
  }

  // 获取并移除attr
  function getAndRemoveAttr (el, name, removeFromMap) {
    var val;
    if ((val = el.attrsMap[name]) != null) {
      var list = el.attrsList;
      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i].name === name) {
          list.splice(i, 1);
          break
        }
      }
    }
    if (removeFromMap) {
      delete el.attrsMap[name];
    }
    return val
  }

  // 根据正则匹配获取并移除attr
  function getAndRemoveAttrByRegex (el, name) {
    var list = el.attrsList;
    for (var i = 0, l = list.length; i < l; i++) {
      var attr = list[i];
      if (name.test(attr.name)) {
        list.splice(i, 1);
        return attr
      }
    }
  }

  // 设置prop属性的区间
  // e.g. 
  // <div v-text="name"></div>
  // return { start: 5, end: 18 }
  function rangeSetItem (item, range) {
    if (range) {
      if (range.start != null) {
        item.start = range.start;
      }
      if (range.end != null) {
        item.end = range.end;
      }
    }
    return item
  }

  /**
   * 生成组件的v-model
   */
  function genComponentModel (el, value, modifiers) {
    var ref = modifiers || {};
    var number = ref.number;
    var trim = ref.trim;

    var baseValueExpression = '$$v';
    var valueExpression = baseValueExpression;
    if (trim) {
      valueExpression =
        "(typeof " + baseValueExpression + " === 'string'" +
        "? " + baseValueExpression + ".trim()" +
        ": " + baseValueExpression + ")";
    }
    if (number) {
      valueExpression = "_n(" + valueExpression + ")";
    }
    var assignment = genAssignmentCode(value, valueExpression);

    el.model = {
      value: ("(" + value + ")"),
      expression: JSON.stringify(value),
      callback: ("function (" + baseValueExpression + ") {" + assignment + "}")
    };
  }

  /**
   * 生成v-model的code代码
   */
  function genAssignmentCode (value, assignment) {
    var res = parseModel(value);
    if (res.key === null) {
      return (value + "=" + assignment)
    } else {
      // v-model绑定深层属性
      // e.g. <input type="text" v-model.number="age['counter']">
      // return '$set(age, 'counter', _n($event.target.value))'
      return ("$set(" + (res.exp) + ", " + (res.key) + ", " + assignment + ")")
    }
  }

  /**
   * 将v-model表达式解析为基路径和最后一个键段。
   * 处理点路径和可能的方括号。
   *
   * v-model深度属性
   * e.g.
   *
   * - test
   * - test[key]
   * - test[test1[key]]
   * - test["a"][key]
   * - xxx.test[a[a].test1[key]]
   * - test.xxx.a["asa"][test1[key]]
   *
   */

  var len, str, chr, index$1, expressionPos, expressionEndPos;

  // 解析v-model
  function parseModel (val) {
    val = val.trim();
    len = val.length;

    // e.g. v-model="age.counter"
    if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
      index$1 = val.lastIndexOf('.');
      if (index$1 > -1) {
        return {
          exp: val.slice(0, index$1), // age
          key: '"' + val.slice(index$1 + 1) + '"' // counter
        }
      } else {
        return {
          exp: val, // age
          key: null
        }
      }
    }

    str = val;
    index$1 /* 遍历字符串开始索引 */ = expressionPos /* 表达式开始索引 */ = expressionEndPos /* 表达式结束索引 */ = 0;

    // e.g. v-model="age['counter']"
    while (!eof()) {
      chr = next();
      if (isStringStart(chr)) {
        parseString(chr);
      } else if (chr === 0x5B /* 转为十进制：91 转为中文：[ */) {
        parseBracket(chr);
      }
    }

    return {
      exp: val.slice(0, expressionPos), // age
      key: val.slice(expressionPos + 1, expressionEndPos) // 'counter'
    }
  }

  // 返回str字符串的下一个字符的unicode编码
  function next () {
    return str.charCodeAt(++index$1)
  }

  // 判断字符串开始索引是否大于等于字符串长度，如果判断成立，则终止循环
  function eof () {
    return index$1 >= len
  }

  /*
   * 判断chr是否是  "  或者  '  开头
   */
  function isStringStart (chr) {
    // 0x22	= "  0x27 = '
    return chr === 0x22 || chr === 0x27
  }

  // 解析中括号 `[]`里面的字符串
  function parseBracket (chr) {
    var inBracket = 1;
    expressionPos = index$1;
    while (!eof()) {
      chr = next();
      if (isStringStart(chr)) {
        parseString(chr); // chr === ' || chr === "
        continue
      }
      // e.g. age[['counter']]
      if (chr === 0x5B) { inBracket++; }
      if (chr === 0x5D /* 转成中文 ] */) { inBracket--; }
      if (inBracket === 0) {
        expressionEndPos = index$1;
        break
      }
    }
  }

  // 解析字符串
  function parseString (chr) {
    var stringQuote = chr;
    while (!eof()) {
      chr = next();
      if (chr === stringQuote) {
        break
      }
    }
  }

  var warn$1;

  // 在某些情况下，使用的事件必须在运行时确定
  // 所以我们在编译过程中使用了一些保留标记。
  var RANGE_TOKEN = '__r';
  var CHECKBOX_RADIO_TOKEN = '__c';

  // 处理v-model指令绑定的标签
  // e.g. <input type="text" v-model.number="counter">
  function model (el, dir, _warn) {
    warn$1 = _warn;
    var value = dir.value; // counter
    var modifiers = dir.modifiers; // { number: true }
    var tag = el.tag; // input
    var type = el.attrsMap.type; // text

    {
      // v-model如果绑定的标签是input，且type为`file`类型
      // 发出警告：v-model是只读的
      if (tag === 'input' && type === 'file') {
        warn$1(
          "<" + (el.tag) + " v-model=\"" + value + "\" type=\"file\">:\n" +
          "File inputs are read only. Use a v-on:change listener instead.",
          el.rawAttrsMap['v-model']
        );
      }
    }

    if (el.component) {
      genComponentModel(el, value, modifiers);
      // 组件v-model不需要额外的运行时
      return false
    } else if (tag === 'select') {
      genSelect(el, value, modifiers);
    } else if (tag === 'input' && type === 'checkbox') {
      genCheckboxModel(el, value, modifiers);
    } else if (tag === 'input' && type === 'radio') {
      genRadioModel(el, value, modifiers);
    } else if (tag === 'input' || tag === 'textarea') {
      genDefaultModel(el, value, modifiers);
    } else if (!config.isReservedTag(tag)) {
      genComponentModel(el, value, modifiers);
      // 组件v-model不需要额外的运行时
      return false
    } else {
      warn$1(
        "<" + (el.tag) + " v-model=\"" + value + "\">: " +
        "v-model is not supported on this element type. " +
        'If you are working with contenteditable, it\'s recommended to ' +
        'wrap a library dedicated for that purpose inside a custom component.',
        el.rawAttrsMap['v-model']
      );
    }

    // 默认返回true
    return true
  }

  // 生成checkbox类型的v-model
  function genCheckboxModel (el, value, modifiers) {
    var number = modifiers && modifiers.number;
    var valueBinding = getBindingAttr(el, 'value') || 'null';
    var trueValueBinding = getBindingAttr(el, 'true-value') || 'true';
    var falseValueBinding = getBindingAttr(el, 'false-value') || 'false';
    addProp(el, 'checked',
      "Array.isArray(" + value + ")" +
      "?_i(" + value + "," + valueBinding + ")>-1" + (
        trueValueBinding === 'true'
          ? (":(" + value + ")")
          : (":_q(" + value + "," + trueValueBinding + ")")
      )
    );
    /*
      e.g.
      <input type="checkbox" v-model="flag">
      =>
      var $$a = flag,
        $$el = $event.target,
        $$c = $$el.checked ? (true) : (false);
      if (Array.isArray($$a)) {
        var $$v = null,
          $$i = _i($$a, $$v);
        if ($$el.checked) {
          $$i < 0 && (flag = $$a.concat([$$v]))
        } else {
          $$i > -1 && (flag = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
        }
      } else {
        flag = $$c
      }
    */
    addHandler(el, 'change',
      "var $$a=" + value + "," +
          '$$el=$event.target,' +
          "$$c=$$el.checked?(" + trueValueBinding + "):(" + falseValueBinding + ");" +
      'if(Array.isArray($$a)){' +
        "var $$v=" + (number ? '_n(' + valueBinding + ')' : valueBinding) + "," +
            '$$i=_i($$a,$$v);' +
        "if($$el.checked){$$i<0&&(" + (genAssignmentCode(value, '$$a.concat([$$v])')) + ")}" +
        "else{$$i>-1&&(" + (genAssignmentCode(value, '$$a.slice(0,$$i).concat($$a.slice($$i+1))')) + ")}" +
      "}else{" + (genAssignmentCode(value, '$$c')) + "}",
      null, true
    );
  }

  // 生成radio类型的v-model
  function genRadioModel (el, value, modifiers) {
    var number = modifiers && modifiers.number;
    var valueBinding = getBindingAttr(el, 'value') || 'null';
    valueBinding = number ? ("_n(" + valueBinding + ")") : valueBinding;
    addProp(el, 'checked', ("_q(" + value + "," + valueBinding + ")"));
    addHandler(el, 'change', genAssignmentCode(value, valueBinding), null, true);
  }

  // 生成select类型的v-model
  function genSelect (el, value, modifiers) {
    var number = modifiers && modifiers.number;
    var selectedVal = "Array.prototype.filter" +
      ".call($event.target.options,function(o){return o.selected})" +
      ".map(function(o){var val = \"_value\" in o ? o._value : o.value;" +
      "return " + (number ? '_n(val)' : 'val') + "})";

    var assignment = '$event.target.multiple ? $$selectedVal : $$selectedVal[0]';
    var code = "var $$selectedVal = " + selectedVal + ";";
    code = code + " " + (genAssignmentCode(value, assignment));
    addHandler(el, 'change', code, null, true);
  }

  /**
   * gen => generator生成器
   * 生成v-model
   */
  function genDefaultModel (el, value, modifiers) {
    var type = el.attrsMap.type;

    {
      var value$1 = el.attrsMap['v-bind:value'] || el.attrsMap[':value'];
      var typeBinding = el.attrsMap['v-bind:type'] || el.attrsMap[':type'];
      if (value$1 && !typeBinding) {
        var binding = el.attrsMap['v-bind:value'] ? 'v-bind:value' : ':value';
        warn$1(
          binding + "=\"" + value$1 + "\" conflicts with v-model on the same element " +
          'because the latter already expands to a value binding internally',
          el.rawAttrsMap[binding]
        );
      }
    }

    var ref = modifiers || {};
    var lazy = ref.lazy; // 在“change”时而非“input”时更新
    var number = ref.number;
    var trim = ref.trim;
    // 是否需要添加composing拦截，即触发compositionStart事件时
    var needCompositionGuard = !lazy && type !== 'range';
    var event = lazy
      ? 'change'
      : type === 'range'
        ? RANGE_TOKEN
        : 'input';

    var valueExpression = '$event.target.value';
    if (trim) { // 去掉首尾空格
      valueExpression = "$event.target.value.trim()";
    }
    if (number) { // 将值自动转换为number类型
      valueExpression = "_n(" + valueExpression + ")";
    }

    var code = genAssignmentCode(value, valueExpression);
    if (needCompositionGuard) {
      code = "if($event.target.composing)return;" + code;
    }

    addProp(el, 'value', ("(" + value + ")"));
    // 添加事件
    addHandler(el, event, code, null, true);
    if (trim || number) {
      // 添加blur事件，执行$forceUpdate方法
      addHandler(el, 'blur', '$forceUpdate()');
    }
  }

  // 规范化只能在运行时确定的v-model事件标记。
  // 将事件作为数组中的第一个事件放置是很重要的，
  // 以确保在用户附加的处理程序之前调用v-model回调。
  function normalizeEvents (on) {
    // type="range" 为滑动条
    if (isDef(on[RANGE_TOKEN])) {
      // 在IE中 input[type=range] 只支持 `change` 事件
      var event = isIE ? 'change' : 'input';
      on[event] = [].concat(on[RANGE_TOKEN], on[event] || []);
      delete on[RANGE_TOKEN];
    }
    // 这原本是为了修复#4521，但在2.5之后就不再需要了。保持它与<2.4中生成的代码向后兼容
    if (isDef(on[CHECKBOX_RADIO_TOKEN])) {
      on.change = [].concat(on[CHECKBOX_RADIO_TOKEN], on.change || []);
      delete on[CHECKBOX_RADIO_TOKEN];
    }
  }

  var target$1;

  // 创建.once修饰的事件
  function createOnceHandler$1 (event, handler, capture) {
    var _target = target$1; // 在闭包中保存当前目标元素
    return function onceHandler () {
      var res = handler.apply(null, arguments);
      if (res !== null) {
        remove$2(event, onceHandler, capture, _target);
      }
    }
  }

  // Firefox<=53（特别是ESR 52）具有不正确的事件.时间戳实现，
  // 并且不会在事件传播之间触发微任务，因此可以安全地排除。
  // 使用微任务修复程序
  var useMicrotaskFix = isUsingMicroTask && !(isFF && Number(isFF[1]) <= 53);

  // 添加事件
  function add$1 (name, handler, capture, passive) {
    // 内部click事件触发修补程序，修补期间事件处理程序附加到外部元素，然后再次触发。
    // 这是因为浏览器在事件传播之间触发微任务标记。
    // 解决方案很简单：我们在附加处理程序时保存时间戳，
    // 并且处理程序只有在传递给它的事件在附加之后被触发时才会触发。
    if (useMicrotaskFix) {
      var attachedTimestamp = currentFlushTimestamp;
      var original = handler;
      handler = original._wrapper = function (e) {
        if (
          // 这个只是个安全网以防万一事件.时间戳在某些奇怪的环境中是不可靠的。。。
          e.target === e.currentTarget ||
          // 事件在处理程序附加后激发
          e.timeStamp >= attachedTimestamp ||
          // 在一些小环境中，时间戳可能会不一样
          // iOS 9 bug: 时间戳在history.pushState后，为0
          // QtWebEngine事件，时间戳是负值
          e.timeStamp <= 0 ||
          // 如果事件在多页文档中的另一个文档中激发，将使用不同的起始引用
          e.target.ownerDocument !== document
        ) {
          return original.apply(this, arguments)
        }
      };
    }
    target$1.addEventListener(
      name,
      handler,

      supportsPassive
        ? { capture: capture, passive: passive /* 阻止默认事件 */}
        : capture // 是否为捕获
    );
  }

  // 移除事件
  function remove$2 (name, handler, capture, _target) {
    (_target || target$1).removeEventListener(
      name,
      handler._wrapper || handler,
      capture
    );
  }

  // 更新DOM的监听事件
  function updateDOMListeners (oldVnode, vnode) {
    if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
      return
    }
    var on = vnode.data.on || {};
    var oldOn = oldVnode.data.on || {};
    target$1 = vnode.elm;
    normalizeEvents(on);
    updateListeners(on, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
    target$1 = undefined;
  }

  var events = {
    create: updateDOMListeners,
    update: updateDOMListeners
  };

  var svgContainer;

  // 更新DOM的props
  function updateDOMProps (oldVnode, vnode) {
    if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
      return
    }
    var key, cur;
    var elm = vnode.elm;
    var oldProps = oldVnode.data.domProps || {};
    var props = vnode.data.domProps || {};

    // 如果domProps属性为观察者对象，则需要克隆一下，因为用户可能会改变它
    if (isDef(props.__ob__)) {
      props = vnode.data.domProps = extend({}, props);
    }

    // 循环旧domProps，如果新domProps中没有，则移除
    for (key in oldProps) {
      if (!(key in props)) {
        elm[key] = '';
      }
    }

    for (key in props) {
      cur = props[key];
      // 如果节点具有textContent或innerHTML，则忽略子节点，
      // 因为这些子节点将丢弃现有的DOM节点，并在后续修补程序上导致删除错误
      // e.g: v-html | v-text
      if (key === 'textContent' || key === 'innerHTML') {
        if (vnode.children) { vnode.children.length = 0; }
        if (cur === oldProps[key]) { continue }
        // 如果childNodes的长度为1，则移除
        if (elm.childNodes.length === 1) {
          elm.removeChild(elm.childNodes[0]);
        }
      }

      if (key === 'value' && elm.tagName !== 'PROGRESS') {
        // 将value存储为_value
        // 因为非字符串值将被字符串化
        elm._value = cur;
        // 避免在值相同时重置光标位置
        var strCur = isUndef(cur) ? '' : String(cur);
        if (shouldUpdateValue(elm, strCur)) {
          elm.value = strCur;
        }
      } else if (key === 'innerHTML' && isSVG(elm.tagName) && isUndef(elm.innerHTML)) {
        // IE不支持SVG元素的innerHTML
        svgContainer = svgContainer || document.createElement('div');
        svgContainer.innerHTML = "<svg>" + cur + "</svg>";
        var svg = svgContainer.firstChild;
        while (elm.firstChild) {
          elm.removeChild(elm.firstChild);
        }
        while (svg.firstChild) {
          elm.appendChild(svg.firstChild);
        }
      } else if (
        // 如果新旧VDOM状态相同，则跳过更新。
        // `value` 单独处理
        cur !== oldProps[key]
      ) {
        // 某些属性更新可能会引发错误
        // e.g: `value` 在<progress>标签中为非有限的
        try {
          elm[key] = cur;
        } catch (e) {}
      }
    }
  }

  // 是否应该更新值
  function shouldUpdateValue (elm, checkVal) {
    // 输入框开始输入时composing为true，结束时为false，结束时，判断是否需要更新值
    return (!elm.composing && (
      elm.tagName === 'OPTION' ||
      isNotInFocusAndDirty(elm, checkVal) ||
      isDirtyWithModifiers(elm, checkVal)
    ))
  }

  // 是否是失去焦点且不干净的（前后值不一样即为肮脏的）
  function isNotInFocusAndDirty (elm, checkVal) {
    // 当textbox（.number和.trim）失去焦点且其值不等于更新的值时返回true
    var notInFocus = true;
    try { notInFocus = document.activeElement !== elm; } catch (e) {}
    return notInFocus && elm.value !== checkVal
  }

  // 具有修饰符number或trim时，是否是不干净的
  function isDirtyWithModifiers (elm, newVal) {
    var value = elm.value;
    var modifiers = elm._vModifiers;
    if (isDef(modifiers)) {
      // 通过Number包装类判断后，不相等，则返回true
      if (modifiers.number) {
        return toNumber(value) !== toNumber(newVal)
      }
      // 如果去掉空格后不一致，则返回true
      if (modifiers.trim) {
        return value.trim() !== newVal.trim()
      }
    }
    return value !== newVal
  }

  var domProps = {
    create: updateDOMProps,
    update: updateDOMProps
  };

  // 处理字符串类型的style，返回一个对象
  var parseStyleText = cached(function (cssText) {
    var res = {};
    var listDelimiter = /;(?![^(]*\))/g;
    var propertyDelimiter = /:(.+)/;
    // 以;分割样式
    cssText.split(listDelimiter).forEach(function (item) {
      if (item) {
        // 以:分割样式名和样式值
        var tmp = item.split(propertyDelimiter);
        tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
      }
    });
    return res
  });

  // 合并静态和动态样式
  function normalizeStyleData (data) {
    var style = normalizeStyleBinding(data.style);
    // 而且总是一个新的对象，所以它是安全的合并到它
    return data.staticStyle
      ? extend(data.staticStyle, style)
      : style
  }

  // 格式化style
  // 将可能的数组/字符串值规范化为对象
  function normalizeStyleBinding (bindingStyle) {
    if (Array.isArray(bindingStyle)) {
      return toObject(bindingStyle)
    }
    if (typeof bindingStyle === 'string') {
      return parseStyleText(bindingStyle)
    }
    return bindingStyle
  }

  /**
   * 获取vnode样式
   * 父组件样式应该在子组件样式之后，以便父组件的样式可以覆盖它
   */
  function getStyle (vnode, checkChild) {
    var res = {};
    var styleData;

    if (checkChild) {
      var childNode = vnode;
      while (childNode.componentInstance) {
        childNode = childNode.componentInstance._vnode;
        if (
          childNode && childNode.data &&
          (styleData = normalizeStyleData(childNode.data))
        ) {
          extend(res, styleData);
        }
      }
    }

    if ((styleData = normalizeStyleData(vnode.data))) {
      extend(res, styleData);
    }

    var parentNode = vnode;
    while ((parentNode = parentNode.parent)) {
      if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
        extend(res, styleData);
      }
    }
    return res
  }

  /************************************************************/

  var cssVarRE = /^--/;
  var importantRE = /\s*!important$/;
  var setProp = function (el, name, val) {
    if (cssVarRE.test(name)) {
      el.style.setProperty(name, val);
    } else if (importantRE.test(val)) {
      // 将小驼峰转成中划线命名
      el.style.setProperty(hyphenate(name), val.replace(importantRE, ''), 'important');
    } else {
      var normalizedName = normalize(name);
      if (Array.isArray(val)) {
        // 支持autoprefixer创建的值数组, e.g.
        // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
        // 一个接一个地设置它们，浏览器将只设置它可以识别的那些
        for (var i = 0, len = val.length; i < len; i++) {
          el.style[normalizedName] = val[i];
        }
      } else {
        el.style[normalizedName] = val;
      }
    }
  };

  var vendorNames = ['Webkit', 'Moz', 'ms'];

  var emptyStyle;
  var normalize = cached(function (prop) {
    emptyStyle = emptyStyle || document.createElement('div').style;
    // 将中划线命名转成小驼峰命名
    prop = camelize(prop);
    if (prop !== 'filter' && (prop in emptyStyle)) {
      return prop
    }
    // e.g: transition => Transition
    var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
    // e.g: WebkitTransition
    for (var i = 0; i < vendorNames.length; i++) {
      var name = vendorNames[i] + capName;
      if (name in emptyStyle) {
        return name
      }
    }
  });

  // 更新style
  function updateStyle (oldVnode, vnode) {
    var data = vnode.data;
    var oldData = oldVnode.data;

    // 如果静态绑定和动态绑定的style都不存在，则终止函数
    if (isUndef(data.staticStyle) && isUndef(data.style) &&
      isUndef(oldData.staticStyle) && isUndef(oldData.style)
    ) {
      return
    }

    var cur, name;
    var el = vnode.elm;
    var oldStaticStyle = oldData.staticStyle;
    var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

    // 如果存在静态样式，则在执行normalizeStyleData时，已经将style合并到其中
    var oldStyle = oldStaticStyle || oldStyleBinding;

    // 新vnode的style
    var style = normalizeStyleBinding(vnode.data.style) || {};

    // 为下一个diff
    // 将normalizedStyle存储在vnode的data上
    // 如果它是观察者对象，请确保克隆它，因为用户可能会改变它。
    vnode.data.normalizedStyle = isDef(style.__ob__)
      ? extend({}, style)
      : style;

    var newStyle = getStyle(vnode, true);

    for (name in oldStyle) {
      // 遍历旧样式，如果新样式没有，则移除
      if (isUndef(newStyle[name])) {
        setProp(el, name, '');
      }
    }
    for (name in newStyle) {
      cur = newStyle[name];
      if (cur !== oldStyle[name]) {
        // ie9设置为null无效，必须使用空字符串
        setProp(el, name, cur == null ? '' : cur);
      }
    }
  }

  var style = {
    create: updateStyle,
    update: updateStyle
  };

  // 匹配空格
  var whitespaceRE = /\s+/;

  /**
   * 为el添加class
   */
  function addClass (el, cls) {
    if (!cls || !(cls = cls.trim())) {
      return
    }

    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        // 如果cls为多个类名，则需要循环添加每一项类名
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
      } else {
        el.classList.add(cls);
      }
    } else {
      // 如果没有classList属性，则通过setAttribute来设置class
      var cur = " " + (el.getAttribute('class') || '') + " ";
      if (cur.indexOf(' ' + cls + ' ') < 0) {
        el.setAttribute('class', (cur + cls).trim());
      }
    }
  }

  /**
   * 移除el的class
   * @param {String} cls 类名
   */
  function removeClass (el, cls) {
    if (!cls || !(cls = cls.trim())) {
      return
    }

    if (el.classList) {
      if (cls.indexOf(' ') > -1) {
        // 如果cls为多个类名，则需要循环移除每一项类名
        cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
      } else {
        // 原生的移除类名
        el.classList.remove(cls);
      }
      // 如果一个类名都不剩，则移除class属性
      if (!el.classList.length) {
        el.removeAttribute('class');
      }
    } else {
      // 如果没有classList属性，则通过getAttribute来获取class属性
      var cur = " " + (el.getAttribute('class') || '') + " ";
      var tar = ' ' + cls + ' ';
      while (cur.indexOf(tar) >= 0) {
        cur = cur.replace(tar, ' ');
      }
      cur = cur.trim();
      if (cur) {
        el.setAttribute('class', cur);
      } else {
        el.removeAttribute('class');
      }
    }
  }

  // 解析transition
  function resolveTransition (def$$1) {
    if (!def$$1) {
      return
    }
    if (typeof def$$1 === 'object') {
      var res = {};
      if (def$$1.css !== false) {
        // 是否使用 CSS 过渡类。默认为 true。如果设置为 false，将只通过组件事件触发注册的 JavaScript 钩子。
        extend(res, autoCssTransition(def$$1.name || 'v'));
      }
      extend(res, def$$1);
      return res
    } else if (typeof def$$1 === 'string') {
      return autoCssTransition(def$$1)
    }
  }

  // 返回具有缓存的自适应的css过渡类名
  var autoCssTransition = cached(function (name) {
    return {
      enterClass: (name + "-enter"),
      enterToClass: (name + "-enter-to"),
      enterActiveClass: (name + "-enter-active"),
      leaveClass: (name + "-leave"),
      leaveToClass: (name + "-leave-to"),
      leaveActiveClass: (name + "-leave-active")
    }
  });

  var hasTransition = inBrowser && !isIE9;
  var TRANSITION = 'transition';
  var ANIMATION = 'animation';

  // Transition属性前缀
  var transitionProp = 'transition';
  // 在css完成过渡后触发
  var transitionEndEvent = 'transitionend';
  // Animation属性前缀
  var animationProp = 'animation';
  // 在css完成动画后触发
  var animationEndEvent = 'animationend';

  // 配置兼容webkit内核浏览器
  if (hasTransition) {
    if (window.ontransitionend === undefined &&
      window.onwebkittransitionend !== undefined
    ) {
      transitionProp = 'WebkitTransition';
      transitionEndEvent = 'webkitTransitionEnd';
    }
    if (window.onanimationend === undefined &&
      window.onwebkitanimationend !== undefined
    ) {
      animationProp = 'WebkitAnimation';
      animationEndEvent = 'webkitAnimationEnd';
    }
  }

  // window.requestAnimationFrame --
  // 告诉浏览器——你希望执行一个动画，并且要求浏览器在下次重绘之前调用指定的回调函数更新动画。
  // 该方法需要传入一个回调函数作为参数，该回调函数会在浏览器下一次重绘之前执行
  var raf = inBrowser
    ? window.requestAnimationFrame
      ? window.requestAnimationFrame.bind(window)
      : setTimeout
    : function (fn) { return fn(); };

  // 下一帧
  function nextFrame (fn) {
    raf(function () {
      raf(fn);
    });
  }

  // 添加过渡样式
  function addTransitionClass (el, cls) {
    var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
    if (transitionClasses.indexOf(cls) < 0) {
      transitionClasses.push(cls);
      addClass(el, cls);
    }
  }

  // 移除过渡样式
  function removeTransitionClass (el, cls) {
    if (el._transitionClasses) {
      remove(el._transitionClasses, cls);
    }
    removeClass(el, cls);
  }

  // 当过渡结束时，执行的方法
  function whenTransitionEnds (el, expectedType, cb) {
    var ref = getTransitionInfo(el, expectedType);
    var type = ref.type;
    var timeout = ref.timeout;
    var propCount = ref.propCount;
    if (!type) { return cb() }
    var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
    var ended = 0;
    var end = function () {
      el.removeEventListener(event, onEnd);
      cb();
    };
    var onEnd = function (e) {
      if (e.target === el) {
        // el触发过渡结束事件时，调用end方法
        if (++ended /* 确保end方法只被执行一次 */ >= propCount) {
          end();
        }
      }
    };
    // setTimeout宏任务，后面执行
    setTimeout(function () {
      if (ended < propCount /* 确保end方法只被执行一次 */) {
        // 大于timeout过渡结束时间时，调用end方法
        end();
      }
    }, timeout + 1);
    // 添加事件
    el.addEventListener(event, onEnd);
  }

  var transformRE = /\b(transform|all)(,|$)/;

  // 获取el的过渡信息
  function getTransitionInfo (el, expectedType) {
    var styles = window.getComputedStyle(el);
    // JSDOM 过渡属性可能会返回undefined
    // 过渡延迟时间 e.g: ['10s']
    var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
    // 延迟时间 e.g: ['5s']
    var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
    // 过渡超时时间 e.g: 15000（把过渡延迟时间加上过渡时间）
    var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    // 动画延迟时间 e.g: '15s'
    var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
    // 动画过渡时间 e.g: '8s'
    var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
    // 动画超时时间 e.g: 23000
    var animationTimeout = getTimeout(animationDelays, animationDurations);

    var type;
    var timeout = 0;
    var propCount = 0;
    if (expectedType === TRANSITION) {
      if (transitionTimeout > 0) {
        type = TRANSITION;
        timeout = transitionTimeout;
        propCount = transitionDurations.length;
      }
    } else if (expectedType === ANIMATION) {
      if (animationTimeout > 0) {
        type = ANIMATION;
        timeout = animationTimeout;
        propCount = animationDurations.length;
      }
    } else {
      // 根据 transitionTimeout 和 animationTimeout 来判断是否需要过渡效果
      timeout = Math.max(transitionTimeout, animationTimeout);
      type = timeout > 0
        ? transitionTimeout > animationTimeout
          ? TRANSITION
          : ANIMATION
        : null;
      propCount = type
        ? type === TRANSITION
          ? transitionDurations.length
          : animationDurations.length
        : 0;
    }
    // 是否有过渡效果(Boolean值)
    var hasTransform =
      type === TRANSITION &&
      /* /\b(transform|all)(,|$)/ */
      transformRE.test(styles[transitionProp + 'Property']);
    return {
      type: type,
      timeout: timeout,
      propCount: propCount,
      hasTransform: hasTransform
    }
  }

  /**
   * 获取超时时间
   * @param {Array} delays 延迟时间数组
   * @param {*} durations 过渡时间数组
   */
  function getTimeout (delays, durations) {
    while (delays.length < durations.length) {
      delays = delays.concat(delays);
    }

    // 返回两个数组对应项相加后的最大值
    // e.g:
    // [1, 10, 2] [3, 5, 7]
    // 相加后 => [4, 15, 9]
    // Math.max([4, 15, 9]) => 15
    return Math.max.apply(null, durations.map(function (d, i) {
      return toMs(d) + toMs(delays[i])
    }))
  }

  // 旧版谷歌浏览器需要将',' 转成 '.' 
  // e.g: s = '5s'
  // return 5000
  function toMs (s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000
  }

  /*  */

  // 节点的enter钩子
  function enter (vnode, toggleDisplay) {
    var el = vnode.elm;

    // 执行节点的leave钩子（在执行leave方法是添加到el上）
    if (isDef(el._leaveCb)) {
      el._leaveCb.cancelled = true;
      el._leaveCb();
    }

    // 解析transition组件的过渡props
    var data = resolveTransition(vnode.data.transition);

    // 如果没有transition属性，则终止函数。transition组件和自定义transition属性，则不会终止函数
    if (isUndef(data)) {
      return
    }

    if (isDef(el._enterCb) || el.nodeType !== 1 /* 必须为一个元素类型 */) {
      return
    }

    var css = data.css;
    var type = data.type;
    var enterClass = data.enterClass;
    var enterToClass = data.enterToClass;
    var enterActiveClass = data.enterActiveClass;
    var appearClass = data.appearClass;
    var appearToClass = data.appearToClass;
    var appearActiveClass = data.appearActiveClass;
    var beforeEnter = data.beforeEnter;
    var enter = data.enter;
    var afterEnter = data.afterEnter;
    var enterCancelled = data.enterCancelled;
    var beforeAppear = data.beforeAppear;
    var appear = data.appear;
    var afterAppear = data.afterAppear;
    var appearCancelled = data.appearCancelled;
    var duration = data.duration;

    var context = activeInstance;
    var transitionNode = activeInstance.$vnode;
    while (transitionNode && transitionNode.parent) {
      context = transitionNode.context;
      transitionNode = transitionNode.parent;
    }

    // 满足以下两种情况，则是初始化渲染时使用过渡
    var isAppear = !context._isMounted /* 节点尚未挂载完毕 */ || !vnode.isRootInsert /* 不是根节点插入 */; 

    // 如果不为初始化渲染时使用过渡，则终止函数
    if (isAppear && !appear && appear !== '') {
      return
    }

    var startClass /* 开始过渡样式 */ = isAppear && appearClass
      ? appearClass
      : enterClass;
    var activeClass /* 过渡时的过渡样式 */ = isAppear && appearActiveClass
      ? appearActiveClass
      : enterActiveClass;
    var toClass /* 完成时的过渡样式 */ = isAppear && appearToClass
      ? appearToClass
      : enterToClass;

    /*
      当只用 JavaScript 过渡的时候，在 enter 和 leave 中必须使用 done 进行回调。否则，它们将被同步调用，过渡会立即完成。
      推荐对于仅使用 JavaScript 过渡的元素添加 v-bind:css="false"，Vue 会跳过 CSS 的检测。这也可以避免过渡过程中 CSS 的影响。
      leave-cancelled钩子，不能在v-if指令中使用，只能在v-show指令中使用。因为v-if指令一定会销毁组件，组件必定离开，是不可取消的。
      e.g.
      beforeEnter(){
        alert("beforeEnter 进入过渡开始前 " );
      },
      enter(){
        alert("enter 进入过渡状态开始");
      },
      afterEnter(){
        alert("afterEnter 进入过渡状态结束");
      },
      enterCancelled(){
        alert("enterCancelled 进入过渡状态 被打断");
      },
    */
    var beforeEnterHook /* 进入过渡开始前 */ = isAppear
      ? (beforeAppear || beforeEnter)
      : beforeEnter;

    // 当与 CSS 结合使用时
    // 回调函数 done 是可选的
    // enter: function (el, done) {
    //   // ...
    //   done()
    // },
    var enterHook /* 进入过渡状态开始 */= isAppear
      ? (typeof appear === 'function' ? appear : enter)
      : enter;

    var afterEnterHook /* 进入过渡状态结束 */ = isAppear
      ? (afterAppear || afterEnter)
      : afterEnter;
    var enterCancelledHook /* 进入过渡状态，被打断 */ = isAppear
      ? (appearCancelled || enterCancelled)
      : enterCancelled;

    // 确定进入节点时的过渡 
    // duration - number | { enter: number, leave: number } 指定过渡的持续时间。
    var explicitEnterDuration = toNumber(
      isObject(duration)
        ? duration.enter
        : duration
    );

    if (explicitEnterDuration != null) {
      checkDuration(explicitEnterDuration, 'enter', vnode);
    }

    // v-bind:css="false" => expectsCSS = false
    // 默认为true
    var expectsCSS = css !== false && !isIE9;
    // 是否需要用户执行done回调函数，比如enter钩子，如果传入了第二个参数，则必须执行
    var userWantsControl = getHookArgumentsLength(enterHook);

    // 定义enter的回调函数，只执行一次
    var cb = el._enterCb = once(function () {
      if (expectsCSS) {
        // 移除完成时的过渡样式和过渡时的过渡样式
        removeTransitionClass(el, toClass);
        removeTransitionClass(el, activeClass);
      }
      if (cb.cancelled /* 上一次的enter回调函数已经被执行过了的标志 */) {
        if (expectsCSS) {
          // 移除开始过渡样式
          removeTransitionClass(el, startClass);
        }
        // 执行进入过渡状态，被打断时的钩子函数
        enterCancelledHook && enterCancelledHook(el);
      } else {
        // 执行进入过渡状态结束钩子函数
        afterEnterHook && afterEnterHook(el);
      }
      // 重置enter的回调函数
      el._enterCb = null;
    });

    if (!vnode.data.show) {
      // 通过插入一个insert钩子删除enter上挂起的leave元素
      mergeVNodeHook(vnode, 'insert', function () {
        var parent = el.parentNode;
        var pendingNode = parent && parent._pending && parent._pending[vnode.key];
        if (pendingNode &&
          pendingNode.tag === vnode.tag &&
          pendingNode.elm._leaveCb
        ) {
          pendingNode.elm._leaveCb();
        }
        enterHook && enterHook(el, cb);
      });
    }

    // 执行进入过渡开始前钩子函数
    beforeEnterHook && beforeEnterHook(el);
    if (expectsCSS) {
      addTransitionClass(el, startClass);
      addTransitionClass(el, activeClass);
      // 浏览器重绘时执行回调
      nextFrame(function () {
        removeTransitionClass(el, startClass);
        if (!cb.cancelled) {
          addTransitionClass(el, toClass);
          if (!userWantsControl) {
            if (isValidDuration(explicitEnterDuration)) {
              // 在达到持续过渡时间时，执行enter的回调函数_enterCb
              setTimeout(cb, explicitEnterDuration);
            } else {
              // 如果duration无效，则执行这个函数
              whenTransitionEnds(el, type, cb);
            }
          }
        }
      });
    }

    // v-show执行的enter会传入第二个参数toggleDisplay
    if (vnode.data.show) {
      toggleDisplay && toggleDisplay();
      enterHook && enterHook(el, cb);
    }

    // v-bind:css="false" && enterHook没有第二个参数，执行cb
    if (!expectsCSS && !userWantsControl) {
      cb();
    }
  }

  // 节点的leave钩子
  function leave (vnode, rm) {
    var el = vnode.elm;

    // 执行enter的回调函数
    if (isDef(el._enterCb)) {
      el._enterCb.cancelled = true;
      el._enterCb();
    }

    var data = resolveTransition(vnode.data.transition);
    if (isUndef(data) || el.nodeType !== 1) {
      // 执行移除节点钩子
      return rm()
    }

    if (isDef(el._leaveCb)) {
      return
    }

    var css = data.css;
    var type = data.type;
    var leaveClass = data.leaveClass;
    var leaveToClass = data.leaveToClass;
    var leaveActiveClass = data.leaveActiveClass;
    var beforeLeave = data.beforeLeave; // 离开过渡运行前
    var leave = data.leave; // 离开过渡运行时
    var afterLeave = data.afterLeave; // 离开过渡运行后
    var leaveCancelled = data.leaveCancelled; // 离开过渡被打断时
    var delayLeave = data.delayLeave; // 延迟离开钩子，在in-out模式下存在
    var duration = data.duration;

    var expectsCSS = css !== false && !isIE9;
    // 是否需要用户执行done回调函数，比如enter钩子，如果传入了第二个参数，则必须执行
    var userWantsControl = getHookArgumentsLength(leave);

    var explicitLeaveDuration = toNumber(
      isObject(duration)
        ? duration.leave
        : duration
    );

    if (isDef(explicitLeaveDuration)) {
      checkDuration(explicitLeaveDuration, 'leave', vnode);
    }

    var cb = el._leaveCb = once(function () {
      if (el.parentNode && el.parentNode._pending) {
        el.parentNode._pending[vnode.key] = null;
      }
      if (expectsCSS) {
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
      }
      if (cb.cancelled /* 表明离开过渡时被打断 */) {
        if (expectsCSS) {
          removeTransitionClass(el, leaveClass);
        }
        // 执行离开过渡状态，被打断时的钩子函数
        leaveCancelled && leaveCancelled(el);
      } else {
        rm();
        afterLeave && afterLeave(el);
      }
      el._leaveCb = null;
    });

    if (delayLeave) {
      delayLeave(performLeave);
    } else {
      performLeave();
    }

    // 执行离开方法
    function performLeave () {
      // 延迟离开可能已经取消
      // 执行节点的enter钩子时，如果已经执行过了节点的_leaveCb方法，则cancelled被标志为true
      if (cb.cancelled) {
        return
      }
      // 记录离开元素
      if (!vnode.data.show && el.parentNode) {
        (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
      }
      beforeLeave && beforeLeave(el);
      if (expectsCSS) {
        addTransitionClass(el, leaveClass);
        addTransitionClass(el, leaveActiveClass);
        nextFrame(function () {
          removeTransitionClass(el, leaveClass);
          if (!cb.cancelled) {
            addTransitionClass(el, leaveToClass);
            if (!userWantsControl) {
              if (isValidDuration(explicitLeaveDuration)) {
                setTimeout(cb, explicitLeaveDuration);
              } else {
                whenTransitionEnds(el, type, cb);
              }
            }
          }
        });
      }
      leave && leave(el, cb);
      
      // v-bind:css="false" && enterHook没有第二个参数，执行cb
      if (!expectsCSS && !userWantsControl) {
        cb();
      }
    }
  }

  /**
   * 校验duration的值
   */
  function checkDuration (val, name, vnode) {
    // duration期待的值为一个Number类型或者 `{ enter: number, leave: number }`
    if (typeof val !== 'number') {
      warn(
        "<transition> explicit " + name + " duration is not a valid number - " +
        "got " + (JSON.stringify(val)) + ".",
        vnode.context
      );
    } else if (isNaN(val)) {
      warn(
        "<transition> explicit " + name + " duration is NaN - " +
        'the duration expression might be incorrect.',
        vnode.context
      );
    }
  }

  // 校验duration是否为number类型
  function isValidDuration (val) {
    return typeof val === 'number' && !isNaN(val)
  }

  /**
   * 格式化transition钩子的参数长度。钩子可以是：
   * - 与原始钩子合并后的钩子
   * - 包装组件方法 (check ._length)
   * - 普通函数 (.length)
   */
  function getHookArgumentsLength (fn) {
    if (isUndef(fn)) {
      return false
    }
    // 在执行createFnInvoker时添加.fns
    var invokerFns = fn.fns;
    if (isDef(invokerFns)) {
      return getHookArgumentsLength(
        Array.isArray(invokerFns)
          ? invokerFns[0]
          : invokerFns
      )
    } else {
      // 返回钩子函数的形参长度
      return (fn._length || fn.length) > 1
    }
  }

  // 私有的enter钩子（节点进入钩子）
  function _enter (_, vnode) {
    // v-show不等于true是，执行enter方法
    if (vnode.data.show !== true) {
      enter(vnode);
    }
  }

  var transition = inBrowser ? {
    create: _enter,
    activate: _enter,
    remove: function remove$$1 (vnode, rm /* 移除节点回调 */) {
      if (vnode.data.show !== true) {
        leave(vnode, rm);
      } else {
        // v-show为true
        rm();
      }
    }
  } : {};

  // Vue平台的模块
  var platformModules = [
    attrs,
    klass,
    events,
    domProps,
    style,
    transition
  ];

  var modules = platformModules.concat(baseModules);

  // patch函数
  var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

  if (isIE9) {
    // 选中文档片段改变时触发
    document.addEventListener('selectionchange', function () {
      // 获取所有聚焦的元素
      var el = document.activeElement;
      if (el && el.vmodel) {
        // 如果绑定了v-model，则触发input事件
        trigger(el, 'input');
      }
    });
  }

  // v-model指令
  var directive = {
    // 被绑定元素插入父节点时调用（仅保证父节点存在，但不一定已被插入文档中）
    inserted: function inserted (el, binding, vnode, oldVnode) {
      if (vnode.tag === 'select') {
        if (oldVnode.elm && !oldVnode.elm._vOptions) {
          mergeVNodeHook(vnode, 'postpatch', function () {
            // 组件全部更新完后调用
            directive.componentUpdated(el, binding, vnode);
          });
        } else {
          setSelected(el, binding, vnode.context);
        }
        // e.g: ['A', 'B', 'C']
        el._vOptions = [].map.call(el.options, getValue);
      } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
        // 文本类型输入框text,number,password,search,email,tel,url
        el._vModifiers = binding.modifiers; // 修饰符
        if (!binding.modifiers.lazy) {
          // compositionstart 指中文输入法在输入时触发
          el.addEventListener('compositionstart', onCompositionStart);
          // compositionend 指中文输入法完成时触发
          el.addEventListener('compositionend', onCompositionEnd);
          // 有些浏览器没有compositionend事件
          el.addEventListener('change', onCompositionEnd);
          if (isIE9) {
            el.vmodel = true;
          }
        }
      }
    },

    // 指令所在组件的VNode及其子VNode全部更新后调用
    /*
      e.g:
        option标签的项数发生改变时
    */
    componentUpdated: function componentUpdated (el, binding, vnode) {
      if (vnode.tag === 'select') {
        setSelected(el, binding, vnode.context);
        // 上一个options选项的value值（数组）
        var prevOptions = el._vOptions;
        // 当前options选项的value值（数组）
        var curOptions = el._vOptions = [].map.call(el.options, getValue);

        if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
          var needReset = el.multiple
            // 只要有一个当前绑定的value和当前的options不匹配，则返回true
            ? binding.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })

            // 旧值与新值不相等且当前绑定的value与当前options不匹配，则返回true
            : binding.value !== binding.oldValue && hasNoMatchingOption(binding.value, curOptions);
          if (needReset) {
            // 触发change事件
            trigger(el, 'change');
          }
        }
      }
    }
  };

  // 设置select
  function setSelected (el, binding, vm) {
    actuallySetSelected(el, binding, vm);
    if (isIE || isEdge) {
      setTimeout(function () {
        actuallySetSelected(el, binding, vm);
      }, 0);
    }
  }

  // 实际上的select
  function actuallySetSelected (el, binding, vm) {
    var value = binding.value;
    var isMultiple = el.multiple; // 是否支持多选
    if (isMultiple && !Array.isArray(value)) {
      // 支持多选时，v-model绑定的属性值必须为一个数组
      warn(
        "<select multiple v-model=\"" + (binding.expression) + "\"> " +
        "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
        vm
      );
      return
    }
    var selected, option;
    for (var i = 0, l = el.options.length; i < l; i++) {
      option = el.options[i];
      if (isMultiple) {
        // 查找option在value数组中的索引
        selected = looseIndexOf(value, getValue(option)) > -1;
        if (option.selected !== selected) {
          option.selected = selected;
        }
      } else {
        // 检查两个值是否相等
        if (looseEqual(getValue(option), value)) {
          // 如果两个值相等，但是el.selectedIndex和当前option的索引不相等的话
          // 需要将el的selectedIndex设置为索引i
          if (el.selectedIndex !== i) {
            el.selectedIndex = i;
          }
          return
        }
      }
    }
    // 如果都没有选中，且不支持多选
    if (!isMultiple) {
      el.selectedIndex = -1;
    }
  }

  // value是否在options选项数组中，如果不在，返回true
  function hasNoMatchingOption (value, options) {
    return options.every(function (o) { return !looseEqual(o, value); })
  }

  /**
   * 获取option的value值
   */
  function getValue (option) {
    return '_value' in option
      ? option._value
      : option.value
  }

  function onCompositionStart (e) {
    e.target.composing = true;
  }

  function onCompositionEnd (e) {
    // 防止input事件被无故的触发
    if (!e.target.composing) { return }
    e.target.composing = false;
    trigger(e.target, 'input');
  }

  function trigger (el, type) {
    // 创建自定义事件
    var e = document.createEvent('HTMLEvents');
    // 初始化自定义事件
    e.initEvent(type, true, true);
    // el触发自定义事件
    el.dispatchEvent(e);
  }

  // 定位node
  // 递归搜索根组件内部可能定义的transition
  function locateNode (vnode) {
    return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
      ? locateNode(vnode.componentInstance._vnode)
      : vnode
  }

  var show = {
    // 钩子函数
    // 只调用一次，指令第一次绑定到元素时调用
    // param: el binding vnode oldVNode
    // 其中binding为一个对象
    bind: function bind (el, ref, vnode) {
      // v-show绑定值
      var value = ref.value;

      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;

      // 初始化display方式
      var originalDisplay = el.__vOriginalDisplay =
        el.style.display === 'none' ? '' : el.style.display;

      if (value && transition$$1) {
        vnode.data.show = true;
        // 在transition组件里面使用v-show显示子元素
        enter(vnode, function () {
          el.style.display = originalDisplay;
        });
      } else {
        el.style.display = value ? originalDisplay : 'none';
      }
    },

    // 所在组件的VNode更新时调用，指令的值可能发生了改变，也可能没有。
    update: function update (el, ref, vnode) {
      var value = ref.value;
      var oldValue = ref.oldValue;

      // 如果当前的value和oldValue相等，直接return
      if (!value === !oldValue) { return }
      vnode = locateNode(vnode);
      var transition$$1 = vnode.data && vnode.data.transition;
      if (transition$$1) {
        // 在transition组件里面使用v-show显示子元素
        vnode.data.show = true;
        if (value) {
          // value为true，则调用enter方法
          enter(vnode, function () {
            el.style.display = el.__vOriginalDisplay;
          });
        } else {
          // value为false，则调用leave方法
          leave(vnode, function () {
            el.style.display = 'none';
          });
        }
      } else {
        el.style.display = value ? el.__vOriginalDisplay : 'none';
      }
    },

    // 指令与元素解绑时调用
    unbind: function unbind (
      el,
      binding,
      vnode,
      oldVnode,
      isDestroy
    ) {
      if (!isDestroy) {
        // 如果还没有被销毁，则将el的display样式设置为最初的属性值
        el.style.display = el.__vOriginalDisplay;
      }
    }
  };

  // vue自带的v-model和v-show指令
  var platformDirectives = {
    model: directive,
    show: show
  };

  // Transition组件的props
  var transitionProps = {
    name: String,
    appear: Boolean, // 是否在初始渲染时使用过渡。默认为 false。
    css: Boolean, // 是否使用 CSS 过渡类。默认为 true。如果设置为 false，将只通过组件事件触发注册的 JavaScript 钩子。
    mode: String,
    type: String,
    enterClass: String,
    leaveClass: String,
    enterToClass: String,
    leaveToClass: String,
    enterActiveClass: String,
    leaveActiveClass: String,
    appearClass: String, // 初始化渲染样式
    appearActiveClass: String,
    appearToClass: String,
    duration: [Number, String, Object]
  };

  // 获取真正的child
  function getRealChild (vnode) {
    var compOptions = vnode && vnode.componentOptions;
    if (compOptions && compOptions.Ctor.options.abstract) {
      return getRealChild(getFirstComponentChild(compOptions.children))
    } else {
      // 默认返回vnode
      return vnode
    }
  }

  /**
   * 提取transition的props, event
   * comp => 组件
   */
  function extractTransitionData (comp) {
    var data = {};
    var options = comp.$options;
    // 提取props
    // e.g: tag, name
    for (var key in options.propsData) {
      data[key] = comp[key];
    }
    // 提取events，并将它们直接赋给transition的方法
    // e.g: before-enter, enter
    var listeners = options._parentListeners;
    for (var key$1 in listeners) {
      data[camelize(key$1)] = listeners[key$1];
    }
    return data
  }

  // 如果vnode的tag为keep-alive，则返回keep-alive VNode节点，否则返回undefined
  function placeholder (h, rawChild) {
    if (/\d-keep-alive$/.test(rawChild.tag)) {
      return h('keep-alive', {
        props: rawChild.componentOptions.propsData
      })
    }
  }

  // 判断父级vnode是否含有transition过渡属性
  function hasParentTransition (vnode) {
    while ((vnode = vnode.parent)) {
      if (vnode.data.transition) {
        return true
      }
    }
  }

  // 判断两个vnode是否相同
  function isSameChild (child, oldChild) {
    return oldChild.key === child.key && oldChild.tag === child.tag
  }

  // 判断element是否是文本节点
  var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

  // 判断是否为v-show指令
  var isVShowDirective = function (d) { return d.name === 'show'; };

  var Transition = {
    name: 'transition',
    props: transitionProps,
    abstract: true,

    // transition组件渲染函数
    render: function render (h) {
      var this$1 = this;

      var children = this.$slots.default;
      if (!children) {
        return
      }

      // 过滤掉文本节点
      children = children.filter(isNotTextNode);
      if (!children.length) {
        return
      }

      // 如果有多个children，发出警告
      if (children.length > 1) {
        warn(
          '<transition> can only be used on a single element. Use ' +
          '<transition-group> for lists.',
          this.$parent
        );
      }

      var mode = this.mode;

      // 如果mode模式存在，但是mode只能选择'in-out'或者'out-in'模式
      if (mode && mode !== 'in-out' && mode !== 'out-in'
      ) {
        warn(
          'invalid <transition> mode: ' + mode,
          this.$parent
        );
      }

      var rawChild = children[0];

      // 如果父级容器也有transition过渡属性的话，直接返回该子节点
      if (hasParentTransition(this.$vnode)) {
        return rawChild
      }

      // 使用getRealChild() 去忽略抽象的组件 e.g: keep-alive
      var child = getRealChild(rawChild);
      if (!child) {
        return rawChild
      }

      // 在out-in模式中，先将_leaving赋值为true，表示正在离开
      // 直到afterLeave hook执行时，_leaving才被置为false
      if (this._leaving) {
        // 直接返回一个占位节点
        return placeholder(h, rawChild)
      }

      // 确保key值唯一
      var id = "__transition-" + (this._uid) + "-";
      child.key = child.key == null
        ? child.isComment
          ? id + 'comment'
          : id + child.tag
        : isPrimitive(child.key)
          ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
          : child.key;

      // 获取过渡的props和events，并设置vnode.data.transition
      var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
      var oldRawChild = this._vnode;
      var oldChild = getRealChild(oldRawChild);

      // 标记v-show
      if (child.data.directives && child.data.directives.some(isVShowDirective)) {
        child.data.show = true;
      }

      if (
        oldChild &&
        oldChild.data &&
        !isSameChild(child, oldChild) && // 不是相同的节点
        !isAsyncPlaceholder(oldChild) && // 不是异步占位
        !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
      ) {
        // 重置oldChild的transition数据
        var oldData = oldChild.data.transition = extend({}, data);
        if (mode === 'out-in') {
          // 先离开，后进入
          this._leaving = true;
          // 添加钩子函数(afterLeave)
          // 当离开完成时，更新队列
          mergeVNodeHook(oldData, 'afterLeave', function () {
            this$1._leaving = false;
            // 在旧节点离开之后，触发更新，渲染新节点
            this$1.$forceUpdate();
          });
          return placeholder(h, rawChild)
        } else if (mode === 'in-out') {
          // 如果新节点为异步占位节点，那么直接返回旧节点
          if (isAsyncPlaceholder(child)) {
            return oldRawChild
          }
          var delayedLeave;
          var performLeave = function () { delayedLeave(); };

          // 在afterEnter hook 和 enterCancelled hook中执行performLeave离开函数
          // 先入后出
          mergeVNodeHook(data, 'afterEnter', performLeave);
          mergeVNodeHook(data, 'enterCancelled', performLeave);

          // 添加延迟离开钩子hook
          mergeVNodeHook(oldData, 'delayLeave', function (leave) { 
            // leave = function performLeave() { ... }
            delayedLeave = leave; 
          });
        }
      }

      return rawChild
    }
  };

  var props = extend({
    tag: String,
    moveClass: String
  }, transitionProps);

  delete props.mode;

  var TransitionGroup = {
    props: props,

    // beforeMount生命周期钩子函数
    beforeMount: function beforeMount () {
      var this$1 = this;

      var update = this._update;
      // 重置_update函数
      // 作用，中间patch了一次缓存的子元素vnode，在后续的update新的vnode时，
      // diff算法会删除掉这一部分
      this._update = function (vnode, hydrating) {
        // 在render完后执行
        // 设置活跃的实例为当前组件
        var restoreActiveInstance = setActiveInstance(this$1);
        this$1.__patch__(
          this$1._vnode, // 上次渲染的vnode
          this$1.kept, // 上次渲染需要保留的vnode
          false, // 是否水合
          true // removeOnly (!important, avoids unnecessary moves)
        );

        // _vnode缓存的是上一次渲染的vnode
        this$1._vnode = this$1.kept;
        // 将活跃的实例设置回原来的组件
        restoreActiveInstance();
        // 执行Vue.prototype._update，vnode为本次渲染的子元素
        update.call(this$1, vnode, hydrating);
      };
    },

    // render渲染组件函数，也可以用template来渲染
    render: function render (h) {
      // this被Proxy代理过，执行this.tag时，会从this._props中寻找
      // 因为tag是组件的props，在initProps时，执行了proxy(vm, "_props", key)
      var tag = this.tag || this.$vnode.data.tag || 'span';
      // 缓存本次渲染的每一个带有key的子元素
      var map = Object.create(null);
      // 上次渲染transition-group组件的children
      var prevChildren = this.prevChildren = this.children;
      // 默认插槽的内容
      var rawChildren = this.$slots.default || [];
      var children = this.children = [];
      // 获取过滤的props和events
      var transitionData = extractTransitionData(this);

      for (var i = 0; i < rawChildren.length; i++) {
        var c = rawChildren[i];
        if (c.tag) {
          if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
            // 将子元素加入map缓存对象中
            children.push(c);
            map[c.key] = c
            ;(c.data || (c.data = {})).transition = transitionData;
          } else {
            // transition-group的子元素必须要有key值
            var opts = c.componentOptions;
            var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
            warn(("<transition-group> children must be keyed: <" + name + ">"));
          }
        }
      }

      if (prevChildren) {
        // 保存上次渲染的子元素（如果上次渲染的子元素key值能够在本次map缓存对象中找到的话）
        var kept = [];
        var removed = [];
        for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
          var c$1 = prevChildren[i$1];
          // 重置上次渲染的子元素的transition数据
          c$1.data.transition = transitionData;
          // 保存上次渲染的子元素的位置信息
          c$1.data.pos = c$1.elm.getBoundingClientRect();
          if (map[c$1.key]) {
            kept.push(c$1);
          } else {
            removed.push(c$1);
          }
        }
        // 缓存上次渲染的vnode（如果keep为[]，那么将生成一个空壳子vnode）
        this.kept = h(tag, null /* data */, kept /* children */);
        this.removed = removed;
      }

      // 生成本次渲染的vnode
      return h(tag, null, children)
    },

    // update生命周期钩子函数
    updated: function updated () {
      var children = this.prevChildren;
      // 动画过度样式，默认为`v-move`，如果props有name，则为`${name}-move`
      var moveClass = this.moveClass || ((this.name || 'v') + '-move');
      // children为空的情况
      // e.g:
      /*
        <transition-group
          tag="ul"
          name="slide"
          v-on:before-enter="beforeEnter"
          v-on:enter="enter"
        >
          <div v-if="flag == 1" key="1">fanqiewa</div>
          <div v-if="flag == 2" key="2">yiran</div>
        </transition-group>
      */
      if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
        return
      }

      // transition过渡才会执行下面的代码
      children.forEach(callPendingCbs);
      children.forEach(recordPosition);
      children.forEach(applyTranslation);

      // 保存页面重构后的body的高度
      this._reflow = document.body.offsetHeight;

      children.forEach(function (c) {
        if (c.data.moved) {
          var el = c.elm;
          var s = el.style;
          // 添加移动过渡类名
          addTransitionClass(el, moveClass);
          s.transform = s.WebkitTransform = s.transitionDuration = '';
          el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
            if (e && e.target !== el) {
              return
            }
            // 如果e事件对象不存在或者e.proptertyName属性名等于'transform'
            if (!e || /transform$/.test(e.propertyName)) {
              // 移除css过渡完成事件
              el.removeEventListener(transitionEndEvent, cb);
              el._moveCb = null;
              // 移除移动过渡类名
              removeTransitionClass(el, moveClass);
            }
          });
        }
      });
    },

    methods: {
      hasMove: function hasMove (el, moveClass) {
        if (!hasTransition /* inBrowser && !isIE9 */) {
          return false
        }
        if (this._hasMove) {
          return this._hasMove
        }
        // 克隆一个el
        var clone = el.cloneNode();
        // 如果el定义了过渡类名，则先移除
        if (el._transitionClasses) {
          el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
        }
        // 添加新的过渡类
        addClass(clone, moveClass);
        clone.style.display = 'none';
        this.$el.appendChild(clone);
        // 获取过渡信息
        // transition-group当一个子节点被更新，从屏幕上的位置发生，他会被应用一个移动中的css类
        // (通过name attribute或配置move-class attrbute自动生成)
        var info = getTransitionInfo(clone);
        this.$el.removeChild(clone);
        return (this._hasMove = info.hasTransform)
      }
    }
  };

  // 执行等待中的函数，冲刷掉这两个函数，防止出现不可预知的错误
  function callPendingCbs (c) {
    // 如果还有css过渡完成后触发的函数没有被触发，则先触发掉
    if (c.elm._moveCb) {
      c.elm._moveCb();
    }
    // 如果还有进入触发的函数没有被触发，则先触发掉
    if (c.elm._enterCb) {
      c.elm._enterCb();
    }
  }

  // 记录位置信息
  function recordPosition (c) {
    // element.getBoundingClientRect()返回元素的大小及其相对视口的位置
    c.data.newPos = c.elm.getBoundingClientRect();
  }

  // 执行过渡
  function applyTranslation (c) {
    var oldPos = c.data.pos;
    var newPos = c.data.newPos;
    var dx = oldPos.left - newPos.left;
    var dy = oldPos.top - newPos.top;
    // 有滚动条滚动时，dx或dy不为空
    if (dx || dy) {
      c.data.moved = true; // c的位置发生了变化（相对于视口的位置）
      var s = c.elm.style;
      s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
      s.transitionDuration = '0s';
    }
  }

  var platformComponents = {
    Transition: Transition,
    TransitionGroup: TransitionGroup
  };

  Vue.config.mustUseProp = mustUseProp;
  Vue.config.isReservedTag = isReservedTag;
  Vue.config.isReservedAttr = isReservedAttr;
  Vue.config.getTagNamespace = getTagNamespace;
  Vue.config.isUnknownElement = isUnknownElement;

  extend(Vue.options.directives, platformDirectives);
  extend(Vue.options.components, platformComponents);

  Vue.prototype.__patch__ = inBrowser ? patch : noop;

  // 第一个mount，当compile完成后，执行
  Vue.prototype.$mount = function (el, hydrating) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el, hydrating)
  };

  if (inBrowser) {
    setTimeout(function () {
      if (config.devtools) {
        if (devtools) {
          devtools.emit('init', Vue);
        } else {
          console[console.info ? 'info' : 'log'](
            'Download the Vue Devtools extension for a better development experience:\n' +
            'https://github.com/vuejs/vue-devtools'
          );
        }
      }
      if (config.productionTip !== false &&
        typeof console !== 'undefined'
      ) {
        console[console.info ? 'info' : 'log'](
          "You are running Vue in development mode.\n" +
          "Make sure to turn on production mode when deploying for production.\n" +
          "See more tips at https://vuejs.org/guide/deployment.html"
        );
      }
    }, 0);
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g;

  // 构建动态文本转换正则表达式
  var buildRegex = cached(function (delimiters) {
    // 将分隔符转变为转义字符
    // "{{".replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
    // \{\{
    var open = delimiters[0].replace(regexEscapeRE, '\\$&');
    // "}}".replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
    // \}\}
    var close = delimiters[1].replace(regexEscapeRE, '\\$&');
    return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
  });

  /**
   * 文本解析器，用于解析文本中的变量
   * @param {*} text 文本
   * @param {*} delimiters 分割符 默认为: ["{{","}}"]
   */
  function parseText (text, delimiters) {
    var tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE;
    if (!tagRE.test(text)) {
      return
    }
    var tokens = [];
    var rawTokens = [];
    // 将正则的游标移动到开始的位置
    var lastIndex = tagRE.lastIndex = 0;
    var match, index, tokenValue;
    while ((match = tagRE.exec(text))) {
      index = match.index;
      // 将{{之前的文本加入到结果数组中
      if (index > lastIndex) {
        rawTokens.push(tokenValue = text.slice(lastIndex, index));
        tokens.push(JSON.stringify(tokenValue));
      }
      // 解析过滤器 e.g: {{name | getName}} => exp = '_f("getName")(name)'
      var exp = parseFilters(match[1].trim());
      // 将解析出来的变量转换为调用方法的方式并加入结果数组 e.g: '_s(_f("getName")(name))'
      tokens.push(("_s(" + exp + ")"));
      rawTokens.push({ '@binding': exp });
      // 设置lastIndex保证下一次循环不会重复匹配已经解析过的文本
      lastIndex = index + match[0].length;
    }
    // 将}}之后的文本加入到结果数组中
    if (lastIndex < text.length) {
      rawTokens.push(tokenValue = text.slice(lastIndex));
      tokens.push(JSON.stringify(tokenValue));
    }
    return {
      expression: tokens.join('+'),
      tokens: rawTokens
    }
  }

  // 转换element元素的class属性
  function transformNode (el, options) {
    var warn = options.warn || baseWarn;
    // 静态class
    var staticClass = getAndRemoveAttr(el, 'class');
    if (staticClass) {
      var res = parseText(staticClass, options.delimiters);
      if (res) {
        warn(
          "class=\"" + staticClass + "\": " +
          'Interpolation inside attributes has been removed. ' +
          'Use v-bind or the colon shorthand instead. For example, ' +
          'instead of <div class="{{ val }}">, use <div :class="val">.',
          el.rawAttrsMap['class']
        );
      }
    }
    if (staticClass) {
      el.staticClass = JSON.stringify(staticClass);
    }
    // 动态绑定   :class
    var classBinding = getBindingAttr(el, 'class', false /* getStatic */);
    if (classBinding) {
      el.classBinding = classBinding;
    }
  }

  // 处理class和:class
  function genData (el) {
    var data = '';
    if (el.staticClass) {
      data += "staticClass:" + (el.staticClass) + ",";
    }
    if (el.classBinding) {
      data += "class:" + (el.classBinding) + ",";
    }
    return data
  }

  var klass$1 = {
    staticKeys: ['staticClass'],
    transformNode: transformNode,
    genData: genData
  };

  // 转换element元素的style属性
  function transformNode$1 (el, options) {
    var warn = options.warn || baseWarn;
    // 静态绑定style
    var staticStyle = getAndRemoveAttr(el, 'style');
    if (staticStyle) {
      {
        var res = parseText(staticStyle, options.delimiters);
        if (res) {
          warn(
            "style=\"" + staticStyle + "\": " +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div style="{{ val }}">, use <div :style="val">.',
            el.rawAttrsMap['style']
          );
        }
      }
      el.staticStyle = JSON.stringify(parseStyleText(staticStyle));
    }
    // 动态绑定   :style
    var styleBinding = getBindingAttr(el, 'style', false /* getStatic */);
    if (styleBinding) {
      el.styleBinding = styleBinding;
    }
  }

  // 处理style和:style
  function genData$1 (el) {
    var data = '';
    if (el.staticStyle) {
      data += "staticStyle:" + (el.staticStyle) + ",";
    }
    if (el.styleBinding) {
      data += "style:(" + (el.styleBinding) + "),";
    }
    return data
  }

  var style$1 = {
    staticKeys: ['staticStyle'],
    transformNode: transformNode$1,
    genData: genData$1
  };

  var decoder;

  // 对text文本进行解码
  var he = {
    decode: function decode (html) {
      decoder = decoder || document.createElement('div');
      decoder.innerHTML = html;
      return decoder.textContent
    }
  };

  // unary => 一元的
  // 判断标签是否是单标签
  var isUnaryTag = makeMap(
    'area,base,br,col,embed,frame,hr,img,input,isindex,keygen,' +
    'link,meta,param,source,track,wbr'
  );

  // 可以是单标签，也可以是双标签
  var canBeLeftOpenTag = makeMap(
    'colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source'
  );
  
  // 判断标签是否是段落标签
  // HTML5标签相关文档：https://html.spec.whatwg.org/multipage/indices.html#elements-3
  // 段落标签相关文档： https://html.spec.whatwg.org/multipage/dom.html#phrasing-content
  var isNonPhrasingTag = makeMap(
    'address,article,aside,base,blockquote,body,caption,col,colgroup,dd,' +
    'details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,' +
    'h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,' +
    'optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,' +
    'title,tr,track'
  );

  // 有规则的属性（普通的属性表达式）
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  // 匹配动态绑定的属性
  var dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z" + (unicodeRegExp.source) + "]*";
  var qnameCapture = "((?:" + ncname + "\\:)?" + ncname + ")";
  // 匹配开始标签的开始符
  var startTagOpen = new RegExp(("^<" + qnameCapture));
  // 匹配开始标签的结束符
  var startTagClose = /^\s*(\/?)>/;
  // 匹配结束标签
  var endTag = new RegExp(("^<\\/" + qnameCapture + "[^>]*>"));
  var doctype = /^<!DOCTYPE [^>]+>/i;
  // 匹配注释标签
  var comment = /^<!\--/;
  // 匹配有条件的注释
  var conditionalComment = /^<!\[/;

  // 判断标签是否为原生的文本标签（可以包含任何内容）
  var isPlainTextElement = makeMap('script,style,textarea', true);
  var reCache = {};

  var decodingMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&amp;': '&',
    '&#10;': '\n',
    '&#9;': '\t',
    '&#39;': "'"
  };
  var encodedAttr = /&(?:lt|gt|quot|amp|#39);/g;
  var encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#39|#10|#9);/g;

  // 需要忽略换行符的标签
  var isIgnoreNewlineTag = makeMap('pre,textarea', true);
  // 如果在pre和textarea内第一个字符是换行符的话，需要忽略这个换行符，否则在解析文本的时候出问题
  var shouldIgnoreFirstNewline = function (tag, html) { return tag && isIgnoreNewlineTag(tag) && html[0] === '\n'; };

  // 对一些已经被编码的属性值进行解码
  function decodeAttr (value, shouldDecodeNewlines) {
    var re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr;
    return value.replace(re, function (match) { return decodingMap[match]; })
  }

  // 解析HTML
  function parseHTML (html, options) {
    var stack = [];
    var expectHTML = options.expectHTML;
    var isUnaryTag$$1 = options.isUnaryTag || no;
    var canBeLeftOpenTag$$1 = options.canBeLeftOpenTag || no;
    var index = 0;
    var last, lastTag;
    while (html) {
      last = html;
      // 确保解析的不是script/style标签
      if (!lastTag || !isPlainTextElement(lastTag)) {
        var textEnd = html.indexOf('<');
        if (textEnd === 0) {
          // 匹配到注释节点时
          if (comment.test(html) /* /^<!\--/ */) {
            var commentEnd = html.indexOf('-->');

            if (commentEnd >= 0) {
              if (options.shouldKeepComment /* 是否保留注释节点，默认是不保留的 */) {
                options.comment(html.substring(4, commentEnd), index, index + commentEnd + 3);
              }
              advance(commentEnd + 3);
              continue
            }
          }
          
          // 匹配到<![...]>时
          if (conditionalComment.test(html)) {
            var conditionalEnd = html.indexOf(']>');

            if (conditionalEnd >= 0) {
              advance(conditionalEnd + 2);
              continue
            }
          }

          // 匹配Doctype
          var doctypeMatch = html.match(doctype);
          if (doctypeMatch) {
            advance(doctypeMatch[0].length);
            continue
          }

          // 匹配结束标签
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            var curIndex = index;
            advance(endTagMatch[0].length);
            parseEndTag(endTagMatch[1], curIndex, index);
            continue
          }

          // 解析开始标签
          var startTagMatch = parseStartTag();
          if (startTagMatch) {
            // 处理开始标签
            handleStartTag(startTagMatch);
            if (shouldIgnoreFirstNewline(startTagMatch.tagName, html)) {
              advance(1);
            }
            continue
          }
        }

        // 解析文本
        // 若textEnd > 0，说明html字符串不是以标签开头，而是以文本开头
        // e.g:
        // 文本内容<</div>
        var text = (void 0), rest = (void 0), next = (void 0);
        if (textEnd >= 0) {
          // 将以<开头的字符串取出来，看一下这个字符串是不是开始标签、结束标签、注释、条件注释
          // 如果都不是，就把他当做普通文本，然后继续往下找下一个<，知道匹配到开始标签、结束标签、注释、条件注释位置
          rest = html.slice(textEnd);
          while (
            !endTag.test(rest) && // 是不是终止标签
            !startTagOpen.test(rest) && // 是不是开始标签
            !comment.test(rest) && // 是不是注释标签
            !conditionalComment.test(rest) // 是不是条件注释
          ) {
            // 能进入这里，说明rest里面的那个<不是开始标签、结束标签、注释、条件注释中的一种。
            // 那我们就把他当做是普通文本，然后继续找下一个<
            next = rest.indexOf('<', 1);
            // 如果找不到下一个<了，说明剩余的这个html就是以一段文字作为结尾的，如：这是一段文本<- _ ->
            // 那么我们就不需要再往下寻找了，直接退出循环即可
            if (next < 0) { break }
            // <的位置变了，所以要更新一下textEnd，不然textEnd还是指向上一个<
            textEnd += next;
            // 以新的<作为起始再次截取字符串，进入下一个循环，看看这一次的<是不是开始标签、结束标签、注释、条件注释中的一种
            rest = html.slice(textEnd);
          }
          // 当循环结束之后，textEnd就已经是文本节点的最后的位置了
          text = html.substring(0, textEnd);
        }
        // 如果textEnd < 0，那么说明我们的html中根本就没有开始标签、结束标签、注释、条件注释，他就是一个纯文本
        if (textEnd < 0) {
          text = html;
        }

        // 我们已经将当前的文本获取到了，如果有文本的话，那么我们就将游标移动到文本末尾，准备进行下一轮的查找
        if (text) {
          advance(text.length);
        }

        if (options.chars && text) {
          // 文本节点已经获取到了，触发文本节点钩子
          options.chars(text, index - text.length, index);
        }
      } else {
        /*
          e.g:
            <script>
              var name = "fanqiewa";
            </script>
        */
        var endTagLength = 0;
        var stackedTag = lastTag.toLowerCase();
        var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'));

        // 将script/style标签里的内容都替换成''空串
        var rest$1 = html.replace(reStackedTag, function (all, text, endTag) {
          endTagLength = endTag.length;
          if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
            text = text
              .replace(/<!\--([\s\S]*?)-->/g, '$1') // #7298
              .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1');
          }
          if (shouldIgnoreFirstNewline(stackedTag, text)) {
            text = text.slice(1);
          }
          if (options.chars) {
            options.chars(text);
          }
          return ''
        });
        index += html.length - rest$1.length;
        html = rest$1;
        // 将script/style文本标签从stack栈中移除
        parseEndTag(stackedTag, index - endTagLength, index);
      }

      if (html === last) {
        options.chars && options.chars(html);
        // 标签语法格式错误
        if (!stack.length && options.warn) {
          options.warn(("Mal-formatted tag at end of template: \"" + html + "\""), { start: index + html.length });
        }
        break
      }
    }

    parseEndTag();
    
    // 将html往前推进n个长度
    function advance (n) {
      index += n;
      html = html.substring(n);
    }

    // 解析开始标签
    function parseStartTag () {
      var start = html.match(startTagOpen);
      if (start) {
        var match = {
          tagName: start[1], // 标签名 e.g: start[1] = 'div'
          attrs: [],
          start: index // 开始位置
        };
        advance(start[0].length); // e.g: start[0] = '<div'
        var end, attr;
        // 匹配属性
        while (!(end = html.match(startTagClose /* /^\s*(\/?)>/ */)) && (attr = html.match(dynamicArgAttribute) || html.match(attribute))) {
          attr.start = index;
          advance(attr[0].length);
          attr.end = index;
          match.attrs.push(attr);
        }
        // 匹配到开始标签的结束符
        if (end) {
          match.unarySlash = end[1]; // "" 或者 "/"
          advance(end[0].length);
          match.end = index;
          return match
        }
      }
    }
    
    // 处理开始标签
    function handleStartTag (match) {
      var tagName = match.tagName;
      var unarySlash = match.unarySlash;

      if (expectHTML) {
        // 如果当前标签的上一个标签是p标签，并且当前正在解析的标签不是一个段落元素标签，那么我们就直接调用parseEndTag将p标签结束掉
        // 因为在HTML标准中，p标签只能嵌套段落标签，其他元素如果嵌套在p标签中会被自动解析到p标签外面
        // e.g:
        // <p><span>这是内联元素</span><div>这是块级元素</div></p>
        // 在浏览器中会被解析成：
        // <p><span>这是内联元素</span></p><div>这是块级元素</div><p></p>
        if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
          parseEndTag(lastTag);
        }
        // 如果标签的上一个标签跟当前解析的标签名相同并且当前标签属于“可省略闭合标签”，那么，直接调用parseEndTag把上一个标签结束掉
        // e.g:
        /*
          <ul>
            <li> 选项1
            <li> 选项2
            <li> 选项3
          </ul>
        */
        if (canBeLeftOpenTag$$1(tagName) && lastTag === tagName) {
          parseEndTag(tagName);
        }
      }

      // 当前解析的标签是否为自闭合标签
      // 自闭合标签分为两种，一种是HTML内置的自闭合标签，一种是用户自定义标签或组件
      var unary = isUnaryTag$$1(tagName) || !!unarySlash;

      // 由于在不同的浏览器中，对标签属性的处理有所区别，如在IE浏览器中，会将所有的属性值进行一次编码
      // e.g:
      // <div name"\n"></div>    =>   <div name="&#10;"></div>
      // 再如在chrome浏览器中，会对a标签的href属性进行一次编码
      // e.g:
      // <a href="\n" />         =>   <a href="&#10;" />
      // 因此，我们需要对属性值做一下处理，对这些属性进行解码
      var l = match.attrs.length;
      var attrs = new Array(l);
      for (var i = 0; i < l; i++) {
        var args = match.attrs[i];
        var value = args[3] || /* 匹配属性格式：name="kiner" */
          args[4] || /* 匹配属性格式：name='kiner' */
          args[5] || /* 匹配属性格式：name=kiner */
          '';
        
        // 若解析的标签是a标签且当前属性名是href，则根据当前浏览器环境看是否需要对\n换行符进行解码（有些浏览器会对属性值进行编码处理）
        var shouldDecodeNewlines = tagName === 'a' && args[1] === 'href'
          ? options.shouldDecodeNewlinesForHref
          : options.shouldDecodeNewlines;
        // 将处理过的属性方法attrs中
        attrs[i] = {
          name: args[1],
          value: decodeAttr(value, shouldDecodeNewlines)
        };
        if (options.outputSourceRange) {
          attrs[i].start = args.start + args[0].match(/^\s*/).length;
          attrs[i].end = args.end;
        }
      }

      // 判断当前标签是否为自闭合标签，若不是自闭合标签，则需要将解析出来的当前标签的信息压入栈中。
      // 方便后续用来匹配标签以及查找父级元素使用
      if (!unary) {
        stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs, start: match.start, end: match.end });
        // 将当前标签名赋值给lastTag，方便后续的对比操作
        lastTag = tagName;
      }

      if (options.start) {
        // 开始标签的信息已经解析完毕，通知钩子函数
        options.start(tagName, attrs, unary, match.start, match.end);
      }
    }

    // 处理结束标签
    function parseEndTag (tagName, start, end) {
      var pos, lowerCasedTagName;
      if (start == null) { start = index; }
      if (end == null) { end = index; }

      if (tagName) {
        lowerCasedTagName = tagName.toLowerCase();
        // 通过结束标签名在标签栈中从上往下查找最近一个匹配标签，并返回游标索引
        for (pos = stack.length - 1; pos >= 0; pos--) {
          if (stack[pos].lowerCasedTag === lowerCasedTagName) {
            break
          }
        }
      } else {
        pos = 0;
      }

      if (pos >= 0) {
        for (var i = stack.length - 1; i >= pos; i--) {
          if (i > pos || !tagName &&
            options.warn
          ) {
            // 循环遍历标签栈，如果当前遍历的索引(i)大于匹配到的标签索引(pos)
            // 则发出警告
            options.warn(
              ("tag <" + (stack[i].tag) + "> has no matching end tag."),
              { start: stack[i].start, end: stack[i].end }
            );
          }
          if (options.end) {
            options.end(stack[i].tag, start, end);
          }
        }

        // 从标签栈中移除开始标签
        stack.length = pos;
        // 将lastTag职位标签中的游标索引所指的标签
        lastTag = pos && stack[pos - 1].tag;
      } else if (lowerCasedTagName === 'br') {
        // br是一个自闭合标签，有三种写法: <br/> 或 <br> 或 </br>
        // 这里就是匹配第三种写法的，虽然这种写法很少见，而且不太推荐使用。
        // 当匹配到这种写法时，直接调用start钩子
        if (options.start) {
          options.start(tagName, [], true, start, end);
        }
      } else if (lowerCasedTagName === 'p') {
        // 由于通过pos没能在标签栈中找到与当前p标签匹配的开始标签，
        // 因此，这个标签应该是一个</p>的一个单独的标签
        // 因为在HTML解析的时候，遇到这样一个 单独的闭合p标签，
        // 会自动解析为<p></p>，因此，此时既要触发start钩子，
        // 也要触发end钩子
        if (options.start) {
          options.start(tagName, [], false, start, end);
        }
        if (options.end) {
          options.end(tagName, start, end);
        }
      }
    }
  }

  /*  */
  // on前缀 @ | v-on
  var onRE = /^@|^v-on:/;
  // 命令前缀 v- | @ | :
  var dirRE = /^v-|^@|^:/;
  var forAliasRE = /([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/;
  // 匹配v-for="(item, index) in list"中的index
  var forIteratorRE = /,([^,\}\]]*)(?:,([^,\}\]]*))?$/;
  var stripParensRE = /^\(|\)$/g;
  var dynamicArgRE = /^\[.*\]$/;

  var argRE = /:(.*)$/;
  var bindRE = /^:|^\.|^v-bind:/;
  var modifierRE = /\.[^.\]]+(?=[^\]]*$)/g;

  var slotRE = /^v-slot(:|$)|^#/;

  var lineBreakRE = /[\r\n]/;
  var whitespaceRE$1 = /\s+/g;

  var invalidAttributeRE = /[\s"'<>\/=]/;

  var decodeHTMLCached = cached(he.decode);

  var emptySlotScopeToken = "_empty_";

  var warn$2;
  var delimiters;
  var transforms;
  var preTransforms;
  var postTransforms;
  var platformIsPreTag;
  var platformMustUseProp;
  var platformGetTagNamespace;
  var maybeComponent;

  // 创建ast语法树元素
  function createASTElement (tag, attrs, parent) {
    return {
      type: 1,
      tag: tag,
      attrsList: attrs,
      attrsMap: makeAttrsMap(attrs),
      rawAttrsMap: {},
      parent: parent,
      children: []
    }
  }

  /**
   * 将HTML转换成ast语法树
   */
  function parse (template, options) {
    warn$2 = options.warn || baseWarn;

    // 判断标签是否为pre标签
    platformIsPreTag = options.isPreTag || no;
    // 必须使用prop来修饰的标签
    platformMustUseProp = options.mustUseProp || no;
    platformGetTagNamespace = options.getTagNamespace || no;
    var isReservedTag = options.isReservedTag || no;
    // 标签也许是组件
    // el含有component属性，或者el的标签不是原生的
    maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };

    transforms = pluckModuleFunction(options.modules, 'transformNode');
    preTransforms = pluckModuleFunction(options.modules, 'preTransformNode');
    postTransforms = pluckModuleFunction(options.modules, 'postTransformNode');

    // 分割符
    delimiters = options.delimiters;

    var stack = [];
    var preserveWhitespace = options.preserveWhitespace !== false;
    var whitespaceOption = options.whitespace;
    var root;
    var currentParent;
    var inVPre = false;
    var inPre = false;
    var warned = false;

    /**
     * 辅助警告提示类，由于在生成模板过程中是在循环体里面，为避免重复警告提示，
     * 定义这个只要提示一次就不再提示的警告方法
     */
    function warnOnce (msg, range) {
      if (!warned) {
        warned = true;
        warn$2(msg, range);
      }
    }

    // 关闭标签
    function closeElement (element) {
      trimEndingWhitespace(element);
      // 若当前标签没有v-pre并且没有编译过，则编译一下
      if (!inVPre && !element.processed) {
        element = processElement(element, options);
      }
     
      // 当我们的元素存储栈为空并且当前 元素不是根节点时
      // 即模板中的元素都是自闭合标签。e.g:
      // 正确的做法（由于加上了判断，因此，同时只可能有一个元素被输出）：
      // <input v-if"value===1" /><img v-else-if="value===2"/><br v-else="value===3"/>
      // 错误的做法（因为vue模板始终需要一个根元素包裹，这里已经有三个元素了）：
      // <input/><img/><br/>
      // 此时根节点root=input，但当前元素是br，由于元素都是自闭合标签，因此不存在父子关系，大家都是平级的
      // 因此，也就不会想用于维护层级关系的stack中添加元素
      if (!stack.length && element !== root) {
        if (root.if && (element.elseif || element.else)) {
          {
            checkRootConstraints(element);
          }
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          });
        } else {
          warnOnce(
            "Component template should contain exactly one root element. " +
            "If you are using v-if on multiple elements, " +
            "use v-else-if to chain them instead.",
            { start: element.start }
          );
        }
      }

      // 如果不是根节点且不是script或style之类被禁止的标签的话
      if (currentParent && !element.forbidden) {
        // 如果当前标签绑定有v-else-if或v-else，则需要解析一下
        if (element.elseif || element.else) {
          processIfConditions(element, currentParent);
        } else {
          // 如果当前标签是一个作用域插槽
          if (element.slotScope) {
            // 获取插槽名称
            var name = element.slotTarget || '"default"';
            // 将它保留在子列表中，以便v-else(-if)条件可以找到它作为prev节点
            (currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element;
          }
          // 把当前元素加入到父级元素的子节点列表中，从而创建AST的父子层级关系
          currentParent.children.push(element);
          // 同时也将当前节点的父级节点标记为当前的父级节点
          element.parent = currentParent;
        }
      }

      // slotScope属性在执行 processElement => processSlotContent 时添加
      // 最后，因为作用域插槽<div slot-scope="xxx">并不是一个一个真实的标签，我们需要把他从子节点中移除掉
      element.children = element.children.filter(function (c) { return !(c).slotScope; });

      // 因为前面又操作过元素了，可能会在后面产生一些空白文本节点，我们再清理一下
      trimEndingWhitespace(element);

      // 因为inVPre是公共变量，一个标签解析结束之后，我们需要重置一下
      // 否则会影响下一个标签的解析
      if (element.pre) {
        inVPre = false;
      }
      if (platformIsPreTag(element.tag)) {
        inPre = false;
      }
      // 执行 postTransformNode
      for (var i = 0; i < postTransforms.length; i++) {
        postTransforms[i](element, options);
      }
    }

    // 若当前元素不是pre元素，则删除元素尾部的空白文本节点
    function trimEndingWhitespace (el) {
      if (!inPre) {
        var lastNode;
        while (
          (lastNode = el.children[el.children.length - 1]) &&
          lastNode.type === 3 &&
          lastNode.text === ' '
        ) {
          el.children.pop();
        }
      }
    }

    // 检查根节点
    function checkRootConstraints (el) {
      if (el.tag === 'slot' || el.tag === 'template') {

        // 根节点不能是slot或者template
        warnOnce(
          "Cannot use <" + (el.tag) + "> as component root element because it may " +
          'contain multiple nodes.',
          { start: el.start }
        );
      }
      if (el.attrsMap.hasOwnProperty('v-for')) {
        // 根节点不能使用v-for属性
        warnOnce(
          'Cannot use v-for on stateful component root element because ' +
          'it renders multiple elements.',
          el.rawAttrsMap['v-for']
        );
      }
    }

    parseHTML(template, {
      warn: warn$2,
      expectHTML: options.expectHTML,
      isUnaryTag: options.isUnaryTag,
      canBeLeftOpenTag: options.canBeLeftOpenTag,
      shouldDecodeNewlines: options.shouldDecodeNewlines,
      shouldDecodeNewlinesForHref: options.shouldDecodeNewlinesForHref,
      shouldKeepComment: options.comments,
      outputSourceRange: options.outputSourceRange,
      // 钩子函数
      // 根据传过来的标签名创建抽象语法树元素节点
      // 检查一些非法属性或标签，并对一下特殊情况做预处理
      // 解析attrs
      // 解析指令v-if、v-for、v-once等
      // 如果不是自闭合标签的话，将当前元素加入到栈中，用于维护元素间的父子关系
      start: function start (tag, attrs, unary, start$1, end) {
        // 当解析到标签开始位置时，会执行这个钩子函数，将标签名和对应的属性传过来
        var ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag);

        // 处理 IE svg bug
        if (isIE && ns === 'svg') {
          attrs = guardIESVGBug(attrs);
        }

        var element = createASTElement(tag, attrs, currentParent);
        if (ns) {
          element.ns = ns;
        }

        {
          if (options.outputSourceRange) {
            element.start = start$1;
            element.end = end;
            element.rawAttrsMap = element.attrsList.reduce(function (cumulated, attr) {
              cumulated[attr.name] = attr;
              return cumulated
            }, {});
          }
          // 检测非法属性并提示
          attrs.forEach(function (attr) {
            if (invalidAttributeRE.test(attr.name)) {
              // /[\s"'<>\/=]/
              // 属性名中不能包含空格、双引号、单引号、<、>、\/、=这些字符
              warn$2(
                "Invalid dynamic argument expression: attribute names cannot contain " +
                "spaces, quotes, <, >, / or =.",
                {
                  start: attr.start + attr.name.indexOf("["),
                  end: attr.start + attr.name.length
                }
              );
            }
          });
        }

        if (isForbiddenTag(element) && !isServerRendering()) {
          // 提示用户这是一个在模板中被禁止使用的标签，因为模板仅仅只是用来描述状态与页面的呈现的。
          // 不应该包含样式和脚本标签
          element.forbidden = true;
          warn$2(
            'Templates should only be responsible for mapping the state to the ' +
            'UI. Avoid placing tags with side-effects in your templates, such as ' +
            "<" + tag + ">" + ', as they will not be parsed.',
            { start: element.start }
          );
        }

        // 执行 preTransforms函数，处理checkbox、radio等需要预处理的标签
        for (var i = 0; i < preTransforms.length; i++) {
          element = preTransforms[i](element, options) || element;
        }

        // 如果inVPre为false，可能还没有解析当前标签是否标记了v-pre
        if (!inVPre) {
          // 解析一下
          processPre(element);
          // 如果解析过后发现elem上标记有pre = true，说明标签确实标记了v-pre
          if (element.pre) {
            // 将inVPre置为true
            inVPre = true;
          }
        }

        // 如果标签名是pre，将inPre置为true
        if (platformIsPreTag(element.tag)) {
          inPre = true;
        }
        if (inVPre) {
          // 如果一个标签被标记了v-pre，那我们只需要把attrList中剩余的属性复制到elem的attrs中取即可
          // 因为attrList中的其他属性都在刚刚进行预处理的时候已经处理并从attrList中删除了（参见processRawAttrs函数）
          processRawAttrs(element);
        } else if (!element.processed) {
          // 如果还有没有处理的结构指令，如v-for、v-if等，就处理一下
          processFor(element);
          processIf(element);
          processOnce(element);
        }

        // 如果不存在根节点，则当前节点就是根节点
        if (!root) {
          root = element;
          {
            // 检查根节点
            checkRootConstraints(root);
          }
        }

        // 判断当前节点是不是一个自闭合标签，如果是一个自闭合标签，那么直接结束当前标签解析
        // 如果不是自闭合标签，我们需要记录下当前节点当做是下一个节点的父级元素，并将这个元素压入栈中
        if (!unary) {
          currentParent = element;
          stack.push(element);
        } else {
          closeElement(element);
        }
      },

      // 钩子函数
      end: function end (tag, start, end$1) {
        var element = stack[stack.length - 1];
        // 当前标签已经解析结束了，将标签从栈中弹出
        stack.length -= 1;
        // 此时栈顶元素便是我们下一个元素的父级
        currentParent = stack[stack.length - 1];
        if (options.outputSourceRange) {
          element.end = end$1;
        }
        // 关闭标签
        closeElement(element);
      },
      
      // 钩子函数
      // 创建抽象语法树文本节点
      // 将这个文本节点加入到父节点的children中
      chars: function chars (text, start, end) {
        // 如果不存在父级节点，那么我们可以得知，
        // 这个解析出来的文本，要么在根节点之外，要么压根就没有根节点
        if (!currentParent) {
          {
            if (text === template) {
              // 如果解析出来的文本跟传入的模板完全相同，那么，说明直传进来一个文本内容，触发警告
              warnOnce(
                'Component template requires a root element, rather than just text.',
                { start: start }
              );
            } else if ((text = text.trim())) {
              // 文本定义在了根节点的外面，发出警告
              warnOnce(
                ("text \"" + text + "\" outside root element will be ignored."),
                { start: start }
              );
            }
          }
          return
        }
        // 在IE浏览器中的textarea的placeholder有一个bug，浏览器会将placeholder的内容会被作为textarea的文本节点放入
        // 到textarea中，如果是这种情况，直接忽略他
        if (isIE &&
          currentParent.tag === 'textarea' &&
          currentParent.attrsMap.placeholder === text
        ) {
          return
        }
        var children = currentParent.children;
        
        // 如果当前文本在pre标签里或者是文本去掉前后空格后依然不为空
        if (inPre || text.trim()) {
          // 如果父级标签是纯文本标签，那么解析出来的文本就是我们要的内容
          // 如果不是的话，需要进行一定的解码
          text = isTextTag(currentParent) ? text : decodeHTMLCached(text);
        } else if (!children.length) {
          // 如果当前文本父级下面没有子节点的话，并且当前文本删除前后空格之后为空字符串的话，
          // 就清空文本。（在上一个if条件判断里已经进行了text.trim()判断了）
          // e.g:
          // <div>   </div> 直接清空text
          text = '';
        } else if (whitespaceOption) {
          if (whitespaceOption === 'condense') {
            // 去掉换行符
            text = lineBreakRE.test(text /* /[\r\n]/ */) ? '' : ' ';
          } else {
            text = ' ';
          }
        } else {
          // 是否需要保留空格
          text = preserveWhitespace ? ' ' : '';
        }
        if (text) {
          if (!inPre && whitespaceOption === 'condense') {
            // 如果不是在pre标签中且删除空白选项是condense，则删除文本中的换行符
            text = text.replace(whitespaceRE$1, ' ');
          }
          var res;
          var child;
          // 如果当前节点没有v-pre属性且是一个空白符并且可以解析出动态变量
          if (!inVPre && text !== ' ' && (res = parseText(text, delimiters))) {
            child = {
              type: 2,
              expression: res.expression,
              tokens: res.tokens,
              text: text
            };
          } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
            child = {
              type: 3,
              text: text
            };
          }
          if (child) {
            if (options.outputSourceRange) {
              child.start = start;
              child.end = end;
            }
            // 将创建的文本节点或表达式加入到父级节点的children中
            children.push(child);
          }
        }
      },

      // 保留注释节点时，执行此函数
      comment: function comment (text, start, end) {
        // 只有在根节点下创建注释才有效，只要不在根节点内部的注释都会被忽略
        if (currentParent) {
          var child = {
            type: 3,
            text: text,
            isComment: true
          };
          // 输出源代码的区间（即开始位置和结束位置）
          if (options.outputSourceRange) {
            child.start = start;
            child.end = end;
          }
          currentParent.children.push(child);
        }
      }
    });
    return root
  }

  // 处理v-pre
  function processPre (el) {
    if (getAndRemoveAttr(el, 'v-pre') != null) {
      el.pre = true;
    }
  }

  // 处理元素的属性，存放在el.attrs中，因为attrsList中的某些属性可能会被删除，如v-slot属性
  // 在有v-pre属性时，执行这个方法
  function processRawAttrs (el) {
    var list = el.attrsList;
    var len = list.length;
    if (len) {
      var attrs = el.attrs = new Array(len);
      for (var i = 0; i < len; i++) {
        attrs[i] = {
          name: list[i].name,
          value: JSON.stringify(list[i].value)
        };
        if (list[i].start != null) {
          attrs[i].start = list[i].start;
          attrs[i].end = list[i].end;
        }
      }
    } else if (!el.pre) {
      // 普通元素，并且不含任何属性
      el.plain = true;
    }
  }

  // 处理element
  function processElement (element, options) {
    processKey(element);

    // 在删除结构属性后，确定这是否是一个普通元素
    element.plain = (
      !element.key &&
      !element.scopedSlots &&
      !element.attrsList.length
    );

    processRef(element);
    processSlotContent(element);
    processSlotOutlet(element);
    processComponent(element);
    /*
      transforms => [transformNode函数, transformNode$1函数]
    */
    for (var i = 0; i < transforms.length; i++) {
      element = transforms[i](element, options) || element;
    }
    processAttrs(element);
    return element
  }

  // 处理key值
  function processKey (el) {
    var exp = getBindingAttr(el, 'key');
    if (exp) {
      {
        // template标签不能添加key值
        if (el.tag === 'template') {
          warn$2(
            "<template> cannot be keyed. Place the key on real elements instead.",
            getRawBindingAttr(el, 'key')
          );
        }
        if (el.for) {
          var iterator = el.iterator2 || el.iterator1;
          var parent = el.parent;
          // transition-group组件内使用v-for命令是，不能用index作为key值
          /*
            e.g:
            <transition-group>
              <div v-for="(item, index) in list" :key="index">
                {{item.slot}}
              </div>
            </transition-group>
          */
          if (iterator && iterator === exp && parent && parent.tag === 'transition-group') {
            warn$2(
              "Do not use v-for index as key on <transition-group> children, " +
              "this is the same as not using keys.",
              getRawBindingAttr(el, 'key'),
              true /* tip */
            );
          }
        }
      }
      el.key = exp;
    }
  }

  // 处理ref
  function processRef (el) {
    var ref = getBindingAttr(el, 'ref');
    if (ref) {
      el.ref = ref;
      el.refInFor = checkInFor(el);
    }
  }

  // 处理v-for
  function processFor (el) {
    var exp;

    // exp => 表达式
    // e.g: 'item in list'
    if ((exp = getAndRemoveAttr(el, 'v-for'))) {
      var res = parseFor(exp);
      if (res) {
        extend(el, res);
      } else {
        // 无效的v-for表达式
        warn$2(
          ("Invalid v-for expression: " + exp),
          el.rawAttrsMap['v-for']
        );
      }
    }
  }

  // 解析v-for
  function parseFor (exp) {
    var inMatch = exp.match(forAliasRE);
    if (!inMatch) { return }
    var res = {};
    res.for = inMatch[2].trim();
    var alias = inMatch[1].trim().replace(stripParensRE, '');
    var iteratorMatch = alias.match(forIteratorRE);
    if (iteratorMatch) {
      res.alias = alias.replace(forIteratorRE, '').trim();
      // v-for遍历数组，可提供第二个参数
      // e.g: v-for="(item, index) in list"
      // 其中iterator1 = index
      res.iterator1 = iteratorMatch[1].trim();
      if (iteratorMatch[2]) {
        // v-for遍历对象时，可提供第三个参数
        // e.g: v-for="(value, name, index) in object"
        // 其中iterator2 = index
        res.iterator2 = iteratorMatch[2].trim();
      }
    } else {
      res.alias = alias;
    }
    return res
  }

  // 处理v-if、v-else-if、v-else，并添加标记
  function processIf (el) {
    var exp = getAndRemoveAttr(el, 'v-if');
    if (exp) {
      el.if = exp;
      addIfCondition(el, {
        exp: exp,
        block: el
      });
    } else {
      if (getAndRemoveAttr(el, 'v-else') != null) {
        el.else = true;
      }
      var elseif = getAndRemoveAttr(el, 'v-else-if');
      if (elseif) {
        el.elseif = elseif;
      }
    }
  }

  // 处理if、elseif事件判断
  function processIfConditions (el, parent) {
    var prev = findPrevElement(parent.children);
    if (prev && prev.if) {
      addIfCondition(prev, {
        exp: el.elseif,
        block: el
      });
    } else {
      // v-else-if和v-else的上一个兄弟节点必须是v-if
      // 如果当前节点的上一个兄弟节点不是v-if的话，则打印错误
      warn$2(
        "v-" + (el.elseif ? ('else-if="' + el.elseif + '"') : 'else') + " " +
        "used on element <" + (el.tag) + "> without corresponding v-if.",
        el.rawAttrsMap[el.elseif ? 'v-else-if' : 'v-else']
      );
    }
  }

  // 查找上一个兄弟节点
  function findPrevElement (children) {
    var i = children.length;
    while (i--) {
      if (children[i].type === 1) {
        return children[i]
      } else {
        if (children[i].text !== ' ') {
          warn$2(
            "text \"" + (children[i].text.trim()) + "\" between v-if and v-else(-if) " +
            "will be ignored.",
            children[i]
          );
        }
        children.pop();
      }
    }
  }

  // 添加v-if条件判断
  function addIfCondition (el, condition) {
    if (!el.ifConditions) {
      el.ifConditions = [];
    }
    el.ifConditions.push(condition);
  }

  // 处理v-once
  function processOnce (el) {
    var once$$1 = getAndRemoveAttr(el, 'v-once');
    if (once$$1 != null) {
      el.once = true;
    }
  }

  // 处理插槽内容
  // e.g. <template slot="xxx">, <div slot-scope="xxx">
  function processSlotContent (el) {
    var slotScope;
    if (el.tag === 'template'/* tag为template标签 */) { 
      slotScope = getAndRemoveAttr(el, 'scope');
      if (slotScope) {
        // scope属性在作用域插槽中已被移除，从2.5版本开始，用slot-scope代替
        // slot-scope既可以使用在template标签中，也可以使用在普通（原生）的标签中
        // e.g:
        // <template slot="header" scope="slotProps">{{slotProps.data}}</template> 发出提示
        // <div slot="header" scope="slotProps">{{slotProps.data}}</div> 直接报错
        warn$2(
          "the \"scope\" attribute for scoped slots have been deprecated and " +
          "replaced by \"slot-scope\" since 2.5. The new \"slot-scope\" attribute " +
          "can also be used on plain elements in addition to <template> to " +
          "denote scoped slots.",
          el.rawAttrsMap['scope'],
          true
        );
      }
      el.slotScope = slotScope || getAndRemoveAttr(el, 'slot-scope');
    } else if ((slotScope = getAndRemoveAttr(el, 'slot-scope'))) {
      // 普通的标签，且含有v-for属性
      if (el.attrsMap['v-for']) {
        /*
          e.g:
          data() {
            return {
              list: [{ slot: "header" }, { slot: "footer"}],
            }
          }
          初始化子组件:
          Vue.component("child", {
            data() {
              return {
                data: [{
                  name: "fanqiewa",
                  age: 18
                }]
              }
            },
            template: `<div>
              <slot name="header" :data="data"></slot>
              <slot name="footer" :data="data"></slot>
            </div>`
          })
          调用子组件:
          <child>
            <template :slot="item.slot" v-for="item in list" slot-scope="slotProps">
              <div>
                {{slotProps.data}}
                {{item.slot}}
              </div>
            </template>
          </child>
          页面渲染:
          [ { "name": "fanqiewa", "age": 18 } ] header
          [ { "name": "fanqiewa", "age": 18 } ] footer
        */

        // 如果将template改成普通标签，则会打印出提示
        warn$2(
          // 在插槽中使用v-for的模糊组合
          "Ambiguous combined usage of slot-scope and v-for on <" + (el.tag) + "> " +
          // v-for的权重更高
          "(v-for takes higher priority). Use a wrapper <template> for the " +
          // 使用template包裹，使得作用域插槽更清晰
          "scoped slot to make it clearer.",
          el.rawAttrsMap['slot-scope'],
          true
        );
      }
      el.slotScope = slotScope;
    }

    // slot="xxx" 具名插槽 获取slot属性，并将其从attrsList中移除
    var slotTarget = getBindingAttr(el, 'slot');
    // e.g: <template slot="footer"></template>
    if (slotTarget) {
      // e.g: <template slot></template>
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget;
      // 动态绑定
      el.slotTargetDynamic = !!(el.attrsMap[':slot'] || el.attrsMap['v-bind:slot']);
      if (el.tag !== 'template' && !el.slotScope) {
        addAttr(el, 'slot', slotTarget, getRawBindingAttr(el, 'slot'));
      }
    }

    // 2.6 v-slot 语法
    {
      if (el.tag === 'template') {
        // v-slot on <template>
        var slotBinding = getAndRemoveAttrByRegex(el, slotRE);
        if (slotBinding) {
          {
            if (el.slotTarget || el.slotScope) {
              warn$2(
                "Unexpected mixed usage of different slot syntaxes.",
                el
              );
            }
            if (el.parent && !maybeComponent(el.parent)) {
              warn$2(
                "<template v-slot> can only appear at the root level inside " +
                "the receiving the component",
                el
              );
            }
          }
          var ref = getSlotName(slotBinding);
          var name = ref.name;
          var dynamic = ref.dynamic;
          el.slotTarget = name;
          el.slotTargetDynamic = dynamic;
          // e.g: <template v-slot></template> 会默认给一个slotScope = "_empty_"
          el.slotScope = slotBinding.value || emptySlotScopeToken; // force it into a scoped slot for perf
        }
      } else {
        var slotBinding$1 = getAndRemoveAttrByRegex(el, slotRE /* /^v-slot(:|$)|^#/ */);
        if (slotBinding$1) {
          {
            if (!maybeComponent(el)) {
              // v-slot只能用在组件获取template标签中
              warn$2(
                "v-slot can only be used on components or <template>.",
                slotBinding$1
              );
            }
            // 当使用v-slot绑定具名插槽时，不能通过slot-scope或者scope来添加作用域插槽。防止语法混淆
            // e.g:
            // <child><template v-slot:header slot-scope="slotScope">hello world!</template></child>
            // <child><template v-slot:header slot="header">hello world!</template></child>
            // 但是可以这样来使用:
            // e.g:
            // <child><template v-slot:header="header">{{header}}</template></child>
            /*
              子组件:
              Vue.component("child", {
                data() {
                  return {
                    data: [{
                      name: "fanqiewa",
                      age: 18
                    }]
                  }
                },
                template: `<div>
                  <slot name="header" :header="data"></slot>
                </div>`
              })
            */
            if (el.slotScope || el.slotTarget) {
              warn$2(
                "Unexpected mixed usage of different slot syntaxes.",
                el
              );
            }
            if (el.scopedSlots) {
              // 为避免作用域模糊，当有其他命名插槽时，默认槽也应该使用template模板语法
              // e.g:
              /*
                <child v-slot="slotScope">
                  {{slotScope}}
                  <template v-slot:header="otherSlotScope">
                    {{otherSlotScope.data}}
                  </template>
                </child>
                子组件:
                Vue.component("child", {
                  data() {
                    return {
                      data: [{
                        name: "fanqiewa",
                        age: 18
                      }],
                      slotScope: [{
                        name: "default"
                      }]
                    }
                  },
                  template: `<div>
                    <slot :defaultScope="slotScope"></slot>
                    <slot name="header" :header="data"></slot>
                  </div>`
                })
              */
              warn$2(
                "To avoid scope ambiguity, the default slot should also use " +
                "<template> syntax when there are other named slots.",
                slotBinding$1
              );
            }
          }
          // 添加组件的子节点到其定义的默认插槽中
          var slots = el.scopedSlots || (el.scopedSlots = {});
          var ref$1 = getSlotName(slotBinding$1);
          var name$1 = ref$1.name;
          var dynamic$1 = ref$1.dynamic;
          var slotContainer = slots[name$1] = createASTElement('template', [], el);
          slotContainer.slotTarget = name$1;
          slotContainer.slotTargetDynamic = dynamic$1;
          slotContainer.children = el.children.filter(function (c) {
            if (!c.slotScope) {
              c.parent = slotContainer;
              return true
            }
          });
          slotContainer.slotScope = slotBinding$1.value || emptySlotScopeToken;
          el.children = [];
          el.plain = false;
        }
      }
    }
  }

  // 获取slot名称
  function getSlotName (binding) {
    var name = binding.name.replace(slotRE, '');
    if (!name) {
      if (binding.name[0] !== '#') {
        name = 'default';
      } else {
        warn$2(
          "v-slot shorthand syntax requires a slot name.",
          binding
        );
      }
    }
    return dynamicArgRE.test(name)
      // dynamic [name] 去掉[]
      ? { name: name.slice(1, -1), dynamic: true }
      // static name
      : { name: ("\"" + name + "\""), dynamic: false }
  }

  // 处理slot标签（outlet => 插槽）
  function processSlotOutlet (el) {
    if (el.tag === 'slot') {
      // 将name属性添加赋值给slotName
      el.slotName = getBindingAttr(el, 'name');
      // e.g: <slot v-bind:name="name" key="slot"></slot> slot标签不能添加key
      if (el.key) {
        warn$2(
          "`key` does not work on <slot> because slots are abstract outlets " +
          "and can possibly expand into multiple elements. " +
          "Use the key on a wrapping element instead.",
          getRawBindingAttr(el, 'key')
        );
      }
    }
  }

  // 处理component
  function processComponent (el) {
    var binding;
    // 是否含有is属性
    if ((binding = getBindingAttr(el, 'is'))) {
      el.component = binding;
    }
    // 是否含有inline-template属性（内联模板）
    if (getAndRemoveAttr(el, 'inline-template') != null) {
      el.inlineTemplate = true;
    }
  }

  // 处理attrs
  function processAttrs (el) {
    var list = el.attrsList;
    var i, l, name, rawName, value, modifiers, syncGen, isDynamic;
    for (i = 0, l = list.length; i < l; i++) {
      name = rawName = list[i].name;
      value = list[i].value;
      // vue命令属性 e.g: name = "@click.stop"
      if (dirRE.test(name)) {
        // 标记元素是动态的
        el.hasBindings = true;
        // 处理修饰词
        modifiers = parseModifiers(name.replace(dirRE, ''));
        if (modifiers) {
          // 名称去掉修饰词
          name = name.replace(modifierRE, '');
        }
        if (bindRE.test(name)) { /* v-bind bindRE = /^:|^\.|^v-bind:/ */
          name = name.replace(bindRE, '');
          // 过滤value 也就是绑定的属性值
          value = parseFilters(value);
          isDynamic = dynamicArgRE.test(name); // 动态绑定 e.g: <div v-bind:[counter]="counter"></div>
          if (isDynamic) {
            name = name.slice(1, -1);
          }
          // v-bind的值不能为空
          if (
            value.trim().length === 0
          ) {
            warn$2(
              ("The value for a v-bind expression cannot be empty. Found in \"v-bind:" + name + "\"")
            );
          }
          if (modifiers) {
            //  .prop
            if (modifiers.prop && !isDynamic) {
              name = camelize(name);
              if (name === 'innerHtml') { name = 'innerHTML'; }
            }
            // .camel 将中划线命名法转成小驼峰命名法
            if (modifiers.camel && !isDynamic) {
              name = camelize(name);
            }

            /*
              <child :foo.sync="msg"></child>
              ->
              <child :foo="msg" @update:foo="val=>foo=val"></child>
              子组件触发：
              this.$emit("update:foo", true)
            */
            if (modifiers.sync) {
              syncGen = genAssignmentCode(value, "$event");
              if (!isDynamic /* 静态的 */) {
                // e.g: v-bind:foo-bar.sync="name"
                addHandler(
                  el,
                  ("update:" + (camelize(name))), // 事件名：update:fooBar
                  syncGen, // value 通过$emit触发update:fooBar时传入的值为￥event形参
                  null,
                  false,
                  warn$2,
                  list[i]
                );
                // hyphenate将小驼峰命名法转成中划线命名法
                if (hyphenate(name) !== camelize(name)) {
                  // e.g: v-bind:foo-bar.sync="name"
                  addHandler(
                    el,
                    ("update:" + (hyphenate(name))), // 事件名：update:foo-bar
                    syncGen,
                    null,
                    false,
                    warn$2,
                    list[i]
                  );
                }
              } else {
                //  e.g: v-bind:[foo].sync="name"
                addHandler(
                  el,
                  ("\"update:\"+(" + name + ")"), // '"update:"+(foo)'
                  syncGen,
                  null,
                  false,
                  warn$2,
                  list[i],
                  true // 动态的
                );
              }
            }
          }
          // 有.prop修饰词修饰
          if ((modifiers && modifiers.prop) || (
            /* el.component => 元素含有is属性 */
            /*
              platformMustUseProp = mustUseProp 必须使用prop来修饰的标签
              e.g: input、textarea、option、select、progress、option、input、video
            */
            !el.component && platformMustUseProp(el.tag, el.attrsMap.type, name)
          )) {
            // 添加prop
            addProp(el, name, value, list[i], isDynamic);
          } else {
            // 添加attr
            addAttr(el, name, value, list[i], isDynamic);
          }
        } else if (onRE.test(name)) { /* v-on onRE = /^@|^v-on:/ */
          name = name.replace(onRE, '');
          // 是否为动态绑定e.g: v-on:[handleName] 例如handleName = 'click'
          isDynamic = dynamicArgRE.test(name);
          if (isDynamic) {
            // e.g: '[handlename]'.slice(1, -1)
            name = name.slice(1, -1);
          }
          // 添加事件
          addHandler(el, name, value, modifiers, false, warn$2, list[i], isDynamic);
        } else {
          /*
            常用的其他指令 e.g: v-html
            自定义指令 e.g: v-demo
            以下例子基于自定义指令v-demo来解释

            e.g:
            data: {
              realName: "fanqiewa",
              key: "name"
            },
            directives: {
              demo: {
                bind: function (el, binding, vnode) {
                  console.log(binding);
                }
              }
            }
          */

          // 去掉v- | @ | : | #
          name = name.replace(dirRE, '');
          var argMatch = name.match(argRE /* orgRE = /:(.*)$/ */);
          var arg = argMatch && argMatch[1];
          
          // 是否是动态的
          isDynamic = false;
          if (arg) {
            // 非动态绑定 e.g: <div v-demo:foo='realName'></div>
            /*
              打印的binding为：
              {
                arg: "foo",
                def: {bind: f},
                expression: "realName",
                modifiers: {},
                name: "demo",
                rawName: "v-demo:foo",
                value: "fanqiewa"
              }
            */
            name = name.slice(0, -(arg.length + 1));
            // 动态绑定 e.g: <div v-demo:[key]='realName'></div>
            /*
              打印的binding为：
              {
                arg: "name",
                def: {bind: f},
                expression: "realName",
                modifiers: {},
                name: "demo",
                rawName: "v-demo:[key]",
                value: "fanqiewa"
              }
            */
            if (dynamicArgRE.test(arg) /* dynamicArgRE = /^\[.*\]$/ */) {
              arg = arg.slice(1, -1);
              isDynamic = true;
            }
          }
          addDirective(el, name, rawName, value, arg, isDynamic, modifiers, list[i]);
          if (name === 'model') {
            checkForAliasModel(el, value);
          }
        }
      } else {
        // 原生的属性如： attr-id
        {
          // 检查属性值是否符合规范
          var res = parseText(value, delimiters);
          if (res) {
            // e.g: attr-id="{{name}}" 不符合规范，应该改成：:attr-id="{{name}}"
            warn$2(
              name + "=\"" + value + "\": " +
              'Interpolation inside attributes has been removed. ' +
              'Use v-bind or the colon shorthand instead. For example, ' +
              'instead of <div id="{{ val }}">, use <div :id="val">.',
              list[i]
            );
          }
        }
        addAttr(el, name, JSON.stringify(value), list[i]);
        if (!el.component &&
            name === 'muted' && // muted(boolean)设置音频或视频是否应该被静音
            platformMustUseProp(el.tag, el.attrsMap.type, name)) {
          // muted="false" => 最终变成muted="muted"
          addProp(el, name, 'true', list[i]);
        }
      }
    }
  }

  // 检查element是否处于v-for中（父元素含有v-for属性）
  function checkInFor (el) {
    var parent = el;
    while (parent) {
      if (parent.for !== undefined) {
        return true
      }
      parent = parent.parent;
    }
    return false
  }

  // 处理vue命令修饰词
  function parseModifiers (name) {
    // e.g: match = ['.stop'] name = 'click.stop'
    var match = name.match(modifierRE);
    if (match) {
      var ret = {};
      // e.g: '.stop'.slice(1) => 'stop'
      match.forEach(function (m) { ret[m.slice(1)] = true; });
      // e.g: ret = { stop: true }
      return ret
    }
  }

  // 根据attrs属性数组转成map属性对象
  function makeAttrsMap (attrs) {
    var map = {};
    for (var i = 0, l = attrs.length; i < l; i++) {
      if (
        map[attrs[i].name] && !isIE && !isEdge
      ) {
        warn$2('duplicate attribute: ' + attrs[i].name, attrs[i]);
      }
      map[attrs[i].name] = attrs[i].value;
    }
    return map
  }

  /**
   * 判断el的标签是否是script或者style标签，不要翻译里面的内容
   * 包含<script type="x/template"></script>
   */
  function isTextTag (el) {
    return el.tag === 'script' || el.tag === 'style'
  }

  /**
   * 判断标签是否是style或者script标签
   * e.g:
   * <script></script>
   * <script type="text/javascript"></script>
   */
  function isForbiddenTag (el) {
    return (
      el.tag === 'style' ||
      (el.tag === 'script' && (
        !el.attrsMap.type ||
        el.attrsMap.type === 'text/javascript'
      ))
    )
  }

  var ieNSBug = /^xmlns:NS\d+/;
  var ieNSPrefix = /^NS\d+:/;

  // 拦截IE中SVG标签的bug
  function guardIESVGBug (attrs) {
    var res = [];
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (!ieNSBug.test(attr.name)) {
        attr.name = attr.name.replace(ieNSPrefix, '');
        res.push(attr);
      }
    }
    return res
  }

  // e.g: <div v-model="counter" v-for="counter in list">
  function checkForAliasModel (el, value) {
    var _el = el;
    while (_el) {
      // alias为每一项item
      if (_el.for && _el.alias === value) {
        warn$2(
          "<" + (el.tag) + " v-model=\"" + value + "\">: " +
          "You are binding v-model directly to a v-for iteration alias. " +
          "This will not be able to modify the v-for source array because " +
          "writing to the alias is like modifying a function local variable. " +
          "Consider using an array of objects and use v-model on an object property instead.",
          el.rawAttrsMap['v-model']
        );
      }
      _el = _el.parent;
    }
  }

  function preTransformNode (el, options) {
    if (el.tag === 'input') {
      var map = el.attrsMap;
      // input标签，并且包含v-model双向绑定
      if (!map['v-model']) {
        return
      }

      var typeBinding;
      if (map[':type'] || map['v-bind:type']) {
        // e.g: <input :type="name" v-model="counter">
        typeBinding = getBindingAttr(el, 'type');
        /*
          经过genIfConditions处理后返回：
          ((name) === 'checkbox') ?
            _c('input', {
              directives: [{ name: "model", rawName: "v-model", value: (counter), expression: "counter" }],
              attrs: { "type": "checkbox" }, 
              domProps: { "checked": Array.isArray(counter) ? _i(counter, null) > -1 : (counter) }, 
              on: { 
                "change": function ($event) { 
                  var $$a = counter, 
                    $$el = $event.target, 
                    $$c = $$el.checked ? (true) : (false); 
                    if (Array.isArray($$a)) { 
                      var $$v = null, 
                        $$i = _i($$a, $$v); 
                    if ($$el.checked) { 
                      $$i < 0 && (counter = $$a.concat([$$v])) 
                    } else { 
                      $$i > -1 && (counter = $$a.slice(0, $$i).concat($$a.slice($$i + 1))) 
                    } 
                  } else { 
                    counter = $$c 
                  } 
                } 
              }
            }) : ((name) === 'radio') ? 
              _c('input', { 
                directives: [{ name: "model", rawName: "v-model", value: (counter), expression: "counter" }], 
                attrs: { "type": "radio" }, 
                domProps: { "checked": _q(counter, null) }, 
                on: { 
                  "change": function ($event) { 
                    counter = null 
                  } 
                } 
              }) 
              : _c('input', {
                directives: [{ name: "model", rawName: "v-model", value: (counter), expression: "counter" }], 
                attrs: { "type": name }, 
                domProps: { "value": (counter) }, 
                on: { 
                  "input": function ($event) { 
                    if ($event.target.composing) return; 
                    counter = $event.target.value 
                  } 
                } 
              })
        */
      }
      if (!map.type && !typeBinding && map['v-bind']) {
        // e.g: <input v-bind="name" v-model="counter">
        typeBinding = "(" + (map['v-bind']) + ").type";
        /*
          经过genIfConditions处理后返回：
          (((name).type) === 'checkbox') ?
            _c('input', _b({
              directives: [{ name: "model", rawName: "v-model", value: (counter), expression: "counter" }],
              attrs: { "type": "checkbox" },
              domProps: {
                "checked": Array.isArray(counter) ? _i(counter, null) > -1 : (counter)
              },
              on: {
                "change": function ($event) {
                  var $$a = counter,
                    $$el = $event.target,
                    $$c = $$el.checked ? (true) : (false);
                  if (Array.isArray($$a)) {
                    var $$v = null,
                      $$i = _i($$a, $$v);
                    if ($$el.checked) {
                      $$i < 0 && (counter = $$a.concat([$$v]))
                    } else {
                      $$i > -1 && (counter = $$a.slice(0, $$i).concat($$a.slice($$i + 1)))
                    }
                  } else {
                    counter = $$c
                  }
                }
              }
            }, 'input', name, false))
            : (((name).type) === 'radio') ?
              _c('input', _b({
                directives: [{ name: "model", rawName: "v-model", value: (counter), expression: "counter" }],
                attrs: { "type": "radio" },
                domProps: { "checked": _q(counter, null) },
                on: {
                  "change": function ($event) {
                    counter = null
                  }
                }
              }, 'input', name, false))
              : _c('input', _b({
                directives: [{ name: "model", rawName: "v-model", value: (counter), expression: "counter" }],
                attrs: { "type": (name).type },
                domProps: { "value": (counter) },
                on: {
                  "input": function ($event) {
                    if ($event.target.composing) return;
                    counter = $event.target.value
                  }
                }
              }, 'input', name, false))
        */
      }

      if (typeBinding) {
        var ifCondition = getAndRemoveAttr(el, 'v-if', true);
        var ifConditionExtra = ifCondition ? ("&&(" + ifCondition + ")") : "";
        var hasElse = getAndRemoveAttr(el, 'v-else', true) != null;
        var elseIfCondition = getAndRemoveAttr(el, 'v-else-if', true);
        // 1. checkbox
        var branch0 = cloneASTElement(el);
        // process for on the main node
        processFor(branch0);
        addRawAttr(branch0, 'type', 'checkbox');
        processElement(branch0, options);
        branch0.processed = true; // prevent it from double-processed
        branch0.if = "(" + typeBinding + ")==='checkbox'" + ifConditionExtra;
        addIfCondition(branch0, {
          exp: branch0.if,
          block: branch0
        });
        // 2. add radio else-if condition
        var branch1 = cloneASTElement(el);
        getAndRemoveAttr(branch1, 'v-for', true);
        addRawAttr(branch1, 'type', 'radio');
        processElement(branch1, options);
        addIfCondition(branch0, {
          exp: "(" + typeBinding + ")==='radio'" + ifConditionExtra,
          block: branch1
        });
        // 3. other
        var branch2 = cloneASTElement(el);
        getAndRemoveAttr(branch2, 'v-for', true);
        addRawAttr(branch2, ':type', typeBinding);
        processElement(branch2, options);
        addIfCondition(branch0, {
          exp: ifCondition,
          block: branch2
        });

        if (hasElse) {
          branch0.else = true;
        } else if (elseIfCondition) {
          branch0.elseif = elseIfCondition;
        }

        return branch0
      }
    }
  }

  function cloneASTElement (el) {
    return createASTElement(el.tag, el.attrsList.slice(), el.parent)
  }

  var model$1 = {
    preTransformNode: preTransformNode
  };

  var modules$1 = [
    klass$1,
    style$1,
    model$1
  ];

  function text (el, dir) {
    if (dir.value) {
      addProp(el, 'textContent', ("_s(" + (dir.value) + ")"), dir);
    }
  }


  function html (el, dir) {
    if (dir.value) {
      addProp(el, 'innerHTML', ("_s(" + (dir.value) + ")"), dir);
    }
  }

  // 内置命令 v-mode、v-text、v-html
  var directives$1 = {
    model: model,
    text: text,
    html: html
  };


  var baseOptions = {
    expectHTML: true,
    modules: modules$1,
    directives: directives$1,
    isPreTag: isPreTag,
    isUnaryTag: isUnaryTag,
    mustUseProp: mustUseProp,
    canBeLeftOpenTag: canBeLeftOpenTag,
    isReservedTag: isReservedTag,
    getTagNamespace: getTagNamespace,
    staticKeys: genStaticKeys(modules$1)
  };

  var isStaticKey;
  var isPlatformReservedTag;

  var genStaticKeysCached = cached(genStaticKeys$1);

  /**
   * 优化器的目标：遍历生成的模板AST树并检测纯静态的子树，即不需要更改的DOM部分。
   *
   * 一旦我们检测到这些子树，我们就可以：
   *
   * 1. 将它们提升为常量，这样我们就不再需要在每次重新渲染时为它们创建新的节点；
   * 2. 在修补过程中完全跳过它们。
   * 
   * 循环递归虚拟node，标记是不是静态节点
   *  根据node.static或者 node.once 标记staticRoot的状态
   */
  function optimize (root, options) {
    if (!root) { return }
    // 生成静态节点keys
    isStaticKey = genStaticKeysCached(options.staticKeys || '');
    isPlatformReservedTag = options.isReservedTag || no;
    markStatic$1(root);
    markStaticRoots(root, false);
  }
  
  // 生成静态节点keys
  // e.g: keys = 'staticClass,staticStyle'
  function genStaticKeys$1 (keys) {
    return makeMap(
      'type,tag,attrsList,attrsMap,plain,parent,children,attrs,start,end,rawAttrsMap' +
      (keys ? ',' + keys : '')
    )
  }

  // 标记节点是否为静态的
  function markStatic$1 (node) {
    node.static = isStatic(node);
    if (node.type === 1) {
      // 不要使插槽内容成为静态的。以避免
      // 1. 无法改变插槽节点的组件
      // 2. 静态插槽内容热重新加载失败
      if (
        !isPlatformReservedTag(node.tag) &&
        node.tag !== 'slot' &&
        node.attrsMap['inline-template'] == null
      ) {
        return
      }
      for (var i = 0, l = node.children.length; i < l; i++) {
        var child = node.children[i];
        markStatic$1(child);
        if (!child.static) {
          node.static = false;
        }
      }
      if (node.ifConditions) {
        for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
          var block = node.ifConditions[i$1].block;
          markStatic$1(block);
          if (!block.static) {
            node.static = false;
          }
        }
      }
    }
  }

  // 标记node为静态节点
  function markStaticRoots (node, isInFor) {
    if (node.type === 1) {
      if (node.static || node.once) {
        node.staticInFor = isInFor;
      }
      if (node.static && node.children.length && !(
        node.children.length === 1 &&
        node.children[0].type === 3
      )) {
        // e.g: v-pre
        node.staticRoot = true;
        return
      } else {
        node.staticRoot = false;
      }
      if (node.children) {
        for (var i = 0, l = node.children.length; i < l; i++) {
          markStaticRoots(node.children[i], isInFor || !!node.for);
        }
      }
      if (node.ifConditions) {
        for (var i$1 = 1, l$1 = node.ifConditions.length; i$1 < l$1; i$1++) {
          markStaticRoots(node.ifConditions[i$1].block, isInFor);
        }
      }
    }
  }

  // 判断节点是否为静态的
  function isStatic (node) {
    if (node.type === 2 /* expression */) { 
      return false
    }
    if (node.type === 3 /* text */) {
      return true
    }
    return !!(node.pre || (
      !node.hasBindings && // 静态的绑定属性如：v- @ : #
      !node.if && !node.for && // not v-if or v-for or v-else
      !isBuiltInTag(node.tag) && // not slot component
      isPlatformReservedTag(node.tag) && // 属于HTML SVG标签
      !isDirectChildOfTemplateFor(node) &&
      Object.keys(node).every(isStaticKey)
    ))
  }

  // 父元素不等于template且含有v-for时，返回true
  function isDirectChildOfTemplateFor (node) {
    while (node.parent) {
      node = node.parent;
      if (node.tag !== 'template') {
        return false
      }
      if (node.for) {
        return true
      }
    }
    return false
  }

  /*
    匹配函数表达式
    e.g:
    var str = "(name) => { return name }"
    str.match(fnExpRE)
    输出：
    ["(name) =>", "(name)", index: 0, input: "(name) => { return name }", groups: undefined]
  */
  var fnExpRE = /^([\w$_]+|\([^)]*?\))\s*=>|^function\s*(?:[\w$]+)?\s*\(/;
  // 匹配函数调用 e.g: handlerClick() => ()   handlerClick();
  var fnInvokeRE = /\([^)]*?\);*$/;

  /*
    匹配普通的路径
    e.g:
    var str = "handlerClick"
    str.match(simplePathRE)
    输出：
    ["handlerClick", index: 0, input: "handlerClick", groups: undefined]
    e.g:
    var str = "handler.handlerClick"
    str.match(simplePathRE)
    输出：
    ["handler.handlerClick", index: 0, input: "handler.handlerClick", groups: undefined]
  */
  var simplePathRE = /^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/;

  // KeyboardEvent.keyCode别名
  var keyCodes = {
    esc: 27,
    tab: 9,
    enter: 13,
    space: 32,
    up: 38,
    left: 37,
    right: 39,
    down: 40,
    'delete': [8, 46]
  };

  var keyNames = {
    esc: ['Esc', 'Escape'],
    tab: 'Tab',
    enter: 'Enter',
    space: [' ', 'Spacebar'],
    up: ['Up', 'ArrowUp'],
    left: ['Left', 'ArrowLeft'],
    right: ['Right', 'ArrowRight'],
    down: ['Down', 'ArrowDown'],
    'delete': ['Backspace', 'Delete', 'Del']
  };

  // 阻止侦听器执行的修饰符需要显式返回null，以便我们可以确定是否删除.once的侦听器
  // 添加拦截
  // e.g: 'if($event.ctrlKey||$event.shiftKey||$event.altKey||$event.metaKey)return null;'
  var genGuard = function (condition) { return ("if(" + condition + ")return null;"); };

  var modifierCode = {
    stop: '$event.stopPropagation();',
    prevent: '$event.preventDefault();',
    self: genGuard("$event.target !== $event.currentTarget"),
    ctrl: genGuard("!$event.ctrlKey"),
    shift: genGuard("!$event.shiftKey"),
    alt: genGuard("!$event.altKey"),
    meta: genGuard("!$event.metaKey"),
    left: genGuard("'button' in $event && $event.button !== 0"),
    middle: genGuard("'button' in $event && $event.button !== 1"),
    right: genGuard("'button' in $event && $event.button !== 2")
  };

  /**
   * 在genData$2时执行
   * @param {*} events 事件对象
   * @param {*} isNative 是否含有.native修饰
   */
  function genHandlers (events, isNative) {
    var prefix = isNative ? 'nativeOn:' : 'on:';
    var staticHandlers = "";
    var dynamicHandlers = "";
    for (var name in events) {
      var handlerCode = genHandler(events[name]);
      if (events[name] && events[name].dynamic) {
        // e.g: 'keyup,handlerCode,'
        dynamicHandlers += name + "," + handlerCode + ",";
      } else {
        // e.g: '"keyup": handlerCode,'
        staticHandlers += "\"" + name + "\":" + handlerCode + ",";
      }
    }
    staticHandlers = "{" + (staticHandlers.slice(0, -1)) + "}";
    if (dynamicHandlers) {
      return prefix + "_d(" + staticHandlers + ",[" + (dynamicHandlers.slice(0, -1)) + "])"
    } else {
      return prefix + staticHandlers
    }
  }

  /**
   * gen => generator生成器
   * 生成handlerCode
   */
  function genHandler (handler) {
    if (!handler) {
      return 'function(){}'
    }

    if (Array.isArray(handler)) {
      return ("[" + (handler.map(function (handler) { return genHandler(handler); }).join(',')) + "]")
    }

    // 方法路径 e.g: handlerClick
    var isMethodPath = simplePathRE.test(handler.value);
    // 函数表达式 e.g: (name) => { return name }
    var isFunctionExpression = fnExpRE.test(handler.value);
    // 函数调用 e.g: handlerClick()
    var isFunctionInvocation = simplePathRE.test(handler.value.replace(fnInvokeRE, ''));

    if (!handler.modifiers) {
      // 绑定的是函数名或者函数表达式
      if (isMethodPath || isFunctionExpression) {
        return handler.value
      }
      // 绑定的是函数调用
      return ("function($event){" + (isFunctionInvocation ? ("return " + (handler.value)) : handler.value) + "}") // inline statement
    } else {
      // e.g: .stop等修饰词
      var code = '';
      var genModifierCode = '';
      var keys = [];
      for (var key in handler.modifiers) {
        if (modifierCode[key]) {
          // stop、prevent、self、ctrl、shift、alt、meta、left、middle、right
          // 其中ctrl、shift、alt、meta为系统修饰键
          genModifierCode += modifierCode[key];
          // left/right
          // e.g: <div v-on:keyup.right="handlerClick">hello world</div>
          if (keyCodes[key]) {
            keys.push(key);
          }
        } else if (key === 'exact') {
          // 没有任何系统修饰符被按下的时候才触发
          // e.g: v-on:click.exact="handlerClick"
          var modifiers = (handler.modifiers);
          genModifierCode += genGuard(
            // '$event.ctrlKey||$event.shiftKey||$event.altKey||$event.metaKey'
            ['ctrl', 'shift', 'alt', 'meta']
              .filter(function (keyModifier) { return !modifiers[keyModifier]; })
              .map(function (keyModifier) { return ("$event." + keyModifier + "Key"); })
              .join('||')
          );
        } else {
          keys.push(key);
        }
      }
      if (keys.length) {
        code += genKeyFilter(keys);
      }
      // 确保像prevent和stop这样的修饰符在键过滤之后执行
      if (genModifierCode) {
        code += genModifierCode;
      }
      var handlerCode = isMethodPath
        // 如果是方法路径，传入$event执行
        // e.g: 'return handlerClick($event)'
        ? ("return " + (handler.value) + "($event)")
        : isFunctionExpression
          // 如果是函数表达式 将函数表达式用括号包裹，传入$event执行函数表达式
          // e.g: 'return ((name) => { return name })($event)'
          ? ("return (" + (handler.value) + ")($event)")
          : isFunctionInvocation
            // 如果是函数调用，直接执行
            ? ("return " + (handler.value))
            // 如果是普通表达式
            // e.g: falg = true
            : handler.value;
      return ("function($event){" + code + handlerCode + "}")
    }
  }

  // 生成handler的key值筛选
  function genKeyFilter (keys) {
    return (
      // e.g: keys = ['right']
      // return 'if(!$event.type.indexOf('key')&&_k($event.keyCode,"right",39,$event.key,["Right","ArrowRight"]))return null'
      "if(!$event.type.indexOf('key')&&" +
      (keys.map(genFilterCode).join('&&')) + ")return null;"
    )
  }

  // 过滤筛选code
  function genFilterCode (key) {
    var keyVal = parseInt(key, 10);
    if (keyVal) {
      return ("$event.keyCode!==" + keyVal)
    }
    var keyCode = keyCodes[key];
    var keyName = keyNames[key];
    return (
      // e.g: key = 'right'时
      // return '_k($event.keyCode,"right",39,$event.key,["Right","ArrowRight"])'
      "_k($event.keyCode," +
      (JSON.stringify(key)) + "," +
      (JSON.stringify(keyCode)) + "," +
      "$event.key," +
      "" + (JSON.stringify(keyName)) +
      ")"
    )
  }

  // 在执行genDirectives时添加wrapListeners
  // e.g: <div v-on="{click: handlerClick, mouseenter: handlerMouseEnter}">hello world!</div>
  function on (el, dir) {
    if (dir.modifiers) {
      warn("v-on without argument does not support modifiers.");
    }
    el.wrapListeners = function (code) { return ("_g(" + code + "," + (dir.value) + ")"); };
  }

  // 在执行genDirectives时添加wrapData
  // e.g: <div v-bind="{name: 'fanqiewa', age: 18}">hello world!</div>
  function bind$1 (el, dir) {
    el.wrapData = function (code) {
      return ("_b(" + code + ",'" + (el.tag) + "'," + (dir.value) + "," + (dir.modifiers && dir.modifiers.prop ? 'true' : 'false') + (dir.modifiers && dir.modifiers.sync ? ',true' : '') + ")")
    };
  }

  // 内置指令v-on、v-bind、v-cloak
  var baseDirectives = {
    on: on,
    bind: bind$1,
    cloak: noop
  };

  // 代码生成state(状态)
  var CodegenState = function CodegenState (options) {
    this.options = options;
    this.warn = options.warn || baseWarn;
    this.transforms = pluckModuleFunction(options.modules, 'transformCode');
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData');
    // 合并v-mode、v-text、v-html | v-on、v-bind、v-cloak | 程序员自定义的命令
    this.directives = extend(extend({}, baseDirectives), options.directives);
    var isReservedTag = options.isReservedTag || no;
    this.maybeComponent = function (el) { return !!el.component || !isReservedTag(el.tag); };
    this.onceId = 0;
    this.staticRenderFns = [];
    this.pre = false;
  };

  /**
   * 生成器，返回render和staticRenderFns
   * @param {*} ast AST
   * @param {*} options options 
   */
  function generate (ast, options) {
    var state = new CodegenState(options);
    var code = ast ? genElement(ast, state) : '_c("div")';
    return {
      render: ("with(this){return " + code + "}"),
      staticRenderFns: state.staticRenderFns
    }
  }

  /**
   * gen => generator生成器
   * 生成element
   */
  function genElement (el, state) {
    if (el.parent) {
      el.pre = el.pre || el.parent.pre;
    }

    if (el.staticRoot && !el.staticProcessed) {
      return genStatic(el, state)
    } else if (el.once && !el.onceProcessed) {
      return genOnce(el, state)
    } else if (el.for && !el.forProcessed) {
      return genFor(el, state)
    } else if (el.if && !el.ifProcessed) {
      return genIf(el, state)
    } else if (el.tag === 'template' && !el.slotTarget && !state.pre) {
      return genChildren(el, state) || 'void 0'
    } else if (el.tag === 'slot') {
      return genSlot(el, state)
    } else {
      // component or element
      var code;
      if (el.component) {
        code = genComponent(el.component, el, state);
      } else {
        var data;
        if (!el.plain || (el.pre && state.maybeComponent(el))) {
          data = genData$2(el, state);
        }

        var children = el.inlineTemplate ? null : genChildren(el, state, true);
        code = "_c('" + (el.tag) + "'" + (data ? ("," + data) : '') + (children ? ("," + children) : '') + ")";
      }
      // 使用transform函数
      for (var i = 0; i < state.transforms.length; i++) {
        code = state.transforms[i](el, code);
      }
      return code
    }
  }

  /**
   * gen => generator生成器
   * 生成静态节点渲染树
   */
  function genStatic (el, state) {
    el.staticProcessed = true; // 将当前el标记为已经经过处理后的静态节点
    var originalPreState = state.pre;
    if (el.pre) {
      state.pre = el.pre;
    }
    // 将渲染静态节点函数添加到staticRenderFns数组中，renderStatic时根据索引执行
    state.staticRenderFns.push(("with(this){return " + (genElement(el, state)) + "}"));
    // 重置pre
    state.pre = originalPreState;
    // e.g. _m(0) 即，只有一个静态节点树
    return ("_m(" + (state.staticRenderFns.length - 1) + (el.staticInFor ? ',true' : '') + ")")
  }

  /**
   * gen => generator生成器
   * 生成v-if
   */
  function genOnce (el, state) {
    el.onceProcessed = true;
    if (el.if && !el.ifProcessed) {
      return genIf(el, state)
    } else if (el.staticInFor) {
      /*
        <div v-for="(item, index) in list" :key="index">
          <div v-once>hello world!</div>
        </div>
      */
      var key = '';
      var parent = el.parent;
      while (parent) {
        if (parent.for) {
          key = parent.key;
          break
        }
        parent = parent.parent;
      }
      if (!key) {
        state.warn(
          "v-once can only be used inside v-for that is keyed. ",
          el.rawAttrsMap['v-once']
        );
        return genElement(el, state)
      }
      return ("_o(" + (genElement(el, state)) + "," + (state.onceId++) + "," + key + ")")
    } else {
      // e.g: <div v-once>hello world!</div>
      return genStatic(el, state)
    }
  }

  /**
   * gen => generator生成器
   * 生成v-if
   */
  function genIf (el, state, altGen, altEmpty) {
    el.ifProcessed = true; // avoid recursion
    return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
  }

  /**
   * gen => generator生成器
   * 生成v-if、v-else、v-else-if
   */
  function genIfConditions (conditions, state, altGen, altEmpty) {
    if (!conditions.length) {
      return altEmpty || '_e()'
    }

    var condition = conditions.shift();
    if (condition.exp) {
      // e.g: v-if、v-else-if
      return ("(" + (condition.exp) + ")?" + (genTernaryExp(condition.block)) + ":" + (genIfConditions(conditions, state, altGen, altEmpty)))
    } else {
      // e.g: v-else
      return ("" + (genTernaryExp(condition.block)))
    }

    // 处理子元素
    function genTernaryExp (el) {
      return altGen
        ? altGen(el, state)
        : el.once
          ? genOnce(el, state)
          : genElement(el, state)
    }
  }

  /**
   * gen => generator生成器
   * 生成v-for
   */
  function genFor (el, state, altGen, altHelper) {
    var exp = el.for;
    // v-for="item in list"中的item
    var alias = el.alias;
    // v-for="(item, index) in list"中的",index"
    // v-for="(val, name, index) in list"中的",name"
    var iterator1 = el.iterator1 ? ("," + (el.iterator1)) : '';
    // v-for="(item, index) in list"中的""
    // v-for="(val, name, index) in list"中的",index"
    var iterator2 = el.iterator2 ? ("," + (el.iterator2)) : '';

    // 如果是组件，并且是<slot> <template>标签，且没有key时，会打印警告
    if (state.maybeComponent(el) &&
      el.tag !== 'slot' &&
      el.tag !== 'template' &&
      !el.key
    ) {
      state.warn(
        "<" + (el.tag) + " v-for=\"" + alias + " in " + exp + "\">: component lists rendered with " +
        "v-for should have explicit keys. " +
        "See https://vuejs.org/guide/list.html#key for more info.",
        el.rawAttrsMap['v-for'],
        true /* tip */
      );
    }

    el.forProcessed = true; // 避免递归
    // e.g: '_l((list),function(item){return _c('div',[_v("fanqiewa")])})'
    return (altHelper || '_l') + "((" + exp + ")," +
      "function(" + alias + iterator1 + iterator2 + "){" +
        // 生成Element
        "return " + ((altGen || genElement)(el, state)) +
      '})'
  }

  /**
   * gen => generator生成器
   * 生成data
   */
  function genData$2 (el, state) {
    var data = '{';

    var dirs = genDirectives(el, state);
    if (dirs) { data += dirs + ','; }

    // :key
    if (el.key) {
      data += "key:" + (el.key) + ",";
    }
    // :ref
    if (el.ref) {
      data += "ref:" + (el.ref) + ",";
    }

    /*
      e.g:
      <div ref="app" v-for="item in list"></div>
    */
    if (el.refInFor) {
      data += "refInFor:true,";
    }
    // v-pre
    if (el.pre) {
      data += "pre:true,";
    }
    // is="component"
    if (el.component) {
      data += "tag:\"" + (el.tag) + "\",";
    }
    for (var i = 0; i < state.dataGenFns.length; i++) {
      /*
        genData =>
          处理class和:class
        genData$1 =>
          处理style和:style
      */
      data += state.dataGenFns[i](el);
    }
    // attributes属性，定义在html标签上的attrs、
    if (el.attrs) {
      data += "attrs:" + (genProps(el.attrs)) + ",";
    }
    // e.g: v-html | 动态绑定的属性
    if (el.props) {
      data += "domProps:" + (genProps(el.props)) + ",";
    }
    // e.g: v-on:click
    if (el.events) {
      data += (genHandlers(el.events, false)) + ",";
    }
    // e.g: v-on:click.native
    if (el.nativeEvents) {
      data += (genHandlers(el.nativeEvents, true)) + ",";
    }
    // e.g: <div slot="header"></div>
    // 只为没有作用域插槽使用
    if (el.slotTarget && !el.slotScope) {
      data += "slot:" + (el.slotTarget) + ",";
    }
    // e.g: <template v-slot="hedder"></template> => <template v-slot:default="header"></template>
    // <template v-slot="slotProps"></template>
    // 作用域插槽
    if (el.scopedSlots) {
      data += (genScopedSlots(el, el.scopedSlots, state)) + ",";
    }
    // 在组件上使用v-model
    if (el.model) {
      data += "model:{value:" + (el.model.value) + ",callback:" + (el.model.callback) + ",expression:" + (el.model.expression) + "},";
    }
    // 内联模板
    if (el.inlineTemplate) {
      var inlineTemplate = genInlineTemplate(el, state);
      if (inlineTemplate) {
        data += inlineTemplate + ",";
      }
    }
    data = data.replace(/,$/, '') + '}';

    // e.g: <div v-bind:[name]="realName">
    if (el.dynamicAttrs) {
      data = "_b(" + data + ",\"" + (el.tag) + "\"," + (genProps(el.dynamicAttrs)) + ")";
    }
    /*
      绑定attribute
      e.g:
      <div v-bind="{name: 'fanqiewa', age: 18}">hello world!</div>
      <div v-bind="[{name: 'fanqiewa', age: 18}, {height: 180}]">hello world!</div>
    */
    if (el.wrapData) {
      data = el.wrapData(data);
    }
    /*
      一次绑定多个on
      e.g:
      <div v-on="{click: handlerClick, mouseenter: handlerMouseEnter}">hello world!</div>
    */
    if (el.wrapListeners) {
      data = el.wrapListeners(data);
    }
    return data
  }

  /**
   * gen => generator生成器
   * 生成指令
   */
  function genDirectives (el, state) {
    var dirs = el.directives; // 定义在标签上的指令(e.g: v-show)
    if (!dirs) { return }
    var res = 'directives:[';
    var hasRuntime = false;
    var i, l, dir, needRuntime;
    for (i = 0, l = dirs.length; i < l; i++) {
      dir = dirs[i];
      needRuntime = true;
      var gen = state.directives[dir.name];
      if (gen) {
        /*
          model: model,
          text: text,
          html: html
        */
        needRuntime = !!gen(el, dir, state.warn);
      }
      if (needRuntime) {
        hasRuntime = true;
        res += "{name:\"" + (dir.name) + "\",rawName:\"" + (dir.rawName) + "\"" + (dir.value ? (",value:(" + (dir.value) + "),expression:" + (JSON.stringify(dir.value))) : '') + (dir.arg ? (",arg:" + (dir.isDynamicArg ? dir.arg : ("\"" + (dir.arg) + "\""))) : '') + (dir.modifiers ? (",modifiers:" + (JSON.stringify(dir.modifiers))) : '') + "},";
      }
    }
    if (hasRuntime) {
      return res.slice(0, -1) + ']'
    }
  }

  /*
    gen => generator生成器
    生成内联模板(内联模板不会把子组件的内容分发渲染到父组件中，而是需要在父组件中实现其渲染内容)
    e.g: 
    <container inline-template>
      <div>Hello App!</div>
    </container>
    Vue.component("container", {
      data: function () {
        return {
          name: "fanqiewa"
        }
      },
      template: `<div>
        {{name}}
        </div>`
    })
   */
  function genInlineTemplate (el, state) {
    var ast = el.children[0];
    if (el.children.length !== 1 || ast.type !== 1) {
      state.warn(
        'Inline-template components must have exactly one child element.',
        { start: el.start }
      );
    }
    if (ast && ast.type === 1) {
      var inlineRenderFns = generate(ast, state.options);
      return ("inlineTemplate:{render:function(){" + (inlineRenderFns.render) + "},staticRenderFns:[" + (inlineRenderFns.staticRenderFns.map(function (code) { return ("function(){" + code + "}"); }).join(',')) + "]}")
    }
  }

  /**
   * gen => generator生成器
   * 生成作用域插槽
   */
  function genScopedSlots (el, slots, state) {
    // 是否需要强制更新 动态的name | if | for
    var needsForceUpdate = el.for || Object.keys(slots).some(function (key) {
      
      var slot = slots[key];
      return (
        slot.slotTargetDynamic || /* 动态的 e.g: <template v-slot:[name]="slotProps"></template> */
        slot.if ||
        slot.for ||
        containsSlotChild(slot) // is passing down slot from parent which may be dynamic
      )
    });

    var needsKey = !!el.if;

    if (!needsForceUpdate) {
      var parent = el.parent; // 父元素
      while (parent) {
        if (
          // 父元素有作用域插槽且slotScope !== "_empty_"
          (parent.slotScope && parent.slotScope !== emptySlotScopeToken) ||
          parent.for // 如果元素有v-for
        ) {
          needsForceUpdate = true;
          break
        }
        if (parent.if) {
          needsKey = true;
        }
        parent = parent.parent;
      }
    }

    var generatedSlots = Object.keys(slots)
      .map(function (key) { return genScopedSlot(slots[key], state); })
      .join(',');

    // e.g: return
    // 1、<template v-slot></template>
    //  'scopedSlots:_u([{key:"default",fn:function(slotProps){return undefined},proxy:true}])'
    // 2、<div v-if="true"><template v-slot="slotProps"></template></div>
    //  'scopedSlots:_u([{key:"default",fn:function(slotProps){return undefined}}],null,false,42618770)'
    return ("scopedSlots:_u([" + generatedSlots + "]" + (needsForceUpdate ? ",null,true" : "") + (!needsForceUpdate && needsKey ? (",null,false," + (hash(generatedSlots))) : "") + ")")
  }

  function hash(str) {
    var hash = 5381;
    var i = str.length;
    while(i) {
      // e.g: hash = 5381   i = 56    str = '{key:"default",fn:function(slotProps){return undefined}}'
      // 5381 * 33 ^ 125(str.charCodeAt(55)) = 177624
      hash = (hash * 33) ^ str.charCodeAt(--i);
    }
    return hash >>> 0
  }

  // 判断是否包含子slot
  function containsSlotChild (el) {
    if (el.type === 1 /* element */) {
      if (el.tag === 'slot' /* 标签为slt */) {
        return true
      }
      return el.children.some(containsSlotChild) // 遍历children
    }
    return false
  }

  /**
   * gen => generator生成器
   * 生成作用域插槽
   */
  function genScopedSlot (el, state) {
    // 是否是legacy模式语法
    var isLegacySyntax = el.attrsMap['slot-scope'];
    // ifProcessed标识是否已经genIf生成过了
    if (el.if && !el.ifProcessed && !isLegacySyntax) {
      return genIf(el, state, genScopedSlot, "null")
    }
    // forProcessed标识是否已经genFor生成过了
    if (el.for && !el.forProcessed) {
      return genFor(el, state, genScopedSlot)
    }
    var slotScope = el.slotScope === emptySlotScopeToken
      ? ""
      : String(el.slotScope);
    var fn = "function(" + slotScope + "){" +
      "return " + (el.tag === 'template'
        ? el.if && isLegacySyntax
          ? ("(" + (el.if) + ")?" + (genChildren(el, state) || 'undefined') + ":undefined")
          : genChildren(el, state) || 'undefined'
        : genElement(el, state)) + "}";
    // 反向代理
    var reverseProxy = slotScope ? "" : ",proxy:true";
    // e.g: return '{key:"default",fn:function(){return undefined},proxy:true}'
    return ("{key:" + (el.slotTarget || "\"default\"") + ",fn:" + fn + reverseProxy + "}")
  }

  /**
   * gen => generator生成器
   * 生成Children
   */
  function genChildren (el, state, checkSkip, altGenElement, altGenNode) {
    var children = el.children;
    if (children.length) {
      var el$1 = children[0];
      // 只有一个孩子节点时，且不是<template> <slot>标签，且含有v-for指令
      if (children.length === 1 &&
        el$1.for &&
        el$1.tag !== 'template' &&
        el$1.tag !== 'slot'
      ) {
        var normalizationType = checkSkip
          ? state.maybeComponent(el$1) ? ",1" : ",0"
          : "";
        // 生成Element
        return ("" + ((altGenElement || genElement)(el$1, state)) + normalizationType)
      }
      // 优化v-for 
      var normalizationType$1 = checkSkip
        ? getNormalizationType(children, state.maybeComponent)
        : 0;
      var gen = altGenNode || genNode;
      // e.g: '[_c('div',[_v("fanqiewa")])]'
      return ("[" + (children.map(function (c) { return gen(c, state); }).join(',')) + "]" + (normalizationType$1 ? ("," + normalizationType$1) : ''))
    }
  }

  // 确定子数组所需的规范化
  // 0: 不需要规范化
  // 1: 需要简单规范化（可能是1级深层嵌套数组）
  // 2: 需要完全规范化
  function getNormalizationType (children, maybeComponent) {
    var res = 0;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      if (el.type !== 1) {
        continue
      }
      if (needsNormalization(el) ||
          (el.ifConditions && el.ifConditions.some(function (c) { return needsNormalization(c.block); }))) {
        res = 2;
        break
      }
      if (maybeComponent(el) ||
          (el.ifConditions && el.ifConditions.some(function (c) { return maybeComponent(c.block); }))) {
        res = 1;
      }
    }
    return res
  }

  // 需要规范化的el
  function needsNormalization (el) {
    return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
  }

  /**
   * gen => generator生成器
   * 生成Node
   */
  function genNode (node, state) {
    if (node.type === 1) {
      return genElement(node, state)
    } else if (node.type === 3 && node.isComment) {
      return genComment(node)
    } else {
      return genText(node)
    }
  }

  /**
   * gen => generator生成器
   * 生成文本
   */
  function genText (text) {
    return ("_v(" + (text.type === 2
      ? text.expression 
      : transformSpecialNewlines(JSON.stringify(text.text))) + ")")
  }

  /**
   * gen => generator生成器
   * 生成注释
   */
  function genComment (comment) {
    return ("_e(" + (JSON.stringify(comment.text)) + ")")
  }

  /**
   * gen => generator生成器
   * 生成插槽 <slot></slot>
   */
  function genSlot (el, state) {
    var slotName = el.slotName || '"default"';
    var children = genChildren(el, state);
    var res = "_t(" + slotName + (children ? ("," + children) : '');
    var attrs = el.attrs || el.dynamicAttrs
      ? genProps((el.attrs || []).concat(el.dynamicAttrs || []).map(function (attr) { return ({
          // 作用域插槽
          name: camelize(attr.name),
          value: attr.value,
          dynamic: attr.dynamic
        }); }))
      : null;
    var bind$$1 = el.attrsMap['v-bind'];
    if ((attrs || bind$$1) && !children) {
      res += ",null";
    }
    if (attrs) {
      // <slot name="header" v-bind:user="user"></slot>
      // e.g: '_t("header",null,{"user":user})'
      res += "," + attrs;
    }
    if (bind$$1) {
      // <slot name="header" v-bind="default"></slot>
      // e.g: '_t("header",null,null,default)'
      res += (attrs ? '' : ',null') + "," + bind$$1;
    }
    return res + ')'
  }

  /**
   * 
   * gen => generator生成器
   * 生成组件
   */
  function genComponent (componentName, el, state) {
    var children = el.inlineTemplate ? null : genChildren(el, state, true);
    return ("_c(" + componentName + "," + (genData$2(el, state)) + (children ? ("," + children) : '') + ")")
  }

  /**
   * gen => generator生成器
   * 生成props
   */
  function genProps (props) {
    var staticProps = ""; // 静态的props
    var dynamicProps = ""; // 动态的props
    for (var i = 0; i < props.length; i++) {
      var prop = props[i];
      var value = transformSpecialNewlines(prop.value);
      if (prop.dynamic) {
        dynamicProps += (prop.name) + "," + value + ",";
      } else {
        staticProps += "\"" + (prop.name) + "\":" + value + ",";
      }
    }
    // e.g: '{"id":"app"}'
    staticProps = "{" + (staticProps.slice(0, -1)) + "}";
    if (dynamicProps) {
      return ("_d(" + staticProps + ",[" + (dynamicProps.slice(0, -1)) + "])")
    } else {
      return staticProps
    }
  }

  // \u2028     行分隔符    行结束符
  // \u2029     段落分隔符   行结束符
  // 这个编码为2028的字符为行分隔符，会被浏览器理解为换行，
  // 而在Javascript的字符串表达式中是不允许换行的，从而导致错误。
  function transformSpecialNewlines (text) {
    return text
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')
  }

  // 这些关键字不应该出现在表达式内部，但允许使用typeof、instanceof和in等运算符
  var prohibitedKeywordRE = new RegExp('\\b' + (
    'do,if,for,let,new,try,var,case,else,with,await,break,catch,class,const,' +
    'super,throw,while,yield,delete,export,import,return,switch,default,' +
    'extends,finally,continue,debugger,function,arguments'
  ).split(',').join('\\b|\\b') + '\\b');
  
  // \b 元字符匹配单词边界。
  // 这些一元运算符不应用作属性/方法名 /\bdelete\s*\([^\)]*\)    |    \btypeof\s*\([^\)]*\)    |    \bvoid\s*\([^\)]*\)/
  var unaryOperatorsRE = new RegExp('\\b' + (
    'delete,typeof,void'
  ).split(',').join('\\s*\\([^\\)]*\\)|\\b') + '\\s*\\([^\\)]*\\)');
  
  // 清除字符串 /'(?:[^'\\] | \\.)*'    |    "(?:[^"\\] | \\.)*"    |    `(?:[^`\\]  |\\.)*\$\{  | \}(?:[^`\\] | \\.)*`    |    `(?:[^`\\] | \\.)*`    /g;
  /*
    e.g: 
    "`${getName}`".match(stripStringRE) => ["`${", "}`"]
    "`${getName}`".replace(stripStringRE, '') => "getName"
  */
  var stripStringRE = /'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*\$\{|\}(?:[^`\\]|\\.)*`|`(?:[^`\\]|\\.)*`/g;

  /**
   * 在模板中检测有问题的表达式
   */
  function detectErrors (ast, warn) {
    if (ast) {
      checkNode(ast, warn);
    }
  }

  /**
   * 检查Node
   */
  function checkNode (node, warn) {
    if (node.type === 1 /* ELEMENT */) {
      for (var name in node.attrsMap) {
        // dirRE => 匹配 v- | @ | :
        if (dirRE.test(name)) {
          var value = node.attrsMap[name];
          if (value) {
            var range = node.rawAttrsMap[name];
            if (name === 'v-for') {
              // e.g: checkFor(node, 'v-for="(item, index) in list"', warn, { end: 45, name: 'v-for', value: 'item in 2' })
              checkFor(node, ("v-for=\"" + value + "\""), warn, range);
            } else if (onRE.test(name)/* 匹配@ | v-on */) {
              // e.g: checkEvent('getData', '@click="getData", warn, { end: 44, name: '@click', start: 28, value: 'getData' })
              checkEvent(value, (name + "=\"" + value + "\""), warn, range);
            } else {
              checkExpression(value, (name + "=\"" + value + "\""), warn, range);
            }
          }
        }
      }
      // 检查children
      if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
          checkNode(node.children[i], warn);
        }
      }
    } else if (node.type === 2) {
      checkExpression(node.expression, node.text, warn, node);
    }
  }

  /**
   * 检查Event
   */
  function checkEvent (exp, text, warn, range) {
    var stipped = exp.replace(stripStringRE, '');
    var keywordMatch = stipped.match(unaryOperatorsRE);
    if (keywordMatch && stipped.charAt(keywordMatch.index - 1) !== '$') {
      warn(
        "avoid using JavaScript unary operator as property name: " +
        "\"" + (keywordMatch[0]) + "\" in expression " + (text.trim()),
        range
      );
    }
    checkExpression(exp, text, warn, range);
  }

  /**
   * 检查For
   */
  function checkFor (node, text, warn, range) {
    // e.g: checkExpression('list', 'v-for="(item, index) in list"', warn, range)
    checkExpression(node.for || '', text, warn, range);
    // e.g: checkIdentifier('item', 'v-for alias', warn, range)
    checkIdentifier(node.alias, 'v-for alias', text, warn, range);
    // e.g: checkIdentifier('index', 'v-for iterator', warn, range)
    checkIdentifier(node.iterator1, 'v-for iterator', text, warn, range);
    checkIdentifier(node.iterator2, 'v-for iterator', text, warn, range);
  }

  /**
   * 检查标识符
   */
  function checkIdentifier (ident, type, text, warn, range) {
    if (typeof ident === 'string') {
      try {
        new Function(("var " + ident + "=_"));
      } catch (e) {
        warn(("invalid " + type + " \"" + ident + "\" in expression: " + (text.trim())), range);
      }
    }
  }

  /**
   * 检查表达式
   */
  function checkExpression (exp, text, warn, range) {
    try {
      new Function(("return " + exp));
    } catch (e) {
      var keywordMatch = exp.replace(stripStringRE, '').match(prohibitedKeywordRE);
      // 关键字
      if (keywordMatch) {
        warn(
          "avoid using JavaScript keyword as property name: " +
          "\"" + (keywordMatch[0]) + "\"\n  Raw expression: " + (text.trim()),
          range
        );
      } else {
        warn(
          "invalid expression: " + (e.message) + " in\n\n" +
          "    " + exp + "\n\n" +
          "  Raw expression: " + (text.trim()) + "\n",
          range
        );
      }
    }
  }

  var range = 2;
  /**
   * 生成报错html位置 TODO
   */
  function generateCodeFrame (source, start, end) {
    if ( start === void 0 ) start = 0;
    if ( end === void 0 ) end = source.length;

    var lines = source.split(/\r?\n/);
    var count = 0;
    var res = [];
    for (var i = 0; i < lines.length; i++) {
      count += lines[i].length + 1;
      if (count >= start) {
        for (var j = i - range; j <= i + range || end > count; j++) {
          if (j < 0 || j >= lines.length) { continue }
          res.push(("" + (j + 1) + (repeat$1(" ", 3 - String(j + 1).length)) + "|  " + (lines[j])));
          var lineLength = lines[j].length;
          if (j === i) {
            // push underline
            var pad = start - (count - lineLength) + 1;
            var length = end > count ? lineLength - pad : end - start;
            res.push("   |  " + repeat$1(" ", pad) + repeat$1("^", length));
          } else if (j > i) {
            if (end > count) {
              var length$1 = Math.min(end - count, lineLength);
              res.push("   |  " + repeat$1("^", length$1));
            }
            count += lineLength + 1;
          }
        }
        break
      }
    }
    return res.join('\n')
  }

  /**
   * 生成重复字符串
   */
  function repeat$1 (str, n) {
    var result = '';
    if (n > 0) {
      while (true) { 
        if (n & 1) { result += str; }
        n >>>= 1;
        if (n <= 0) { break }
        str += str;
      }
    }
    return result
  }

  /**
   * 根据代码创建函数
   */
  function createFunction (code, errors) {
    try {
      return new Function(code)
    } catch (err) {
      errors.push({ err: err, code: code });
      return noop
    }
  }

  /**
   * 创建编译函数
   * @param {Function} compile 
   */
  function createCompileToFunctionFn (compile) {
    var cache = Object.create(null);

    return function compileToFunctions (template, options, vm) {
      options = extend({}, options);
      var warn$$1 = options.warn || warn;
      delete options.warn;
      {
        try {
          new Function('return 1');
        } catch (e) {
          if (e.toString().match(/unsafe-eval|CSP/)) {
            warn$$1(
              'It seems you are using the standalone build of Vue.js in an ' +
              'environment with Content Security Policy that prohibits unsafe-eval. ' +
              'The template compiler cannot work in this environment. Consider ' +
              'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
              'templates into render functions.'
            );
          }
        }
      }

      var key = options.delimiters
        ? String(options.delimiters) + template
        : template;
      if (cache[key]) {
        return cache[key]
      }

      var compiled = compile(template, options);

      // 检查编译错误/提示
      {
        if (compiled.errors && compiled.errors.length) {
          if (options.outputSourceRange) {
            compiled.errors.forEach(function (e) {
              warn$$1(
                "Error compiling template:\n\n" + (e.msg) + "\n\n" +
                generateCodeFrame(template, e.start, e.end),
                vm
              );
            });
          } else {
            warn$$1(
              "Error compiling template:\n\n" + template + "\n\n" +
              compiled.errors.map(function (e) { return ("- " + e); }).join('\n') + '\n',
              vm
            );
          }
        }
        if (compiled.tips && compiled.tips.length) {
          if (options.outputSourceRange) {
            compiled.tips.forEach(function (e) { return tip(e.msg, vm); });
          } else {
            compiled.tips.forEach(function (msg) { return tip(msg, vm); });
          }
        }
      }

      // 返回结果集
      var res = {};
      // 存放错误日志的数组
      var fnGenErrors = [];
      // 把代码转换成函数（这里的compiled.render还只是一串字符串'with(this){return " + code + "}"')
      res.render = createFunction(compiled.render, fnGenErrors);
      res.staticRenderFns = compiled.staticRenderFns.map(function (code) {
        return createFunction(code, fnGenErrors)
      });

      // 检查函数生成错误。也就是createFunction转换成函数时发生的错误
      // 只有当编译器本身存在错误时才会发生这种情况。
      {
        if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
          warn$$1(
            "Failed to generate render function:\n\n" +
            fnGenErrors.map(function (ref) {
              var err = ref.err;
              var code = ref.code;

              return ((err.toString()) + " in\n\n" + code + "\n");
          }).join('\n'),
            vm
          );
        }
      }

      return (cache[key] = res)
    }
  }

  /**
   * 创建编译器生成器
   * 把字符串转化成真正的js函数
   * 函数科里化，创建一个对象，并且把字符串转换成 对象函数方式存在在对象中，导出去匿名函数
   * @param {Function} baseCompile 基本编译函数
   * @returns {Function} 返回一个函数
   */
  function createCompilerCreator (baseCompile) {
    // 返回一个创建编译器函数
    return function createCompiler (baseOptions) {
      function compile (template, options) {
        // finalOptions为最终合并后的options
        var finalOptions = Object.create(baseOptions);
        var errors = [];
        var tips = [];

        var warn = function (msg, range, tip) {
          (tip ? tips : errors).push(msg);
          // e.g: errors: ['tag <div> has no matching end tag.']
        };

        if (options) {
          if (options.outputSourceRange) {
            // 获取模板中空格开始的数量
            var leadingSpaceLength = template.match(/^\s*/)[0].length;

            // Vue内部自己使用compile传递的outputSourceRange为false
            // 程序员使用Vue.compile时，第一个参数为template，第二个参数为options，第三个参数为vm
            warn = function (msg, range, tip) {
              var data = { msg: msg };
              if (range) {
                if (range.start != null) {
                  data.start = range.start + leadingSpaceLength;
                }
                if (range.end != null) {
                  data.end = range.end + leadingSpaceLength;
                }
              }
              (tip ? tips : errors).push(data);
            };
            // e.g:
            // errors: [{
            //     end: 5,
            //     msg: 'tag <div> has no matching end tag.',
            //     start: 0
            // }]
          }
          // 合并自定义modules
          if (options.modules) {
            finalOptions.modules =
              (baseOptions.modules || []).concat(options.modules);
          }
          // 合并自定义directives
          if (options.directives) {
            finalOptions.directives = extend(
              Object.create(baseOptions.directives || null),
              options.directives
            );
          }
          // 复制其他options
          for (var key in options) {
            if (key !== 'modules' && key !== 'directives') {
              finalOptions[key] = options[key];
            }
          }
        }

        finalOptions.warn = warn;

        var compiled = baseCompile(template.trim(), finalOptions);
        {
          detectErrors(compiled.ast, warn);
        }
        compiled.errors = errors;
        compiled.tips = tips;
        return compiled
      }

      return {
        compile: compile,
        compileToFunctions: createCompileToFunctionFn(compile)
      }
    }
  }

  // 编译器创建的创造者
  // createCompilerCreator返回一个函数（创建编译器）
  // baseCompile将被存放于闭包中
  // baseCompile主要作用： 生成ast语法树，通过ast语法树生成render树，还有一个静态render函数组
  var createCompiler = createCompilerCreator(function baseCompile (template, options) {
    // 将HTML字符串转换为AST
    var ast = parse(template.trim(), options);
    // undefined !== false => true
    if (options.optimize !== false) {
      // 优化ast
      // optimize的主要作用是标记static静态节点，
      // 循环递归虚拟node，标记是不是静态节点
      // 根据node.static或者 node.once 标记staticRoot的状态
      optimize(ast, options);
    }
    // generate生成with执行代码(with改变作用域)
    var code = generate(ast, options);
    return {
      ast: ast,
      render: code.render,
      staticRenderFns: code.staticRenderFns
    }
  });

  var ref$1 = createCompiler(baseOptions);
  var compile = ref$1.compile;
  var compileToFunctions = ref$1.compileToFunctions;

  // 检查当前浏览器是否在属性值内编码字符
  var div;
  function getShouldDecode (href) {
    div = div || document.createElement('div');
    div.innerHTML = href ? "<a href=\"\n\"/>" : "<div a=\"\n\"/>";
    // '&#10;'为换行符
    /*
      e.g:
      IE: <div a="&#10;"></div> <a href="&#10;"></a>
      chrome: <div a="
              "></div>
              <a href="
              "></a>
    */
    return div.innerHTML.indexOf('&#10;') > 0
  }

  // IE在属性值内编码会换行，而其他浏览器则不会
  var shouldDecodeNewlines = inBrowser ? getShouldDecode(false) : false;
  var shouldDecodeNewlinesForHref = inBrowser ? getShouldDecode(true) : false;

  // 将id转成模板（HTML）
  var idToTemplate = cached(function (id) {
    var el = query(id);
    return el && el.innerHTML
  });

  // 缓存上一次的Vue.prototype.$mount
  var mount = Vue.prototype.$mount;
  Vue.prototype.$mount = function (el, hydrating) {
    el = el && query(el);
    if (el === document.body || el === document.documentElement) {
      warn(
        "Do not mount Vue to <html> or <body> - mount to normal elements instead."
      );
      return this
    }

    var options = this.$options;
    // resolve template/el and convert to render function
    if (!options.render) {
      var template = options.template;
      if (template) {
        if (typeof template === 'string') {
          // 如果是已#开头的字符串，那么会查找这个ID的DOM元素的innerHTml
          // 作为模板
          if (template.charAt(0) === '#') {
            template = idToTemplate(template);
            if (!template) {
              warn(
                ("Template element not found or is empty: " + (options.template)),
                this
              );
            }
          }
        } else if (template.nodeType) { // 真实的dom元素
          template = template.innerHTML;
        } else {
          {
            warn('invalid template option:' + template, this);
          }
          return this
        }
      } else if (el) {
        template = getOuterHTML(el);
      }
      if (template) {
        if (config.performance && mark) {
          mark('compile');
        }
        /**
         * ref = {
         *  render: fn,
         *  staticRenderFns: fn
         * }
         */
        //创建模板（重点入口）
        // 第一个参数为要编译的模板，第二个参数为options
        // Vue.compile时，不用传第二个参数
        var ref = compileToFunctions(template, {
          outputSourceRange: "development" !== 'production',
          // flase // IE在属性值中编码换行，而其他浏览器则不会
          shouldDecodeNewlines: shouldDecodeNewlines,
          // true chrome在a[href]中编码内容
          shouldDecodeNewlinesForHref: shouldDecodeNewlinesForHref,
          // 改变纯文本插入分隔符。修改指令的书写风格，比如默认是{{mgs}}  delimiters: ['${', '}']之后变成这样 ${mgs}
          delimiters: options.delimiters,
          // 当设为 true 时，将会保留且渲染模板中的 HTML 注释。默认行为是舍弃它们。
          comments: options.comments 
          // 如果传mudules的话，会和baseOptions合并
        }, this);
        var render = ref.render;
        var staticRenderFns = ref.staticRenderFns;
        options.render = render;
        options.staticRenderFns = staticRenderFns;

        if (config.performance && mark) {
          mark('compile end');
          measure(("vue " + (this._name) + " compile"), 'compile', 'compile end');
        }
      }
    }
    return mount.call(this, el, hydrating)
  };

  /**
   * 获取 dom的html 
   * el.outerHTML  输出当前标签的本身和标签内的文本内容
   * 如果有子标签，那么子标签本身和标签内的文本内容也将一起输出
   */
  function getOuterHTML (el) {
    if (el.outerHTML) {
      return el.outerHTML
    } else {
      var container = document.createElement('div');
      container.appendChild(el.cloneNode(true));
      return container.innerHTML
    }
  }

  /*************************************************************/

  Vue.compile = compileToFunctions;

  return Vue;

}));
