import React, { useContext, useEffect, useRef, useState } from "react";
import ColumnTask from "./components/ColumnTasks/ColumnTasks";
import "./styles.css";
import useThrottleHook from "./useThrottleHook";
import { TaskContext } from "./TaskContext";

const App = () => {
  const {
    columns,
    tasks,
    setTasks,
    inputFilterString,
    setInputFilterString,
    isCreatingTask,
    setIsCreatingTask,
    newTaskTitle,
    setNewTaskTitle,
    newTaskDescription,
    setNewTaskDescription,
    newTaskEta,
    setNewTaskEta,
    newTaskState,
    setNewTaskState,
    errors,
    setErrors,
    editingTaskId,
    setEditingTaskId,
    editedTitle,
    setEditedTitle,
    editedDescription,
    setEditedDescription,
    editedEta,
    setEditedEta,
    draggedTaskId,
    setDraggedTaskId,
    targetTaskId,
    setTargetTaskId,
    handleDragStart,
    handleDragOverTask,
    handleDrop,
    toggleNewTask,
    handleAddTask,
    isEtaEarlierThanToday,
    deleteTask,
    editTask,
    saveTask,

  } = useContext(TaskContext);

  const throttledTargetTaskId = useThrottleHook(targetTaskId, 300);

  useEffect(() => {
    if (draggedTaskId && throttledTargetTaskId) {
      const draggedTask = tasks.find((task) => task.id === draggedTaskId);
      const targetTask = tasks.find(
        (task) => task.id === throttledTargetTaskId
      );

      if (
        draggedTask &&
        targetTask &&
        draggedTask.status === targetTask.status &&
        draggedTaskId !== throttledTargetTaskId
      ) {
        const columnTasks = tasks
          .filter((task) => task.status === draggedTask.status)
          .sort((a, b) => a.order - b.order);

        const draggedIndex = columnTasks.findIndex(
          (task) => task.id === draggedTaskId
        );
        const targetIndex = columnTasks.findIndex(
          (task) => task.id === throttledTargetTaskId
        );

        const updatedTasks = [...columnTasks];
        updatedTasks.splice(draggedIndex, 1);
        updatedTasks.splice(targetIndex, 0, draggedTask);

        const reorderedTasks = updatedTasks.map((task, index) => ({
          ...task,
          order: index,
        }));

        setTasks((prevTasks) => {
          return prevTasks.map((task) => {
            const reorderedTask = reorderedTasks.find((t) => t.id === task.id);
            return reorderedTask ? reorderedTask : task;
          });
        });
      }
    }
  }, [draggedTaskId, throttledTargetTaskId]);

  const formRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        toggleNewTask();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCreatingTask]);

  return (
    <div className="kanban-container">
      <h3 className="kanban-title">My Kanban ToDo App</h3>
      <div className="kanban-header">
        <div className="filter-input-container">
          <input
            className="filter-input-field"
            value={inputFilterString}
            onChange={(e) => setInputFilterString(e.target.value)}
            placeholder="Type here to search..."
          />
          {!isCreatingTask && (
            <button
              className="create-task-button"
              onClick={() => toggleNewTask()}
            >
              Create ToDo Task
            </button>
          )}
        </div>

        {isCreatingTask && (
          <div className="task-creation-form" ref={formRef}>
            <h4 style={{ margin: "0", fontSize: "larger" }}>Add New Task</h4>
            <span className="create-task-field">
              Task Title
              <input
                className="creation-form-input-field"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                style={{ marginLeft: "0" }}
              />
              {errors.title && (
                <div className="error-message">{errors.title}</div>
              )}
            </span>

            <span className="create-task-field">
              Description
              <textarea
                className="creation-form-input-field"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                style={{ marginLeft: "0" }}
              />
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
            </span>

            <span className="create-task-field">
              ETA
              <input
                className="creation-form-input-field"
                type="date"
                value={newTaskEta}
                onChange={(e) => setNewTaskEta(e.target.value)}
                style={{ marginLeft: "0" }}
              />
              {errors.eta && <div className="error-message">{errors.eta}</div>}
            </span>

            <span className="create-task-field">
              Task State
              <select
                className="creation-form-input-field"
                value={newTaskState}
                onChange={(e) => setNewTaskState(e.target.value)}
                style={{ marginLeft: "0" }}
              >
                <option value="">Select any state</option>
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.name}
                  </option>
                ))}
              </select>
              {errors.state && (
                <div className="error-message">{errors.state}</div>
              )}
            </span>

            <div className="create-task-action-buttons">
              <button
                className="submit-create-task-button"
                style={{ backgroundColor: '#478DF5', color: 'white' }}
                onClick={handleAddTask}
              >
                Submit
              </button>
              <button
                className="submit-create-task-button"
                onClick={toggleNewTask}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="columns-container">
        {columns.map((column) => (
          <ColumnTask
            key={column.id}
            editingTaskId={editingTaskId}
            editedTitle={editedTitle}
            editedDescription={editedDescription}
            editedEta={editedEta}
            column={column}
            filterString={inputFilterString}
            tasks={tasks
              .filter((task) => task.status === column.id)
              .sort((a, b) => a.order - b.order)} // Ensure tasks are sorted by order
            onDragOverTask={(e, taskId) =>
              handleDragOverTask(e, taskId, column.id)
            }
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            editTask={editTask}
            deleteTask={deleteTask}
            saveTask={saveTask}
            setEditingTaskId={setEditingTaskId}
            setEditedTitle={setEditedTitle}
            setEditedDescription={setEditedDescription}
            setEditedEta={setEditedEta}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
