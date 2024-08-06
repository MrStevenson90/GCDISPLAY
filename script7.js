document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processTotalLineouts(results.data);
                }
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function processTotalLineouts(csvData) {
    const headers = csvData[0];
    const teamIndex = headers.indexOf('Team');
    const actionIndex = headers.indexOf('Action');
    const typeIndex = headers.indexOf('Type');

    // Extract all team names from the data
    const allTeams = new Set(csvData.slice(1).map(row => row[teamIndex]));

    // Filter data for lineouts
    const lineoutData = csvData.slice(1).filter(row => row[actionIndex] === 'Lineout');

    // Aggregate lineout data by team
    const teamLineoutData = {};

    allTeams.forEach(team => {
        teamLineoutData[team] = { total: 0, won: 0 };
    });

    lineoutData.forEach(row => {
        const team = row[teamIndex];
        const outcome = row[typeIndex];
        
        teamLineoutData[team].total += 1;
        if (outcome === 'WON') {
            teamLineoutData[team].won += 1;
        }
    });

    const teams = Array.from(allTeams);
    const totalLineouts = teams.map(team => teamLineoutData[team].total);
    const wonLineouts = teams.map(team => teamLineoutData[team].won);

    // Create Plotly data for stacked bar chart
    const plotData = [
        {
            x: teams,
            y: wonLineouts,
            type: 'bar',
            name: 'Won Lineouts',
            text: wonLineouts.map(String),
            textposition: 'auto',
            marker: { color: '#2ecc71' }
        },
        {
            x: teams,
            y: totalLineouts.map((total, i) => total - wonLineouts[i]),
            type: 'bar',
            name: 'Lost Lineouts',
            text: totalLineouts.map((total, i) => (total - wonLineouts[i]).toString()),
            textposition: 'auto',
            marker: { color: '#e74c3c' }
        }
    ];

    const layout = {
        title: {
            text: 'LINEOUT PERFORMANCE BY TEAM',
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
            title: 'Number of Lineouts',
            tickfont: {
                size: 14,
                color: '#333'
            }
        },
        barmode: 'stack',
        font: { 
            family: 'Roboto, sans-serif',
            color: '#3a3a3a' 
        },
        paper_bgcolor: '#f0f4f8',
        plot_bgcolor: '#ffffff',
        margin: { l: 50, r: 50, t: 100, b: 50 },
        height: 400,
        legend: {
            x: 1,
            y: 1,
            bgcolor: '#f0f4f8',
            bordercolor: '#ccc',
            borderwidth: 1
        }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('display7', plotData, layout, config);
}
