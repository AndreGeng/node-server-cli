/**
 * 删除匹配到的整个文件
 */
const ejectFileIfNeeded = (files, ejectFeatList) => {
  Object.keys(files).forEach(filename => {
    let content = files[filename].contents.toString()
    const ejectFileRegex = new RegExp(
      "^\\s*/\\*\\*\\s*node-server-eject\\s*(\\w+)\\s*\\*\\/"
    )
    const match = ejectFileRegex.exec(content)
    if (match && match[1]) {
      const feat = match[1]
      // feat需要eject
      if (~ejectFeatList.indexOf(feat)) {
        delete files[filename]
      } else {
        // feat不需要eject
        files[filename].contents = Buffer.from(content.replace(match[0], ""))
      }
    }
  })
}
/**
 * 删除匹配的code block
 */
const ejectCodeBlockIfNeeded = (files, ejectFeatList) => {
  Object.keys(files).forEach(filename => {
    let content = files[filename].contents.toString()
    const getCodeBlockBoundary = label =>
      `[^\\S\\r\\n]*\\/\\*\\*\\s*node-server-eject\\s*${
        label === "start" ? "(\\w+)" : "\\1"
      }\\s*-+\\s*${label}\\s*\\*\\/`
    const codeBlockRegex = new RegExp(
      `${getCodeBlockBoundary("start")}([\\s\\S]+?)${getCodeBlockBoundary(
        "end"
      )}`,
      "g"
    )
    let match = codeBlockRegex.exec(content)
    const processQueue = []
    while (match && match.length > 2) {
      const [whole, feat, code] = match
      // feat需要eject
      if (~ejectFeatList.indexOf(feat)) {
        processQueue.push([whole, ""])
      } else {
        // feat不需要eject
        processQueue.push([whole, code])
      }
      match = codeBlockRegex.exec(content)
    }
    processQueue.forEach(([oldV, newV]) => {
      content = content.replace(oldV, newV)
    })
    files[filename].contents = Buffer.from(content)
  })
}
/**
 * mentalsmith plugin, 用于删除不需要的『特性』相关的代码, e.g. redis相关的代码
 * @params {string[]} featList 需要eject的特性列表
 */
const ejectIfNeeded = () => {
  return (files, metalsmith, done) => {
    const answers = metalsmith.metadata()
    const ejectFeatList = Object.keys(answers).reduce((acc, key) => {
      if (key.endsWith("Needed") && !answers[key]) {
        const feat = key.slice(0, key.length - "Needed".length)
        acc.push(feat)
      }
      return acc
    }, [])
    ejectFileIfNeeded(files, ejectFeatList)
    ejectCodeBlockIfNeeded(files, ejectFeatList)
    done()
  }
}

module.exports = ejectIfNeeded
