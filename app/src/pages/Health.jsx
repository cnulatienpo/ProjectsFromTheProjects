import React from "react";
import { Link } from "react-router-dom";
export default function Health() {
    return (
        <div>
            <h2>OK</h2>
            <Link to="/game">Play</Link>
        </div>
    );
}
