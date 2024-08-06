document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processTotalRucks(results.data);
                }
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function processTotalRucks(csvData) {
    const teamOrder = determineTeamOrder(csvData);
    const headers = csvData[0];
    const teamIndex = headers.indexOf('Team');
    const actionIndex = headers.indexOf('Action');

    // Filter data for rucks
    const ruckData = csvData.slice(1).filter(row => row[actionIndex] === 'Ruck');

    // Aggregate total rucks by team
    const teamRuckTotals = {};

    ruckData.forEach(row => {
        const team = row[teamIndex];
        if (!teamRuckTotals[team]) {
            teamRuckTotals[team] = 0;
        }
        teamRuckTotals[team] += 1;
    });

    const teams = Object.keys(teamRuckTotals);
    const totalRucks = Object.values(teamRuckTotals);

    // Create Plotly data and layout
    const plotData = [{
        x: teams,
        y: totalRucks,
        type: 'bar',
        text: totalRucks.map(String),
        textposition: 'auto',
        marker: {
            color: '#ff7f0e'
        }
    }];

    const layout = {
        title: {
            text: 'TOTAL RUCKS BY TEAM',
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
            title: 'Total Rucks',
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

    Plotly.newPlot('display5', plotData, layout, config);
}
