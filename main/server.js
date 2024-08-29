const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 8085;

// Use built-in middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Initialize posts array
const POSTS_FILE = 'posts.json';
let posts = [];

// Load posts from file at server start
if (fs.existsSync(POSTS_FILE)) {
    const data = fs.readFileSync(POSTS_FILE, 'utf8');
    posts = JSON.parse(data);
}

// Function to save posts to file
function savePostsToFile() {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2));
}

// Set up storage for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, file.originalname)  // Simplified filename handling
});

const upload = multer({ storage: storage });

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route to get all posts
app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.post('/api/posts', upload.single('image'), (req, res) => {
    const { content } = req.body;
    const email = req.body.email;  // Retrieve email from request

    const newPost = {
        id: posts.length + 1,
        content,
        email,  // Include email
        imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
        likes: 0,
        comments: [],
    };
    posts.push(newPost);
    savePostsToFile(); 
    res.status(201).json(newPost);
});

// Route to like a post
app.post('/api/posts/:id/like', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    if (post) {
        post.likes += 1;
        savePostsToFile(); // Save the updated posts array to file
        res.json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

// Route to comment on a post
app.post('/api/posts/:id/comment', (req, res) => {
    const postId = parseInt(req.params.id);
    const { commentContent } = req.body;
    const post = posts.find(p => p.id === postId);
    if (post) {
        const newComment = {
            id: post.comments.length + 1,
            content: commentContent,
        };
        post.comments.push(newComment);
        savePostsToFile(); // Save the updated posts array to file
        res.status(201).json(newComment);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

// Route to delete a post
app.delete('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);

    if (postIndex > -1) {
        posts.splice(postIndex, 1);  // Remove the post from the array
        savePostsToFile();  // Save the updated posts array to file
        res.status(200).json({ message: 'Post deleted' });
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
