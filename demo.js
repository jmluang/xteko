// image with header denmo
function fetch() {
  let array = [
    {
      image: {
        src: "http://wx3.sinaimg.cn/mw600/00745YaMgy1g90aguwexyj30kg0aqjso.jpg"
      },
    },{
      image: {
        src: "http://pic18.nipic.com/20120103/8993051_170340691334_2.jpg"
      }
    },
    {
      image: {
        source: {
          url: "https://i5.meizitu.net/thumbs/2019/10/195368_15d56_236.jpg",
          header: {
            "referer": host
          }
        }
      }
    }
  ];
  $("mainData").data = array;
  console.log($("mainData").data)
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
      },
      layout: function(make, view) {
        make.center.equalTo(view.super)
        make.size.equalTo($size(300, 300))
      }
    }]
}

$ui.render({
  props: {
    title: "demo",
    list: [],
  },
  views: [
    {
      type: 'list',
      props: {
        id: 'mainData',
        template: template,
        rowHeight: 500,
      },
      layout: $layout.fill,
    }
  ]
});


fetch();
