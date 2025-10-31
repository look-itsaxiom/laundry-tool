import React, { useState, FormEvent } from "react";
import "./CreateCardModal.css";

interface CreateCardModalProps {
  onClose: () => void;
  onCreate: (title: string, backgroundColor: string, textColor: string) => void;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#ffeaa7");
  const [textColor, setTextColor] = useState("#2d3436");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim(), backgroundColor, textColor);
    }
  };

  // Helper function to generate gradient from a single color
  const generateGradient = (color: string) => {
    // Convert hex to RGB to create a lighter variant
    const r = Number.parseInt(color.slice(1, 3), 16);
    const g = Number.parseInt(color.slice(3, 5), 16);
    const b = Number.parseInt(color.slice(5, 7), 16);

    // Create a lighter version (add 30 to each component, max 255)
    const lighterR = Math.min(255, r + 30);
    const lighterG = Math.min(255, g + 30);
    const lighterB = Math.min(255, b + 30);

    const lighterColor = `rgb(${lighterR}, ${lighterG}, ${lighterB})`;

    return `linear-gradient(135deg, ${lighterColor} 0%, ${color} 100%)`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Laundry Type</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Whites, Delicates, Towels..."
            autoFocus
            className="modal-input"
          />

          <div className="color-selection">
            <div className="color-group">
              <label htmlFor="background-color" className="color-label">
                Background Color:
              </label>
              <input id="background-color" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="color-picker" />
            </div>

            <div className="color-group">
              <label htmlFor="text-color" className="color-label">
                Text Color:
              </label>
              <input id="text-color" type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="color-picker" />
            </div>
          </div>

          <div className="preview-section">
            <span className="preview-label">Preview:</span>
            <div
              className="color-preview"
              style={{
                background: generateGradient(backgroundColor),
                color: textColor,
              }}
            >
              {title || "Sample Text"}
            </div>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={!title.trim()}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCardModal;
