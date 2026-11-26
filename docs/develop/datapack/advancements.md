# 进度与判据

进度位于 `data/acovia/advancement/`，判据位于 `data/acovia/predicate/`。数据包不使用进度树展示玩法流程，进度分成两类：

| 类型 | 进度 | 是否显示 | 作用 |
| --- | --- | --- | --- |
| 成员身份 | `welcome_to_acovia` | 显示在进度界面 | 表示玩家已正式加入，奖励新手礼包 |
| 事件触发器 | `use_eroven`、`use_invitation`、`use_rewind_scroll` | 不显示 | 把物品使用事件接到函数 |

触发器没有 `display` 字段，只在满足条件时执行一次奖励函数；`welcome_to_acovia` 有 `display`，但条件为 `impossible`，只能由函数授予。

## 进度列表

| 进度 | 触发器 | 条件 | 奖励函数 |
| --- | --- | --- | --- |
| `welcome_to_acovia` | `minecraft:impossible` | 无，由 `on_use_invitation` 授予 | `acovia:player/setup_new_player` |
| `use_eroven` | `minecraft:used_totem` | 物品为不死图腾，`custom_data` 含 `acovia:eroven` | `acovia:item/on_use_eroven` |
| `use_rewind_scroll` | `minecraft:consume_item` | `custom_data` 含 `acovia:rewind_scroll` | `acovia:item/on_use_rewind_scroll` |
| `use_invitation` | `minecraft:consume_item` | `custom_data` 含 `acovia:invitation` | `acovia:item/on_use_invitation` |

`welcome_to_acovia` 的 `display` 定义标题、描述与图标，因此会出现在进度界面；它没有可完成的原版条件，只作为成员标记存在。

## 触发与复位

原版进度在同一玩家身上只会触发一次。每个物品钩子在完成行为后撤回自己的触发器，使下一次使用可以再次触发：

```mcfunction
advancement revoke @s only acovia:use_eroven
```

`acovia:cycle/reset_item_triggers` 每 2400 tick 撤回三个事件触发器，作为钩子中途失败时的兜底。它不会撤回 `welcome_to_acovia`。

新增事件触发器时，奖励函数必须包含对应的撤回命令；否则该物品的行为只会生效一次。

## 判据

| 判据 | 条件 | 用途 |
| --- | --- | --- |
| `acovia:is_beyond_border` | 位于主世界，且 x 或 z 超出 -496 至 496 | 越界传送 |
| `acovia:has_permission` | 主手持有匹配作者、标题与页内容，且带 `custom_data` 的成书 | 管理权限判定 |

`has_permission` 只检查物品组件，不检查玩家权限组；复制成书即可通过判定，因此只适用于受控环境。判据要求标题为 `The book of Niravos`，而当前配方生成 `The Book Of Niravos`，两者大小写不一致，详见[物品与配方](/develop/datapack/items)。

## 测试

- `/advancement grant <玩家> only acovia:welcome_to_acovia`：模拟正式加入，检查礼包与生存模式。
- `/advancement revoke <玩家> only acovia:welcome_to_acovia`：恢复访客状态，检查 `enforce_whitelist` 是否在 20 tick 内切回冒险模式。
- `/advancement grant <玩家> only acovia:use_eroven`：可直接测试奖励函数；`use_invitation` 与 `use_rewind_scroll` 同理。
- `/execute as <玩家> if predicate acovia:<id> run say ok`：验证判据。
- 修改进度或判据后执行 `/reload`，再重复触发条件。

## 新增触发器的步骤

1. 在 `advancement/` 中创建 JSON，选择原版触发器，并在 `conditions` 中匹配物品或状态。
2. 在 `rewards.function` 中指定奖励函数，函数放在 `item/` 或对应的生命周期目录。
3. 在奖励函数开头撤回该进度，保证行为可重复触发。
4. 触发条件依赖物品组件时使用 `custom_data`，不要依赖显示名称；`custom_data` 的键必须与配方一致。
5. 在测试存档中验证首次触发、重复触发与重新进入后的状态。
6. 更新本文档与[更新日志](/server/changelog)。
