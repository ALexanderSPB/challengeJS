const input1 = 'block_2321elemz3123elem3123elem';
const input2 = 'block_mod__elem';
const input3 = 'block_mod_mod__elem';
const input4 = 'block__elem_mod_mod';
function solve(input) {
    console.log(input);
    const regexp = /[a-z]+(?:([^a-z]+)[a-z]+(?:\1)?[a-z]+)([^a-z]+)[a-z]+(?:\2)?[a-z]+/;
    const [, elem, mod] = input.match(regexp);

    function countSubstr(str, substr) {
        const re = new RegExp('[a-z]' + substr + '[a-z]', 'g');
        return str.match(re).length;
    }

    if (countSubstr(input, elem).length === 2) {
        [mod, elem] = [elem, mod]
    };

    return { elem, mod }
}

console.log(solve(input1))
console.log(solve(input2))
console.log(solve(input3))
console.log(solve(input4))