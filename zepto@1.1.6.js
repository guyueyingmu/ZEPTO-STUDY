/* Zepto v1.1.6 - zepto event ajax form ie - zeptojs.com/license */


var Zepto = (function() {
  var undefined, key, $, classList, emptyArray = [], slice = emptyArray.slice, filter = emptyArray.filter,
    document = window.document,
    elementDisplay = {}, classCache = {},
    cssNumber = { 'column-count': 1, 'columns': 1, 'font-weight': 1, 'line-height': 1,'opacity': 1, 'z-index': 1, 'zoom': 1 },
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
    rootNodeRE = /^(?:body|html)$/i,   // (?:)非捕获型括号，只使用括号的原始方法，   i 匹配过程中忽略英文的 大小写   匹配节点的根目录
    capitalRE = /([A-Z])/g,

    // special attributes that should be get/set via method calls
    methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'],

    adjacencyOperators = [ 'after', 'prepend', 'before', 'append' ],
    table = document.createElement('table'),
    tableRow = document.createElement('tr'),
    containers = {
      'tr': document.createElement('tbody'),
      'tbody': table, 'thead': table, 'tfoot': table,
      'td': tableRow, 'th': tableRow,
      '*': document.createElement('div')
    },
    readyRE = /complete|loaded|interactive/,
    simpleSelectorRE = /^[\w-]*$/,
    class2type = {},
    toString = class2type.toString,
    zepto = {},
    camelize, uniq,
    tempParent = document.createElement('div'),
    propMap = {
      'tabindex': 'tabIndex',
      'readonly': 'readOnly',
      'for': 'htmlFor',
      'class': 'className',
      'maxlength': 'maxLength',
      'cellspacing': 'cellSpacing',
      'cellpadding': 'cellPadding',
      'rowspan': 'rowSpan',
      'colspan': 'colSpan',
      'usemap': 'useMap',
      'frameborder': 'frameBorder',
      'contenteditable': 'contentEditable'
    },
    isArray = Array.isArray ||
      function(object){ return object instanceof Array }

  zepto.matches = function(element, selector) {
    // 只有当两个参数都存在，第一个参数是元素节点是情况下，进行匹配
    if (!selector || !element || element.nodeType !== 1) return false
    var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
                          element.oMatchesSelector || element.matchesSelector
    if (matchesSelector) return matchesSelector.call(element, selector)
    // fall back to performing a selector:
    var match, parent = element.parentNode, temp = !parent
    if (temp) (parent = tempParent).appendChild(element)
    match = ~zepto.qsa(parent, selector).indexOf(element)
    temp && tempParent.removeChild(element)
    return match
  }


//  ligyon
  function type(obj) {
    return obj == null ? String(obj) :
      class2type[toString.call(obj)] || "object"
  }

  function isFunction(value) { return type(value) == "function" }
  function isWindow(obj)     { return obj != null && obj == obj.window }

  // 检查是不是代表 整个文档（DOM树的根节点） 9 = DOCUMENT_NODE;
  function isDocument(obj)   { return obj != null && obj.nodeType == obj.DOCUMENT_NODE }
  function isObject(obj)     { return type(obj) == "object" }
  function isPlainObject(obj) {
    return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
  }
  function likeArray(obj) { return typeof obj.length == 'number' }

  function compact(array) { return filter.call(array, function(item){ return item != null }) }
  function flatten(array) { return array.length > 0 ? $.fn.concat.apply([], array) : array }
  camelize = function(str){ return str.replace(/-+(.)?/g, function(match, chr){ return chr ? chr.toUpperCase() : '' }) }
  function dasherize(str) {
    return str.replace(/::/g, '/')
           .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
           .replace(/([a-z\d])([A-Z])/g, '$1_$2')
           .replace(/_/g, '-')
           .toLowerCase()
    // 除去 A-Z 的下划线，  并且把下划线替换成 - 横杆
  }

   // 利用filter 实现数组去重
  uniq = function(array){ return filter.call(array, function(item, idx){ return array.indexOf(item) == idx }) }

  function classRE(name) {
    return name in classCache ?
      classCache[name] : (classCache[name] = new RegExp('(^|\\s)' + name + '(\\s|$)'))
  }

  function maybeAddPx(name, value) {
      //存在cssNumber 数组中的属性都是不需要在 属性值中 加上 "px"
    return (typeof value == "number" && !cssNumber[dasherize(name)]) ? value + "px" : value
  }

  function defaultDisplay(nodeName) {
    // 通过新创建一个元素，来获取该元素的默认 display 属性
    var element, display
    // 这里先检查 之前有没有设置过 display 的默认属性
    if (!elementDisplay[nodeName]) {
      element = document.createElement(nodeName)
      document.body.appendChild(element)
      // display 的默认属性值
      display = getComputedStyle(element, '').getPropertyValue("display")
      element.parentNode.removeChild(element)
      //  设置成block ，显示元素
      display == "none" && (display = "block")
      elementDisplay[nodeName] = display
    }
    return elementDisplay[nodeName]
  }

  function children(element) {
    return 'children' in element ?
      slice.call(element.children) :
      $.map(element.childNodes, function(node){ if (node.nodeType == 1) return node })
  }

  // `$.zepto.fragment` takes a html string and an optional tag name
  // to generate DOM nodes nodes from the given html string.
  // The generated DOM nodes are returned as an array.
  // This function can be overriden in plugins for example to make
  // it compatible with browsers that don't support the DOM fully.
  zepto.fragment = function(html, name, properties) {
    var dom, nodes, container

    // A special case optimization for a single tag
    if (singleTagRE.test(html)) dom = $(document.createElement(RegExp.$1))

    if (!dom) {
      if (html.replace) html = html.replace(tagExpanderRE, "<$1></$2>")
      if (name === undefined) name = fragmentRE.test(html) && RegExp.$1
      if (!(name in containers)) name = '*'

      container = containers[name]
      container.innerHTML = '' + html
      dom = $.each(slice.call(container.childNodes), function(){
        container.removeChild(this)
      })
    }

    if (isPlainObject(properties)) {
      nodes = $(dom)
      $.each(properties, function(key, value) {
        if (methodAttributes.indexOf(key) > -1) nodes[key](value)
        else nodes.attr(key, value)
      })
    }

    return dom
  }

  // `$.zepto.Z` swaps out the prototype of the given `dom` array
  // of nodes with `$.fn` and thus supplying all the Zepto functions
  // to the array. Note that `__proto__` is not supported on Internet
  // Explorer. This method can be overriden in plugins.
  zepto.Z = function(dom, selector) {
    dom = dom || []
    // 所有通过函数 new 出来的东西都有一个_proto_ 指向这个函数的prototype 的原型
    // prototype  （显示原型）   __proto__ 隐式原型;
    // 如果没有为一个对象指定原型，那么他将会使用 __proto__ 的默认值 Object.prototype;
    // Object.prototype 对象自身也有一个 __proto__ 属性，这是原型链的终点并且为null;
    dom.__proto__ = $.fn           // fn 替换掉 dom 的原型 数组也是对象，可以在数组对象上添加属性 和
    dom.selector = selector || ''
    return dom
  }

  // `$.zepto.isZ` should return `true` if the given object is a Zepto
  // collection. This method can be overriden in plugins.
  zepto.isZ = function(object) {
    return object instanceof zepto.Z
  }

  // `$.zepto.init` is Zepto's counterpart to jQuery's `$.fn.init` and
  // takes a CSS selector and an optional context (and handles various
  // special cases).
  // This method can be overriden in plugins.
  zepto.init = function(selector, context) {
    var dom
    // If nothing given, return an empty Zepto collection
    if (!selector) return zepto.Z()
    // Optimize for string selectors
    else if (typeof selector == 'string') {
      selector = selector.trim()
      // If it's a html fragment, create nodes from it
      // Note: In both Chrome 21 and Firefox 15, DOM error 12
      // is thrown if the fragment doesn't begin with <
      if (selector[0] == '<' &&  fragment.test(selector))
        dom = zepto.fragment(selector, RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // If it's a CSS selector, use it to select nodes.
      else dom = zepto.qsa(document, selector)
    }
    // If a function is given, call it when the DOM is ready
    else if (isFunction(selector)) return $(document).ready(selector)
    // If a Zepto collection is given, just return it
    else if (zepto.isZ(selector)) return selector
    else {
      // normalize array if an array of nodes is given
      if (isArray(selector)) dom = compact(selector)
      // Wrap DOM nodes.
      else if (isObject(selector))
        dom = [selector], selector = null
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(selector))
        dom = zepto.fragment(selector.trim(), RegExp.$1, context), selector = null
      // If there's a context, create a collection on that context first, and select
      // nodes from there
      else if (context !== undefined) return $(context).find(selector)
      // And last but no least, if it's a CSS selector, use it to select nodes.
       // qsa = document.querySelectorAll
      else dom = zepto.qsa(document, selector)
    }
    // create a new Zepto collection from the nodes found
    return zepto.Z(dom, selector)
  }

  // `$` will be the base `Zepto` object. When calling this
  // function just call `$.zepto.init, which makes the implementation
  // details of selecting nodes and creating Zepto collections
  // patchable in plugins.
  $ = function(selector, context){
    return zepto.init(selector, context)
  }

  function extend(target, source, deep) {
    for (key in source)
      if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
        if (isPlainObject(source[key]) && !isPlainObject(target[key]))
          target[key] = {}
        if (isArray(source[key]) && !isArray(target[key]))
          target[key] = []
        extend(target[key], source[key], deep)
      }
      else if (source[key] !== undefined) target[key] = source[key]
  }

  // Copy all but undefined properties from one or more
  // objects to the `target` object.
  $.extend = function(target){
    var deep, args = slice.call(arguments, 1)
    if (typeof target == 'boolean') {
      deep = target
      target = args.shift()
    }
    args.forEach(function(arg){ extend(target, arg, deep) })
    return target
  }

  // `$.zepto.qsa` is Zepto's CSS selector implementation which
  // uses `document.querySelectorAll` and optimizes for some special cases, like `#id`.
  // This method can be overriden in plugins.
  // 实现css选择器 获取元素的引用，
  //  分别对应 getElementsByClassName  getElementsByTagName 和 querySelectorAll 来获取节点的 引用
  zepto.qsa = function(element, selector){
    var found,
        maybeID = selector[0] == '#',
        maybeClass = !maybeID && selector[0] == '.',
        nameOnly = maybeID || maybeClass ? selector.slice(1) : selector, // Ensure that a 1 char tag name still gets checked
        isSimple = simpleSelectorRE.test(nameOnly)
    return (isDocument(element) && isSimple && maybeID) ?
      ( (found = element.getElementById(nameOnly)) ? [found] : [] ) :
      (element.nodeType !== 1 && element.nodeType !== 9) ? [] :
      slice.call(
        isSimple && !maybeID ?
          maybeClass ? element.getElementsByClassName(nameOnly) : // If it's simple, it could be a class
          element.getElementsByTagName(selector) : // Or a tag
          element.querySelectorAll(selector) // Or it's not simple, and we need to query all
      )
  }

  function filtered(nodes, selector) {
    return selector == null ? $(nodes) : $(nodes).filter(selector)
  }

  $.contains = document.documentElement.contains ?
    function(parent, node) {
      return parent !== node && parent.contains(node)
    } :
    function(parent, node) {
      while (node && (node = node.parentNode))
        if (node === parent) return true
      return false
    }

  function funcArg(context, arg, idx, payload) {
    // 判断 arg 是不是 function 类型的， 是，则直接调用该函数，不是，则直接返回参数
    return isFunction(arg) ? arg.call(context, idx, payload) : arg
  }

  function setAttribute(node, name, value) {
    value == null ? node.removeAttribute(name) : node.setAttribute(name, value)
  }

  // access className property while respecting SVGAnimatedString
  function className(node, value){
    var klass = node.className || '',
        svg   = klass && klass.baseVal !== undefined

    if (value === undefined) return svg ? klass.baseVal : klass
    svg ? (klass.baseVal = value) : (node.className = value)
  }

  // "true"  => true
  // "false" => false
  // "null"  => null
  // "42"    => 42
  // "42.5"  => 42.5
  // "08"    => "08"
  // JSON    => parse if valid
  // String  => self
  function deserializeValue(value) {
    try {
      return value ?
        value == "true" ||
        ( value == "false" ? false :
          value == "null" ? null :
          +value + "" == value ? +value :
          /^[\[\{]/.test(value) ? $.parseJSON(value) :
          value )
        : value
    } catch(e) {
      return value
    }
  }

  $.type = type
  $.isFunction = isFunction
  $.isWindow = isWindow
  $.isArray = isArray
  $.isPlainObject = isPlainObject

  $.isEmptyObject = function(obj) {
    var name
    for (name in obj) return false
    return true
  }

  $.inArray = function(elem, array, i){
    return emptyArray.indexOf.call(array, elem, i)
  }

  $.camelCase = camelize
  $.trim = function(str) {
    return str == null ? "" : String.prototype.trim.call(str)
  }

  // plugin compatibility
  $.uuid = 0
  $.support = { }
  $.expr = { }

  $.map = function(elements, callback){
    var value, values = [], i, key
    if (likeArray(elements))
      for (i = 0; i < elements.length; i++) {
        value = callback(elements[i], i)
        if (value != null) values.push(value)
      }
    else
      for (key in elements) {
        value = callback(elements[key], key)
        if (value != null) values.push(value)
      }
    return flatten(values)
  }
   // 遍历方法 each
  $.each = function(elements, callback){
    var i, key
    // 如果是 类似数组的集合 ，则使用for 循环遍历
    if (likeArray(elements)) {
      for (i = 0; i < elements.length; i++)
        if (callback.call(elements[i], i, elements[i]) === false) return elements
    } else {
      // 其他的对象，则使用for in 遍历，
      for (key in elements)
        if (callback.call(elements[key], key, elements[key]) === false) return elements
    }

    return elements
  }

  $.grep = function(elements, callback){
    return filter.call(elements, callback)
  }

  if (window.JSON) $.parseJSON = JSON.parse

  // 利用 object 的toString() 方法，来进行类型检查，
  // class2type  数组中存放 一些基本的数据类型，便于后面进行类型判断
  // Populate the class2type map
  $.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
    class2type[ "[object " + name + "]" ] = name.toLowerCase()
  })

  // Define methods that will be available on all
  // Zepto collections

 // 定义 $.fn ，覆盖数组的原型，同时添加 数据原生方法到
// $.fn ，保证数组方法能够使用
  $.fn = {

    // Because a collection acts like an array
    // copy over these useful array functions.
    forEach: emptyArray.forEach,
    reduce: emptyArray.reduce,
    push: emptyArray.push,
    sort: emptyArray.sort,
    indexOf: emptyArray.indexOf,
    concat: emptyArray.concat,

    // `map` and `slice` in the jQuery API work differently
    // from their array counterparts
    map: function(fn){
      return $($.map(this, function(el, i){ return fn.call(el, i, el) }))
    },

    // (isFunction(selector)) return $(document).ready(selector)
    // $ 里面包裹函数， 表示在页面加载完成后 再执行
    slice: function(){
      return $(slice.apply(this, arguments))
    },

    ready: function(callback){
      // need to check if document.body exists for IE as that browser reports
      // document ready when it hasn't yet created the body element
      if (readyRE.test(document.readyState) && document.body) callback($)   // 如果document.body 存在，就直接调用
      else document.addEventListener('DOMContentLoaded', function(){ callback($) }, false) // 没有的话 监听 DOMContentLoaded 事件dom 文档加载完成后再执行。
      return this
    },
    // 获取数组中的指点项
    get: function(idx){
      return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
    },
    // 深拷贝一分 $数组，转化成真正的数组
    toArray: function(){ return this.get() },

    // 获取数组中的长度
    size: function(){
      return this.length
    },
    // 移除 子节点
    remove: function(){
      return this.each(function(){
        if (this.parentNode != null)
          this.parentNode.removeChild(this)
      })
    },
    // 利用数组循环遍历 节点
    each: function(callback){
      emptyArray.every.call(this, function(el, idx){
        return callback.call(el, idx, el) !== false
      })
      return this
    },
    filter: function(selector){
      if (isFunction(selector)) return this.not(this.not(selector))
      return $(filter.call(this, function(element){
        return zepto.matches(element, selector)
      }))
    },
    //添加新数组 到 $ 数组中，返回经过去重的数组。
    add: function(selector,context){
      return $(uniq(this.concat($(selector,context))))
    },
    // 在当前集合中的第一个元素  匹配选择器
    is: function(selector){
      return this.length > 0 && zepto.matches(this[0], selector)
    },

    not: function(selector){
      var nodes=[]
      if (isFunction(selector) && selector.call !== undefined)
          // 如果传入的选择器是函数，整通过集合中的数组下标来进行匹配
        this.each(function(idx){
          if (!selector.call(this,idx)) nodes.push(this)
        })
      else {
           // 如果传入的参数是 字符串，直接调用filter来进行筛选：
           // 如果是一个可以求出长度的数组,即也是一个集合，就直接传入这个集合，进行后面的筛选
        var excludes = typeof selector == 'string' ? this.filter(selector) :
          (likeArray(selector) && isFunction(selector.item)) ? slice.call(selector) : $(selector)
        //在 原数组中 匹配excludes 中不存在的数组项，放在数组nodes 中
        this.forEach(function(el){
          if (excludes.indexOf(el) < 0) nodes.push(el)
        })
      }
      return $(nodes)
    },

    has: function(selector){
      return this.filter(function(){
        return isObject(selector) ?
          $.contains(this, selector) :
          $(this).find(selector).size()
      })
    },

    // 利用序号，查找对应 的元素
    eq: function(idx){
      return idx === -1 ? this.slice(idx) : this.slice(idx, + idx + 1)
    },
    // 获取顺序中的 第一个元素
    first: function(){
      var el = this[0]
      return el && !isObject(el) ? el : $(el)
    },
    // 获取集合中的最后一个元素
    last: function(){
      var el = this[this.length - 1]
      return el && !isObject(el) ? el : $(el)
    },

    find: function(selector){
      var result, $this = this
      if (!selector) result = $()
      else if (typeof selector == 'object')
        result = $(selector).filter(function(){
          var node = this
          return emptyArray.some.call($this, function(parent){
            return $.contains(parent, node)
          })
        })
        // 如果 集合最后那个只有一个值，就在当前的集合中直接查找 selector 对应的的元素
      else if (this.length == 1) result = $(zepto.qsa(this[0], selector))
       //  在比较多的情况下，使用mpa  遍历数组，返回费符合选择器的元素
      else result = this.map(function(){ return zepto.qsa(this, selector) })
      return result
    },

    closest: function(selector, context){
      var node = this[0], collection = false
      if (typeof selector == 'object') collection = $(selector)
      while (node && !(collection ? collection.indexOf(node) >= 0 : zepto.matches(node, selector)))
        node = node !== context && !isDocument(node) && node.parentNode   // 向上遍历找到 符合条件的第一个元素，返回。
      return $(node)
    },
    //
    parents: function(selector){
      var ancestors = [], nodes = this
      while (nodes.length > 0)
        nodes = $.map(nodes, function(node){
            // 保存集合中每个元素的所有的父元素，并且不会重复保存
           // 循环向上查找，直到文档树的根节点
          if ((node = node.parentNode) && !isDocument(node) && ancestors.indexOf(node) < 0) {
            ancestors.push(node)
            return node
          }
        })
      // 如果相应的传入了css 选择器参数，则进行过滤所有的 父节点
      return filtered(ancestors, selector)
    },


    parent: function(selector){
      // 利用pluck 来获取当前集合中的父节点属性值，经过数组去重
      // 如果传入参数有css 选择器，则过滤后再返回
      return filtered(uniq(this.pluck('parentNode')), selector)
    },
// *************************
    children: function(selector){
      return filtered(this.map(function(){ return children(this) }), selector)
    },
// *************************
    contents: function() {
        // 返回 当前集合中的节点的子元素
      return this.map(function() { return slice.call(this.childNodes) })
    },

    siblings: function(selector){

      return filtered(this.map(function(i, el){
   //  当前集合中 元素的 父元素的所有非自己的子元素，就为当前元素的兄弟节点
        return filter.call(children(el.parentNode), function(child){ return child!==el })
      }), selector)
    },

    empty: function(){
       // 集合中的元素 设置 innerHTML = ‘’ , 即为清空
      return this.each(function(){ this.innerHTML = '' })
    },
    // `pluck` is borrowed from Prototype.js
    pluck: function(property){
         // 遍历返回当前集合元素中的对应属性
      return $.map(this, function(el){ return el[property] })
    },
    show: function(){

      return this.each(function(){
        this.style.display == "none" && (this.style.display = '')
        if (getComputedStyle(this, '').getPropertyValue("display") == "none")
          this.style.display = defaultDisplay(this.nodeName)
      })
    },
      // before   => insertBefore  定义了简写的方法
      //
    replaceWith: function(newContent){
      // 当前元素的前面插入新元素后，删除当前元素，则实现了替换操作
      return this.before(newContent).remove()
    },
  // *****************************************************
    wrap: function(structure){
      var func = isFunction(structure)
      if (this[0] && !func)
        var dom   = $(structure).get(0),
            clone = dom.parentNode || this.length > 1

      return this.each(function(index){
        $(this).wrapAll(
          func ? structure.call(this, index) :
            clone ? dom.cloneNode(true) : dom
        )
      })
    },
    wrapAll: function(structure){
      if (this[0]) {
        $(this[0]).before(structure = $(structure))
        var children
        // drill down to the inmost element
        while ((children = structure.children()).length) structure = children.first()
        $(structure).append(this)
      }
      return this
    },
    wrapInner: function(structure){
      var func = isFunction(structure)
      return this.each(function(index){
        var self = $(this), contents = self.contents(),
            dom  = func ? structure.call(this, index) : structure
        contents.length ? contents.wrapAll(dom) : self.append(dom)
      })
    },
    // ********************************************************
    unwrap: function(){
      this.parent().each(function(){
        $(this).replaceWith($(this).children())
      })
      return this
    },

    clone: function(){
      // 利用cloneNode深度克隆当前集合 包括集合中的子节点
      return this.map(function(){ return this.cloneNode(true) })
    },

    hide: function(){
       // 隐藏当前集合中的元素
      return this.css("display", "none")
    },
    toggle: function(setting){
      return this.each(function(){
        var el = $(this)
         // 如果传入的参数中指定了setting，表示显示 或者 隐藏， 则调用对应的 show() 和 hide();
         // 如果没有传入然后参数，则根据当前 元素中 display 的 属性 来 相反的进行操作。
        ;(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
      })
    },
     // 直接使用原生的 previousElementSibling 属性 来 获取 集合中的前驱节点，同时如果有选择器传入的话，
     // 则 调用filter 过滤后在再 返回结果
    prev: function(selector){ return $(this.pluck('previousElementSibling')).filter(selector || '*') },
    //直接使用原生的 nextElementSibling 属性 来 获取
    next: function(selector){ return $(this.pluck('nextElementSibling')).filter(selector || '*') },

    html: function(html){
       // in 操作符有两种用法
        /*
            1. for...in 声明 用于对数组或者对象的属性进行迭代/ 循环操作
            2.判断对象是否为数组/ 对象的元素/ 属性
              (变量 in 对象)
                 当　“对象”　为数组时，＂变量＂指的是数组的“索引”
                 当 “对象” 为对象时， “变量” 指的是对象的 “属性”
           */
        // 在这里 in  用来判断 是否有传入参数，是否有传入填充值
      return 0 in arguments ?
        this.each(function(idx){
          var originHtml = this.innerHTML
          /*function funcArg(context, arg, idx, payload) {
             return isFunction(arg) ? arg.call(context, idx, payload) : arg
           }  */
           //

           // 如果参数不是函数，直接append到对应的元素中，
          //  如果参数 是函数， 再传入当前节点的索引 和 内容最为参数，供用户调用
          // 先清空，再填充对应的数值
           $(this).empty().append( funcArg(this, html, idx, originHtml) )
        }) :
        (0 in this ? this[0].innerHTML : null)  // 如果没有传入任何参数，则返回该集合中第一个元素的innerHTML 的内容
    },
    text: function(text){
      return 0 in arguments ?
        this.each(function(idx){
          var newText = funcArg(this, text, idx, this.textContent)
      //如果您设置了 textContent 属性，会删除所有子节点，并被替换为包含指定字符串的一个单独的文本节
        // 同上 html 的方法，通过textContent 来设置 nexttext 同时返回 新的的text
          this.textContent = newText == null ? '' : ''+newText
        }) :
        (0 in this ? this[0].textContent : null)  // 如果没有传入任何参数，则返回集合中第一个元素的 textContent;
    },
    attr: function(name, value){
      var result
      return (typeof name == 'string' && !(1 in arguments)) ?
          // 传入的参数只有一个，则当做获取DOM元素的属性，
        (!this.length || this[0].nodeType !== 1 ? undefined :  // 传入的参数只有一个，并且当前集合的长度为0 ,或者集合中不为元素节点
          (!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result  //利用getAttribute 来获取属性值，如果要获取集合中第一个元素的自有属性，则直接通过this[0][name] 来获取对应的 的属性
        ) :
        // 后面如果是传入了两个参数，则表示通过
        this.each(function(idx){
          if (this.nodeType !== 1) return
         //  如果通过对象的形式来设置 属性，可以遍历name 对象中的 key ，value 值来设置对应的 属性
          if (isObject(name)) for (key in name) setAttribute(this, key, name[key])
          // 如果name 不是对象，则利用name 和 value 两个参数来设置 key value 值；
          else setAttribute(this, name, funcArg(this, value, idx, this.getAttribute(name)))
        })
    },
    removeAttr: function(name){
        // 可同时移除多个利用空格分隔的属性
        // 通过forEach 的遍历方法， 来 设置 setAttribute
      return this.each(function(){ this.nodeType === 1 && name.split(' ').forEach(function(attribute){
        setAttribute(this, attribute)
      }, this)})
    },
    prop: function(name, value){
      name = propMap[name] || name
      return (1 in arguments) ?
        // 如果传入有两个参数，则表示设置元素的属性，
        this.each(function(idx){
          this[name] = funcArg(this, value, idx, this[name])
        }) :
        // 只传入一个参数的时候，直接获取该元素对象上对应的属性值,与attr 不同的是 没有使用getAttribute获取
        (this[0] && this[0][name])
    },
    data: function(name, value){
       // 设置集合中dom 节点的，     data 自定义属性， capitalRE如果匹配到大写字母，则每个大写字母前面加上 -
      var attrName = 'data-' + name.replace(capitalRE, '-$1').toLowerCase()

      var data = (1 in arguments) ?    // 分别对设置  和 获取 attr 做判断
        this.attr(attrName, value) :
        this.attr(attrName)
        // 通过 deserializeValue 的正则替换后，就可以相应的等到自定义的属性值
      return data !== null ? deserializeValue(data) : undefined
    },
    val: function(value){
      return 0 in arguments ?
        this.each(function(idx){
            // 设置input类的value 值， 也可以通过函数调用 利用目前的value 进行设置
          this.value = funcArg(this, value, idx, this.value)
        }) :
        // 获取当前元素 的 value 值，
        (this[0] && (this[0].multiple ?
           // 如果是 select 多选框，则选择option 元素中被选中的元素的value 值，通过pluck 来获取
           $(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
          //如果是一般的input 元素 ，就可以直接获取value 属性值
           this[0].value)
        )
    },
    offset: function(coordinates){
       // 利用元素的relative属性，top 和 left ，
       // 设置的 像素距离都是相对最外层(父元素的外层元素)的元素来设置的
      if (coordinates) return this.each(function(index){
        var $this = $(this),
            coords = funcArg(this, coordinates, index, $this.offset()),
            parentOffset = $this.offsetParent().offset(),
            props = {

              top:  coords.top  - parentOffset.top,
              // 元素的左外边框至包含元素的左内边框之间的像素距离
              left: coords.left - parentOffset.left
            }

        if ($this.css('position') == 'static') props['position'] = 'relative'
        // 最后直接利用 封装好的 css 来设置对应的属性
        $this.css(props)
      })
      // 如果 当前集合中的元素 个数是0 则直接返回null
      if (!this.length) return null
      var obj = this[0].getBoundingClientRect()
      //pageXOffset 和 pageYOffset 属性返回文档在窗口左上角水平和垂直方向滚动的像素。
      // pageXOffset 和 pageYOffset 属性相等于 scrollX 和 scrollY 属性。 最后计算得到的就是 距离文档边缘的 距离
      return {
        // 这里返回的就是相对于整个文档的坐标
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: Math.round(obj.width),
        height: Math.round(obj.height)
      }
    },

    css: function(property, value){
      if (arguments.length < 2) {
        var computedStyle, element = this[0]
        if(!element) return
        computedStyle = getComputedStyle(element, '')
        if (typeof property == 'string')
           // 获取css，通过它的style 特性获取，如果没有的话，，就可以通过样式表规则应用的，获取这个元素计算后的样式
          return element.style[camelize(property)] || computedStyle.getPropertyValue(property)
        else if (isArray(property)) {   // 如果想要获取的一系列的样式属性值，可以通过each 来遍历获取
          var props = {}
          $.each(property, function(_, prop){
            props[prop] = (element.style[camelize(prop)] || computedStyle.getPropertyValue(prop))
          })
          return props
        }
      }

      var css = ''
      if (type(property) == 'string') {
        if (!value && value !== 0)
          this.each(function(){ this.style.removeProperty(dasherize(property)) })
        else
          css = dasherize(property) + ":" + maybeAddPx(property, value)
      } else {
        // 如果property是一个对象，则遍历对象中的属性，
        for (key in property)
          if (!property[key] && property[key] !== 0)
             // 如果这里属性值对应的是空格且不为0，则表示删除这个属性
             // removeProperty这个方法，意味着将会为该属性应用默认的样式(从其他样式表经层叠而来)
            this.each(function(){ this.style.removeProperty(dasherize(key)) })
          else
            css += dasherize(key) + ':' + maybeAddPx(key, property[key]) + ';'
      }
     // cssText:
     // 通过cssText 属性 可以访问style特性中的css代码，
    //   读模式下，cssText返回浏览器对style特性中CSS 代码的内部表示，
    //   写入模式下，赋给cssText的值会重写整个style特性的值，也就意味着 ，以前通过style 特性指定的样式信息都将丢失
      return this.each(function(){ this.style.cssText += ';' + css })
    },
    //通过 数组的indexOf 来获取 集合中指定元素的 序号
    index: function(element){
      return element ? this.indexOf($(element)[0]) : this.parent().children().indexOf(this[0])
    },
    // 通过数组的some方法
    hasClass: function(name){
    // arr.some(callback[,thisArg])
    // callback 用来测试每个元素的函数，
    // thisArg 执行callback 时使用的this值。--> callRE(name)  正则表达式
      if (!name) return false
      return emptyArray.some.call(this, function(el){
        return this.test(className(el))
      }, classRE(name))
    },
    addClass: function(name){
      if (!name) return this
      return this.each(function(idx){
        if (!('className' in this)) return
        classList = []
        // 获取集合中元素已经存在的类，
        var cls = className(this), newName = funcArg(this, name, idx, cls)
        newName.split(/\s+/g).forEach(function(klass){
          if (!$(this).hasClass(klass)) classList.push(klass)
        }, this)
        // 同样通过 className方法，来设置所有的class  类，
        classList.length && className(this, cls + (cls ? " " : "") + classList.join(" "))
      })
    },
    removeClass: function(name){
      return this.each(function(idx){
        if (!('className' in this)) return
        if (name === undefined) return className(this, '')
        classList = className(this)
        funcArg(this, name, idx, classList).split(/\s+/g).forEach(function(klass){
          // 将对应的classname 替换成“ ”，达到移除对应class的目的
          classList = classList.replace(classRE(klass), " ")
        })
        // 同样 将除去对应classname的 classlist 字符串 赋值到对应的元素。
        className(this, classList.trim())
      })
    },
    toggleClass: function(name, when){
      if (!name) return this
      return this.each(function(idx){
        var $this = $(this), names = funcArg(this, name, idx, className(this))
        names.split(/\s+/g).forEach(function(klass){
          (when === undefined ? !$this.hasClass(klass) : when) ?  // when指定 是否添加或者删除对应的 class 类，
             // 没有特意指定，则调用 hasClass 来判断，
            $this.addClass(klass) : $this.removeClass(klass)
        })
      })
    },
    scrollTop: function(value){
      if (!this.length) return
      // in 操作符用来判断某个属性属于某个对象，可以是对象的直接属性，也可以是通过prototype 继承的属性。
      var hasScrollTop = 'scrollTop' in this[0]
       //  如果没有scrollTop 属性就返回 pageYOffset 属性值。
      if (value === undefined) return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset

      return this.each(hasScrollTop ?
        function(){ this.scrollTop = value } :      // 通过scrollTop  设置值，
        function(){ this.scrollTo(this.scrollX, value) })   // scrollTo  滚动到文档中的某个坐标。
    },
    scrollLeft: function(value){
      if (!this.length) return
      var hasScrollLeft = 'scrollLeft' in this[0]   // 判断该对象中是否有scrollLeft 属性， 原理同上面的scrollTop;
      if (value === undefined) return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset
      return this.each(hasScrollLeft ?
        function(){ this.scrollLeft = value } :
        function(){ this.scrollTo(value, this.scrollY) })
    },
    position: function() {
      if (!this.length) return

      var elem = this[0],
        // Get *real* offsetParent
        offsetParent = this.offsetParent(),
        // Get correct offsets
        offset       = this.offset(),
        // 是文档的根节点，就返回{left:0,Right:0}
       // 否则就返回 包含元素的offset()坐标。
        parentOffset = rootNodeRE.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

      // Subtract element margins
      // note: when an element has margin: auto the offsetLeft and marginLeft
      // are the same in Safari causing offset.left to incorrectly be 0
      offset.top  -= parseFloat( $(elem).css('margin-top') ) || 0   // 元素的左外边框至包含元素的左内边框 -- offsetLeft; 所以就要减去边距
      offset.left -= parseFloat( $(elem).css('margin-left') ) || 0

      // Add offsetParent borders
      parentOffset.top  += parseFloat( $(offsetParent[0]).css('border-top-width') ) || 0
      parentOffset.left += parseFloat( $(offsetParent[0]).css('border-left-width') ) || 0

      // Subtract the two offsets
      return {
        top:  offset.top  - parentOffset.top,
        left: offset.left - parentOffset.left    // 获取元素的 定位距离，
      }
    },
    offsetParent: function() {
      return this.map(function(){
        var parent = this.offsetParent || document.body
        while (parent && !rootNodeRE.test(parent.nodeName) && $(parent).css("position") == "static")   // 不断向上遍历，获取最外的offsetParent。
          parent = parent.offsetParent
        return parent
      })
    }
  }

  // for now
  $.fn.detach = $.fn.remove

  // Generate the `width` and `height` functions
  ;['width', 'height'].forEach(function(dimension){
    var dimensionProperty =
      dimension.replace(/./, function(m){ return m[0].toUpperCase() })   // 首字母大写转换

    $.fn[dimension] = function(value){
      var offset, el = this[0]
      if (value === undefined) return isWindow(el) ? el['inner' + dimensionProperty] :
        isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :   // 如果是文档的根节点，使用 scrolllWidth;
        (offset = this.offset()) && offset[dimension]                      // 如果是一般的文档节点， 通过offset()  集合中的width ，height 属性来等到结果
      else return this.each(function(idx){
        el = $(this)
        el.css(dimension, funcArg(this, value, idx, el[dimension]()))    // 可以设置值，直接 通过css 方法设置 宽 高 属性
      })
    }
  })

  function traverseNode(node, fun) {
    fun(node)
    for (var i = 0, len = node.childNodes.length; i < len; i++)
      traverseNode(node.childNodes[i], fun)
  }

  // Generate the `after`, `prepend`, `before`, `append`,
  // `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
  adjacencyOperators.forEach(function(operator, operatorIndex) {
    var inside = operatorIndex % 2 //=> prepend, append

    $.fn[operator] = function(){
      // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
      var argType, nodes = $.map(arguments, function(arg) {
            argType = type(arg)
            return argType == "object" || argType == "array" || arg == null ?
              arg : zepto.fragment(arg)
          }),
          parent, copyByClone = this.length > 1
      if (nodes.length < 1) return this

      return this.each(function(_, target){
        parent = inside ? target : target.parentNode

        // convert all methods to a "before" operation
        target = operatorIndex == 0 ? target.nextSibling :
                 operatorIndex == 1 ? target.firstChild :
                 operatorIndex == 2 ? target :
                 null

        var parentInDocument = $.contains(document.documentElement, parent)

        nodes.forEach(function(node){
          if (copyByClone) node = node.cloneNode(true)
          else if (!parent) return $(node).remove()

          parent.insertBefore(node, target)
          if (parentInDocument) traverseNode(node, function(el){
            if (el.nodeName != null && el.nodeName.toUpperCase() === 'SCRIPT' &&
               (!el.type || el.type === 'text/javascript') && !el.src)
              window['eval'].call(window, el.innerHTML)
          })
        })
      })
    }

    // after    => insertAfter
    // prepend  => prependTo
    // before   => insertBefore
    // append   => appendTo
    $.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
      $(html)[operator](this)
      return this
    }
  })

   // 对这一段做出解释
   /*
  类比理解：
    var F = function(){};
    var f = new F();
    f._proto_  === F.prototype    // true;

      $最终返回的其实都是zepto.Z 的实例，从上面的 代码可以看出，为了保持_proto_ 和 prototype 一致就会出现下面的费复杂
 深层次理解：
      function fn(){}
      var pro = new Object();

      fn.prototype  = pro;

      var obj = {};
      obj._proto_ = pro;
      console.log(obj instanceof fn)   // true;
    */
  zepto.Z.prototype = $.fn

  // Export internal API functions in the `$.zepto` namespace
  zepto.uniq = uniq
  zepto.deserializeValue = deserializeValue
  $.zepto = zepto

  return $
})()

// 将Zepto 变量绑定到window 对象上
// 在window 上不存在$对象的，将Zepto 赋值到 $ 属性上。
window.Zepto = Zepto
window.$ === undefined && (window.$ = Zepto)



// 下面的方法用来为对应的 dom 添加事件绑定
;(function($){
  var _zid = 1, undefined,
      slice = Array.prototype.slice,
      isFunction = $.isFunction,
      isString = function(obj){ return typeof obj == 'string' },
      handlers = {},
      specialEvents={},
      focusinSupported = 'onfocusin' in window,
      focus = { focus: 'focusin', blur: 'focusout' },
      // focusin 和 focus 一样, 不同点是： focus--不支持冒泡  , focusin 支持冒泡
      //  blur 和 focusout 功能一样， 不同点是： blur 不支持冒泡， focusout 支持冒泡，
      hover = { mouseenter: 'mouseover', mouseleave: 'mouseout' }
      // mouseover: 不论鼠标指针穿过被选原生  或 其子元素， 都会触发 mouseover事件
      // mouseout :  离开被选元素          或者其子元素，都会触发mouseout 事件
      // mouseleave:  只有在鼠标指针离开被选元素时，才会触发，
      // mouseenter: 只有在鼠标指针穿过被选元素时，才会触发mouseenter 事件

// 要创建的事件类型 这里包括了所有的鼠标事件，都归类在  "MouseEvents" 事件中
  specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents'


  /**
   *  对每个即将绑定事件的元素申请 一格对应的 id,
   *  @method zid
   *  @param  {Object} element 节点元素对应的对象
   *  @return {null}         没有任何返回值
   */
  function zid(element) {
    return element._zid || (element._zid = _zid++)
  }
  function findHandlers(element, event, fn, selector) {
    event = parse(event)
    if (event.ns) var matcher = matcherFor(event.ns)
    return (handlers[zid(element)] || []).filter(function(handler) {
      return handler
        && (!event.e  || handler.e == event.e)
        && (!event.ns || matcher.test(handler.ns))
        && (!fn       || zid(handler.fn) === zid(fn))
        && (!selector || handler.sel == selector)
    })
  }

  /**
   *  将传入的字符串事件名，转换成 对象
   *  @method parse
   *  @param  String event [description]
   *  @return {null}       [description]
   */
  function parse(event) {
    var parts = ('' + event).split('.')
    return {e: parts[0], ns: parts.slice(1).sort().join(' ')}
  }
  function matcherFor(ns) {
    return new RegExp('(?:^| )' + ns.replace(' ', ' .* ?') + '(?: |$)')
  }

  /**
   *  判断是否在捕获阶段执行该函数，
   *  @method eventCapture
   *  @param  {Object}     handler        [description]
   *  @param  {String}    captureSetting [ 是否允在捕获时执行 ]
   *  @return {[type]}                    [description]
   */
  function eventCapture(handler, captureSetting) {
    return handler.del &&
      (!focusinSupported && (handler.e in focus)) ||   // onfocusin 支持冒泡，可以设置为true,
      !!captureSetting
  }

  function realEvent(type) {
    // 这里将对应事件进行统一的管理，
    // mouseover 替代 mouseenter;
    // mouseout 替代  mouseleave
    // focusin 替代 focus
    // focusout 替代 blur
    // 对于 大部分的事件，都要经过这里进行替换
    return hover[type] || (focusinSupported && focus[type]) || type
  }

  function add(element, events, fn, data, selector, delegator, capture){
    var id = zid(element), set = (handlers[id] || (handlers[id] = []))    // 在全局的handlers 对象中，通过zid 进行标记，为每个元素开辟一个事件句柄的数组，分别在数组中存入不同的绑定事件的句柄。
    events.split(/\s/).forEach(function(event){                      // 通过空格分割的多个事件，同时注册到对应的dom 上，
      if (event == 'ready') return $(document).ready(fn)             // 也可以监听ready 事件。
      var handler   = parse(event)    // handler 存放整个触发事件相关信息
      handler.fn    = fn             // fn --  事件触发的回调函数
      handler.sel   = selector       // sel -- 事件选择器，在事件代理中有作用
      // emulate mouseenter, mouseleave,进入和离开的时候都只触发一次，不会在子元素相关中触发
      if (handler.e in hover) fn = function(e){
          // relatedTarget 事件属性返回与事件的目标节点相关的节点。
          // 对于 mouseover 事件来说，该属性是鼠标指针移到目标节点上时所离开的那个节点。
          // 对于 mouseout 事件来说，该属性是离开目标时，鼠标指针进入的节点。
        var related = e.relatedTarget
        if (!related || (related !== this && !$.contains(this, related)))
           // 只有在不是进入或者离开目标元素的时候，才会触发。
           return handler.fn.apply(this, arguments)
      }
      handler.del   = delegator                //  通过事件代理的方式绑定，则不会阻止事件的冒泡，方便事件向上冒泡。
      var callback  = delegator || fn
      handler.proxy = function(e){
        e = compatible(e)
        if (e.isImmediatePropagationStopped()) return   // 函数的返回值为Boolean类型，以指示是否已经调用过,true 表示已经调用stopImmediatePropagation了
        e.data = data                  // 将传入的data 保存 到 ，事件对象的 data 属性中，
        var result = callback.apply(element, e._args == undefined ? [e] : [e].concat(e._args))
        if (result === false) e.preventDefault(), e.stopPropagation()    // 根据上面的callback 判断为false ,则阻止 事件触发的默认行为和事件的冒泡行为。
        return result
      }
      handler.i = set.length
      set.push(handler)
      if ('addEventListener' in element)                    // 最后通过addEventListener 方法 来绑定事件。
        element.addEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
        //addEventListener 对应的三个参数分别是：
          //             string: 事件名称
          //             function:要触发的事件处理函数
          //             boolean: 指定事件处理函数的的阶段，  options:    true -- 事件句柄在捕获阶段执行  ； false -- 事件句柄在冒泡阶段执行
    })
  }
  function remove(element, events, fn, selector, capture){
    var id = zid(element)
    ;(events || '').split(/\s/).forEach(function(event){
      findHandlers(element, event, fn, selector).forEach(function(handler){

        delete handlers[id][handler.i]
      if ('removeEventListener' in element)
        element.removeEventListener(realEvent(handler.e), handler.proxy, eventCapture(handler, capture))
      })
    })
  }

  $.event = { add: add, remove: remove }

  $.proxy = function(fn, context) {
    var args = (2 in arguments) && slice.call(arguments, 2)
    if (isFunction(fn)) {
      var proxyFn = function(){ return fn.apply(context, args ? args.concat(slice.call(arguments)) : arguments) }
      proxyFn._zid = zid(fn)
      return proxyFn
    } else if (isString(context)) {
      if (args) {
        args.unshift(fn[context], fn)
        return $.proxy.apply(null, args)
      } else {
        return $.proxy(fn[context], fn)
      }
    } else {
      throw new TypeError("expected function")
    }
  }
   // bind 方法，在内部也会转换成 on 方法。
  $.fn.bind = function(event, data, callback){
    return this.on(event, data, callback)
  }
  // unbind 方法，在zepto 内部转换成off 方法。
  $.fn.unbind = function(event, callback){
    return this.off(event, callback)
  }
  // 绑定一次就解除绑定，调用on方法，最后传入 1 ，
  $.fn.one = function(event, selector, data, callback){
    return this.on(event, selector, data, callback, 1)
  }

  var returnTrue = function(){return true},
      returnFalse = function(){return false},
      ignoreProperties = /^([A-Z]|returnValue$|layer[XY]$)/,
      eventMethods = {
        preventDefault: 'isDefaultPrevented',
        stopImmediatePropagation: 'isImmediatePropagationStopped',
        stopPropagation: 'isPropagationStopped'
      }

  function compatible(event, source) {
    if (source || !event.isDefaultPrevented) {
      source || (source = event)

      $.each(eventMethods, function(name, predicate) {
        var sourceMethod = source[name]
        event[name] = function(){
          this[predicate] = returnTrue
          // 绑定event 事件对象中的 原始方法
          return sourceMethod && sourceMethod.apply(source, arguments)
        }
        // 默认情况下 事件对象没有调用 event.preventDefault()方法，如果preventDefault(),已经被调用了，就会返回true.
        // 这也是jQuery 中自定义的几个事件对象的属性
        event[predicate] = returnFalse
      })
       // event.defaultPrevented （DOM3级事件中新增） true,表示已经调用了 preventDefault() 。
       if (source.defaultPrevented !== undefined ? source.defaultPrevented :
          'returnValue' in source ? source.returnValue === false :
          source.getPreventDefault && source.getPreventDefault())
        event.isDefaultPrevented = returnTrue
    }
    return event
  }

  function createProxy(event) {
    var key, proxy = { originalEvent: event }
    for (key in event)
      if (!ignoreProperties.test(key) && event[key] !== undefined) proxy[key] = event[key]

    return compatible(proxy, event)
  }
   //
  $.fn.delegate = function(selector, event, callback){
    return this.on(event, selector, callback)
  }
  $.fn.undelegate = function(selector, event, callback){
    return this.off(event, selector, callback)
  }

  $.fn.live = function(event, callback){
    $(document.body).delegate(this.selector, event, callback)
    return this
  }
  $.fn.die = function(event, callback){
    $(document.body).undelegate(this.selector, event, callback)
    return this
  }

  $.fn.on = function(event, selector, data, callback, one){
    var autoRemove, delegator, $this = this
    if (event && !isString(event)) {
    // 如果这里的event 参数 不是字符串， {type:handler,type2:handler}, 同时为该dom 绑定多个事件对象。
      $.each(event, function(type, fn){
        $this.on(type, selector, data, fn, one)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)
      callback = data, data = selector, selector = undefined
    if (isFunction(data) || data === false)   // $(document).on("click",'a',false)   ==>$(document).on("click",'a',function(){return false;})
      callback = data, data = undefined       // isFunction(data) 为真，表示没有传入data 或者 也没有传入 selector ,只传入了callback.,

    if (callback === false) callback = returnFalse   // 将 callback 传入  function(){return false}  阻止事件的默认行为。

    return $this.each(function(_, element){
      if (one) autoRemove = function(e){         //  在使用 one 方法 只让事件至多触发一次的情况下，就卸载绑定的事件。
        remove(element, e.type, callback)       //   再调用remove 事件，解除绑定。
        return callback.apply(this, arguments)    // autoRemove  拿到了callback 的事件句柄
      }

      if (selector) delegator = function(e){
        var evt, match = $(e.target).closest(selector, element).get(0);  // 在委托事件存在的时候，获取点击事件的符合selector的父元素
        if (match && match !== element) {
          evt = $.extend(createProxy(e), {currentTarget: match, liveFired: element})
          return (autoRemove || callback).apply(match, [evt].concat(slice.call(arguments, 1)))
        }
      }

      add(element, event, callback, data, selector, delegator || autoRemove)
    })
  }
  $.fn.off = function(event, selector, callback){
    var $this = this
    if (event && !isString(event)) {
      $.each(event, function(type, fn){
        $this.off(type, selector, fn)
      })
      return $this
    }

    if (!isString(selector) && !isFunction(callback) && callback !== false)  // 没有错传入选择器，则将对应的元素后移
      callback = selector, selector = undefined

    if (callback === false) callback = returnFalse    // 也没有传入回调函数，直接返回false， 不执行操作

    return $this.each(function(){
       //对zepto 数组中的每个引用元素分别执行remove 操作
      remove(this, event, callback, selector)
    })
  }

// review
  $.fn.trigger = function(event, args){
    event = (isString(event) || $.isPlainObject(event)) ? $.Event(event) : compatible(event)
    event._args = args
    return this.each(function(){
      // handle focus(), blur() by calling them directly
      if (event.type in focus && typeof this[event.type] == "function") this[event.type]()
      // items in the collection might not be DOM elements
      else if ('dispatchEvent' in this) this.dispatchEvent(event)     // 主动使用事件分发方法，来主动触发事件
      else $(this).triggerHandler(event, args)
    })
  }

  // triggers event handlers on current element just as if an event occurred,
  // doesn't trigger an actual event, doesn't bubble
  $.fn.triggerHandler = function(event, args){
    var e, result
    this.each(function(i, element){
      e = createProxy(isString(event) ? $.Event(event) : event)
      e._args = args
      e.target = element
      $.each(findHandlers(element, event.type || event), function(i, handler){
        result = handler.proxy(e)
        if (e.isImmediatePropagationStopped()) return false
      })
    })
    return result
  }

  // shortcut methods for `.bind(event, fn)` for each event type
  // 如果想实现快捷方法来绑定事件，则使用下面这种方法
  ;('focusin focusout focus blur load resize scroll unload click dblclick '+
  'mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave '+
  'change select keydown keypress keyup error').split(' ').forEach(function(event) {
    $.fn[event] = function(callback) {
      return (0 in arguments) ?      // 如果有回调函数的情况下，在事件绑定中添加callback 回调。
        this.bind(event, callback) :   // 使用 bind 转换
        this.trigger(event)
    }
  })

  $.Event = function(type, props) {
    // 如果接受到的参数是一个{}, 则 对应的属性赋值给对应的参数。
    if (!isString(type)) props = type, type = props.type
    // 创建一个指定类型的事件，传入参数是字符串类型，默认情况下 bubble 为true
    var event = document.createEvent(specialEvents[type] || 'Events'), bubbles = true
    if (props) for (var name in props) (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name])
    // 定义事件名为 type，
    event.initEvent(type, bubbles, true)
    return compatible(event)
  }

})(Zepto)

;(function($){
  var jsonpID = 0,
      document = window.document,
      key,
      name,
      rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      scriptTypeRE = /^(?:text|application)\/javascript/i,
      xmlTypeRE = /^(?:text|application)\/xml/i,
      jsonType = 'application/json',
      htmlType = 'text/html',
      blankRE = /^\s*$/,
      originAnchor = document.createElement('a')

  originAnchor.href = window.location.href

  // trigger a custom event and return false if it was cancelled
  function triggerAndReturn(context, eventName, data) {
    var event = $.Event(eventName)
    $(context).trigger(event, data)
    return !event.isDefaultPrevented()
  }

  // trigger an Ajax "global" event
  function triggerGlobal(settings, context, eventName, data) {
    if (settings.global) return triggerAndReturn(context || document, eventName, data)
  }

  // Number of active Ajax requests
  $.active = 0

  function ajaxStart(settings) {
    if (settings.global && $.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
  }
  function ajaxStop(settings) {
    if (settings.global && !(--$.active)) triggerGlobal(settings, null, 'ajaxStop')
  }

  // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
  function ajaxBeforeSend(xhr, settings) {
    var context = settings.context
    if (settings.beforeSend.call(context, xhr, settings) === false ||
        triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
      return false

    triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
  }
  function ajaxSuccess(data, xhr, settings, deferred) {
    var context = settings.context, status = 'success'
    settings.success.call(context, data, status, xhr)
    if (deferred) deferred.resolveWith(context, [data, status, xhr])
    triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
    ajaxComplete(status, xhr, settings)
  }
  // type: "timeout", "error", "abort", "parsererror"
  function ajaxError(error, type, xhr, settings, deferred) {
    var context = settings.context
    settings.error.call(context, xhr, type, error)
    if (deferred) deferred.rejectWith(context, [xhr, type, error])
    triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error || type])
    ajaxComplete(type, xhr, settings)
  }
  // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
  function ajaxComplete(status, xhr, settings) {
    var context = settings.context
    settings.complete.call(context, xhr, status)
    triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
    ajaxStop(settings)
  }

  // Empty function, used as default callback
  function empty() {}

  $.ajaxJSONP = function(options, deferred){
    if (!('type' in options)) return $.ajax(options)

    var _callbackName = options.jsonpCallback,
      callbackName = ($.isFunction(_callbackName) ?
        _callbackName() : _callbackName) || ('jsonp' + (++jsonpID)),
      script = document.createElement('script'),
      originalCallback = window[callbackName],
      responseData,
      abort = function(errorType) {
        $(script).triggerHandler('error', errorType || 'abort')
      },
      xhr = { abort: abort }, abortTimeout

    if (deferred) deferred.promise(xhr)

    $(script).on('load error', function(e, errorType){
      clearTimeout(abortTimeout)
      $(script).off().remove()

      if (e.type == 'error' || !responseData) {
        ajaxError(null, errorType || 'error', xhr, options, deferred)
      } else {
        ajaxSuccess(responseData[0], xhr, options, deferred)
      }

      window[callbackName] = originalCallback
      if (responseData && $.isFunction(originalCallback))
        originalCallback(responseData[0])

      originalCallback = responseData = undefined
    })

    if (ajaxBeforeSend(xhr, options) === false) {
      abort('abort')
      return xhr
    }

    window[callbackName] = function(){
      responseData = arguments
    }

    script.src = options.url.replace(/\?(.+)=\?/, '?$1=' + callbackName)
    document.head.appendChild(script)

    if (options.timeout > 0) abortTimeout = setTimeout(function(){
      abort('timeout')
    }, options.timeout)

    return xhr
  }

  $.ajaxSettings = {
    // Default type of request
    type: 'GET',
    // Callback that is executed before request
    beforeSend: empty,
    // Callback that is executed if the request succeeds
    success: empty,
    // Callback that is executed the the server drops error
    error: empty,
    // Callback that is executed on request complete (both: error and success)
    complete: empty,
    // The context for the callbacks
    context: null,
    // Whether to trigger "global" Ajax events
    global: true,
    // Transport
    xhr: function () {
      return new window.XMLHttpRequest()
    },
    // MIME types mapping
    // IIS returns Javascript as "application/x-javascript"
    accepts: {
      script: 'text/javascript, application/javascript, application/x-javascript',
      json:   jsonType,
      xml:    'application/xml, text/xml',
      html:   htmlType,
      text:   'text/plain'
    },
    // Whether the request is to another domain
    crossDomain: false,
    // Default timeout
    timeout: 0,
    // Whether data should be serialized to string
    processData: true,
    // Whether the browser should be allowed to cache GET responses
    cache: true
  }

  function mimeToDataType(mime) {
    if (mime) mime = mime.split(';', 2)[0]
    return mime && ( mime == htmlType ? 'html' :
      mime == jsonType ? 'json' :
      scriptTypeRE.test(mime) ? 'script' :
      xmlTypeRE.test(mime) && 'xml' ) || 'text'
  }

  function appendQuery(url, query) {
    if (query == '') return url
    return (url + '&' + query).replace(/[&?]{1,2}/, '?')
  }

  // serialize payload and append it to the URL for GET requests
  function serializeData(options) {
    if (options.processData && options.data && $.type(options.data) != "string")
      options.data = $.param(options.data, options.traditional)
    if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
      options.url = appendQuery(options.url, options.data), options.data = undefined
  }

  $.ajax = function(options){
    var settings = $.extend({}, options || {}),
        deferred = $.Deferred && $.Deferred(),
        urlAnchor
    for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key]

    ajaxStart(settings)

    if (!settings.crossDomain) {
      urlAnchor = document.createElement('a')
      urlAnchor.href = settings.url
      urlAnchor.href = urlAnchor.href
      settings.crossDomain = (originAnchor.protocol + '//' + originAnchor.host) !== (urlAnchor.protocol + '//' + urlAnchor.host)
    }

    if (!settings.url) settings.url = window.location.toString()
    serializeData(settings)

    var dataType = settings.dataType, hasPlaceholder = /\?.+=\?/.test(settings.url)
    if (hasPlaceholder) dataType = 'jsonp'

    if (settings.cache === false || (
         (!options || options.cache !== true) &&
         ('script' == dataType || 'jsonp' == dataType)
        ))
      settings.url = appendQuery(settings.url, '_=' + Date.now())

    if ('jsonp' == dataType) {
      if (!hasPlaceholder)
        settings.url = appendQuery(settings.url,
          settings.jsonp ? (settings.jsonp + '=?') : settings.jsonp === false ? '' : 'callback=?')
      return $.ajaxJSONP(settings, deferred)
    }

    var mime = settings.accepts[dataType],
        headers = { },
        setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] },
        protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
        xhr = settings.xhr(),
        nativeSetHeader = xhr.setRequestHeader,
        abortTimeout

    if (deferred) deferred.promise(xhr)

    if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest')
    setHeader('Accept', mime || '*/*')
    if (mime = settings.mimeType || mime) {
      if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
      xhr.overrideMimeType && xhr.overrideMimeType(mime)
    }
    if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
      setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded')

    if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name])
    xhr.setRequestHeader = setHeader

    xhr.onreadystatechange = function(){
      if (xhr.readyState == 4) {
        xhr.onreadystatechange = empty
        clearTimeout(abortTimeout)
        var result, error = false
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
          dataType = dataType || mimeToDataType(settings.mimeType || xhr.getResponseHeader('content-type'))
          result = xhr.responseText

          try {
            // http://perfectionkills.com/global-eval-what-are-the-options/
            if (dataType == 'script')    (1,eval)(result)
            else if (dataType == 'xml')  result = xhr.responseXML
            else if (dataType == 'json') result = blankRE.test(result) ? null : $.parseJSON(result)
          } catch (e) { error = e }

          if (error) ajaxError(error, 'parsererror', xhr, settings, deferred)
          else ajaxSuccess(result, xhr, settings, deferred)
        } else {
          ajaxError(xhr.statusText || null, xhr.status ? 'error' : 'abort', xhr, settings, deferred)
        }
      }
    }

    if (ajaxBeforeSend(xhr, settings) === false) {
      xhr.abort()
      ajaxError(null, 'abort', xhr, settings, deferred)
      return xhr
    }

    if (settings.xhrFields) for (name in settings.xhrFields) xhr[name] = settings.xhrFields[name]

    var async = 'async' in settings ? settings.async : true
    xhr.open(settings.type, settings.url, async, settings.username, settings.password)

    for (name in headers) nativeSetHeader.apply(xhr, headers[name])

    if (settings.timeout > 0) abortTimeout = setTimeout(function(){
        xhr.onreadystatechange = empty
        xhr.abort()
        ajaxError(null, 'timeout', xhr, settings, deferred)
      }, settings.timeout)

    // avoid sending empty string (#319)
    xhr.send(settings.data ? settings.data : null)
    return xhr
  }

  // handle optional data/success arguments
  function parseArguments(url, data, success, dataType) {
    if ($.isFunction(data)) dataType = success, success = data, data = undefined
    if (!$.isFunction(success)) dataType = success, success = undefined
    return {
      url: url
    , data: data
    , success: success
    , dataType: dataType
    }
  }

  $.get = function(/* url, data, success, dataType */){
    return $.ajax(parseArguments.apply(null, arguments))
  }

  $.post = function(/* url, data, success, dataType */){
    var options = parseArguments.apply(null, arguments)
    options.type = 'POST'
    return $.ajax(options)
  }

  $.getJSON = function(/* url, data, success */){
    var options = parseArguments.apply(null, arguments)
    options.dataType = 'json'
    return $.ajax(options)
  }

  $.fn.load = function(url, data, success){
    if (!this.length) return this
    var self = this, parts = url.split(/\s/), selector,
        options = parseArguments(url, data, success),
        callback = options.success
    if (parts.length > 1) options.url = parts[0], selector = parts[1]
    options.success = function(response){
      self.html(selector ?
        $('<div>').html(response.replace(rscript, "")).find(selector)
        : response)
      callback && callback.apply(self, arguments)
    }
    $.ajax(options)
    return this
  }

  var escape = encodeURIComponent

  function serialize(params, obj, traditional, scope){
    var type, array = $.isArray(obj), hash = $.isPlainObject(obj)
    $.each(obj, function(key, value) {
      type = $.type(value)
      if (scope) key = traditional ? scope :
        scope + '[' + (hash || type == 'object' || type == 'array' ? key : '') + ']'
      // handle data in serializeArray() format
      if (!scope && array) params.add(value.name, value.value)
      // recurse into nested objects
      else if (type == "array" || (!traditional && type == "object"))
        serialize(params, value, traditional, key)
      else params.add(key, value)
    })
  }

  $.param = function(obj, traditional){
    var params = []
    params.add = function(key, value) {
      if ($.isFunction(value)) value = value()
      if (value == null) value = ""
      this.push(escape(key) + '=' + escape(value))
    }
    serialize(params, obj, traditional)
    return params.join('&').replace(/%20/g, '+')
  }
})(Zepto)

