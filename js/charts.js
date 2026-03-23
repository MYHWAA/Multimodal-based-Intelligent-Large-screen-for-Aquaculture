// 图表初始化和配置

// 统一色板
const COLORS = {
    main: '#2E8B57',    // 主色: SeaGreen
    aux: '#FFA500',     // 辅助色: Orange
    alert: '#DC143C',   // 警示色: Crimson
    text: '#a0c4e8',    // 文本色
    grid: 'rgba(30, 90, 138, 0.2)', // 网格色
    white: '#ffffff',
    transparent: 'transparent',
    // Gradient helpers
    gradientGreen: (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(46, 139, 87, 0.5)');
        g.addColorStop(1, 'rgba(46, 139, 87, 0.05)');
        return g;
    },
    gradientRed: (ctx) => {
        const g = ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(220, 20, 60, 0.5)');
        g.addColorStop(1, 'rgba(220, 20, 60, 0.05)');
        return g;
    }
};

// 空状态插件
const emptyStatePlugin = {
    id: 'emptyState',
    afterDraw: (chart) => {
        const { ctx, width, height } = chart;
        const hasData = chart.data.datasets.some(dataset => 
            dataset.data && dataset.data.length > 0 && dataset.data.some(v => v !== null && v !== undefined)
        );

        if (!hasData) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '14px Arial';
            ctx.fillStyle = COLORS.text;
            ctx.fillText('暂无数据', width / 2, height / 2);
            ctx.restore();
        }
    }
};
Chart.register(emptyStatePlugin);

// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 注册所有图表
    initAquacultureChart();
    initWeatherChart();
    initSpeciesChart();
    initProductionTrendChart();
    initPassRateChart();
    initAttendanceChart();
    initInventoryChart();
    initEnergyChart();
});

// 通用配置
Chart.defaults.color = COLORS.text;
Chart.defaults.borderColor = COLORS.grid;
Chart.defaults.font.family = "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
// 通用插件配置：标题、数据来源、时间戳
Chart.defaults.plugins.subtitle = {
    display: true,
    position: 'bottom',
    align: 'end',
    text: () => `数据来源: 园区大脑 | 更新: ${new Date().toLocaleTimeString()}`,
    color: '#5c7c9e',
    font: { size: 10, style: 'italic' },
    padding: { top: 10 }
};
Chart.defaults.plugins.legend.labels.color = COLORS.text;

