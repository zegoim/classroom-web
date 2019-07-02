const execSync = require('child_process').execSync
let gitVersion = '1.0.0'

try {
    gitVersion = execSync('git describe --abbrev=0 --tags').toString().trim()
} catch (e) {
    // console.error(e)
}

module.exports = gitVersion
