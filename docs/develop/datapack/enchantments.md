# 附魔

自定义附魔使用数据驱动的 `enchantment` JSON，位于 `data/acovia/enchantment/`。附魔声明适用物品、效果、成本与冲突；行为由原版效果类型或 `run_function` 调用 `function/enchantment/` 完成。

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

`effects` 可使用原生效果（`explode`、`replace_block`、`item_damage`、`attributes` 等），也可通过 `run_function` 调用函数。需要复杂逻辑时，将行为写入 `function/enchantment/`，JSON 只负责声明触发条件与执行者。

## 附魔列表

| 标识符 | 名称 | 适用物品 | 效果 | 商店 |
| --- | --- | --- | --- | --- |
| `acovia:control_ai` | Control_AI | 金矛（Magic Rod） | 开关 16 格内最近实体的 AI，并使其面向玩家 | 48 绿宝石 + 1 钻石，12 本 |
| `acovia:destroy` | Destory | 弓 | 命中后生成威力 128 的爆炸；弓损坏 | 64 绿宝石 + 1 钻石，仅展示 |
| `acovia:explode` | Explode | 弓 | 半径 4 格的爆炸 | 48 绿宝石 + 1 钻石，12 本 |
| `acovia:lightning` | Lightning | 弓 | 落点 3 格内最近的实体受到雷击 | 32 绿宝石 + 1 钻石，8 本 |
| `acovia:make_way` | Makeway | 金铲（Make Way Rod） | 将土径替换为石质路面 | 48 绿宝石 + 1 钻石，12 本 |
| `acovia:imprison` | Imprison | 成书 | 将目标送入 `acovia:niravos` | 不出售 |

商店价格由 `function/entity/magic_book_store` 写入，单次交易交付多本附魔书。`min_cost` 与 `max_cost` 是铁砧成本，与商店价格无关。

## Control_AI

适用于 `minecraft:golden_spear`。`attributes` 效果以 `add_multiplied_base` 把攻击伤害减少 100%；命中时由 `post_piercing_attack` 执行 `enchantment/toggle_mob_ai`，切换 16 格内最近非玩家实体的 `NoAI` 状态，并使其面向攻击者。

该附魔被列入 `data/minecraft/tags/enchantment/curse.json`，与绑定诅咒、消失诅咒同组。

## Destory

适用于弓。`item_damage` 把损伤设为 384，使弓在触发后损坏；命中方块或实体时生成爆炸，并执行 `enchantment/destroy_arrow`，在命中处召唤威力 128 的 TNT 并移除箭。

`exclusive_set` 包含无限、经验修补与耐久，避免与上述附魔共存。游戏内名称为 `Destory`，不是 `Destroy`。

## Explode

适用于弓。命中方块或实体时生成半径 4 的爆炸，并执行 `enchantment/explode_arrow`；非主世界会额外召唤威力 4 的 TNT，然后移除箭。

## Lightning

适用于弓。命中方块时执行 `enchantment/lightning_hit_block`，在落点 3 格内选择最近的实体（排除箭）召唤闪电；命中生物时执行 `enchantment/strike_lightning`，在受击者位置召唤闪电。

## Makeway

适用于 `minecraft:golden_shovel`。命中土径时替换为石质方块，权重为石头 40、圆石 20、石砖 20、裂纹石砖 10、苔石 10。Make Way Rod 自带该附魔。

## Imprison

适用于 `minecraft:written_book`，仅《The Book Of Niravos》带有。命中时将目标送入 `acovia:niravos`，落点距原点 64 至 5120 格；目标已在该维度时直接返回，不重复传送，也不播放传送表现。成书页中的 ETERNITY 点击事件调用同一个函数。

## 商店集成

`function/entity/magic_book_store` 中的交易如下：

| 附魔书 | 支付 | 单次交付 | 交易上限 |
| --- | --- | --- | --- |
| Lightning | 32 绿宝石 + 1 钻石 | 8 本 | 256 |
| Control_AI | 48 绿宝石 + 1 钻石 | 12 本 | 256 |
| Makeway | 48 绿宝石 + 1 钻石 | 12 本 | 256 |
| Explode | 48 绿宝石 + 1 钻石 | 12 本 | 256 |
| Destory | 64 绿宝石 + 1 钻石 | 16 本 | 0（仅展示） |

自定义附魔书直接出售，不再要求魔导书作为底物。修改价格或数量时，应同时更新该函数、[内置函数](/develop/datapack/functions)与本文档。

## 新增附魔的步骤

1. 在 `data/acovia/enchantment/` 下创建 JSON，声明 `supported_items`、`slots`、`effects` 与成本字段。
2. 若效果需要函数，在 `function/enchantment/` 下创建函数，并在 JSON 中通过 `run_function` 引用。
3. 若附魔属于诅咒，将其加入 `data/minecraft/tags/enchantment/curse.json`。
4. 若需在商店出售，在 `magic_book_store` 中添加交易；价格、数量与 `maxUses` 必须与文档一致。
5. 在测试存档中使用 `/enchant`、铁砧与商店分别验证。
6. 更新本文档与服务器更新日志。

## 测试

- `/enchant <玩家> acovia:<id> 1` 可直接附加附魔。
- 铁砧用于验证 `anvil_cost` 与互斥关系。
- 商店交易需在村民旁执行 `function acovia:entity/magic_book_store` 后检查。
- 弓类附魔应验证射击、命中方块、命中生物与耐久消耗。
- `imprison` 应验证目标已在 `acovia:niravos` 时不重复传送。
