// Original file: https://github.com/chromaui/chromatic-cli/blob/7d3a6ee/bin/tester/runtimes.js

/* eslint-disable no-useless-catch, no-console, no-underscore-dangle */
import { JSDOM, VirtualConsole, ResourceLoader } from 'jsdom';
import dedent from 'ts-dedent';
import { extract } from './extract';

import { addShimsToJSDOM } from './jsdom-shims';

const separator = '=========================';

export async function loadStoriesFromURL(url, { ignoreSSLErrors = false, failFastOnErrors = false }) {
  const warnings = [];
  const errors = [];
  const virtualConsole = new VirtualConsole();

  virtualConsole.on('error', l => {
    errors.push(l);
  });
  virtualConsole.on('warn', l => {
    warnings.push(l);
  });
  virtualConsole.on('jsdomError', l => {
    errors.push(l);
  });

  const resourceLoader = new ResourceLoader({
    userAgent: "Zeplin CLI",
    strictSSL: !ignoreSSLErrors
  });
  const dom = await JSDOM.fromURL(url, {
    userAgent: "Zeplin CLI",
    runScripts: 'dangerously', // We need to execute the scripts on the page
    virtualConsole,
    resources: resourceLoader,
    pretendToBeVisual: true, // Add a requestAnimationFrame polyfill, react@16 warns about it
    beforeParse(window) {
      addShimsToJSDOM(window);
    },
  });

  await new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('ContentLoadEvent timed out'));
    }, 60000);
    dom.window.addEventListener('DOMContentLoaded', () => {
      clearTimeout(timeoutId);
      resolve();
    });
  });

  // If the app logged something to console.error, it's probably, but not definitely an issue.
  // See https://github.com/hichroma/chromatic/issues/757
  if (errors.length || warnings.length) {
    console.log('The following problems were reported from your storybook:');

    if (errors.length) {
      console.log(
        errors.reduce(
          (acc, i) => dedent`
              ${acc}
              ${i}
              ${separator}
            `,
          dedent`
              Errors:
              ${separator}
            `
        )
      );
    }

    if (warnings.length) {
      console.log(
        warnings.reduce(
          (acc, i) => dedent`
              ${acc}
              ${i}
              ${separator}
            `,
          dedent`
              Warnings:
              ${separator}
            `
        )
      );
    }

    if (failFastOnErrors) {
      console.log("Fast fail is enabled. Aborting…");
      throw new Error("Storybook reported errors.");
    } else {
      console.log(dedent`
        This may lead to some stories not working right or getting detected by Zeplin CLI
        We suggest you fix the errors, but we will continue anyway..
        ${separator}
      `);
    }
  }

  try {
    const specs = await extract(dom.window);
    return specs;
  } catch (err) {
    throw err;
  } finally {
    // cleanup
    dom.window.close();
  }
}
