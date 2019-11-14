var dataSource = [
  {
    id: 14,
    rate: 8.5,
    recommend: '0',
    deadline: 30
  },
  {
    id: 10,
    rate: 8.5,
    recommend: '0',
    deadline: 60
  },
  {
    id: 9,
    rate: 8.5,
    recommend: '1',
    deadline: 180
  },
  {
    id: 12,
    rate: 8.5,
    recommend: '0',
    deadline: 360
  }
]

function formatFloat(f, digit) {
  var m = Math.pow(10, digit)
  return Math.round(f * m, 10) / m
}
function toFixed2(n) {
  if (typeof n === 'number' || typeof n === 'string') {
    var nTostr = n.toString()
    var index = nTostr.indexOf('.')
    if (index === -1) {
      return nTostr + '.00'
    }
    var result = nTostr.substr(0, index + 1)
    return nTostr.length - (index + 1) >= 2 ? result + nTostr.substr(index + 1, 2) : result + nTostr.substr(index + 1) + '0'
  }
  console.error('参数n的类型 只能是number或string')
  return -1
}
function computedBalance() {
  // 存储收益
  // 计算公式：商品原价(平台金价)*黄金克数*数量*对应存储期限基础年回报率*存储期限/360；其中的黄金克数指的是商品克数
  var gram = +$('#gram').val()
  var rate = +$('.date').data('rate')
  var origin = 240
  var date = +$('.date').text()
  var balance = (((origin * gram * rate) / 100) * date) / 360
  $('.profits').text(toFixed2(balance))
}

var node = $('.drag-inner')
var dragInnerWidth = node.width()

var startX = 0
var currentIndex = 0
var half = ($('.cursor').width() / 2 / dragInnerWidth) * 100
var dragDeadLine = {
  init() {
    $('.gold-computed-date .lines').html(this.renderGoldSplitLines(dataSource))
    $('.gold-computed-date .drag-bg').html(this.renderPrimeTime(dataSource))
    this.setInitDate(dataSource)
    this.bindEvents()
  },
  bindEvents() {
    $('.gold-computed-date .cursor').on('touchstart', e => {
      if (e.originalEvent.targetTouches.length > 1) {
        return
      }
      startX = e.originalEvent.targetTouches[0].clientX
    })
    $('.gold-computed-date .cursor').on('touchend', e => {
      var endX = e.originalEvent.changedTouches[0].clientX
      this.setDeadline(endX - startX > 0 ? currentIndex + 1 : currentIndex - 1)
      startX = endX
    })
  },
  setInitDate(data) {
    var recommend = data.filter(item => {
      return item.recommend == 1
    })
    recommend = recommend.length > 0 ? recommend : [data[0]]
    $('.date').data('limit', recommend[0]['id'])
    limitRateId = recommend[0]['id']
    $('.date')
      .text(recommend[0]['timeLimitDays'])
      .data('limit', recommend[0]['id'])
      .data('rate', recommend[0]['interestRate'])
    var index = 0
    data.forEach((item, i) => {
      if (item.id === recommend[0].id) {
        index = i
      }
    })
    this.setDeadline(index || 0)
  },
  setDeadline(index) {
    var $dataItem = $('.gold-computed-date .data-item')
    var max = $dataItem.length - 1
    if (index <= 0) {
      currentIndex = 0
    } else if (index >= max) {
      currentIndex = max
    } else {
      currentIndex = index
    }
    var one = (1 / max) * 100
    $('.gold-computed-date .cursor').css({
      left: currentIndex * one - half + '%'
    })
    var $currentNode = $dataItem.eq(currentIndex)
    $('.date')
      .text($currentNode.text())
      .data('limit', $currentNode.data('limit-rate'))
      .data('rate', $currentNode.data('rate'))
    computedBalance()
  },
  renderGoldSplitLines(data) {
    var rate = (1 / (data.length - 1)) * 100
    return data
      .map(function(item, index) {
        var delta = index === data.length - 1 ? 0.3 : 0.03
        var style = 'left: ' + (rate * index - delta + '%')
        return '<span class="line" style="' + style + '"></span>'
      })
      .join('')
  },
  renderPrimeTime(data) {
    var rate = (1 / (data.length - 1)) * 100
    return data
      .map((item, index) => {
        var classes = item.recommend == 1 ? 'recommend' : ''
        var delta = index === 0 ? 2 : index === data.length - 1 ? 6 : 2
        var style = 'left: ' + (rate * index - delta + '%')
        return '<span class="data-item ' + classes + '" data-rate="' + item.rate + '" data-limit-rate="' + item.id + '" ' + 'style="' + style + '">' + item.deadline + '</span>'
      })
      .join('')
  }
}
dragDeadLine.init()

