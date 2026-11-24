# 进度与判据

进度文件位于 `data/acovia/advancement/`，判据位于 `data/acovia/predicate/`。本数据包不使用进度系统展示玩法流程；进度仅作为事件触发器，借用原版的触发器条件在特定动作发生时执行函数。

## 进度列表

| 进度 | 触发器 | 条件 | 奖励函数 |
| --- | --- | --- | --- |
| `use_eroven` | `minecraft:used_totem` | 物品为不死图腾，`custom_data.acovia:eroven` 为 true | `acovia:item/eroven` |
| `use_rewind_scroll` | `minecraft:consume_item` | `custom_data.acovia:back_acovia` 为 true | `acovia:item/rewind_scroll` |
| `clear_advancements` | `minecraft:slept_in_bed` | 无 | `acovia:base/clear_advancements` |
| `use_flower_of_regeneration` | `minecraft:used_totem` | `custom_data.acovia:flower_of_regeneration` 为 true | 已移除 |

上述进度没有 `display` 字段，因此不会出现在进度界面中。

## 触发与复位

原版进度在同一玩家身上只会触发一次。函数在完成行为后撤回对应进度，使下一次动作可以再次触发，例如玩家在触发 `use_eroven` 函数后，其钩子函数必须包含下列命令：

```mcfunction
advancement revoke @s only acovia:use_eroven
```

新增使用进度的行为时，必须同时实现撤回逻辑，否则该行为只生效一次。

## 判据

| 判据 | 条件 | 用途 |
| --- | --- | --- |
| `acovia:beyond_the_border` | 位于主世界，且 x 或 z 超出 -496 至 496 | 越界传送 |
| `acovia:has_permission` | 主手持有 `acovia:permission` 成书 | 管理权限判定 |

`has_permission` 检查主手物品的 `custom_data`、作者与标题，不检查玩家权限组。复制成书即可通过判定；该判据只适用于受控环境，不应作为安全边界。

## 测试

- `/advancement grant <玩家> only acovia:<id>` 用于检查进度状态；奖励函数可直接用 `/function` 测试。
- `/advancement revoke <玩家> only acovia:<id>` 用于验证复位。
- `/execute as <玩家> if predicate acovia:<id> run say ok` 用于验证判据。
- 修改进度或判据后执行 `/reload`，再重复触发条件。

## 新增触发器的步骤

1. 在 `advancement/` 中创建 JSON，选择原版触发器，并在 `conditions` 中匹配物品或状态。
2. 在 `rewards.function` 中指定奖励函数。
3. 在奖励函数开头撤回该进度，保证行为可重复触发。
4. 若触发条件依赖物品组件，使用 `custom_data` 而不是显示名称。
5. 在测试存档中验证首次触发、重复触发与重进后的状态。
6. 更新本文档与更新日志。
