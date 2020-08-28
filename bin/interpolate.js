const metalsmith = require("metalsmith")
const render = require("consolidate").handlebars.render
const util = require("util")
const { exec } = require("child_process")
const debug = require("debug")("node-server-cli")
const ejectIfNeeded = require("./eject")

const renderP = util.promisify(render)
const execP = util.promisify(exec)

const interpolate = (answers, { sourceFolder, destFolder }) => {
  return new Promise((resolve, reject) => {
    metalsmith(process.cwd())
      .metadata(answers)
      .source(sourceFolder)
      .destination(destFolder)
      .use(ejectIfNeeded())
      .use(async (files, metalsmith, done) => {
        const fileNames = Object.keys(files)
        await Promise.all(
          fileNames.map(async filename => {
            const content = files[filename].contents.toString()
            const res = await renderP(content, answers)
            files[filename].contents = Buffer.from(res)
          })
        )
        done()
      })
      .build(async err => {
        if (err) {
          return reject(err)
        }
        debug("Build finished!")
        // 清理sourceFolder
        const { stdout, stderr } = await execP(`rm -rf ${sourceFolder}`)
        debug(`stdout: ${stdout}`)
        debug(`stderr: ${stderr}`)
        resolve()
      })
  })
}
module.exports = interpolate
