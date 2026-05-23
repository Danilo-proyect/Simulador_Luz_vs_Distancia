let myChart;
let selectedIndex = 0;

function selectRow(index) {
    selectedIndex = index;
    
    // Actualizar estilo de fila activa
    document.querySelectorAll('#dataTable tr').forEach((row, i) => {
        if (i === selectedIndex) row.classList.add('active-row');
        else row.classList.remove('active-row');
    });

    updateSimulation();
}

function updateSimulation() {
    const dists = Array.from(document.querySelectorAll('.dist-input')).map(i => parseFloat(i.value) || 0);
    const luxes = Array.from(document.querySelectorAll('.lux-input')).map(i => parseFloat(i.value) || 0);
    const n = dists.length;

    // 1. Matemáticas (Mínimos Cuadrados)
    let sumX = dists.reduce((a, b) => a + b, 0);
    let sumY = luxes.reduce((a, b) => a + b, 0);
    let sumXY = dists.reduce((a, b, i) => a + (dists[i] * luxes[i]), 0);
    let sumXX = dists.reduce((a, b) => a + (b * b), 0);

    const divisor = (n * sumXX - sumX * sumX);
    const m = divisor === 0 ? 0 : (n * sumXY - sumX * sumY) / divisor;
    const b = n === 0 ? 0 : (sumY - m * sumX) / n;

    const yMean = sumY / n;
    const ssTot = luxes.reduce((a, val) => a + Math.pow(val - yMean, 2), 0);
    const ssRes = luxes.reduce((a, val, i) => a + Math.pow(val - (m * dists[i] + b), 2), 0);
    const r2 = ssTot === 0 ? 1 : 1 - (ssRes / ssTot);

    // 2. Escribir Ecuación
    document.getElementById('equationText').innerText = `L(d) = ${m.toFixed(2)}d + ${b.toFixed(2)}`;
    document.getElementById('r2Text').innerText = `R² = ${r2.toFixed(4)}`;

    // 3. Física del Simulador (Alineación Perfecta)
    const currentDist = dists[selectedIndex]; 
    const currentLux = luxes[selectedIndex];

    // La pista mide matemáticamente hasta 3.0 metros.
    const positionPercentage = (currentDist / 3.0) * 100;
    
    const phone = document.getElementById('phoneSim');
    phone.style.left = `${positionPercentage}%`;
    document.getElementById('phoneReading').innerText = currentLux;
    
    // Intensidad de la luz dinámica
    const normalizedLux = Math.max(0, Math.min(1, currentLux / 400));
    document.getElementById('lampGlow').style.boxShadow = `0 0 ${20 + (normalizedLux * 60)}px ${10 + (normalizedLux * 20)}px #fff`;

    // 4. Actualizar Gráfico
    if (myChart) myChart.destroy();
    const ctx = document.getElementById('regressionChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos Experimentales',
                data: dists.map((d, i) => ({ x: d, y: luxes[i] })),
                backgroundColor: '#00f2ff', pointRadius: 7
            }, {
                label: 'Modelo Lineal',
                data: [{x: Math.min(...dists), y: m * Math.min(...dists) + b}, {x: Math.max(...dists), y: m * Math.max(...dists) + b}],
                type: 'line', borderColor: '#9aff00', borderWidth: 2, fill: false, borderDash: [5, 5], pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Distancia (m)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff' } },
                y: { title: { display: true, text: 'Intensidad (Lux)', color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#fff' } }
            },
            plugins: { legend: { labels: { color: '#fff' } } }
        }
    });
}

// Event Listeners
window.onload = updateSimulation;
document.body.addEventListener('input', function(e) {
    if (e.target.classList.contains('dist-input') || e.target.classList.contains('lux-input')) updateSimulation();
});