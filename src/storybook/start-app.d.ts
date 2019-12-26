import { ChildProcess } from "child_process";

interface StartAppParams {
  scriptName: string;
  commandName: string;
  args: string[];
  url: string;
  inheritStdio: boolean;
}

export function checkResponse(url: string): Promise<boolean>;

export function startApp(params: StartAppParams): Promise<ChildProcess>;