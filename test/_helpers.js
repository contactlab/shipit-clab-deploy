export const CONFIG_OK = {
  __extra__: 'key', // this is an extra key
  from: './dist',
  deployTo: '/var/www/html',
  releasesDir: 'releases',
  currentDir: 'current',
  keepReleases: 10
};

export const CONFIG_KO = {
  from: 123,
  releasesDir: false,
  currentDir: true,
  keepReleases: 1
};
