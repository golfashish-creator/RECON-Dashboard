let selectedColumns = [];
let headers = [];
let filesData = [];

document.getElementById('fileInput').addEventListener('change', handleFiles);
document.getElementById('compileBtn').addEventListener('click', compileCSV);

function handleFiles(event) {
    const files = event.target.files;
    filesData = [];

    if (files.length === 0) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        headers = lines[0].split(',');
        displayColumnSelector(headers);
    };

    reader.readAsText(files[0]);

    // Store all file data
    Array.from(files).forEach(file => {
        const r = new FileReader();
        r.onload = e => {
            filesData.push(e.target.result);
        };
        r.readAsText(file);
    });
}

function displayColumnSelector(headers) {
    const container = document.getElementById('columnSelector');
    container.innerHTML = "<h3>Select Columns:</h3>";

    headers.forEach((header, index) => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = index;
        checkbox.id = "col" + index;

        checkbox.addEventListener('change', function() {
            if (this.checked) {
                selectedColumns.push(parseInt(this.value));
            } else {
                selectedColumns = selectedColumns.filter(c => c !== parseInt(this.value));
            }
            document.getElementById('compileBtn').disabled = selectedColumns.length === 0;
        });

        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.innerText = header;

        container.appendChild(checkbox);
        container.appendChild(label);
        container.appendChild(document.createElement('br'));
    });
}

function compileCSV() {
    let compiled = [];

    filesData.forEach(data => {
        const lines = data.split('\n').map(l => l.trim()).filter(l => l);
        lines.slice(1).forEach(line => {
            const cols = line.split(',');
            const selected = selectedColumns.map(i => cols[i] || "");
            compiled.push(selected.join(','));
        });
    });

    const headerRow = selectedColumns.map(i => headers[i]).join(',');
    const finalCSV = headerRow + '\n' + compiled.join('\n');

    downloadCSV(finalCSV);
}

function downloadCSV(content) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = "compiled.csv";
    a.click();

    URL.revokeObjectURL(url);
}
