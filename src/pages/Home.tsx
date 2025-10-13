import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <div className="home">
            <div className="image-container">
                <img src="/banner.png" alt="Banner" className="banner-image" />
            </div>
            <h1 className="title">Projects From The Projects</h1>
            <p className="subtitle">
                Project 1: Literary Deviousness. A gamified creative writing course.
            </p>
            <Link className="project-link" to="/play">Start Project</Link>
        </div>
    );
}

