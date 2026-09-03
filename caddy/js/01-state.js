// 1. Top-Level State and Elements
    let currentSort = { col: 'name', dir: 'asc' };
    let searchOn = false;
    let selectedIdx = -1;

    // Quick Look State
    let isSpaceDown = false;
    let spacePressTime = 0;
    let hasSwitchedSubject = false;
    let isPinned = false;
    let currentHoveredItem = null;
    let currentPreviewItem = null;
    let currentQuickLookText = '';

    // Drag & Resize State
    let isDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let winStartX = 0, winStartY = 0;
    let isResizing = false;
    let resizeDir = null;
    let resizeStartX = 0, resizeStartY = 0;
    let resizeStartRect = null;
    let hasCustomPosition = false;

    const breadcrumbsWrap = document.getElementById('breadcrumbsWrap');
    const searchInp = document.getElementById('searchInp');
    const fileListEl = document.getElementById('fileList');
    const noResults = document.getElementById('noResults');
    const listSummary = document.getElementById('listSummary');
    const wgetDrawer = document.getElementById('wgetDrawer');
    const wgetCmdEl = document.getElementById('wgetCmd');
    const wgetBtn = document.getElementById('wgetBtn');
    const wgetIcon = document.getElementById('wgetIcon');
    const wgetLabel = document.getElementById('wgetLabel');
    const drawerCopyBtn = document.getElementById('drawerCopyBtn');
    const quickLookModal = document.getElementById('quickLookModal');
    const quickLookWindow = document.getElementById('quickLookWindow');
    const quickLookHeader = document.getElementById('quickLookHeader');
    const quickLookTitle = document.getElementById('quickLookTitle');
    const quickLookMeta = document.getElementById('quickLookMeta');
    const quickLookCopyBtn = document.getElementById('quickLookCopyBtn');
    const quickLookCopyLabel = document.getElementById('quickLookCopyLabel');
    const quickLookBody = document.getElementById('quickLookBody');

    // 2. MIME Type to WhiteSur Icon Mapping
