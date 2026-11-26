# 物品与配方

自定义物品由三层组成：

| 层 | 位置 | 职责 |
| --- | --- | --- |
| 定义层 | `recipe/` | 用配方定义基础物品、外观、组件与合成方式 |
| 触发层 | `advancement/` | 用 `custom_data` 识别物品的使用事件 |
| 行为层 | `function/item/` | 执行传送、加入、流放等效果 |

物品没有单独的注册文件。配方产出的物品带有稳定的 `custom_data` 键，进度只匹配这些键；显示名称可以修改，数据键不能随意改动。

## 物品列表

| 物品 | 基础物品 | 获取 | 触发 | 行为 |
| --- | --- | --- | --- | --- |
| Eroven | 不死图腾 | 无序：任意花朵 + 钻石 | `use_eroven` | 致命伤害时免死并送回主城 |
| Rewind Scroll | 附魔书 | 无序：纸 + 末影珍珠 | `use_rewind_scroll` | 使用 2 秒后送回主城 |
| Invitation | 附魔书 | `acovia:get/invitation` | `use_invitation` | 使用 1 秒后正式加入 |
| Magic Rod | 金矛 | 有序：钻石、木棍、青金石 | — | Control_AI 的载体 |
| Make Way Rod | 金铲 | 有序：下界之星 + 命令方块 | — | 自带 Makeway，对土径铺路 |
| The Book Of Niravos | 成书 | 无序：书 + 命令方块 | 点击或命中 | Imprison 的载体，兼作权限令牌 |

## Eroven

```json
{
  "id": "minecraft:totem_of_undying",
  "components": {
    "item_model": "minecraft:torchflower",
    "item_name": { "text": "Eroven", "color": "gold" },
    "custom_data": { "acovia:eroven": true },
    "enchantment_glint_override": true,
    "death_protection": {
      "death_effects": [
        {
          "type": "apply_effects",
          "effects": [
            { "id": "minecraft:fire_resistance", "duration": 1000, "amplifier": 0 },
            { "id": "minecraft:resistance", "duration": 30, "amplifier": 9 },
            { "id": "minecraft:regeneration", "duration": 30, "amplifier": 9 }
          ]
        }
      ]
    },
    "equippable": {
      "slot": "head",
      "swappable": false,
      "equip_sound": "block.flowering_azalea.place"
    }
  }
}
```

配方为无序合成：`#minecraft:flowers` 与 `diamond`。玩家受到致命伤害时，`death_protection` 给予 50 秒抗火、1.5 秒抗性提升 10 与生命恢复 10；随后 `use_eroven` 触发 `item/on_use_eroven`，将玩家送回主城广场。

## Rewind Scroll

```json
{
  "id": "minecraft:enchanted_book",
  "components": {
    "item_model": "minecraft:paper",
    "item_name": { "text": "Rewind Scroll", "color": "light_purple" },
    "enchantment_glint_override": true,
    "max_stack_size": 1,
    "consumable": {
      "animation": "bow",
      "consume_seconds": 2,
      "has_consume_particles": false,
      "sound": { "sound_id": "" },
      "on_consume_effects": [
        { "type": "play_sound", "sound": { "sound_id": "item.totem.use" } }
      ]
    },
    "custom_data": { "acovia:rewind_scroll": true }
  }
}
```

配方为无序合成：`paper` 与 `ender_pearl`。消耗完成后 `use_rewind_scroll` 触发 `item/on_use_rewind_scroll`，将玩家送回主城广场。`sound` 置空用于去掉原版进食音效，改由 `on_consume_effects` 播放图腾音效。

## Invitation

```json
{
  "id": "minecraft:enchanted_book",
  "components": {
    "item_name": { "text": "Invitation", "color": "aqua" },
    "item_model": "minecraft:nether_star",
    "enchantment_glint_override": true,
    "max_stack_size": 1,
    "consumable": {
      "animation": "none",
      "consume_seconds": 1,
      "has_consume_particles": false,
      "sound": { "sound_id": "" },
      "on_consume_effects": [
        { "type": "play_sound", "sound": { "sound_id": "item.book.page_turn" } }
      ]
    },
    "custom_data": { "acovia:invitation": true }
  }
}
```

Invitation 没有配方，由 `acovia:get/invitation` 发放。消耗完成后 `use_invitation` 触发 `item/on_use_invitation`，授予 `welcome_to_acovia`；该进度的奖励函数 `player/setup_new_player` 负责切换生存模式并发放新手礼包。

## Magic Rod

```json
{
  "id": "minecraft:golden_spear",
  "components": {
    "item_name": { "text": "Magic Rod", "color": "light_purple" },
    "item_model": "minecraft:stick",
    "minimum_attack_charge": 1,
    "piercing_weapon": { "sound": "entity.ender_dragon.shoot" },
    "max_stack_size": 1,
    "attribute_modifiers": [
      {
        "type": "minecraft:attack_speed",
        "id": "minecraft:base_attack_speed",
        "operation": "add_value",
        "amount": -3.2
      }
    ]
  }
}
```

