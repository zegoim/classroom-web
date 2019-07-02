# Installation
`npm i`

# Set AppId & SignKey
```js
// projectDir/config.js

const projectName = 'classroom'

module.exports = {
  projectName,
  outputPath: 'build',
  publicPath: 'static',
  hostName: '127.0.0.1',
  port: 8092,
  zegoConfig: {
    // replay appId in here.
    appId: '',
    // replay signKey in here.
    signKey: []
  },
  webpackManifestName: 'webpack-manifest',
  webpackDllManifestName: 'webpack-dll-manifest',
  toElectron: process.env.toElectron === 'true'
}

```

# Dev Web
## Start
``` sh
npm start # open http://127.0.0.1:8092
```

## Build
``` sh
npm run build
```

## Deploy Server
``` sh
npm run deploy:web
```
