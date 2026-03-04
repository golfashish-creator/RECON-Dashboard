let filesData = [];

// Configuration for different file types
const fileConfigs = [
    {
        nameMatch: "Converse Tally Cancel GST Report_",
        columns: [1,2,3,4,5,6,7,8,11,12,17,24,25,27,29,45,47,56,61]
    },
    {
        nameMatch: "Tally Return GST Report_",
        columns: [0,1,3,5,6,7,8,11,12,17,24,25,27,29,51,56,62,63,64]
    }
];

document.getElementById('fileInput').addEventListener('change', handleFiles);

function handleFiles(event) {
    const files = event.target.files;
    filesData = [];

    let promises = [];

    Array.from(files).forEach(file => {

        const config = fileConfigs.find(cfg =>
            file.name.toLowerCase().includes(cfg.nameMatch.toLowerCase())
        );

        if (config) {

            const reader = new FileReader();

            const promise = new Promise(resolve => {
                reader.onload = e => resolve({
                    content: e.target.result,
                    config: config
                });
            });

            reader.readAsText(file);
            promises.push(promise);

        } else {
            console.log("Ignored file:", file.name);
        }
    });

    if (promises.length === 0) {
        alert("No matching files found.");
        return;
    }

    Promise.all(promises).then(results => {
        filesData = results;
        compileCSV();
    });
}

function compileCSV() {

    let compiledRows = [];
    let masterHeader = [];

    filesData.forEach(fileObj => {

        const parsed = Papa.parse(fileObj.content, {
            skipEmptyLines: true
        });

        const rows = parsed.data;
        const selectedColumns = fileObj.config.columns;

        // Extract this file's header
        const currentHeader = selectedColumns.map(i => rows[0][i] || "");

        // If master header is empty → set it
        if (masterHeader.length === 0) {
            masterHeader = [...currentHeader];
        } 
        // If this file has MORE columns → expand master header
        else if (currentHeader.length > masterHeader.length) {

            const extraCount = currentHeader.length - masterHeader.length;

            for (let i = 0; i < extraCount; i++) {
                masterHeader.push(currentHeader[masterHeader.length + i] || `Extra_Column_${i+1}`);
            }

            // Also expand old rows with empty cells
            compiledRows = compiledRows.map(row => {
                while (row.length < masterHeader.length) {
                    row.push("");
                }
                return row;
            });
        }

        // Now process data rows
        for (let r = 1; r < rows.length; r++) {

            let selectedRow = selectedColumns.map(i => rows[r][i] || "");

            // Pad this row if shorter than master header
            while (selectedRow.length < masterHeader.length) {
                selectedRow.push("");
            }

            compiledRows.push(selectedRow);
        }

    });

    // Convert to CSV
    const finalCSV =
        masterHeader.join(',') + '\n' +
        compiledRows.map(r => r.join(',')).join('\n');

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
