class ProjectMgr {
  constructor(name) {
    // 项目名称
    this.name = name
  }
  /**
   * 根据用户配置，返回对应的项目地址
   */
  get downloadAddr() {
    return "AndreGeng/node-server"
  }
  get sourceFolder() {
    return `./${this.name}_source`
  }
  get destFolder() {
    return `./${this.name}`
  }
}

module.exports = ProjectMgr
