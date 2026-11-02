# DSH Super-agent：图的阅读与信源

核对日期：2026-11-03。官方原型固定到 `6337fc823ce20251c8de8085948165c81aaa701e`。这是机制解读，A/B 任务和动画 trace 为教学示意。

## 先看哪两条路径

新事件先经过准入与评估；接单后创建 Ticket、Mandate 和 Assignment，再启动具体 Worker。已有订阅的后续事件可直接送入所属任务，减少主会话转发。工单保存业务连续性，执行会话承接具体工作；`ready` 与 PR 已合并分别表示不同事实。这些关系来自官方领域模型和执行文档。

## 图上元素如何追溯

| 图上元素 | 依据 | 图中的简化 |
| --- | --- | --- |
| Source / Trigger / Thread | 官方 docs/001-domain.md 的 Flow 与 Concepts | GitHub 与可选飞书合在一个入口 |
| Gate / Eval / 主会话 | docs/001-domain.md、007-architecture.md 的 Engine、Evals、main Session | 将程序准入和模型判断放在相邻模块 |
| Ticket / Mandate / Assignment | docs/001-domain.md 的 Concepts | 合成一个工作单元卡片 |
| Worker A/B | docs/003-execution.md 的 Executor、Preparing a Ticket directory、Concurrency | 用两个无实际任务名的实例表示并发，不代表固定只有两个 Worker |
| Store / Effects | docs/007-architecture.md 的 Engine、Store 与持久动作 | 仅展示工单写入，不逐条画所有读写 |
| Report / Outbox | docs/007-architecture.md 的 Notices、Outbox；docs/003-execution.md 的 reports 与 Channel failure | 合并报告转达与消息交付，不表示所有进度都通知人 |
| 人类 / 原线程与面板 | README、docs/003-execution.md | 将结果阅读和待处理项合成一个出口 |
| 下部两个虚框 | DeepSeek 产品部文章署名转载的 §5、§6 | 只列设计方向，不连接成已实现的原型组件 |

文章还讨论了上下文预算、异步交互及实验；本图聚焦调度、授权与交付，没有逐项复刻全文，也没有把合成负载结果当成真实编码能力证明。上部的订阅箭头只画到 A，代表可直通所属 Worker，不表示 B 不能订阅。

## 原型与文章的边界

官方 README 明确说明这是研究原型，公开代码与内部版本及文章不完全相同。下部 Watchdog 与云端/端侧拆分单独作为文章层方案展示；上部的工作目录不应被理解成操作系统安全沙箱。

## 信源

- [官方 README（固定提交）](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/README.md)
- [官方领域模型](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/001-domain.md)
- [官方执行文档](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/003-execution.md)
- [官方架构文档](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/007-architecture.md)
- [《Super-agent 设计探索》署名转载](https://www.chaincatcher.com/article/2300676)：页面标注原文作者为 DeepSeek 产品部；用于读取设计文章，不将转载站称为官网。
- [公众号原文入口](https://mp.weixin.qq.com/s/zoS7GlReWPhfCjENGxXCdg)、[DeepSeek Harness 的 X 长文入口](https://x.com/DeepSeekHarness/status/2116857257245987236)：本次直接读取受限，全文核对使用上面的署名转载。

## 主题与导出

交互 HTML 顶部可以选择暖纸、冷瓷、蓝图、石墨。浏览器选择只影响当前网址，不修改磁盘文件；CLI 导出使用 `--theme paper|porcelain|blueprint|graphite`。附带视频采用蓝图主题，展示 12 秒循环机制动画。
