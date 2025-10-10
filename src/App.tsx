import { HashRouter, Routes, Route } from 'react-router-dom'

function Home() {
    return <div style={{ padding: 16 }}><h1>Literary Deviousness ✅</h1></div>
}

export default function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </HashRouter>
    )
}
