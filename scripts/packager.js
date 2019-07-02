const { exec, execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
process.chdir(__dirname)

function packagerElectron(buildArch = 'ia32', callback = () => {}) {

  const useExecSync = false
  const config = {
    dir: '../build',
    out: '../dist',
    overwrite: true,
    icon: path.join(__dirname,  process.platform === 'darwin' ? '../public/static/images/icons/icon-128x128.icns' : '../public/static/images/icons/icon-256x256.ico'),
    platform: process.platform,
    arch: buildArch
  }
  console.log(`Current build platform arch is ${buildArch}.`)
  if (useExecSync) {
    const childProcess = exec(`electron-packager ../build --out=../dist --overwrite --platform=${process.platform} --arch=${buildArch} --icon=public/static/images/icons/icon-128x128.${process.platform === 'darwin' ? 'icns' : 'png'} --version-string.ProductName="ClassRoom"`)
    childProcess.stdout.on('data', data => { console.log(data) })
    childProcess.stderr.on('data', data => { console.error(data) })
    childProcess.on('exit', callback)
  } else {
    const packager = require('electron-packager')
    packager(config).then(callback)
  }
}

function packagerInstaller(buildArch = 'ia32', packageArch = 'ia32', callback = () => {}) {
  const appDirectory = `../dist/ClassRoom-${process.platform}-${buildArch}`
  const outputDirectory = `../dist/installers-${packageArch}`
  const authors = 'Zego App Inc.'
  const packageName = 'ClassRoom'
  let version = execSync('git describe --abbrev=0 --tags').toString().trim() || 'v1.0.0'
  version = version.slice(1)
  
  const installerPath = path.join(__dirname, outputDirectory)
  if (fs.existsSync(installerPath)) {
    execSync(`${process.platform === 'win32' ? 'rd /s /q' : 'rm -rf'} ${installerPath}`)
  }

  switch (process.platform) {
    case 'win32': {
      function build2WinStore() {
        console.log(`Windows store packager is start arc is ${packageArch}.`)
        const convertToWindowsStore = require('electron-windows-store')

        convertToWindowsStore({
           inputDirectory: path.join(__dirname, appDirectory),
           outputDirectory: path.join(__dirname, outputDirectory),
           packageName,
           packageVersion: version
        })
      }
      // build2WinStore()

      function build2Exe() {
        console.log(`Windows packager is start arc is ${packageArch}.`)
        const noMsi = true
        const electronInstaller = require('electron-winstaller')
        resultPromise = electronInstaller.createWindowsInstaller({
          appDirectory,
          outputDirectory,
          setupMsi: !noMsi,
          noMsi,
          loadingGif: '../public/b687fa24811285.5633d382004bb.gif',
          productName: `${packageName}-${version}-${packageArch}-`,
          authors,
          iconUrl: path.join(__dirname, '../public/static/images/icons/icon-256x256.ico'),
          setupIcon: path.join(__dirname, '../public/static/images/icons/icon-256x256.ico')
        })
        resultPromise.then(() => {
          console.log('It worked!')
          if (callback) {
            callback()
          }
        }, (e) => console.log(`No dice: ${e.message}`))
      }
      build2Exe()

      break
    }
    case 'darwin': {
      console.log('MacOS packager is start.')
      let createDMG
      try {
        createDMG = require('electron-installer-dmg')
      } catch (error) {
        execSync('npm install electron-installer-dmg@2.0.0')
        createDMG = require('electron-installer-dmg')
      }
      createDMG({
        appPath: appDirectory,
        name: `${packageName}-${version}`,
        overwrite: true,
        out: outputDirectory
      }, err => console.error(err))
      const zip = require('electron-installer-zip')
      zip({
        dir: appDirectory,
        out: `${outputDirectory}/${packageName}-${version}-${process.platform}-${packageArch}.zip`
      }, err => {
        if (err) {
          console.error(err)
        } else {
          console.log()
        }
      })
      break
    }
    default: {
      break
    }
  }
}

const isWin32 = process.platform === 'win32'
if (isWin32) {
  packagerElectron('ia32', () => {
    packagerInstaller('ia32', 'ia32', () => {
      const buildX64 = true
      if (buildX64) {
        const extract = require('extract-zip')
        extract(path.join(__dirname, '../sdk/WindowsSDK-x64.zip'), { dir: path.join(__dirname, '../build/zegoliveroom') }, err => {
          if (err) {
            console.error(err)
          } else {
            packagerElectron('x64', () => {
              packagerInstaller('x64', 'x64')
            })
          }
        })
      }
    })
  })
} else {
  packagerElectron('x64', () => {
    packagerInstaller('x64', 'x64')
  })
}
