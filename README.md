# Zepto-study
### zepto@1.1.6

 - zepto.init
 -  zepto.Z = function(dom, selector) {
     dom = dom || []
     dom.__proto__ = $.fn            // fn 替换掉 dom 的原型
     dom.selector = selector || ''
     return dom
   }

[zepto@1.1.6版本 源码解析加中文注释](./zepto@1.1.6.js)
