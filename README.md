## 标尺滑动交互

### 期限标尺滑动实现思路

期限的位置在标尺上是均分的（期限值不平均），且每次拖动只能拖动(n 为当前期限下标) `n+1`或者`n-1`，可以理解为手动播放的轮播。
基于以上条件，假设
期限选项 data = [30,60,180,360]，标尺节点的总宽度为 width， 当前 n= 0；
则平均每一格的比例为 `rate = 1/(date.length-1)`， 那么每次拖动的位移 `left = n*rate*100 + '%'`

### 注意事项

滑动的标尺指针宽度需要排除在外，避免精度丢失

### 克重标尺滑动实现思路

与期限的实现思路稍有不同，克重的位置在标尺上是均分的，**克重值不平均，且每次拖动距离变化时，实时计算克数，在输入框中输入克数时，拖动距离也实时更新**
基于以上条件，观察得知 两两相邻的克重之间的差值是可以计算得知，平均每一格的宽度可求知，拖动距离也可知，如此可得出拖动距离与克重的转换关系。

假设标尺节点的总宽度为 width， touch event emit, startX,endX；
克数选项

```
  grams = [1, 20, 50, 100, 500, 1000]
  gramsMap = [{ scale: 20, base: 0 }, { scale: 30, base: 20 }, { scale: 50, base: 50 }, { scale: 500, base: 100 }, { scale: 500, base: 500  }, { scale: 500, base: 1000 }]
```

则平均每一格的比例为 `averageWidth = width/(grams.length-1)`， 那么每次拖动的位移 `left = moveX = startX + endX - startX + 'px'`；
位移拿到了，现在做克重转换。

##### 伪代码

```
  var index = Math.floor((endX + offsetX) / average)
  var mode = (endX + offsetX) % averageWidth
  if (index <= 0) {
     index = 0
  } else if (index >= gramsMap.length - 1) {
     index = gramsMap.length - 1
  }
  var item = gramsMap[index]
  var gram = Math.floor((mode / averageWidth) * item.scale) + item.base
  gram = gram < 0 ? 0 : gram
  $('#gram').val(gram)
```

以上是位移转克重，如输入克数时，位移多少呢？

##### 伪代码

```
  // offsetX 标尺节点的X坐标
  currentGram = 123
  gramsMap.map((item, index) => {
      if (val >= item.base && currentGram < gramsMap[index + 1]['base']) {
        var endX = index * average - offsetX
        endX += ((currentGram - item.base) / item.scale) * averageWidth
        setStyle(endX)
        ...
      }
  })
```

### 注意事项

滑动的标尺指针宽度、标尺节点.offset().left需要排除在外，避免精度丢失
