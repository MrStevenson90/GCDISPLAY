document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processPenalties(results.data);
                }
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function processPenalties(csvData) {
    const teamOrder = determineTeamOrder(csvData);
    const headers = csvData[0];
    const teamIndex = headers.indexOf('Team');
    const actionIndex = headers.indexOf('Action');

    // Filter data for penalties
    const penaltyData = csvData.slice(1).filter(row => row[actionIndex] === 'Penalty');

    // Aggregate data by team
    const teamTotals = {};
    penaltyData.forEach(row => {
        const team = row[teamIndex];
        if (!teamTotals[team]) {
            teamTotals[team] = 0;
        }
        teamTotals[team] += 1;
    });

    const teams = Object.keys(teamTotals);
    const totals = Object.values(teamTotals);

    // Create Plotly data and layout
    const plotData = [{
        x: teams,
        y: totals,
        type: 'bar',
        text: totals.map(String),
        textposition: 'auto',
        marker: {
            color: '#1f77b4'
        }
    }];

    const layout = {
        title: {
            text: 'PENALTIES BY TEAM',
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
            title: 'Total Penalties',
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

    Plotly.newPlot('display4', plotData, layout, config);
}
