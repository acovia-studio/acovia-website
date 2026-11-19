# 数据包总览

`acovia-core` 是服务器使用的数据包，命名空间为 `acovia`。数据包定义维度、世界生成、附魔、物品配方、进度、判据与函数；服务端配置、插件与白名单不在数据包内。

## 目录结构

```text
acovia-core/
  pack.mcmeta
  data/
    acovia/
      advancement/     事件触发器与奖励函数
      dimension/       维度定义
      dimension_type/  维度类型
      enchantment/     数据驱动附魔
      function/        函数
      predicate/       判据
      recipe/          合成配方
      worldgen/        生物群系、地物与放置规则
    minecraft/
      tags/
        function/load.json      load 函数入口
        enchantment/curse.json  诅咒附魔标签
```

`pack.mcmeta` 的 `pack_format` 为 121，`supported_formats` 覆盖 0 至 121。数据包面向 Minecraft 26.x；升级版本时应同时检查 `pack_format` 与目录结构。

## 加载顺序

`data/minecraft/tags/function/load.json` 将 `acovia:load` 注册为加载函数。世界加载与 `/reload` 时执行该函数，内容依次为：

1. 创建 `minus` 与 `time` 计分板。
2. 启动 `acovia:base/timer`。
3. 启动 `acovia:base/beyond_the_border`。
4. 将主世界边界设为以 (0, 0) 为中心、边长 1024 格。

需要周期性执行的函数通过 `schedule` 自行续期。续期前应首先执行 `schedule clear`，避免 `/reload` 后出现重复调度。

## 命名与组织

函数按用途分组：

| 目录 | 内容 |
| --- | --- |
| `function/base/` | 加载、计时、边界、睡眠重置 |
| `function/entity/` | 村民交易与实体数据 |
| `function/item/` | 自定义物品的行为 |
| `function/enchantment/` | 自定义附魔的行为 |
| `function/get/` | 主城发放的物品与坐骑 |

标识符使用小写下划线形式，数据包内容统一使用 `acovia` 命名空间；与游戏原生机制衔接的标签放在 `data/minecraft/tags/` 下。

JSON 文件由仓库根目录的 `fmt.py` 统一格式化。手写 JSON 应保持现有缩进与键顺序，避免产生无关差异。

## 函数与数据的边界

数据包可以定义维度、世界生成、附魔、配方、进度、判据与函数，也可以读写计分板、实体数据与存档数据。以下内容不由数据包管理：

- 正版验证、白名单与玩家权限。
- 服务器端口、视距与性能参数。
- 备份与存档迁移。
- 客户端模组与资源包。

维护时应在对应层面排查：数据包问题使用 `/datapack`、`/function`、`/reload` 与日志；服务端问题检查 `server.properties`、Paper 配置与控制台。

## 版本与发布

数据包版本与服务器版本对应，发布标签形如 `v26.3-1`。发布前应完成以下检查：

1. `pack.mcmeta` 的 `pack_format` 与目标版本一致。
2. 新增或重命名的维度、函数、附魔、配方已在文档与更新日志中登记。
3. 在测试存档中验证加载、交易、物品、附魔、边界与维度。
4. 按[备份](/develop/maintain/backup)完成存档备份。

发布流程见[发布与版本](/develop/guide/release)。
