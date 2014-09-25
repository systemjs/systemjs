import {c} from './es6-circular2';
export var q;
export var r;
export function p() {
  if (q)
    r = c;
  else
    q = c;
}
p();
