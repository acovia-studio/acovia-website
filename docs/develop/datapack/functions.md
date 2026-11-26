# 内置函数

函数位于 `data/acovia/function/`，按调用来源与生命周期分层。加载入口只有 `load` 一个；其余函数分别服务于周期任务、玩家准入、物品、附魔、商店与发放。原 `base/` 目录与旧函数名已移除，不保留转发。

## 分层

| 目录或文件 | 角色 | 调用方 |
| --- | --- | --- |
| `load.mcfunction` | 加载入口 | `#minecraft:load` |
| `cycle/` | 周期任务 | 自调度 |
| `player/` | 玩家准入与初始化 | 进度奖励、周期任务 |
| `item/` | 物品行为 | 进度奖励 |
| `enchantment/` | 附魔行为 | 附魔 `run_function`、成书点击 |
| `entity/` | 商店交易注入 | 命令方块、管理员 |
| `get/` | 发放物品与坐骑 | 命令方块、管理员 |

`cycle/`、`player/`、`item/` 与 `enchantment/` 是数据包内部实现，修改时需要同步进度、判据或附魔 JSON。`load`、`get/` 与 `entity/` 是外部入口，可被命令方块或插件调用。

## 加载入口

`acovia:load` 在世界加载与 `/reload` 时执行：

```mcfunction
function acovia:cycle/teleport_outside_border
function acovia:cycle/reset_item_triggers
function acovia:cycle/enforce_whitelist
execute in minecraft:overworld run worldborder center 0.0 0.0
execute in minecraft:overworld run worldborder set 1024
```

它不创建计分板。三个 `cycle/` 函数在这里立即执行一次，并各自排期；因此 `/reload` 后不需要额外启动任务。主世界边界为边长 1024 格，范围为 -512 至 512。

## 周期任务

每个周期函数都在开头清除自己的调度，再重新排期：

```mcfunction
schedule clear acovia:cycle/teleport_outside_border
schedule function acovia:cycle/teleport_outside_border 20
```

| 函数 | 间隔 | 行为 |
| --- | --- | --- |
| `acovia:cycle/teleport_outside_border` | 20 tick | 对满足 `acovia:is_beyond_border` 的玩家，在 `acovia:resola` 中以原坐标为中心 `spreadplayers ~ ~ 16 16` |
| `acovia:cycle/enforce_whitelist` | 20 tick | 无 `welcome_to_acovia` 的玩家进入访客模式；已加入但处于冒险模式的玩家切回生存 |
| `acovia:cycle/reset_item_triggers` | 2400 tick | 撤回 `use_eroven`、`use_invitation` 与 `use_rewind_scroll`，作为触发器复位兜底 |

`reset_item_triggers` 不处理 `welcome_to_acovia`：该进度表示成员身份，必须保留。

## 玩家准入

```text
无 welcome_to_acovia
  └─ cycle/enforce_whitelist（20 tick）
       └─ player/apply_visitor_mode
            ▸ 冒险模式 + actionbar 提示

使用 Invitation
  └─ advancement: use_invitation
       └─ item/on_use_invitation
            └─ grant welcome_to_acovia
                 └─ reward: player/setup_new_player
                      ▸ 生存模式 + Acovia Starter Kit
```

| 函数 | 执行者 | 行为 |
| --- | --- | --- |
| `acovia:player/apply_visitor_mode` | 玩家 | 设为冒险模式，并在 actionbar 提示未加入白名单 |
| `acovia:player/setup_new_player` | 玩家 | 设为生存模式，发放黄色潜影盒 `Acovia Starter Kit` |

礼包共使用 26 个槽位，内容为：

- 资源：钻石 64、绿宝石 64、面包 64、云杉原木 128。
- 装备：附魔耐久 III 与经验修补 I 的钻石剑、镐、锹、斧、头盔、胸甲、护腿、靴子、鞘翅与盾牌；力量 V 的弓与 64 支箭。
- 生存用品：火把 64、工作台、熔炉、床、水桶、煤炭 32、金苹果 8、末影珍珠 8、末影箱。

该函数是 `welcome_to_acovia` 的奖励，只会随首次获得该进度执行一次。重复使用邀请函不会再次发放礼包。

::: note
准入是数据包内的软限制，只切换游戏模式并提示；服务端 `whitelist.json` 与权限组不在数据包控制范围内。
:::

## 物品行为

