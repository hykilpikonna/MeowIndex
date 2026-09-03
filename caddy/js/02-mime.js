const mimeMap = {
      // Images
      png: 'image-png', jpg: 'image-jpeg', jpeg: 'image-jpeg', gif: 'image-gif', webp: 'image-webp',
      svg: 'image-svg+xml', bmp: 'image-bmp', ico: 'image-x-ico', avif: 'image-avif', tiff: 'image-tiff',
      // Videos
      mp4: 'video-mp4', mkv: 'video-x-matroska', webm: 'video-webm', avi: 'video-x-msvideo',
      mov: 'video-quicktime', flv: 'video-x-flv', wmv: 'video-x-ms-wmv', m4v: 'video-mp4',
      // Audio
      mp3: 'audio-mp3', wav: 'audio-x-wav', flac: 'audio-x-flac', aac: 'audio-aac',
      ogg: 'application-ogg', m4a: 'audio-mp4', wma: 'audio-x-ms-wma', midi: 'audio-midi',
      // Documents
      pdf: 'application-pdf', doc: 'application-msword', docx: 'application-vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application-vnd.ms-excel', xlsx: 'application-vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application-vnd.ms-powerpoint', pptx: 'application-vnd.openxmlformats-officedocument.presentationml.presentation',
      txt: 'text-plain', md: 'text-markdown', markdown: 'text-markdown', log: 'text-x-log', csv: 'text-csv',
      // Archives
      zip: 'application-zip', tar: 'application-x-tar', gz: 'application-gzip', xz: 'application-x-xz',
      '7z': 'application-x-7z-compressed', rar: 'application-vnd.rar', bz2: 'application-x-bzip', zst: 'application-x-zstd',
      // Code & Web
      js: 'text-javascript', mjs: 'text-javascript', ts: 'text-x-typescript', tsx: 'text-x-typescript', jsx: 'text-javascript',
      py: 'text-x-python', rs: 'text-x-rust', go: 'text-x-go', c: 'text-x-c', cpp: 'text-x-cpp', h: 'text-x-chdr',
      java: 'text-x-java', sh: 'application-x-shellscript', bash: 'application-x-shellscript', zsh: 'application-x-shellscript',
      json: 'application-json', yaml: 'text-yaml', yml: 'text-yaml', toml: 'text-plain',
      html: 'text-html', htm: 'text-html', css: 'text-css', scss: 'text-x-scss', sass: 'text-x-sass',
      vue: 'text-x-vue', svelte: 'text-plain', sql: 'text-x-sql', php: 'text-x-php'
    };

    function resolveIcons() {
      document.querySelectorAll('#fileList img.file-icon[data-filename]').forEach(img => {
        const isDir = img.getAttribute('data-isdir') === '1';
        if (isDir) {
          img.src = '/mime/folder.svg';
          return;
        }
        const name = img.getAttribute('data-filename') || '';
        const sp = name.split('.');
        const ext = sp.length > 1 ? sp[sp.length - 1].toLowerCase() : '';
        const iconName = mimeMap[ext] || 'application-blank';
        img.src = `/mime/${iconName}.svg`;
      });
    }
    resolveIcons();

    // 3. Breadcrumbs Host Root, Auto-Scroll & Fade Masks
