# DSH Super-agent 讲解板：阅读与信源

这版采用用户提供的教学信息图作为视觉参考，提取对比、编号、线稿与分块讲解方式。画面与图标由 HTML/CSS/SVG 重新构建，参考位图未复制到仓库。字体优先使用本机 Kai 系字体，缺失时回退系统字体。

## 六块画面分别讲什么

1. 会话负担：对比单会话工具与持续实体的任务组织方式。
2. 统一入口：用三个入口和一个中心节点说明多信道概念；公开原型实际监听 GitHub 与可选飞书，其他入口只在概念层展示。
3. 原型流程：Source、Eval、主会话、Worker 与 Outbox 的机制简图。Worker A/B 是解释并发的例子，不是实际运行中的任务。双向箭头合并表示分派与报告，不逐条展示内部 API。
4. 上下文：对应文章 §3.3 的引用与按需展开；Thread/Ticket 编号为示意，不是项目中的真实记录。
5. 异步交互：用两条时间序列说明文章 §4.1 的同步/异步区别；公开原型执行细节以 docs/003 为准。
6. 长期在线：对应文章 §5、§6 的架构方向，用虚框与正文明确区分，不宣称公开原型已经实现云端 Agent Loop、端侧 daemon 或独立 Watchdog。

光点为机制动画。图没有加入性能条形图，也没有把合成负载实验改写为真实编码能力。

## 内容依据

- [文章署名转载](https://www.chaincatcher.com/article/2300676)：页面注明原文作者为 DeepSeek 产品部。用于理解概念，不将转载站称为官方站点。
- [官方原型 README](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/README.md)：研究原型定位、GitHub/Feishu 来源、原线程交付及文章实现差异。
- [官方领域模型](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/001-domain.md)：Trigger、Thread、Eval、Ticket、Mandate、Assignment 和订阅。
- [官方执行文档](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/003-execution.md)：独立执行上下文、后台工作、输入投递与 ready/merged 的区别。
- [官方实现架构](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/6337fc823ce20251c8de8085948165c81aaa701e/docs/007-architecture.md)：主会话、Notices、Outbox 与持久化动作。

固定核对提交为 `6337fc823ce20251c8de8085948165c81aaa701e`。公众号与 X 正文此前读取受限，文章内容采用上述署名转载并与官方文档交叉核对。

## 复用

`layout: "explainer"` 选择讲解板布局，默认使用 `sketch` 白板配色。`groups[].step` 提供编号；`nodes[].shape` 与 `nodes[].icon` 选择内置图形。内容与位置仍由 JSON 规格管理；主题切换、暂停动画、原始尺寸、PNG/视频/Mermaid 导出继续可用。
