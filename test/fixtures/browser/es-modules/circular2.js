import {fn1, variable1} from './circular1.js';

export var variable2 = 'test circular 2';

export { output as output1, output2 } from './circular1.js';

export var output;

fn1();

export function fn2() {
  output = variable1;
}
