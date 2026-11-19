# acovia-website

Acovia 官方站点。内容页由 docs-go 生成，首页是一份独立的静态 HTML。

首页样式只作用于首页；文档页沿用 docs-go 主题的布局，由 `public/assets/style.css` 覆盖配色，使其与首页一致。

## 构建

```bash
./build.sh
```

输出到 `dist/`。`public/index.html` 是首页源文件，docs-go 构建后会把 `public/` 复制到站点根目录。

## 结构

```text
config/docs.json             docs-go 站点配置
config/sidebar.json          文档侧边栏
docs/                        server / gameplay / changelog 等 Markdown 页面
public/index.html            首页源文件
public/assets/acovia.css     首页样式
public/assets/style.css      文档页配色覆盖
public/assets/pictures/      首页胶片的 WebP（1280 / 640）
public/assets/TsangerYuYangT.ttf     TsangerYuYangT / 仓耳渔阳体
public/assets/acovia.js      首页的复制地址按钮
```

## 首页胶片

首页底部的风景胶片引用 `https://repo.acovia.net/resources/web/webp/` 下的 WebP（640 与 1280 两个宽度），加载失败时回退到 `resources/web/pictures/` 的 PNG。仓库里不存放这些图片。

胶片宽度上限 960px，两边用渐隐过渡；一行 5 张，一屏最多露出 3 张。

## 本地预览

安装 [docs-go](https://github.com/fovlin/docs-go)

```bash
docs-go dev
```

`serve.py` 支持 clean URL；直接用 `python3 -m http.server -d dist` 时 `/server` 这类地址会 404，但 `/server.html` 可以访问。
