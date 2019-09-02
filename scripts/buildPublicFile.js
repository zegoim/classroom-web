const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const mkdirp = require('mkdirp')
const { green } = require('chalk')
const { join, relative, extname } = path

const { execSync } = require('child_process')
const version = require('./gitVersion')
const versionNumber = version.slice(1)

const __DEV__ = process.env.NODE_ENV === 'development'
const {
  outputPath,
  publicPath,
  hostName,
  port,
  toElectron
} = require('../config')
const cloneFolders = ['node_modules', 'static', 'zegoliveroom']

const joinDirname = (...paths) => join(__dirname, ...paths)
const publicDir = joinDirname('../public')
const buildPath = joinDirname(`../${outputPath}/${publicPath}`)

if (!fs.existsSync(buildPath)) {
  mkdirp.sync(buildPath, (err) => {
    err && console.error(err)
  })
}
const folderCloneEnd = cloneFolders.reduce((prev, curr) => {
  prev[curr] = false
  return prev
}, {})

const fileWatcher = (eventType, absolutePath) => {
  const startTime = new Date()
  const pathExtname = path.extname(absolutePath)
  const relativePath = path.relative(publicDir, absolutePath)
  let outFileName = path.join(__dirname, `../${outputPath}`, relativePath)

  function cloneFile() {
    // const enCode = /\.jpe?g$|\.png$|\.gif|\.ico$/.test(pathExtname) ? 'base64' : 'utf8'
    if (fs.lstatSync(absolutePath).isDirectory()) {
      if (!fs.existsSync(outFileName)) mkdirp(outFileName)
    } else {
      try {
        fse.copySync(absolutePath, outFileName)
      } catch (e) { console.error(e) }
    }
  }

  const unixPath = relativePath.split(path.sep).join('/')
  const isCloneDir = cloneFolders.some(dirName => unixPath.startsWith(dirName))
  if (isCloneDir) {
    if (cloneFolders.some(dirName => dirName === unixPath)) {
      if (!folderCloneEnd[unixPath]) {
        folderCloneEnd[unixPath] = true
        const originFolder = path.join(publicDir, unixPath)
        const outFolder = path.join(__dirname, `../${outputPath}`, unixPath)
        if (toElectron || unixPath === 'static') {
          if (!fs.existsSync(outFolder)) mkdirp(outFolder)
          try {
            const win32Copy = `xcopy /Y /E  ${originFolder}\\* ${outFolder}`
            const unixCopy = `yes | cp -rf ${originFolder}/* ${outFolder}`
            execSync(process.platform === 'win32' ? win32Copy : unixCopy)
            console.log(green(`${unixPath} builded in ${Date.parse(new Date().toString()) - Date.parse(startTime.toString())}ms`))
          } catch (error) {
            console.error(error.toString())
          }
        }
      }
    }
  } else if (relativePath === 'package.json' || relativePath === 'package-lock.json') {
    const data = JSON.parse(fs.readFileSync(absolutePath))
    data.version = versionNumber
    fs.writeFileSync(outFileName, JSON.stringify(data, null, 2))
  } else if (['.ts'].includes(pathExtname)) {
    const UglifyJS = require('uglify-js')
    const tsc = require('typescript')
    const tsConfig = require('../tsconfig.json')
    const originCode = fs.readFileSync(absolutePath, 'utf8')
    const codeStr = tsc.transpile(
      originCode,
      Object.assign(
        {},
        tsConfig.compilerOptions,
        { sourceMap: false, module: 'es5' }
      )
    )
    let result = codeStr
    if (!__DEV__) {
      try {
        result = UglifyJS.minify(codeStr, { fromString: true, mangle: { toplevel: true } }).code
      } catch(e) {}
    }
    outFileName = outFileName.replace(path.extname(outFileName), '.js')
    fs.writeFileSync(outFileName, result, 'utf8')
  } else  {
    cloneFile()
  }

  if (!isCloneDir) {
    // console.log(green(`${relativePath} built ${outFileName} in ${Date.parse(new Date().toString()) - Date.parse(startTime.toString())}ms`))
  }
}

const buildDirFiles = (dir) => {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const absolutePath = join(dir, file)
    if (fs.lstatSync(absolutePath).isDirectory()) {
      buildDirFiles(absolutePath)
    }
    fileWatcher(null, absolutePath)
  }
}

buildDirFiles(publicDir)

// if (__DEV__) {
//   fs.watch(publicDir, (eventType, filename) => {
//     fileWatcher(eventType, join(publicDir, filename))
//   })
// }


const manifest = __DEV__ ? null : JSON.parse(
  fs.readFileSync(joinDirname('../', `./${outputPath}/${publicPath}/webpack-manifest.json`), 'utf8')
)
const vendorManifest = __DEV__ ? null : JSON.parse(
  fs.readFileSync(joinDirname('../', `./${outputPath}/${publicPath}/webpack-dll-manifest.json`), 'utf8')
)

const ejs = require('ejs')
const name = 'app'
fs.writeFileSync(
  joinDirname(`../${outputPath}/index.html`),
  ejs.render(
    fs.readFileSync(joinDirname('../src/views/index.ejs'), 'utf8'),
    {
      __DEV__,
      name: __DEV__ ? `/${publicPath}/js/${name}.js` : `${toElectron ? '.' : ''}/${publicPath}/${manifest[`${name}.js`]}`,
      initJS: `${toElectron ? '.' : ''}/init.js`,
      proxy: __DEV__ ? `http://${hostName}:${port}` : '',
      common: __DEV__ ? `/${publicPath}/js/common.js` : `${toElectron ? '.' : ''}/${publicPath}/${manifest['common.js']}`,
      vendor: __DEV__ ? `/${publicPath}/vendor.dev.dll.js` : `${toElectron ? '.' : ''}/${publicPath}/${vendorManifest['vendor.js']}`
    }
  )
)