// ---------------------------------------------------------
// 1. 养殖品种分布 (Pie Chart - Drill down)
// ---------------------------------------------------------
function initSpeciesChart() {
    const canvas = document.getElementById('speciesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const mainData = {
        labels: ['鱼类', '虾类', '贝类', '蟹类', '其他品种'],
        data: [38, 27, 18, 12, 5],
        colors: ['#1ea7ff', '#00d68f', '#ffbe3d', '#8f7dff', '#8ca0b3']
    };
    
    const detailedData = {
        '鱼类': {
            labels: ['加州鲈鱼', '罗非鱼', '草鱼', '鳜鱼', '鲫鱼'],
            data: [12, 9, 7, 6, 4],
            colors: ['#0b84d8', '#2c9df0', '#4ab5ff', '#75c8ff', '#a3ddff']
        },
        '虾类': {
            labels: ['南美白对虾', '罗氏沼虾', '青虾', '小龙虾'],
            data: [11, 7, 5, 4],
            colors: ['#00b879', '#19c98b', '#46dba4', '#7debc4']
        },
        '贝类': {
            labels: ['三角帆蚌', '河蚌', '青蛤', '缢蛏'],
            data: [6, 5, 4, 3],
            colors: ['#f6a400', '#ffba30', '#ffce62', '#ffe297']
        },
        '蟹类': {
            labels: ['中华绒螯蟹', '青蟹', '梭子蟹', '河蟹'],
            data: [4, 3, 3, 2],
            colors: ['#7059f3', '#8b76ff', '#a695ff', '#c2b6ff']
        },
        '其他品种': {
            labels: ['甲鱼', '牛蛙', '泥鳅', '黄鳝'],
            data: [2, 1, 1, 1],
            colors: ['#6f859a', '#879cb0', '#a1b4c5', '#bccddb']
        }
    };

    let isDrilledDown = false;
    const getPercentage = (value, dataset) => {
        const total = dataset.reduce((a, b) => a + b, 0);
        return total ? `${((value / total) * 100).toFixed(1)}%` : '0%';
    };
    const setMainView = (chart) => {
        chart.data.labels = mainData.labels;
        chart.data.datasets[0].data = mainData.data;
        chart.data.datasets[0].backgroundColor = mainData.colors;
        chart.options.plugins.title.display = false;
        isDrilledDown = false;
    };
    const setDetailView = (chart, category) => {
        if (!detailedData[category]) return;
        chart.data.labels = detailedData[category].labels;
        chart.data.datasets[0].data = detailedData[category].data;
        chart.data.datasets[0].backgroundColor = detailedData[category].colors;
        chart.options.plugins.title.display = true;
        chart.options.plugins.title.text = `${category}详细分布（点击图表空白区域返回）`;
        isDrilledDown = true;
    };

    const speciesLabelPlugin = {
        id: 'speciesLabelPlugin',
        afterDatasetsDraw(chart) {
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);
            if (!dataset || !meta || !meta.data) return;
            const { ctx } = chart;
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            meta.data.forEach((arc, index) => {
                if (arc.hidden) return;
                const value = Number(dataset.data[index] || 0);
                const text = getPercentage(value, dataset.data);
                const start = arc.startAngle;
                const end = arc.endAngle;
                const mid = (start + end) / 2;
                const angle = end - start;
                const inner = arc.innerRadius || 0;
                const outer = arc.outerRadius || 0;
                const radial = Math.max(outer - inner, 0);
                const baseRadius = inner + radial * 0.62;
                const edgeRadius = inner + radial * 0.86;
                const availableHeight = Math.max(0, radial * 0.72);
                let drawn = false;
                for (const radius of [baseRadius, edgeRadius]) {
                    let fontSize = 10;
                    while (fontSize >= 5) {
                        ctx.font = `${fontSize}px Arial`;
                        const availableWidth = Math.max(0, 2 * radius * Math.sin(angle / 2) * 0.94);
                        if (ctx.measureText(text).width <= availableWidth && fontSize <= availableHeight) {
                            const x = arc.x + Math.cos(mid) * radius;
                            const y = arc.y + Math.sin(mid) * radius;
                            ctx.fillText(text, x, y);
                            drawn = true;
                            break;
                        }
                        fontSize -= 1;
                    }
                    if (drawn) break;
                }
            });
            ctx.restore();
        }
    };

    const chart = new Chart(ctx, {
        plugins: [speciesLabelPlugin],
        type: 'pie',
        data: {
            labels: mainData.labels,
            datasets: [{
                data: mainData.data,
                backgroundColor: mainData.colors,
                borderColor: 'rgba(0,0,0,0.5)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 20, // Increased to ensure gap between legend and chart
                    right: 0,
                    top: 0,
                    bottom: 0
                }
            },
            plugins: {
                subtitle: {
                    display: false
                },
                title: {
                    display: false,
                    text: '养殖品种占比（点击图例查看详细分类）',
                    font: { size: 14 },
                    color: COLORS.white
                },
                legend: {
                    position: 'left',
                    align: 'center',
                    fullSize: true,
                    labels: {
                        color: '#ffffff',
                        boxWidth: 8,
                        boxHeight: 8,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        padding: 8,
                        font: { size: 12 },
                        generateLabels: (chart) => {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    return {
                                        text: `${label} ${getPercentage(value, data.datasets[0].data)}`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        fontColor: '#ffffff',
                                        hidden: isNaN(data.datasets[0].data[i]) || chart.getDatasetMeta(0).data[i].hidden,
                                        index: i,
                                        lineWidth: 0 // Ensure no border issues
                                    };
                                });
                            }
                            return [];
                        }
                    },
                    maxWidth: 170,
                    onClick: (e, legendItem, legend) => {
                        const index = legendItem.index;
                        const ci = legend.chart;
                        if (!isDrilledDown) {
                            const category = mainData.labels[index];
                            setDetailView(ci, category);
                            ci.update();
                            return;
                        }
                        const meta = ci.getDatasetMeta(0);
                        if (meta.data[index]) {
                            meta.data[index].hidden = !meta.data[index].hidden;
                        }
                        ci.update();
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1) + '%';
                            return `${label}: ${percentage}`;
                        }
                    }
                }
            },
            onClick: (event, elements) => {
                if (!isDrilledDown && elements.length) {
                    const index = elements[0].index;
                    const category = mainData.labels[index];
                    setDetailView(chart, category);
                } else if (isDrilledDown) {
                    setMainView(chart);
                }
                chart.update();
            }
        },
    });
}

