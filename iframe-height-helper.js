/**
 * Korean Name Converter iframe 자동 높이 조절 및 로딩 스피너
 * 
 * 사용법:
 * 1. 이 파일을 부모 페이지에 포함시키거나
 * 2. 아래 코드를 <script> 태그 안에 복사하세요
 */

(function() {
  // iframe 높이 자동 조절 및 로딩 스피너 설정
  function setupIframeAutoResize() {
    // CSS 애니메이션 추가 (한 번만)
    if (!document.querySelector('#korean-converter-styles')) {
      const style = document.createElement('style');
      style.id = 'korean-converter-styles';
      style.textContent = `
        @keyframes korean-spinner-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .korean-loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          min-height: 400px;
        }
        .korean-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: korean-spinner-spin 1s linear infinite;
          margin-bottom: 16px;
        }
        .korean-loading-text {
          color: #666;
          font-size: 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
      `;
      document.head.appendChild(style);
    }

    // 모든 Korean Name Converter iframe 처리
    const iframes = document.querySelectorAll('iframe[data-korean-converter]');

    iframes.forEach(function(iframe) {
      // iframe 컨테이너를 relative position으로 설정
      const container = iframe.parentElement;
      if (container) {
        const containerStyle = getComputedStyle(container);
        if (containerStyle.position === 'static') {
          container.style.position = 'relative';
        }

        // 로딩 오버레이 생성
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'korean-loading-overlay';

        const spinner = document.createElement('div');
        spinner.className = 'korean-spinner';

        const text = document.createElement('div');
        text.className = 'korean-loading-text';
        text.textContent = '한국어 이름 변환기 로딩 중...';

        loadingOverlay.appendChild(spinner);
        loadingOverlay.appendChild(text);

        // 로딩 오버레이를 컨테이너에 추가
        container.appendChild(loadingOverlay);

        // iframe 초기 설정
        iframe.style.opacity = '0';
        iframe.style.transition = 'opacity 0.5s ease-in-out';

        // iframe 로드 완료 시 처리
        iframe.addEventListener('load', function() {
          // 로딩 오버레이 제거 (페이드 아웃)
          setTimeout(function() {
            loadingOverlay.style.opacity = '0';
            setTimeout(function() {
              if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
              }
            }, 300);
          }, 500); // 0.5초 후 페이드 아웃 시작

          // iframe 표시
          iframe.style.opacity = '1';
        });
      }
    });

    // postMessage 이벤트 리스너 추가
    window.addEventListener('message', function(event) {
      // Korean Name Converter에서 온 메시지만 처리
      if (event.data && event.data.source === 'korean-name-converter') {

        // 높이 조절 신호 처리
        if (event.data.type === 'resize' && typeof event.data.height === 'number') {
          const iframes = document.querySelectorAll('iframe[data-korean-converter]');

          iframes.forEach(function(iframe) {
            if (iframe.contentWindow === event.source) {
              const minHeight = 400;
              const newHeight = Math.max(event.data.height, minHeight);
              iframe.style.height = newHeight + 'px';

              // 디버그 로그 (필요시 제거 가능)
              console.log('iframe 높이 조절:', newHeight + 'px');
            }
          });
        }
      }
    });
  }

  // DOM이 로드되면 실행
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIframeAutoResize);
  } else {
    setupIframeAutoResize();
  }
})();

/**
 * 수동으로 iframe 높이를 설정하는 함수 (필요시 사용)
 */
function setKoreanConverterHeight(height) {
  const iframes = document.querySelectorAll('iframe[data-korean-converter]');
  iframes.forEach(function(iframe) {
    iframe.style.height = height + 'px';
  });
}