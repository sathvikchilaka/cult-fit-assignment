import React from "react";
import './editTask.css'

const EditTask = ({
  editedTitle,
  editedDescription,
  editedEta,
  saveTask,
  setEditingTaskId,
  setEditedTitle,
  setEditedDescription,
  setEditedEta,
}) => {
  return (
    <div className="edit-form">
      <span style={{fontWeight:'bold', width: '100%'}}>
        Task Title
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="Edit title"
        />
      </span>
      <span style={{fontWeight:'bold', width: '100%'}}>
        Description
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Edit description"
        />
      </span>
      <span style={{width:'100%'}}>
        ETA
        <input
          type="date"
          value={editedEta} // Bind ETA value
          onChange={(e) => setEditedEta(e.target.value)} // Update ETA
        />
      </span>
      <div className="edit-task-actions">
        <button style={{ backgroundColor: '#478DF5', color: 'white' }} onClick={() => saveTask()}>Save</button>
        <button  style={{ backgroundColor: 'lightgray' }} onClick={() => setEditingTaskId(null)}>Cancel</button>
      </div>
    </div>
  );
};

export default EditTask;
