document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processTotalScrums(results.data);
                }
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function processTotalScrums(csvData) {
    const headers = csvData[0];
    const teamIndex = headers.indexOf('Team');
    const actionIndex = headers.indexOf('Action');
    const typeIndex = headers.indexOf('Type');

    // Filter data for scrums
    const scrumData = csvData.slice(1).filter(row => row[actionIndex] === 'Scrum');

    // Aggregate scrum data by team
    const teamScrumData = {};

    scrumData.forEach(row => {
        const team = row[teamIndex];
        const outcome = row[typeIndex];
        
        if (!teamScrumData[team]) {
            teamScrumData[team] = { total: 0, won: 0 };
        }
        
        teamScrumData[team].total += 1;
        if (outcome === 'WON') {
            teamScrumData[team].won += 1;
        }
    });

    const teams = Object.keys(teamScrumData);
    const totalScrums = teams.map(team => teamScrumData[team].total);
    const wonScrums = teams.map(team => teamScrumData[team].won);

    // Create Plotly data for stacked bar chart
    const plotData = [
        {
            x: teams,
            y: wonScrums,
            type: 'bar',
            name: 'Won Scrums',
            text: wonScrums.map(String),
            textposition: 'auto',
            marker: { color: '#2ecc71' }
        },
        {
            x: teams,
            y: totalScrums.map((total, i) => total - wonScrums[i]),
            type: 'bar',
            name: 'Lost Scrums',
            text: totalScrums.map((total, i) => (total - wonScrums[i]).toString()),
            textposition: 'auto',
            marker: { color: '#e74c3c' }
        }
    ];

    const layout = {
        title: {
            text: 'SCRUM PERFORMANCE BY TEAM',
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
            title: 'Number of Scrums',
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

    Plotly.newPlot('display6', plotData, layout, config);
}