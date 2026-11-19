# 世界生成

世界生成文件位于 `data/acovia/worldgen/`。当前数据包定义了一个生物群系 `acovia:ancient_forest`，以及该群系使用的地物、树木与植被。该群系由 `acovia:niravos` 固定使用。

## 生物群系

`worldgen/biome/ancient_forest.json` 定义以下属性：

- 无降水，温度为 0.7。
- 天空与雾的颜色为 `#cfc3af`，水色为 `#7f9fcf`。
- 使用洞穴、峡谷与下界洞穴雕刻器。
- 不生成动物；生成器列表已被移除。
- 地表由古草、古花、化石、巨型蘑菇、丛林树、竹子与古树组成。

群系的 `features` 数组按生成阶段排列，依次包含湖泊、岩石、怪物房间、蘑菇、矿石、泉水、植被与顶层冻结。修改数组顺序会改变地物生成阶段，必须对照原版群系的阶段索引。

## 生成流程

地物由两部分组成：

- `configured_feature/` 定义地物本身，例如树木的高度、树叶类型与根系。
- `placed_feature/` 定义放置规则，例如出现次数、高度分布与生物群系过滤。

`feature/` 目录中的同名文件为历史遗留定义，当前生效的是 `configured_feature/` 与 `placed_feature/`。修改地物时应编辑后两者，不应修改 `feature/`。

### 古树

`ancient_oak` 与 `ancient_spruce` 使用巨型丛林树干放置器：

- 主干基础高度为 16，随机附加 16 与 16，因此高度范围为 16 至 48。
- 树叶以杜鹃叶为主，少量为开花杜鹃叶。
- 根系使用红树林根系，垂直偏移范围为 8 至 32。

树干、树叶与根系均由 `configured_feature` 定义；出现频率与高度分布由 `placed_feature` 控制。

### 古花与古草

`ancient_flower` 与 `ancient_grass` 为简单植被地物。`flower.list` 保存可用花朵的标识符列表；`get_all_flower.py` 用于从游戏数据生成该列表。新增花朵时，应重新生成列表并检查 `configured_feature` 中的引用。

### 其他地物

- `vegetal_fossil_coal`：煤炭化石。
- `surface_huge_brown_mushroom`、`surface_huge_red_mushroom`：巨型蘑菇。
- `local_forest_rock`：地表岩石。
- `vegetal_bamboo_some_podzol`、`vegetal_jungle_tree`、`vegetal_mega_jungle_tree`、`vegetal_trees_old_growth_pine_taiga`：混合植被。

## 修改流程

1. 在 `configured_feature/` 中修改或新增地物定义。
2. 在 `placed_feature/` 中定义放置规则。
3. 将放置后的地物加入 `biome/ancient_forest.json` 的 `features` 数组，并保持阶段索引正确。
4. 重启服务器。世界生成数据在世界加载时注册；`/reload` 不保证重新加载生成器。
5. 在新生成的区块中验证。已生成的区块不会改变。
6. 使用 `/place feature acovia:<id>` 可在当前位置单独测试地物。
7. 按[备份](/develop/maintain/backup)保留存档，并按[种子迁移](/develop/maintain/ch-seed)处理需要保留的旧地形。

修改群系或地物后，旧区块仍保持原样；只有新生成的区块使用新设置。若需要让旧区域也使用新地形，必须更换种子或迁移区块，无法通过 `/reload` 完成。
