# kdt front template

包含了sass编译、requirejs编译、压缩打包和七牛cdn上传，以及md5文件映射

## 安装

    npm install kdt_front
  
然后拷出 template 里的内容，修改gulpfile.js里的配置信息(七牛的key和secret，前缀)

再运行 `npm install`

## 目录结构

    项目根目录
      front
      gulpfile.js
      package.json
      /config
      	  version.php
      /static
          /asset
              /img
          /js
          /sass
          /vendor
          /build
              /local
                  /css
              /product
                  /css
                  /js
    
