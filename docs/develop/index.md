# 开发文档

本目录记录 `acovia-core` 数据包与服务端维护所需的技术资料。文档以实际代码为准；代码与文档不一致时，应先确认代码行为，再修正文档。

## 阅读顺序

维护者应先阅读数据包总览与多维度，再按任务查阅对应章节：

| 章节 | 内容 |
| --- | --- |
| [数据包总览](/develop/datapack) | 目录结构、加载顺序、命名与版本 |
| [多维度](/develop/datapack/dimensions) | 维度定义、边界传送、新增与删除维度 |
| [内置函数](/develop/datapack/functions) | 加载、调度、商店、物品与附魔函数、公开 API |
| [附魔](/develop/datapack/enchantments) | 数据驱动附魔、价格、新增与测试 |
| [物品与配方](/develop/datapack/items) | 自定义物品、组件、配方、权限令牌 |
| [进度与判据](/develop/datapack/advancements) | 事件触发器、奖励函数、判据 |
| [世界生成](/develop/datapack/worldgen) | 生物群系、地物、放置规则 |
| [本地开发与调试](/develop/guide/dev) | 测试服务端、重载、命令、常见故障 |
| [发布与版本](/develop/guide/release) | 版本号、打包、部署、回滚 |
| [存档备份](/develop/maintain/backup) | 存档结构、文件作用、备份与恢复 |
| [种子迁移](/develop/maintain/ch-seed) | 区块文件、混合标记、迁移流程 |
| [管理员模式](/develop/maintain/admin-mode) | 单人存档内切换至管理员模式 |
