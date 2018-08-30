$(function () {
  var width = $('.article-body').width();
  var myTable = $('#list').table({
    cols: [{
      title: '片区',
      name: 'name',
      align: 'center',
      width: ((width - 20) / 2 - 2) / 4,
    }, {
      title: '楼盘量',
      name: 'gardenCount',
      align: 'center',
      width: ((width - 20) / 2 - 2) / 4,
    }, {
      title: '完备量',
      name: 'completedGardenCount',
      align: 'center',
      width: ((width - 20) / 2 - 2) / 4 - 1,
    }, {
      title: '有效盘源数',
      name: 'houseCount',
      align: 'center',
      width: ((width - 20) / 2 - 2) / 4 - 1,
    }],
    items: [],
    height: 'auto',
    width: (width - 20) / 2 - 2 + 'px',
    // fullWidthRows: true,
    showBackboard: false,
    nowrap: true
  });

  function queryData() {
    var para = {};
    //物业类型
    para['type'] = 3;
    para['parentId'] = $('#parentArea').val();
    para['propertyType'] = $('#propertyType').val();
    para = JSON.stringify(para);
    return para;
  }

  function show(content, duration, isCenter, animateIn, animateOut) {
    var animateIn = animateIn || 'fadeIn';
    var animateOut = animateOut || 'fadeOut';
    if (!content || !content.length) {
      return;
    }
    var duration = duration || 1000;
    var isCenter = isCenter || false;
    $('body').toast({
      position: 'absolute',
      animateIn: animateIn,
      animateOut: animateOut,
      content: content,
      duration: duration,
      isCenter: isCenter,
      padding: '0.2em 0.5em',
      background: 'rgba(181, 185, 190, 0.8)',
      borderRadius: '.31em',
      fontSize: '.24em',
      top: '0',
    });
  }

  // type = 1 城市请求
  $.ajax({
    url: '/json/areaList.json',
    type: 'GET',
    data: {
      type: 1,
      isO2OCity: 1
    },
    success: function (res) {
      // console.log(res);
      if (res.status) {
        return
      }
      var html = '<option value="" selected="selected">选择城市</option>';
      if (res && res.data && res.data.length) {
        var list = res.data;
        for (var i = 0; i < list.length; i++) {
          html += '<option value="' + list[i].id + '">' + list[i].name + '</option>';
        }
      }
      $('#citySelect').html(html);
    }
  });

  $('#citySelect').on('change', function (e) {
    var val = $(this).val();
    if (val) {
      $.ajax({
        url: '/json/areaList.1.json',
        type: 'GET',
        dataType: "json",
        data: {
          type: 2,
          parentId: $(this).val()
        },
        success: function (res) {
          // console.log(res);
          var html = '<option value="" selected="selected">选择区域</option>';
          if (res && res.data && res.data.length) {
            var list = res.data;
            for (var i = 0; i < list.length; i++) {
              html += '<option value="' + list[i].id + '">' + list[i].name + '</option>';
            }
          }
          $('#parentArea').html(html);
        }
      });

    }
  });



  $('#searchBtn').click(function () {
    var data = queryData();
    var params = JSON.parse(data);
    if ($('#citySelect').val() == '') {
      show('请选择城市');
      return;
    }
    if (params.parentId == '') {
      show('请选择区域');
      return;
    }
    if (params.propertyType == '') {
      show('请选择物业类型');
      return;
    }
    $.ajax({
      url: '/json/areaCompleteStat.json',
      type: 'GET',
      dataType: "json",
      data: data,
      success: function (res) {
        // console.log(res);
        var html = '';
        if (res && res.data) {
          var item = res.data;
          $('#statDate').text(item.statDate);
          $('#gardenCount').text(item.parentCompleteStat.gardenCount);
          $('#completedGardenCount').text(item.parentCompleteStat.completedGardenCount);
          $('#completeRatio').text(item.parentCompleteStat.completeRatio + '%');
          if (item.completeStatList.length) {
            var list = item.completeStatList;
            for (var i = 0; i < list.length; i++) {
              if (i >= 3) {
                html +=
                  '<div class="item">' +
                  '  <div class="item-one">' +
                  '    <div class="index-mark mr-10">' + (i + 1) + '</div>' +
                  '    <p>' + list[i].name + '</p>' +
                  '  </div>' +
                  '  <div class="item-two">' +
                  '    <div class="bar" style="width: ' + list[i].completeRatio + '%"></div>' +
                  '  </div>' +
                  '  <div class="item-three"><strong>' + list[i].completeRatio + '</strong>%</div>' +
                  '</div>';

              } else {
                html +=
                  '<div class="item">' +
                  '  <div class="item-one">' +
                  '    <div class="index-mark mr-10 current">' + (i + 1) + '</div>' +
                  '    <p>' + list[i].name + '</p>' +
                  '  </div>' +
                  '  <div class="item-two">' +
                  '    <div class="bar current" style="width: ' + list[i].completeRatio + '%"></div>' +
                  '  </div>' +
                  '  <div class="item-three"><strong>' + list[i].completeRatio + '</strong>%</div>' +
                  '</div>';
              }

            }


            var temp = {};
            for (var i = list.length; i > 0; i--) {
              for (var j = 0; j < i - 1; j++) {
                if (Number(list[j].completedGardenCount) > Number(list[j + 1].completedGardenCount)) {
                  temp = list[j];
                  list[j] = list[j + 1];
                  list[j + 1] = temp;
                }
              }
            }
            console.log(list)
            myTable.load(list.reverse());

          }

        }
        $('#tableList').html(html);
      }
    });
  });



});
