# 把一首歌，拆成人声与伴奏：阅读说明

这是一张关于 Demucs v4 音源分离机制的教学讲解板。内容来自官方文档与源码，不是对某款应用的实现审计。没有安装或运行分离模型，没有下载、处理或使用真实歌曲。

固定源码提交：`e976d93ecc3865e5757426930257e200846a520a`。

## 五块画面

| 画面 | 内容依据 | 简化与边界 |
| --- | --- | --- |
| 估计四条声部 | README 的模型说明及输出格式 | vocals、drums、bass、other 并列展示；不是顺序生成的四个步骤。示意波形不对应真实音频 |
| 双域协同 | `HTDemucs.forward` 的编码器、`crosstransformer`、解码器及波形重建 | 省略卷积层、跳跃连接、归一化与张量维度，突出时域/频域路径及最终融合 |
| 分段拼接 | `apply_model` 的 split 分支 | 实现采用带权重的重叠片段累加，并除以累计权重；图中片段长度和数量均为示意 |
| 两轨模式 | `separate.py` 的 `args.stem` 分支及 README 的 `--two-stems` 说明 | 先完整分离，再保留目标声部，默认以其余估计声部相加形成伴奏。源码另提供 minus/none 方式，图未展开 |
| 理解结果 | README 对串音、伪影等结果差异的说明 | 不给出未经实测的音质、速度或硬件指标 |

## 信源

- [官方 README](https://github.com/facebookresearch/demucs/blob/e976d93ecc3865e5757426930257e200846a520a/README.md)
- [Hybrid Transformer Demucs 源码](https://github.com/facebookresearch/demucs/blob/e976d93ecc3865e5757426930257e200846a520a/demucs/htdemucs.py)
- [分段、重叠与权重融合](https://github.com/facebookresearch/demucs/blob/e976d93ecc3865e5757426930257e200846a520a/demucs/apply.py)
- [声部分离与两轨输出](https://github.com/facebookresearch/demucs/blob/e976d93ecc3865e5757426930257e200846a520a/demucs/separate.py)

## 复用与导出

规格文件为 `skills/motion-map/examples/music-separation.json`，采用 `layout: "explainer"` 与 `theme: "sketch"`。此例使用一条总览、一个双分支模型图、两个局部机制和一个阅读边界区，没有复用 DSH 示例的六块结构。

```bash
node bin/cli.mjs build skills/motion-map/examples/music-separation.json docs/music-separation.html
node bin/cli.mjs check docs/music-separation.html
node bin/cli.mjs export docs/music-separation.html music.png music.mp4 --seconds 12 --scale 1
```

HTML 可离线打开、切换主题、暂停和查看原始尺寸。附带 MP4 是 12 秒无声机制动画，光点代表示意数据流，不是模型实时进度。
