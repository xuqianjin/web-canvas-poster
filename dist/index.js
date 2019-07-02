"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var getPixelRatio = function getPixelRatio(context) {
  var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
  return (window.devicePixelRatio || 1) / backingStore;
};

var CanvasPoster = function CanvasPoster(_options) {
  var _this = this;

  _classCallCheck(this, CanvasPoster);

  this._initCanvas = function (options) {
    var canvasW = options.canvasW,
        canvasH = options.canvasH,
        _options$scale = options.scale,
        scale = _options$scale === void 0 ? 1 : _options$scale;
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var scaleNum = getPixelRatio(ctx) * scale;
    canvas.width = canvasW * scaleNum;
    canvas.height = canvasH * scaleNum;
    return {
      ctx: ctx,
      scaleNum: scaleNum,
      canvas: canvas
    };
  };

  this._drawRoundRectPath = function (cxt, width, height, radius) {
    cxt.beginPath(0); //从右下角顺时针绘制，弧度从0到1/2PI

    cxt.arc(width - radius, height - radius, radius, 0, Math.PI / 2); //矩形下边线

    cxt.lineTo(radius, height); //左下角圆弧，弧度从1/2PI到PI

    cxt.arc(radius, height - radius, radius, Math.PI / 2, Math.PI); //矩形左边线

    cxt.lineTo(0, radius); //左上角圆弧，弧度从PI到3/2PI

    cxt.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2); //上边线

    cxt.lineTo(width - radius, 0); //右上角圆弧

    cxt.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2); //右边线

    cxt.lineTo(width, height - radius);
    cxt.closePath();
  };

  this._drawText = function (ctx, content, config) {
    var scale = _this.scaleNum;
    var _config$color = config.color,
        color = _config$color === void 0 ? "black" : _config$color,
        _config$fontStyle = config.fontStyle,
        fontStyle = _config$fontStyle === void 0 ? "normal" : _config$fontStyle,
        _config$fontVariant = config.fontVariant,
        fontVariant = _config$fontVariant === void 0 ? "normal" : _config$fontVariant,
        _config$fontWeight = config.fontWeight,
        fontWeight = _config$fontWeight === void 0 ? "normal" : _config$fontWeight,
        _config$fontSize = config.fontSize,
        fontSize = _config$fontSize === void 0 ? 14 : _config$fontSize,
        _config$fontFamily = config.fontFamily,
        fontFamily = _config$fontFamily === void 0 ? "微软雅黑" : _config$fontFamily;
    ctx.font = "".concat(fontStyle, " ").concat(fontVariant, " ").concat(fontWeight, " ").concat(fontSize * scale, "px ").concat(fontFamily);
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.fillText(content || "", 0, 0); //超过MaxWidth，文字就会被压缩
  };

  this._drawCanvas = function (imageEles) {
    var canvas = _this.canvas;
    var ctx = _this.ctx;
    var scale = _this.scaleNum;
    imageEles.forEach(function (element) {
      var type = element.type,
          payload = element.payload,
          x = element.x,
          y = element.y,
          width = element.width,
          height = element.height,
          _element$config = element.config,
          config = _element$config === void 0 ? {} : _element$config;
      ctx.save();
      ctx.translate(x * scale, y * scale);

      switch (type) {
        case CanvasPoster.Text:
          _this._drawText(ctx, payload, config);

          break;

        case CanvasPoster.Image:
          var _config$radius = config.radius,
              radius = _config$radius === void 0 ? 0 : _config$radius;

          _this._drawRoundRectPath(ctx, width * scale, height * scale, radius * scale);

          ctx.clip();
          ctx.drawImage(payload, 0, 0, width * scale, height * scale);
          break;

        default:
          break;
      }

      ctx.restore();
    });
    var imgSrc = canvas.toDataURL("image/jpg");
    return imgSrc;
  };

  this._createImg = function (imgobj) {
    return new Promise(function (resolve, reject) {
      var content = imgobj.content;

      if (!content) {
        reject(new Error("img content 为空"));
        return;
      }

      var image = new Image();

      if (content.indexOf("data:image/") === -1) {
        image.crossOrigin = "anonymous";
      }

      image.src = imgobj.content;
      image.onerror = reject;

      image.onload = function () {
        resolve(_objectSpread({}, imgobj, {
          payload: image
        }));
      };
    });
  };

  this._createText = function (textobj) {
    return Promise.resolve().then(function () {
      return _objectSpread({}, textobj, {
        payload: textobj.content
      });
    });
  };

  this.render = function (elements) {
    return new Promise(function (resolve, reject) {
      if (!elements || !Array.isArray(elements)) {
        reject(new Error("参数错误"));
        return;
      }

      var imgEle = elements.filter(function (o) {
        return o.type === CanvasPoster.Image;
      });
      var textEle = elements.filter(function (o) {
        return o.type === CanvasPoster.Text;
      });
      var imgPromise = imgEle.map(function (el) {
        return _this._createImg(el);
      });
      var textPromise = textEle.map(function (el) {
        return _this._createText(el);
      });
      var promiseArray = [].concat(imgPromise).concat(textPromise);
      Promise.all(promiseArray).then(function (ele) {
        return _this._drawCanvas(ele);
      }).then(function (res) {
        resolve(res, _this.ctx, _this.canvas);
      }).catch(reject);
    });
  };

  var _this$_initCanvas = this._initCanvas(_options),
      _ctx = _this$_initCanvas.ctx,
      _scaleNum = _this$_initCanvas.scaleNum,
      _canvas = _this$_initCanvas.canvas; //canvas对象


  this.canvas = _canvas; //context对象

  this.ctx = _ctx; //缩放系数

  this.scaleNum = _scaleNum;
};

CanvasPoster.Image = "IMAGE";
CanvasPoster.Text = "TEXT";
var _default = CanvasPoster;
exports.default = _default;