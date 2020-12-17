// eslint-disable-next-line import/named
import { Logger } from "@zeplin/cli";

let loggerInstance: Logger;

const getLogger = (): Logger | undefined => loggerInstance;
const setLogger = (logger: Logger): void => {
    loggerInstance = logger;
};

export { getLogger, setLogger };
