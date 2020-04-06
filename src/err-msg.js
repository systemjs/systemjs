export function errMsg(errCode, msg) {
  if (DEV)
    return (
      (msg || "") +
      " (SystemJS Error#" +
      errCode +
      " " +
      "https://git.io/JvFET#" +
      errCode +
      ")"
    );
  else return (msg || "") + " (SystemJS https://git.io/JvFET#" + errCode + ")";
}
