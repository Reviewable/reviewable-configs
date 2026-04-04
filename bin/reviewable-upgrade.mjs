#!/usr/bin/env node

// Workaround for https://github.com/yarnpkg/berry/issues/1492

import {runUpgrade} from '../lib/reviewable-upgrade.js';

process.exit(runUpgrade());
