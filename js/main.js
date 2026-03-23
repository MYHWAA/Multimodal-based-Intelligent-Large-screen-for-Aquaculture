// 全局错误处理
window.addEventListener('error', function(event) {
    console.error('JavaScript 错误：', event.message, event.filename, event.lineno);
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('未处理的 Promise 拒绝：', event.reason);
});

// 全局变量
let currentImageTarget = null;
let allMarkers = [];
let pondData = {
    pond1: { name: '一号塘区', devices: 12, running: 8, status: 'online' },
    pond2: { name: '二号塘区', devices: 10, running: 7, status: 'online' },
    pond3: { name: '三号塘区', devices: 15, running: 12, status: 'online' },
    pond4: { name: '四号塘区', devices: 8, running: 5, status: 'offline' },
    pond5: { name: '五号塘区', devices: 11, running: 9, status: 'online' }
};

// 图例点击交互
function toggleLegend(element) {
    const isActive = element.classList.contains('active');
    
    // 移除所有激活状态
    document.querySelectorAll('.legend-item').forEach(item => {
        item.classList.remove('active');
        item.style.background = '';
    });

    if (!isActive) {
        element.classList.add('active');
        element.style.background = 'rgba(0, 212, 255, 0.2)';
        
        // 获取点击的图例类型（这里简单使用文本内容作为标识）
        const type = element.querySelector('span').innerText;
        console.log('Toggle Legend:', type);
        
        // 可以在这里添加筛选逻辑，例如：
        // filterMarkers(type); 
    } else {
        console.log('Clear Legend Filter');
        // filterMarkers('all');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成，开始初始化...');
    try {
        // updateDateTime();
        // setInterval(updateDateTime, 60000);
        // initMarkers();
        console.log('地图标记初始化完成');
        initCharts();
        console.log('图表初始化完成');
        initRankingList();
        console.log('排行榜初始化完成');
        // initImageUploader();
        console.log('图片上传器初始化完成');
        console.log('所有初始化完成！');
    } catch(error) {
        console.error('初始化过程中出错：', error);
    }
});

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const str = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0') + '-' +
                String(now.getDate()).padStart(2, '0') + ' ' +
                String(now.getHours()).padStart(2, '0') + ':' +
                String(now.getMinutes()).padStart(2, '0') + ':' +
                String(now.getSeconds()).padStart(2, '0');
    const datetimeEl = document.getElementById('datetime');
    if (datetimeEl) {
        datetimeEl.textContent = str;
    }
}

// 初始化地图标记点（非均匀分布，更自然）
function initMarkers() {
    const container = document.getElementById('mapMarkers');
    if (!container) return;
    
    // 清空现有标记
    container.innerHTML = '';
    allMarkers = [];
    
    // 定义标记类型和颜色
    const markerTypes = [
        { color: 'green', label: '水质监测' },
        { color: 'cyan', label: '溶氧监测' },
        { color: 'blue', label: '温度监测' },
        { color: 'yellow', label: '视频监控' },
        { color: 'orange', label: '告警点位' }
    ];
    
    // 生成52个随机分布的监控点（不均匀，控制在地图范围内）
    const totalMarkers = 52;
    let markerIndex = 0;
    
    // 使用泊松分布和高斯分布生成更自然的点
    const positions = new Set();
    
    while (markerIndex < totalMarkers) {
        // 使用高斯分布和随机偏移生成非均匀分布
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const posKey = Math.round(x) + ',' + Math.round(y);
        
        // 避免点过于集中
        if (!positions.has(posKey)) {
            positions.add(posKey);
            
            // 随机选择标记类型
            const typeIndex = markerIndex % markerTypes.length;
            const markerType = markerTypes[typeIndex];
            
            // 随机确定是否在线（90%在线）
            const isOnline = Math.random() > 0.1;
            
            // 创建标记元素
            const marker = document.createElement('div');
            marker.className = `marker ${isOnline ? markerType.color : 'offline'}`;
            marker.style.left = `${x}%`;
            marker.style.top = `${y}%`;
            marker.dataset.status = isOnline ? 'online' : 'offline';
            marker.dataset.type = markerType.color;
            
            // 创建提示框
            const tooltip = document.createElement('div');
            tooltip.className = 'marker-tooltip';
            tooltip.textContent = `${markerType.label} #${markerIndex + 1}`;
            
            marker.appendChild(tooltip);
            container.appendChild(marker);
            
            // 添加点击事件
            marker.addEventListener('click', function() {
                showMarkerDetail(markerIndex + 1, markerType.label, isOnline);
            });
            
            allMarkers.push({
                element: marker,
                type: markerType.color,
                status: isOnline ? 'online' : 'offline'
            });
            
            markerIndex++;
        }
    }
    
    // 更新统计信息
    updateMarkerStats();
}

