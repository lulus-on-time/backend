const set: Set<number> = new Set();

let num1 = 89;
let num2 = 144;

set.add(num1)
set.add(num2)

for (let i = 0; i < 100; i++) {
  const temp = num1;
  num1 = num2;
  num2 = num2 + temp;
  set.add(num2);
}

export default set;