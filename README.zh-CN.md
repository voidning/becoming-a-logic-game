# Becoming

[English](README.md) · 简体中文

一个极简浏览器解谜原型，只有三关：**初见、回收、余量**。通过放置、回收和重复利用材料，让圆点抵达终点。第三关完成后结束，可以重新开始。

第一关完成获得“无”；第三关结尾显示“变”作为奖励名称，本包没有定义它的可玩操作。名称是游戏比喻，不是哲学概念的定义。

## 试玩

直接打开根目录的 [`becoming.html`](becoming.html) 即可试玩单文件版。它与 `site/` 中的三关源码保持一致，不需要服务器、构建依赖或联网。

需要通过本地服务器运行源码版时，可双击 `启动试玩.command`，或运行：

```sh
python3 tools/serve.py --open
```

可加 `--level 3` 直接打开第三关，只支持 1–3；保持终端运行，Ctrl+C 停止。可编辑源码仍位于 `site/`。

按 1 选“有”，按 2 选“无”，再点按场景中的空位或材料。Esc／重来重置当前关，菜单重玩已到达关卡。角色自动走，脚下支撑不能回收。进度只保存关卡编号，不保存中途布局。

## 接手

- [入口](START_HERE.md)
- [三关玩法与解法](docs/GAMEPLAY.md)
- [技术说明](docs/TECHNICAL_HANDOFF.md)
- [设计原则](docs/DESIGN_DIRECTION.md)

`site/` 是当前源码，`archives/` 是早期空白实验与两关原型。设计原则描述创作方法，不代表其他关卡已经实现。

## 检查

```sh
node tools/check-rules.cjs
node tools/check-controller.cjs
python3 tools/build-standalone.py --check
python3 tools/check-integrity.py
```

规则检查覆盖三关 91 个可达状态；模拟控制器检查覆盖连续完成、奖励、结束、存档和重玩。它们不是真实浏览器端到端或玩家理解验证。见 [验证记录](validation/RESULTS.md)。

修改 `site/index.html`、`site/puzzle.js` 或 `site/app.js` 后，运行 `python3 tools/build-standalone.py` 重新生成单文件版。
