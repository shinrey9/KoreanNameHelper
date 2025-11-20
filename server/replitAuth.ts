// server/replitAuth.ts
// Render/Vercel/Netlify 등 Replit 외 환경에서 인증 기능 비활성화

export function setupAuth(app: any) {
  console.log("Replit auth disabled on Render.");
}

export function isAuthenticated(req: any, res: any, next: any) {
  // Render에서는 항상 인증된 것으로 처리
  return next();
}

