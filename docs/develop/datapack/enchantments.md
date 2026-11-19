# 附魔

自定义附魔使用数据驱动的 `enchantment` JSON，位于 `data/acovia/enchantment/`。附魔定义适用的物品、效果、消耗与冲突；实际行为由 JSON 中的效果类型或 `run_function` 调用函数完成。

## 字段说明

| 字段 | 含义 |
| --- | --- |
| `description` | 附魔名称与颜色 |
| `anvil_cost` | 铁砧操作消耗的经验等级 |
| `max_level` | 最大等级；现有附魔均为 1 |
| `weight` | 出现权重 |
| `min_cost` / `max_cost` | 附魔台与铁砧的成本范围 |
| `supported_items` | 可附魔的物品或物品标签 |
| `primary_items` | 可作为主要来源的物品 |
| `slots` | 生效槽位 |
| `exclusive_set` | 互斥附魔 |
| `effects` | 效果列表 |

`effects` 可使用原生效果（`explode`、`replace_block`、`item_damage`、`attributes` 等），也可使用 `run_function` 调用函数。需要复杂逻辑时，将行为写入 `function/enchantment/`，由 JSON 触发。

## 附魔列表

| 标识符 | 名称 | 适用物品 | 效果 | 商店价格 |
| --- | --- | --- | --- | --- |
| `acovia:control_ai` | Control_AI | 金矛（魔导棒） | 开关 16 格内最近实体的 AI，并使其面向玩家 | 48 + 魔导书 |
| `acovia:destroy` | Destory | 弓 | 命中处生成威力 128 的爆炸；弓在射击后损坏 | 64，不出售 |
| `acovia:explode` | Explode | 弓 | 半径约 4 格的爆炸 | 48 + 魔导书 |
| `acovia:lightning` | Lightning | 弓 | 落点 3 格内最近的生物受到雷击 | 32 + 魔导书 |
| `acovia:make_way` | Makeway | 金铲（铺路棒） | 将土径替换为石质路面 | 48 + 魔导书 |
| `acovia:imprison` | Imprison | 成书 | 将目标送入 `acovia:niravos` | 不出售 |

价格为附魔商店中的绿宝石数量，不包含魔导书本身。`min_cost` 与 `max_cost` 是铁砧成本，与商店价格无关。

### Control_AI

适用于 `minecraft:golden_spear`。附魔带有 `attributes` 效果，将基础攻击伤害减少 100%；命中时执行 `enchantment/control_ai`，切换 16 格内最近非玩家实体的 `NoAI` 状态，并使其转向攻击者。

该附魔被列入 `data/minecraft/tags/enchantment/curse.json`，与绑定诅咒、消失诅咒同组。

### Destory

适用于弓。`item_damage` 将物品损伤设为 384，使弓在射出后损坏；命中方块或实体时生成爆炸并执行 `enchantment/destroy`，召唤威力 128 的 TNT。`exclusive_set` 包含无限、经验修补与耐久，避免与上述附魔共存。

游戏内名称为 `Destory`，不是 `Destroy`。修改名称会改变商店与文档中的显示，需同步处理。

### Explode

适用于弓。命中方块或实体时生成半径 4 的爆炸并执行 `enchantment/explode`；非主世界会额外召唤威力 4 的 TNT。

### Lightning

适用于弓。命中方块时，在落点 3 格内寻找最近的生物并召唤闪电；命中生物时，在受击者位置召唤闪电。两个分支分别由 `block_lightning` 与 `lightning` 函数处理。

### Makeway

适用于 `minecraft:golden_shovel`。命中土径时替换为石质方块，权重为石头 40、圆石 20、石砖 20、裂纹石砖 10、苔石 10。铺路棒自带该附魔。

### Imprison

适用于 `minecraft:written_book`，仅《The book of Niravos》带有。命中时将目标送入 `acovia:niravos`，落点距原点最远 5120 格；目标已在该维度时不重复传送。该附魔不通过商店出售。

## 商店集成

附魔商店的交易由 `function/entity/magic_book_store` 写入。自定义附魔的价格与是否出售由该函数中的 `Recipes` 决定：

- `acovia:lightning`：32 颗绿宝石加魔导书。
- `acovia:control_ai`、`acovia:explode`、`acovia:make_way`：48 颗绿宝石加魔导书。
- `acovia:destroy`：64 颗绿宝石加魔导书，`maxUses` 为 0。

修改附魔价格时，应同时更新该函数与本文档。

## 新增附魔的步骤

1. 在 `data/acovia/enchantment/` 下创建 JSON，声明 `supported_items`、`slots`、`effects` 与成本字段。
2. 若效果需要函数，在 `function/enchantment/` 下创建函数，并在 JSON 中通过 `run_function` 引用。
3. 若附魔属于诅咒，将其加入 `data/minecraft/tags/enchantment/curse.json`。
4. 若需在商店出售，在 `magic_book_store` 中添加交易；价格与 `maxUses` 必须与文档一致。
5. 在测试存档中使用 `/enchant`、铁砧与商店分别验证。
6. 更新本文档与服务器更新日志。

## 测试

- `/enchant <玩家> acovia:<id> 1` 可直接附加附魔。
- 铁砧用于验证 `anvil_cost` 与互斥关系。
- 商店交易需在村民旁执行 `function acovia:entity/magic_book_store` 后检查。
- 弓类附魔应验证射击、命中方块、命中生物与耐久消耗。
- `imprison` 应验证目标已在 `acovia:niravos` 时不重复传送。
