# 备份

服务器使用 [mc-saver](https://github.com/fovlin/mc-saver) 进行选择性备份。该工具依据世界目录中的 `saver.json` 规则，将指定的区域文件、玩家数据和根目录文件写入 ZIP 归档，不复制完整地图。

选择性备份要求维护者明确各文件的作用。本文件依次说明存档结构、文件作用、数据重要程度与操作流程。

## 存档结构

Minecraft 26.1 更改了存档布局。旧备份与新服务器无法按同一路径读取，应先确认版本：

- 根目录同时包含 `dimensions/` 与 `players/`：新版，26.1 及以后。
- 根目录包含 `region/` 与 `playerdata/`：旧版，1.21.11 及更早。

### 新版（26.1 及以后）

```text
world/
  level.dat
  level.dat_old
  session.lock
  icon.png
  players/
    data/<uuid>.dat
    advancements/<uuid>.json
    stats/<uuid>.json
  dimensions/
    minecraft/overworld/
      region/r.X.Z.mca
      entities/r.X.Z.mca
      poi/r.X.Z.mca
      data/minecraft/
        chunk_tickets.dat
        world_border.dat
        raids.dat
        ...
    minecraft/the_nether/...
    minecraft/the_end/...
    acovia/resola/...
    acovia/niravos/...
  data/
    minecraft/
      maps/
      scoreboard.dat
      game_rules.dat
      world_clocks.dat
      weather.dat
      world_gen_settings.dat
      scheduled_events.dat
      command_storage.dat
      ...
  datapacks/
  generated/
```

结构说明：

- 所有维度均位于 `dimensions/<命名空间>/<标识符>/`，主世界不再例外。
- 玩家数据位于 `players/` 下，分为 `data`、`advancements`、`stats` 三部分。
- 根目录的 `data/` 仅存储各维度共用的数据；世界边界、区块标签与袭击状态存储在对应维度的目录中。
- 26.1 将游戏规则、时间、天气、种子与世界生成设置从 `level.dat` 拆分至 `data/minecraft/*.dat`。仅备份 `level.dat` 已不足以还原上述设置。

### 旧版（1.21.11 及更早）

```text
world/
  level.dat
  level.dat_old
  session.lock
  icon.png
  region/r.X.Z.mca
  entities/r.X.Z.mca
  poi/r.X.Z.mca
  data/
    scoreboard.dat
    map_<id>.dat
    idcounts.dat
    command_storage_<namespace>.dat
    world_border.dat
    chunks.dat
    ...
  DIM-1/                     下界
    region/ entities/ poi/
    data/
  DIM1/                      末地
    region/ entities/ poi/
    data/
  dimensions/<命名空间>/<标识符>/   自定义维度
  playerdata/<uuid>.dat
  advancements/<uuid>.json
  stats/<uuid>.json
  datapacks/
  generated/
```

结构说明：

- 主世界数据直接位于存档根目录；下界位于 `DIM-1/`，末地位于 `DIM1/`。
- 自定义维度位于 `dimensions/<命名空间>/<标识符>/`，与新版一致。
- 玩家数据分散于 `playerdata/`、`advancements/` 与 `stats/` 三个目录。
- 游戏规则、时间、天气与种子均保存在 `level.dat` 中；`data/` 存储记分板、地图、命令存储，以及主世界的边界与区块标签。

### 新旧布局对照

| 数据 | 新版 | 旧版 |
| --- | --- | --- |
| 主世界区块 | `dimensions/minecraft/overworld/region/` | `region/` |
| 下界区块 | `dimensions/minecraft/the_nether/region/` | `DIM-1/region/` |
| 末地区块 | `dimensions/minecraft/the_end/region/` | `DIM1/region/` |
| 玩家背包与位置 | `players/data/<uuid>.dat` | `playerdata/<uuid>.dat` |
| 进度 | `players/advancements/` | `advancements/` |
| 统计 | `players/stats/` | `stats/` |
| 记分板 | `data/minecraft/scoreboard.dat` | `data/scoreboard.dat` |
| 地图 | `data/minecraft/maps/` | `data/map_<id>.dat` 与 `idcounts.dat` |
| 游戏规则 | `data/minecraft/game_rules.dat` | `level.dat` |
| 世界时间 | `data/minecraft/world_clocks.dat` | `level.dat` |
| 天气 | `data/minecraft/weather.dat` | `level.dat` |
| 种子与生成设置 | `data/minecraft/world_gen_settings.dat` | `level.dat` |
| 世界边界 | `<维度>/data/minecraft/world_border.dat` | `<维度>/data/world_border.dat` |
| 区块标签 | `<维度>/data/minecraft/chunk_tickets.dat` | `<维度>/data/chunks.dat` |
| 袭击 | `<维度>/data/minecraft/raids.dat` | `<维度>/data/raids.dat`（末地为 `raids_end.dat`） |

旧版主世界的 `<维度>` 即存档根目录；下界为 `DIM-1/`，末地为 `DIM1/`，自定义维度为 `dimensions/<命名空间>/<标识符>/`。

## 文件作用

下表按新版路径编写。旧版的对应位置见上一节。

| 文件或目录 | 作用 | 丢失后的影响 |
| --- | --- | --- |
| `level.dat` | 存档基础数据：版本、名称、出生点、默认游戏模式等 | 存档可能无法打开，或出生点与模式被重置 |
| `data/minecraft/world_gen_settings.dat` | 种子与维度生成器设置 | 种子改变，地形按新种子重新生成 |
| `data/minecraft/game_rules.dat` | 游戏规则 | 规则恢复默认值 |
| `data/minecraft/world_clocks.dat` | 世界时间与游戏天数 | 时间恢复为初始值 |
| `data/minecraft/weather.dat` | 天气与雷雨计时 | 天气状态重置 |
| `data/minecraft/scoreboard.dat` | 计分板、队伍与目标 | 日龄与 `time` 分数清零，新手保护期重新计算 |
| `data/minecraft/scheduled_events.dat` | 已排期的函数调用 | 计时器需等待下一次 `load` 或重新进入后恢复 |
| `data/minecraft/maps/` | 游戏内地图的内容与编号 | 地图物品保留，但地图内容丢失 |
| `data/minecraft/command_storage.dat` | 数据包通过 `/data storage` 存储的数据 | 依赖存储的命令失效 |
| `players/data/<uuid>.dat` | 背包、末影箱、位置、血量、经验与状态效果 | 玩家进度与自定义物品丢失 |
| `players/advancements/` | 玩家进度 | 进度重置 |
| `players/stats/` | 玩家统计 | 统计清零 |
| `<维度>/region/r.X.Z.mca` | 区块方块数据：地形、建筑与方块实体 | 建筑与地形丢失 |
| `<维度>/entities/r.X.Z.mca` | 实体：掉落物、生物、盔甲架、物品展示框与画 | 建筑中的展示框、盔甲架与生物丢失 |
| `<维度>/poi/r.X.Z.mca` | 兴趣点：床、村民工作站、下界门与蜂巢 | 村民职业与传送门连接可能异常；重新加载区块可重建部分兴趣点，但不保证全部恢复 |
| `<维度>/data/minecraft/world_border.dat` | 世界边界的位置与大小 | 边界恢复默认值；主世界边界由数据包在 `load` 中重新设置 |
| `<维度>/data/minecraft/chunk_tickets.dat` | 强制加载的区块 | 出生点与传送门的常加载区失效 |
| `<维度>/data/minecraft/raids.dat` | 进行中的袭击 | 当前袭击状态丢失 |
| `dimensions/minecraft/the_end/data/minecraft/ender_dragon_fight.dat` | 末影龙战斗状态 | 战斗状态重置 |
| `datapacks/` | 世界级数据包 | 自定义附魔、函数与维度定义失效；物品仍保留在玩家背包中 |
| `generated/` | `/locate` 使用的结构数据 | 可由游戏重新生成 |
| `icon.png` | 存档图标 | 仅影响存档列表中的图标 |
| `session.lock` | 会话锁，服务器运行时写入 | 不应备份；恢复时也不应保留 |
| `level.dat_old` | 上一次 `level.dat` 的自动备份 | 可选，可用于回退 |

若 `acovia-core` 位于 `world/datapacks/`，它将随 `datapacks/` 一同备份；若位于服务端根目录的 `datapacks/`，则不在世界目录内，需单独从仓库部署。

## 数据重要性

按数据丢失后的影响分为三级。

**必须保留**

- `level.dat`
- `data/minecraft/world_gen_settings.dat`（旧版位于 `level.dat`）
- 各维度的 `region/`
- `players/data/`
- `data/minecraft/scoreboard.dat`
- `datapacks/`，前提是 `acovia-core` 位于此目录

**应当保留**

- `entities/` 与 `poi/`
- `data/minecraft/` 下的 `game_rules.dat`、`world_clocks.dat` 与 `weather.dat`
- 各维度的 `world_border.dat` 与 `chunk_tickets.dat`
- `data/minecraft/maps/` 与 `scheduled_events.dat`
- 自定义维度 `acovia:resola`、`acovia:niravos` 中的建筑区域

**可选**

- `advancements/` 与 `stats/`
- `generated/`、`icon.png` 与 `level.dat_old`
- `raids.dat` 与 `ender_dragon_fight.dat`
- `command_storage.dat`，前提是数据包不使用存储
- `random_sequences.dat`、`custom_boss_events.dat`、`stopwatches.dat`、`wandering_trader.dat` 等状态文件

**不应备份**

- `session.lock`
- 服务器日志、崩溃报告与缓存

选择性备份不包括未列入规则的区域。恢复后缺失的区块会按种子重新生成，无法恢复原有建筑。

## mc-saver

### 规则文件

规则存储于世界目录的 `saver.json` 中：

```json
{
  "dimension": {
    "minecraft:overworld": {
      "range": [
        { "from": { "x": -1, "y": -1 }, "to": { "x": 0, "y": 0 } }
      ],
      "simple": []
    }
  },
  "file": ["level.dat", "data", "datapacks", "players"]
}
```

- `range` 与 `simple` 的单位为区域索引，并非方块坐标。一个区域为 512×512 方块；区域 X 等于方块 X 除以 512 后向下取整。
- `r.-1.-1.mca` 覆盖 -512 至 -1，`r.0.0.mca` 覆盖 0 至 511。主世界边界为 1024 格见方，因此 `-1,-1` 至 `0,0` 覆盖整个主世界。
- `simple` 表示单个区域，适用于仅备份某一处建筑。
- `file` 列出存档根目录下的文件或目录。

### 常用命令

```bash
mc-saver gencfg /srv/minecraft/world
mc-saver ls /srv/minecraft/world
mc-saver ls-dms /srv/minecraft/world

mc-saver add-dms /srv/minecraft/world acovia:resola
mc-saver add-range /srv/minecraft/world acovia:resola @-1 @-1 0 0
mc-saver add-simple /srv/minecraft/world acovia:niravos 2 2
mc-saver add-file /srv/minecraft/world players

mc-saver run /srv/minecraft/world /srv/backups/world-2026-11-20.zip
```

命令行中的负数坐标须加 `@`、`:` 或 `=` 前缀，否则会被解析为选项。REPL 中不需要前缀：

```bash
mc-saver repl /srv/minecraft/world
mc-saver > add-range acovia:resola -1 -1 0 0
```

若 `run` 的第二个参数为已存在的目录，则生成 `<世界名>-YYYY-MM-DD.zip`；同名时依次追加 `-1`、`-2`。

### 新版与旧版

- 新版默认的 `file` 为 `level.dat`、`data`、`datapacks` 与 `players`。
- 旧版须使用 `-l`，默认 `file` 为 `level.dat`、`data`、`datapacks`、`advancements` 与 `playerdata`。
- 注意：mc-saver 的 README 将 `-l` 描述为适用于 1.21.11 之前的存档。实际上 1.21.11 仍使用旧布局，26.1 才引入 `dimensions/` 与 `players/`。判断时应以目录结构为准。
- 旧版的 `stats/` 不在默认列表中，需通过 `add-file` 添加。
- `-l` 模式下，`data` 为主世界的数据目录，同时又会作为维度数据保存一次，归档中因此出现重复条目；如不需要，可使用 `rm-file` 删除。

```bash
mc-saver -l gencfg /srv/minecraft/old-world
mc-saver -l run /srv/minecraft/old-world /srv/backups/old-2026-11-20.zip
```

### 行为

- 规则中列出但世界中不存在的维度或文件，会使整个备份中止。该行为用于避免静默遗漏。
- 未生成过的区域文件会被跳过，并输出警告。
- 不支持符号链接；指向目录的链接会导致备份失败。
- 归档顶层保留世界目录名；解压至服务器目录即可恢复原位。
- 规则为空时，备份仍会成功，但 ZIP 归档为空。应检查归档大小。

## 备份流程

1. 停止服务器，或在控制台执行 `save-off` 与 `save-all flush`，等待日志出现保存完成。不得直接复制正在写入的地图。
2. 确认 `saver.json` 覆盖当前存在的维度与待保留区域。使用 `ls-dms` 对照 `world/dimensions/`。
3. 运行 `mc-saver run`，将归档写入另一块磁盘。
4. 使用 `unzip -l` 检查关键条目：`level.dat`、`data/minecraft/world_gen_settings.dat`、`players/data/` 及各维度的 `region/`。
5. 若服务器未停止，恢复 `save-on`。
6. 将归档复制至另一台机器，并按日期保留多份。

## 恢复

1. 停止服务器。
2. 将当前 `world/` 重命名，保留用于回退。
3. 解压归档至服务器目录，确认 `world/level.dat` 存在。
4. 若归档中包含 `session.lock`，删除该文件。
5. 启动服务器，检查种子、出生点、玩家背包、记分板分数与自定义维度。
6. 旧存档应使用对应旧版本打开，或由 26.1 及以后首次加载时升级。升级前应再次备份。

## 注意事项

- `session.lock` 不应备份。
- `saver.json` 不属于世界数据；建议与归档一并保存，以便恢复后继续使用原规则。
- 备份为选择性备份，并非完整快照。未备份区域在恢复后不会重新出现。
- 若 `acovia-core` 部署于服务端根目录而非世界目录，mc-saver 无法读取，应单独从仓库取对应提交。
- 升级至 26.x 或更换服务端核心时，旧的多世界目录可能被迁移至 `world/dimensions/`；迁移前应完成一次完整备份。

## 参考

- [mc-saver](https://github.com/fovlin/mc-saver)
- [Java版存档格式](https://zh.minecraft.wiki/w/Java%E7%89%88%E5%AD%98%E6%A1%A3%E6%A0%BC%E5%BC%8F)
- [Java版存档格式/1.21.11](https://zh.minecraft.wiki/w/Java%E7%89%88%E5%AD%98%E6%A1%A3%E6%A0%BC%E5%BC%8F/1.21.11)
