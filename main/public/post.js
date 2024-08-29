document.addEventListener('DOMContentLoaded', () => {
    loadPosts();

    const postForm = document.getElementById('postForm');
    postForm.addEventListener('submit', function(event) {
        event.preventDefault();  // Prevent the default form submission
        addPost();  // Call the addPost function to handle submission via JavaScript
    });
});

function loadPosts() {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const postsContainer = document.getElementById('postsContainer');
            postsContainer.innerHTML = '';
            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                
                const postContent = `
                    <p><strong>${post.email}</strong></p> <!-- Display email here -->
                    <p>${post.content}</p>
                    ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" style="max-width: 100%; height: auto; display: block; margin: 0 auto;">` : ''}
                    <div>
                        <span class="like-button" onclick="likePost(${post.id})">Like (${post.likes})</span>
                        <button onclick="deletePost(${post.id})">Delete</button> <!-- Add delete button -->
                    </div>
                    <div class="comments-section">
                        ${post.comments.map(comment => `<div class="comment">${comment.content}</div>`).join('')}
                        <div class="comment-form">
                            <textarea id="commentContent${post.id}" placeholder="Add a comment..."></textarea>
                            <button onclick="addComment(${post.id})">Comment</button>
                        </div>
                    </div>
                `;

                postElement.innerHTML = postContent;
                postsContainer.appendChild(postElement);
            });
        });
}





function addPost() {
    const postForm = document.getElementById('postForm');
    const formData = new FormData(postForm);
    
    // Get email from localStorage
    const userEmail = localStorage.getItem('userEmail');
    
    // Add email to FormData
    formData.append('email', userEmail);

    fetch('/api/posts', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(newPost => {
        loadPosts();  // Reload posts to reflect the new post
        // Clear the form fields
        postForm.reset();
    });
}


function likePost(postId) {
    fetch(`/api/posts/${postId}/like`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(updatedPost => {
        loadPosts();  // Reload posts to reflect the like
    });
}
function deletePost(postId) {
    fetch(`/api/posts/${postId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);  // Display success message
        loadPosts();  // Reload posts to reflect the deletion
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function addComment(postId) {
    const commentContent = document.getElementById(`commentContent${postId}`).value;

    if (commentContent.trim() === '') {
        alert('Please write something!');
        return;
    }

    fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentContent }),
    })
    .then(response => response.json())
    .then(newComment => {
        loadPosts();  // Reload posts to reflect the new comment
    });
}
