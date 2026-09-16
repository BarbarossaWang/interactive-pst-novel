# Planescape: Torment · 逐段精读站点

一个纯静态的英语精读站点：把小说按段落拆开，逐段给出英文原文、中文对照、语法讲解，并对重点词汇做高亮和释义。

已完成章节：

| 章 | 标题 | 段数 | 正文页 | PDF 页 |
| --- | --- | --- | --- | --- |
| 一 | The Mortuary 停尸间 | 174 | 1–13 | 7–19 |
| 二 | Deionarra 戴娜拉 | 75 | 14–19 | 20–25 |
| 三 | The Hive 蜂巢 | 105 | 20–28 | 26–34 |
| 四 | Morte, Part I 莫提（上） | 6 | 29–30 | 35–36 |
| 五 | Hive Market 蜂巢集市 | 66 | 31–37 | 37–43 |
| 六 | Mazed 迷宫 | 32 | 38–41 | 44–47 |
| 七 | Smoldering Corpse 冒烟的尸体 | 75 | 42–51 | 48–57 |
| 八 | Dak'kon, Part I 达肯（上） | 54 | 52–55 | 58–61 |
| 九 | Ragpickers' Square 拾荒者广场 | 128 | 56–65 | 62–71 |
| 十 | Buried Village 埋骨村 | 98 | 66–73 | 72–79 |
| 十一 | Unbroken Circle Of Zerthimon, Part I 泽西蒙不破之环（上） | 48 | 74–79 | 80–85 |

## 打开方式

直接双击 `index.html` 即可（无需服务器、无需联网）。若浏览器限制本地文件，也可在本目录启动任意静态服务器：

```powershell
python -m http.server 8000   # 然后访问 http://127.0.0.1:8000/
```

## 页面结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 章节目录页：各章卡片 + 阅读进度 + 全站统计 |
| `the-mortuary.html` / `deionarra.html` / `the-hive.html` / `morte-part-i.html` / `hive-market.html` / `mazed.html` / `smoldering-corpse.html` / `dak-kon-part-i.html` / `ragpickers-square.html` / `buried-village.html` / `unbroken-circle-of-zerthimon-part-i.html` | 各章精读页 |
| `assets/style.css` | 全站样式（含深色模式、打印样式） |
| `assets/app.js` | 交互逻辑：点词查义、朗读、进度、目录跟随、搜索、CSV 导出 |
| `data/*.js` | 各章内容数据（段落、译文、注释、词表） |
| `chunks/*.json` | 从 PDF 重建出的英文段落（翻译输入） |
| `trans/*.json` | 各分块的翻译与注释（翻译输出） |

## 交互功能

- **点词查义**：正文里的蓝色单词 / 黄色短语点一下就地展开音标、词性、释义；`Esc` 收起
- **显示开关**：中文译文 / 语法注释 / 词汇高亮 三个开关；关掉译文即可做盲读自测
- **朗读**：每段左侧 🔊 用浏览器语音合成朗读该段英文
- **进度**：每段 ✓ 已掌握，左侧目录与顶部进度条同步，数据存在浏览器本地
- **段落目录**：左栏目录跟随滚动高亮，支持搜索跳段（窄屏下收进「☰ 目录」按钮）
- **词汇表 / 语法索引**：章节末尾可全文搜索；语法索引每条都带「段 N」跳回原文
- **CSV 导出**：一键导出本章生词（word / phonetic / pos / meaning / paragraph），可直接导入 Anki
- 快捷键：`T` 译文 · `N` 注释 · `H` 高亮 · `D` 深色模式

## 文本来源与重建说明

英文原文取自 `pst-book-gog.pdf`（Rhyss Hess 整理的《Planescape: Torment》小说化文本）。
PDF 版式特殊：每个字形单独绘制、行内被切成多段、换行处会截断单词、字体切换处会丢空格。
`../tools/reconstruct.py` 按基线 y 重组行、按页面左边界识别段落缩进、按字体切换补回空格，
重建后用全书词表交叉校验（无残词、无粘连）。页面编号对应关系：

| 章 | 正文页 | PDF 页 |
| --- | --- | --- |
| The Mortuary | 1–13 | 7–19 |
| Deionarra | 14–19 | 20–25 |
| The Hive | 20–28 | 26–34 |
| Morte, Part I | 29–30 | 35–36 |
| Hive Market | 31–37 | 37–43 |
| Mazed | 38–41 | 44–47 |
| Smoldering Corpse | 42–51 | 48–57 |
| Dak'kon, Part I | 52–55 | 58–61 |
| Ragpickers' Square | 56–65 | 62–71 |
| Buried Village | 66–73 | 72–79 |
| Unbroken Circle Of Zerthimon, Part I | 74–79 | 80–85 |

仅供个人英语学习使用。
