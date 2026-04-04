import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  findNearestPackageJson,
  normalizeGitHubRange,
  rewriteUpgradeArgs,
  splitDescriptor
} from '../lib/reviewable-upgrade.js';

test('splitDescriptor handles unscoped and scoped descriptors', () => {
  assert.deepEqual(splitDescriptor('lodash'), {ident: 'lodash', range: null});
  assert.deepEqual(splitDescriptor('lodash@1.2.3'), {ident: 'lodash', range: '1.2.3'});
  assert.deepEqual(splitDescriptor('@types/node'), {ident: '@types/node', range: null});
  assert.deepEqual(splitDescriptor('@types/node@20.12.7'), {ident: '@types/node', range: '20.12.7'});
});

test('normalizeGitHubRange handles shorthand, github protocol, and github urls', () => {
  assert.equal(
    normalizeGitHubRange('Reviewable/reviewable-configs'),
    'github:Reviewable/reviewable-configs'
  );
  assert.equal(
    normalizeGitHubRange('reviewable/sentencesimilarity#master'),
    'github:reviewable/sentencesimilarity#master'
  );
  assert.equal(
    normalizeGitHubRange('github:Reviewable/diff-objects#master'),
    'github:Reviewable/diff-objects#master'
  );
  assert.equal(
    normalizeGitHubRange('https://github.com/Reviewable/reviewable-configs.git#main'),
    'github:Reviewable/reviewable-configs#main'
  );
  assert.equal(
    normalizeGitHubRange('git@github.com:Reviewable/reviewable-configs.git#main'),
    'github:Reviewable/reviewable-configs#main'
  );
  assert.equal(normalizeGitHubRange('file:../reviewable-configs'), null);
});

test('rewriteUpgradeArgs rewrites github-backed dependencies and preserves other args', () => {
  const packageJson = {
    dependencies: {
      'diff-objects': 'Reviewable/diff-objects#master',
      lodash: '^4.17.21'
    },
    devDependencies: {
      'reviewable-configs': 'github:Reviewable/reviewable-configs',
      '@types/node': '^20.12.7'
    },
    optionalDependencies: {
      jquery: 'reviewable/jquery#2.1.3-custom'
    }
  };

  assert.deepEqual(
    rewriteUpgradeArgs(packageJson, [
      'reviewable-configs',
      'diff-objects',
      'lodash',
      '@types/node',
      'jquery',
      '@babel/*',
      'reviewable-configs@github:Reviewable/reviewable-configs',
      '--mode=update-lockfile',
      '-i'
    ]),
    [
      'reviewable-configs@github:Reviewable/reviewable-configs',
      'diff-objects@github:Reviewable/diff-objects#master',
      'lodash',
      '@types/node',
      'jquery@github:reviewable/jquery#2.1.3-custom',
      '@babel/*',
      'reviewable-configs@github:Reviewable/reviewable-configs',
      '--mode=update-lockfile',
      '-i'
    ]
  );
});

test('findNearestPackageJson walks up the directory tree', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'reviewable-upgrade-'));
  try {
    writeFileSync(path.join(tempRoot, 'package.json'), '{"name":"root"}');
    const nestedDir = path.join(tempRoot, 'a', 'b', 'c');
    mkdirSync(nestedDir, {recursive: true});

    assert.equal(findNearestPackageJson(nestedDir), path.join(tempRoot, 'package.json'));
  } finally {
    rmSync(tempRoot, {recursive: true, force: true});
  }
});

test('findNearestPackageJson returns null when no manifest exists', () => {
  const tempRoot = mkdtempSync(path.join(tmpdir(), 'reviewable-upgrade-empty-'));
  try {
    const nestedDir = path.join(tempRoot, 'a', 'b');
    mkdirSync(nestedDir, {recursive: true});

    assert.equal(findNearestPackageJson(nestedDir), null);
  } finally {
    rmSync(tempRoot, {recursive: true, force: true});
  }
});
