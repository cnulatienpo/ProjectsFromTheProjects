/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx,vue,html}", // Covers all source files for Tailwind scanning
    ],
    theme: {
        extend: {
            colors: {
                'brand-soft': '#F7FAF9', // Replace with your actual color value if needed
                // other custom colors...
            },
        },
    },
    plugins: [],
}

    < !DOCTYPE html >
        <html lang="en" class="brutalist">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Literary Deviousness</title>
                    <meta name="generator" content="Vite">
                        <link rel="icon" type="image/svg+xml" href="./assets/favicon.svg">
                            <link rel="stylesheet" href="./assets/index-abc123.css">
                                <link rel="stylesheet" href="./assets/brutalist-xyz456.css">
                                    <link rel="stylesheet" href="./assets/brutalist-overrides-def789.css">
                                    </head>
                                    <body class="brutalist">
                                        <div id="root"></div>
                                        <script type="module" crossorigin src="./assets/index-123456.js"></script>
                                    </body>
                                </html>
                                [note] no BrowserRouter found (maybe HashRouter or custom)
                                [note] no basename prop found
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/game" element={<GameRoot />} />
                                    <Route path="*" element={<Home />} />
                                </Routes>