var grams = [1, 20, 50, 100, 500, 1000]
var gramsMap = [{ scale: 20, base: 0 }, { scale: 30, base: 20 }, { scale: 50, base: 50 }, { scale: 500, base: 100 }, { scale: 500, base: 500 }, { scale: 500, base: 1000 }]

var startX2 = 0
var average = dragInnerWidth / (grams.length - 1)
var offsetX = node.offset().left

var dragGerms = {
  init() {
    $('.gold-computed-spec .drag-bg').html(this.renderGrams(grams))
    this.bindEvents()
    this.computedXMove(100)
  },
  bindEvents() {
    $('.gold-computed-spec .cursor').on('touchstart', e => {
      if (e.originalEvent.targetTouches.length > 1) {
        return
      }
      startX2 = e.originalEvent.targetTouches[0].clientX
    })
    $('.gold-computed-spec .cursor').on('touchend', e => {
      var endX = e.originalEvent.changedTouches[0].clientX
      this.setStyle(endX)
      this.setGram(endX)
      startX2 = endX
    })
    $('#gram').on('input', e => {
      var val = +e.target.value
      if (/^0+0$/.test(val) || !/^[1-9]\d{0,}$/.test(val)) {
        $(e.target).val(1)
        val = +e.target.value
      }
      if (val >= 99999) {
        $(e.target).val(99999)
      }
      computedBalance()
      this.computedXMove(val)
      this.toggleGrams(val)
    })
  },

  computedXMove(val) {
    if (val >= 1000) {
      this.setStyle(dragInnerWidth)
      return false
    }
    gramsMap.map((item, index) => {
      if (val >= item.base && val < gramsMap[index + 1]['base']) {
        var endX = index * average - offsetX
        endX += ((val - item.base) / item.scale) * average
        this.setStyle(endX)
        startX2 = endX
      }
    })
  },
  setGram(endX) {
    var index = Math.floor((endX) / average)
    var mode = (endX) % average
    if (index <= 0) {
      index = 0
    } else if (index >= gramsMap.length - 1) {
      index = gramsMap.length - 1
    }
    var item = gramsMap[index]
    var gram = Math.floor((mode / average) * item.scale) + item.base
    gram = gram < 0 ? 0 : gram
    this.toggleGrams(gram)
    $('#gram').val(gram)
    computedBalance()
  },
  setStyle(endX) {
    var half = (offsetX - $('.cursor').width()) / 2
    var delta = startX2 + endX - startX2 - half
    if (delta <= -offsetX) {
      delta = -offsetX - half
    } else if (delta >= dragInnerWidth) {
      delta = dragInnerWidth - offsetX - half
    }
    $('.gold-computed-spec .cursor').css({ left: delta + 'px' })
  },
  toggleGrams(val) {
    val = val || 1
    var temp = grams.map(item => {
      if (item === 1000 && val >= 1000) {
        item = '>1000'
      }
      return item
    })
    $('.gold-computed-spec .drag-bg').html(this.renderGrams(temp))
  },
  renderGrams(data) {
    var rate = (1 / (data.length - 1)) * 100
    return data
      .map(function(item, index) {
        var classes = item.recommend == 1 ? 'recommend' : ''
        var delta = index === 0 ? 1 : index === data.length - 1 ? 8 : 4
        var style = 'left: ' + (rate * index - delta + '%')
        return '<span class="data-item ' + classes + '" style="' + style + '">' + item + '</span>'
      })
      .join('')
  }
}

dragGerms.init()
