# shipit-clab-deploy

Set of deployment tasks for [Shipit](https://github.com/shipitjs/shipit) - ContactLab UI flavour.

This is a kind of fork of [shipit-deploy](https://github.com/shipitjs/shipit-deploy) repo, without `git` fetching (only deploys local directory to remote servers).

**Features:**

- deploy local directory to remote serves;
- add additional behaviour using hooks;
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
module.exports = function (shipit) {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      workspace: '/tmp/github-monitor',
      deployTo: '/tmp/deploy_to',
      repositoryUrl: 'https://github.com/user/repo.git',
      ignores: ['.git', 'node_modules'],
      keepReleases: 2,
      deleteOnRollback: false,
      key: '/path/to/key',
      shallowClone: true
    },
    staging: {
      servers: 'user@myserver.com'
    }
  });
};
```

To deploy on staging, you must use the following command:

```sh
$ shipit staging deploy
```

You can rollback to the previous releases with the command:

```sh
$ shipit staging rollback
```

## Options

### workspace

Type: `String`

Define a path to an empty directory where Shipit builds it's syncing source. **Beware to not set this path to the root of your repository as shipit-deploy cleans the directory at the given path as a first step.**

### dirToCopy

Type: `String`
Default: same as workspace

Define directory within the workspace which should be deployed.

### deployTo

Type: `String`

Define the remote path where the project will be deployed. A directory `releases` is automatically created. A symlink `current` is linked to the current release.

### ignores

Type: `Array<String>`

An array of paths that match ignored files. These paths are used in the rsync command.

### deleteOnRollback

Type: `Boolean`

Whether or not to delete the old release when rolling back to a previous release.

### key

Type: `String`

Path to SSH key

### keepReleases

Type: `Number`

Number of releases to keep on the remote server.

### shallowClone

Type: `Boolean`

Perform a shallow clone. Default: `false`.

### gitLogFormat

Type: `String`

Log format to pass to [`git log`](http://git-scm.com/docs/git-log#_pretty_formats). Used to display revision diffs in `pending` task. Default: `%h: %s - %an`.

### rsyncFrom

Type: `String` *Optional*

When deploying from Windows, prepend the workspace path with the drive letter. For example `/d/tmp/workspace` if your workspace is located in `d:\tmp\workspace`.
By default, it will run rsync from the workspace folder.

### copy

Type: `String`

Parameter to pass to `cp` to copy the previous release. Non NTFS filesystems support `-r`. Default: `-a`

## Variables

Several variables are attached during the deploy and the rollback process:

### shipit.config.*

All options described in the config sections are available in the `shipit.config` object.

### shipit.repository

Attached during `deploy:fetch` task.

You can manipulate the repository using git command, the API is describe in [gift](https://github.com/sentientwaffle/gift).

### shipit.releaseDirname

Attached during `deploy:update` and `rollback:init` task.

The current release dirname of the project, the format used is "YYYYMMDDHHmmss" (moment format).

### shipit.releasesPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The remote releases path.

### shipit.releasePath

Attached during `deploy:update` and `rollback:init` task.

The complete release path : `path.join(shipit.releasesPath, shipit.releaseDirname)`.

### shipit.currentPath

Attached during `deploy:init`, `rollback:init`, and `pending:log` tasks.

The current symlink path : `path.join(shipit.config.deployTo, 'current')`.

## Workflow tasks

- deploy
  - deploy:init
    - Emit event "deploy".
  - deploy:fetch
    - Create workspace.
    - Initialize repository.
    - Add remote.
    - Fetch repository.
    - Checkout commit-ish.
    - Merge remote branch in local branch.
    - Emit event "fetched".
  - deploy:update
    - Create and define release path.
    - Remote copy project.
    - Emit event "updated".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
  - deploy:finish
    - Emit event "deployed".
- rollback
  - rollback:init
    - Define release path.
    - Emit event "rollback".
  - deploy:publish
    - Update symlink.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
  - rollback:finish
    - Emit event "rollbacked".
- pending
  - pending:log
    - Log pending commits (diff between HEAD and currently deployed revision) to console.

## Dependencies

### Local

- git 1.7.8+
- rsync 3+
- OpenSSH 5+

### Remote

- GNU coreutils 5+

## License

Released under the [Apache 2.0](LICENSE) license.
