const FtpDeploy = require('ftp-deploy')
const ftpDeploy = new FtpDeploy()
const { execSync, spawnSync } = require('child_process')
const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const { uploadFileOrDir } = require('./ali-oss')
const { installersBasePath } = require('../public/autoUpdaterConfig')

const isWin32 = process.platform === 'win32'
const isX64 = process.arch === 'x64'
const toElectron = process.env.toElectron !== 'false'
const version = execSync('git describe --abbrev=0 --tags').toString().trim() || 'v1.0.0'
console.log(`version: ${version} is start deploy`)
process.chdir(__dirname)

function deployToServer() {
  const x64config = {
    arch: 'x64',
    user: 'share',                   // NOTE that this was username in 1.x
    password: 'share@zego',           // optional, prompted if none given
    host: '192.168.1.3',
    localRoot: '../dist/installers-x64',
    remoteRoot: '/app/classroom-electron',
    include: ['*', '**/*'],      // this would upload everything except dot files
    deleteRemote: false,              // delete existing files at destination before uploading
    forcePasv: true                 // Passive mode is forced (EPSV command is not sent)
  }
  
  function deploy(config, success = () => {}) {
    console.log('FTP deploy is start.')
    ftpDeploy.deploy(config)
      .then(res => {
          console.log('FTP deploy is finished.')
          if (success) success()
        })
      .catch(err => {
        if (err) {
          if (config.deleteRemote) {
            const newConfig = Object.assign({}, config, { deleteRemote: false })
            deploy(newConfig, success)
          } else {
            console.log(err)
          }
        }
      })

    console.log('copy installers to ali-oss.')

    const arch = config.arch
    uploadFileOrDir(`../dist/installers-${arch}/ClassRoom-${version.slice(1)}${isWin32 ? `-${arch}-Setup.exe` : '.dmg'}`, `${installersBasePath}-${arch}/ClassRoom${isWin32 ? `-${arch}-Setup.exe` : '.dmg'}`)
    uploadFileOrDir(`../dist/installers-${arch}`, `${installersBasePath}-${arch}/`)
    uploadFileOrDir('../changelog-data.json', `${installersBasePath}-${arch}/`)
    uploadFileOrDir('../CHANGELOG.md', `${installersBasePath}-${arch}/`)
  }

  deploy(x64config, isWin32 ? () => {
    deploy({ ...x64config, localRoot: '../dist/installers-ia32', arch: 'ia32' })
  } : () => {})
}

function deployWeb(gitUrl, gitDir) {
  function deployToGit() {
    const projectDir = path.join(__dirname, gitDir)
    const publicOptions = { cwd: projectDir, stdio: 'inherit' }
  
    if (fs.existsSync(projectDir)) {
      updateFiles()
    } else {
      execSync(`git clone ${gitUrl} ${projectDir}`)
      updateFiles()
    }
  
    function updateFiles() {
      console.log('old build files is cleaned!\n')
      spawnSync('git', ['reset', '--hard'], publicOptions)
      spawnSync('git', ['pull'], publicOptions)
      console.log('publicReport is updated!\n')
    
      const outputPath = path.join(__dirname, '../build')
      const outputGitPath = path.join(outputPath, '.git')
      fse.copySync(`${projectDir}/.git`, outputGitPath, { overwrite: true })
      fse.emptyDirSync(projectDir)
      
      fse.copySync(outputPath, projectDir, { overwrite: true })
      fse.emptyDirSync(outputGitPath)
      
      spawnSync('git', ['add', '-A'], publicOptions)
      spawnSync(
        'git',
        ['commit', '-m', `Updated at ${(new Date()).toLocaleDateString()}`],
        publicOptions
      )
      spawnSync('git', ['push', '-u', 'origin', 'master'], publicOptions)
      
      console.log('project is updated!')
    }
  }
  deployToGit()
}

if (toElectron) {
  deployToServer()
} else {
  deployWeb('git@gl.zego.im:playground/classroom-build.git', '../../classroom-build')
  deployWeb('git@github.com:myxvisual/polow-prod.git', '../../polow-prod')
}
