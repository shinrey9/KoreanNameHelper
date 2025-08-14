/**
 * Korean Name Converter - iframe Height Auto-Resize Helper
 * 
 * 이 스크립트를 iframe을 포함하는 부모 페이지에 추가하면
 * iframe의 높이가 자동으로 조절됩니다.
 * 
 * 사용법:
 * 1. 이 파일을 부모 페이지에 포함시키거나
 * 2. 아래 코드를 <script> 태그 안에 복사하세요
 */

(function() {
  // iframe 높이 자동 조절 함수
  function setupIframeAutoResize() {
    // postMessage 이벤트 리스너 추가
    window.addEventListener('message', function(event) {
      // 보안을 위해 origin 체크 (필요시 특정 도메인으로 제한)
      // if (event.origin !== 'https://your-domain.com') return;
      
      // Korean Name Converter에서 온 메시지인지 확인
      if (event.data && 
          event.data.type === 'resize' && 
          event.data.source === 'korean-name-converter' &&
          typeof event.data.height === 'number') {
        
        // iframe 찾기 (Korean Name Converter iframe을 식별)
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach(function(iframe) {
          // iframe의 src가 Korean Name Converter인지 확인
          if (iframe.contentWindow === event.source) {
            // 최소 높이 설정 (너무 작아지지 않도록)
            const minHeight = 400;
            const newHeight = Math.max(event.data.height, minHeight);
            
            // iframe 높이 조절
            iframe.style.height = newHeight + 'px';
            
            // 디버깅용 로그 (프로덕션에서는 제거 가능)
            console.log('iframe 높이 조절:', newHeight + 'px');
          }
        });
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
 * 수동으로 iframe 높이를 설정하는 함수
 * 필요시 사용할 수 있습니다.
 */
function setKoreanConverterIframeHeight(height) {
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(function(iframe) {
    // Korean Name Converter iframe인지 확인하는 방법을 추가하세요
    // 예: data-korean-converter 속성이나 특정 클래스명 사용
    if (iframe.hasAttribute('data-korean-converter')) {
      iframe.style.height = height + 'px';
    }
  });
}