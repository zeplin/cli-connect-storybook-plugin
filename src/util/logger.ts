// eslint-disable-next-line import/named
import { Logger } from "@zeplin/cli";

let loggerInstance: Logger = {
    error: console.error,
    info: console.info,
    warn: console.warn,
    debug: console.debug
};

const getLogger = (): Logger => loggerInstance;
const setLogger = (logger?: Logger): void => {
    if (logger) {
        loggerInstance = logger;
    }
};

export { getLogger, setLogger };
