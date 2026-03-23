// 布局对齐验证脚本
// 请在浏览器控制台运行此脚本以验证气象模块与水质模块的对齐情况

(function verifyAlignment() {
    console.group('🔍 模块内容与布局验证 (独立位置)');

    // 1. 查找两个模块
    // 气象模块：在左侧列 (假设是第一个有 weather-grid 的 panel)
    const weatherGrid = document.querySelector('.weather-grid');
    if (!weatherGrid) {
        console.error('❌ 未找到气象模块 (.weather-grid)');
        console.groupEnd();
        return;
    }
    const weatherPanel = weatherGrid.closest('.panel');
    
    // 水质模块：在中间列 (假设是第一个有 water-quality-grid 的 panel)
    const wqGrid = document.querySelector('.water-quality-grid');
    if (!wqGrid) {
        console.error('❌ 未找到水质模块 (.water-quality-grid)');
        console.groupEnd();
        return;
    }
    const wqPanel = wqGrid.closest('.panel');

    // 2. 验证内容完整性 (Grid Count)
    const weatherItems = weatherGrid.children.length;
    const wqItems = wqGrid.children.length;

    const isWeatherCountCorrect = weatherItems === 6;
    const isWqCountCorrect = wqItems === 6;

    console.log(
        isWeatherCountCorrect ? '✅ 气象指标数量: 6个 (通过)' : `❌ 气象指标数量: ${weatherItems}个 (失败)`,
        isWqCountCorrect ? '✅ 水质指标数量: 6个 (通过)' : `❌ 水质指标数量: ${wqItems}个 (失败)`
    );

    // 3. 验证布局结构 (Layout Check)
    // 检查是否使用了 Grid 布局
    const weatherStyle = window.getComputedStyle(weatherGrid);
    const wqStyle = window.getComputedStyle(wqGrid);

    const isWeatherGrid = weatherStyle.display === 'grid';
    const isWqGrid = wqStyle.display === 'grid';

    console.log(
        isWeatherGrid ? '✅ 气象模块使用Grid布局: 是' : '❌ 气象模块使用Grid布局: 否',
        isWqGrid ? '✅ 水质模块使用Grid布局: 是' : '❌ 水质模块使用Grid布局: 否'
    );

    // 4. 验证位置独立性 (Position Check)
    // 检查它们是否在同一个父容器 (.monitor-row) 下
    // 如果不在同一个父容器，说明位置已恢复
    const weatherParent = weatherPanel.parentElement;
    const wqParent = wqPanel.parentElement;
    
    const isSeparate = weatherParent !== wqParent;
    console.log(
        isSeparate ? '✅ 模块位置独立: 是 (处于不同容器中)' : '⚠️ 模块位置独立: 否 (处于同一容器中，可能未恢复原位)'
    );

    console.groupEnd();

    if (isWeatherCountCorrect && isWqCountCorrect && isSeparate) {
        console.log('%c🎉 内容更新验证通过！模块位置已恢复且内容正确。', 'color: green; font-weight: bold; font-size: 14px;');
    } else {
        console.log('%c⚠️ 验证发现潜在问题，请检查输出详情。', 'color: orange; font-weight: bold; font-size: 14px;');
    }
})();
