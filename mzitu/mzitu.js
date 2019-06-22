
const version = "0.1.2";
// $addin.current.version=version;

//检测扩展更新
function scriptVersionUpdate() {
  $http.get({
    url:
      "https://raw.githubusercontent.com/jmluang/xteko/master/mzitu/updateInfo",
    handler: function(resp) {
      var afterVersion = resp.data.version;
      var msg = resp.data.msg;
      if (afterVersion > version) {
        $ui.toast("检测到脚本更新,下载中...");
        $http.download({
          url:
            "https://raw.githubusercontent.com/jmluang/xteko/master/mzitu/mzitu.js",
          handler: resp => {
            let box = resp.data;
            $addin.save({
              name: $addin.current.name,
              data: box,
              version: afterVersion,
              author: "orqzsf1",
              icon: "icon_014",
              handler: success => {
                if (success) {
                  $device.taptic(2);
                  $delay(0.2, function() {
                    $device.taptic(2);
                  });

                  $ui.alert({
                    title: "更新已完成",
                    message:"本次更新内容:\n"+msg,
                    actions: [
                      {
                        title: "OK",
                        handler: function() {
                          $addin.restart();
                        }
                      }
                    ]
                  });
                }
              }
            });
          }
        });
      }
    }
  });
}

// const hot_url = "http://adr.meizitu.net/wp-json/wp/v2/hot";
const host = "https://www.mzitu.com";
const hot_url = host + "/hot";
const post_url = "http://adr.meizitu.net/wp-json/wp/v2/posts?per_page=40";

function fetch(url) {
  $ui.loading("图片下载中");
  timeout = 5
  $http.request({
    timeout: timeout,
    url: url,
    handler: function(resp) {
      if (resp.data.length > 0) {
        const reg = new RegExp(/<a href="(.*?)" .*?><img class='lazy'.*?data-original='(.*?)' alt='(.*?)' .*\/><\/a>/, "g");
        var array = [];
        while (temp = reg.exec(resp.data)) {
          obj = {
            id: temp[1].split('/').pop(),
            image: {
              src: temp[2]
            },
            title: {
              text: temp[3]
            },
          }
          array.push(obj)
        }

        render(array).then(() => {
          $ui.loading(false);
        });
      } else {
        $ui.alert({
          title: "无法找到主页",
          message: "请联系脚本作者或稍后再试"
        })
      }
    }
  })
}

async function render(dataList) {
  let reqs = dataList.map(arr => $http.download({
    url: arr.image.src,
    header: {
      "Referer": host
    }
  }))
  let resps = await Promise.all(reqs)
  let newArray = dataList.map((arr, idx) => {
    return {...arr, image: resps[idx]}
  })
  $("mainData").data = newArray;
  $("mainData").endRefreshing();
}

function viewHotDetail(id, title) {
  $http.get({
    url: "http://adr.meizitu.net/wp-json/wp/v2/i?id=" + id,
    handler: function(resp) {
      $ui.push({
        props: {
          title: title.text
        },
        views: [{
          type: "matrix",
          props: {
            id: "detailView",
            columns: 2,
            spacing: 10,
            selectable: true,
            waterfall: true,
            square: false,
            alpha: 0,
            template: [
              { 
                type: "image", 
                props: { 
                  id: "image", 
                  smoothRadius:10,
                }, 
                layout: $layout.fill
              }, 
            ]
          },
          layout: function(make) { 
            make.left.bottom.right.equalTo(0) 
            make.top.equalTo(0) 
          },
          events: {
            itemSize: (sender, indexPath) => {
              const sizes = [$size(550, 850),$size(1000, 665), $size(1024, 689),$size(640, 427),]
              return sizes[indexPath.item % 4]
            },
            didSelect: function(sender, indexPath, object) {
              $ui.push({
                props: { 
                  title: "第" + (indexPath.item + 1) + "张"
                }, 
                views: [{ 
                  type: "image", 
                  props: {
                    src: object.image.src,
                    scale:0.8
                  }, 
                  layout: function(make, view) {
                    make.left.right.inset(0)
                    make.bottom.inset(0);
                    make.height.equalTo(view.super)
                    make.width.equalTo(view.super)
                  },
                  events: {
                    tapped: function(sender) { 
                      $http.download({ 
                        url: object.image.src, 
                        handler: function(resp) { 
                          $share.universal(resp.data) 
                          $ui.toast("下载成功！", 1)
                        } 
                      }) 
                    } 
                  } 
                }] 
              }) 
             }, 
          }
        }]
      })

      var urls = resp.data.content.split(',');
      $("detailView").data = urls.map(url => { 
        $ui.animate({
            duration: .4,
            animation: ()=> {
                $("detailView").alpha = 1
            }
        });
        return { image: { src: url } }
      })
    }
  })
}

const template = {
  type: "view",
  props: {
    id: "contentView",
    bgcolor: $color("white"),
    radius: 7,
  },
  views: [{
      type: "image",
      props: {
        id: 'image',
        align: $align.center,
      },
      layout: function(make, view) {
        make.top.inset(30)
        make.left.right.inset(10)
        make.height.equalTo(view.super)
      }
    }, {
      type: "label",
      props: {
        id: "title",
        bgcolor: $color("white"),
        font: $font(24),
        lines: 3,
        alpha: 0.7,
      },
      layout: function(make, view) {
        make.top.inset(30)
        make.left.right.inset(10)
      }
    }
  ]
}

