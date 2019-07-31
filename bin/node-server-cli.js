#!/usr/bin/env node

const inquirer = require("inquirer")
const download = require("download-git-repo")
const util = require("util")
const ora = require("ora")
const path = require("path")
const fs = require("fs")

const downloadP = util.promisify(download)
const readFileP = util.promisify(fs.readFile)
const writeFileP = util.promisify(fs.writeFile)

const substitueLabels = (content, obj) => {
  const regex = /{{([^\s]*)}}/g
  let match = regex.exec(content)
  let result = content
  while (match) {
    if (match.length >= 2) {
      const label = match[1]
      result = result.replace(match[0], obj[label])
    }
    match = regex.exec(content)
  }
  return result
}

;(async () => {
  const answers = await inquirer.prompt([
    {
      name: "projectName",
      message: "请输入项目名称：",
      validate(projectName) {
        const regex = /^[^._][@\/\-_a-z]*$/
        if (regex.test(projectName)) {
          return true
        }
        return "项目名称不合法"
      },
    },
  ])
  const projectRelPath = `./${answers.projectName}`
  let spinner = ora("下载项目模板..").start()
  try {
    await downloadP("AndreGeng/node-server", projectRelPath)
    spinner.succeed("项目模板下载成功")
    spinner.start("初始化项目模板...")
    const packageJsonPath = path.resolve(projectRelPath, "./package.json")
    const content = await readFileP(packageJsonPath, { encoding: "utf8" })
    const result = substitueLabels(content, answers)
    await writeFileP(packageJsonPath, result, { encoding: "utf8" })
    spinner.succeed(`初始化项目模板完成`)
  } catch (e) {
    console.log(e)
    process.exit(1)
  }
})()
