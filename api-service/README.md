# Literary Deviousness API (minimal)
- Local: copy .env.example to .env, then:
  npm i && npm run dev
- Health: http://localhost:8787/health
- Status: http://localhost:8787/status

## Deploy on Render
1) Push repo.
2) Create a new **Web Service**:
   - Root directory: api-service
   - Build command: npm i
   - Start command: npm start
   - Region: close to you
3) Set environment variables:
   - PORT = 10000 (Render sets PORT var automatically; you can leave default)
   - CORS_ORIGIN = https://<your-pages-domain>
   - SIGN_SECRET = <generate-one>

4) After deploy, set your frontend:
   - NEXT_PUBLIC_PROD_API or VITE_PROD_API = https://<your-render-service>.onrender.com
