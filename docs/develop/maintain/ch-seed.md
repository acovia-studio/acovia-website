# 种子迁移

种子迁移用于保留源存档中已生成的区块，并使目标存档在未生成区域使用另一个种子。Minecraft 不会因种子改变而重写已生成的区块。迁移的做法是将源存档的区块文件放入一个使用目标种子的存档，边界由区块混合机制处理。

迁移前应按[备份](/develop/maintain/backup)完成一次完整备份。迁移会覆盖目标存档的区域文件；若操作失败，仅能通过备份恢复。

## 区块数据的位置

区块数据按维度存储，文件名为 `r.X.Z.mca`。各版本的路径如下：

```text
新版（26.1 及以后）
  主世界      dimensions/minecraft/overworld/region/
  下界        dimensions/minecraft/the_nether/region/
  末地        dimensions/minecraft/the_end/region/
  自定义维度  dimensions/<命名空间>/<标识符>/region/

旧版（1.21.11 及更早）
  主世界      region/
  下界        DIM-1/region/
  末地        DIM1/region/
  自定义维度  dimensions/<命名空间>/<标识符>/region/
```

一个区域文件包含 32×32 个区块，覆盖 512×512 方块。区域坐标由方块坐标除以 512 后向下取整得到，也可由区块坐标除以 32 后向下取整得到。`r.-1.-1.mca` 覆盖 -512 至 -1，`r.0.0.mca` 覆盖 0 至 511。

每个 `.mca` 文件由 8 KiB 文件头和最多 1024 个区块的数据组成。区块数据包含方块、生物群系、方块实体、高度图、光照及 `DataVersion`。实体与兴趣点不存储在 region 文件中，而分别位于同一维度目录的 `entities/` 与 `poi/` 下，文件名同为 `r.X.Z.mca`。

种子不存储在区块中。新版将其保存在 `data/minecraft/world_gen_settings.dat`，旧版保存在 `level.dat` 的 `WorldGenSettings` 中。修改种子只影响尚未生成的区块，不会改变已存在的方块。

## 混合标记

旧存档升级至新版本时，游戏在区块首次加载时执行升级，并写入 `blending_data`。该标签记录区块的高度信息，用于新旧地形的平滑过渡。包含该标签的区块按旧版区块处理。

区块是否升级由 `DataVersion` 决定。该值低于当前版本时，游戏升级区块并补充混合数据。

新生成的区块若紧邻此类区块，生成器会读取混合数据，在边界处过渡高度与地形，避免产生断层。升级后的主世界、下界与末地区块均采用此机制。

因此，迁移的前提是复制后的区块能被识别为旧区块。由旧版本升级的区块，以及 `DataVersion` 低于当前版本的区块，会在加载时写入 `blending_data`。当前版本新建存档中的区块不含该标记；直接复制区域文件不会产生混合，边界将出现垂直断层。此情况需借助区块标记工具，或保留断层。

## 迁移流程

1. 备份源存档与目标存档；两者均需保留。
2. 将源存档升级至目标版本并启动一次，确认待保留的维度均可正常加载。复制后的旧区块将在目标存档首次加载时完成升级并写入混合数据。
3. 新建目标存档，使用目标种子。其版本、数据包（`acovia-core`）、维度列表与维度生成器必须与源存档一致。启动一次，使 `dimensions/` 与 `players/` 完成初始化，然后停止服务器。
4. 在目标存档中删除待迁移维度的 `region/`、`entities/`、`poi/` 文件。`entities/` 与 `poi/` 分别存储实体与兴趣点；若不清除，其内容将与复制后的区块不一致。不得删除 `level.dat`、`data/` 与 `datapacks/`。
5. 将源存档对应维度的 `region/*.mca` 复制至目标存档的同一目录。若需保留实体与兴趣点，一并复制 `entities/` 与 `poi/`。仅可复制完整的区域文件，不得进行区块级合并。
6. 启动服务器。游戏将升级复制后的区块；边界处的新区块按目标种子生成，并读取混合数据完成过渡。
7. 检查出生点、传送门、农场与世界边界。按需设置世界边界与出生点；确认无误后再次备份。

主世界的区域替换：