// ---------------------------------------------------------
// 2. 近五年产量趋势 (Line Chart - Dual Y, Filter)
// ---------------------------------------------------------
function initProductionTrendChart() {
    const canvas = document.getElementById('productionTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const filterSelect = document.getElementById('productionYearFilter');

    // Data Store
    const allData = {
        labels: ['2019', '2020', '2021', '2022', '2023'],
        production: [1200, 1350, 1500, 1680, 1950],
        growth: [5.2, 12.5, 11.1, 12.0, 16.1]
    };

    const yearData = {
        '2023': { labels: ['Q1', 'Q2', 'Q3', 'Q4'], prod: [400, 550, 600, 400], growth: [10, 15, 20, 12] },
        '2022': { labels: ['Q1', 'Q2', 'Q3', 'Q4'], prod: [350, 480, 520, 330], growth: [8, 12, 15, 10] },
        '2021': { labels: ['Q1', 'Q2', 'Q3', 'Q4'], prod: [300, 420, 480, 300], growth: [5, 10, 12, 8] }
    };

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allData.labels,
            datasets: [
                {
                    label: '产量 (吨)',
                    data: allData.production,
                    borderColor: COLORS.main, // #2E8B57
                    backgroundColor: 'rgba(46, 139, 87, 0.1)',
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: '同比增长 (%)',
                    data: allData.growth,
                    borderColor: COLORS.aux, // #FFA500
                    backgroundColor: 'transparent',
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.3,
                    pointStyle: 'rectRot',
                    pointRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                title: { display: true, text: '年度产量与增长趋势', color: COLORS.white },
                tooltip: {
                    callbacks: {
                        label: (c) => c.dataset.label + ': ' + c.raw + (c.datasetIndex === 1 ? '%' : 't')
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    type: 'linear', display: true, position: 'left',
                    title: { display: true, text: '产量 (吨)', color: COLORS.main },
                    grid: { color: COLORS.grid }
                },
                y1: {
                    type: 'linear', display: true, position: 'right',
                    title: { display: true, text: '增长率 (%)', color: COLORS.aux },
                    grid: { display: false },
                    ticks: { callback: v => v + '%' }
                }
            }
        }
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'all') {
                chart.data.labels = allData.labels;
                chart.data.datasets[0].data = allData.production;
                chart.data.datasets[1].data = allData.growth;
                chart.options.plugins.title.text = '年度产量与增长趋势';
            } else if (yearData[val]) {
                chart.data.labels = yearData[val].labels;
                chart.data.datasets[0].data = yearData[val].prod;
                chart.data.datasets[1].data = yearData[val].growth;
                chart.options.plugins.title.text = `${val}年季度产量详情`;
            }
            chart.update();
        });
    }
}

