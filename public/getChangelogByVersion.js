const request = require('request')

const { installersServer, installersPath } = require('./autoUpdaterConfig')

function getChangelogByVersion(version = 'v1.0.0', callback = (changelog, err) => {}) {
  request.get(`${installersServer}${installersPath}/changelog-data.json`, (err, res, body) => {
    if (body) {
      const changelogData = JSON.parse(body)
      let versionDetail = changelogData.filter(changelogItem => changelogItem.tag === version)[0]
      if (!versionDetail) {
        versionDetail = changelogData[0]
      }
      callback(versionDetail, null)
    } else {
      callback(null, err)
    }
  })
}
module.exports = getChangelogByVersion
