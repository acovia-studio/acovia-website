# 开发文档

本目录记录 `acovia-core` 数据包与服务端维护所需的技术资料。文档以实际代码为准；代码与文档不一致时，应先确认代码行为，再修正文档。

## 阅读顺序

维护者先读数据包总览，再按“定义 → 触发 → 行为”的顺序查阅对应章节：

| 层 | 章节 | 内容 |
| --- | --- | --- |
| 总览 | [数据包总览](/develop/datapack) | 分层结构、目录、加载与调度、玩家准入 |
| 定义 | [物品与配方](/develop/datapack/items) | 自定义物品、组件、配方、礼包、权限令牌 |
| 定义 | [附魔](/develop/datapack/enchantments) | 数据驱动附魔、触发条件、商店与测试 |
| 定义 | [多维度](/develop/datapack/dimensions) | 维度定义、边界传送、新增与删除维度 |
| 定义 | [世界生成](/develop/datapack/worldgen) | 生物群系、地物、放置规则 |
| 触发 | [进度与判据](/develop/datapack/advancements) | 成员成就、事件触发器、复位、判据 |
| 行为 | [内置函数](/develop/datapack/functions) | 加载入口、周期任务、玩家生命周期、商店与发放 |

## 操作文档

| 章节 | 内容 |
| --- | --- |
| [本地开发与调试](/develop/guide/dev) | 测试服务端、重载、命令、常见故障 |
| [发布与版本](/develop/guide/release) | 版本号、打包、部署、回滚 |
| [存档备份](/develop/maintain-save/backup) | 存档结构、文件作用、备份与恢复 |
| [区域迁移](/develop/maintain-save/region-migration) | 区块文件、混合标记、迁移流程 |
| [管理员模式](/develop/maintain-save/admin-mode) | 单人存档内切换至管理员模式 |

先完成数据包的本地验证，再修改存档；涉及存档的操作按[维护文档](/develop/maintain-save)执行。