// ---------------------------------------------------------
// 3. 检测合格率趋势 (Area Chart - Baseline, Toggle)
// ---------------------------------------------------------
function initPassRateChart() {
    const canvas = document.getElementById('passRateChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const toggleContainer = document.getElementById('passRateToggle');

    // Data
    const monthlyData = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [94.5, 96.2, 93.8, 97.5, 98.2, 99.0]
    };
    const yearlyData = {
        labels: ['2020', '2021', '2022', '2023'],
        data: [92.5, 94.8, 96.5, 98.2]
    };

    // Helper for gradient threshold
    function getGradient(ctx, chartArea, threshold, chart, alpha = 1) {
        if (!chartArea || !chart) return COLORS.main;
        const {top, bottom} = chartArea;
        const scale = chart.scales.y;
        if (!scale) return COLORS.main; // Fallback
        
        // yPixel for threshold (95)
        const yPixel = scale.getPixelForValue(threshold);
        
        // Create gradient from top (high value) to bottom (low value)
        const gradient = ctx.createLinearGradient(0, top, 0, bottom);
        
        // Calculate offset (0 to 1)
        let offset = (yPixel - top) / (bottom - top);
        offset = Math.max(0, Math.min(1, offset));

        // Color stops:
        gradient.addColorStop(0, `rgba(46, 139, 87, ${alpha})`); // Green at top
        gradient.addColorStop(offset, `rgba(46, 139, 87, ${alpha})`); // Green until threshold
        gradient.addColorStop(offset, `rgba(220, 20, 60, ${alpha})`); // Red starts at threshold
        gradient.addColorStop(1, `rgba(220, 20, 60, ${alpha})`); // Red at bottom
        
        return gradient;
    }

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: '合格率',
                data: monthlyData.data,
                borderColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return COLORS.main;
                    return getGradient(ctx, chartArea, 95, chart); 
                },
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) return 'rgba(46, 139, 87, 0.5)';
                    return getGradient(ctx, chartArea, 95, chart, 0.5); 
                },
                fill: true,
                tension: 0.4,
                pointBackgroundColor: COLORS.white,
                pointBorderColor: COLORS.main
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: false },
                subtitle: { display: false },
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        boxWidth: 12,
                        padding: 10
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 95,
                            yMax: 95,
                            borderColor: 'rgba(255, 255, 255, 0.6)',
                            borderWidth: 1,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: '95% 基准线',
                                position: 'end',
                                yAdjust: -10,
                                backgroundColor: 'rgba(0,0,0,0.3)',
                                color: 'rgba(255,255,255,0.9)',
                                font: { size: 10 },
                                padding: 4
                            }
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: c => `${c.raw}%`
                    }
                }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    min: 90, max: 100,
                    grid: { color: COLORS.grid },
                    ticks: { stepSize: 2, callback: v => v + '%' }
                }
            }
        }
    });

    if (toggleContainer) {
        const btns = toggleContainer.querySelectorAll('button');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // UI Toggle
                btns.forEach(b => {
                    b.classList.remove('active');
                });
                e.target.classList.add('active');

                // Data Update
                const type = e.target.textContent.trim();
                if (type === '季度' || type === '月度') { 
                    chart.data.labels = monthlyData.labels;
                    chart.data.datasets[0].data = monthlyData.data;
                } else {
                    chart.data.labels = yearlyData.labels;
                    chart.data.datasets[0].data = yearlyData.data;
                }
                chart.update();
            });
        });
    }
}

