/**
 * 实现一个模块打包器:
 * ? 最终实现形式:一个自执行函数，传入模块资源集合，从require入口开启，按照依赖图谱全部引用成功
 */
// 由单一文件格式化为模块系统需要资源
const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const traverse = require('babel-traverse').default

/**
 * createAsset
 * @param {String} file 文件绝对路径
 * @returns {Number} id 资源uid
 * @returns {String} code 代码
 * @returns {String} dependencies 依赖
 */
let _uid = 0

function createAsset(filename) {
  const rawCode = fs.readFileSync(filename, 'utf-8')
  const id = _uid++
  const dependencies = []

  const {
    ast,
  } = babel.transform(rawCode, {
    sourceType: 'module',
  })

  const visitor = {
    ImportDeclaration({
      node
    }) {
      dependencies.push(node.source.value)
    },
  }

  traverse(ast, {
    ...visitor,
  })

  const { code } = babel.transformFromAst(ast, null, {
    presets: ['env'],
  })  

  return {
    id,
    code,
    filename,
    dependencies,
  }
}

/**
 * createGraph 
 * 顺着入口模块遍历所有的依赖，并将所有模块格式化为资源。
 * 另外保留一份模块的相对路径-资源id的映射表，用于合并模块。
 * @param {String} entry 入口文件路径
 * @returns {Array} graph 以模块id为索引的依赖图谱
 */
function createGraph(entry) {
  const entryFile = createAsset(entry)
  const queues = [entryFile]
  for (const asset of queues) {
    asset.mapping = {}
    asset.dependencies.forEach(d => {
      const file = path.join(path.dirname(entry), d)
      const cur = createAsset(file)
      // 将资源的相对路径映射为资源的id，用于合并模块
      asset.mapping[d] = cur.id
      queues.push(cur)
    })
  }
  return queues
}

function bundle(graph) {
  //创建id => 模块函数+依赖映射表的hash表
  let modules = ''
  graph.forEach(mod => {
    // 后续实现打包器自身的模块系统, require与exports
    modules += `${mod.id}: [
      function(require, module, exports) {
        ${mod.code}
      },
      ${JSON.stringify(mod.mapping)},
    ],
    `
  })
  const result = `
  (function(modules){
    function require(id) {
      const [fn, mapping] = modules[id];

      function localRequire(name) {
        return require(mapping[name])
      }

      const module = { exports: {} };

      fn(localRequire, module, module.exports);
      return module.exports
    }
    return require(0)
  })({${modules}})
  `
  return result
}

function createBundle(filename) {
  const graph = createGraph(filename)
  return bundle(graph)
}

module.exports = createBundle