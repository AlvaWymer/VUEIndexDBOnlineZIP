export default {
  getType (o) { // 判断类型
    switch (this.toType(o)) {
      case 'object': // 对象类型
        return 'obj'
      case 'null':
        return 'null'
      case 'undefined':
        return 'undefined'
      case 'array': // 数组类型
        return 'arr'
      case 'number': // 数组类型
        return 'num'
      default:
        return 'str' // 字符串类型
    }
  },
  toType (obj) { // 字符串转换
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
  },
  judgeIsNullObj (obj) { // 判断对象是否为空
    for (var i in obj) { // 如果不为空，则会执行到这一步，返回true
      return true
    }
    return false // 如果为空,返回false
  },
  judgeIsDate (objValue) {
    // 判断对象的值是不是Date即日期类型
    if (objValue instanceof Date) { // 如果是，则会执行到这一步，返回true
      return true
    }
    return false // 如果不是,返回false
  },
  switchDateYYTM (dateObjValue) {
    if (!dateObjValue) { return '-' }
    // 把Date对象的值转换为YYYY-MM-DD日期类型
    dateObjValue = new Date(dateObjValue).getFullYear() + '-' + (new Date(dateObjValue).getMonth() + 1) + '-' + new Date(dateObjValue).getDate()
    return dateObjValue
  }
}