// ---------------------------------------------------------
// 4. 今日人员考勤 (Doughnut - Real-time)
// ---------------------------------------------------------
function initAttendanceChart() {
    const canvas = document.getElementById('attendanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerText = document.getElementById('attendanceCenterText');
    const rateNode = centerText ? centerText.querySelector('.attendance-rate') : null;
    const labelNode = centerText ? centerText.querySelector('.attendance-label') : null;
    const TOTAL_STAFF = 54;

    function getAttendanceSnapshot(date) {
        const hour = date.getHours();
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        let onDuty = 48;
        let leave = 4;
        let absent = 2;
        if (hour <= 5) {
            onDuty = 43;
            leave = 7;
            absent = 4;
        } else if (hour <= 8) {
            onDuty = 46;
            leave = 5;
            absent = 3;
        } else if (hour <= 11) {
            onDuty = 49;
            leave = 3;
            absent = 2;
        } else if (hour <= 13) {
            onDuty = 47;
            leave = 5;
            absent = 2;
        } else if (hour <= 17) {
            onDuty = 50;
            leave = 2;
            absent = 2;
        } else if (hour <= 20) {
            onDuty = 48;
            leave = 4;
            absent = 2;
        } else {
            onDuty = 45;
            leave = 6;
            absent = 3;
        }
        if (isWeekend) {
            onDuty = Math.max(40, onDuty - 3);
            leave += 2;
            absent += 1;
        }
        const total = onDuty + leave + absent;
        if (total !== TOTAL_STAFF) {
            leave = Math.max(0, leave + (TOTAL_STAFF - total));
        }
        return { onDuty, leave, absent };
    }

    let stats = getAttendanceSnapshot(new Date());

    function updateCenterText(rate) {
        if (!rateNode || !labelNode) return;
        rateNode.textContent = `${rate}%`;
        labelNode.textContent = `总${TOTAL_STAFF}人`;
        rateNode.classList.toggle('is-warning', rate < 90);
    }

    function positionCenterText(chartInstance) {
        if (!centerText) return;
        const arc = chartInstance.getDatasetMeta(0)?.data?.[0];
        if (!arc) return;
        centerText.style.left = `${arc.x}px`;
        centerText.style.top = `${arc.y}px`;
    }

    const attendanceCenterAlignPlugin = {
        id: 'attendanceCenterAlign',
        afterDatasetsDraw(chartInstance) {
            positionCenterText(chartInstance);
        },
        resize(chartInstance) {
            positionCenterText(chartInstance);
        }
    };
    
    const chart = new Chart(ctx, {
        plugins: [attendanceCenterAlignPlugin],
        type: 'doughnut',
        data: {
            labels: ['在岗', '请假', '缺勤'],
            datasets: [
                {
                    data: [stats.onDuty, stats.leave, stats.absent],
                    backgroundColor: [COLORS.main, COLORS.aux, COLORS.alert],
                    borderWidth: 0,
                    weight: 2
                },
                {
                    data: [stats.onDuty, stats.leave + stats.absent],
                    backgroundColor: ['rgba(46, 139, 87, 0.3)', 'transparent'],
                    borderWidth: 0,
                    weight: 0.5,
                    cutout: '85%'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                title: { display: false },
                legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } }
            }
        }
    });
    const initialRate = Math.round((stats.onDuty / TOTAL_STAFF) * 100);
    updateCenterText(initialRate);
    positionCenterText(chart);

    setInterval(() => {
        stats = getAttendanceSnapshot(new Date());
        chart.data.datasets[0].data = [stats.onDuty, stats.leave, stats.absent];
        const rate = Math.round((stats.onDuty / TOTAL_STAFF) * 100);
        chart.data.datasets[1].data = [stats.onDuty, TOTAL_STAFF - stats.onDuty];
        chart.update();
        updateCenterText(rate);
    }, 300000);
}

