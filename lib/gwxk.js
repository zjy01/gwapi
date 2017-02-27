/**
 * Created by zjy on 16-6-24.
 */
var querystring = require('querystring');
var urls = require('url');
var cheerio = require("cheerio-without-node-native");
const gwxk = {
  /**
   * 登录
   * @param   {Object}  账号密码
   * @return  {Object}  promise
   */
  agent: null,
  setAgent ($agent) {
    this.agent = $agent;
  },
  login ($data) {
    var $files = {
      "USERNAME":$data.username,
      "PASSWORD":$data.password,
      "RANDOMCODE": $data.randomCode,
    };

    let $url = this.getUrl('login');

    return this.fetchPost($url, $files)
        .then($ => {
          return $("#Top1_divLoginName").text();
        })
        .then(text => {
          if(text) {
            var pattern = /(.+?)\([0-9]+?\)/;
            var match = pattern.exec(text);
            if(match) {
              return{ username:$data.username, name:match[1] };
            }
            else{
              throw  "帐号或密码不正确";
            }
          }
          else{
            throw  "帐号或密码不正确";
          }
        });
  },
    //获取成绩选项
  getScoreOption () {
    var $url = this.getUrl('scoreOption');
    return this.fetchGet($url)
        .then($ => {
          var optionArr = [];
          $("#kksj option").each(function (i, v) {
            optionArr.push({ text:$(v).text(), value:$(v).val() });
          });

          return optionArr;
        });
  },
    //获取课程信息
  getCourse ($data) {
    let $url = this.getUrl('course');
    if($data) {
      var $files = {
        "xnxq01id":$data.xq,
        "sfFD":1
      };
      return this.fetchPost($url, $files)
                .then($ => this.dealCourse($));
    }
    else{
      return this.fetchGet($url)
                .then($ => this.dealCourse($));
    }
  },
  dealCourse ($) {
    var dataArr = [];
    $("#kbtable tr").each(function (i, v) {
      var courseArr = [];
      $(v).find('.kbcontent').each(function (j, d) {
        courseArr.push($(d).text());
      });
      if(courseArr.length > 0) {
        dataArr.push(courseArr);
      }
    });
    var optionData = {};
    var optionArr = [];
    $("#xnxq01id option").each(function (i, v) {
      optionArr.push({ text:$(v).text(), value:$(v).val() });
    });
    optionData['selected'] = $("#xnxq01id option[selected]").val();
    optionData['options'] = optionArr;

    return { option:optionData, data:dataArr };
  },
    //等级考试
  getCet () {
    var $url = this.getUrl('cet');
    return this.fetchGet($url)
        .then($ => {
          var dataArr = [];
          $("#dataList tr").each(function (i, v) {
            if(i == 0 || i == 1 ) return true;
            var cet = {};
            $(v).find('td').each(function (j, d) {
              switch (j) {
                case 0:
                  cet['order'] = $(d).text();
                  break;
                case 1:
                  cet['name'] = $(d).text();
                  break;
                case 4:
                  cet['score'] = $(d).text();
                  break;
                case 8:
                  cet['time'] = $(d).text();
                  break;
              }
            });
            dataArr.push(cet);
          });
          return dataArr;
        });
  },
    //获取成绩信息
  getScore ($filed) {
    var $url = this.getUrl('score');
    var field = {
      "kksj":$filed.xq,
      "kcxz":$filed.kcxz || '',
      "kcmc":$filed.kcmc || '',
      "fxkc":$filed.fxkc || 0,
      "xsfs":$filed.xsfs || 'all'
    };

    return this.fetchPost($url, field)
        .then($ => {
          var dataArr = [];
          $("#dataList tr").each(function (i, v) {
            if(i == 0) return true;
            var score = {};
            $(v).find('td').each(function (j, d) {
              switch (j) {
                case 0:
                  score['order'] = $(d).text();
                  break;
                case 1:
                  score['xq'] = $(d).text();
                  break;
                case 2:
                  score['coder'] = $(d).text();
                  break;
                case 3:
                  score['name'] = $(d).text();
                  break;
                case 4:
                  score['score'] = $(d).text();
                  break;
                case 5:
                  score['credit'] = $(d).text();
                  break;
                case 6:
                  score['period'] = $(d).text();
                  break;
                case 7:
                  score['way'] = $(d).text();
                  break;
                case 8:
                  score['prop'] = $(d).text();
                  break;
                case 9:
                  score['nature'] = $(d).text();
                  break;
                case 10:
                  score['type'] = $(d).text();
                  break;
              }
            });
            dataArr.push(score);
          });

          return dataArr;
        });
  },
  /**
   * 获取个人信息
   */
  getInfo () {
    var $url = this.getUrl('info');
    return this.fetchGet($url)
        .then($ => {
          let info = {};
          const trs = $("#xjkpTable tr");
          const labelReg = new RegExp('^.+：');
          trs.eq(2).children('td').each( (i, v) => {
            const value = $(v).text().replace(labelReg, '');
            switch(i) {
              case 0:
                info['academy'] = value;
                break;
              case 1:
                info['major'] = value;
                break;
              case 3:
                info['class'] = value;
                break;
              case 4:
                info['student_id'] = value;
                break;
              default:
                break;
            }
          });
          const tr4s = trs.eq(3).children('td');
          info['name'] = tr4s.eq(1).text().trim();
          info['sex'] = tr4s.eq(3).text().trim();

          return info;
        });

  },
    //退出
  logout () {
    var $url = this.getUrl('logout');
    return this.fetchGet($url);
  },
  fetchPost: function ($url, $filed) {
    var params = querystring.stringify($filed),
      url = urls.parse($url),
      origin = 'http://' + url.host,
      headers = {
        'Proxy-Connection': 'keep-alive',
        'Content-Length':params.length,
        'Cache-Control': 'max-age=0',
        'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Origin': origin,
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.12 Safari/537.31',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept-Encoding': 'gzip,deflate,sdch',
        'Accept-Language': 'zh-CN,zh;q=0.8',
        'Accept-Charset': 'GBK,utf-8;q=0.7,*;q=0.3'
      };
    const agent = this.agent;
    const option = {
      method:'POST',
      headers,
      body:params,
      agent
    };

    return fetch($url, option)
            .then(res => {
              if(res.ok) {
                return res.text();
              }
              else{
                throw res.status + ": 访问目标网络发生错误";
              }
            })
            .then(text => {
              return cheerio.load(text);
            });
  },
  fetchGet ($url, $filed) {
    if ($filed) {
      $url += "?" + querystring.stringify($filed);
    }
    const agent = this.agent;
    const option = {
      method:'GET',
      agent
    };
    return fetch($url, option)
            .then(res => {
              if (res.ok) {
                return res.text();
              }
              else {
                throw res.status + ": 访问目标网络发生错误";
              }
            })
            .then(text => {
              return cheerio.load(text);
            });
  },
    //获取url
  getUrl:function (type) {
    var url = null;
    switch (type) {
      case 'login'://登陆的url
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/xk/LoginToXkLdap';
        break;
      case 'score'://成绩的列表
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/kscj/cjcx_list';
        break;
      case 'scoreOption':
        url = "http://jxgl.gdufs.edu.cn/jsxsd/kscj/cjcx_query";
        break;
      case 'cet'://等级考试
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/kscj/djkscj_list';
        break;
      case 'course': //课程
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/xskb/xskb_list.do';
        break;
      case 'index'://首页
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/framework/main.jsp';
        break;
      case 'info':
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/grxx/xsxx';
        break;
      case 'logout': //退出
        url = 'http://jxgl.gdufs.edu.cn/jsxsd/xk/LoginToXk?method=exit';
        break;
    }
    return url;
  }
};

module.exports = gwxk;
