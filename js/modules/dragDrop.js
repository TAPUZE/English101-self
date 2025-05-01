/**
 * dragDrop.js - A reusable drag and drop module for A1_English_Course
 * 
 * This module provides functionality for creating interactive drag and drop
 * activities commonly used in language learning applications.
 * 
 * @author Created for A1_English_Course
 * @version 1.0.0
 */

'use strict';

/**
 * DragDrop - Main drag and drop functionality module
 */
export class DragDrop {
  /**
   * Creates a new DragDrop instance
   * @param {string} containerId - ID of the HTML element to render the drag and drop activity in
   * @param {Object} activityData - Data for the drag and drop activity
   * @param {Object} options - Configuration options
   */
  constructor(containerId, activityData, options = {}) {
    // Initialize properties with default values
    this.container = null;
    this.activityData = null;
    this.dragElements = [];
    this.dropZones = [];
    this.currentDragElement = null;
    this.score = 0;
    this.completed = false;
    this.options = {
      shuffleItems: true,
      showFeedback: true,
      instantFeedback: false,
      allowRetry: true,
      soundFeedback: false,
      dropEffect: 'move', // 'move', 'copy', or 'none'
      ...options
    };
    
    // Initialize the activity
    this.init(containerId, activityData, this.options);
  }

  /**
   * Initializes the drag and drop activity
   * @param {string} containerId - ID of the HTML element to render the activity in
   * @param {Object} activityData - Data for the drag and drop activity
   * @param {Object} options - Configuration options
   */
  init(containerId, activityData, options = {}) {
    try {
      // Validate inputs
      if (!containerId) {
        throw new Error('Container ID is required');
      }
      
      if (!activityData) {
        throw new Error('Activity data is required');
      }
      
      // Get container element
      this.container = document.getElementById(containerId);
      if (!this.container) {
        throw new Error(`Container element with ID "${containerId}" not found`);
      }
      
      // Set activity data and options
      this.activityData = activityData;
      this.options = { ...this.options, ...options };
      
      // Create activity UI structure
      this.createActivityStructure();
      
      // Set up event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Drag and drop initialization error:', error);
      this.showError('Failed to initialize drag and drop activity. Please check the console for details.');
    }
  }

  /**
   * Creates the basic activity UI structure
   */
  createActivityStructure() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create main activity elements
    const activityWrapper = document.createElement('div');
    activityWrapper.className = 'drag-drop-wrapper';
    
    // Add title if provided
    if (this.activityData.title) {
      const title = document.createElement('h2');
      title.className = 'drag-drop-title';
      title.textContent = this.activityData.title;
      activityWrapper.appendChild(title);
    }
    
    // Add instructions if provided
    if (this.activityData.instructions) {
      const instructions = document.createElement('p');
      instructions.className = 'drag-drop-instructions';
      instructions.textContent = this.activityData.instructions;
      activityWrapper.appendChild(instructions);
    }
    
    // Create drag items container
    const dragItemsContainer = document.createElement('div');
    dragItemsContainer.className = 'drag-items-container';
    dragItemsContainer.id = `${this.container.id}-drag-items`;
    
    // Create drop zones container
    const dropZonesContainer = document.createElement('div');
    dropZonesContainer.className = 'drop-zones-container';
    dropZonesContainer.id = `${this.container.id}-drop-zones`;
    
    // Create feedback container
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'drag-drop-feedback';
    feedbackContainer.id = `${this.container.id}-feedback`;
    feedbackContainer.style.display = 'none';
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'drag-drop-buttons';
    
    // Check button
    const checkButton = document.createElement('button');
    checkButton.className = 'drag-drop-check-btn';
    checkButton.id = `${this.container.id}-check-btn`;
    checkButton.textContent = 'Check Answers';
    
    // Reset button
    const resetButton = document.createElement('button');
    resetButton.className = 'drag-drop-reset-btn';
    resetButton.id = `${this.container.id}-reset-btn`;
    resetButton.textContent = 'Reset';
    
    // Add buttons to container
    buttonsContainer.appendChild(checkButton);
    buttonsContainer.appendChild(resetButton);
    
    // Add all elements to wrapper
    activityWrapper.appendChild(dragItemsContainer);
    activityWrapper.appendChild(dropZonesContainer);
    activityWrapper.appendChild(feedbackContainer);
    activityWrapper.appendChild(buttonsContainer);
    
    // Add wrapper to container
    this.container.appendChild(activityWrapper);
    