| 函数 | 触发进度 | 行为 |
| --- | --- | --- |
| `acovia:item/on_use_eroven` | `use_eroven`（`used_totem`） | 撤回进度、全服公告、粒子与短暂失明，随后送回主城广场 |
| `acovia:item/on_use_rewind_scroll` | `use_rewind_scroll`（`consume_item`） | 撤回进度、粒子与短暂失明，随后送回主城广场 |
| `acovia:item/on_use_invitation` | `use_invitation`（`consume_item`） | 撤回 `use_invitation`，授予 `welcome_to_acovia` |

Eroven 与 Rewind Scroll 均以 `spreadplayers 172.5 66.5 1 1` 选择落点。死亡保护与消耗动画由配方组件定义，函数只负责传送与表现；Invitation 的成员身份由进度表示，不写入计分板。

## 附魔行为

| 函数 | 调用者 | 行为 |
| --- | --- | --- |
| `acovia:enchantment/toggle_mob_ai` | `control_ai`（`post_piercing_attack`） | 切换 16 格内最近非玩家实体的 `NoAI`，使其面向玩家并显示粒子 |
| `acovia:enchantment/destroy_arrow` | `destroy`（命中方块或实体） | 生成粒子，召唤威力 128 的 TNT，移除箭 |
| `acovia:enchantment/explode_arrow` | `explode`（命中方块或实体） | 生成粒子；非主世界额外召唤威力 4 的 TNT，移除箭 |
| `acovia:enchantment/lightning_hit_block` | `lightning`（`hit_block`） | 在落点 3 格内选择最近的实体（排除箭）召唤闪电 |
| `acovia:enchantment/strike_lightning` | `lightning`（`post_attack`） | 在受击者位置召唤闪电 |
| `acovia:enchantment/imprison_target` | `imprison`（`post_attack`）或成书点击 | 将不在 `acovia:niravos` 的目标送入该维度，随后播放音效、粒子与短暂失明 |

附魔函数以攻击者、受击者或箭为执行者，具体取决于附魔 JSON 中的 `affected` 与 `enchanted`。修改时不得假定 `@s` 一定是玩家。命中判定统一排除已在 `acovia:niravos` 的目标，避免重复传送。

## 商店注入

以下函数修改最近的村民，应在目标村民 5 格内执行：

| 函数 | 行为 |
| --- | --- |
| `acovia:entity/log_store` | 9 种原木，1 绿宝石换 12 个，交易上限 256 |
| `acovia:entity/stone_store` | 13 种石材，1 绿宝石换 12 个 |
| `acovia:entity/magic_book_store` | 纸张、原版附魔书与自定义附魔书 |

`magic_book_store` 的交易如下：

| 购买 | 支付 | 单次交付 | 交易上限 |
| --- | --- | --- | --- |
| 纸张 16 | 绿宝石 1 | — | 256 |
| 耐久 III 附魔书 | 绿宝石 12 | 1 本 | 256 |
| 经验修补附魔书 | 绿宝石 16 | 1 本 | 256 |
| Lightning 附魔书 | 绿宝石 32 + 钻石 1 | 8 本 | 256 |
| Control_AI 附魔书 | 绿宝石 48 + 钻石 1 | 12 本 | 256 |
| Makeway 附魔书 | 绿宝石 48 + 钻石 1 | 12 本 | 256 |
| Explode 附魔书 | 绿宝石 48 + 钻石 1 | 12 本 | 256 |
| Destory 附魔书 | 绿宝石 64 + 钻石 1 | 16 本 | 0（仅展示） |

自定义附魔书不再要求魔导书作为底物，交易直接产出附魔书。`entity/` 中的函数只合并已有村民的 `Invulnerable`、`VillagerData` 与 `Offers`，不生成村民。

## 发放函数

| 函数 | 执行者 | 行为 |
| --- | --- | --- |
| `acovia:get/fly_tool` | 玩家 | 在当前位置生成微型飞行坐骑 |
| `acovia:get/invitation` | 玩家 | 发放 1 张 Invitation |

微型坐骑为 `happy_ghast`，缩放 0.2，飞行速度 0.055，带有 `Invulnerable`、`NoAI`、`Silent` 与 `Acovia` 标签。`get/compass` 与根目录的 `fly_tool` 已移除。

## 调用约定

- 外部入口保持稳定：`acovia:load`、`acovia:get/*`、`acovia:entity/*`。其余目录为内部实现，重命名时必须在同一提交中更新进度、判据、附魔与文档。
- 需要玩家上下文的函数通过 `execute as <玩家> run function ...` 调用；`entity/*` 需要执行位置靠近目标村民。
- 数据包不再使用计分板保存状态。玩家身份、事件复位与条件判断分别由进度、周期函数与判据承担。
- 调试时可用 `/schedule list` 检查周期任务，用 `/function acovia:<path>` 直接执行入口函数。
