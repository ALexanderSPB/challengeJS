function renderBarcode(cloneInfo, element = {}) {
    const sex = cloneInfo.sex === 'female' ? 0 : 1;
    const id = Array.prototype.map.call(cloneInfo.id, elem => elem.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    const name = Array.prototype.map.call(cloneInfo.name.padEnd(26, ' '), elem => elem.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    let binaryData = sex + id + name;
    console.log(binaryData.length)
    
    const controlSumArr = [];
    for (let i = 0; i < 17; i++) {
        let sum = 0;
        for (let j = 0; j < 17; j++) {
            sum += parseInt(binaryData[i + j * 17]);
        }
        binaryData += sum % 2;
    }
    binaryData += controlSumArr.join('');
    console.log(controlSumArr);

    element.style.display = 'flex';
    const contentId = 'content' + Math.random();
    element.innerHTML = `
        <style>
            .barcode {
                border: 3px solid black;
                box-sizing: border-box;
                width: 148px;
                height: 156px;
            }

            .content {
                margin-top: 3px;
                margin-left: 3px;
                width: 136px;
                height: 144px;
                display: flex;
                flex-wrap: wrap;
            }

            .content__bit {
                width: 8px;
                height: 8px;
            }

            .content__bit_one {
                background: black;
            }
            .content__bit_zero {
                background: white;
            }
        </style>
        <div class="content" id="${contentId}"></div>
    `
    element.classList.add('barcode');
    const contentDiv = document.getElementById(contentId)
    binaryData
        .split('')
        .forEach(element => {
            const bitDiv = document.createElement('div');
            const cssClass = (element === '0') ? 'content__bit_zero' : 'content__bit_one';
            bitDiv.classList.add('content__bit', cssClass)
            contentDiv.appendChild(bitDiv)
        });

}

const input = {
    "sex": "female",
    "id": "0owrgqqwfw",
    "name": "Dazdraperma Petrovna"
};
const input2 = {
    "sex": "male",
    "id": "c5j818dyo5",
    "name": "Oleg Vladimirovich"
}
renderBarcode(input, document.getElementById('testDiv'))
renderBarcode(input2, document.getElementById('testDiv2'))