const input = `
<table>
    
    <thead>
        <tr>
            <td>Command         </td>
            <td>Description     </td>
            <th>Is implemented  </th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <th>git status</th>
            <td>List all new or modified    files</td>
            <th>Yes</th>
        </tr>
        <tr>
            <th>git diff</th>
            <td>Show file differences that haven't been staged</td>
            <td>No</td>
        </tr>
    </tbody>
</table>
`;

function solution(input) {
    const div = document.createElement('div');
    div.innerHTML = input;
    const table = div.firstElementChild;
    const alignments = [];
    const defaultAlign = 'left';
    const rows = [];
    const processColgroup = (colgroup) => {
        alignments.push(...Array(...colgroup.children).map(col => {
            return col.align || defaultAlign
        }));
    }
    const processThead = (thead) => { 
        rows.push(...Array(...thead.children).map(processTr));
    }
    const processTbody = (tbody) => { 
        rows.push(...Array(...tbody.children).map(processTr));
    }
    const processTr = (tr) => {
        return Array(...tr.children).map(processCell);
    }
    const processCell = (cell) => {
        const tag = cell.tagName.toLowerCase();
        const content = clearString(cell.innerHTML);

        return {
            'td': content,
            'th': `**${content}**`
        }[tag]
    }

    const clearLineBreaks = (str) => str.replace(/\r?\n|\r/g, '')
    const clearSpaces = (str) => str.replace(/\s+/g, ' ');
    const clearString = (str) => clearSpaces(clearLineBreaks(str)).trim();


    const processors = {
        'thead': processThead,
        'tbody': processTbody,
        'colgroup': processColgroup
    };

    for (let child of table.children) {
        processors[child.tagName.toLowerCase()](child)
    }

    const updateAllignments = () => {
        if (alignments.length > 0) return;
        alignments.push(...Array(rows[0].length).fill(defaultAlign))
    };

    updateAllignments();

    const allignmentsContent = alignments.map(align => {
        return {
            'left': ' :--- ',
            'center': ' :---: ',
            'right': ' ---: '
        }[align]
    });
    const delimeter = `|${allignmentsContent.join('|')}|`

    const lineEnd = '\n';
    let markdown = '';
    console.log(rows);
    rows.forEach((row, i) => {
        if (i > 0) {
            markdown += lineEnd
        }
        const mdRow = `| ${row.join(' | ')} |`;
        markdown += mdRow;

        if (i === 0) {
            markdown += lineEnd;
            markdown += delimeter;
        }
    })
    console.log(markdown);

}

solution(input);