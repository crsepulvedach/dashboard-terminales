const state = {
      selectedTeam: 'all',  // 'all' | 'chile' | 'peru' | 'supply'
      strategicOnly: false, // true (solo Planning) | false (visión completa)
      tableStatus: 'TODOS', // 'TODOS' | 'En Curso' | 'En Análisis' | 'POR HACER' | 'Implementado' | 'Detenido'
      searchQuery: '',
      selectedPeriod: null, // 'YYYY-MM' | 'all'
    };

    /*const rawInventoryItems = [];*/
    let rawInventoryItems = [];
    let availablePeriods = [];
    const JIRA_BASE_URL = 'https://tdentel.atlassian.net';

    const teamAggregates = {
      all: {
        name: "Consolidado Soporte Terminales",
        board: "BURC (17171)",
        boardUrl: "https://tdentel.atlassian.net/jira/software/projects/BURC/boards/17171",
        label: "Consolidado",
        teamSize: 10,
        all: {
          in: 36, out: 26, rate: "72.2%", wip: 112, blockers: 1, planPct: 19.7,
          weeklyPlan: [8, 1, 2, 1], weeklyOp: [14, 1, 6, 3],
          weeklyFlow: [
            { label: "Sem 1", created: 22, resolved: 14 },
            { label: "Sem 2", created: 2, resolved: 4 },
            { label: "Sem 3", created: 8, resolved: 5 },
            { label: "Sem 4+", created: 4, resolved: 3 }
          ]
        },
        plan: {
          in: 12, out: 5, rate: "41.7%", wip: 22, blockers: 0, planPct: 100.0,
          weeklyPlan: [8, 1, 2, 1], weeklyOp: [0, 0, 0, 0],
          weeklyFlow: [
            { label: "Sem 1", created: 8, resolved: 3 },
            { label: "Sem 2", created: 1, resolved: 1 },
            { label: "Sem 3", created: 2, resolved: 1 },
            { label: "Sem 4+", created: 1, resolved: 0 }
          ]
        }
      },
      chile: {
        name: "Control de Gestión Chile",
        board: "BURC-CL (15371)",
        boardUrl: "https://tdentel.atlassian.net/jira/software/projects/BURC/boards/15371",
        label: "CDG_CL",
        teamSize: 5,
        all: {
          in: 9, out: 4, rate: "44.4%", wip: 29, blockers: 0, planPct: 24.1,
          weeklyPlan: [0, 1, 0, 1], weeklyOp: [0, 0, 2, 0],
          weeklyFlow: [
            { label: "Sem 1", created: 3, resolved: 2 },
            { label: "Sem 2", created: 1, resolved: 0 },
            { label: "Sem 3", created: 3, resolved: 1 },
            { label: "Sem 4+", created: 2, resolved: 1 }
          ]
        },
        plan: {
          in: 2, out: 1, rate: "50.0%", wip: 7, blockers: 0, planPct: 100.0,
          weeklyPlan: [0, 1, 0, 1], weeklyOp: [0, 0, 0, 0],
          weeklyFlow: [
            { label: "Sem 1", created: 0, resolved: 0 },
            { label: "Sem 2", created: 1, resolved: 0 },
            { label: "Sem 3", created: 0, resolved: 1 },
            { label: "Sem 4+", created: 1, resolved: 0 }
          ]
        }
      },
      peru: {
        name: "Control de Gestión Perú",
        board: "BURC-PE (15577)",
        boardUrl: "https://tdentel.atlassian.net/jira/software/projects/BURC/boards/15577",
        label: "CDG_PE",
        teamSize: 3,
        all: {
          in: 2, out: 0, rate: "0.0%", wip: 14, blockers: 0, planPct: 64.3,
          weeklyPlan: [0, 0, 0, 0], weeklyOp: [0, 0, 0, 0],
          weeklyFlow: [
            { label: "Sem 1", created: 1, resolved: 0 },
            { label: "Sem 2", created: 0, resolved: 0 },
            { label: "Sem 3", created: 1, resolved: 0 },
            { label: "Sem 4+", created: 0, resolved: 0 }
          ]
        },
        plan: {
          in: 2, out: 0, rate: "0.0%", wip: 9, blockers: 0, planPct: 100.0,
          weeklyPlan: [0, 0, 0, 0], weeklyOp: [0, 0, 0, 0],
          weeklyFlow: [
            { label: "Sem 1", created: 1, resolved: 0 },
            { label: "Sem 2", created: 0, resolved: 0 },
            { label: "Sem 3", created: 1, resolved: 0 },
            { label: "Sem 4+", created: 0, resolved: 0 }
          ]
        }
      },
      supply: {
        name: "Supply Chain",
        board: "BURC-SUP (15923)",
        boardUrl: "https://tdentel.atlassian.net/jira/software/projects/BURC/boards/15923",
        label: "Supply",
        teamSize: 2,
        all: {
          in: 25, out: 22, rate: "88.0%", wip: 69, blockers: 1, planPct: 10.7,
          weeklyPlan: [8, 0, 2, 0], weeklyOp: [14, 1, 4, 3],
          weeklyFlow: [
            { label: "Sem 1", created: 18, resolved: 12 },
            { label: "Sem 2", created: 1, resolved: 4 },
            { label: "Sem 3", created: 4, resolved: 4 },
            { label: "Sem 4+", created: 2, resolved: 2 }
          ]
        },
        plan: {
          in: 8, out: 4, rate: "50.0%", wip: 6, blockers: 0, planPct: 100.0,
          weeklyPlan: [8, 0, 2, 0], weeklyOp: [0, 0, 0, 0],
          weeklyFlow: [
            { label: "Sem 1", created: 7, resolved: 3 },
            { label: "Sem 2", created: 0, resolved: 1 },
            { label: "Sem 3", created: 1, resolved: 0 },
            { label: "Sem 4+", created: 0, resolved: 0 }
          ]
        }
      }
    };

    function formatPeriod(period) {

      const [year, month] = period.split('-');

      const months = {
        '01': 'Enero',
        '02': 'Febrero',
        '03': 'Marzo',
        '04': 'Abril',
        '05': 'Mayo',
        '06': 'Junio',
        '07': 'Julio',
        '08': 'Agosto',
        '09': 'Septiembre',
        '10': 'Octubre',
        '11': 'Noviembre',
        '12': 'Diciembre'
      };

      return `${months[month]} ${year}`;
    }

    function getFilteredItems() {

      return rawInventoryItems.filter(item => {

        if (isClosedWithoutResolution(item)) {
          return false;
        } 

        const matchTeam =
          state.selectedTeam === 'all' ||
          item.team === state.selectedTeam;

        const matchStrategic =
          !state.strategicOnly ||
          item.isPlanning;

        const matchPeriod =
          existedInPeriod(
            item,
            state.selectedPeriod
          );

        return (
          matchTeam &&
          matchStrategic &&
          matchPeriod
        );

      });

    }

    function isClosedWithoutResolution(item) {

      const closedStatuses = [
        'Finalizado'
      ];

      return (
        closedStatuses.includes(item.status) &&
        !item.resolutiondate
      );

    }


    function calculatePeriodMetrics(period) {
      /* const teamItems =
        state.selectedTeam === 'all'
          ? rawInventoryItems
          : rawInventoryItems.filter(
              item => item.team === state.selectedTeam
            ); */

      const filteredItems = rawInventoryItems.filter(item => {
          
            if (isClosedWithoutResolution(item)) {
              return false;
            }
          const matchTeam =
            state.selectedTeam === 'all' ||
            item.team === state.selectedTeam;

          const matchStrategic =
            !state.strategicOnly ||
            item.isPlanning;

          return matchTeam && matchStrategic;

      });           

      const created = filteredItems.filter(
        item => item.createdPeriod === period
      ).length;

      const closed = filteredItems.filter(
        item => item.resolvedPeriod === period
      ).length;

      return {
        created,
        closed,
        balance: created - closed
      };
    }

    function calculateWeeklyFlow(period) {

      if (!period || period === 'all') {
        return [];
      }

      const [year, month] = period.split('-');

      const filteredItems = rawInventoryItems.filter(item => {

        if (isClosedWithoutResolution(item)) {
          return false;
        }

        const matchTeam =
          state.selectedTeam === 'all' ||
          item.team === state.selectedTeam;

        const matchStrategic =
          !state.strategicOnly ||
          item.isPlanning;

        return (
          matchTeam &&
          matchStrategic
        );

      });

      const weeks = [
        { label: 'Sem 1', created: 0, resolved: 0 },
        { label: 'Sem 2', created: 0, resolved: 0 },
        { label: 'Sem 3', created: 0, resolved: 0 },
        { label: 'Sem 4+', created: 0, resolved: 0 }
      ];

      function getWeekBucket(date) {

        const day = date.getDate();

        if (day <= 7) return 0;
        if (day <= 14) return 1;
        if (day <= 21) return 2;

        return 3;
      }

      filteredItems.forEach(item => {

        const createdDate =
          item.created
            ? new Date(item.created)
            : null;

        if (
          createdDate &&
          createdDate.getFullYear() === Number(year) &&
          (createdDate.getMonth() + 1) === Number(month)
        ) {
          weeks[getWeekBucket(createdDate)].created++;
        }

        const resolvedDate =
          item.resolutiondate
            ? new Date(item.resolutiondate)
            : null;

        if (
          resolvedDate &&
          resolvedDate.getFullYear() === Number(year) &&
          (resolvedDate.getMonth() + 1) === Number(month)
        ) {
          weeks[getWeekBucket(resolvedDate)].resolved++;
        }

      });

      return weeks;

    }

    function getPeriod(dateString) {
      if (!dateString) return null;

      const date = new Date(dateString);

      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    function getPeriodStart(period) {

      const [year, month] = period.split('-');

      return new Date(
        Number(year),
        Number(month) - 1,
        1
      );
    }

    function getPeriodEnd(period) {

      const [year, month] = period.split('-');

      return new Date(
        Number(year),
        Number(month),
        0,
        23,
        59,
        59,
        999
      );

    }    

    function existedInPeriod(item, period) {

      if (isClosedWithoutResolution(item)) {
        return false;
      }

      if (period === 'all') {
        return true;
      }

      const periodStart = getPeriodStart(period);
      const periodEnd = getPeriodEnd(period);

      const createdDate = new Date(item.created);

      const resolvedDate =
        item.resolutiondate
          ? new Date(item.resolutiondate)
          : null;

      const existedBeforePeriodEnd =
        createdDate <= periodEnd;

      const survivedIntoPeriod =
        !resolvedDate ||
        resolvedDate >= periodStart;

      return (
        existedBeforePeriodEnd &&
        survivedIntoPeriod
      );

    }

    function setPeriodFilter(period) {

      state.selectedPeriod = period;
      applyGlobalFilters();

      console.log(
        calculateWeeklyFlow(
          state.selectedPeriod
        )
      );  

      

      console.log(
        calculateWipDistribution()
      );

   /*    console.log(
        'Periodo seleccionado:',
        state.selectedPeriod
      ); */

    }

    function calculateCarryOver(period) {

      const periodStart =
        getPeriodStart(period);

      const filteredItems =
        rawInventoryItems.filter(item => {

          if (isClosedWithoutResolution(item)) {
            return false;
          }

          const matchTeam =
            state.selectedTeam === 'all' ||
            item.team === state.selectedTeam;

          const matchStrategic =
            !state.strategicOnly ||
            item.isPlanning;

          return matchTeam && matchStrategic;

        }); 

     // const filteredItems = getFilteredItems();

      return filteredItems.filter(item => {

        const createdDate =
          new Date(item.created);

        const resolutionDate =
          item.resolutiondate
            ? new Date(item.resolutiondate)
            : null;

        const existedBeforePeriod =
          createdDate < periodStart;

        const stillOpenAtPeriodStart =
          !resolutionDate ||
          resolutionDate >= periodStart;

        return (
          existedBeforePeriod &&
          stillOpenAtPeriodStart
        );

      }).length;

    }    

    function applyGlobalFilters() {
      const modeKey = state.strategicOnly ? 'plan' : 'all';
      const curData = teamAggregates[state.selectedTeam][modeKey];
      const periodMetrics =
        state.selectedPeriod === 'all'
          ? null
          : calculatePeriodMetrics(state.selectedPeriod);
      const throughputIn =
        periodMetrics
          ? periodMetrics.created
          : curData.in;

      const throughputOut =
        periodMetrics
          ? periodMetrics.closed
          : curData.out;
      let balance = null;
      let carryOver = null;
      let wip = null;

      if (state.selectedPeriod !== 'all') {
        const metrics =
          calculatePeriodMetrics(state.selectedPeriod);

        carryOver =
          calculateCarryOver(state.selectedPeriod);


        balance =
          metrics.created - metrics.closed;

        wip =
          carryOver + balance;  

        console.log({
          throughputOut,
          wip
        });  

/*         carryOver =
          curData.wip - balance; */
      }

      /* const filteredItems = rawInventoryItems.filter(item => {
        const matchTeam = (state.selectedTeam === 'all') || (item.team === state.selectedTeam);
        const matchStrategic = !state.strategicOnly || item.isPlanning;
        return matchTeam && matchStrategic;
      }); */

      const filteredItems = getFilteredItems();

   /*    console.log(
        "applyGlobalFilters",
        {
          raw: rawInventoryItems.length,
          filtered: filteredItems.length,
          team: state.selectedTeam,
          strategicOnly: state.strategicOnly,
          tableStatus: state.tableStatus
        }
      ); */
      
    

      // 1. Alertas y Badges de Bloqueos
      const blockerItems = filteredItems.filter(i => i.status === 'Detenido');
      document.getElementById('alertCountBadge').innerText = blockerItems.length;
      document.getElementById('tab-blockers-count').innerText = blockerItems.length;

      if (blockerItems.length === 0) {
        document.getElementById('alertTitle').innerText = 'Sin Iniciativas Detenidas en la Vista Seleccionada';
        document.getElementById('alertDesc').innerText = 'El filtro actual no presenta bloqueos activos en el inventario real verificado.';
      } else {
        document.getElementById('alertTitle').innerText = `Atención Directiva: ${blockerItems.length} Iniciativa(s) en Estado "Detenido"`;
        document.getElementById('alertDesc').innerText = `BURC-771 ("Lanzamiento Xiaomi Note 17") acumula 74 días detenido en Supply Chain por acuerdos comerciales.`;
      }

      // 2. izar KPIs Superiores
      document.getElementById('kpi-container').innerHTML = `
        <div class="kpi-card blue">
          <div class="kpi-top"><span class="kpi-title">Ingreso (Throughput In)</span><span class="kpi-icon">📥</span></div>
          <div class="kpi-value">${throughputIn}</div>
          <div class="kpi-meta"><span class="tag-trend warn">Demanda activa</span> Ingresos del periodo en análisis</div>
        </div>
        <div class="kpi-card emerald">
          <div class="kpi-top"><span class="kpi-title">Entregas (Throughput Out)</span><span class="kpi-icon">🚀</span></div>
          <div class="kpi-value">${throughputOut}</div>
          <div class="kpi-meta"><span class="tag-trend good">${curData.rate} Completitud</span> Tasa de cierre del periodo</div>
        </div>
        <div class="kpi-card amber">
          <div class="kpi-top">
            <span class="kpi-title">WIP Activo en Ejecución</span>
            <span class="kpi-icon">⚡</span></div>
          <div class="kpi-value">
            ${
              state.selectedPeriod === 'all'
                ? curData.wip
                : wip
            }
          </div>
          <div class="kpi-meta">
            ${
              state.selectedPeriod === 'all'
                ? `
                  <span class="tag-trend wip">Activo</span>
                  ${state.strategicOnly ? 'Iniciativas Planning' : 'Tareas en curso'}
                `
                : `
                  <span class="tag-trend wip">Carry Over: <strong>${carryOver}</strong></span>
                  <div>Balance: <strong>${balance >= 0 ? '+' : ''}${balance}</strong></div>
                `
            }
          </div>
        </div>
        <div class="kpi-card rose">
          <div class="kpi-top"><span class="kpi-title">Trabajo Bloqueado</span><span class="kpi-icon">⛔</span></div>
          <div class="kpi-value">${blockerItems.length}</div>
          <div class="kpi-meta"><span class="tag-trend danger">Atención inmediata</span> Requiere destrabe externo</div>
        </div>
        <div class="kpi-card purple">
          <div class="kpi-top"><span class="kpi-title">Inventario Total en Vuelo</span><span class="kpi-icon">📦</span></div>
          <div class="kpi-value">${filteredItems.length}</div>
          <div class="kpi-meta"><span class="tag-trend warn">Backlog abierto</span> Total en el ámbito seleccionado</div>
        </div>
      `;
      document.getElementById('tab-inventory-count').innerText = filteredItems.length;

      // 3. Ritmo de Flujo Semanal Dinámico (Ingreso vs Salida por filtro)
      let flowHtml = '';
      //const weeklyFlowData = curData.weeklyFlow || [];
      const weeklyFlowData =
        calculateWeeklyFlow(
          state.selectedPeriod
        );

      console.log(weeklyFlowData);

      const totalCreated =
        weeklyFlowData.reduce(
          (sum, w) => sum + w.created,
          0
        );

      const totalResolved =
        weeklyFlowData.reduce(
          (sum, w) => sum + w.resolved,
          0
        );

      console.log({
        totalCreated,
        totalResolved
      });

      const maxFlowVal = Math.max(...weeklyFlowData.flatMap(w => [w.created, w.resolved]), 1);

      weeklyFlowData.forEach(item => {
        const createdPct = Math.round((item.created / maxFlowVal) * 100);
        const resolvedPct = Math.round((item.resolved / maxFlowVal) * 100);

        flowHtml += `
          <div style="display: flex; align-items: center; margin-bottom: 1.25rem; gap: 1rem;">
            <div style="width: 110px; font-size: 0.82rem; color: var(--text-muted); text-align: right;">${item.label} (Ingreso)</div>
            <div style="flex: 1; height: 26px; background: rgba(255,255,255,0.03); border-radius: 6px; overflow: hidden; display: flex; border: 1px solid var(--border-color);">
              <div style="width: ${createdPct}%; background: linear-gradient(90deg, #38bdf8, #0284c7); height: 100%; display: flex; align-items: center; padding-left: 0.75rem; font-size: 0.75rem; font-weight: 700; color:#fff; min-width: ${item.created > 0 ? '30px' : '0'};">
                ${item.created} Creados
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; margin-top: -10px; margin-bottom: 1rem; gap: 1rem;">
            <div style="width: 110px; font-size: 0.82rem; color: var(--text-dim); text-align: right;">(Entregas)</div>
            <div style="flex: 1; height: 26px; background: rgba(255,255,255,0.03); border-radius: 6px; overflow: hidden; display: flex; border: 1px solid var(--border-color);">
              <div style="width: ${resolvedPct}%; background: linear-gradient(90deg, #34d399, #059669); height: 100%; display: flex; align-items: center; padding-left: 0.75rem; font-size: 0.75rem; font-weight: 700; color:#fff; min-width: ${item.resolved > 0 ? '30px' : '0'};">
                ${item.resolved} Resueltos
              </div>
            </div>
          </div>
        `;
      });
      document.getElementById('weekly-flow-container').innerHTML = flowHtml;
      document.getElementById('weekly-finding-container').innerHTML = `💡 <strong>Hallazgo Ágil (${teamAggregates[state.selectedTeam].name}):</strong> Mayor volumen de resoluciones concentrado al inicio del periodo por cierres de reportería periódica.`;

      // 4. Distribución de Estados Activos
      const statusCounts = { "POR HACER": 0, "En Curso": 0, "En Análisis": 0, "Detenido": 0, "Implementado": 0 };
      filteredItems.forEach(i => { if (statusCounts[i.status] !== undefined) statusCounts[i.status]++; });
      const totalFiltered = Math.max(filteredItems.length, 1);

      const statusConfig = [
        { label: "📋 Por Hacer", key: "POR HACER", color: "#94a3b8" },
        { label: "⚙️ En Curso", key: "En Curso", color: "var(--accent-blue)" },
        { label: "🔍 En Análisis", key: "En Análisis", color: "var(--accent-purple)" },
        { label: "⛔ Detenido", key: "Detenido", color: "var(--accent-rose)" },
        { label: "✅ Implementado", key: "Implementado", color: "var(--accent-emerald)" }
      ];

      let statusHtml = '';
      statusConfig.forEach(s => {
        const cnt = statusCounts[s.key];
        const pct = Math.round((cnt / totalFiltered) * 100);
        statusHtml += `
          <div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
              <span>${s.label}</span>
              <strong style="color: ${s.color};">${cnt} ítems (${pct}%)</strong>
            </div>
            <div style="height: 12px; background: #1e293b; border-radius: 6px; overflow: hidden;">
              <div style="width: ${pct}%; height: 100%; background: ${s.color};"></div>
            </div>
          </div>
        `;
      });
      document.getElementById('status-bars-container').innerHTML = statusHtml;
      document.getElementById('status-dist-title').innerText = `Distribución de los ${filteredItems.length} Requerimientos Seleccionados`;
      document.getElementById('wip-warning-box').innerHTML = '⚠️ <strong>Sobrecarga Operativa:</strong> Con múltiples requerimientos abiertos en ejecución activa simultánea, los analistas alternan contexto, dilatando el Lead Time.';

      // 5. Matriz de Capacidad
      updateMatrixTable(modeKey);

      // 6. Gráfico Semanal Planning vs Operativo
      updateWeeklyChart(curData);

      // 7. Capacidad y Asfixia
      updateCapacityBars(curData);

      // 8. Simulador Ley de Little
      //updateFlowSimulator(curData);
      updateFlowSimulator(throughputOut, wip);

      // 9. Aging Work Buckets
      updateAgingBuckets(filteredItems);

      // 10. Prioridades Donut Chart
      updatePriorityChart(filteredItems);

      // 11. Mesa de Destrabe Cards
      renderBlockerCards(blockerItems);

      // 12. Tabla de Inventario
      renderInventoryTable();
    }

    function updateMatrixTable(modeKey) {
      const teams = state.selectedTeam === 'all' ? ['chile', 'peru', 'supply'] : [state.selectedTeam];
      let html = '';

      teams.forEach(tKey => {
        const tObj = teamAggregates[tKey];
        const data = tObj[modeKey];
        let diagBadge = '<span class="badge" style="background:rgba(52,211,153,0.2);color:var(--accent-emerald);">Equilibrado</span>';
        if (tKey === 'chile') diagBadge = '<span class="badge" style="background:rgba(56,189,248,0.2);color:var(--accent-blue);">WIP Controlado</span>';
        if (tKey === 'peru') diagBadge = '<span class="badge" style="background:rgba(251,191,36,0.2);color:var(--accent-amber);">Enfoque Planning Alto</span>';
        if (tKey === 'supply') diagBadge = '<span class="badge" style="background:rgba(251,113,133,0.2);color:var(--accent-rose);">WIP Elevado</span>';

        html += `
          <tr>
            <td><strong>${tObj.name}</strong></td>
            <td><code style="color:var(--accent-blue);">${tObj.label}</code></td>
            <td><a href="${tObj.boardUrl}" target="_blank" style="color:var(--accent-blue);text-decoration:none;">${tObj.board}</a></td>
            <td>${data.in}</td>
            <td style="font-weight:700; color:var(--accent-emerald);">${data.out}</td>
            <td>${data.rate}</td>
            <td style="font-weight:700;">${data.wip}</td>
            <td><span class="badge ${data.blockers > 0 ? 'badge-block' : 'badge-operativo'}">${data.blockers}</span></td>
            <td><span class="badge badge-planning">${data.planPct}%</span></td>
            <td>${diagBadge}</td>
          </tr>
        `;
      });

      if (state.selectedTeam === 'all') {
        const consData = teamAggregates.all[modeKey];
        html += `
          <tr style="background: var(--bg-card-hover); font-weight:700;">
            <td>Consolidado Soporte Terminales</td>
            <td><code>Todas</code></td>
            <td>BURC (17171)</td>
            <td>${consData.in}</td>
            <td style="color:var(--accent-emerald);">${consData.out}</td>
            <td style="color:var(--accent-purple);">${consData.rate}</td>
            <td style="color:var(--accent-amber);">${consData.wip}</td>
            <td><span class="badge badge-block">${consData.blockers}</span></td>
            <td><span class="badge badge-planning">${consData.planPct}%</span></td>
            <td><span class="badge" style="background:rgba(56,189,248,0.2);color:var(--accent-blue);">Focalizado</span></td>
          </tr>
        `;
      }

      document.getElementById('matrixTableBody').innerHTML = html;
      document.getElementById('matrixScopeLabel').innerText = `Ámbito: ${teamAggregates[state.selectedTeam].name} (${state.strategicOnly ? 'Solo Planning' : 'Visión Completa'})`;
    }

    function calculateWipDistribution() {

      const periodEnd =
          getPeriodEnd(
            state.selectedPeriod
          );

        const filteredItems =
          rawInventoryItems.filter(item => {

            if (isClosedWithoutResolution(item)) {
              return false;
            }

            const matchTeam =
              state.selectedTeam === 'all' ||
              item.team === state.selectedTeam;

            const matchStrategic =
              !state.strategicOnly ||
              item.isPlanning;

            const createdDate =
              new Date(item.created);

            const resolvedDate =
              item.resolutiondate
                ? new Date(item.resolutiondate)
                : null;

            const openAtPeriodEnd =
              createdDate <= periodEnd &&
              (
                !resolvedDate ||
                resolvedDate > periodEnd
              );

            return (
              matchTeam &&
              matchStrategic &&
              openAtPeriodEnd
            );

          });

        const planningWip =
          filteredItems.filter(
            item => item.isPlanning
          ).length;

        const operationalWip =
          filteredItems.filter(
            item => !item.isPlanning
          ).length;

        return {
          planningWip,
          operationalWip,
          totalWip:
            planningWip + operationalWip
        };

    }

    function updateWeeklyChart(curData) {
      const weeklyFlowData =
        calculateWeeklyFlow(
          state.selectedPeriod
        );

        if (!weeklyFlowData.length) {
          document.getElementById('weeklyChartContainer').innerHTML =
            '<div style="padding:20px;color:var(--text-muted);">Seleccione un período para visualizar el flujo semanal.</div>';

          return;
        }
      //const plan = curData.weeklyPlan || [0, 0, 0, 0];
      //const op = state.strategicOnly ? [0, 0, 0, 0] : (curData.weeklyOp || [0, 0, 0, 0]);
      //const maxVal = Math.max(...plan.map((p, idx) => p + op[idx]), 1);

      const maxVal = Math.max(
        ...weeklyFlowData.flatMap(w => [
          w.created,
          w.resolved
        ]),
        1
      );

      const scaleY = val => (val / Math.max(maxVal, 10)) * 110;

      let barsHtml = '';
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4+'];
      const xOffsets = [70, 160, 250, 340];

      weeks.forEach((w, i) => {
        //const pVal = plan[i];
        //const oVal = op[i];
        const createdVal =
          weeklyFlowData[i].created;

        const resolvedVal =
          weeklyFlowData[i].resolved;

        //const pHeight = scaleY(pVal);
        //const oHeight = scaleY(oVal);
        //const pY = 150 - pHeight;
        //const oY = 150 - oHeight;

        const cHeight =
          scaleY(createdVal);

        const rHeight =
          scaleY(resolvedVal);

        const cY =
          150 - cHeight;

        const rY =
          150 - rHeight;

      /*   barsHtml += `
          <rect x="${xOffsets[i]}" y="${pY}" width="26" height="${pHeight}" fill="#c084fc" rx="3"/>
          <text x="${xOffsets[i] + 13}" y="${Math.max(pY - 5, 20)}" fill="#c084fc" font-size="11" text-anchor="middle">${pVal > 0 ? pVal : ''}</text>
          ${!state.strategicOnly ? `
            <rect x="${xOffsets[i] + 30}" y="${oY}" width="26" height="${oHeight}" fill="#64748b" rx="3"/>
            <text x="${xOffsets[i] + 43}" y="${Math.max(oY - 5, 20)}" fill="#cbd5e1" font-size="11" text-anchor="middle">${oVal > 0 ? oVal : ''}</text>
          ` : ''}
          <text x="${xOffsets[i] + (state.strategicOnly ? 13 : 28)}" y="168" fill="#94a3b8" font-size="11" text-anchor="middle">${w}</text>
        `; */

        barsHtml += `
          <rect
            x="${xOffsets[i]}"
            y="${cY}"
            width="26"
            height="${cHeight}"
            fill="#38bdf8"
            rx="3"/>

          <text
            x="${xOffsets[i] + 13}"
            y="${Math.max(cY - 5, 20)}"
            fill="#38bdf8"
            font-size="11"
            text-anchor="middle">
            ${createdVal > 0 ? createdVal : ''}
          </text>

          <rect
            x="${xOffsets[i] + 30}"
            y="${rY}"
            width="26"
            height="${rHeight}"
            fill="#34d399"
            rx="3"/>

          <text
            x="${xOffsets[i] + 43}"
            y="${Math.max(rY - 5, 20)}"
            fill="#34d399"
            font-size="11"
            text-anchor="middle">
            ${resolvedVal > 0 ? resolvedVal : ''}
          </text>

          <text
            x="${xOffsets[i] + 28}"
            y="168"
            fill="#94a3b8"
            font-size="11"
            text-anchor="middle">
            ${w}
          </text>
        `;

 
        
      });

      document.getElementById('weeklyChartContainer').innerHTML = `
        <svg width="100%" height="190" viewBox="0 0 440 190">
          <line x1="40" y1="150" x2="410" y2="150" stroke="#24344d" stroke-width="1"/>
          <line x1="40" y1="95" x2="410" y2="95" stroke="#1e293b" stroke-dasharray="3,3"/>
          <line x1="40" y1="40" x2="410" y2="40" stroke="#1e293b" stroke-dasharray="3,3"/>
          <text x="30" y="155" fill="#64748b" font-size="10" text-anchor="end">0</text>
          <text x="30" y="100" fill="#64748b" font-size="10" text-anchor="end">${Math.round(Math.max(maxVal, 10) / 2)}</text>
          <text x="30" y="45" fill="#64748b" font-size="10" text-anchor="end">${Math.max(maxVal, 10)}</text>
          ${barsHtml}
        </svg>
      `;
      //document.getElementById('chartScopeLabel').innerText = `${teamAggregates[state.selectedTeam].name} (${state.strategicOnly ? 'Solo Planning' : 'Planning vs Operativo'})`;
      //document.getElementById('chartLegend').style.display = state.strategicOnly ? 'none' : 'flex';
      document.getElementById('chartScopeLabel').innerText =
      `${teamAggregates[state.selectedTeam].name}
      (Ingreso vs Entregas)`;

      document.getElementById('chartLegend').style.display = 'flex';
    }

    function updateCapacityBars(curData) {
      //const planWip = teamAggregates[state.selectedTeam].plan.wip;
      //const totalWip = teamAggregates[state.selectedTeam].all.wip;
      //const opWip = Math.max(totalWip - planWip, 0);
      const {
        planningWip,
        operationalWip,
        totalWip
      } = calculateWipDistribution();

      const planWip = planningWip;
      const opWip = operationalWip;



      const planPct = Math.round((planWip / Math.max(totalWip, 1)) * 100);
      const opPct = 100 - planPct;

      let html = '';
      if (state.strategicOnly) {
        html = `
          <div class="dist-bar-item">
            <div class="dist-bar-header">
              <span>Compromisos Planning en Vuelo</span>
              <strong style="color: var(--accent-purple);">${planWip} WIP (100%)</strong>
            </div>
            <div class="dist-bar-track">
              <div class="dist-bar-fill" style="width: 100%; background: var(--accent-purple);"></div>
            </div>
          </div>
          <div style="background: var(--bg-primary); border-radius: 8px; padding: 12px; margin-top: 24px; font-size: 12px; color: var(--text-muted); border-left: 3px solid var(--accent-emerald);">
            <strong>Foco Estratégico Exclusivo:</strong> Monitoreando ${planWip} iniciativas que impactan directamente los OKRs y la planificación mensual.
          </div>
        `;
      } else {
        html = `
          <div class="dist-bar-item">
            <div class="dist-bar-header">
              <span>Iniciativas Estratégicas (Planning)</span>
              <strong style="color: var(--accent-purple);">${planWip} WIP (${planPct}%)</strong>
            </div>
            <div class="dist-bar-track">
              <div class="dist-bar-fill" style="width: ${planPct}%; background: var(--accent-purple);"></div>
            </div>
          </div>
          <div class="dist-bar-item" style="margin-top: 1rem;">
            <div class="dist-bar-header">
              <span>Soporte Operativo & Rutina</span>
              <strong style="color: #94a3b8;">${opWip} WIP (${opPct}%)</strong>
            </div>
            <div class="dist-bar-track">
              <div class="dist-bar-fill" style="width: ${opPct}%; background: #64748b;"></div>
            </div>
          </div>
          <div style="background: var(--bg-primary); border-radius: 8px; padding: 12px; margin-top: 24px; font-size: 12px; color: var(--text-muted); border-left: 3px solid var(--accent-amber);">
            <strong>Riesgo de Asfixia Operativa:</strong> El ${opPct}% del trabajo activo no corresponde a compromisos Planning, compitiendo por la atención del equipo.
          </div>
        `;
      }
      document.getElementById('capacityDistributionContainer').innerHTML = html;
    }

    function updateFlowSimulator(throughputOut, wip) {
      const thDaily = Math.max(throughputOut / 31, 0.05);
      const baseWip = wip;
      const initialLeadTime = (baseWip / thDaily).toFixed(1);

      document.getElementById('littles-law-desc').innerHTML = `En sistemas ágiles, si el ritmo promedio es de <strong>${thDaily.toFixed(2)} tareas/día</strong>, mantener <strong>${baseWip} tareas abiertas</strong> genera un tiempo de cola teórico de:`;
      document.getElementById('littles-law-formula').innerHTML = `Lead Time Teórico = ${baseWip} WIP / ${thDaily.toFixed(2)} req/día = <span style="color: var(--accent-amber);">${initialLeadTime} días</span>`;
      
      const causes = [
        "<strong>Demandas no filtradas:</strong> Se ingresan requerimientos sin verificar si los datos fuente están listos.",
        "<strong>Falta de límites explícitos de WIP:</strong> Cada analista toma requerimientos concurrentes.",
        "<strong>Tareas de rutina mezcladas con proyectos:</strong> La reportería periódica compite con el desarrollo BI."
      ];
      let rootHtml = '';
      causes.forEach(c => rootHtml += `<li>${c}</li>`);
      document.getElementById('root-causes-list').innerHTML = rootHtml;

      const slider = document.getElementById('wip-slider');
      slider.min = Math.max(Math.round(baseWip * 0.15), 5);
      slider.max = Math.round(baseWip * 1.5);
      slider.value = baseWip;
      document.getElementById('slider-min-lbl').innerText = `${slider.min} (Enfoque)`;
      document.getElementById('slider-rec-lbl').innerText = `${Math.round(baseWip * 0.3)} (Rec.)`;
      document.getElementById('slider-cur-lbl').innerText = `${baseWip} (Actual)`;
      updateSimulator(baseWip);

      
    }

    function updateSimulator(wipVal) {
      document.getElementById('wip-display').innerText = wipVal + ' tareas';
      //const modeKey = state.strategicOnly ? 'plan' : 'all';
      //const curData = teamAggregates[state.selectedTeam][modeKey];

      //const thPerDay = Math.max(curData.out / 31, 0.05);
      //const baseWip = curData.wip;

      const periodMetrics =
        calculatePeriodMetrics(
          state.selectedPeriod
        );

      const throughputOut =
        periodMetrics.closed;

      const {
        totalWip
      } = calculateWipDistribution();

      const thPerDay =
        Math.max(
          throughputOut / 31,
          0.05
        );

      const baseWip =
        totalWip;
      const currentLeadTime = baseWip / thPerDay;
      const simulatedLeadTime = wipVal / thPerDay;

      document.getElementById('sim-leadtime').innerText = simulatedLeadTime.toFixed(1) + ' días';
      const pctChange = ((currentLeadTime - simulatedLeadTime) / currentLeadTime) * 100;
      const impEl = document.getElementById('sim-improvement');

      if (pctChange > 0) {
        impEl.innerText = '-' + pctChange.toFixed(0) + '% tiempo';
        impEl.style.color = 'var(--accent-emerald)';
      } else {
        impEl.innerText = '0%';
        impEl.style.color = '#94a3b8';
      }
      const recWip = Math.round(baseWip * 0.3);
      document.getElementById('sim-callout').innerHTML = `✨ Reduciendo el trabajo en simultáneo a <strong>${recWip} tareas</strong>, el Lead Time caería a solo <strong>${(recWip / thPerDay).toFixed(0)} días</strong>.`;
    }

    /* function updateAgingBuckets(filteredItems) {
      const total = Math.max(filteredItems.length, 1);
      const b1 = filteredItems.filter(i => i.ageDays <= 30).length;
      const b2 = filteredItems.filter(i => i.ageDays > 30 && i.ageDays <= 120).length;
      const b3 = filteredItems.filter(i => i.ageDays > 120 && i.ageDays <= 210).length;
      const b4 = filteredItems.filter(i => i.ageDays > 210).length;

      const p1 = Math.round((b1 / total) * 100);
      const p2 = Math.round((b2 / total) * 100);
      const p3 = Math.round((b3 / total) * 100);
      const p4 = 100 - (p1 + p2 + p3);

      document.getElementById('agingScopeLabel').innerText = `${teamAggregates[state.selectedTeam].name} (${filteredItems.length} ítems)`;
      document.getElementById('aging-bars-container').innerHTML = `
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
            <span style="color: var(--accent-emerald);">● Recientes (&lt; 30 días)</span> <strong>${b1} ítems (${p1}%)</strong>
          </div>
          <div style="height: 14px; background: #1e293b; border-radius: 7px; overflow: hidden;">
            <div style="width: ${p1}%; height: 100%; background: var(--accent-emerald);"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
            <span style="color: var(--accent-blue);">● En maduración (31 - 120 días)</span> <strong>${b2} ítems (${p2}%)</strong>
          </div>
          <div style="height: 14px; background: #1e293b; border-radius: 7px; overflow: hidden;">
            <div style="width: ${p2}%; height: 100%; background: var(--accent-blue);"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
            <span style="color: var(--accent-amber);">● Envejecidas (121 - 210 días)</span> <strong>${b3} ítems (${p3}%)</strong>
          </div>
          <div style="height: 14px; background: #1e293b; border-radius: 7px; overflow: hidden;">
            <div style="width: ${p3}%; height: 100%; background: var(--accent-amber);"></div>
          </div>
        </div>
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
            <span style="color: var(--accent-rose);">● Críticas (&gt; 210 días)</span> <strong>${b4} ítems (${p4}%)</strong>
          </div>
          <div style="height: 14px; background: #1e293b; border-radius: 7px; overflow: hidden;">
            <div style="width: ${p4}%; height: 100%; background: var(--accent-rose);"></div>
          </div>
        </div>
      `;
      document.getElementById('agingInsightBox').innerHTML = `<strong>Análisis de Antigüedad:</strong> El inventario refleja una distribución adecuada en tareas recientes y en maduración para el ámbito <strong>${teamAggregates[state.selectedTeam].name}</strong>.`;
    } */
    
    /**
     * Genera una URL de búsqueda avanzada JQL en Jira para un conjunto de tickets
     * @param {Array} items - Lista de objetos de tickets del bucket
     * @param {string} bucketName - Nombre descriptivo del bucket
     * @returns {string|null} - URL codificada para Jira
     */
    function buildJiraJqlUrl(items) {
      if (!items || items.length === 0) return null;
      const keys = items.map(i => i.key);
      // Si la cantidad de keys es manejable (< 70), usamos 'issueKey in (...)', que es 100% exacto
      let jql = '';
      if (keys.length <= 70) {
        jql = `issueKey in (${keys.join(', ')}) ORDER BY created ASC`;
      } else {
        // Fallback por criterios si hay demasiados tickets
        const teamFilter = state.selectedTeam === 'chile' ? 'AND labels = "CDG_CL"' :
                          state.selectedTeam === 'peru' ? 'AND labels = "CDG_PE"' :
                          state.selectedTeam === 'supply' ? 'AND labels not in ("CDG_CL", "CDG_PE")' : '';
        const stratFilter = state.strategicOnly ? 'AND labels = "Planning"' : '';
        jql = `project = "BURC" AND resolution = Unresolved ${teamFilter} ${stratFilter} ORDER BY created ASC`;
      }
      return `${JIRA_BASE_URL}/issues/?jql=${encodeURIComponent(jql)}`;
    }
    /**
     * Filtra el inventario interno por un rango de días y cambia de tab
     */
    function drillDownAgingLocally(minDays, maxDays) {
      // Cambiamos a la pestaña de inventario activo
      switchTab('tab-inventario');
      // Aplicamos un filtro de búsqueda o ajustamos visualmente
      const searchInput = document.getElementById('table-search');
      if (searchInput) {
        searchInput.placeholder = `Filtrando: ${minDays}-${maxDays || '+'} días...`;
      }
    }
    /**
     * Actualiza la tarjeta de distribución de antigüedad con interactividad y enlaces a Jira
     */
    function updateAgingBuckets(filteredItems) {
      const total = Math.max(filteredItems.length, 1);
      // Clasificación de los ítems en sus respectivos buckets
      const buckets = [
        {
          id: 'recientes',
          title: 'Recientes',
          rangeLabel: '< 30 días',
          minDays: 0,
          maxDays: 30,
          color: 'var(--accent-emerald)',
          badgeClass: 'good',
          items: filteredItems.filter(i => i.ageDays <= 30)
        },
        {
          id: 'maduracion',
          title: 'En maduración',
          rangeLabel: '31 - 120 días',
          minDays: 31,
          maxDays: 120,
          color: 'var(--accent-blue)',
          badgeClass: 'wip',
          items: filteredItems.filter(i => i.ageDays > 30 && i.ageDays <= 120)
        },
        {
          id: 'envejecidas',
          title: 'Envejecidas',
          rangeLabel: '121 - 210 días',
          minDays: 121,
          maxDays: 210,
          color: 'var(--accent-amber)',
          badgeClass: 'warn',
          items: filteredItems.filter(i => i.ageDays > 120 && i.ageDays <= 210)
        },
        {
          id: 'criticas',
          title: 'Críticas (Riesgo)',
          rangeLabel: '> 210 días',
          minDays: 211,
          maxDays: null,
          color: 'var(--accent-rose)',
          badgeClass: 'danger',
          items: filteredItems.filter(i => i.ageDays > 210)
        }
      ];
      let html = '';
      buckets.forEach(b => {
        const count = b.items.length;
        const pct = Math.round((count / total) * 100);
        const jiraUrl = buildJiraJqlUrl(b.items);
        html += `
          <div class="aging-bucket-card" style="border-left: 4px solid ${b.color};">
            <div class="aging-bucket-header">
              <div class="aging-bucket-info">
                <span class="aging-bullet" style="background: ${b.color};"></span>
                <strong>${b.title}</strong>
                <span class="aging-range-pill">${b.rangeLabel}</span>
              </div>
              <div class="aging-bucket-actions">
                <span class="aging-count-badge">${count} ítems <small>(${pct}%)</small></span>
                ${jiraUrl ? `
                  <a href="${jiraUrl}" target="_blank" rel="noopener noreferrer" class="btn-jira-link" title="Ver estos ${count} tickets en Jira">
                    <span>Ver en Jira</span>
                    <span style="font-size: 11px;">↗</span>
                  </a>
                ` : `
                  <span class="btn-jira-link disabled" title="No hay tickets en este rango">0 tickets</span>
                `}
              </div>
            </div>
            <!-- Barra de progreso -->
            <div class="aging-track">
              <div class="aging-fill" style="width: ${pct}%; background: ${b.color};"></div>
            </div>
          </div>
        `;
      });
      document.getElementById('agingScopeLabel').innerText = 
        `${teamAggregates[state.selectedTeam].name} • ${filteredItems.length} ítems evaluados`;
      document.getElementById('aging-bars-container').innerHTML = html;
      // Insight analítico dinámico según el volumen de deuda técnica / aging
      const criticosCount = buckets[3].items.length;
      const envejecidosCount = buckets[2].items.length;
      const riesgoTotal = criticosCount + envejecidosCount;
      const riesgoPct = Math.round((riesgoTotal / total) * 100);
      let insightMessage = '';
      if (riesgoPct > 25) {
        insightMessage = `⚠️ <strong>Riesgo de Deuda de Backlog:</strong> Un <strong>${riesgoPct}%</strong> del inventario supera los 120 días abierto (${riesgoTotal} requerimientos). Te recomendamos abrir el listado de <em>Críticas</em> en Jira para acordar su cierre o cancelación.`;
      } else {
        insightMessage = `✅ <strong>Flujo Saludable:</strong> Más del <strong>${100 - riesgoPct}%</strong> del trabajo se mantiene por debajo de 120 días.`;
      }
      document.getElementById('agingInsightBox').innerHTML = insightMessage;
    }


    function updatePriorityChart(filteredItems) {
      const highCnt = filteredItems.filter(i => i.priority === 'High').length;
      const highestCnt = filteredItems.filter(i => i.priority === 'Highest').length;
      const medCnt = filteredItems.filter(i => i.priority === 'Medium').length;
      const lowCnt = filteredItems.filter(i => i.priority === 'Low').length;
      const total = Math.max(filteredItems.length, 1);
      const highOrAbovePct = Math.round(((highCnt + highestCnt) / total) * 100);

      document.getElementById('priority-donut-pct').innerText = `${highOrAbovePct}%`;
      document.getElementById('priority-donut-svg').innerHTML = `
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#fb7185" stroke-width="3.5" stroke-dasharray="${highOrAbovePct}, 100" stroke-dashoffset="0" />
        <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#38bdf8" stroke-width="3.5" stroke-dasharray="${100 - highOrAbovePct}, 100" stroke-dashoffset="-${highOrAbovePct}" />
      `;
      document.getElementById('priority-legend').innerHTML = `
        <div><span style="color: #fb7185;">●</span> Alta: <strong>${highCnt}</strong></div>
        <div><span style="color: #f43f5e;">●</span> Muy Alta: <strong>${highestCnt}</strong></div>
        <div><span style="color: #38bdf8;">●</span> Media: <strong>${medCnt}</strong></div>
        <div><span style="color: #94a3b8;">●</span> Baja: <strong>${lowCnt}</strong></div>
      `;
      document.getElementById('priority-quote').innerHTML = '<em>"Cuando todo es urgente, nada es urgente."</em> Se recomienda priorización basada en Cost of Delay.';
    }

    function renderBlockerCards(blockerItems) {
      if (blockerItems.length === 0) {
        document.getElementById('blockers-container').innerHTML = `
          <div style="padding: 30px; text-align: center; color: var(--text-muted);">
            No hay iniciativas detenidas bajo los filtros seleccionados.
          </div>
        `;
        return;
      }

      let html = '';
      blockerItems.forEach(b => {
        html += `
          <div class="blocker-card">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <a href="https://tdentel.atlassian.net/browse/${b.key}" target="_blank" class="blocker-id">${b.key} ↗</a>
                <span class="blocker-desc">${b.summary}</span>
              </div>
              <div class="blocker-root"><strong>Causa Raíz:</strong> ${b.blockerCause || 'Bloqueo reportado sin detalle de causa raíz.'}</div>
            </div>
            <div style="text-align: right;">
              <span class="tag-source">${b.team.toUpperCase()}</span>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 0.3rem;">${b.ageDays} días detenido</div>
            </div>
          </div>
        `;
      });
      document.getElementById('blockers-container').innerHTML = html;
    }

    function renderInventoryTable() {
      //const filtered = rawInventoryItems.filter(item => {
      /* const filtered = getFilteredItems().filter(item => {  
        const matchTeam = (state.selectedTeam === 'all') || (item.team === state.selectedTeam);
        const matchStrategic = !state.strategicOnly || item.isPlanning;
        const matchStatus = (state.tableStatus === 'TODOS') || (item.status === state.tableStatus);
        const matchSearch = !state.searchQuery || 
          item.key.toLowerCase().includes(state.searchQuery) ||
          item.summary.toLowerCase().includes(state.searchQuery) ||
          item.assignee.toLowerCase().includes(state.searchQuery);
        const result =
            matchTeam &&
            matchStrategic &&
            matchStatus &&
            matchSearch;
         
        return matchTeam && matchStrategic && matchStatus && matchSearch;
      }); */

      const filtered = getFilteredItems().filter(item => {

        const matchStatus =
          state.tableStatus === 'TODOS' ||
          item.status === state.tableStatus;

        const matchSearch =
          !state.searchQuery ||
          item.key.toLowerCase().includes(state.searchQuery) ||
          item.summary.toLowerCase().includes(state.searchQuery) ||
          item.assignee.toLowerCase().includes(state.searchQuery);

        return (
          matchStatus &&
          matchSearch
        );

      });

      // Botones de filtro de estado
      const statuses = ['TODOS', ...new Set(rawInventoryItems.map(i => i.status))];
                
      let btnHtml = '';
      statuses.forEach((st) => {
        const activeCls = state.tableStatus === st ? 'active' : '';
        btnHtml += `<button class="filter-btn ${activeCls}" onclick="setTableStatusFilter('${st}')">${st}</button>`;
      });
      document.getElementById('filter-buttons-container').innerHTML = btnHtml;

      if (filtered.length === 0) {
        document.getElementById('inventory-tbody').innerHTML = `
          <tr>
            <td colspan="8" style="text-align: center; color: var(--text-dim); padding: 24px;">
              No se encontraron requerimientos que coincidan con los filtros seleccionados.
            </td>
          </tr>
        `;
        return;
      }

      let html = '';
      filtered.forEach(i => {
        let teamBadge = '<span class="badge badge-chile">CDG_CL</span>';
        if (i.team === 'peru') teamBadge = '<span class="badge badge-peru">CDG_PE</span>';
        if (i.team === 'supply') teamBadge = '<span class="badge badge-supply">Supply</span>';

        let typeBadge = i.isPlanning ? '<span class="badge badge-planning">Planning</span>' : '<span class="badge badge-operativo">Operativo</span>';

        let statusBadge = '<span class="badge-status status-en-curso">En Curso</span>';
        if (i.status === 'POR HACER') statusBadge = '<span class="badge-status status-por-hacer">POR HACER</span>';
        if (i.status === 'En Análisis') statusBadge = '<span class="badge-status status-en-analisis">En Análisis</span>';
        if (i.status === 'Implementado') statusBadge = '<span class="badge-status status-implementado">Implementado</span>';
        if (i.status === 'Detenido') statusBadge = '<span class="badge-status status-detenido">Detenido</span>';
        if (i.status === 'Finalizado') statusBadge = '<span class="badge-status status-implementado">Finalizado</span>';
        if (i.status === 'Cancelado') statusBadge = '<span class="badge-status status-detenido">Cancelado</span>';    
        
        html += `
          <tr>
            <td><a href="https://tdentel.atlassian.net/browse/${i.key}" target="_blank" style="color: var(--accent-blue); font-weight:700; text-decoration: none;">${i.key}</a></td>
            <td>${i.summary}</td>
            <td>${teamBadge}</td>
            <td>${typeBadge}</td>
            <td>${statusBadge}</td>
            <td>${i.priority}</td>
            <td>${i.assignee}</td>
            <td>${i.ageDays} días</td>
          </tr>
        `;
      });
/*       console.log(
        'renderInventoryTable',
        filtered.length
      ); */
      document.getElementById('inventory-tbody').innerHTML = html;
      document.getElementById('inventory-subtitle').innerText = `Mostrando ${filtered.length} de ${rawInventoryItems.length} requerimientos activos`;
    }

    // MANEJADORES DE ACCIÓN GLOBAL
    function setTeamFilter(teamKey) {
      state.selectedTeam = teamKey;
      document.querySelectorAll('#teamFilterPills .pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('onclick').includes(`'${teamKey}'`));
      });
      applyGlobalFilters();
    }

    function setStrategicToggle(isChecked) {
      state.strategicOnly = isChecked;
      const label = document.getElementById('toggleLabel');
      if (isChecked) {
        label.innerText = 'Solo Estratégico (Planning)';
        label.style.color = 'var(--accent-purple)';
      } else {
        label.innerText = 'Visión Completa (+ Operaciones)';
        label.style.color = 'var(--text-muted)';
      }
      applyGlobalFilters();
    }

    function setTableStatusFilter(status) {
      state.tableStatus = status;
      renderInventoryTable();
    }

    function handleSearchInput(query) {
      state.searchQuery = query.toLowerCase();
      renderInventoryTable();
    }

    function renderPeriodSelector() {

      const container =
        document.getElementById('period-selector-container');

      if (!container) return;

      let html = `
        <option value="all"
          ${state.selectedPeriod === 'all' ? 'selected' : ''}>
          Todos
        </option>
      `;

      availablePeriods.forEach(period => {

        html += `
          <option
            value="${period}"
            ${state.selectedPeriod === period ? 'selected' : ''}>
            ${formatPeriod(period)}
          </option>
        `;

      });

      container.innerHTML = html;
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
      document.querySelectorAll('.tab-item').forEach(btn => btn.classList.remove('active'));
      
      const target = document.getElementById(tabId);
      if (target) target.classList.add('active');

      const activeBtn = Array.from(document.querySelectorAll('.tab-item')).find(b => b.getAttribute('onclick').includes(tabId));
      if (activeBtn) activeBtn.classList.add('active');
    }

    // INICIALIZACIÓN AL CARGAR LA PÁGINA
    document.addEventListener('DOMContentLoaded', () => {
      // Plan de Acción Estático
      const actions = [
        { priority: "Prioridad 1 • Inmediato", badgeClass: "act-p1", title: "Mesa de Destrabe Inter-Áreas", description: "Convocar a los referentes involucrados para destrabar formalmente las iniciativas detenidas.", impact: "Desbloqueo de hitos clave", deadline: "1 semana" },
        { priority: "Prioridad 1 • Gobernanza", badgeClass: "act-p1", title: "Implantar Límite de WIP (Máx 3 por analista)", description: "Configurar límites estrictos en Jira para las columnas En Curso y En Análisis. Regla: 'Dejar de empezar y comenzar a terminar'.", impact: "-50% en tiempo de ciclo", deadline: "Próximo sprint" },
        { priority: "Prioridad 2 • Eficiencia", badgeClass: "act-p2", title: "Automatizar Reportería Periódica", description: "Desacoplar las entregas repetitivas de inicio de periodo mediante vistas de autoservicio o pipelines programados.", impact: "+40h mensuales por analista", deadline: "3 semanas" },
        { priority: "Prioridad 2 • Higiene", badgeClass: "act-p2", title: "Depuración del Backlog Antiguo", description: "Sesión intensiva con Product Owners para archivar tareas que ya no aportan valor al negocio.", impact: "Visibilidad y foco real", deadline: "2 semanas" },
        { priority: "Prioridad 3 • Estrategia", badgeClass: "act-p3", title: "Rúbrica de Priorización Objetiva (WSJF)", description: "Reemplazar la asignación arbitraria de 'Alta' por una evaluación basada en el Cost of Delay.", impact: "Reducción de urgencias artificiales", deadline: "Mes siguiente" },
        { priority: "Prioridad 3 • Medición", badgeClass: "act-p3", title: "Rutina de Métricas de Flujo", description: "Incorporar seguimiento quincenal de Throughput, Lead Time y Aging en lugar de velocidad por puntos.", impact: "Predictibilidad continua", deadline: "Recurrente" }
      ];
      let actHtml = '';
      actions.forEach(a => {
        actHtml += `
          <div class="action-card">
            <div>
              <span class="action-badge ${a.badgeClass}">${a.priority}</span>
              <h4>${a.title}</h4>
              <p>${a.description}</p>
            </div>
            <div class="action-footer">
              <span>Impacto: ${a.impact}</span>
              <span>Meta: ${a.deadline}</span>
            </div>
          </div>
        `;
      });
      document.getElementById('actions-container').innerHTML = actHtml;
      //console.log("rawInventoryItems:", rawInventoryItems.length);    

      // Ejecutar el motor de filtrado inicial
      //applyGlobalFilters();
      fetch('data.json')
        .then(response => response.json())
        .then(data => {

          if (data.lastUpdate) {
            const fecha = new Date(data.lastUpdate);
            document.getElementById('last-update').innerHTML =
              `🕒 Última sincronización Jira: ${fecha.toLocaleString('es-CL')}`;
          }

          rawInventoryItems = (data.issues || []).map(issue => {

            const labels = issue.fields.labels || [];

            return {
              key: issue.key,
              summary: issue.fields.summary,

              team:
                labels.includes('CDG_CL') ? 'chile' :
                labels.includes('CDG_PE') ? 'peru' :
                'supply',

              isPlanning: labels.includes('Planning'),

              status: issue.fields.status?.name || 'POR HACER',

              priority: issue.fields.priority?.name || 'Medium',

              assignee:
                issue.fields.assignee?.displayName || 'Sin Asignar',

              created: issue.fields.created,
              resolutiondate: issue.fields.resolutiondate,

              createdPeriod: getPeriod(issue.fields.created),
              resolvedPeriod: getPeriod(issue.fields.resolutiondate),

              ageDays: Math.floor(
                (new Date() - new Date(issue.fields.created))
                / (1000 * 60 * 60 * 24)
              )
            };
          });
          /* console.log(rawInventoryItems[0]);
          console.log('Tickets Jira:', rawInventoryItems.length);
          
          console.log('Periodo seleccionado:', state.selectedPeriod); */

          availablePeriods = [
            ...new Set(
              rawInventoryItems.flatMap(item => [
                item.createdPeriod,
                item.resolvedPeriod
              ]).filter(Boolean)
            )
          ].sort().reverse(); 
          
          const latestPeriod = availablePeriods[0];
         

          state.selectedPeriod = availablePeriods[0];
          
         

          renderPeriodSelector();

        

          /* console.log(
            rawInventoryItems.filter(
              i =>
                i.team === 'chile' &&
                i.createdPeriod === state.selectedPeriod
            ).length
          );*/

        

          applyGlobalFilters();

        })
        .catch(error => {
          console.error('Error cargando Jira:', error);
        });    
    });
