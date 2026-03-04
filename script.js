let filesData = [];

// Column indexes (0-based)
const selectedColumns = [
    1,2,3,4,5,6,7,8,  // B–I
    11,12,            // L,M
    17,               // R
    24,25,            // Y,Z
    27,               // AB
    29,               // AD
    45,               // AT
    47,               // AV
    56,               // BE
    61                // BJ
];

document.getElementById('fileInput').addEventListener('change', handleFiles);

function handleFiles(event) {
    const files = event.target.files;
    filesData = [];

    let promises = [];

    Array.from(files).forEach(file => {

        if (file.name.startsWith("Converse Tally Cancel GST Report_04032026190753")) {

            const reader = new FileReader();

            const promise = new Promise(resolve => {
                reader.onload = e => resolve(e.target.result);
            });

            reader.readAsText(file);
            promises.push(promise);
        }
    });

    if (promises.length === 0) {
        alert("No matching file found.");
        return;
    }

    Promise.all(promises).then(results => {
        filesData = results;
        compileCSV();
    });
}

function compileCSV() {
    let compiled = [];
    let headerRow = null;

    filesData.forEach(data => {
        const lines = data.split('\n').map(l => l.trim()).filter(l => l);

        if (!headerRow) {
            const headers = lines[0].split(',');
            headerRow = selectedColumns.map(i => headers[i]).join(',');
        }

        lines.slice(1).forEach(line => {
            const cols = line.split(',');
            const selected = selectedColumns.map(i => cols[i] || "");
            compiled.push(selected.join(','));
        });
    });

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
