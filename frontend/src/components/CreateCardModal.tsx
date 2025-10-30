import React, { useState, FormEvent } from 'react';
import './CreateCardModal.css';

interface CreateCardModalProps {
  onClose: () => void;
  onCreate: (title: string) => void;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title.trim());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Add New Laundry</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Whites, Delicates, Towels..."
            autoFocus
            className="modal-input"
          />
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
