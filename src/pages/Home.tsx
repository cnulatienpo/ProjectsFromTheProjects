import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <div className="home">
            <div className="image-container">
                <img src="/09_20_32 PM.png" alt="Banner" className="banner-image" />
            </div>
            <h1 className="title">Projects From The Projects</h1>
            <Link className="subtitle project-link" to="/play">
                Project 1: Literary Deviousness. Gamified creative writing drills
            </Link>
        </div>
    );
}

