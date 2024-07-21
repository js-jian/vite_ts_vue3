1. 找不到名称“require”。是否需要安装 Node.js 的类型定义    
解决：yarn add -D @types/node
2. main.ts 文件中报错 找不到模块“@/router/index.ts”或其相应的类型声明    
解决：tsconfig.app.json增加一下配置
```
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
```
3. npm install 时报错 ERESOLVE unable to resolve dependency tree               
解决：npm install --legacy-peer-deps
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR!
npm ERR! While resolving: @vue-devtools/app-frontend@0.0.0
npm ERR! Found: vue@3.3.4
npm ERR! node_modules/vue
npm ERR!   vue@"^3.3.4" from @vue-devtools/app-frontend@0.0.0
npm ERR!   packages/app-frontend
npm ERR!     @vue-devtools/app-frontend@0.0.0
npm ERR!     node_modules/@vue-devtools/app-frontend
npm ERR!       workspace packages\app-frontend from the root project
npm ERR!       4 more (@vue-devtools/shell-chrome, @vue/devtools, ...)
npm ERR!
npm ERR! Could not resolve dependency:
npm ERR! peer vue@"^2.5.13" from @vue/ui@0.12.5
npm ERR! node_modules/@vue/ui
npm ERR!   @vue/ui@"^0.12.5" from @vue-devtools/app-frontend@0.0.0
npm ERR!   packages/app-frontend
npm ERR!     @vue-devtools/app-frontend@0.0.0
npm ERR!     node_modules/@vue-devtools/app-frontend
npm ERR!       workspace packages\app-frontend from the root project
npm ERR!       4 more (@vue-devtools/shell-chrome, @vue/devtools, ...)
npm ERR!
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
```


```
原因：

假设我们现在有一个Hello工程，已经在其根目录下的package.json文件中的dependencies字段里声明了packageA作为依赖，而其下面有两个项目app_A和app_B，它们也依赖packageA。如果我们用dependencies而不是peerDepenedencies来声明，那么npm install安装完项目之后的依赖结构如下所示：

├── Hello
│   └── node_modules
│       ├── packageA
│       ├── app_A
│       │   └── nodule_modules
│       │       └── packageA
│       └── app_B
│       │   └── nodule_modules
│       │       └── packageA


从上可以看出，packageA依赖包被安装了3次，造成了2次安装冗余。

　　而如果采用peerDepenedency来下载，就可以避免这个核心依赖库被重复下载的问题。还是上面那个场景，我们在项目app_A和app_B的package.json文件里的peerDependencies字段声明一下核心依赖库packageA，然后在根目录的package.json文件里的dependencies字段也声明一下packageA。

//peerDependency 可以避免类似的核心依赖库被重复下载的问题
//如果在plugin1和plugin2的package.json中使用peerDependency来声明核心依赖库
//plugin1/package.json
{
  "peerDependencies": {
    "packageA": "1.0.1"
  }
}
//plugin2/package.json
{
  "peerDependencies": {
    "packageA": "1.0.1"
  }
}

//在主系统中声明一下 packageA:helloWorld/package.json
{
  "dependencies": {
    "packageA": "1.0.1"
  }
}

接着再执行npm install，生成的依赖结构就会如下所示：

├── Hello
│   └── node_modules
│       ├── packageA
│       ├── app_A
│       └── app_B

如上所示，packageA就只会被安装一次。可以看到这时候生成的依赖图是扁平的，packageA 也只会被安装一次。

因此我们总结下在插件使用dependencies声明依赖库的特点：

- 如果用户显式依赖了核心库，则可以忽略各插件的peerDependencies声明；
- 如果用户没有显式依赖核心库，则按照插件peerDependencies中声明的版本将库安装到项目根目录中；
- 当用户依赖的版本、各插件依赖的版本之间不相互兼容，会报错让用户自行修复。
    npm 从版本v7开始，install就默认以peerDependencies的方式去下载了：

      1. 如果用户在根目录的package.json文件里显式依赖了核心库，那么各个子项目里的peerDepenedencies声明就可以忽略
      2. 如果用户没有显式依赖核心库，那么就按照子项目的peerDepenedencies中声明的版本将依赖安装到项目根目录里

    而方式2就会导致一个问题：用户依赖的包版本与各个子项目依赖的包版本相互不兼容，那么就会报错（无法解析依赖树的问题（依赖冲突））让用户自行去修复，因而导致安装过程的中断。（因为是从npm v7引入的，因此npm v3-v6就不会发生这个错误）


--legacy-peer-deps命令作用

　　在NPM v7中，现在默认安装peerDependencies。在很多情况下，这会导致版本冲突，从而中断安装过程

　　--legacy-peer-deps标志是在v7中引入的，目的是绕过peerDependency自动安装；它告诉 NPM 忽略项目中引入的各个modules之间的相同modules但不同版本的问题并继续安装，保证各个引入的依赖之间对自身所使用的不同版本modules共存

```

4. 在vite.config.ts文件中添加 import eslintPlugin from "vite-plugin-eslint"; 报以下错
```
无法找到模块“vite-plugin-eslint”的声明文件。“c:/Users/11841/Desktop/code/vite_ts_vue3/node_modules/vite-plugin-eslint/dist/index.mjs”隐式拥有 "any" 类型。
  There are types at 'c:/Users/11841/Desktop/code/vite_ts_vue3/node_modules/vite-plugin-eslint/dist/index.d.ts', but this result could not be resolved when respecting package.json "exports". The 'vite-plugin-eslint' library may need to update its package.json or typings.

原因：    
  由于 TypeScript 的变更，导致新版本的 typescript 与依赖包中 package.json 指明 TS 声明文件位置的 types 配置项不匹配，最终导致新版本的 TypeScript 找不到 vite-plugin-eslint 插件中的 TS 声明文件。
在新版的 TypeScript 中，已经不再使用 package.json 文件中根结构中的 types 字段指明 TS 声明文件位置，而是在 exprots 中相应的导入方式中添加 typs 字段指明 TS 声明文件位置。

官网地址： https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-7.html#packagejson-exports-imports-and-self-referencing

解决：   
在node_modules中找到vite-plugin-eslint/package.json文件，将其中的exports字段改成以下写法      
"exports": {
  ".": {
    "import": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.mjs"
    },
    "require": "./dist/index.js"
  }
},

```

5. 在vite.config.ts文件同级添加test.ts文件，然后在vite.config.ts中导入，报以下错
```
// test.ts
export const a = 1;

// vite.config.ts
import { test } from './test.ts'


An import path can only end with a '.ts' extension when 'allowImportingTsExtensions' is enabled.ts(5097)
文件 "c:/Users/11841/Desktop/code/vite_ts_vue3/test.ts" 不在项目 "c:/Users/11841/Desktop/code/vite_ts_vue3/tsconfig.node.json" 的文件列表中。项目必须列出所有文件，或使用 "include" 模式。

```
