# 内置函数

数据包的函数位于 `data/acovia/function/`，按用途分为 `base`、`entity`、`item`、`enchantment` 与 `get`。函数通过 `data/minecraft/tags/function/load.json` 接入加载流程，其余函数由进度、附魔效果或命令调用。

## 加载与调度

`load.json` 的内容为：

```json
{
  "values": [
    "acovia:load"
  ]
}
```

`acovia:load` 在世界加载与 `/reload` 时执行，依次完成：

1. 创建 `minus` 与 `time` 计分板。
2. 调用 `base/timer`。
3. 调用 `base/beyond_the_border`。
4. 将主世界边界设为以 (0, 0) 为中心、边长 1024 格。

周期函数在结束前清除自身调度，再重新排期，避免 `/reload` 后出现重复执行：

```mcfunction
schedule clear acovia:base/timer
schedule function acovia:base/timer 1200
```

`base/timer` 每 1200 tick 执行一次，`base/beyond_the_border` 每 20 tick 执行一次。

## 计分板

| 计分板 | 维护者 | 含义 |
| --- | --- | --- |
| `minus` | `base/timer` | 每次计时加 1；达到 60 后清零 |
| `time` | `base/timer` | 每 60 次 `minus` 加 1 |

计分板由数据包与服务器共同使用。修改名称或初值前，应确认所有引用位置。

## 基础函数

| 函数 | 调用方式 | 行为 |
| --- | --- | --- |
| `acovia:load` | `#minecraft:load` | 初始化计分板、计时、边界检查与世界边界 |
| `acovia:base/timer` | 自调度，1200 tick | 递增 `minus` 与 `time` |
| `acovia:base/beyond_the_border` | 自调度，20 tick | 将越界玩家送入 `acovia:resola` |
| `acovia:base/home` | 命令或实体逻辑 | 为最近的非玩家实体写入 `home_radius` 与 `home_pos` |
| `acovia:base/clear_advancements` | 进度奖励 | 撤回指定进度并将时间设为夜晚 |

`base/clear_advancements` 在玩家睡觉时执行。它撤回 `use_flower_of_regeneration`、`use_rewind_scroll`、`use_eroven` 与 `clear_advancements`，随后执行 `time set night`。该函数实现“床不能跳过夜晚”的规则。

## 主城与商店

以下函数修改最近的村民，应在目标村民 5 格范围内执行：

| 函数 | 行为 |
| --- | --- |
| `acovia:entity/log_store` | 写入木材交易：1 绿宝石换 12 个方块，共 9 种木材 |
| `acovia:entity/stone_store` | 写入石材交易：1 绿宝石换 12 个方块，共 13 种石材 |
| `acovia:entity/magic_book_store` | 写入附魔商店交易：纸张换绿宝石、附魔书与魔导书 |

`magic_book_store` 的交易包含：

- 16 张纸换 1 颗绿宝石。
- 12 颗绿宝石换耐久 III，16 颗换经验修补。
- 24 颗绿宝石换魔导书。
- 魔导书加 32 至 64 颗绿宝石换自定义附魔书。
- `acovia:destroy` 的交易 `maxUses` 为 0，只展示，不出售。

`entity` 目录中的函数修改最近村民的 `Invulnerable`、`VillagerData` 与 `Offers` 字段，不生成村民。村民由服务器或建筑放置。

## 主城发放

| 函数 | 行为 |
| --- | --- |
| `acovia:get/compass` | 给予指向主世界原点 (0, 0, 0) 的磁石指南针 |
| `acovia:get/fly_tool` | 在玩家位置生成微型乐魂坐骑 |
| `acovia:fly_tool` | 与 `get/fly_tool` 相同的生成逻辑，供其他入口调用 |

微型乐魂的缩放为 0.2，飞行速度为 0.055，带有 `Invulnerable`、`NoAI`、`Silent` 与 `Acovia` 标签。

## 物品函数

| 函数 | 触发条件 | 行为 |
| --- | --- | --- |
| `acovia:item/eroven` | `use_eroven` 进度（`used_totem`） | 撤回进度、公告、粒子、短暂失明，传送至主城广场 |
| `acovia:item/rewind_scroll` | `use_rewind_scroll` 进度（`consume_item`） | 撤回进度、粒子、短暂失明，传送至主城广场 |

两个函数均以 `spreadplayers 172.5 66.5 1 1` 选择落点。Eroven 的死亡保护组件与回溯卷轴的消耗组件在配方中定义，函数只处理传送与表现。

## 附魔函数

| 函数 | 调用者 | 行为 |
| --- | --- | --- |
| `acovia:enchantment/control_ai` | `control_ai` 附魔 | 开关 16 格内最近非玩家实体的 AI，并使其面向玩家 |
| `acovia:enchantment/destroy` | `destroy` 附魔 | 生成威力 128 的爆炸并移除箭 |
| `acovia:enchantment/explode` | `explode` 附魔 | 非主世界生成威力 4 的爆炸；移除箭 |
| `acovia:enchantment/lightning` | `lightning` 附魔 | 在受击者位置召唤闪电 |
| `acovia:enchantment/block_lightning` | `lightning` 附魔 | 在箭落点 3 格内寻找生物并召唤闪电 |
| `acovia:enchantment/imprison` | `imprison` 附魔或成书点击 | 将目标送入 `acovia:niravos`，距原点最远 5120 格 |

附魔函数以攻击者或受击者为执行者，具体取决于附魔 JSON 中的 `affected` 与 `enchanted` 字段。修改时不得假定 `@s` 一定是玩家。

## 判据

| 判据 | 条件 |
| --- | --- |
| `acovia:beyond_the_border` | 位于主世界，且 x 或 z 超出 -496 至 496 |
| `acovia:has_permission` | 主手持有 `acovia:permission` 成书，作者为 Acovia，标题为 The book of Niravos |

`has_permission` 用于需要管理权限的场景。判定依据是物品组件，不是玩家权限组；复制该书即可通过判定，因此只应在受控环境中使用。

## 公开 API 约定

`acovia:base`、`acovia:entity`、`acovia:item`、`acovia:enchantment` 与 `acovia:get` 中的函数均可能被其他数据包、命令方块或插件调用。对外暴露的函数应遵循以下约定：

- 函数名不再随意更改；重命名时保留旧路径作为转发函数。
- 需要玩家上下文的函数通过 `execute as` 调用，并在文档中注明。
- 不使用未文档化的计分板、标签或实体数据作为输入输出。
- 新增公开函数时，在本页登记其调用方式与副作用。

`arrow_velocity`、`damage_magic`、`fireball_magic`、`wither_magic` 为历史遗留或被注释的函数，不应作为 API 使用。`use_flower_of_regeneration` 进度仍存在于文件中，但其奖励函数已移除，仅用于 `clear_advancements` 的清理。
