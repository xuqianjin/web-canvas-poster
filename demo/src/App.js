import React from "react";
import "./App.css";
import QRCode from "qrcode";

import CanvasPoster from "web-canvas-poster";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      src: ""
    };
  }
  handleClick = async () => {
    const element = [];
    const base64 = await QRCode.toDataURL("http://www.baidu.com", {
      margin: 0
    });
    element.push({
      type: CanvasPoster.Image,
      x: 0,
      y: 0,
      content: "./bg.png",
      width: 375,
      height: 667
    });
    element.push({
      type: CanvasPoster.Image,
      x: 255,
      y: 518,
      content: base64,
      width: 82,
      height: 82
    });
    element.push({
      type: CanvasPoster.Image,
      x: 41,
      y: 313,
      content: "./avatar.jpg",
      width: 50,
      height: 50,
      config: {
        radius: 25
      }
    });
    element.push({
      type: CanvasPoster.Text,
      x: 106,
      y: 316,
      content: "这是测试文案",
      config: {
        color: "red",
        fontFamily: "PingFangSC-Medium",
        fontSize: 16,
      }
    });
    new CanvasPoster({ canvasW: 375, canvasH: 667 })
      .render(element)
      .then(res => {
        this.setState({ src: res });
      })
      .catch(err => {
        console.log(err);
      });
  };
  render() {
    const { src } = this.state;
    return (
      <div className="app">
        <button onClick={this.handleClick}>点击生成</button>
        <img src={src} alt="" className="image" />
      </div>
    );
  }
}
