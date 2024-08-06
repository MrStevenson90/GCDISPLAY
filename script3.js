document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processErrors(results.data);
                },
                header: true,
                skipEmptyLines: true
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function processErrors(csvData) {
    // Ensure that all required columns are present
    const requiredColumns = ['Team', 'Action'];
    const missingColumns = requiredColumns.filter(col => !csvData[0].hasOwnProperty(col));
    
    if (missingColumns.length > 0) {
        console.error(`Missing required columns in CSV: ${missingColumns.join(', ')}`);
        alert(`Error: Missing columns - ${missingColumns.join(', ')}`);
        return;
    }

    // Get all unique team names
    const allTeams = [...new Set(csvData.map(row => row.Team))];

    // Initialize error counts for all teams to zero
    const teamTotals = allTeams.reduce((acc, team) => {
        acc[team] = 0;
        return acc;
    }, {});

    // Filter data to only include rows where Action is 'Error'
    const errorData = csvData.filter(row => row.Action === 'Error');

    // Aggregate errors by team
    errorData.forEach(row => {
        teamTotals[row.Team] += 1;
    });

    const teams = Object.keys(teamTotals);
    const totals = Object.values(teamTotals);

    // Create Plotly data and layout for errors by team
    const plotData = [{
        x: teams,
        y: totals,
        type: 'bar',
        text: totals.map(String),
        textposition: 'auto',
        marker: {
            color: '#ff7f0e'
        }
    }];

    const layout = {
        title: {
            text: 'ERRORS BY TEAM',
            font: { 
                size: 24,
                family: 'Roboto, sans-serif',
                color: '#4a90e2'
            },
            x: 0.5,
            xanchor: 'center'
        },
        xaxis: {
            title: 'Team',
            tickfont: {
                size: 14,
                color: '#333'
            }
        },
        yaxis: {
            title: 'Total Errors',
            tickfont: {
                size: 14,
                color: '#333'
            }
        },
        font: { 
            family: 'Roboto, sans-serif',
            color: '#3a3a3a' 
        },
        paper_bgcolor: '#f0f4f8',
        plot_bgcolor: '#ffffff',
        margin: { l: 50, r: 50, t: 100, b: 50 },
        height: 400
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('display3', plotData, layout, config);

    // Create a table with detailed stats for errors by team
    createStatsTable(teamTotals);
}

function createStatsTable(teamTotals) {
    const container = document.getElementById('display3');
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.marginTop = '20px';
    table.style.borderCollapse = 'collapse';

    // Create table header
    const headerRow = table.insertRow();
    ['Team', 'Total Errors'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        th.style.backgroundColor = '#4a90e2';
        th.style.color = 'white';
        th.style.padding = '10px';
        headerRow.appendChild(th);
    });

    // Add data rows
    Object.entries(teamTotals).forEach(([team, errors]) => {
        const row = table.insertRow();
        [team, errors].forEach(text => {
            const cell = row.insertCell();
            cell.textContent = text;
            cell.style.padding = '8px';
            cell.style.borderBottom = '1px solid #ddd';
        });
    });

    container.appendChild(table);
}
