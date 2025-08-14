# Korean Name Converter - iframe 통합 가이드

## 개요
Korean Name Converter를 iframe으로 다른 웹사이트에 포함시킬 때 높이가 자동으로 조절되도록 하는 방법입니다.

## 기본 iframe 삽입

```html
<iframe 
  src="https://tools.kollectionk.com/korean-name-converter"
  width="100%"
  height="600"
  style="border: none; border-radius: 8px;"
  data-korean-converter
  title="Korean Name Converter">
</iframe>
```

## 자동 높이 조절 설정

### 방법 1: JavaScript 파일 포함
1. `iframe-height-helper.js` 파일을 다운로드
2. 부모 페이지에 포함:

```html
<script src="iframe-height-helper.js"></script>
```

### 방법 2: 인라인 스크립트 사용
부모 페이지의 `<head>` 또는 `<body>` 끝부분에 다음 코드를 추가:

```html
<script>
(function() {
  function setupIframeAutoResize() {
    window.addEventListener('message', function(event) {
      if (event.data && 
          event.data.type === 'resize' && 
          event.data.source === 'korean-name-converter' &&
          typeof event.data.height === 'number') {
        
        const iframes = document.querySelectorAll('iframe[data-korean-converter]');
        
        iframes.forEach(function(iframe) {
          if (iframe.contentWindow === event.source) {
            const minHeight = 400;
            const newHeight = Math.max(event.data.height, minHeight);
            iframe.style.height = newHeight + 'px';
          }
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIframeAutoResize);
  } else {
    setupIframeAutoResize();
  }
})();
</script>
```

## 완전한 예제

```html
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Korean Name Converter 포함 페이지</title>
    <style>
        .iframe-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        iframe {
            width: 100%;
            border: none;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: height 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="iframe-container">
        <h1>한국어 이름 변환기</h1>
        <p>아래에서 당신의 이름을 한국어로 변환해보세요:</p>
        
        <iframe 
            src="https://tools.kollectionk.com/korean-name-converter"
            height="600"
            data-korean-converter
            title="Korean Name Converter">
        </iframe>
    </div>

    <script>
    (function() {
      function setupIframeAutoResize() {
        window.addEventListener('message', function(event) {
          if (event.data && 
              event.data.type === 'resize' && 
              event.data.source === 'korean-name-converter' &&
              typeof event.data.height === 'number') {
            
            const iframes = document.querySelectorAll('iframe[data-korean-converter]');
            
            iframes.forEach(function(iframe) {
              if (iframe.contentWindow === event.source) {
                const minHeight = 400;
                const newHeight = Math.max(event.data.height, minHeight);
                iframe.style.height = newHeight + 'px';
              }
            });
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupIframeAutoResize);
      } else {
        setupIframeAutoResize();
      }
    })();
    </script>
</body>
</html>
```

## 주요 특징

- **자동 높이 조절**: 콘텐츠에 따라 iframe 높이가 자동으로 변경됩니다
- **모바일 친화적**: 모바일 디바이스에서도 적절한 높이로 조절됩니다
- **부드러운 전환**: CSS transition으로 높이 변경이 부드럽게 이루어집니다
- **최소 높이 보장**: 너무 작아지지 않도록 최소 높이(400px)를 보장합니다

## 보안 고려사항

프로덕션 환경에서는 특정 도메인만 허용하도록 제한할 수 있습니다:

```javascript
// 특정 도메인만 허용
if (event.origin !== 'https://tools.kollectionk.com') return;
```

## 문제 해결

### iframe이 너무 높게 설정되는 경우
최소/최대 높이를 조절하세요:

```javascript
const minHeight = 300;
const maxHeight = 1200;
const newHeight = Math.min(Math.max(event.data.height, minHeight), maxHeight);
```

### 높이 조절이 작동하지 않는 경우
1. 브라우저 콘솔에서 에러 메시지 확인
2. `data-korean-converter` 속성이 iframe에 있는지 확인
3. JavaScript 코드가 DOM 로드 후 실행되는지 확인