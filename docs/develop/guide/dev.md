# 本地开发与调试

本地环境用于验证数据包改动，不应用于生产存档。测试世界应独立于服务器世界，避免调试命令与实验性修改影响玩家数据。

## 环境要求

- Minecraft Java 版 26.x 服务端，推荐 Paper。
- 与服务端版本匹配的 Java 运行时；26.x 服务端要求 Java 25。
- 数据包 `acovia-core`，`pack_format` 为 121。

## 安装数据包

1. 创建测试世界并启动一次服务端，使其生成 `world/` 目录。
2. 停止服务器。
3. 将 `acovia-core` 放入 `world/datapacks/acovia-core/`，或将打包后的 ZIP 放入 `world/datapacks/`。
4. 启动服务器，执行 `/datapack list`，确认数据包处于启用状态。
5. 若数据包未出现在列表中，检查目录层级：ZIP 根目录应直接包含 `pack.mcmeta` 与 `data/`。

## 重载与重启

| 改动 | 操作 |
| --- | --- |
| 函数、进度、判据、配方、附魔、村民交易 | `/reload` |
| 新增或删除维度 | 重启服务器 |
| 修改世界生成、群系、地物 | 重启服务器，并生成新区块验证 |
| 修改 `pack.mcmeta` | 重启服务器 |
| 修改服务器配置或插件 | 重启服务器 |

`/reload` 会重新执行 `acovia:load`。周期函数在重新排期前会清除自身调度，因此不会重复执行。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `/datapack list` | 查看已启用与可用的数据包 |
| `/reload` | 重新加载数据包 |
| `/function acovia:<path>` | 直接执行函数 |
| `/execute as <实体> at @s run function ...` | 以指定实体为执行者测试 |
| `/advancement grant <玩家> only acovia:<id>` | 检查进度状态 |
| `/advancement revoke <玩家> only acovia:<id>` | 复位进度 |
| `/enchant <玩家> acovia:<id> 1` | 附加附魔 |
| `/function acovia:get/invitation` | 发放邀请函 |
| `/advancement grant <玩家> only acovia:welcome_to_acovia` | 模拟正式加入，触发新手礼包 |
| `/data get entity <实体>` | 检查实体数据与组件 |
| `/schedule list` | 查看已排期的函数 |
| `/place feature acovia:<id>` | 单独测试地物 |
| `/forceload add <区块>` | 保持测试区块加载 |

函数报错会在服务端日志中给出文件与行号。修改函数后先执行 `/reload`，再重复触发条件；不应仅依赖客户端提示。

## 故障排除

**数据包未加载。** 检查 `pack.mcmeta` 的 `pack_format`、目录层级与 `datapack list` 输出。

**加载函数未执行。** 检查 `data/minecraft/tags/function/load.json` 是否包含 `acovia:load`；也可手动执行 `/function acovia:load`。

**维度不存在。** 新增维度后未重启服务器，或 `dimension` JSON 的生成器无效。查看启动日志中的维度注册错误。

**商店交易未更新。** 交易由函数写入村民的 `Offers`；需在村民旁执行对应函数，并在修改后 `/reload`。

**附魔无法附加。** 检查 `supported_items` 是否包含目标物品，以及 `exclusive_set` 是否与已有附魔冲突。

**周期函数重复执行。** 检查函数是否在重新排期前执行 `schedule clear`。

**玩家一直处于冒险模式。** 检查该玩家是否拥有 `acovia:welcome_to_acovia`，以及 `acovia:cycle/enforce_whitelist` 是否在 `/schedule list` 中。

**使用邀请函后没有礼包。** 礼包由 `welcome_to_acovia` 的奖励函数发放；若该进度已被授予，奖励不会重复执行。测试时先撤回进度，再重新使用邀请函。

**世界生成没有变化。** 已生成的区块不会因数据包修改而改变；应在新区块中验证，或按[区域迁移](/develop/maintain-save/region-migration)处理。

## 发布前检查

1. `/reload` 后无函数报错。
2. `acovia:load` 正常执行，三个周期任务已排期，主世界边界为 1024 格。
3. 三个维度均可进入，边界传送与流放落点正常。
4. 新玩家流程完整：访客模式 → 使用 Invitation → 生存模式与 Starter Kit。
5. 五个配方产物可合成；Eroven、Rewind Scroll 与 Invitation 的使用行为正确。
6. 六种附魔可附加，效果与商店价格一致。
7. 商店交易在村民旁执行后完整出现。
8. 新生成的区块使用预期群系与地物。
9. 按[备份](/develop/maintain-save/backup)完成生产存档备份。
