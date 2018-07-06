const app_address = new Vue({
  el: '#root',
  data() {
    return {
      address: [],
      address_desc: ['--', '--', '--'],
      popup_visible: false
    }
  },
  components: {
    AddressPopup
  },
  methods: {
    onClickAddress() {
      this.popup_visible = true
    },
    onConfirm(data) {
      this.popup_visible = false
      this.address = data.address
      this.address_desc = data.address_desc
    },
    onCancel() {
      this.popup_visible = false
    }
  }
})