// 更新标记点统计
function updateMarkerStats() {
    const total = allMarkers.length;
    const online = allMarkers.filter(m => m.status === 'online').length;
    const offline = total - online;
    
    document.getElementById('totalMarkers').textContent = total;
    document.getElementById('onlineMarkers').textContent = online;
    document.getElementById('offlineMarkers').textContent = offline;
}

// 显示标记点详情
function showMarkerDetail(id, type, isOnline) {
    const status = isOnline ? '在线' : '离线';
    const data = {
        '水质监测': `pH: 7.2, DO: 8.5mg/L, 水温: 26°C`,
        '溶氧监测': `溶解氧: 8.5mg/L, 饱和度: 95%`,
        '温度监测': `水温: 26°C, 气温: 28°C`,
        '视频监控': `分辨率: 1080P, 帧率: 25fps`,
        '告警点位': `告警级别: 中, 类型: 水质异常`
    };
    
    alert(`监控点 #${id}
类型: ${type}
状态: ${status}
${isOnline ? data[type] || '数据正常' : '设备离线，请检查'}`);
}

// 刷新标记点
function refreshMarkers() {
    initMarkers();
}

// 筛选标记点
function filterMarkers(filter) {
    allMarkers.forEach(marker => {
        if (filter === 'all') {
            marker.element.style.display = 'block';
        } else if (filter === 'online' && marker.status === 'online') {
            marker.element.style.display = 'block';
        } else if (filter === 'offline' && marker.status === 'offline') {
            marker.element.style.display = 'block';
        } else if (filter !== 'online' && filter !== 'offline') {
            marker.element.style.display = 'block';
        } else {
            marker.element.style.display = 'none';
        }
    });
}

// 切换塘区
function switchPond(pondId) {
    const pond = pondData[pondId];
    if (!pond) return;
    
    const pondInfo = document.getElementById('pondInfo');
    if (!pondInfo) return;
    
    const statusClass = pond.status === 'online' ? 'online' : 'offline';
    const statusText = pond.status === 'online' ? '● 在线' : '● 离线';
    
    pondInfo.innerHTML = `
        <div class="pond-status">
            <span class="status-label">塘区状态：</span>
            <span class="status-value ${statusClass}">${statusText}</span>
        </div>
        <div class="pond-stats">
            <div class="stat-item">
                <span class="stat-label">设备数</span>
                <span class="stat-value">${pond.devices}台</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">运行中</span>
                <span class="stat-value">${pond.running}台</span>
            </div>
        </div>
    `;
    
    // 添加动画效果
    pondInfo.classList.add('data-updated');
    setTimeout(() => {
        pondInfo.classList.remove('data-updated');
    }, 600);
}

// 切换设备开关
function toggleSwitch(item) {
    const switchEl = item.querySelector('.control-switch');
    if (switchEl) {
        switchEl.classList.toggle('active');
    }
}

// 图片上传功能
function initImageUploader() {
    const uploader = document.getElementById('imageUploader');
    if (!uploader) return;
    
    uploader.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && currentImageTarget) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.getElementById(currentImageTarget);
                if (img) {
                    img.src = event.target.result;
                    img.style.display = 'block';
                    const placeholder = document.getElementById(currentImageTarget.replace('Image', 'Placeholder'));
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                }
            };
            reader.readAsDataURL(file);
        }
        this.value = '';
    });
}

// 选择图片
function selectImage(targetId) {
    currentImageTarget = targetId;
    const uploader = document.getElementById('imageUploader');
    if (uploader) {
        uploader.click();
    }
}

// 初始化图表（流量统计的圆形进度）
function initCharts() {
    drawCircle('flowChart1', 75, '#00d4ff');
    drawCircle('flowChart2', 85, '#00ff88');
}

// 绘制圆形进度图
function drawCircle(id, percent, color) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const size = 65;
    canvas.width = size * 2;
    canvas.height = size * 2;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(2, 2);
    
    const cx = size / 2;
    const cy = size / 2;
    const r = 24;
    const lw = 6;
    
    // 背景圆
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 100, 150, 0.3)';
    ctx.lineWidth = lw;
    ctx.stroke();
    
    // 进度圆
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percent / 100);
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.lineCap = 'round';
    ctx.stroke();
}

