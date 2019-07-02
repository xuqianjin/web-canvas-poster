class CanvasPoster {
  constructor(option) {
    this.option = option;
  }
  downloadImg(element) {
    return new Promise((resolve, reject) => {
      const { type, config } = element;
      if (!type || !config) {
        reject(new Error("参数错误"));
        return;
      }
      if (type !== CanvasPoster.Image) {
        resolve({ ...element });
        return;
      }
      if (!config.src) {
        reject(new Error("el src 为空"));
        return;
      }
      const image = new Image();
      if (config.src.indexOf("data:image/") == -1) {
        image.crossOrigin = "anonymous";
      }
      image.src = config.src;
      image.onerror = reject;
      image.onload = () => {
        config.image = image;
        resolve(element);
      };
    });
  }
  render() {}
}
CanvasPoster.Image = "IMAGE";
CanvasPoster.Text = "TEXT";
CanvasPoster.Qrcode = "QRCODE";
export default CanvasPoster;
