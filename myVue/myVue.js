/*
 * Vue.js v2.6.10
 */
(function (global, factory) {
    /**
     * define是AMD模块定义的方法
     * 表示遵循AMD规范
     */
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define == 'function' && define.amd ? define(factory) :
    (global = global || self, global.Vue = factory()); //不懂这self哪来的...
}(this, function () {
    'use strict'; //使用严格模式

    /**
     * Vue构造函数
     */
    function Vue(options) {
        //必须使用new关键字来创建对象，因为Vue是一个构造器
        if (!(this instanceof Vue)) {
            //警告
            warn('Vue is a constructor and should be called with the `new` keyword'); //warn方法没找到
        }
        this._init(options); //执行Vue.prototype上的_init方法，完成初始化
    }

    initMixin(Vue);

    Vue.version = '2.6.10';

    var inBrowser = typeof window !== 'undefined'; //是否是浏览器环境

    /*  */
    var config = ({
        /**
         * 是否开启浏览器性能监控
         */
        performance: false,
        
        /**
         * 一个没有原型的对象
         */
        optionsMergeStrategies: Object.create(null),
    }) 

    var mark; //mark方法用来自定义添加标记时间
    var measure; //在浏览器的指定 start mark 和 end mark 间的性能输入缓冲区中创建一个指定名称的时间戳
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
                perf.clearMeasures(startTag);
                perf.clearMeasures(endTag);
                perf.clearMeasures(name);
            }
        }
    }
    
    /*************************************************************/

    var strats = config.options.optionsMergeStrategies;
    // 资产类型
    var ASSET_TYPES = [
        "component", //组件
        "directive", //自定义指令
        "filter", //过滤器
    ]

    //为资产分配处理函数
    ASSET_TYPES.forEach(function (type) {
        strats[type + "s"] = mergeAssets;
    })
    
    function mergeAssets() {

    }

    /*************************************************************/
    var warn = noop;

    /**
     * @param {Function} Vue
     * 初始化全局api 
     */
    function initGlobalAPI(Vue) {
        //config
        var configDef = {};
        configDef.get = function() { return config; };
        {
            configDef.set = function() {
                warn(
                    "Do not replace the Vue.config object, set individual fields instead."
                );
            };
        }
        //为Vue构造函数添加config对象，该对象无法设置值，只能取值
        Object.defineProperty(Vue, "config", configDef);

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
        // Vue 的options配置
        Vue.options = Object.create(null);
    
        //为资产分配处理函数
        ASSET_TYPES.forEach(function (type) {
            Vue.options[type + "s"] = Object.create(null);
        })
    
        Vue.options._base = Vue;
    }

    initGlobalAPI(Vue);

    /*************************************************************/


    var uid$3 = 0; //用户ID

    /**
     * 初始化混合
     */
    function initMixin(Vue) {
        //初始化函数
        Vue.prototype._init = function (options) {
            var vm = this; //指向Vue实例 --> new Vue

            vm._uid = uid$3++; //初次进来为1

            var startTag, endTag; //开始标签 结束标签

            /* 浏览器性能监控 https://blog.csdn.net/hb_zhouyj/article/details/89888646 */
            if (config.performance && mark) {
                startTag = 'vue-perf-start:' + (vm._uid);
                endTag = 'vue-perf-end:' + (vm._uid);
                mark(startTag);
            }

            // 一个避免被观察到的标志
            vm._isVue = true;

            // 合并options
            if (options && options._isComponent) {
                //初始化组件
                initInternalComponent(vm, options);
            } else {
                //用于当前 Vue 实例的初始化选项。需要在选项中包含自定义属性时会有用处
                vm.$options = mergeOptions(
                    //解析constructor上的options属性的
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                );
            }

        }
    }

    function mergeOptions(parent, child, vm) {

    }

    /**
     * 解析new Vue constructor上的options，相当于Vue.options
     * Vue.options又有什么呢？
     * => 在 initGlobalAPI(Vue) 的时候定义了这个值
     * => Vue.options.components = {}
     * => Vue.options.directives = {}
     * => Vue.options.filters = {}
     */
    function resolveConstructorOptions(Ctor) {
        var options = Ctor.options;
        //...
        return options;
    }

    return Vue;
}))