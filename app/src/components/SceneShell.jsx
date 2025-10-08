export default function SceneShell({ title, children, footer }) {
    return (
        <div className="game-intro">
            <div className="card" role="region" aria-label={title || 'Scene'}>
                {title && <h1>{title}</h1>}
                <div className="scene-body">{children}</div>
                {footer && <div className="scene-footer">{footer}</div>}
            </div>
        </div>
    )
}
