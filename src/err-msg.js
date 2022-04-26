export function errMsg(errCode, msg) {
  if (process.env.SYSTEM_PRODUCTION)
    return (msg || "") + " (SystemJS https://github.com/systemjs/systemjs/blob/main/docs/errors.md#" + errCode + ")";
  else
    return (msg || "") + " (SystemJS Error#" + errCode + " " + "https://github.com/systemjs/systemjs/blob/main/docs/errors.md#" + errCode + ")";
}