# 黑格尔逻辑学游戏 · 三关交接

本包只包含 **初见、回收、余量** 三关。`site/` 是可玩的 H5，第三关完成后结束，可重新开始。不预设其他关卡的内容。

## 启动

双击 `启动试玩.command`，或在本包目录运行：

```sh
python3 tools/serve.py --open
```

启动器会打印当前地址；保持终端运行，Ctrl+C 停止。可用 `--level 3 --open` 直接试玩第三关，仅支持 1–3。也可以直接打开 `site/index.html`，不依赖网络或第三方库。

## 新对话接手

1. 读 `AGENTS.md` 与 `docs/DESIGN_DIRECTION.md`，了解设计约定。
2. 读 `docs/GAMEPLAY.md`，了解三关布局、操作和解法。
3. 读 `docs/TECHNICAL_HANDOFF.md`，了解代码、存档和验证方法。
4. 按用户当次具体要求工作，不假定已有其他关卡。

`新对话接手提示词.txt` 可直接交给新对话。能力名称是游戏比喻，当前操作不等同于哲学概念；设计原则和创作意图不是已经实现的关卡。

## 文件地图

- `site/`：HTML、规则引擎、控制器。
- `docs/`：三关玩法、技术说明、设计方法。
- `tools/`：启动、规则检查、模拟控制器检查、完整性检查。
- `validation/`：当前三关的验证、解法和校验记录。
- `archives/`：空白交互实验和两关原型，均无其他关卡。

## 验证

```sh
node tools/check-rules.cjs
node tools/check-controller.cjs
python3 tools/check-integrity.py
```

也可双击 `验证归档.command`。测试需要 Node.js，试玩不需要。模拟检查不等同于真实浏览器或玩家理解验证。

本次交接只以当前工作区文件为准。Git 历史按用户要求保留；新对话不要读取历史版本来补充关卡，也不要将历史内容当作当前设计依据。
