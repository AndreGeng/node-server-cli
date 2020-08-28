const { TEMPLATE } = require("./constant")

/**
 * NOTICE: 对于需要使用"eject"特性的feat，问题的name请务必以Needed结尾, e.g. redisNeeded/mysqlNeeded
 */
module.exports = [
  {
    name: "projectName",
    message: "请输入项目名称:",
    validate(projectName) {
      const regex = /^[^._][@/\-_a-z]*$/
      if (regex.test(projectName)) {
        return true
      }
      return "项目名称不合法"
    },
  },
  {
    name: "template",
    message: "请选择项目模板:",
    type: "list",
    choices: [
      {
        name: "koa2+ts",
        value: TEMPLATE.KOA_TS,
      },
    ],
  },
  {
    name: "redisNeeded",
    message: "请问项目中是否会用到redis:",
    type: "list",
    choices: [
      {
        name: "是",
        value: true,
      },
      {
        name: "否",
        value: false,
      },
    ],
  },
  {
    name: "mysqlNeeded",
    message: "请问项目中是否会用到mysql:",
    type: "list",
    choices: [
      {
        name: "是",
        value: true,
      },
      {
        name: "否",
        value: false,
      },
    ],
  },
]
