const ChildProcess = require('child_process')
let hadWebpack = false
try {
  ChildProcess.exec('webpack -v', (err, stdout, stderr) => {
    if (stderr || err) {
      ChildProcess.execSync('npm install webpack@3.11.0')
      hadWebpack = true
    }
  })
} catch (error) {
  hadWebpack = false
}
console.log(`webpack cli ${hadWebpack ? '' : 'not '}working for current environment.`)

switch (process.platform) {
  case 'win32': {
    break
  }
  case 'darwin': {
    try {
      ChildProcess.execSync('npm install electron-installer-dmg@2.0.0')
    } catch (err) {}
    break
  }
  default: {
    break
  }
  
}