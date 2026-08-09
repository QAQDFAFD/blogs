# webpack 的 loader 和 plugin 原理解析

## 1.为什么需要 loader

webpack 本身的能力是为了打包项目，只能识别 JavaScript 和 JSON 代码，并且默认只会做：

- import / require 的解析
- 模块的合并
- 输入 bundle

但是实际上我们的项目工程中遍布 `.vue`、`.ts`、`.css`、`图片、字体`、`.html` 等文件，webpack无法识别这些文件，loader 就是 webpack 用来识别 JS、JSON 以外的模块。

## 2.loader

### 2.1 loader 的分类

webpack 中的 loader 分为四种：

-   pre： 前置 loader，通常用于 lint、预检查、注入一些元信息；
-   normal： 普通 loader，没有特别标注就是普通 loader；
-   inline： 内联 loader，`import x from 'style-loader!css-loader!./a.css'`，强行制定某个文件的laoder，一般不这样写；
-   post： 后置 loader，用于收尾类处理，比如处理 source map；

### 2.2 loader 的执行顺序

<span style="color:#008B45">pre > normal > inline > post</span>

先按类型排列，然后相同类型从右往左执行。

![image-20251224234716253](https://pub-77095233bee8479b893be7e88bb7c7b2.r2.dev/2025/12/e46dd34bb70b623efed430b4b9ff1789.png)

![image-20251224222615235](https://pub-77095233bee8479b893be7e88bb7c7b2.r2.dev/2025/12/21a84e2d710e7c899957b7407b6f5e40.png)

![image-20251224222649988](https://pub-77095233bee8479b893be7e88bb7c7b2.r2.dev/2025/12/4dc798bc01dd0ae813170c7369a29ecb.png)

```js
module: {
  rules: [
    { enforce: 'pre', use: ['pre1', 'pre2'] },
    { use: ['norm1', 'norm2'] },
    { use: ['inline1', 'inline2'], enforce: 'inline' },
    { enforce: 'post', use: ['post1', 'post2'] },
    { use: ['norm3', 'norm4'] },
  ]
}
```

```js
pre2
pre1
norm4
norm3
norm2
norm1
inline2
inline1
post2
post1
```

### 2.3 编写 loader

loader 的本质就是一个函数，编写 loader 其实就是编写一个函数，在 webpack 解析资源的时候调用

-   调用的时候 webpack 会将匹配到的文件的内容作为参数传入
    -   content：传入的内容，默认是 utf-8 ，实际上参数除了内容还有以下两个
    -   map：和 SourceMap 相关，传递给下一个loader来保持调试映射
    -   meta：其他 loader 传递过来的数据，当上一个 loader **显式返回 meta** 时，下一个 loader 才能读到

babel-demo.js

```js
module.exports = function (content, map, meta) {
	console.log('loader-demo.js') // 这里可以对 content 进行处理
	return content
}
```

webpack.config.js

```js
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
	entry: './src/main.js',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'js/[name].js',
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				use: ['./loaders/loader-demo.js']
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname + '/public/index.html')
		})
	],
	mode: 'development'
}
```

### 2.4 不同 loader 的定义方式

#### 同步 loader

同步 loader 直接 return 处理后的内容：

```js
module.exports = function (content, map, meta) {
  return content // 返回多个内容，需要这样 return this.callback(content, map, meta)
}
```

#### 异步 loader

当处理过程耗时较长时（文件读写、数据库操作）可使用异步 loader，通过 this.async() 获取回调函数，并在异步任务完成后回传结果。

```js
module.exports = function (content, map, meta) {
  const callback = this.async() // 告知 webpack runner 要异步执行
  setTimeout(() => {
    callback(null, result, map, meta)
  }, 1000)
}
```

#### raw loader

Raw loader 适用于图片、字体等二进制资源；开启方式是设置 module.exports.raw = true，此时传入的 content 为 Buffer。 

```js
const mime = require('mime-types');

module.exports = function imageBase64Loader(content) {
  // 1. 声明 Loader 可缓存
  this.cacheable && this.cacheable();
  // 2. 获取文件类型
  const mimeType = mime.lookup(this.resourcePath);
  if (!mimeType) {
    return this.callback(
      new Error('无法识别图片类型: ' + this.resourcePath)
    );
  }
  // 3. Buffer → Base64
  const base64 = content.toString('base64');
  // 4. 拼接 data url
  const dataUrl = `data:${mimeType};base64,${base64}`;
  // 5. 返回 JS 模块代码
  const code = `module.exports = ${JSON.stringify(dataUrl)};`;
  // 6. 通过 callback 返回
  this.callback(null, code);
};

// 7. 告诉 webpack：我接收的是二进制
module.exports.raw = true;
```

#### pitching loader

> Pre  loader 和 pitch loader 之间没有关系，前者是分类概念，后者是 loader 中的钩子函数。

Loader 支持 pitch 方法，即预处理，可在 normal 执行前进行预处理，在webpack真正的loader之前，从左往右调用。pitch 阶段具有“熔断”特性——如果 pitch 返回了内容，则后续剩余 pitch 与 normal loader 可能会被跳过，Webpack 会回到上一个 loader 的 normal 阶段继续执行。

```js
module.exports = function (content) {
  return content
}

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
  console.log('do somethings')
}
```

![image-20251225000323267](https://pub-77095233bee8479b893be7e88bb7c7b2.r2.dev/2025/12/f7cd6bf25a2b1e71607946bd15381933.png)

### 2.5 loader 常用的 api

| **API**                                | **类型** | **作用**             | **典型使用场景**         |
| -------------------------------------- | -------- | -------------------- | ------------------------ |
| this.getOptions()                      | function | 获取 loader 配置参数 | 读取用户自定义选项       |
| this.resourcePath                      | string   | 当前文件的绝对路径   | 根据文件名/路径处理      |
| this.resourceQuery                     | string   | 文件的 query 参数    | import xx from './a?raw' |
| return content                         | —        | 同步返回结果         | 简单字符串替换           |
| this.callback(err, content, map, meta) | function | 手动返回结果         | 需要 map / meta          |
| this.async()                           | function | 声明异步 loader      | 读文件、请求网络         |
| this.sourceMap                         | boolean  | 是否开启 source map  | 决定是否返回 map         |
| this.addDependency(file)               | function | 添加额外依赖         | watch 外部文件           |
| this.emitWarning(warning)              | function | 发出构建警告         | 非致命问题               |
| this.emitError(error)                  | function | 发出构建错误         | 中断构建                 |

### 2.6 简单 loader 编写

clean-log-loader

```js
// loaders/clean-log-loader.js
module.exports = function cleanLogLoader(content) {
	// 将console.log替换为空
	return content.replace(/console\.log\(.*\);?/g, '')
}
```

doc-loader

```js
const schema = require('./schema.json')

module.exports = function (content) {
	// 获取loader的options，同时对options内容进行校验
	// schema是options的校验规则（符合 JSON schema 规则）
	const options = this.getOptions(schema)

	const prefix = `
    /*
    * Author: ${options.author}
    */
  `

	return `${prefix} \n ${content}`
}
```

```js
{
	"type": "object", // 我们的 options 是个对象
	"properties": {
		// 对象上的多个属性的配置
		"author": {
			// 我们的对象上只有一个属性叫做 author
			"type": "string"
		}
	},
	"additionalProperties": false // 是否允许在 options 中追加属性
}
```

babel-loader

![image-20251224224134114](/Users/lijiajun/Library/Application Support/typora-user-images/image-20251224224134114.png)

## 3.plugin

### 3.1 什么是 plugin

把自定义逻辑插入到 Webpack 运行流程中，并在特定时间点触发。Webpack 在执行过程中会触发一系列 Tapable hooks，插件就是通过在这些 hooks 上注册回调来运行。

### 3.2 webpack 执行流程

![image-20251226010103160](https://pub-77095233bee8479b893be7e88bb7c7b2.r2.dev/2025/12/1342d5922ba6f4a3ee3b504d5937f7ed.png)

| **阶段顺序** | **所属对象**           | **阶段说明**     | **关键 Hook（Webpack 5）**  | **这一阶段 Webpack 在做什么**     | **Plugin 通常做什么**              |
| ------------ | ---------------------- | ---------------- | --------------------------- | --------------------------------- | ---------------------------------- |
| 1            | CLI                    | 启动             | —                           | 启动 Node 进程，加载 webpack      | —                                  |
| 2            | Compiler               | 读取配置         | environmentafterEnvironment | 读取并规范化 webpack.config.js    | 校验环境、注入全局变量             |
| 3            | Compiler               | 注册插件         | entryOption                 | 执行 plugin.apply，注册 hooks     | 修改 entry、初始化插件             |
| 4            | Compiler               | 构建前           | beforeRun                   | 构建即将开始                      | 清缓存、打日志                     |
| 5            | Compiler               | 构建开始         | run                         | 开始一次构建                      | 性能统计                           |
| 6            | Compiler               | 编译准备         | compile                     | 即将创建 Compilation              | 修改编译参数                       |
| 7            | Compiler → Compilation | 创建编译上下文   | thisCompilationcompilation  | 创建一次 Compilation              | **注册 Compilation hooks（关键）** |
| 8            | Compilation            | 构建模块         | buildModule                 | 某个模块开始构建                  | 统计模块                           |
| 9            | Compilation            | 读取文件         | —                           | 从文件系统读取源码                | —                                  |
| 10           | Compilation            | 执行 Loader      | —                           | Loader 链右 → 左执行，生成 JS     | Loader 不在 Plugin 阶段            |
| 11           | Compilation            | 模块完成         | succeedModule               | 单个 Module 构建完成              | 收集模块信息                       |
| 12           | Compilation            | 解析依赖         | —                           | AST 解析 import / require         | 构建依赖关系                       |
| 13           | Compilation            | 递归构建         | —                           | 创建依赖 Module，回到 buildModule | **递归发生在这里**                 |
| 14           | Compilation            | 模块阶段结束     | seal                        | Module Graph 完成                 | 不再新增模块                       |
| 15           | Compilation            | 模块优化         | optimizeModules             | Tree Shaking 等模块优化           | 分析模块                           |
| 16           | Compilation            | Chunk 生成与优化 | optimizeChunks              | **生成 / 重分 chunk**             | **splitChunks 生效**               |
| 17           | Compilation            | Chunk 完成       | afterOptimizeChunks         | Chunk Graph 确定                  | 分析 chunk 结构                    |
| 18           | Compilation            | 处理产物         | processAssets               | 生成 / 修改最终资源               | HtmlWebpackPlugin、CSS 抽离        |
| 19           | Compiler               | 输出文件         | emit                        | 写入 dist 目录                    | 最后修改文件                       |
| 20           | Compiler               | 构建结束         | done                        | 一次构建结束                      | 构建报告、通知                     |

### 3.3 常见 plugin 执行位置

| **Plugin**           | **插入点**                           |
| -------------------- | ------------------------------------ |
| HtmlWebpackPlugin    | compilation.processAssets            |
| DefinePlugin         | compilation（构建阶段，影响 parser） |
| MiniCssExtractPlugin | compilation + processAssets          |
| TerserPlugin         | optimizeChunks / processAssets       |
| BannerPlugin         | processAssets                        |

### 3.3 开发一个 plugin

assets-list-plugin

```js
class AssetsListPlugin {
  apply(compiler) {
    // 每次 compilation 创建时进入
    compiler.hooks.thisCompilation.tap('AssetsListPlugin', (compilation) => {
      const { RawSource } = compiler.webpack.sources;

      compilation.hooks.processAssets.tap(
        {
          name: 'AssetsListPlugin',
          // 选一个较晚阶段，确保 assets 基本齐了
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          const list = Object.keys(assets)
            .sort()
            .map((name) => `- ${name}`)
            .join('\n');

          compilation.emitAsset('assets.md', new RawSource(list));
        }
      );
    });
  }
}

module.exports = AssetsListPlugin;
```



## 4.总结

![image-20251225231454992](https://ljj-image.top/2026/08/85370299296169a60ed5eace4af46125.png)

