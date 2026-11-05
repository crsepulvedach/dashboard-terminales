// Función principal que carga los datos del archivo generado por el robot
async function initDashboard() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const issues = data.issues;

        // 1. Procesar y Mapear Items
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

        // 2. Calcular Métricas (Agregados)
        const metrics = calculateMetrics(inventory);

        // 3. Renderizar
        window.currentInventory = inventory; // Guardar en memoria para filtros
        window.currentMetrics = metrics;
        render(inventory, metrics['all']);

    } catch (error) {
        console.error("Error cargando datos:", error);
        document.body.innerHTML += '<div style="color:red; padding:20px;">Error: No se pudo cargar data.json. Verifica que el GitHub Action haya corrido al menos una vez.</div>';
    }
}

function calculateMetrics(items) {
    const teams = ['all', 'chile', 'peru', 'supply'];
    let results = {};

    teams.forEach(t => {
        const filtered = t === 'all' ? items : items.filter(i => i.team === t);
        results[t] = {
            in: filtered.length, // En este modelo simplificado, In = WIP actual
            out: "Sincronizando...", // Requiere histórico de resolución
            wip: filtered.length,
            blockers: filtered.filter(i => i.status === 'Detenido').length,
            planPct: filtered.length ? Math.round((filtered.filter(i => i.isPlanning).length / filtered.length) * 100) : 0
        };
    });
    return results;
}

function render(items, stats) {
    // Actualizar KPIs
    document.getElementById('kpi-container').innerHTML = `
        <div class="kpi-card"><div class="kpi-value" style="color:var(--accent-blue)">${stats.wip}</div><div style="color:var(--text-muted)">WIP Activo</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:var(--accent-rose)">${stats.blockers}</div><div style="color:var(--text-muted)">Bloqueos</div></div>
        <div class="kpi-card"><div class="kpi-value" style="color:var(--accent-purple)">${stats.planPct}%</div><div style="color:var(--text-muted)">Foco Estratégico</div></div>
    `;

    // Actualizar Tabla
    const tbody = document.getElementById('inventory-tbody');
    tbody.innerHTML = items.map(i => `
        <tr>
            <td><strong style="color:var(--accent-blue)">${i.key}</strong></td>
            <td>${i.summary}</td>
            <td><span class="badge">${i.team.toUpperCase()}</span></td>
            <td class="${i.status === 'Detenido' ? 'status-detenido' : ''}">${i.status}</td>
            <td>${i.assignee}</td>
        </tr>
    `).join('');
}

// Funciones de UI
function setTeamFilter(team) {
    const filtered = team === 'all' ? window.currentInventory : window.currentInventory.filter(i => i.team === team);
    render(filtered, window.currentMetrics[team]);
    document.querySelectorAll('.pill-btn').forEach(b => b.classList.toggle('active', b.innerText.toLowerCase().includes(team)));
}

window.onload = initDashboard;
