# Gulp-Webpack ver 1.0.0

自動化構建工具。

包含單頁面應用和多頁面應用策略。

## 最近更新

ver 1.0.0

1. 單頁面應用版搞定了；
2. 修復了 `expose-loader` 姿勢過時引起的全局變量暴露失敗bug；

ver 0.2.2

1. 完成stylelint規則；
2. 測試通過 `gulp` 和 `gulp wp`；
3. 修復了添加版本號格式錯誤bug；

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
└── webpack.config.js		   # webpack配置
└── .eslintrc				   # eslint規則
└── .stylelintrc			   # stylelint規則
```

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

然後到 `node_modules/gulp-asset-rev/index.js` 裡找到下面代碼：

```
var verStr = (options.verConnecter || "-") + md5;
src = src.replace(verStr, '').replace(/(\.[^\.]+)$/, verStr + "$1");
```

替換成：

```
var verStr = (options.verConnecter || "") + md5;
src = src + '?v=' + verStr;
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

**重要提示：**校驗不通過將拋出錯誤，不能編譯文件。

校驗這種事還是有點主觀的，以下幾種規則都是為了增強可讀性的，刪掉或修改並不影響：

- `case` 類：大小寫
- `empty-lines` 類：空行
- `newline` 類：換行
- `space` 類：空格
- `whitespace` 類：空白

但是下列幾種規則**建議保留**：

- `color-no-invalid-hex`：避免無效的色值；
- `no-duplicate` 類：避免重複；
- `no-extra-semicolons`：避免多餘分號；
- `no-empty` 類：避免空塊等；
- `no-unknown` 類：避免脫字誤字；
- `no-vendor-prefix` 類：為了避免漏了前綴或使用了前綴過期，編譯sass的時會自動執行 `autoPrefixer()` 添加前綴；
- `shorthand-property-no-redundant-values`：避免可簡寫屬性出現冗余值；

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

1. 結合angular看看；
2. 插件版本管理；

## 聯繫與討論

QQ：3088680950

如果發現八阿哥了或者有功能上的建議，推薦通過 `issue` 發起討論。

## License

[MIT license](https://opensource.org/licenses/MIT). 有好的想法歡迎提供。