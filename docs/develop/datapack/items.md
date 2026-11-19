# 物品与配方

自定义物品由配方定义基础组件，由进度与函数实现行为。物品不在数据包中单独注册；配方文件位于 `data/acovia/recipe/`，行为函数位于 `function/item/`，触发器位于 `advancement/`。

## 物品列表

| 物品 | 基础物品 | 外观 | 配方 | 行为 |
| --- | --- | --- | --- | --- |
| Eroven | 不死图腾 | 火把花，可戴在头部 | 任意花朵 + 钻石 | 致命伤害时保留一命，传送至主城 |
| 回溯卷轴 | 附魔书 | 纸 | 纸 + 末影珍珠 | 使用 2 秒后传送至主城 |
| 魔导棒 | 金矛 | 木棍 | 6 钻石 + 1 木棍 + 2 青金石 | Control_AI 的载体 |
| 铺路棒 | 金铲 | 木棍 | 下界之星 + 命令方块 | 自带 Makeway，对土径铺路 |
| The book of Niravos | 成书 | 附魔书 | 书 + 命令方块 | 点击 ETERNITY 流放，兼作权限令牌 |

## Eroven

关键组件如下：

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
            {
              "id": "minecraft:fire_resistance",
              "duration": 1000,
              "amplifier": 0
            },
            {
              "id": "minecraft:resistance",
              "duration": 30,
              "amplifier": 9
            },
            {
              "id": "minecraft:regeneration",
              "duration": 30,
              "amplifier": 9
            }
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

配方为无序合成：`#minecraft:flowers` 与 `diamond`。玩家受到致命伤害时，`death_protection` 触发，给予 50 秒抗火、1.5 秒抗性提升 10 与生命恢复 10；随后 `use_eroven` 进度执行 `item/eroven`，将玩家传送至主城广场。

## 回溯卷轴

关键组件如下：

```json
{
  "id": "minecraft:enchanted_book",
  "components": {
    "item_model": "minecraft:paper",
    "item_name": { "text": "回溯卷轴", "color": "light_purple" },
    "custom_data": { "acovia:back_acovia": true },
    "max_stack_size": 1,
    "consumable": {
      "animation": "bow",
      "consume_seconds": 2,
      "has_consume_particles": false,
      "on_consume_effects": [
        { "type": "play_sound", "sound": { "sound_id": "item.totem.use" } }
      ]
    }
  }
}
```

配方为无序合成：`paper` 与 `ender_pearl`。`consume_item` 进度执行 `item/rewind_scroll`，将玩家传送至主城广场。

## 魔导棒

关键组件如下：

```json
{
  "id": "minecraft:golden_spear",
  "components": {
    "item_name": { "text": "魔导棒", "color": "light_purple" },
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

配方为有序合成：

```text
AAA
CBC
AAA
```

`A` 为钻石，`B` 为木棍，`C` 为青金石。魔导棒是 `acovia:control_ai` 的唯一适用物品。

## 铺路棒

关键组件如下：

```json
{
  "id": "minecraft:golden_shovel",
  "components": {
    "item_name": { "text": "铺路棒", "color": "yellow" },
    "item_model": "minecraft:stick",
    "max_stack_size": 1,
    "unbreakable": {},
    "tool": {
      "can_destroy_blocks_in_creative": false,
      "default_mining_speed": 0,
      "rules": [
        {
          "blocks": "#minecraft:mineable/pickaxe",
          "correct_for_drops": true
        },
        {
          "blocks": "#minecraft:mineable/shovel",
          "correct_for_drops": true
        },
        {
          "blocks": "#mineable/axe",
          "correct_for_drops": true
        },
        {
          "blocks": "#mineable/hoe",
          "correct_for_drops": true
        }
      ]
    },
    "enchantments": { "acovia:make_way": 1 }
  }
}
```

配方为有序合成，下界之星位于左下角，命令方块位于右上角：

```text
  B
 B
A
```

`A` 为下界之星，`B` 为命令方块。工具的挖掘速度被设为 0，但所有可挖掘方块均正确掉落；铺路行为由 Makeway 附魔完成。

## The book of Niravos

关键组件如下；书页内容有删节：

```json
{
  "id": "minecraft:written_book",
  "components": {
    "max_stack_size": 1,
    "rarity": "epic",
    "item_model": "minecraft:enchanted_book",
    "enchantments": { "acovia:imprison": 1 },
    "custom_data": { "acovia:permission": true },
    "unbreakable": {},
    "written_book_content": {
      "author": "Acovia",
      "title": "The book of Niravos",
      "pages": [
        [
          { "text": "Y", "color": "#4f002f" },
          { "text": "O", "color": "#6f003f", "obfuscated": true },
          { "text": "U", "color": "#4f002f" },
          { "text": " W", "color": "#4f002f" },
          { "text": "I", "color": "#6f003f", "obfuscated": true },
          { "text": "LL ", "color": "#4f002f" },
          { "text": " F", "color": "#4f002f" },
          { "text": "O", "color": "#6f003f", "obfuscated": true },
          { "text": "LL", "color": "#4f002f" },
          { "text": "OW", "color": "#6f003f", "obfuscated": true },
          { "text": " ", "color": "#4f002f" },
          {
            "text": "ETERNITY",
            "color": "#af0000",
            "obfuscated": true,
            "strikethrough": true,
            "click_event": {
              "action": "run_command",
              "command": "function acovia:enchantment/imprison"
            }
          }
        ]
      ]
    }
  }
}
```

配方为无序合成：`book` 与 `command_block`。点击 ETERNITY 执行 Imprison 函数；物品同时带有 `acovia:permission` 数据，用于 `has_permission` 判定。

## 权限令牌

`predicate/has_permission` 检查主手物品是否为作者 Acovia、标题 The book of Niravos 的成书，且 `custom_data` 中有 `acovia:permission`。该判定只依赖物品组件，不依赖玩家权限组；复制成书即可通过判定，因此只应在受控环境中使用。

## 商店集成

主城的商店通过村民交易提供基础材料与附魔书：

- 资源管理局：木材与石材，1 颗绿宝石换 12 个方块。
- 附魔商店：纸张换绿宝石，绿宝石换附魔书与魔导书；自定义附魔书需要魔导书作为底。

商店交易由 `function/entity/log_store`、`stone_store` 与 `magic_book_store` 写入，具体价格见[内置函数](/develop/datapack/functions)。

## 新增物品的步骤

1. 在 `recipe/` 中创建配方，确定基础物品、组件与合成方式。
2. 若物品需要行为，在 `function/item/` 中创建函数，并通过进度触发；触发器应检查稳定的组件或 `custom_data`。
3. 若物品需要权限或特殊判定，在 `predicate/` 中增加判据。
4. 若物品通过商店发放，在对应的村民交易函数中添加条目。
5. 在测试存档中验证合成、使用、死亡、重进与跨维度行为。
6. 更新本文档、服务器玩法页（若为玩家可见内容）与更新日志。
