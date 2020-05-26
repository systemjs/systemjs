import { odd } from './odd.js'

export var counter = 0;

setInterval(() => {
	console.log(counter);
}, 1000)
export function even(n) {
  counter++;
  return n == 0 || odd(n - 1);
}

odd(1);