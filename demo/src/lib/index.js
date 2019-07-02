const getPixelRatio = function(context) {
  var backingStore =
    context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio ||
    1;
  return (window.devicePixelRatio || 1) / backingStore;
};

class CanvasPoster {
  constructor(options) {
    const { ctx, scaleNum, canvas } = this._initCanvas(options);
    //canvas对象
    this.canvas = canvas;
    //context对象
    this.ctx = ctx;
    //缩放系数
    this.scaleNum = scaleNum;
  }
  _initCanvas = options => {
    const { canvasW, canvasH, scale = 1 } = options;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const scaleNum = getPixelRatio(ctx) * scale;
    canvas.width = canvasW * scaleNum;
    canvas.height = canvasH * scaleNum;
    return { ctx, scaleNum, canvas };
  };
  _drawRoundRectPath = (cxt, width, height, radius) => {
    cxt.beginPath(0);
    //从右下角顺时针绘制，弧度从0到1/2PI
    cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2);
    //矩形下边线
    cxt.lineTo(radius, height);
    //左下角圆弧，弧度从1/2PI到PI
    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI);
    //矩形左边线
    cxt.lineTo(0, radius);
    //左上角圆弧，弧度从PI到3/2PI
    cxt.arc(radius, radius, radius, Math.PI, (Math.PI * 3) / 2);
    //上边线
    cxt.lineTo(width - radius, 0);
    //右上角圆弧
    cxt.arc(width - radius, radius, radius, (Math.PI * 3) / 2, Math.PI * 2);
    //右边线
    cxt.lineTo(width, height - radius);
    cxt.closePath();
  };
  _drawText = (ctx, content, config) => {
    const scale = this.scaleNum;
    const {
      color = "black",
      fontStyle = "normal",
      fontVariant = "normal",
      fontWeight = "normal",
      fontSize = 14,
      fontFamily = "微软雅黑"
    } = config;
    ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize *
      scale}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.fillText(content || "", 0, 0); //超过MaxWidth，文字就会被压缩
  };
  _drawCanvas = imageEles => {
    const canvas = this.canvas;
    const ctx = this.ctx;
    const scale = this.scaleNum;
    imageEles.forEach(element => {
      const { type, payload, x, y, width, height, config = {} } = element;
      ctx.save();
      ctx.translate(x * scale, y * scale);
      switch (type) {
        case CanvasPoster.Text:
          this._drawText(ctx, payload, config);
          break;
        case CanvasPoster.Image:
          const { radius = 0 } = config;
          this._drawRoundRectPath(
            ctx,
            width * scale,
            height * scale,
            radius * scale
          );
          ctx.clip();
          ctx.drawImage(payload, 0, 0, width * scale, height * scale);
          break;
        default:
          break;
      }
      ctx.restore();
    });

    const imgSrc = canvas.toDataURL("image/jpg");
    return imgSrc;
  };

  _createImg = imgobj =>
    new Promise((resolve, reject) => {
      const { content } = imgobj;
      if (!content) {
        reject(new Error("img content 为空"));
        return;
      }
      const image = new Image();
      if (content.indexOf("data:image/") === -1) {
        image.crossOrigin = "anonymous";
      }
      image.src = imgobj.content;
      image.onerror = reject;
      image.onload = () => {
        resolve({ ...imgobj, payload: image });
      };
    });

  _createText = textobj =>
    Promise.resolve().then(() => {
      return { ...textobj, payload: textobj.content };
    });

  render = elements =>
    new Promise((resolve, reject) => {
      if (!elements || !Array.isArray(elements)) {
        reject(new Error("参数错误"));
        return;
      }

      const imgEle = elements.filter(o => o.type === CanvasPoster.Image);
      const textEle = elements.filter(o => o.type === CanvasPoster.Text);

      const imgPromise = imgEle.map(el => this._createImg(el));
      const textPromise = textEle.map(el => this._createText(el));

      const promiseArray = [].concat(imgPromise).concat(textPromise);

      Promise.all(promiseArray)
        .then(ele => {
          return this._drawCanvas(ele);
        })
        .then(res => {
          resolve(res, this.ctx, this.canvas);
        })
        .catch(reject);
    });
}
CanvasPoster.Image = "IMAGE";
CanvasPoster.Text = "TEXT";
export default CanvasPoster;