    // Render drag items and drop zones
    this.renderDragItems();
    this.renderDropZones();
  }

  /**
   * Renders the draggable items
   */
  renderDragItems() {
    const dragItemsContainer = document.getElementById(`${this.container.id}-drag-items`);
    if (!dragItemsContainer) return;
    
    // Clear container
    dragItemsContainer.innerHTML = '';
    
    // Get items
    let items = [...this.activityData.items];
    
    // Shuffle items if needed
    if (this.options.shuffleItems) {
      this.shuffleArray(items);
    }
    
    // Create drag items
    items.forEach((item, index) => {
      const dragItem = document.createElement('div');
      dragItem.className = 'drag-item';
      dragItem.id = `drag-item-${index}`;
      dragItem.setAttribute('draggable', 'true');
      dragItem.dataset.itemId = item.id || index;
      
      // Set content based on type
      if (item.type === 'text') {
        dragItem.textContent = item.content;
      } else if (item.type === 'html') {
        dragItem.innerHTML = item.content;
      } else if (item.type === 'image') {
        const img = document.createElement('img');
        img.src = item.content;
        img.alt = item.alt || `Drag item ${index}`;
        dragItem.appendChild(img);
      }
      
      // Store reference to drag element
      this.dragElements.push(dragItem);
      
      // Add to container
      dragItemsContainer.appendChild(dragItem);
    });
  }

  /**
   * Renders the drop zones
   */
  renderDropZones() {
    const dropZonesContainer = document.getElementById(`${this.container.id}-drop-zones`);
    if (!dropZonesContainer) return;
    
    // Clear container
    dropZonesContainer.innerHTML = '';
    
    // Create drop zones
    this.activityData.zones.forEach((zone, index) => {
      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone';
      dropZone.id = `drop-zone-${index}`;
      dropZone.dataset.zoneId = zone.id || index;
      
      // Add label if provided
      if (zone.label) {
        const label = document.createElement('div');
        label.className = 'drop-zone-label';
        label.textContent = zone.label;
        dropZone.appendChild(label);
      }
      
      // Create drop area
      const dropArea = document.createElement('div');
      dropArea.className = 'drop-area';
      dropArea.dataset.zoneId = zone.id || index;
      dropArea.dataset.acceptedItems = JSON.stringify(zone.acceptedItems || []);
      
      // Add placeholder text if provided
      if (zone.placeholder) {
        const placeholder = document.createElement('span');
        placeholder.className = 'drop-placeholder';
        placeholder.textContent = zone.placeholder;
        dropArea.appendChild(placeholder);
      }
      
      // Add drop area to zone
      dropZone.appendChild(dropArea);
      
      // Store reference to drop zone
      this.dropZones.push(dropZone);
      
      // Add to container
      dropZonesContainer.appendChild(dropZone);
    });
  }

  /**
   * Sets up event listeners for drag and drop
   */
  setupEventListeners() {
    try {
      // Add event listeners to drag items
      this.dragElements.forEach(dragElement => {
        dragElement.addEventListener('dragstart', this.handleDragStart.bind(this));
        dragElement.addEventListener('dragend', this.handleDragEnd.bind(this));
      });
      
      // Add event listeners to drop zones
      const dropAreas = this.container.querySelectorAll('.drop-area');
      dropAreas.forEach(dropArea => {
        dropArea.addEventListener('dragover', this.handleDragOver.bind(this));
        dropArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        dropArea.addEventListener('drop', this.handleDrop.bind(this));
      });
      
      // Add event listeners to buttons
      const checkButton = document.getElementById(`${this.container.id}-check-btn`);
      const resetButton = document.getElementById(`${this.container.id}-reset-btn`);
      
      if (checkButton) {
        checkButton.addEventListener('click', this.checkAnswers.bind(this));
      }
      
      if (resetButton) {
        resetButton.addEventListener('click', this.resetActivity.bind(this));
      }
      
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }

  /**
   * Handles the dragstart event
   * @param {DragEvent} event - The drag event
   */
  handleDragStart(event) {
    try {
      // Set the current drag element
      this.currentDragElement = event.target;
      
      // Add dragging class
      event.target.classList.add('dragging');
      
      // Set drag data
      event.dataTransfer.setData('text/plain', event.target.id);
      
      // Set drag effect
      event.dataTransfer.effectAllowed = this.options.dropEffect;
      
      // Set drag image (optional)
      // event.dataTransfer.setDragImage(event.target, 0, 0);
      
    } catch (error) {
      console.error('Error in dragstart handler:', error);
    }
  }

  /**
   * Handles the dragend event
   * @param {DragEvent} event - The drag event
   */
  handleDragEnd(event) {
    try {
      // Remove dragging class
      event.target.classList.remove('dragging');
      
      // Reset current drag element
      this.currentDragElement = null;
      
    } catch (error) {
      console.error('Error in dragend handler:', error);
    }
  }

  /**
   * Handles the dragover event
   * @param {DragEvent} event - The drag event
   */
  handleDragOver(event) {
    try {
      // Prevent default to allow drop
      event.preventDefault();
      
      // Set drop effect
      event.dataTransfer.dropEffect = this.options.dropEffect;
      
      // Add dragover class
      event.target.classList.add('dragover');
      
      // Check if the drop is allowed
      const isValidDrop = this.isValidDropTarget(event.target);
      
      // Visual feedback for valid/invalid drop
      if (isValidDrop) {
        event.target.classList.add('valid-drop');
        event.target.classList.remove('invalid-drop');
      } else {
        event.target.classList.add('invalid-drop');
        event.target.classList.remove('valid-drop');
      }
      
    } catch (error) {
      console.error('Error in dragover handler:', error);
    }
  }

  /**
   * Handles the dragleave event
   * @param {DragEvent} event - The drag event
   */
  handleDragLeave(event) {
    try {
      // Remove dragover class
      event.target.classList.remove('dragover');
      event.target.classList.remove('valid-drop');
      event.target.classList.remove('invalid-drop');
      
    } catch (error) {
      console.error('Error in dragleave handler:', error);
    }
  }

  /**
   * Handles the drop event
   * @param {DragEvent} event - The drag event
   */
  handleDrop(event) {
    try {
      // Prevent default action
      event.preventDefault();
      
      // Remove dragover class
      event.target.classList.remove('dragover');
      event.target.classList.remove('valid-drop');
      event.target.classList.remove('invalid-drop');
      
      // Get the dragged element id
      const draggedId = event.dataTransfer.getData('text/plain');
      const draggedElement = document.getElementById(draggedId);
      
      if (!draggedElement) return;
      
      // Check if this is a valid drop target
      if (this.isValidDropTarget(event.target)) {
        // Handle the drop
        this.placeItemInDropZone(draggedElement, event.target);
        
        // Check answer immediately if option is enabled
        if (this.options.instantFeedback) {
          this.checkItemPlacement(draggedElement, event.target);
        }
      }
      
    } catch (error) {
      console.error('Error in drop handler:', error);
    }
  }

  /**
   * Checks if the drop target is valid for the current drag element
   * @param {HTMLElement} dropTarget - The drop target element
   * @returns {boolean} Whether the drop is valid
   */
  isValidDropTarget(dropTarget) {
    try {
      // Check if the drop target is a drop area
      if (!dropTarget.classList.contains('drop-area')) {
        return false;
      }
      
      // Check if the drop area already has an item
      if (dropTarget.querySelector('.drag-item')) {
        return false;
      }
      
      // If no current drag element, return false
      if (!this.currentDragElement) {
        return false;
      }
      
      // Get accepted items for this drop zone
      const acceptedItems = JSON.parse(dropTarget.dataset.acceptedItems || '[]');
      
      // If no restrictions, allow drop
      if (!acceptedItems.length) {
        return true;
      }
      
      // Check if the current drag element is accepted
      const dragItemId = this.currentDragElement.dataset.itemId;
      return acceptedItems.includes(dragItemId) || acceptedItems.includes(Number(dragItemId));
      
    } catch (error) {
      console.error('Error checking drop target validity:', error);
      return false;
    }
  }

  /**
   * Places a drag item in a drop zone
   * @param {HTMLElement} dragItem - The drag item element
   * @param {HTMLElement} dropArea - The drop area element
   */
  placeItemInDropZone(dragItem, dropArea) {
    try {
      // Remove any placeholder
      const placeholder = dropArea.querySelector('.drop-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
      
      // Clone the drag item if the drop effect is 'copy'
      let itemToPlace = dragItem;
      if (this.options.dropEffect === 'copy') {
        itemToPlace = dragItem.cloneNode(true);
        itemToPlace.id = `${dragItem.id}-copy-${Date.now()}`;
        
        // Add event listeners to the cloned item
        itemToPlace.addEventListener('dragstart', this.handleDragStart.bind(this));
        itemToPlace.addEventListener('dragend', this.handleDragEnd.bind(this));
      } else {
        // Remove the item from its previous parent
        if (dragItem.parentNode) {
          dragItem.parentNode.removeChild(dragItem);
        }
      }
      
      // Add the item to the drop area
      dropArea.appendChild(itemToPlace);
      
      // Add placed class
      itemToPlace.classList.add('placed');
      dropArea.classList.add('filled');
      
    } catch (error) {
      console.error('Error placing item in drop zone:', error);
    }
  }

  /**
   * Checks if all items are placed correctly
   */
  checkAnswers() {
    try {
      // Reset score
      this.score = 0;
      let totalItems = 0;
      
      // Check each drop zone
      this.dropZones.forEach(dropZone => {
        const dropArea = dropZone.querySelector('.drop-area');
        const dragItem = dropArea.querySelector('.drag-item');
        
        if (dragItem) {
          totalItems++;
          
          // Check if the item is in the correct zone
          if (this.isCorrectPlacement(dragItem, dropArea)) {
            this.score++;
            dragItem.classList.add('correct');
            dragItem.classList.remove('incorrect');
          } else {
            dragItem.classList.add('incorrect');
            dragItem.classList.remove('correct');
          }
        }
      });
      
      // Calculate percentage
      const percentage = totalItems > 0 ? Math.round((this.score / totalItems) * 100) : 0;
      
      // Show feedback
      if (this.options.showFeedback) {
        this.showFeedback(this.score, totalItems, percentage);
      }
      
      // Play sound feedback if enabled
      if (this.options.soundFeedback && typeof window.AudioPlayer !== 'undefined') {
        const allCorrect = this.score === totalItems && totalItems > 0;
        const soundFile = allCorrect ? 'correct.mp3' : 'incorrect.mp3';
        try {
          window.AudioPlayer.play(soundFile);
        } catch (error) {
          console.warn('Failed to play audio feedback:', error);
        }
      }
      
      // Mark as completed if all correct
      this.completed = (this.score === totalItems && totalItems > 0);
      
      // Trigger completion event
      if (this.completed) {
        this.triggerEvent('activityComplete', {
          score: this.score,
          totalItems,
          percentage
        });
      }
      
    } catch (error) {
      console.error('Error checking answers:', error);
      this.showError('Failed to check answers. Please try again.');
    }
  }

  /**
   * Checks if an individual item is placed correctly
   * @param {HTMLElement} dragItem - The drag item element
   * @param {HTMLElement} dropArea - The drop area element
   * @returns {boolean} Whether the placement is correct
   */
  checkItemPlacement(dragItem, dropArea) {
    try {
      const isCorrect = this.isCorrectPlacement(dragItem, dropArea);
      
      // Add correct/incorrect class
      if (isCorrect) {
        dragItem.classList.add('correct');
        dragItem.classList.remove('incorrect');
      } else {
        dragItem.classList.add('incorrect');
        dragItem.classList.remove('correct');
      }
      
      return isCorrect;
      
    } catch (error) {
      console.error('Error checking item placement:', error);
      return false;
    }
  }

  /**
   * Determines if an item is placed in the correct drop zone
   * @param {HTMLElement} dragItem - The drag item element
   * @param {HTMLElement} dropArea - The drop area element
   * @returns {boolean} Whether the placement is correct
   */
  isCorrectPlacement(dragItem, dropArea) {
    try {
      // Get item and zone IDs
      const itemId = dragItem.dataset.itemId;
      const zoneId = dropArea.dataset.zoneId;
      
      // Get accepted items for this zone
      const acceptedItems = JSON.parse(dropArea.dataset.acceptedItems || '[]');
      
      // Check if the item is accepted in this zone
      return acceptedItems.includes(itemId) || acceptedItems.includes(Number(itemId));
      
    } catch (error) {
      console.error('Error checking placement correctness:', error);
      return false;
    }
  }

  /**
   * Shows feedback for the activity
   * @param {number} score - Number of correct placements
   * @param {number} total - Total number of items
   * @param {number} percentage - Percentage score
   */
  showFeedback(score, total, percentage) {
    try {
      const feedbackContainer = document.getElementById(`${this.container.id}-feedback`);
      if (!feedbackContainer) return;
      
      // Clear previous feedback
      feedbackContainer.innerHTML = '';
      
      // Create feedback message
      const feedbackMessage = document.createElement('p');
      
      if (score === total && total > 0) {
        feedbackMessage.textContent = this.activityData.correctFeedback || 
          `Great job! All ${total} items are correctly placed.`;
        feedbackContainer.className = 'drag-drop-feedback correct';
      } else {
        feedbackMessage.textContent = this.activityData.incorrectFeedback || 
          `You have ${score} out of ${total} items correctly placed (${percentage}%). Try again!`;
        feedbackContainer.className = 'drag-drop-feedback incorrect';
      }
      
      // Add feedback to container
      feedbackContainer.appendChild(feedbackMessage);
      feedbackContainer.style.display = 'block';
      
    } catch (error) {
      console.error('Error showing feedback:', error);
    }
  }

  /**
   * Resets the activity to its initial state
   */
  resetActivity() {
    try {
      // Clear drop areas
      this.dropZones.forEach(dropZone => {
        const dropArea = dropZone.querySelector('.drop-area');
        
        // Remove any drag items
        const dragItems = dropArea.querySelectorAll('.drag-item');
        dragItems.forEach(item => {
          dropArea.removeChild(item);
        });
        
        // Show placeholder if it exists
        const placeholder = dropArea.querySelector('.drop-placeholder');
        if (placeholder) {
          placeholder.style.display = '';
        }
        
        // Remove filled class
        dropArea.classList.remove('filled');
      });
      
      // Hide feedback
      const feedbackContainer = document.getElementById(`${this.container.id}-feedback`);
      if (feedbackContainer) {
        feedbackContainer.style.display = 'none';
      }
      
      // Reset score and completed status
      this.score = 0;
      this.completed = false;
      
      // Re-render drag items
      this.renderDragItems();
      
      // Re-setup event listeners
      this.setupEventListeners();
      
    } catch (error) {
      console.error('Error resetting activity:', error);
      this.showError('Failed to reset activity. Please try again.');
    }
  }

  /**
   * Shows an error message
   * @param {string} message - Error message
   */
  showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'drag-drop-error';
    errorElement.textContent = message;
    
    // Clear container and show error
    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(errorElement);
    } else {
      console.error('Drag and drop error:', message);
    }
  }

  /**
   * Shuffles an array in place
   * @param {Array} array - Array to shuffle
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Triggers a custom event
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  triggerEvent(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    this.container.dispatchEvent(event);
    
    // Also trigger on document for global listeners
    document.dispatchEvent(new CustomEvent(`dragdrop:${eventName}`, { detail: data }));
  }
}

/**
 * Helper functions for drag and drop activities
 */
