import React from "react";
import _isString from "lodash/isString";

export default function CodeBlock({ value, style }) {
  return (
    <div
      style={{
        backgroundColor: "#fafafa",
        border: "1px solid #e1e4e8",
        borderRadius: "0.5rem",
        fontSize: "9pt",
        height: "18rem",
        overflow: "auto",
        ...style,
      }}
    >
      <pre style={{ margin: 0, padding: "1rem" }}>
        {_isString(value) ? value : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
