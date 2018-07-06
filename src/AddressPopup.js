(function(factory) {

  if (typeof exports !== 'undefined') {
    module.exports = factory(require('vue'), window.Scroller)
  } else {
    window.AddressPopup = factory(window.Vue, window.Scroller)
  }

})(function(Vue, Scroller) {

const template_address_component = `
<div class="address-popup">
  <transition name="address-popup-animate-mask">
    <div v-show="popup_visible" class="address-popup__mask" @click="onClickMask"></div>
  </transition>
  <transition name="address-popup-animate-content">
    <div v-show="popup_visible" class="address-popup__content">
      <div class="address-popup__head">
        <div class="address-popup__head-left" @click="onClickCancel">取消</div>
        <div class="address-popup__head-title"></div>
        <div class="address-popup__head-right" @click="onClickConfirm">确定</div>
      </div>
      <div class="address-popup__body">
      <div class="address-popup__column" ref="province_container" id="columen-province">
        <div class="address-popup__column-content" ref="province_content" id="columen-province-content">
          <div v-for="item in province_list" class="address-popup__column-item">{{ item[1] }}</div>
        </div>
        <div class="address-popup__column-mask"></div>
        <div class="address-popup__column-indicator"></div>
      </div>
      <div class="address-popup__column" ref="city_container">
        <div class="address-popup__column-content" ref="city_content">
          <div v-for="item in selected_province[2]" class="address-popup__column-item">{{ item[1] }}</div>
        </div>
        <div class="address-popup__column-mask"></div>
        <div class="address-popup__column-indicator"></div>
      </div>
      <div class="address-popup__column" ref="county_container">
        <div class="address-popup__column-content" ref="county_content">
          <div v-for="item in selected_city[2]" class="address-popup__column-item">{{ item[1] }}</div>
        </div>
        <div class="address-popup__column-mask"></div>
        <div class="address-popup__column-indicator"></div>
      </div>
    </div>
  </transition>
</div>
`

let AddressPopup = {
  template: template_address_component,
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
    get_data() {
      const prov = this.selected_province
      const city = this.selected_city
      const cont = this.selected_county
      return {
        address: [prov[0], city[0], cont[0]],
        address_desc: [prov[1], city[1], cont[1]],
        address_data: [prov, city, cont]
      }
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
    },
    // 事件处理
    onClickConfirm() {
      this.$emit('confirm', this.get_data())
    },
    onClickCancel() {
      this.$emit('cancel')
    },
    onClickMask() {
      this.$emit('cancel')
    }
  }
}
  
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

let instance = null

return {
  props: {
    visible: Boolean,
    address: Array
  },
  created() {
    if (!instance) {
      const Ctor = Vue.extend(AddressPopup)
      instance = new Ctor()
      const el = document.createElement('div')
      document.body.appendChild(el)
      instance.$mount(el)
    }
    this.$onConfirm = (e) => this.onConfirm(e)
    this.$onCancel = (e) => this.onCancel(e)
    instance.$on('confirm', this.$onConfirm)
    instance.$on('cancel', this.$onCancel)
  },
  destroyed() {
    instance.$off('confirm', this.$onConfirm)
    instance.$off('cancel', this.$onCancel)
  },
  render(h) {
    return h()
  },
  watch: {
    visible(value) {
      if (value) {
        this.showPopup()
      } else {
        this.hidePopup()
      }
    }
  },
  methods: {
    showPopup() {
      instance.popup_visible = true

      const address = this.address
      if (!address) return
      instance.set_data(address[0], address[1], address[2])
    },
    hidePopup() {
      instance.popup_visible = false
    },
    onConfirm(data) {
      this.$emit('confirm', data)
    },
    onCancel() {
      this.$emit('cancel')
    }
  }
}
})