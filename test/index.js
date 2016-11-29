const gwapi = require('../index.js');
const expect = require('chai').expect;
const fetch = require('node-fetch');
global.fetch = fetch;
const username = '20131003637';
const password = '941011';
/**
 * react native专用，其他环境下无法测试
 * @type {[type]}
 */
describe('gwapi脚本测试', function () {
  it('教务系统登录测试', function () {
    return gwapi.getInfo({
      username,
      password
    })
  .then( json => {
    expect(json).to.be.an('object');
    console.log(json);
  })
  .catch( err => {
    console.log(err);
    expect(err).to.be.an('object');
  });
  });
});
