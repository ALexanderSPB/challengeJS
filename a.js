const input = [1, 2, 3, 4, 5];
const input2 = [2, 7, 4, 1, 8, 1];

function solve(input) {
  const arr = input;
  console.log("qwe");
  while (arr.length > 1) {
    let m0 = arr[0];
    let m1 = arr[1];
    let mid0 = 0;
    let mid1 = 1;
    for (let i = 1; i < arr.length; i++) {
      if (m0 > m1) {
        if (arr[i] > m0) {
          m1 = m0;
          mid1 = mid0;
          m0 = arr[i];
          mid0 = i;
        } else if (arr[i] > m1) {
          m1 = arr[i];
          mid1 = i;
        }
      } else {
        if (arr[i] > m1) {
          m0 = m1;
          mid0 = mid1;
          m1 = arr[i];
          mid1 = i;
        } else if (arr[i] > m0) {
          m0 = arr[i];
          mid0 = i;
        }
      }
    }
    console.log(mid0, mid1, m0, m1);
    if (m0 > m1) {
      [m0, m1, mid0, mid1] = [m1, m0, mid1, mid0];
    }
    console.log(mid0, mid1, m0, m1);
    const diff = m1 - m0;
    if (diff === 0) {
      arr.splice(mid0, 1);
      arr.splice(mid1, 1);
    } else {
      arr[mid1] = diff;
      arr.splice(mid0, 1);
    }
    console.log(arr);
  }
  const result = arr.length === 0 ? -1 : arr[0];
  console.log(result);
}

solve(input2);
