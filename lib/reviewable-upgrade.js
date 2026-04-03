import {spawnSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const MANIFEST_FIELDS = ['dependencies', 'devDependencies', 'optionalDependencies'];

export function findNearestPackageJson(startDir = process.cwd()) {
  let currentDir = path.resolve(startDir);
  while (true) {
    const manifestPath = path.join(currentDir, 'package.json');
    if (existsSync(manifestPath)) return manifestPath;

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) return null;
    currentDir = parentDir;
  }
}

export function splitDescriptor(descriptor) {
  if (descriptor.startsWith('@')) {
    const slashIndex = descriptor.indexOf('/');
    if (slashIndex === -1) return {ident: descriptor, range: null};

    const rangeIndex = descriptor.indexOf('@', slashIndex + 1);
    if (rangeIndex === -1) return {ident: descriptor, range: null};

    return {
      ident: descriptor.slice(0, rangeIndex),
      range: descriptor.slice(rangeIndex + 1)
    };
  }

  const rangeIndex = descriptor.indexOf('@');
  if (rangeIndex === -1) return {ident: descriptor, range: null};

  return {
    ident: descriptor.slice(0, rangeIndex),
    range: descriptor.slice(rangeIndex + 1)
  };
}

export function normalizeGitHubRange(range) {
  if (typeof range !== 'string') return null;
  if (range.startsWith('github:')) return range;

  const shorthandMatch = range.match(
    /^(?<repo>[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)(?<fragment>#.+)?$/
  );
  if (shorthandMatch) {
    return `github:${shorthandMatch.groups.repo}${shorthandMatch.groups.fragment ?? ''}`;
  }

  const githubUrlMatch = range.match(
    /^(?:git\+)?https:\/\/github\.com\/(?<repo>[^/#]+\/[^/#]+?)(?:\.git)?(?<fragment>#.+)?$/i
  );
  if (githubUrlMatch) {
    return `github:${githubUrlMatch.groups.repo}${githubUrlMatch.groups.fragment ?? ''}`;
  }

  const githubSshMatch = range.match(
    /^(?:git\+)?ssh:\/\/git@github\.com\/(?<repo>[^/#]+\/[^/#]+?)(?:\.git)?(?<fragment>#.+)?$/i
  ) ?? range.match(
    /^git@github\.com:(?<repo>[^/#]+\/[^/#]+?)(?:\.git)?(?<fragment>#.+)?$/i
  );
  if (githubSshMatch) {
    return `github:${githubSshMatch.groups.repo}${githubSshMatch.groups.fragment ?? ''}`;
  }

  return null;
}

export function rewriteUpgradeArgs(packageJson, args) {
  const dependencyRanges = new Map();
  for (const field of MANIFEST_FIELDS) {
    for (const [name, range] of Object.entries(packageJson[field] ?? {})) {
      dependencyRanges.set(name, range);
    }
  }

  return args.map(arg => {
    if (arg.startsWith('-')) return arg;

    const {ident, range} = splitDescriptor(arg);
    if (!ident || range !== null || ident.includes('*')) return arg;

    const normalizedRange = normalizeGitHubRange(dependencyRanges.get(ident));
    return normalizedRange ? `${ident}@${normalizedRange}` : arg;
  });
}

export function runUpgrade({argv = process.argv.slice(2), cwd = process.cwd()} = {}) {
  const manifestPath = findNearestPackageJson(cwd);
  if (!manifestPath) {
    console.error('reviewable-upgrade: Could not find a package.json in the current directory tree.');
    return 1;
  }

  const manifestDir = path.dirname(manifestPath);
  const packageJson = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const rewrittenArgs = rewriteUpgradeArgs(packageJson, argv);

  const result = spawnSync('yarn', ['up', ...rewrittenArgs], {
    cwd: manifestDir,
    shell: process.platform === 'win32',
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(`reviewable-upgrade: ${result.error.message}`);
    return 1;
  }

  return result.status ?? 1;
}
