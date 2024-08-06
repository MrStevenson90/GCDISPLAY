document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processData(results.data);
                    processErrorsAndPenalties(results.data); // Add this line
                }
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function determineTeamOrder(csvData) {
    const teams = [...new Set(csvData.map(row => row.Team))];
    if (teams.length < 2) {
        console.error("There are not enough teams in the data to establish a consistent order.");
        return teams;
    }
    return teams.slice(0, 2); // Return the first two teams as Team 1 and Team 2
}


function processData(csvData) {
    const teamOrder = determineTeamOrder(csvData);
    const headers = csvData[0];
    const timeIndex = headers.indexOf('Time');
    const teamIndex = headers.indexOf('Team');
    const playerIndex = headers.indexOf('Player');
    const actionIndex = headers.indexOf('Action');
    const pointsAddedIndex = headers.indexOf('Points Added');

    const scoreData = csvData.slice(1).filter(row => {
        const action = row[actionIndex];
        return ['Try', 'Conversion', 'Penalty Try', 'Penalty Goal', 'Field Goal'].includes(action);
    }).map(row => ({
        time: row[timeIndex],
        team: row[teamIndex],
        player: row[playerIndex] || 'Unknown Player',
        action: row[actionIndex],
        points: parseInt(row[pointsAddedIndex]) || 0
    }));

    scoreData.sort((a, b) => parseTime(a.time) - parseTime(b.time));

    const teams = [...new Set(scoreData.map(item => item.team))];
    const teamColors = ['#1f77b4', '#ff7f0e']; // Custom colors for teams

    const timelineData = [{
        x: scoreData.map(event => event.time),
        y: scoreData.map(event => event.team),
        mode: 'markers', // Only markers, no text
        marker: { 
            size: 14, 
            color: scoreData.map(event => teamColors[teams.indexOf(event.team)]),
            symbol: 'circle',
            line: {
                color: 'black',
                width: 1.5
            }
        },
        hoverinfo: 'text', // Show text on hover
        hovertext: scoreData.map(event => 
            `${event.action}<br>${event.player}<br>${event.points} pts` // Include action, player, and points
        ),
        hoverlabel: {
            bgcolor: scoreData.map(event => teamColors[teams.indexOf(event.team)]),
            bordercolor: 'white',
            font: { color: 'white' }
        }
    }];
    

    const layout = {
        title: {
            text: 'SCORING TIMELINE',
            font: {
                size: 30,
                family: 'Roboto, sans-serif',
                color: '#4a90e2'
            },
            x: 0.5, // Centers the title horizontally
            xanchor: 'center'
        },
        xaxis: {
            title: 'Time',
            showgrid: true,
            zeroline: false,
            tickmode: 'array',
            tickvals: scoreData.map(event => event.time), // Time values for ticks
            ticktext: scoreData.map(event => event.time), // Display text for ticks
            tickangle: -45, // Rotate tick labels
            tickfont: {
                size: 12,
                color: '#333'
            }
        },
        yaxis: {
            title: 'Teams',
            showgrid: false,
            zeroline: false,
            tickmode: 'array',
            tickvals: teams, // Team names as tick values
            ticktext: teams, // Display text for team ticks
            tickfont: {
                size: 16,
                color: '#333'
            }
        },
        font: {
            family: 'Roboto, sans-serif',
            color: '#3a3a3a'
        },
        paper_bgcolor: '#f0f4f8',
        plot_bgcolor: '#ffffff',
        margin: {
            l: 100, // Left margin
            r: 50,  // Right margin
            t: 100, // Top margin
            b: 100  // Bottom margin
        },
        height: 400,
        showlegend: false,
        annotations: scoreData.map((event, index) => ({
            x: event.time,
            y: event.team,
            text: '', // No text displayed initially
            showarrow: false,
            hovertext: `${event.team}: ${event.points} points`, // Display on hover
            hoverinfo: 'text', // Enable hover text display
            font: {
                size: 16,
                color: 'white'
            },
            bgcolor: teamColors[teams.indexOf(event.team)],
            bordercolor: 'white',
            borderwidth: 1,
            borderpad: 3,
            opacity: 0.9
        }))
    };
    
    // Add hovermode to the layout to enhance hover interaction
    layout.hovermode = 'closest'; // Ensures only the closest point's info is displayed
    
    
    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('scoreDisplay', timelineData, layout, config);

    let cumulativeScores = teams.reduce((acc, team) => ({ ...acc, [team]: 0 }), {});
    const scoreProgression = scoreData.map(event => {
        cumulativeScores[event.team] += event.points;
        return {
            time: event.time,
            [teams[0]]: cumulativeScores[teams[0]],
            [teams[1]]: cumulativeScores[teams[1]]
        };
    });

    const cumulativeScoreData = teams.map((team, index) => ({
        x: scoreProgression.map(score => score.time),
        y: scoreProgression.map(score => score[team]),
        type: 'scatter',
        mode: 'lines+markers',
        name: team,
        line: {
            color: teamColors[index],
            width: 4
        },
        marker: {
            size: 10,
            color: teamColors[index],
            line: {
                color: 'black',
                width: 1.5
            }
        }
    }));

    const cumulativeScoreLayout = {
        title: {
            text: 'SCORE PROGRESSION',
            font: { 
                size: 28,
                family: 'Roboto, sans-serif',
                color: '#4a90e2'
            },
            x: 0.5,
            xanchor: 'center'
        },
        xaxis: {
            title: 'Time',
            showgrid: true,
            zeroline: false,
            tickmode: 'array',
            tickvals: scoreData.map(event => event.time),
            ticktext: scoreData.map(event => event.time),
            tickangle: -45,
            tickfont: {
                size: 12,
                color: '#333'
            }
        },
        yaxis: {
            title: 'Cumulative Score',
            showgrid: true,
            zeroline: true,
            zerolinecolor: '#e5e5e5',
            zerolinewidth: 2,
            tickfont: {
                size: 12,
                color: '#333'
            }
        },
        font: { 
            family: 'Roboto, sans-serif',
            color: '#3a3a3a' 
        },
        paper_bgcolor: '#f0f4f8',
        plot_bgcolor: '#ffffff',
        margin: { l: 50, r: 50, t: 100, b: 100 },
        height: 400,
        legend: {
            x: 0.1,
            y: 1.1,
            traceorder: 'normal',
            font: {
                family: 'Roboto, sans-serif',
                size: 12,
                color: '#3a3a3a'
            },
            bgcolor: '#ffffff',
            bordercolor: '#d3d3d3',
            borderwidth: 1
        }
    };

    Plotly.newPlot('textDisplay', cumulativeScoreData, cumulativeScoreLayout, config);
}

function processErrorsAndPenalties(csvData) {
    const headers = csvData[0];
    const teamIndex = headers.indexOf('Team');
    const actionIndex = headers.indexOf('Action');

    // Filter data for errors and penalties
    const errorPenaltyData = csvData.slice(1).filter(row => {
        const action = row[actionIndex];
        return ['Error', 'Penalty'].includes(action);
    });

    // Aggregate data by team
    const teamTotals = {};
    errorPenaltyData.forEach(row => {
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
        marker: {
            color: '#ff7f0e'
        }
    }];

    const layout = {
        title: {
            text: 'Errors and Penalties by Team',
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
            title: 'Total Errors and Penalties',
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
}

function parseTime(timeString) {
    const [minutes, seconds] = timeString.split(':').map(Number);
    return minutes * 60 + seconds;
}
