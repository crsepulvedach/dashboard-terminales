async function initDashboard() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        
        // Validar si la API devolvió error
        if (data.errorMessages) {
            throw new Error(data.errorMessages[0]);
        }

        const issues = data.issues || [];

        // Mapeo de datos de la API v3 de Jira
        const inventory = issues.map(issue => ({
            key: issue.key,
            summary: issue.fields.summary,
            team: issue.fields.labels.includes('CDG_CL') ? 'chile' : 
                  issue.fields.labels.includes('CDG_PE') ? 'peru' : 'supply',
            status: issue.fields.status.name,
            assignee: issue.fields.assignee ? issue.fields.assignee.displayName : 'Sin Asignar',
            isPlanning: issue.fields.labels.includes('Planning'),
            priority: issue.fields.priority.name,
            ageDays: Math.floor((new Date() - new Date(issue.fields.created)) / (1000 * 60 * 60 * 24))
        }));

        // Aquí llamas a tus funciones de renderizado existentes
        renderDashboard(inventory); 

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('inventory-tbody').innerHTML = `<tr><td colspan="5" style="color:red">Error de API: ${error.message}</td></tr>`;
    }
}

window.onload = initDashboard;
