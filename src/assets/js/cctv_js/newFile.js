const { AsyncPipe } = require("@angular/common");

/**
 * 连接设备
 * @method ConnectDevice
 * @param {string} devid 设备ID
 * @param {string} ip 设备ip
 * @param {string} user 设备用户名
 * @param {string} pwd 设备密码
 * @param {number} winindex 窗体索引
 * @param {number} port ip端口
 * @param {number} connectType 连接方式 0：预连接 1：连接并打开码流
 * @param {number} channel 通道
 * @param {number} streamid 码流类型，连接方式为1时有效
 *
 * 注:ID和IP至少要有一个，优先使用ID连接，有IP则port必传
 */
AsyncPipe;
