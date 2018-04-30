<a name="2.0.0"></a>
# [2.0.0](https://github.com/contactlab/shipit-clab-deploy/compare/1.0.3...2.0.0) (2018-04-30)


### Bug Fixes

* **shipit-cli:** explicit "keepReleases" in config ([074975c](https://github.com/contactlab/shipit-clab-deploy/commit/074975c))


### Features

* **shipit:** replace deprecated remoteCopy with copyToRemote ([7eeae71](https://github.com/contactlab/shipit-clab-deploy/commit/7eeae71)), closes [#10](https://github.com/contactlab/shipit-clab-deploy/issues/10)
* add a changelog generator ([00e6ba0](https://github.com/contactlab/shipit-clab-deploy/commit/00e6ba0)), closes [#11](https://github.com/contactlab/shipit-clab-deploy/issues/11)
* add greenkeeper for lockfile ([e6c8fd8](https://github.com/contactlab/shipit-clab-deploy/commit/e6c8fd8)), closes [#12](https://github.com/contactlab/shipit-clab-deploy/issues/12)


### BREAKING CHANGES

* **shipit:** remove deprecated `remoteCopy` in favour of `copyToRemote` in order to be compliant wiht `shipit-cli`
v4.x
* **shipit-cli:** Starting from shipit-cli v4.x the "keepReleases" property in default (hard-coded) configuration was removed.
In order to keep consistency, the key was added to `shipit-clab-deploy` own defaults (with 5 as value).



