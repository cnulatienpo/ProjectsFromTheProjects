import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

export default function Home() {
    const navigate = useNavigate();
    return (
        <div className="home">
            <h1 className="title">Projects From The Projects</h1>
            <div
                className="drill-box"
                style={{
                    display: "block",
                    margin: "2rem auto",
                    padding: "2rem",
                    border: "2px solid #222",
                    borderRadius: "12px",
                    background: "#fff",
                    maxWidth: "500px",
                    textAlign: "center",
                    cursor: "pointer"
                }}
                onClick={() => navigate("/game")}
                tabIndex={0}
                role="button"
                aria-label="Go to games page"
                onKeyPress={e => {
                    if (e.key === "Enter" || e.key === " ") {
                        navigate("/game");
                    }
                }}
            >
                <span style={{ color: "red", fontSize: "1.5rem", fontWeight: "bold" }}>
                    Project 1: Literary Deviousness. Gamified creative writing drills.
                </span>
            </div>
        </div>
    );
}

