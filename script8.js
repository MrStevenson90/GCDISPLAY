document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loadButton').addEventListener('click', function() {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (file) {
            Papa.parse(file, {
                complete: function(results) {
                    processKicks(results.data);
                },
                header: true, // Assuming the CSV has headers
                skipEmptyLines: true
            });
        } else {
            alert('Please select a CSV file first.');
        }
    });
});

function processKicks(csvData) {
    // Check that all required columns are present
    const requiredColumns = ['Team', 'Action', 'Type'];
    const missingColumns = requiredColumns.filter(col => !csvData[0].hasOwnProperty(col));
    
    if (missingColumns.length > 0) {
        console.error(`Missing required columns in CSV: ${missingColumns.join(', ')}`);
        alert(`Error: Missing columns - ${missingColumns.join(', ')}`);
        return;
    }

    // Filter data for kicks
    const kickData = csvData.filter(row => row.Action === 'Kick');

    // Calculate kicks and types for each team
    const teamKickStats = {};

    kickData.forEach(row => {
        const team = row.Team;
        const type = row.Type;

        if (!teamKickStats[team]) {
            teamKickStats[team] = { total: 0, drop: 0, bomb: 0, off: 0, grubber: 0, out: 0, cross: 0, clearing: 0 };
        }

        teamKickStats[team].total += 1;
        if (teamKickStats[team].hasOwnProperty(type.toLowerCase())) {
            teamKickStats[team][type.toLowerCase()] += 1;
        } else {
            console.warn(`Unknown kick type: ${type} for team ${team}`);
        }
    });

    // Create HTML output for each team in columns
    const container = document.getElementById('display8');
    container.innerHTML = '<h2>KICKS</h2>'; // Reset the container and add a title
    const teamContainer = document.createElement('div');
    teamContainer.className = 'team-container';

    Object.entries(teamKickStats).sort((a, b) => b[1].total - a[1].total).forEach(([team, stats]) => {
        const teamColumn = document.createElement('div');
        teamColumn.className = 'team-column';
        teamColumn.innerHTML = `
            <h3>${team}</h3>
            <table>
                <tr><th>Type</th><th>Count</th><th>Percentage</th></tr>
                ${Object.entries(stats).map(([type, count]) => `
                    <tr>
                        <td>${type.charAt(0).toUpperCase() + type.slice(1)}</td>
                        <td>${count}</td>
                        <td>${((count / stats.total) * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </table>
        `;
        teamContainer.appendChild(teamColumn);
    });

    container.appendChild(teamContainer);
}