export default function BuildStamp() {
    const stamp = import.meta.env.VITE_BUILD_STAMP || new Date().toISOString();
    return (
        <div style={{
            position: 'fixed',
            bottom: 8,
            right: 8,
            padding: '6px 10px',
            background: '#000',
            color: '#fff',
            border: '2px solid #fff',
            borderRadius: 10,
            fontSize: 12,
            zIndex: 9999
        }}>
            UI Build: {stamp} · BASE_URL: {import.meta.env.BASE_URL}
        </div>
    );
}
