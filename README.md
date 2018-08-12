# tiny-pack
实现一个小型的打包器，学习打包工具的实现原理。

## 实现思路
1. 创建资源:
首先将模块格式化为一份资源。一份资源应该包括模块的uid、模块转换成es5后的代码、模块的依赖。
其中模块的依赖最为重要，打包的原理在于顺着入口模块的依赖，逐一引用打包成一个最终的Bundle。
*获取模块依赖的方法*其实也很简单，只需要将代码转换为ast，然后访问其中引用依赖的节点即可。为简单起见这里只使用了es6的引用语法，由于是静态引用因此只需要访问```ImportDeclaration```节点即可。其中需要访问的节点可以参考[estree规范](https://github.com/estree/estree/blob/master/es2015.md)。
这里的依赖的形式仅仅为*相对路径*，但相对路径是不足够的。

2. 创建依赖图谱:
职责有二:
一是根据入口模块的依赖，遍历每一层的所有依赖，使用*创建资源*的函数将所有需要引用的模块全部格式化为资源。具体为，使用for循环顺着入口模块的依赖，一层一层的遍历所有的模块，遇到依赖则加入遍历集合内。
二是创建依赖资源(child)后，将*相对路径 => 资源id*的映射表(mapping)储存在当前资源(parent)中。后续需要用到根据相对路径引用资源。

3. 打包所有资源:
最终Bundle的形式必然是一个IIFE。而传入的参数正是所有格式化后的资源。
这一步最重要的是实现打包工具的模块系统。
每一个模块具备一块的命名空间，具有独立的函数作用域。这里的假设是，代码均转换为commonJs规范。由于浏览器并不能理解commonJs规范，因此需要打包工具实现自己的模块系统。具体实现为:
```js
//模块
function (require, module, module.exports) {
  //... code
}

// ...

//require函数
function require(id) {
  const [fn, mapping] = modules[id]
  function localRequire(relativePath) {
    return require(mapping[relativePath])
  }
  const module = { exports: {} }
  fn(localRequire, module, module.exports)
  return module.exports
}
```