```bash
# 目标存档：清除主世界的区块、实体与兴趣点文件
rm -f /srv/minecraft/world/dimensions/minecraft/overworld/{region,entities,poi}/*.mca

# 将源存档的主世界文件复制至目标存档
cp /srv/minecraft/old/dimensions/minecraft/overworld/region/*.mca \
   /srv/minecraft/world/dimensions/minecraft/overworld/region/
```

旧版存档的主世界位于根目录；下界与末地分别位于 `DIM-1/` 与 `DIM1/`：

```bash
rm -f /srv/minecraft/old-world/{region,entities,poi}/*.mca
cp /srv/minecraft/source/region/*.mca /srv/minecraft/old-world/region/
```

## 复制范围

区域文件以整个文件为单位替换，不得仅替换其中的部分区块。接缝位于 512 方块的网格上。若需按区块迁移，应使用 MCA Selector 等工具，不得手动修改 `.mca`。

主世界、下界与末地须分别处理。下界的区域坐标按对应坐标计算；下界坐标与主世界坐标的换算比例为 1:8。

自定义维度（`acovia:resola`、`acovia:niravos`）采用相同的目录结构。目标存档必须首先加载相应数据包，否则不会读取这些维度目录。

`players/` 存储玩家数据，与地图数据无关。若需保留背包与位置，应复制源存档的 `players/`；否则保留目标存档的。旧版对应 `playerdata/`、`advancements/` 与 `stats/`。

`data/` 下的记分板、地图与计划事件决定日龄、地图内容与计时器。若需延续源存档状态，应复制相应文件；否则保留目标存档的。

不得整体复制 `data/`。新版中 `world_gen_settings.dat` 位于 `data/minecraft/`；整体复制会使种子退回源存档的值。应仅复制所需的文件，并保留目标存档的 `world_gen_settings.dat`。

`level.dat` 与 `world_gen_settings.dat` 必须使用目标存档的；否则种子将退回源存档的值。

## 边界与生成

复制后的区块保留旧地形，新区块使用目标种子生成。边界混合仅在新区块生成时计算；结果写入存档后不可撤销。

目标存档在复制前已生成的区域，其区域文件会在清空时丢弃。清空的目的在于避免目标存档的旧区块与源存档文件混合。

未复制的区域按目标种子重新生成。地形变化不会恢复原有建筑。

## 故障排除

**边界出现垂直断层。** 源区块未被识别为旧区块，或其标记已被清除。应检查源存档的版本及 `blending_data`；必要时从升级前的备份重新升级，或使用区块标记工具。

**建筑缺失。** 区域文件未复制、维度路径错误或区域坐标计算错误。应先核对文件名与维度目录。

**物品展示框或盔甲架消失。** 仅复制了 `region/`，未复制 `entities/`。

**村民职业或传送门连接异常。** 未复制 `poi/`。重新加载区块可重建部分兴趣点，但不保证全部恢复。

**玩家背包重置。** 未复制 `players/`。

**种子未改变。** 使用了源存档的 `level.dat` 或 `world_gen_settings.dat`。这两个文件必须取自目标存档。

**世界边界错误。** 复制了维度的 `data/`。应删除该数据，使数据包在 `load` 中重新设置，或手动修改边界。

**自定义方块或物品丢失。** 目标存档的数据包版本与源存档不一致。应先统一 `acovia-core` 的版本。

## 注意事项

- 迁移与复制期间应停止服务器。
- 不得复制 `session.lock`。
- `blending_data` 为游戏内部数据，不得手动修改；如需补充标记，应使用相应工具。
- 升级与混合结果写入存档后不可撤销；操作前应保留完整备份。
- 迁移仅改变地形生成；玩家数据、记分板与地图是否迁移，应另行决定。

## 参考

- [区块格式](https://zh.minecraft.wiki/w/%E5%8C%BA%E5%9D%97%E6%A0%BC%E5%BC%8F)
- [Java版存档格式](https://zh.minecraft.wiki/w/Java%E7%89%88%E5%AD%98%E6%A1%A3%E6%A0%BC%E5%BC%8F)
- [Minecraft Snapshot 21w43a](https://www.minecraft.net/en-us/article/minecraft-snapshot-21w43a)
