# acovia-website

Acovia 官方站点。内容页由 docs-go 生成，首页是独立的静态动效页面。

首页样式只作用于首页；`docs/` 里的文档页保持 docs-go 默认的 `style.css`，不注入、不覆盖。

## 构建

```bash
./build.sh
```

输出到 `dist/`。`public/index.html` 是首页源文件，docs-go 构建后会把 `public/` 复制到站点根目录。

## 结构

```text
config/docs.json             docs-go 站点配置
config/sidebar.json          文档侧边栏
docs/                        server / changelog 等 Markdown 页面
public/index.html            首页源文件
public/assets/acovia.css     首页样式（含 TsangerYuYangT 字体）
public/assets/songer.ttf     TsangerYuYangT / 仓耳渔阳体
public/assets/acovia.js      首页动效
```

## 本地预览

```bash
./build.sh
python3 serve.py
# http://127.0.0.1:8000/
```

`serve.py` 支持 clean URL；直接用 `python3 -m http.server -d dist` 时 `/server` 这类地址会 404，但 `/server.html` 可以访问。
