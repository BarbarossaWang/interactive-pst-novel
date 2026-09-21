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
| 十二 | Weeping Stone Catacombs 泣石地下墓穴 | 62 | 80–85 | 86–91 |
| 十三 | Dead Nations 亡者国度 | 64 | 86–91 | 92–97 |
| 十四 | The Fate Of Soego 索戈的命运 | 12 | 92 | 98 |
| 十五 | The Silent King 沉默之王 | 64 | 93–97 | 99–103 |
| 十六 | Drowned Nations 溺沉国度 | 10 | 98–99 | 104–105 |
| 十七 | The Tomb 墓室 | 50 | 100–103 | 106–109 |
| 十八 | Pharod 法罗德 | 73 | 104–109 | 110–115 |
| 十九 | Xachariah, Part I 扎卡利亚（上） | 49 | 110–113 | 116–119 |
| 二十 | Dak'kon, Part II 达肯（下） | 58 | 114–118 | 120–124 |
| 二十一 | Xachariah, Part II 扎卡利亚（下） | 33 | 119–121 | 125–127 |
| 二十二 | Annah, Part I 安娜（上） | 59 | 122–127 | 128–133 |
| 二十三 | Chaos Dogs Barking 混沌犬吠 | 62 | 128–133 | 134–139 |
| 二十四 | Alley Of Lingering Sighs 长叹巷 | 47 | 134–137 | 140–143 |
| 二十五 | Master Of The Bones 骸骨之主 | 57 | 138–143 | 144–149 |
| 二十六 | Unbroken Circle Of Zerthimon, Part II 泽西蒙不破之环（下） | 59 | 144–149 | 150–155 |
| 二十七 | Lower Ward 下城区 | 172 | 150–162 | 156–168 |
| 二十八 | Coaxmetal 科克斯梅塔尔 | 67 | 163–166 | 169–172 |
| 二十九 | Clerks' Ward 书记区 | 76 | 167–173 | 173–179 |
| 三十 | Ignus 伊格纳斯 | 93 | 174–182 | 180–188 |
| 三十一 | Fall-From-Grace, Part I 失宠（上） | 63 | 183–187 | 189–193 |
| 三十二 | Brothel Of Slaking Intellectual Lusts 智欲馆 | 23 | 188–190 | 194–196 |
| 三十三 | Nenny Nine-Eyes 妮妮九眼 | 35 | 191–193 | 197–199 |
| 三十四 | Marissa 玛丽莎 | 29 | 194–195 | 200–201 |

## 打开方式

直接双击 `index.html` 即可（无需服务器、无需联网）。若浏览器限制本地文件，也可在本目录启动任意静态服务器：

```powershell
python -m http.server 8000   # 然后访问 http://127.0.0.1:8000/
```

## 页面结构

| 文件 | 内容 |
| --- | --- |
| `index.html` | 章节目录页：各章卡片 + 阅读进度 + 全站统计 |
| `the-mortuary.html` / `deionarra.html` / `the-hive.html` / `morte-part-i.html` / `hive-market.html` / `mazed.html` / `smoldering-corpse.html` / `dak-kon-part-i.html` / `ragpickers-square.html` / `buried-village.html` / `unbroken-circle-of-zerthimon-part-i.html` / `weeping-stone-catacombs.html` / `dead-nations.html` / `the-fate-of-soego.html` / `the-silent-king.html` / `drowned-nations.html` / `the-tomb.html` | 各章精读页 |
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
- **段落目录**：左栏目录跟随滚动高亮，支持搜索跳段
- **词汇表 / 语法索引**：章节末尾可全文搜索；语法索引每条都带「段 N」跳回原文
- **CSV 导出**：一键导出本章生词（word / phonetic / pos / meaning / paragraph），可直接导入 Anki
- 快捷键：`T` 译文 · `N` 注释 · `H` 高亮 · `D` 深色模式

## 手机 / 响应式

| 屏宽 | 布局 |
| --- | --- |
| ≥1100px | 左栏 260px 目录 + 正文双栏 |
| 900–1100px | 目录收窄到 220px |
| <900px | 单栏；目录改为左侧抽屉（☰ 目录 打开，遮罩/✕/`Esc` 关闭，点条目自动收起） |
| <700px | 词汇表由表格转为卡片式（标签在左、内容在右，空字段自动隐藏） |
| <640px | 工具条不换行、可横滑，按钮改用短标签并把常用项排在前面 |
| <560px | 进一步压缩留白、字号与卡片内边距 |

其他移动端细节：`viewport-fit=cover` + `env(safe-area-inset-*)` 适配刘海与手势条、`100dvh`
处理地址栏伸缩、搜索框字号 ≥16px 避免 iOS 聚焦缩放、触摸设备放大点按区域并去掉 hover 依赖、
右下角「↑ 回到顶部」（滚动超过 600px 出现）、`prefers-reduced-motion` 下关闭动画、
`theme-color` 随深浅色切换、打印时自动隐藏工具条与目录。

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
| Weeping Stone Catacombs | 80–85 | 86–91 |
| Dead Nations | 86–91 | 92–97 |
| The Fate Of Soego | 92 | 98 |
| The Silent King | 93–97 | 99–103 |
| Drowned Nations | 98–99 | 104–105 |
| The Tomb | 100–103 | 106–109 |
| Pharod | 104–109 | 110–115 |
| Xachariah, Part I | 110–113 | 116–119 |
| Dak'kon, Part II | 114–118 | 120–124 |
| Xachariah, Part II | 119–121 | 125–127 |
| Annah, Part I | 122–127 | 128–133 |
| Chaos Dogs Barking | 128–133 | 134–139 |
| Alley Of Lingering Sighs | 134–137 | 140–143 |
| Master Of The Bones | 138–143 | 144–149 |
| Unbroken Circle Of Zerthimon, Part II | 144–149 | 150–155 |
| Lower Ward | 150–162 | 156–168 |
| Coaxmetal | 163–166 | 169–172 |
| Clerks' Ward | 167–173 | 173–179 |
| Ignus | 174–182 | 180–188 |
| Fall-From-Grace, Part I | 183–187 | 189–193 |
| Brothel Of Slaking Intellectual Lusts | 188–190 | 194–196 |
| Nenny Nine-Eyes | 191–193 | 197–199 |
| Marissa | 194–195 | 200–201 |

仅供个人英语学习使用。
