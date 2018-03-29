# HttpNetworking

参考[RTNetworking](https://github.com/casatwy/RTNetworking) 设计了HttpNetworking（待上传代码），用于对接不同后端微服务。每个微服务有自己的Service，提供ApiProvider 来为每个Service 下可注册多个Api。

目前来看，这个库的设计带入了太多的层级（Service、RequestGenerator、ApiProvider），实际使用中，甚至连我自己都要经常查看代码来确定options 是否可用，可以说，记忆成本太大。

不是一个完备的JS 工具库，单纯从项目中抽取出来的而已。
