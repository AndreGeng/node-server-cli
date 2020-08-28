#!/usr/bin/env node

const inquirer = require("inquirer")
const download = require("download-git-repo")
const util = require("util")
const ora = require("ora")
const { exec } = require("child_process")
const debug = require("debug")("node-server-cli")
const program = require("commander")
const chalk = require("chalk")

const packageJson = require("../package.json")
const questions = require("./questions")
const ProjectMgr = require("./project-mgr")
const interpolate = require("./interpolate")

const downloadP = util.promisify(download)
const execP = util.promisify(exec)

program.version(packageJson.version)
program
  .command("init")
  .description("生成node-server脚手架项目")
  .action(async () => {
    // 1. 询问用户配置信息
    const answers = await inquirer.prompt(questions)
    const projectMgr = new ProjectMgr(answers.projectName)
    const { downloadAddr, sourceFolder, destFolder } = projectMgr
    try {
      const downloadProjectSpinner = ora("下载项目模板..").start()
      // 2. 获取对应模板并下载
      await downloadP(downloadAddr, sourceFolder)
      downloadProjectSpinner.succeed("项目模板下载成功")
      const interpolateProjectSpinner = ora("初始化项目模板...").start()
      // 3. 对项目插值
      await interpolate(answers, projectMgr)

      interpolateProjectSpinner.succeed(`初始化项目模板完成`)
      const installDepSpinner = ora("安装依赖").start()
      const { stderr } = await execP("npm i", {
        cwd: destFolder,
      })
      debug(`安装依赖stderr: ${stderr}`)
      installDepSpinner.succeed("依赖安装完成")
      const prettierSpinner = ora("代码格式化").start()
      const { stderr: err } = await execP(
        "npx prettier --write '**/*.{js,ts,json}'",
        {
          cwd: destFolder,
        }
      )
      debug(`代码格式化stderr: ${err}`)
      prettierSpinner.succeed("代码格式化完成")
      console.log(chalk.green("项目初始化成功"))
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
  })

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp(chalk.red)
}
