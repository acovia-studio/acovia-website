# 数据包总览

`acovia-core` 是服务器使用的数据包，命名空间为 `acovia`。它把声明数据、事件触发与执行逻辑分开，避免配方、进度与函数互相耦合：

| 层 | 位置 | 职责 |
| --- | --- | --- |
| 定义层 | `recipe/`、`enchantment/`、`dimension/`、`dimension_type/`、`worldgen/` | 物品配方、附魔、维度与地形，只声明数据 |
| 触发层 | `advancement/`、`predicate/`、`data/minecraft/tags/` | 监听游戏事件、判断条件、注册加载入口与诅咒标签 |
| 行为层 | `function/` | 事件触发后的行为、周期任务、玩家准入与商店注入 |
| 接入层 | `function/entity/`、`function/get/` | 向世界写入交易，发放物品与坐骑 |

依赖方向固定：触发层引用定义层，行为层由触发层调用。行为层可以依赖定义层写入的组件，但不反向改写配方或附魔；同一份数据只在一个层里维护。

## 目录结构

```text
acovia-core/
  pack.mcmeta
  fmt.py
  data/
    acovia/
      advancement/         事件触发器与可见成就
      dimension/           维度定义
      dimension_type/      维度规则
      enchantment/         数据驱动附魔
      function/
        load.mcfunction    加载入口
        cycle/             周期任务
        player/            玩家准入与初始化
        item/              物品行为
        enchantment/       附魔行为
        entity/            商店交易注入
        get/               发放物品与坐骑
      predicate/           条件判据
      recipe/              合成配方
      worldgen/            群系、地物与放置规则
    minecraft/
      tags/
        function/load.json      load 函数入口
        enchantment/curse.json  诅咒附魔标签
```

`worldgen/feature/` 是历史遗留的重复定义；实际生效的是 `configured_feature/` 与 `placed_feature/`，见[世界生成](/develop/datapack/worldgen)。

## 启动与调度

`data/minecraft/tags/function/load.json` 把 `acovia:load` 注册为加载函数。世界加载与 `/reload` 时执行：

```mcfunction
function acovia:cycle/teleport_outside_border
function acovia:cycle/reset_item_triggers
function acovia:cycle/enforce_whitelist
execute in minecraft:overworld run worldborder center 0.0 0.0
execute in minecraft:overworld run worldborder set 1024
```

`load` 不创建计分板，也不直接维护计时。三个 `cycle/` 函数在首次执行时完成一次检查并自行排期：

| 函数 | 间隔 | 职责 |
| --- | --- | --- |
| `acovia:cycle/teleport_outside_border` | 20 tick | 把主世界越界玩家送入 `acovia:resola` |
| `acovia:cycle/enforce_whitelist` | 20 tick | 维持访客与成员的生存模式状态 |
| `acovia:cycle/reset_item_triggers` | 2400 tick | 兜底撤回一次性事件触发器 |

每个周期函数都先 `schedule clear` 再重新排期，因此 `/reload` 不会留下重复任务。详见[内置函数](/develop/datapack/functions)。

## 玩家准入

玩家是否“正式加入”由进度 `acovia:welcome_to_acovia` 表示，不依赖计分板：

```text
进入服务器
  └─ 无 welcome_to_acovia
       └─ cycle/enforce_whitelist → player/apply_visitor_mode
            ▸ 冒险模式 + 屏幕提示

使用 Invitation
  └─ use_invitation → item/on_use_invitation
       └─ 授予 welcome_to_acovia
            └─ 奖励 player/setup_new_player
                 ▸ 生存模式 + Acovia Starter Kit
```

`welcome_to_acovia` 一经授予不会撤回；`enforce_whitelist` 每秒复查一次，因此状态切换最多延迟 20 tick。邀请函的发放由 `acovia:get/invitation` 完成，物品与流程见[物品与配方](/develop/datapack/items)。

::: note
这是数据包内的“软准入”，只影响游戏模式与提示。服务端 `whitelist.json`、正版验证与权限组仍由服务端管理，两者需要分别维护。
:::

## 命名与版本

- 标识符使用小写下划线；数据包内容统一使用 `acovia` 命名空间。
- 与原版机制衔接的标签放在 `data/minecraft/tags/` 下。
- 函数按生命周期分组：`load`、`cycle/`、`player/`、`item/`、`enchantment/`、`entity/`、`get/`；原 `base/` 目录已移除。
- `pack.mcmeta` 的 `pack_format` 为 121，`min_format` 为 0，`max_format` 为 `[121, 0]`，`supported_formats` 覆盖 0 至 121。数据包面向 Minecraft 26.x。
- JSON 由仓库根目录的 `fmt.py` 统一格式化。手写 JSON 应保持现有缩进与键顺序，避免无关差异。
- 数据包版本与服务器版本对应，发布标签形如 `v26.3-1`。

## 数据包的边界

数据包负责：维度与地形生成、配方与附魔定义、事件触发、游戏内准入、商店交易与物品/附魔行为。

数据包不负责：服务端端口与视距、正版验证、`whitelist.json`、权限组、备份与存档迁移、客户端模组与资源包。

排查问题时先分层定位：定义与行为问题使用 `/datapack`、`/function`、`/reload` 与日志；连接与权限问题检查 `server.properties`、Paper 配置与控制台。

## 发布

发布前确认 `pack.mcmeta` 与目标版本一致，新增或重命名的维度、函数、附魔、配方已同步到开发文档与更新日志，并在测试存档中验证准入、物品、附魔、商店、边界与维度。发布流程见[发布与版本](/develop/guide/release)，存档操作前按[备份](/develop/maintain-save/backup)保留副本。
