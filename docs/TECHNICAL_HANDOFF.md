# 三关技术交接

本地静态 H5，无后端、框架、构建步骤或外部素材。先读 `DESIGN_DIRECTION.md`；本文是现有实现说明，不是未来谜题的约束。

## 文件职责

- `site/index.html`：页面、样式、按钮、选关菜单。加载 `puzzle.js?v=three` 和 `app.js?v=three`。
- `site/puzzle.js`：三关数据和纯规则；浏览器全局 BeingPuzzle，也支持 Node require。
- `site/app.js`：点击、自动前进、转场、奖励、存档。
- `becoming.html`：由上述三个文件生成的便携单文件试玩版，不直接编辑。
- `tools/build-standalone.py`：生成或检查 `becoming.html`；源码变更后运行一次生成命令。

## 状态与接口

`create(level)` 的 level 只允许 0、1、2。状态含 level、player、stock、total、canErase、canShift、won、cells。cells 为 `{x,y,filled}`。canShift 只记录第三关结尾的奖励名称，不对应可执行操作。

- `create` 建立初始局面；`info` 返回名称、提示和奖励；`count` 为 3。
- `edit(state,x,y,mode)` 接受 create/erase，返回 `{state,changed,reason}`。失败保留状态，成功复制后修改。
- `step` 自动前进一步，阻塞时返回原状态。
- `blocked` 返回 null、done、wall 或 gap；`key` 生成坐标键。

材料守恒，角色保持支撑，不与材料墙重叠；获胜后不再接受编辑。第一关授予回收能力，第三关显示结尾奖励。

## 控制器

`start` 清除定时器并增加 generation，重建当前关、选择默认操作并保存进度。`advance/settle` 每步等待 620 ms；`win` 处理奖励与转场，在第三关停住并显示重玩按钮。`later` 捕获 generation，避免旧计时回调影响重置后的局面。隐藏页面不开始新的步进，返回可见后恢复。

## 进度

存档键 `being-puzzle-three-progress`，保存 `{current,unlocked}`，不保存中途布局。URL `?level=1` 至 `?level=3` 优先于存档；非法编号退到第一关。关卡菜单只有三项。浏览器存储按 origin（含端口）隔离，换端口可用关卡 URL 接着玩。

## 启动与检查

```sh
python3 tools/serve.py --level 3 --open
node tools/check-rules.cjs
node tools/check-controller.cjs
python3 tools/build-standalone.py --check
python3 tools/check-integrity.py
```

工具按自身位置解析包目录，不依赖旧会话。背景 #f6f6f3、前景 #242427，场景七列五行，最大宽 560px；原生按钮、aria-live 提示，支持减少动画偏好。真实浏览器、触摸、读屏与哲学理解未由模拟检查验证。

`archives/` 只保存空白实验和两关原型。读取当前包无需查找其他关卡或旧会话。