有序配方：

```text
AAA
CBC
AAA
```

`A` 为钻石，`B` 为木棍，`C` 为青金石。Magic Rod 是 `acovia:control_ai` 的唯一适用物品；附魔把攻击伤害降为 0，并把命中变成 AI 开关。

## Make Way Rod

```json
{
  "id": "minecraft:golden_shovel",
  "components": {
    "item_name": { "text": "Make Way Rod", "color": "yellow" },
    "item_model": "minecraft:stick",
    "max_stack_size": 1,
    "unbreakable": {},
    "tool": {
      "can_destroy_blocks_in_creative": false,
      "default_mining_speed": 0,
      "rules": [
        { "blocks": "#minecraft:mineable/pickaxe", "correct_for_drops": true },
        { "blocks": "#minecraft:mineable/shovel", "correct_for_drops": true },
        { "blocks": "#mineable/axe", "correct_for_drops": true },
        { "blocks": "#mineable/hoe", "correct_for_drops": true }
      ]
    },
    "enchantments": { "acovia:make_way": 1 }
  }
}
```

有序配方，下界之星位于左下角，2 个命令方块位于右上与中间：

```text
  B
 B
A
```

`A` 为下界之星，`B` 为命令方块。挖掘速度设为 0，但所有可挖掘方块均正确掉落；铺路行为由 Makeway 附魔完成。

## The Book Of Niravos

```json
{
  "id": "minecraft:written_book",
  "components": {
    "max_stack_size": 1,
    "rarity": "epic",
    "item_model": "minecraft:enchanted_book",
    "enchantment_glint_override": false,
    "enchantments": { "acovia:imprison": 1 },
    "custom_data": { "acovia:permission": true },
    "unbreakable": {},
    "written_book_content": {
      "author": "Acovia",
      "title": "The Book Of Niravos",
      "pages": [[{ "text": "..." }]]
    }
  }
}
```

配方为无序合成：`book` 与 `command_block`。书页中的 ETERNITY 使用 `click_event` 执行 `acovia:enchantment/imprison_target`；玩家被这本书命中时，Imprison 附魔也会触发同一个函数。书页内容与点击事件需与 `predicate/has_permission` 保持一致。

## 新手礼包

`Acovia Starter Kit` 不是可合成物品，而是 `welcome_to_acovia` 的奖励产物：`player/setup_new_player` 发放一个名为 `Acovia Starter Kit` 的黄色潜影盒（名称颜色 `#ff8f00`），占用 26 个槽位。

内容包括 64 钻石、64 绿宝石、64 面包、128 云杉原木；附魔耐久 III 与经验修补 I 的整套钻石装备、鞘翅与盾牌；力量 V 的弓与 64 支箭；以及火把、工作台、熔炉、床、水桶、煤炭、金苹果、末影珍珠与末影箱。完整清单见[更新日志](/server/changelog)。

## 商店集成

主城商店由 `function/entity/` 写入村民交易：

- `log_store`：9 种原木，1 绿宝石换 12 个。
- `stone_store`：13 种石材，1 绿宝石换 12 个。
- `magic_book_store`：纸张换绿宝石，绿宝石换原版附魔书，绿宝石加钻石换自定义附魔书。

自定义附魔书不再需要魔导书作为底物。价格、单次交付数量与交易上限见[内置函数](/develop/datapack/functions)。

## 权限令牌

`predicate/has_permission` 要求主手物品同时匹配：

- 物品为 `minecraft:written_book`；
- `custom_data` 含 `acovia:permission`；
- `written_book_content` 的作者为 `Acovia`；
- 标题为 `The book of Niravos`；
- 页内容与判据中的 `pages` 完全一致。

该判定只依赖物品组件，不检查玩家权限组；复制成书即可通过判定，因此只应在受控环境中使用。

::: warning
`book_of_niravos` 配方当前生成的标题是 `The Book Of Niravos`，而 `has_permission` 匹配的标题是 `The book of Niravos`。组件匹配区分大小写，因此新合成的书不会通过该判据。若权限令牌需要继续使用，应统一两处标题。
:::

## 新增物品的步骤

1. 在 `recipe/` 中创建配方，确定基础物品、组件与合成方式，并为行为物品写入稳定的 `custom_data` 键。
2. 在 `advancement/` 中创建触发器，匹配该 `custom_data`，奖励函数指向新的行为函数。
3. 在 `function/item/` 中实现行为，并在开头撤回对应的触发器。
4. 若物品需要权限或特殊判定，在 `predicate/` 中增加判据，并与配方组件保持一致。
5. 若物品通过商店发放，在对应的村民交易函数中添加条目。
6. 在测试存档中验证合成、使用、死亡、重进与跨维度行为。
7. 更新本文档、服务器玩法页（若为玩家可见内容）与更新日志。
