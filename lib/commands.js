/**
 * Checks if value is of provided type.
 * @param {string} t - The type
 * @param {*} x - Value to check
 * @returns {boolean}
 */
const typeOf = (t, x) =>
  typeof x === t;

/**
 * Checks if value is number or string.
 * @param {*} x - Value to check
 * @returns {boolean}
 */
const numOrStr = x =>
  (typeOf('string', x) || typeOf('number', x));

/**
 * Checks if value is a string and non-empty.
 * @param {*} x - Value to check
 * @returns {boolean}
 */
const checkStr = x =>
  (typeOf('string', x) && x.length > 0);

/**
 * Trims away trailing character form string (if exists) and returns the trimmed string.
 * @param {string} c - Trailing char to be trimmed
 * @param {string} s - The string
 * @returns {string}
 */
const trimTrailing = (c, s) =>
  s.lastIndexOf(c) === s.length -1 ? s.substring(0, s.length -1) : s;

/**
 * Returns the command or throws error if path is neither a string nor a number.
 * @param {string} cmd - The command which uses path
 * @param {string | number} p - The path
 * @returns {string}
 * @throws {TypeError}
 */
const safePathCmd = (cmd, p) => {
  if (!numOrStr(p)) {
    throw new TypeError('Path has to be string or number');
  }

  return cmd;
};

/**
 * Returns the command or throws error if `s` is not a string or is empty.
 * @param {string} cmd - The command which uses path
 * @param {string} s - The string
 * @returns {string}
 * @throws {TypeError}
 */
const safeStrCmd = (cmd, s) => {
  if (!checkStr(s)) {
    throw new TypeError(`"${s}" has to be string and non-empty`);
  }

  return cmd;
};

/**
 * Returns a mkdir command.
 * @param {string | number} p - Dir path
 * @returns {string}
 * @throws {TypeError}
 */
const mkdir = p =>
  safePathCmd(`mkdir -p ${String(p)}`, p);

/**
 * Returns a symlink command (from path to path).
 * @param {string | number} from - From path
 * @param {string | number} to - To path
 * @returns {string}
 * @throws {TypeError}
 */
const symlink = (from, to) => {
  if (!numOrStr(from) || !numOrStr(to)) {
    throw new TypeError('Paths has to be strings or numbers');
  }

  return `ln -nfs ${String(from)} ${String(to)}`;
};

/**
 * Returns a command which keeps the last `n` folders in a `path` and deletes the others.
 * @param {number} n - Number of last directories to keep
 * @param {string | number} p - Path of parent folder
 * @returns {string}
 * @throws {TypeError}
 */
const keepLastOf = (n, p) => {
  if (!typeOf('number', n)) {
    throw new TypeError('Number of keeps has to be number');
  }

  return safePathCmd(`ls -d1 ${trimTrailing('/', String(p))}/* | sort -n | head -n -${n} | xargs rm -rf`, p);
};

/**
 * Returns a command which creates a REVISION file under `path` with `hash` as content.
 * @throws {TypeError}
 * @param {string | number} p - Path of parent folder
 * @param {string} h - Commit hash
 * @returns {string}
 */
const revision = (p, h) => {
  if (!checkStr(h)) {
    throw new TypeError('Hash has to be string and non-empty');
  }

  return safePathCmd(`echo "${h}" > ${trimTrailing('/', String(p))}/REVISION`, p);
};

/**
 * Returns a command which counts the sud-directories under `path`.
 * @param {string | number} p - Path of parent folder
 * @returns {string}
 * @throws {TypeError}
 */
const countDirs = p =>
  safePathCmd(`find ${trimTrailing('/', String(p))}/ -maxdepth 1 -type d | wc -l`, p);

/**
 * Returns a `rm` command.
 * @param {string | number} p - Path to be removed
 * @returns {string}
 * @throws {TypeError}
 */
const rm = p =>
  safePathCmd(`rm -rf ${String(p)}`, p);

/**
 * Returns a command which take the latest sub-directory in `path`.
 * @param {string | number} p - Path of parent folder
 * @returns {string}
 * @throws {TypeError}
 */
const takeLatest = p =>
  safePathCmd(`ls -rd1 ${trimTrailing('/', String(p))}/* | head -n 1`, p);

/**
 * Returns a command which gets the last commit hash in `branch`.
 * @param {string} b - Branch name
 * @returns {string}
 * @throws {TypeError}
 */
const gitRev = b =>
  safeStrCmd(`git rev-parse ${b}`, b);

module.exports = {
  mkdir,
  symlink,
  keepLastOf,
  revision,
  countDirs,
  rm,
  takeLatest,
  gitRev
};
