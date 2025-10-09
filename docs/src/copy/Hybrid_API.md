# Hybrid API Boot

- Default (Pages): no .env required, shim answers:
    /api/version, /api/flags (GET/POST), /api/meta/levels, /api/meta/badges, /api/rag/check
- To switch to real API later:
    Set VITE_PROD_API=https://your-api.example.com (no trailing slash),
    rebuild, redeploy. The shim will disable itself automatically.