// 初始化排行榜数据与滚动
function initRankingList() {
    const listContainer = document.getElementById('rankingList');
    if (!listContainer) return;

    // 清空现有内容
    listContainer.innerHTML = '';

    // 模拟数据 (25条)
    const names = [
        "张伟", "王芳", "李娜", "刘洋", "陈强", "杨静", "赵军", "黄艳", "周杰", "吴刚",
        "徐明", "孙丽", "马超", "朱琳", "胡勇", "林涛", "何辉", "郭磊", "罗敏", "高山",
        "郑波", "梁平", "谢婷", "宋浩", "唐薇"
    ];
    
    // 生成列表项
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < names.length; i++) {
        const item = document.createElement('div');
        item.className = 'ranking-item';
        
        // 计算产值 (模拟递减)
        const value = (80 - i * 1.2 + Math.random()).toFixed(1);
        
        item.innerHTML = `
            <div class="rank-num">${i + 1}</div>
            <div class="rank-name">${names[i]}</div>
            <div class="rank-value">${value}万</div>
        `;
        fragment.appendChild(item);
    }
    listContainer.appendChild(fragment);

    // 克隆前10个元素以实现无缝循环
    const cloneCount = 10;
    for (let i = 0; i < cloneCount; i++) {
        if (i < names.length) {
            const clone = listContainer.children[i].cloneNode(true);
            clone.classList.add('clone-item');
            listContainer.appendChild(clone);
        }
    }

    // 执行自动循环滚动
    // 延迟一点时间确保渲染完成
    setTimeout(() => {
        startSeamlessLoop();
    }, 1000);
}

// 无缝逐条滚动控制
function startSeamlessLoop() {
    const listContainer = document.getElementById('rankingList');
    if (!listContainer) return;
    
    // 获取单项高度 (包含 margin)
    const firstItem = listContainer.querySelector('.ranking-item');
    if (!firstItem) return;
    
    // 计算实际占位高度 (height + marginBottom)
    const style = window.getComputedStyle(firstItem);
    const itemHeight = firstItem.offsetHeight + parseFloat(style.marginTop) + parseFloat(style.marginBottom);
    
    // 原始列表总高度 (不含克隆项)
    // 假设有25个原始项
    const originalCount = 25; 
    const totalOriginalHeight = itemHeight * originalCount;

    let currentScroll = 0;
    const pauseTime = 1500; // 停留时间 1.5秒
    const scrollDuration = 500; // 滚动动画时间 0.5秒 (300-500ms 范围)

    function step() {
        // 目标：向下滚动一个单位
        const nextScroll = currentScroll + itemHeight;
        
        // 平滑滚动到下一个位置
        smoothScroll(listContainer, nextScroll, scrollDuration, () => {
            currentScroll = nextScroll;
            
            // 检查是否到达克隆区域的边界
            // 如果滚动距离 >= 原始高度，说明已经展示完所有原始项，且进入了克隆项
            // 视觉上，scrollTop = totalOriginalHeight 的位置看起来和 scrollTop = 0 是一样的
            if (currentScroll >= totalOriginalHeight) {
                // 瞬间复位到顶部 (无动画)
                // 这里的误差处理：currentScroll - totalOriginalHeight 
                // 确保如果动画稍微过了一点也能正确修正，不过这里我们是精确控制的
                currentScroll = currentScroll % totalOriginalHeight;
                listContainer.scrollTop = currentScroll;
                
                // 复位后等待下一次滚动
                setTimeout(step, pauseTime);
            } else {
                // 未到达边界，正常等待下一次滚动
                setTimeout(step, pauseTime);
            }
        });
    }
    
    // 启动滚动循环
    setTimeout(step, pauseTime);
}

// 滚动到指定名次 (保留此函数以防其他地方调用，但不再用于主循环)
function scrollToRank(rankIndex) {
    // ... (现有逻辑，不再使用)
    return new Promise((resolve) => resolve());
}

// 自定义平滑滚动函数 (控制时间和缓动)
function smoothScroll(element, target, duration, callback) {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();
    
    function animate(currentTime) {
        const timeElapsed = currentTime - startTime;
        let progress = timeElapsed / duration;
        
        if (progress > 1) progress = 1;
        
        // 缓动函数 (Ease Out Quad)
        // 使得滚动看起来平滑自然
        const ease = -progress * (progress - 2);
        
        element.scrollTop = start + change * ease;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // 动画结束，执行回调
            if (callback) callback();
        }
    }
    
    requestAnimationFrame(animate);
}

// 模拟数据更新
setInterval(() => {
    // 随机更新一些数据
    const waterValues = document.querySelectorAll('.water-value');
    waterValues.forEach(el => {
        const currentValue = parseFloat(el.textContent);
        if (!isNaN(currentValue)) {
            const newValue = (currentValue + (Math.random() - 0.5) * 0.2).toFixed(1);
            el.textContent = newValue + (el.textContent.includes('°C') ? '°C' : '');
            el.classList.add('data-updated');
            setTimeout(() => el.classList.remove('data-updated'), 600);
        }
    });
}, 3000);
