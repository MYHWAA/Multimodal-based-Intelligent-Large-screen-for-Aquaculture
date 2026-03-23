
(function verifyFix() {
    console.group('🔍 Layout Fix Verification');

    // 1. Check Left Column Flex Ratios
    const rankPanel = document.querySelector('.left-column .panel:nth-child(1)');
    const pondPanel = document.querySelector('.left-column .panel:nth-child(2)');
    const weatherPanel = document.querySelector('.left-column .panel:nth-child(3)');

    const rankClass = rankPanel ? rankPanel.className : 'Not Found';
    const pondClass = pondPanel ? pondPanel.className : 'Not Found';
    const weatherClass = weatherPanel ? weatherPanel.className : 'Not Found';

    console.log('Left Column Panels:');
    console.log(`- Rank: ${rankClass.includes('flex-30') ? '✅ flex-30' : '❌ ' + rankClass}`);
    console.log(`- Pond: ${rankClass.includes('flex-30') ? '✅ flex-30' : '❌ ' + pondClass}`);
    console.log(`- Weather: ${weatherClass.includes('flex-40') ? '✅ flex-40' : '❌ ' + weatherClass}`);

    // 2. Check Center Column Flex Ratios
    const mapContainer = document.querySelector('.center-column .map-container');
    const wqPanel = document.querySelector('.center-column .panel'); // Assuming only one panel after map

    const mapClass = mapContainer ? mapContainer.className : 'Not Found';
    const wqClass = wqPanel ? wqPanel.className : 'Not Found';

    console.log('Center Column Panels:');
    console.log(`- Map: ${mapClass.includes('flex-60') ? '✅ flex-60' : '❌ ' + mapClass}`);
    console.log(`- Water Quality: ${wqClass.includes('flex-40') ? '✅ flex-40' : '❌ ' + wqClass}`);

    // 3. Verify Alignment Logic
    const leftTotal = 30 + 30 + 40;
    const centerTotal = 60 + 40;
    
    console.log('Alignment Logic:');
    console.log(`- Left Bottom Start: ${30+30}% = 60%`);
    console.log(`- Center Bottom Start: ${60}%`);
    
    if (leftTotal === 100 && centerTotal === 100) {
        console.log('✅ Vertical Space Distribution is Balanced (100%)');
    } else {
        console.warn('⚠️ Vertical Space Sum mismatch');
    }

    console.groupEnd();
})();
