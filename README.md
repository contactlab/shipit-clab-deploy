# shipit-clab-deploy [![Build Status](https://travis-ci.org/contactlab/shipit-clab-deploy.svg?branch=master)](https://travis-ci.org/contactlab/shipit-clab-deploy)

[Shipit](https://github.com/shipitjs/shipit) deployment tasks for ContactLab UI applications.

Inspired by [shipit-deploy](https://github.com/shipitjs/shipit-deploy).

**Features:**

- deploy local `dist` directory to remote servers;
- easy rollback.

## Install

```sh
$ npm install -D @contactlab/shipit-clab-deploy
```

Or

```sh
$ yarn add -D @contactlab/shipit-clab-deploy
```

## Usage

### Example `shipitfile.js`

```js
const path = require('path');
const clabDeploy = require('@contactlab/shipit-clab-deploy');

module.exports = shipit => {
  clabDeploy(shipit);

  shipit.initConfig({
    staging: {
      servers: 'user@myserver.com',
      from: path.resolve('.', 'dist'),
      deployTo: '/var/www/html',
      releasesDir: 'releases',
      currentDir: 'current',
      keepReleases: 10
    }
  });
};
```

To deploy on staging (in the `/var/www/html` directory), you must use the following command:

```sh
$ shipit staging deploy
```

You can rollback to the previous releases with the command:

```sh
$ shipit staging rollback
```

### Options

#### from: `String`
Default: `dist`

Define the path of the directory which will be deployed.

#### deployTo: `String`
**Required**

Define the remote path where the `from` directory will be deployed. A new directory for the specific release is created under `releasesDir` folder and is sym-linked to `currentDir`.

#### releasesDir: `String`
Default: `releases`

Define the name of the directory under which every release is placed.

#### currentDir: `String`
Default: `current`

Define the name of the directory (symlink to the last release) under which the current release is placed.

#### keepReleases: `Number`
Default: `5`

Number of releases to keep on the remote server.

## Dependencies

### Local

- git 1.7.8+
- rsync 3+
- OpenSSH 5+

### Remote

- GNU coreutils 5+
- GNU findutils 4.4.2+

## License

Released under the [Apache 2.0](LICENSE) license.
