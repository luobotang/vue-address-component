const fs = require('fs')

const sp_codes = {
  110000: '北京',
  120000: '天津',
  310000: '上海',
  500000: '重庆'
}

const ignore_codes = {
  710000: '台湾省',
  810000: '香港特别行政区',
  820000: '澳门特别行政区'
}

const province_list = []
let province = []
let city_list = []
let county_list = []

const text = fs.readFileSync('data_201805.txt', {encoding: 'utf-8'})
text.split(/\r\n/).forEach((line) => {
  const [code, name] = line.split(' ')

  if (code in ignore_codes) return

  // 直辖市，写入特殊的下级行政区
  if (code in sp_codes) {
    county_list = []
    city_list = [[code, name, county_list]]
    province = [code, name, city_list]
    province_list.push(province)
    return
  }

  // 省
  if (code.endsWith('0000')) {
    city_list = []
    province = [code, name, city_list]
    province_list.push(province)
    return
  }

  // 市
  if (code.endsWith('00')) {
    county_list = []
    city_list.push([code, name, county_list])
    return
  }

  county_list.push([code, name])
})

// 处理没有下级县区数据的地市

province_list.forEach((p) => p[2].forEach(([code, name, county_list]) => {
  if (county_list.length === 0) {
    county_list.push([code, name]) // 补充一条地市数据
  }
}))

fs.writeFileSync('data_201805.js', 'var data_201805 = ' + renderData(province_list), {encoding: 'utf-8'})

function renderData(province_list) {
  return renderArray(province_list)
}

function renderArray(array, indent = '') {
  return (
    '[\n' +
      array.map(([code, name, list]) => list ? `${indent}["${code}", "${name}", ${renderArray(list, indent + '  ')}]` : `${indent}["${code}", "${name}"]`).join(',\n') +
    ']'
  )
}