interface System {
  import(name: string): any;
  defined: any;
  amdDefine: () => void;
  amdRequire: () => void;
  baseURL: string;
  paths: { [key: string]: string };
  meta: { [key: string]: Object };
  config: any;
}

declare var System: System;

declare module "systemjs" {
  export = System;
}