// ---------------------------------------------------------
// 5. 物资库存预警 (Bar - 3 Colors, Filter)
// ---------------------------------------------------------
function initInventoryChart() {
    const canvas = document.getElementById('inventoryChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const filterSelect = document.getElementById('inventoryFilter');

    // Data
    const allItems = {
        labels: ['饲料A', '消毒液', '增氧剂', '试剂', '疫苗'],
        current: [650, 180, 120, 95, 200],
        safe: [500, 200, 300, 100, 150],
        type: ['feed', 'drug', 'drug', 'drug', 'drug']
    };

    function getColor(curr, safe) {
        if (curr < safe * 0.5) return COLORS.alert;  // 红色短缺
        if (curr < safe) return COLORS.aux;         // 黄色预警
        return COLORS.main;                          // 绿色充足
    }

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: allItems.labels,
            datasets: [
                {
                    label: '实际库存',
                    data: allItems.current,
                    backgroundColor: allItems.current.map((v, i) => getColor(v, allItems.safe[i])),
                    borderWidth: 0,
                    borderRadius: 4
                },
                {
                    label: '安全库存',
                    data: allItems.safe,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 4,
                    type: 'bar'
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '物资库存与安全预警', color: COLORS.white },
                tooltip: {
                    callbacks: {
                        afterBody: (context) => {
                            const i = context[0].dataIndex;
                            const curr = allItems.current[i];
                            const safe = allItems.safe[i];
                            if (curr < safe) return `\n采购建议: 建议采购 ${safe * 1.5 - curr} 单位`;
                            return '\n状态: 充足';
                        }
                    }
                }
            },
            scales: {
                x: { grid: { color: COLORS.grid }, ticks: { color: COLORS.text } },
                y: { grid: { display: false }, ticks: { color: COLORS.text } }
            }
        }
    });

    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            const filteredIndices = allItems.type.map((t, i) => (val === 'all' || t === val) ? i : -1).filter(i => i !== -1);
            
            chart.data.labels = filteredIndices.map(i => allItems.labels[i]);
            chart.data.datasets[0].data = filteredIndices.map(i => allItems.current[i]);
            chart.data.datasets[0].backgroundColor = filteredIndices.map(i => getColor(allItems.current[i], allItems.safe[i]));
            chart.data.datasets[1].data = filteredIndices.map(i => allItems.safe[i]);
            chart.update();
        });
    }
}

// ---------------------------------------------------------
// 6. 园区能耗趋势分析 (Combo - Export, Toggle)
// ---------------------------------------------------------
function initEnergyChart() {
    const canvas = document.getElementById('energyChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const exportBtn = document.getElementById('energyExportBtn');
    const toggleGroup = document.getElementById('energyToggle');

    // Data
    const dataYoY = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        total: [4820, 4680, 4950, 5280, 5750, 6210],
        unit: [0.52, 0.5, 0.49, 0.47, 0.45, 0.44]
    };
    const dataMoM = {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        total: [4700, 4560, 4810, 5190, 5620, 6030],
        unit: [0.53, 0.51, 0.5, 0.48, 0.46, 0.45]
    };

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataYoY.labels,
            datasets: [
                {
                    type: 'line',
                    label: '总能耗 (kWh)',
                    data: dataYoY.total,
                    backgroundColor: 'rgba(46, 139, 87, 0.18)',
                    borderColor: COLORS.main,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    yAxisID: 'y'
                },
                {
                    type: 'line',
                    label: '单位能耗 (kWh/kg)',
                    data: dataYoY.unit,
                    borderColor: COLORS.aux,
                    borderWidth: 2,
                    pointBackgroundColor: COLORS.aux,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: '园区能耗分析', color: COLORS.white }
            },
            scales: {
                x: { grid: { display: false } },
                y: {
                    type: 'linear', position: 'left',
                    title: { display: true, text: '总能耗', color: COLORS.main },
                    grid: { color: COLORS.grid }
                },
                y1: {
                    type: 'linear', position: 'right',
                    title: { display: true, text: '单位能耗', color: COLORS.aux },
                    grid: { display: false }
                }
            }
        }
    });

    // Toggle Logic
    if (toggleGroup) {
        const btns = toggleGroup.querySelectorAll('button');
        btns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                btns.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                e.target.classList.add('active');
                e.target.setAttribute('aria-pressed', 'true');

                const type = e.target.textContent.trim();
                const data = type === '同比' ? dataYoY : dataMoM;
                chart.data.datasets[0].data = data.total;
                chart.data.datasets[1].data = data.unit;
                chart.update();
            });
        });
    }

    function buildCsvContent(typeLabel, data) {
        const header = ['月份', '总能耗(kWh)', '单位能耗(kWh/kg)'];
        const rows = data.labels.map((label, index) => [
            label,
            data.total[index],
            data.unit[index]
        ]);
        return [
            `统计口径,${typeLabel}`,
            header.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
    }

    function downloadCsv(content, fileName) {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const selectedType = toggleGroup && toggleGroup.querySelector('button.active')
                ? toggleGroup.querySelector('button.active').textContent.trim()
                : '同比';
            const selectedData = selectedType === '同比' ? dataYoY : dataMoM;
            const csv = buildCsvContent(selectedType, selectedData);
            const fileDate = new Date().toISOString().slice(0, 10);
            downloadCsv(csv, `园区能耗分析_${selectedType}_${fileDate}.csv`);
        });
    }
}

