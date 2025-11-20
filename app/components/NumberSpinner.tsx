import { useState } from "react";

export default function NumberSpinner(value: Number, onChange: void) {
    const increment = () => onChange(value + 0.5);
    const decrement = () => onChange(value - 0.5);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button onClick={decrement}>-</button>
            <input
                type="number"
                value={value}
                readOnly
                style={{ width: "60px", textAlign: "center" }}
            />
            <button onClick={increment}>+</button>
        </div>
    );
}