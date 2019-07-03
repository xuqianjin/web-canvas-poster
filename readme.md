## 简介

通过 canvas 组合文字，图片，并转换 canvas 到图片，
图片特性：支持圆角直角，并行下载，生成速度更快
文字特性：支持颜色字体大小等设置

## demo

[样例](https://github.com/xuqianjin/web-canvas-poster/tree/master/demo)

## 安装

```
npm install web-canvas-poster
```

or

```
yarn add web-canvas-poster
```

## 用法

```
const options={}
const element={}
const elements=[]
new CanvasPoster(options).render(elements).then( (base64,ctx,canvas) => {} )
```

### options

| 参数名  | 类型 | 释义     | 默认值 |
| ------- | ---- | -------- | ------ |
| canvasW | int  | 画布宽度 | 无     |
| canvasH | int  | 画布高度 | 无     |
| scale   | int  | 缩放系数 | 1      |

例如海报类，UI 一般按照 750/375 尺寸设计，canvasW 和 canvasH 可以直接填写标注的尺寸
有时候会遇到生成图片不清晰问题，这里可以试着加大 scale

### element

| 参数名  | 类型                                    | 释义                          | 备注       |
| ------- | --------------------------------------- | ----------------------------- | ---------- |
| type    | CanvasPoster.Image \| CanvasPoster.Text | 元素类型                      | 无         |
| x       | int                                     | x 坐标                        | 无         |
| y       | int                                     | y 坐标                        | 无         |
| height  | int                                     | 高度                          | Image 仅有 |
| width   | int                                     | 宽度                          | Image 仅有 |
| content | string\|url                             | 图片为 url，文字为文字 string | 无         |
| config  | object                                  | 各自配置                      | 无         |

type=CanvasPoster.Image

```
config={
    radius
}
```

type=CanvasPoster.Text

```
config={
    color,
    fontStyle,
    fontVariant,
    fontWeight,
    fontSize,
    fontFamily
}
```

### base64

合成图的 base64 格式，可以直接用于 img 标签

### ctx

合成图的 canvas context

### canvas

合成图的 canvas 对象