// ---------------------------------------------------------
// 7. 其他辅助图表
// ---------------------------------------------------------
function initAquacultureChart() {
    const canvas = document.getElementById('aquacultureChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['存活率', '生长速度', '饲料转化', '水质指数', '溶氧水平', '疾病控制'],
            datasets: [{
                label: '指标值',
                data: [91, 84, 79, 87, 83, 89],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.6)', 'rgba(0, 255, 136, 0.6)', 'rgba(255, 204, 0, 0.6)',
                    'rgba(0, 128, 255, 0.6)', 'rgba(102, 126, 234, 0.6)', 'rgba(255, 136, 0, 0.6)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: { beginAtZero: true, max: 100, grid: { color: COLORS.grid } },
                y: { grid: { display: false } }
            }
        }
    });
}

function initWeatherChart() {
    const canvas = document.getElementById('weatherChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const hours = Array.from({length: 24}, (_, i) => (i + ':00'));
    const month = new Date().getMonth() + 1;
    const seasonalOffset = month >= 6 && month <= 9 ? 2.2 : month <= 2 || month === 12 ? -2.6 : 0;
    const cloudFactor = [0.6, 0.5, 0.5, 0.4, 0.2, 0.1, -0.2, -0.3, -0.5, -0.2, 0, 0.2, 0.4, 0.6, 0.4, 0.1, 0, -0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7];
    const humidityFactor = [7, 6, 6, 5, 4, 3, 2, 0, -2, -3, -4, -4, -3, -2, -1, 0, 1, 2, 4, 5, 6, 7, 8, 8];
    const temperatureSeries = hours.map((_, i) => {
        const cycle = Math.sin(((i - 6) / 24) * Math.PI * 2);
        const value = 24 + seasonalOffset + cycle * 4.8 + cloudFactor[i];
        return Number(value.toFixed(1));
    });
    const humiditySeries = temperatureSeries.map((temp, i) => {
        const value = 82 - (temp - 22) * 2.1 + humidityFactor[i];
        return Math.max(58, Math.min(96, Number(value.toFixed(1))));
    });
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [
                {
                    label: '温度 (°C)',
                    data: temperatureSeries,
                    borderColor: '#ff6b6b',
                    yAxisID: 'y-temp',
                    tension: 0.4,
                    pointRadius: 0
                },
                {
                    label: '湿度 (%)',
                    data: humiditySeries,
                    borderColor: '#4facfe',
                    yAxisID: 'y-humidity',
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
                'y-temp': { type: 'linear', position: 'left', min: 0, max: 50 },
                'y-humidity': { type: 'linear', position: 'right', min: 0, max: 100, grid: { display: false } }
            }
        }
    });
}

window.chartFunctions = {
    initAquacultureChart, initWeatherChart, initSpeciesChart,
    initProductionTrendChart, initPassRateChart,
    initAttendanceChart, initInventoryChart, initEnergyChart
};
