// Original file: https://github.com/chromaui/chromatic-cli/blob/a5cb862/bin/storybook/start-app.js

import { spawn } from 'cross-spawn';
import https from 'https';
import fetch from 'node-fetch';
import path from 'path';

import { getLogger } from '../util/logger';

const POLL_INTERVAL = 1000,
const TIMEOUT = 5 * 60 * 1000,
const PROMPT_TIMEOUT = 20 * 1000,

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

export async function checkResponse(url) {
  try {
    const response = await fetch(url, { agent: url.startsWith('https:') ? httpsAgent : undefined });
    return response.ok;
  } catch (e) {
    return false;
  }
}

async function waitForResponse(child, url) {
  const logger = getLogger();

  logger.info("Waiting Storybook to start…");

  const timeoutAt = Date.now() + TIMEOUT;
  let promptAt = Date.now() + PROMPT_TIMEOUT;

  return new Promise((resolve, reject) => {
    let resolved = false;
    async function check() {
      if (Date.now() > timeoutAt) {
        resolved = true;
        reject(
          new Error(`No server responding at ${url} within ${TIMEOUT / 1000} seconds.`)
        );
        return;
      }

      if (Date.now() > promptAt) {
        logger.warn(`No server responding at ${url}, waiting for Storybook to start…`);
        promptAt = Date.now() + PROMPT_TIMEOUT;
      }

      if (await checkResponse(url)) {
        resolved = true;
        resolve();
        return;
      }
      setTimeout(check, POLL_INTERVAL);
    }
    check();

    if (child) {
      let storybookOutput = '';
      child.stderr.on('data', e => {
        logger.debug(`storybook - [sterr] - ${e.toString()}`);
        storybookOutput += e.toString();
      });
      child.stdout.on('data', o => {
        logger.debug(`storybook - [stdout] - ${o.toString()}`);
        storybookOutput += o.toString();
      });

      child.on('close', () => {
        if (!resolved) {
          reject(new Error(`Storybook script to start: ${storybookOutput}\n`));
        }
      });
    }
  });
}

export async function startApp({ scriptName, commandName, args, url, inheritStdio }) {
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    BROWSER: 'none',
  };

  let child;
  if (scriptName) {
    if (await checkResponse(url)) {
      // We assume the process that is already running on the url is indeed our Storybook
      return null;
    }

    // This technique lifted from https://github.com/mysticatea/npm-run-all/blob/52eaf86242ba408dedd015f53ca7ca368f25a026/lib/run-task.js#L156-L174
    const npmPath = process.env.npm_execpath
      // Replace npx-cli.js with npm-cli.js
      // hacky but resolves the problem until we can refactor this file
      // https://github.com/zeplin/cli-connect-storybook-plugin/issues/38
      .replace("npx-cli.js", "npm-cli.js");

    const npmPathIsJs = typeof npmPath === 'string' && /\.m?js/.test(path.extname(npmPath));
    const isYarn = typeof npmPath === 'string' && /^yarn(\.js)?$/.test(path.basename(npmPath));
    const execPath = npmPathIsJs ? process.execPath : npmPath || 'npm';

    const params = [
      ...(npmPathIsJs ? [npmPath] : []),
      'run',
      scriptName,
      ...(isYarn ? [] : ["--"]),
      ...args
    ];

    getLogger().debug(`Running script: ${execPath} ${params.join(" ")}`);

    // Run either:
    //   npm/yarn run scriptName (depending on npm_execpath)
    //   node path/to/npm.js run scriptName (if npm run via node)
    child = spawn(execPath, params, {
      env,
      cwd: process.cwd(),
      ...(inheritStdio && { stdio: 'inherit' }),
    });
  } else {
    if (!commandName) {
      throw new Error('You must pass commandName or scriptName');
    }
    getLogger().debug(`Running command: ${commandName}`);
    child = spawn(commandName, { env, shell: true });
  }

  if (url) {
    await waitForResponse(child, url);
  }

  return child;
}
