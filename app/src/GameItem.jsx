export default function GameItem({ onSubmit }) {
    const [value, setValue] = React.useState('')
    return (
        <div>
            <textarea value={value} onChange={e => setValue(e.target.value)} />
            <button onClick={() => onSubmit(value, Math.floor(Math.random() * 100))}>Submit</button>
        </div>
    )
}
