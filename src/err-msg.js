export function errMsg(errCode, msg) {
  if (process.env.SYSTEM_PRODUCTION)
    return (msg || "") + " (SystemJS https://git.io/JvFET#" + errCode + ")";
  else
    return (msg || "") + " (SystemJS Error#" + errCode + " " + "https://git.io/JvFET#" + errCode + ")";
}