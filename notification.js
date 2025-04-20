window.onload = function () {
    const notificationIcon = document.getElementById('notification-icon');
    const notificationCount = document.getElementById('notification-count');
    const notificationList = document.getElementById('notification-list');

    let notificationInterval = null;  

    // Function to load notifications from the backend
    function loadNotifications() {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        fetch(`/api/notifications?userId=${userId}`)
            .then(res => res.json())
            .then(data => {
                // If notifications were cleared, don't update the count
                if (window._notificationsCleared) {
                    return;  
                }

                // If new notifications exist, update the count
                if (data.length > 0) {
                    notificationCount.innerText = data.length;
                    notificationCount.style.display = 'inline-block';  
                } else {
                    notificationCount.style.display = 'none';  
                }

                // Store the notifications globally
                window._fetchedNotifications = data;  
            });
    }

    // Load notifications on initial page load
    loadNotifications();  

    // Handle click on notification icon
    notificationIcon.onclick = function () {
        const modalEl = document.getElementById('notificationModal');
        const modalDialog = document.getElementById('notification-dialog');
        const iconRect = notificationIcon.getBoundingClientRect();

        // Position the modal dialog near the bell icon
        modalDialog.style.top = `${iconRect.bottom + window.scrollY + 10}px`;
        modalDialog.style.left = `${iconRect.left + window.scrollX - 250}px`;  

        // Clear previous content
        notificationList.innerHTML = '';

        // Populate modal with messages from fetched notifications
        const notifications = window._fetchedNotifications || [];  
        if (notifications.length > 0) {
            notifications.slice().reverse().forEach(msg => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = msg.message;  
                notificationList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'list-group-item text-muted';
            li.textContent = 'No new notifications';
            notificationList.appendChild(li);
        }

        // Show the Bootstrap modal
        const modal = new bootstrap.Modal(modalEl, {
            backdrop: false,
            keyboard: true
        });
        modal.show();
    };

    // Clear notifications function
    function clearNotifications() {
        // Clear notifications from localStorage
        localStorage.removeItem('notifications');

        // Clear notifications from the modal and hide the count
        notificationCount.style.display = 'none';
        notificationList.innerHTML = '<li class="list-group-item text-muted">No new notifications</li>';

        // Reset the notifications globally
        window._fetchedNotifications = [];  // Clear fetched notifications

        // Flag to prevent interval updates and prevent reloading count
        window._notificationsCleared = true;  // Set flag to true when cleared

        // Reset notification count text to 0 (it will stay hidden because of the display: none)
        notificationCount.innerText = '0';  
    }

    // Add event listener for the "Clear All" button
    const clearButton = document.getElementById('clear-all-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            clearNotifications();
            
            // Disable the interval refresh after clearing notifications
            if (notificationInterval) {
                clearInterval(notificationInterval);  // Stop the interval
                notificationInterval = null;  // Ensure the interval is removed
            }

            // Optionally, show a confirmation or feedback message
            setTimeout(() => {
                // Reset flag to prevent incorrect fetch
                window._notificationsCleared = false;

                // Force load notifications again if new ones exist
                loadNotifications();  // Load notifications after clearing
            }, 1000);  // Wait a little to allow the modal to close properly
        });
    }

    // Function to reload notifications manually if needed
    function reloadNotifications() {
        loadNotifications();  // Force a refresh of notifications
    }
};


