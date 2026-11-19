# 多维度

数据包通过 `dimension` 与 `dimension_type` 定义维度。`dimension` 描述生成器与生物群系来源，`dimension_type` 描述该维度的规则：时间、床、重生锚、天空与高度。两个文件均位于 `data/acovia/` 下。

## 维度列表

| 标识符 | 用途 | 类型 | 生成器 | 边界 |
| --- | --- | --- | --- | --- |
| `minecraft:overworld` | 定居与建造 | 原版主世界 | 原版 | 1024 格见方，中心 (0, 0) |
| `acovia:resola` | 资源采集 | `minecraft:overworld` | 主世界噪声设置，`multi_noise` 预设 | 无 |
| `acovia:niravos` | 流放 | `acovia:niravos` | 主世界噪声设置，固定 `ancient_forest` 群系 | 无 |

### acovia:resola

`dimension/resola.json` 使用 `minecraft:overworld` 类型与主世界的噪声设置、`multi_noise` 群系预设。该维度没有保护，挖掘、爆破与红石装置均在此进行。

主世界边界外的玩家会被 `base/beyond_the_border` 送入该维度。传送落点由 `spreadplayers` 在原坐标附近 16 格内选择。

### acovia:niravos

`dimension/niravos.json` 使用自定义类型 `acovia:niravos`，生成器沿用主世界噪声设置，生物群系固定为 `acovia:ancient_forest`。

`dimension_type/niravos.json` 定义以下规则：

- 时间固定，天空为黑色，环境光为 0.25。
- 床不能使用，也不能设置重生点；重生锚无效。
- 天空盒使用末地样式，高度为 384 格。
- 未设置世界边界。

`enchantment/imprison` 将目标传送至该维度，落点距原点最远 5120 格。目标已在该维度时不会重复传送。

## 边界与传送

`acovia:load` 在主世界执行：

```mcfunction
execute in minecraft:overworld run worldborder center 0.0 0.0
execute in minecraft:overworld run worldborder set 1024
```

边界为边长 1024 格，范围为 -512 至 512。`predicate/beyond_the_border` 检查玩家是否位于主世界且超出 -496 至 496 的范围；`function/base/beyond_the_border` 每 20 tick 检查一次，将符合条件的玩家以 `spreadplayers ~ ~ 16 16` 送入 `acovia:resola`。

世界边界按维度存储。主世界边界由加载函数重设；其他维度不设边界。若需为某维度设置边界，应在其维度数据中写入，或在函数中按维度执行 `worldborder`。

## 新增维度的步骤

1. 在 `data/acovia/dimension/` 下创建 `<标识符>.json`，声明 `type` 与 `generator`。
2. 若需要独立的规则，在 `data/acovia/dimension_type/` 下创建类型文件，并在 `dimension` 中引用 `acovia:<标识符>`。
3. 噪声维度使用 `minecraft:noise` 生成器；生物群系来源可选 `multi_noise` 预设或 `fixed` 单群系。
4. 重启服务器。新增维度在世界加载时注册，`/reload` 不会创建对应的世界目录。
5. 进入维度验证生成、时间、床与重生规则。首次进入后，世界目录下会出现 `dimensions/acovia/<标识符>/`。
6. 按需添加边界、传送函数、备份规则、文档与更新日志条目。

最小维度定义：

```json
{
  "type": "minecraft:overworld",
  "generator": {
    "type": "minecraft:noise",
    "settings": "minecraft:overworld",
    "biome_source": {
      "type": "minecraft:multi_noise",
      "preset": "overworld"
    }
  }
}
```

## 删除与重命名

删除维度时，应首先移除 `dimension` 与 `dimension_type` 文件，再处理世界目录中的 `dimensions/acovia/<标识符>/`。该目录不会自动删除；其中包含区块、实体、兴趣点与维度数据。删除前应确认没有玩家位于该维度，并按[备份](/develop/maintain/backup)保留存档。

重命名维度等于更换标识符。世界目录、数据包中的引用、传送函数、备份规则与文档均需同步修改。旧标识符的目录不会自动迁移。服务器曾使用的标识符不应再次分配给其他维度，以免旧数据被误读。

## 维度数据

每个维度在 `dimensions/<命名空间>/<标识符>/` 下拥有独立的 `region/`、`entities/`、`poi/` 与 `data/`。`data/minecraft/` 中保存该维度的世界边界、区块标签与袭击状态。

新增或修改维度生成器后，已生成的区块不会改变。新设置只影响尚未生成的区块。需要更换地形时，按[种子迁移](/develop/maintain/ch-seed)处理，并先完成备份。
