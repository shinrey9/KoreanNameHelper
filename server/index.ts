import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// 압축 미들웨어 추가 (응답 크기 감소)
app.use(compression());

// 정적 파일 캐싱 헤더 설정
app.use((req, res, next) => {
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1년
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// iframe 보안 설정 - kollectionk.com만 허용
app.use((req, res, next) => {
  // kollectionk.com과 하위 도메인만 iframe 허용
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://kollectionk.com https://*.kollectionk.com");
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Starting server initialization...");
    
    log("Registering routes and initializing server...");
    const server = await registerRoutes(app);
    log("Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      log("Setting up Vite development server...");
      await setupVite(app, server);
      log("Vite development server setup complete");
    } else {
      log("Setting up static file serving for production...");
      serveStatic(app);
      log("Static file serving setup complete");
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    
    log(`Starting HTTP server on port ${port}...`);
    
    // Add timeout for server startup
    const serverStartTimeout = setTimeout(() => {
      log("ERROR: Server startup timeout exceeded (10 seconds)");
      process.exit(1);
    }, 10000);

    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      clearTimeout(serverStartTimeout);
      log(`✓ Server successfully started and listening on port ${port}`);
      log(`✓ Server initialization completed in ${process.uptime().toFixed(2)}s`);
    });

    // Handle server errors
    server.on('error', (error: any) => {
      clearTimeout(serverStartTimeout);
      log(`❌ Server error: ${error.message}`);
      if (error.code === 'EADDRINUSE') {
        log(`Port ${port} is already in use`);
      }
      process.exit(1);
    });

  } catch (error) {
    log(`❌ Failed to initialize server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error(error);
    process.exit(1);
  }
})();
