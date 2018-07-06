const app_address = new Vue({
  el: '#root',
  data() {
    return {
      item_height: 34,
      selected_province: null,
      selected_city: null,
      selected_county: null,
      popup_visible: false
    }
  },
  created() {
    this.province_list = data_201805
    this.update_data()
  },
  mounted() {
    this.scroller_province = initScroller(this.$refs.province_container, this.$refs.province_content, (i) => this.onProvinceChange(i))
    this.scroller_city = initScroller(this.$refs.city_container, this.$refs.city_content, (i) => this.onCityChange(i))
    this.scroller_county = initScroller(this.$refs.county_container, this.$refs.county_content, (i) => this.onCountyChange(i))
  },
  beforeDestroy() {
    this.scroller_province.$destroy()
    this.scroller_city.$destroy()
    this.scroller_county.$destroy()
  },
  methods: {
    onClickAddress() {
      this.popup_visible = true
      this.$nextTick(() => this.update_data())
    },
    update_data() {
      if (!this.selected_province) {
        this.selected_province = this.province_list[0]
      }
      if (!this.selected_city || !this.is_code_in_list(this.selected_city[0], this.selected_province[2])) {
        this.selected_city = this.selected_province[2][0]
      }
      if (!this.selected_county || !this.is_code_in_list(this.selected_county[0], this.selected_city[2])) {
        this.selected_county = this.selected_city[2][0]
      }

      this.update_scroller()
    },
    update_scroller() {
      if (!this.scroller_province) return

      this.scroller_province.$update(this.province_list.indexOf(this.selected_province))
      this.scroller_city.$update(this.selected_province[2].indexOf(this.selected_city))
      this.scroller_county.$update(this.selected_city[2].indexOf(this.selected_county))
    },
    is_code_in_list(code, list) {
      for (let i = 0, len = list.length; i < len; i++) {
        if (code === list[i][0]) return true
      }
      return false
    },
    get_item_match(code_or_name, list) {
      for (let i = 0, len = list.length, item; i < len; i++) {
        item = list[i]
        if (code_or_name === item[0] || code_or_name === item[1]) return item
      }
      return null
    },
    onProvinceChange(i) {
      this.set_selected_item(i, this.province_list, 'selected_province')
    },
    onCityChange(i) {
      this.set_selected_item(i, this.selected_province[2], 'selected_city')
    },
    onCountyChange(i) {
      this.set_selected_item(i, this.selected_city[2], 'selected_county')
    },
    set_data(province, city, county) {
      province = this.get_item_match(province, this.province_list)
      if (province) this.selected_province = province

      city = this.get_item_match(city, this.selected_province[2])
      if (city) this.selected_city = city

      county = this.get_item_match(county, this.selected_city[2])
      if (county) this.selected_county = county

      this.$nextTick(() => this.update_data())
    },
    set_selected_item(index, list, key_selected) {
      let item = list[index]
      // 尽量匹配到选中项
      if (!item) {
        if (index < 0) item = list[0]
        else if (index >= list.length) item = list[list.length - 1]
      }
      if (item === this[key_selected]) return
      this[key_selected] = item
      this.update_data()
    }
  }
})

function initScroller(container, content, onchange) {
  const ITEM_HEIGHT = 34 // 项目高度 34px
  const rect = container.getBoundingClientRect()
  const scroller = new Scroller(render(content), {
    scrollingX: false,
    snapping: true,
    scrollingComplete: onScrollingComplete
  })
  scroller.setSnapSize(34, 34)
  scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop)
  scroller.setDimensions(container.clientWidth, container.clientHeight, content.offsetWidth, content.offsetHeight)

  // 新增方法

  scroller.$update = (itemIndex) => {
    scroller.setDimensions(container.clientWidth, container.clientHeight, content.offsetWidth, content.offsetHeight)
    // 更新位置，确保数据更新后位置同步，使用 Scroller 私有方法直接移动到位，避免再次触发动画效果
    setTimeout(() => scroller.__publish(0, itemIndex * ITEM_HEIGHT, 1))
  }
  scroller.$destroy = () => {
    scroller.__callback = null // 移除 render 回调引用
    container.removeEventListener('touchstart', touchstartHandler)
    container.removeEventListener('touchmove', touchmoveHandler)
    container.removeEventListener('touchend', touchendHandler)
  }

  container.addEventListener('touchstart', touchstartHandler, false)
  container.addEventListener('touchmove', touchmoveHandler, false)
  container.addEventListener('touchend', touchendHandler, false)

  function touchstartHandler(e) {
    scroller.doTouchStart(e.touches, e.timeStamp)
    e.preventDefault()
  }

  function touchmoveHandler(e) {
    scroller.doTouchMove(e.touches, e.timeStamp)
  }

  function touchendHandler(e) {
    scroller.doTouchEnd(e.timeStamp)
  }

  function onScrollingComplete() {
    // 异步处理更精准些，滚动完成后可能还没有到位
    setTimeout(() => onchange( Math.floor(scroller.__scrollTop / ITEM_HEIGHT) ))
  }

  return scroller
}