export const dragDropUtils = {
  /**
   * Creates a text drag item
   * @param {string} content - Text content
   * @param {string|number} id - Item ID
   * @returns {Object} Drag item object
   */
  createTextItem(content, id) {
    return {
      id,
      type: 'text',
      content
    };
  },
  
  /**
   * Creates an HTML drag item
   * @param {string} content - HTML content
   * @param {string|number} id - Item ID
   * @returns {Object} Drag item object
   */
  createHtmlItem(content, id) {
    return {
      id,
      type: 'html',
      content
    };
  },
  
  /**
   * Creates an image drag item
   * @param {string} src - Image source URL
   * @param {string} alt - Image alt text
   * @param {string|number} id - Item ID
   * @returns {Object} Drag item object
   */
  createImageItem(src, alt, id) {
    return {
      id,
      type: 'image',
      content: src,
      alt
    };
  },
  
  /**
   * Creates a drop zone
   * @param {string|number} id - Zone ID
   * @param {string} label - Zone label
   * @param {Array} acceptedItems - IDs of items that can be dropped in this zone
   * @param {string} placeholder - Placeholder text
   * @returns {Object} Drop zone object
   */
  createDropZone(id, label, acceptedItems, placeholder = '') {
    return {
      id,
      label,
      acceptedItems,
      placeholder
    };
  },
  
  /**
   * Creates a matching activity data object
   * @param {string} title - Activity title
   * @param {string} instructions - Activity instructions
   * @param {Array} items - Drag items
   * @param {Array} zones - Drop zones
   * @param {Object} feedback - Feedback messages
   * @returns {Object} Activity data object
   */
  createMatchingActivity(title, instructions, items, zones, feedback = {}) {
    return {
      title,
      instructions,
      items,
      zones,
      correctFeedback: feedback.correct || 'Great job! All items are correctly placed.',
      incorrectFeedback: feedback.incorrect || 'Some items are not in the correct place. Try again!'
    };
  }
};