;(function($){
  $.fn.serializeArray = function() {
    var name, type, result = [],
      add = function(value) {
        if (value.forEach) return value.forEach(add)
        result.push({ name: name, value: value })
      }
    if (this[0]) $.each(this[0].elements, function(_, field){
      type = field.type, name = field.name
      if (name && field.nodeName.toLowerCase() != 'fieldset' &&
        !field.disabled && type != 'submit' && type != 'reset' && type != 'button' && type != 'file' &&
        ((type != 'radio' && type != 'checkbox') || field.checked))
          add($(field).val())
    })
    return result
  }

  $.fn.serialize = function(){
    var result = []
    this.serializeArray().forEach(function(elm){
      result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
    })
    return result.join('&')
  }

  $.fn.submit = function(callback) {
    if (0 in arguments) this.bind('submit', callback)
    else if (this.length) {
      var event = $.Event('submit')
      this.eq(0).trigger(event)
      if (!event.isDefaultPrevented()) this.get(0).submit()
    }
    return this
  }

})(Zepto)

;(function($){
  // __proto__ doesn't exist on IE<11, so redefine
  // the Z function to use object extension instead
  if (!('__proto__' in {})) {
    $.extend($.zepto, {
      Z: function(dom, selector){
        dom = dom || []
        $.extend(dom, $.fn)
        dom.selector = selector || ''
        dom.__Z = true
        return dom
      },
      // this is a kludge but works
      isZ: function(object){
        return $.type(object) === 'array' && '__Z' in object
      }
    })
  }

  // getComputedStyle shouldn't freak out when called
  // without a valid element as argument
  try {
    getComputedStyle(undefined)
  } catch(e) {
    var nativeGetComputedStyle = getComputedStyle;
    window.getComputedStyle = function(element){
      try {
        return nativeGetComputedStyle(element)
      } catch(e) {
        return null
      }
    }
  }
})(Zepto)