$ui.render({
  props: {
    title: "妹子图",
    list: [],
    navButtons: [
      {
        title: "帮助",
        // image: image, // Optional
        icon: "008", // Or you can use icon name
        handler: function() {
          $ui.menu({
            items: [
              "领门店红包",
              "微信赞赏",
              "联系作者",
              "作者声明"
            ],
            handler: function(title, idx) {
              switch (idx) {
                case 0:
                  var text = "打开支付宝首页搜“595630587”领红包，领刀大红包的小伙伴赶紧使用哦！"
                  $clipboard.text = text;
                  $ui.alert(text);
                  break;
                case 1:
                  wechatPay()
                  break;
                case 2:
                  $app.openURL("https://t.me/wlpwwwww")
                  break;
                case 3:
                  notify();
              }
            }
          })
        }
      }
    ],
  },
  views: [
    {
      type: "tab",
      props: {
        id: 'menu',
        items: ["最热", "最新"],
        index: 0,
      },
      layout: function(make) {
        make.left.top.right.equalTo(0)
        make.height.equalTo(30)
      },
      events: {
        changed: function(sender) {
          if (sender.index === 0) {
            fetch(hot_url);
          } else {
            fetch(post_url);
          }
        }
      }
    },
    {
      type: 'list',
      props: {
        id: 'mainData',
        template: template,
        rowHeight: 500,
      },
      events: {
        didSelect: function(tableView, indexPath) {
          viewHotDetail(tableView.object(indexPath).id, tableView.object(indexPath).title)
        },
        pulled: function(sender) {
          // console.log(sender)
          var index = $('menu').index;
          if (index === 0) {
            fetch(hot_url);
          } else {
            fetch(post_url);
          }
        }
      },
      layout: function(make, view) {
        make.left.bottom.right.equalTo(0)
        make.top.equalTo($("menu").bottom).offset(0)
      }
    }
  ]
});

function wechatPay() {
  $ui.alert({
    title: "确定赞赏？",
    message:
      "点击确定二维码图片会自动存入相册同时会跳转至微信扫码,请选择相册中的二维码图片进行赞赏。",
    actions: [
      {
        title: "确定",
        handler: function() {
          $push.schedule({
            title: "即将下载二维码到相册",
            body: "转跳到微信后，点击右侧「相册」选取二维码即可, 谢谢您的支持！",
            delay: 0.8
          });

          let payUrl = "weixin://scanqrcode";
          $ui.toast("下载中...")
          $http.download({
            url: "https://raw.githubusercontent.com/jmluang/xteko/master/images/wechat.jpg",
            showsProgress: true,
            progress: function(bytesWritten, totalBytes) {
              var percentage = (bytesWritten * 1.0) / totalBytes;
            },
            handler: function(resp) {
              $photo.save({
                data: resp.data,
                handler: function(success) {
                  if (success) {
                    $app.openURL(payUrl);
                  } else {
                    $ui.toast("下载失败，请重试或选中其他方式");
                  }
                }
              });
            }
          });
        }
      },
      {
        title: "取消",
        handler: function() {}
      }
    ]
  });
 }
 
function notify() {
  var text = "声明\n\n1. 脚本含成人内容，未满十八岁禁止运行；\n2. 脚本所有内容来自 https://www.mzitu.com 与脚本作者无任何关系；\n3. 脚本制作纯属技术交流，无任何商业利益或传播淫秽目的。"
 
  // Views
  var hintView = $objc("BaseHintView").invoke("alloc").invoke("initWithText", text)
  var textView = hintView.invoke("subviews").invoke("objectAtIndex", 1).invoke("subviews").invoke("objectAtIndex", 1)
 
  // Attribute for text
  var string = $objc("NSMutableAttributedString").invoke("alloc").invoke("initWithString", text)
  string.invoke("addAttribute:value:range:", "NSFont", $font("bold", 26), $range(0, 2))
  string.invoke("setAlignment:range:", $align.center, $range(0, 2))
 
  string.invoke("addAttribute:value:range:", "NSFont", textView.invoke("font"), $range(2, string.invoke("length") - 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("任何关系"), 2))
  string.invoke("addAttribute:value:range:", "NSColor", $color("red"), $range(text.indexOf("禁止运行"), 2))
  //string.invoke("addAttribute:value:range:", "NSColor", $color("tint"), $range(text.indexOf("无任何"), 2))
 
  // Paragraph Style
  var para = $objc("NSMutableParagraphStyle").invoke("alloc.init")
  para.invoke("setParagraphSpacing", 10)
  para.invoke("setAlignment", $align.left)
 
  string.invoke("addAttribute:value:range:", "NSParagraphStyle", para, $range(2, string.invoke("length") - 2))
 
  // Setup
  textView.invoke("setAttributedText", string)
 
  // Show View
  hintView.invoke("show")
 }

fetch(hot_url);