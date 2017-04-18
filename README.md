# Gulp-Webpack ver 0.2.1

自動化構建工具。

#### 下面我都是亂寫的（

剛剛開始聯網安裝，測試中。

## 最近更新

ver 0.2.1

1. 測試通過 `css-sprite`， `imagemin`， `webpack` ，`rev`， `stylelint`；
2. 增加eslint校驗規則；
3. 增加.stylelintrc文件（未完成）；
4. webpack2移除了 `DedupePlugin`，so我把這個刪掉了；
5. 增加 `gulp minify-module-css` 來壓縮module裡被提取出來的css文件；
6. 壓縮css時移除special comments；
7. 刪掉一些測試代碼；
8. 修復更改環境變量的指令多了空格報錯的bug；

ver 0.2.0

1. 測試通過 `sass-to-css`， `minify-css`， `eslint`， `jscompress`；
2. 增加eslint校驗規則；
3. 增加了 `gulp wp` 命令做webpack版，默認 `gulp` 命令不使用webpack編譯；
4. 修復了一些脫字誤字引起的bug；

## 功能

- sass編譯
- sass校驗
- css補全
- css壓縮
- css sprite生成
- js校驗
- js壓縮
- 文件模塊化
- 提出公共文件
- browser-sync

## 主要目錄結構

```
├── build
│   └── css                    # sass編譯後，未經壓縮的css文件
│   └── icon                   # 圖標文件
│   └── images                 # 圖片目錄
│   └── js                     # 非第三方插件的js文件
│   └── module                 # 第一級為chunk分類，第二級為頁面
│       └── common-list		   # 每個文件夾對應一個頁面
│           └── a
│           	└── index.js
│           └── b
│           	└── index.js
│       └── common-page
│       └── ...
│   └── sass                   # sass文件目錄
├── dist                       # 輸出目錄
│   └── css					   # 不使用webpack的css輸出目錄
│   └── js					   # 不使用webpack的js輸出目錄
│   └── module				   # 使用webpack生成的js和css文件
│   └── ...
├── vendor                     # 插件和庫
│   └── ...
└── gulpfile.js
└── webpack.config.js
```

我是這麼想的，但現在的腳本能不能按照我所想的正確輸出我還不知道。

## 使用

首先電腦要安裝node.js，這裡不累述node.js的安裝姿勢了。

### 克隆項目

```
$ git clone git@github.com:HenriettaSu/Gulp-Webpack.git
```

### 安裝

```
$ cd Gulp-Webpack
$ node install --save-dev
```

### 環境變量

本套件會根據環境有不同的配置，**默認為開發環境**，當需要生成發佈版的時候，請將環境變量改為發佈環境。

更改**當前終端**下環境變量：

```
$ export NODE_ENV=production
```

### gulp命令

#### sprite生成

```
$ gulp css-sprite
```

#### 圖片壓縮

```
$ gulp imagemin
```

執行壓縮任務前，會先執行 `css-sprite` 生成sprite。

#### 樣式校驗

```
$ gulp stylelint
```

#### sass編譯

```
$ gulp sass-to-css
```

會首先執行 `stylelint` 任務，通過校驗後才能編譯sass文件。

前綴補全會在這裡執行。

#### css壓縮

```
$ gulp minify-css
```

壓縮的文件將會輸出到 `dist/css` 目錄下。

#### module中的css文件壓縮

```
$ gulp minify-module-css
```

使用webpack生成的css文件（在 `dist/module` 目錄下）沒有經過壓縮，需要執行這個命令來進行壓縮。

#### js校驗

```
$ gulp eslint
```

校驗規則使用eslint，可以自己配置。

#### js壓縮

```
$ gulp jscompress
```

會首先執行 `eslint` 任務，通過校驗才能壓縮。

**可能會廢棄這個功能**，反正webpack就會進行打包壓縮。

#### webpack

```
$ gulp webpack
```

目前webpack的作用是提取公共文件，壓縮js。

#### 啟動browser-sync

```
$ gulp browser-sync
```

熱啟動，同時生成內網可以瀏覽的地址，供不同設備調試。

#### gulp

```
$ gulp
```

進入監聽狀態，自動編譯文件，文件更新時自動刷新頁面。

#### gulp with webpack

```
$ gulp wp
```

同上。區別在於這個使用了webpack：提取公共文件，css和js用webpack打包壓縮。

## 構建說明

考慮到某些情況下，頁面類型不同導致加載文件差異較大，module先以文件夾對頁面進行簡單分類如：列表頁、詳情頁、等，每個頁面又需要一個文件夾對應，加載的文件以 `require()` 的形式寫在 `index.js` 文件內。

目前設想的是，react、jquery之類的通過 `<script>` 單獨引入，其他第三方插件打包一起（TODO：配置拓展要不要打包到一起？）並分公共文件和獨立文件，共三個（若配置拓展獨立的話，四個）。

詳細參看 `webpack.config.js` 文件，有簡單註釋，暫時覺得沒有什麼需要特別拿出來說的。

## 分支說明

- `build` 開發分支
- `dist` 包含全部編譯後代碼的分支
- `vendor` 庫、第三方插件分支

## TODO

1. 要不要用 `WebpackBrowserPlugin` 替代 `browser-sync`；

2. 關於發佈分支：

   A. 除了dist分支，再分一個發佈用的輸出分支，更改環境變量來控制編譯配置；

   B. 新建一個task，通過gulp來對開發環境輸出的dist分支裡的文件進行壓縮編譯；

3. 單頁面應用；

## 聯繫與討論

QQ：3088680950

如果發現八阿哥了或者有功能上的建議，推薦通過 `issue` 發起討論。

## License

[MIT license](https://opensource.org/licenses/MIT). 有好的想法歡迎提供。