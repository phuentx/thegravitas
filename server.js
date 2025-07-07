
const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = 3000;


// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

// Set up storage for banner uploads
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public/uploads/banners');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter for banner images
const bannerFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed for banners!'));
  }
};

const bannerUpload = multer({
  storage: bannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: bannerFileFilter,
});

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// File paths for data storage
const postsFile = path.join(__dirname, 'posts.json');
const usersFile = path.join(__dirname, 'users.json');
const notificationsFile = path.join(__dirname, 'notifications.json');
const friendsFile = path.join(__dirname, 'friends.json');
const serversFile = path.join(__dirname, 'servers.json');

// Helper functions for file operations
function readPosts() {
  try {
    if (!fs.existsSync(postsFile)) fs.writeFileSync(postsFile, '[]');
    return JSON.parse(fs.readFileSync(postsFile));
  } catch (error) {
    console.error('Error reading posts:', error);
    return [];
  }
}

function writePosts(posts) {
  try {
    fs.writeFileSync(postsFile, JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error('Error writing posts:', error);
  }
}

// File paths for data storage
const userIdCounterFile = path.join(__dirname, 'userIdCounter.json');

// Helper function to read the user ID counter
function readUserIdCounter() {
  try {
    if (!fs.existsSync(userIdCounterFile)) {
      fs.writeFileSync(userIdCounterFile, JSON.stringify({ lastUserId: 0 }));
    }
    return JSON.parse(fs.readFileSync(userIdCounterFile)).lastUserId;
  } catch (error) {
    console.error('Error reading user ID counter:', error);
    return 0;
  }
}

// Helper function to write the user ID counter
function writeUserIdCounter(lastUserId) {
  try {
    fs.writeFileSync(userIdCounterFile, JSON.stringify({ lastUserId }, null, 2));
  } catch (error) {
    console.error('Error writing user ID counter:', error);
  }
}

// Modified readUsers function
function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, '[]');
    }
    const users = JSON.parse(fs.readFileSync(usersFile));
    // Initialize all fields for existing users, including userId
    return users.map(user => ({
      userId: user.userId || null, // Preserve existing userId or set to null
      username: user.username,
      userEmail: user.userEmail,
      photoURL: user.photoURL || null,
      bio: user.bio || null,
      job: user.job || null,
      education: user.education || null,
      dob: user.dob || null,
      hobbies: Array.isArray(user.hobbies) ? user.hobbies : [],
      bannerURL: user.bannerURL || null
    }));
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

// Modified writeUsers function (unchanged from original, included for completeness)
function writeUsers(users) {
  try {
    if (!Array.isArray(users)) {
      throw new Error('Invalid users data format');
    }
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error writing users to file:', error);
    throw new Error('Failed to save user data permanently');
  }
}

function readNotifications() {
  try {
    if (!fs.existsSync(notificationsFile)) fs.writeFileSync(notificationsFile, '[]');
    return JSON.parse(fs.readFileSync(notificationsFile));
  } catch (error) {
    console.error('Error reading notifications:', error);
    return [];
  }
}

function writeNotifications(notifications) {
  try {
    fs.writeFileSync(notificationsFile, JSON.stringify(notifications, null, 2));
  } catch (error) {
    console.error('Error writing notifications:', error);
  }
}

function readFriends() {
  try {
    if (!fs.existsSync(friendsFile)) fs.writeFileSync(friendsFile, '{}');
    const friendsData = JSON.parse(fs.readFileSync(friendsFile));
    // Ensure all users have following and followers arrays
    Object.keys(friendsData).forEach(username => {
      friendsData[username].following = friendsData[username].following || [];
      friendsData[username].followers = friendsData[username].followers || [];
    });
    return friendsData;
  } catch (error) {
    console.error('Error reading friends:', error);
    return {};
  }
}

function writeFriends(friends) {
  try {
    fs.writeFileSync(friendsFile, JSON.stringify(friends, null, 2));
  } catch (error) {
    console.error('Error writing friends:', error);
  }
}

// Get all users
app.get('/users', (req, res) => {
  try {
    const users = readUsers();
    if (req.query.username) {
      const user = users.find(u => u.username === req.query.username);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json(user);
    }
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Save or update a user profile
app.post('/users', (req, res) => {
  try {
    const users = readUsers();
    const { username, userEmail, photoURL, bio, job, education, dob, hobbies } = req.body;

    // Validate required fields
    if (!username || !userEmail) {
      return res.status(400).json({ error: 'username and userEmail are required' });
    }

    // Validate hobbies if provided
    let parsedHobbies = [];
    if (hobbies !== undefined) {
      try {
        parsedHobbies = Array.isArray(hobbies) ? hobbies : JSON.parse(hobbies);
        if (!Array.isArray(parsedHobbies)) {
          return res.status(400).json({ error: 'Hobbies must be an array' });
        }
        // Ensure hobbies are non-empty strings
        parsedHobbies = parsedHobbies.filter(h => typeof h === 'string' && h.trim() !== '');
      } catch (error) {
        return res.status(400).json({ error: 'Invalid hobbies format' });
      }
    }

    const existingUserIndex = users.findIndex(u => u.userEmail === userEmail);
    let userData;
    let newUserId = readUserIdCounter();

    if (existingUserIndex !== -1) {
      // Update existing user, preserving unchanged fields and userId
      userData = {
        ...users[existingUserIndex],
        userId: users[existingUserIndex].userId || ++newUserId, // Assign new ID if none exists
        username: username.trim(),
        userEmail: userEmail.trim(),
        photoURL: photoURL !== undefined ? photoURL : users[existingUserIndex].photoURL,
        bio: bio !== undefined ? bio : users[existingUserIndex].bio,
        job: job !== undefined ? job : users[existingUserIndex].job,
        education: education !== undefined ? education : users[existingUserIndex].education,
        dob: dob !== undefined ? dob : users[existingUserIndex].dob,
        hobbies: hobbies !== undefined ? parsedHobbies : users[existingUserIndex].hobbies,
        bannerURL: users[existingUserIndex].bannerURL || null
      };
      users[existingUserIndex] = userData;
    } else {
      // Create new user with a new userId
      newUserId += 1;
      userData = {
        userId: newUserId,
        username: username.trim(),
        userEmail: userEmail.trim(),
        photoURL: photoURL || null,
        bio: bio || null,
        job: job || null,
        education: education || null,
        dob: dob || null,
        hobbies: parsedHobbies,
        bannerURL: null
      };
      users.push(userData);
    }

    // Update the user ID counter if a new ID was assigned
    if (existingUserIndex === -1 || !users[existingUserIndex].userId) {
      writeUserIdCounter(newUserId);
    }

    // Save updated users list
    writeUsers(users);
    res.json({ success: true, user: userData });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: error.message || 'Failed to save user' });
  }
});
function migrateUserIds() {
  const users = readUsers();
  let lastUserId = readUserIdCounter();
  users.forEach(user => {
    if (!user.userId) {
      user.userId = ++lastUserId;
    }
  });
  writeUsers(users);
  writeUserIdCounter(lastUserId);
}
migrateUserIds();
// Get all posts
app.get('/posts', (req, res) => {
  try {
    res.json(readPosts());
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a new post
app.post('/posts', upload.single('media'), (req, res) => {
  try {
    const posts = readPosts();
    let media = null;

    // Handle uploaded media
    if (req.file) {
      media = `/uploads/${req.file.filename}`;
    }

    const { username, userEmail, caption, tag } = req.body;

    const newPost = {
      id: Date.now(),
      username,
      userEmail,
      caption,
      tag: tag || null,
      date: new Date().toISOString(),
      likes: 0,
      reports: 0,
      comments: [],
      media,
      mediaType: media ? 'image' : null,
      likedBy: [],
      reportedBy: [],
      bookmarkedBy: [],
    };

    posts.push(newPost);
    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});
// Update a post
app.put('/posts/:id', upload.single('media'), (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { username, caption, tag, removeMedia } = req.body;
    const mediaFile = req.file;

    if (!username || !caption) {
      return res.status(400).json({ error: 'Username and caption are required' });
    }

    let posts = readPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = posts[postIndex];
    if (post.username !== username) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Update caption and tag
    post.caption = caption;
    post.tag = tag || null;

    // Handle media
    if (removeMedia === 'true' && post.media) {
      // Delete existing media file
      const mediaPath = path.join(__dirname, 'public', post.media);
      fs.unlink(mediaPath, err => {
        if (err) console.error('Error deleting media file:', err);
      });
      post.media = null;
      post.mediaType = null;
    } else if (mediaFile) {
      // Delete old media file if it exists
      if (post.media) {
        const oldMediaPath = path.join(__dirname, 'public', post.media);
        fs.unlink(oldMediaPath, err => {
          if (err) console.error('Error deleting old media file:', err);
        });
      }
      // Set new media
      post.media = `/uploads/${mediaFile.filename}`;
      post.mediaType = 'image';
    }

    // Update date to reflect edit time
    post.date = new Date().toISOString();

    posts[postIndex] = post;
    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});
// Helper function to create a notification for post deletion
function createPostDeletionNotification(post, recipient) {
  const notifications = readNotifications();
  const notification = {
    id: Date.now(),
    type: 'post_deletion',
    actor: 'Gravitas', // System notification
    message: `Your post "${post.caption.slice(0, 50)}${post.caption.length > 50 ? '...' : ''}" was deleted because it received more reports than likes by 3 or more, which is against site rules.`,
    recipient: recipient,
    postId: post.id,
    date: new Date().toISOString(),
  };
  notifications.push(notification);
  writeNotifications(notifications);
}
/// Report a post
app.post('/posts/:id/report', (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find((post) => post.id == req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.reportedBy = post.reportedBy || [];
    if (!post.reportedBy.includes(req.body.username)) {
      post.reports = (post.reports || 0) + 1;
      post.reportedBy.push(req.body.username);

      // Check if reports exceed likes by 3 or more
      if (post.reports >= (post.likes || 0) + 3) {
        // Create notification for the post owner
        createPostDeletionNotification(post, post.username);

        // Delete the post
        const mediaPath = post.media ? path.join(__dirname, 'public', post.media) : null;
        posts.splice(posts.findIndex(p => p.id == post.id), 1);
        if (mediaPath) {
          fs.unlink(mediaPath, err => {
            if (err) console.error('Error deleting media file:', err);
          });
        }
        writePosts(posts);
        return res.json({ success: true, deleted: true, message: 'Post deleted due to excessive reports' });
      }

      writePosts(posts);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'User already reported this post' });
    }
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ error: 'Failed to report post' });
  }
});

// Un-report a post
app.post('/posts/:id/unreport', async (req, res) => {
  const postId = parseInt(req.params.id);
  const { username } = req.body;

  try {
    let posts = await readPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.reportedBy || !post.reportedBy.includes(username)) {
      return res.status(400).json({ error: 'You have not reported this post' });
    }

    post.reportedBy = post.reportedBy.filter(user => user !== username);
    post.reports = (post.reports || 0) - 1;

    await writePosts(posts);
    res.status(200).json({ message: 'Post unreported successfully' });
  } catch (error) {
    console.error('Error unreporting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Share a post (increment share count)
app.post('/posts/:id/share', async (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find((post) => post.id == req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.shareCount = (post.shareCount || 0) + 1; // Increment share count
    writePosts(posts);
    res.json({ success: true, shareCount: post.shareCount });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
});
// Like a post
app.post('/posts/:id/like', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const post = posts.find((post) => post.id == req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.likedBy = post.likedBy || [];
    if (!post.likedBy.includes(req.body.username)) {
      post.likes++;
      post.likedBy.push(req.body.username);

      // Create a notification for the post owner
      if (post.username !== req.body.username) {
        const notification = {
          id: Date.now(),
          type: 'like',
          actor: req.body.username,
          message: `liked your post: "${post.caption.slice(0, 50)}${post.caption.length > 50 ? '...' : ''}"`,
          recipient: post.username,
          postId: post.id,
          date: new Date().toISOString(),
        };
        notifications.push(notification);
      }

      // Check if reports exceed likes by 3 or more
      if (post.reports >= (post.likes || 0) + 3) {
        // Create notification for the post owner
        createPostDeletionNotification(post, post.username);

        // Delete the post
        const mediaPath = post.media ? path.join(__dirname, 'public', post.media) : null;
        posts.splice(posts.findIndex(p => p.id == post.id), 1);
        if (mediaPath) {
          fs.unlink(mediaPath, err => {
            if (err) console.error('Error deleting media file:', err);
          });
        }
        writePosts(posts);
        writeNotifications(notifications);
        return res.json({ success: true, deleted: true, message: 'Post deleted due to excessive reports' });
      }

      writePosts(posts);
      writeNotifications(notifications);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'User already liked this post' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Un-like a post
app.post('/posts/:id/unlike', async (req, res) => {
  const postId = parseInt(req.params.id);
  const { username } = req.body;

  try {
    let posts = await readPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.likedBy || !post.likedBy.includes(username)) {
      return res.status(400).json({ error: 'You have not liked this post' });
    }

    post.likedBy = post.likedBy.filter(user => user !== username);
    post.likes = (post.likes || 0) - 1;

    // Check if reports exceed likes by 3 or more
    if (post.reports >= (post.likes || 0) + 3) {
      // Create notification for the post owner
      createPostDeletionNotification(post, post.username);

      // Delete the post
      const mediaPath = post.media ? path.join(__dirname, 'public', post.media) : null;
      posts.splice(posts.findIndex(p => p.id == post.id), 1);
      if (mediaPath) {
        fs.unlink(mediaPath, err => {
          if (err) console.error('Error deleting media file:', err);
        });
      }
      await writePosts(posts);
      return res.json({ success: true, deleted: true, message: 'Post deleted due to excessive reports' });
    }

    await writePosts(posts);
    res.status(200).json({ message: 'Post unliked successfully' });
  } catch (error) {
    console.error('Error unliking post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
// Bookmark a post
app.post('/posts/:id/bookmark', (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find((post) => post.id == req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    post.bookmarkedBy = post.bookmarkedBy || [];
    if (!post.bookmarkedBy.includes(req.body.username)) {
      post.bookmarkedBy.push(req.body.username);
      writePosts(posts);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: 'User already bookmarked this post' });
    }
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({ error: 'Failed to bookmark post' });
  }
});

// Unbookmark a post
app.post('/posts/:id/unbookmark', (req, res) => {
  try {
    const posts = readPosts();
    const post = posts.find((post) => post.id == req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    if (!post.bookmarkedBy || !post.bookmarkedBy.includes(req.body.username)) {
      return res.status(400).json({ error: 'You have not bookmarked this post' });
    }
    post.bookmarkedBy = post.bookmarkedBy.filter(user => user !== req.body.username);
    writePosts(posts);
    res.status(200).json({ message: 'Post unbookmarked successfully' });
  } catch (error) {
    console.error('Error unbookmarking post:', error);
    res.status(500).json({ error: 'Failed to unbookmark post' });
  }
});
// Add a comment to a post
app.post('/posts/:id/comment', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const post = posts.find((post) => post.id == req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const newComment = {
      id: Date.now().toString(),
      username: req.body.username,
      text: req.body.text,
      date: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      reports: 0,
      reportedBy: []
    };
    post.comments.push(newComment);
    
    // Create a notification for the post owner
    if (post.username !== req.body.username) {
      const notification = {
        id: Date.now(),
        type: 'comment',
        actor: req.body.username,
        message: `commented on your post: "${newComment.text.slice(0, 50)}${newComment.text.length > 50 ? '...' : ''}"`,
        recipient: post.username,
        postId: post.id,
        commentId: newComment.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);
    }

    writePosts(posts);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});
// Like a comment
app.post('/posts/:postId/comments/:commentId/like', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.likedBy = comment.likedBy || [];
    if (comment.likedBy.includes(username)) {
      return res.status(400).json({ error: 'Comment already liked' });
    }

    comment.likedBy.push(username);
    comment.likes = (comment.likes || 0) + 1;

    // Create a notification for the comment owner
    if (comment.username !== username) {
      const notification = {
        id: Date.now(),
        type: 'comment_like',
        actor: username,
        message: `liked your comment: "${comment.text.slice(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
        recipient: comment.username,
        postId: post.id,
        commentId: comment.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);
    }

    writePosts(posts);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Failed to like comment' });
  }
});

// Unlike a comment
app.post('/posts/:postId/comments/:commentId/unlike', (req, res) => {
  try {
    const posts = readPosts();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (!comment.likedBy || !comment.likedBy.includes(username)) {
      return res.status(400).json({ error: 'Comment not liked by user' });
    }

    comment.likedBy = comment.likedBy.filter(user => user !== username);
    comment.likes = (comment.likes || 0) - 1;

    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ error: 'Failed to unlike comment' });
  }
});
// Report a comment
app.post('/posts/:postId/comments/:commentId/report', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.reportedBy = comment.reportedBy || [];
    if (comment.reportedBy.includes(username)) {
      return res.status(400).json({ error: 'User already reported this comment' });
    }

    comment.reportedBy.push(username);
    comment.reports = (comment.reports || 0) + 1;

    // Check if reports exceed likes by 3 or more
    if (comment.reports >= (comment.likes || 0) + 3) {
      // Create notification for the comment owner
      const notification = {
        id: Date.now(),
        type: 'comment_deletion',
        actor: 'Gravitas',
        message: `Your comment "${comment.text.slice(0, 50)}${comment.text.length > 50 ? '...' : ''}" was deleted because it received more reports than likes by 3 or more, which is against site rules.`,
        recipient: comment.username,
        postId: post.id,
        commentId: comment.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);

      // Delete the comment
      post.comments = post.comments.filter(c => c.id !== commentId);
      writePosts(posts);
      writeNotifications(notifications);
      return res.json({ success: true, deleted: true, message: 'Comment deleted due to excessive reports' });
    }

    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({ error: 'Failed to report comment' });
  }
});
// Delete a comment
app.delete('/posts/:postId/comments/:commentId', (req, res) => {
  try {
    const posts = readPosts();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentIndex = post.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = post.comments[commentIndex];
    if (comment.username !== username) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    post.comments.splice(commentIndex, 1);
    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});


// Get notifications for a user
app.get('/notifications', (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const notifications = readNotifications();
    const userNotifications = notifications
      .filter(notification => notification.recipient === username)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(userNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get friends and friend requests for a user
app.get('/friends', (req, res) => {
  try {
    const username = req.query.username;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    const friendsData = readFriends();
    const users = readUsers();

    // Initialize user data if not present
    if (!friendsData[username]) {
      friendsData[username] = { friends: [], requests: [], following: [], followers: [] };
      writeFriends(friendsData);
    }

    const friends = friendsData[username].friends || [];
    const requests = friendsData[username].requests || [];
    const following = friendsData[username].following || [];
    const followers = friendsData[username].followers || [];

    res.json({
      friends,
      requests,
      following,
      followers,
      users,
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Failed to fetch friends' });
  }
});

// Send a friend request
app.post('/friend-request', (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'Sender and recipient usernames are required' });
    }
    if (from === to) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }

    const friendsData = readFriends();
    const notifications = readNotifications();
    const users = readUsers();

    // Initialize data for users if not present
    if (!friendsData[from]) friendsData[from] = { friends: [], requests: [], following: [], followers: [] };
    if (!friendsData[to]) friendsData[to] = { friends: [], requests: [], following: [], followers: [] };

    // Check if users exist
    const fromUser = users.find(u => u.username === from);
    const toUser = users.find(u => u.username === to);
    if (!fromUser || !toUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already friends
    if (friendsData[from].friends.includes(to) || friendsData[to].friends.includes(from)) {
      return res.status(400).json({ error: 'Users are already friends' });
    }

    // Check if request already exists
    const existingRequest = friendsData[to].requests.find(r => r.from === from && r.to === to);
    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already sent' });
    }

    // Add friend request
    friendsData[to].requests.push({ from, to, date: new Date().toISOString() });

    // Create a notification for the recipient
    const notification = {
      id: Date.now(),
      type: 'friend_request',
      actor: from,
      message: `sent you a friend request`,
      recipient: to,
      date: new Date().toISOString(),
    };
    notifications.push(notification);

    writeFriends(friendsData);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

// Accept a friend request
app.post('/friend-request/accept', (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ error: 'Sender and recipient usernames are required' });
    }

    const friendsData = readFriends();
    const notifications = readNotifications();

    // Initialize data for users if not present
    if (!friendsData[from]) friendsData[from] = { friends: [], requests: [], following: [], followers: [] };
    if (!friendsData[to]) friendsData[to] = { friends: [], requests: [], following: [], followers: [] };

    // Find and remove the friend request
    const requestIndex = friendsData[to].requests.findIndex(r => r.from === from && r.to === to);
    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    friendsData[to].requests.splice(requestIndex, 1);

    // Add each user to the other's friends list
    friendsData[from].friends.push(to);
    friendsData[to].friends.push(from);

    // Create a notification for the sender
    const notification = {
      id: Date.now(),
      type: 'friend_accept',
      actor: to,
      message: `accepted your friend request`,
      recipient: from,
      date: new Date().toISOString(),
    };
    notifications.push(notification);

    writeFriends(friendsData);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

// Follow a user
app.post('/follow', (req, res) => {
  try {
    const { follower, followed } = req.body;
    if (!follower || !followed) {
      return res.status(400).json({ error: 'Follower and followed usernames are required' });
    }
    if (follower === followed) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const friendsData = readFriends();
    const users = readUsers();
    const notifications = readNotifications();

    // Initialize data for users if not present
    if (!friendsData[follower]) friendsData[follower] = { friends: [], requests: [], following: [], followers: [] };
    if (!friendsData[followed]) friendsData[followed] = { friends: [], requests: [], following: [], followers: [] };

    // Check if users exist
    const followerUser = users.find(u => u.username === follower);
    const followedUser = users.find(u => u.username === followed);
    if (!followerUser || !followedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    if (friendsData[follower].following.includes(followed)) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add to follow lists
    friendsData[follower].following = friendsData[follower].following || [];
    friendsData[follower].following.push(followed);
    friendsData[followed].followers = friendsData[followed].followers || [];
    friendsData[followed].followers.push(follower);

    // Create a notification for the followed user
    const notification = {
      id: Date.now(),
      type: 'follow',
      actor: follower,
      message: `started following you`,
      recipient: followed,
      date: new Date().toISOString(),
    };
    notifications.push(notification);

    writeFriends(friendsData);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
app.post('/unfollow', (req, res) => {
  try {
    const { follower, followed } = req.body;
    if (!follower || !followed) {
      return res.status(400).json({ error: 'Follower and followed usernames are required' });
    }

    const friendsData = readFriends();
    if (!friendsData[follower] || !friendsData[followed]) {
      return res.status(404).json({ error: 'User data not found' });
    }

    // Check if following
    if (!friendsData[follower].following.includes(followed)) {
      return res.status(400).json({ error: 'Not following this user' });
    }

    // Remove from follow lists
    friendsData[follower].following = friendsData[follower].following.filter(user => user !== followed);
    friendsData[followed].followers = friendsData[followed].followers.filter(user => user !== follower);

    writeFriends(friendsData);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Delete a post
app.delete('/posts/:id', (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let posts = readPosts();
    const post = posts.find(p => p.id === postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify ownership
    if (post.username !== username) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Remove the post
    posts = posts.filter(p => p.id !== postId);
    writePosts(posts);

    // If the post had media, optionally delete the file
    if (post.media) {
      const mediaPath = path.join(__dirname, 'public', post.media);
      fs.unlink(mediaPath, err => {
        if (err) console.error('Error deleting media file:', err);
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Delete a notification
app.delete('/notifications/:id', (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let notifications = readNotifications();
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.recipient !== username) {
      return res.status(403).json({ error: 'You can only delete your own notifications' });
    }

    // Remove the notification
    notifications = notifications.filter(n => n.id !== notificationId);
    writeNotifications(notifications);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Delete all notifications for a user
app.delete('/notifications', (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let notifications = readNotifications();
    // Keep only notifications that don't belong to the user
    notifications = notifications.filter(n => n.recipient !== username);
    writeNotifications(notifications);

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({ error: 'Failed to delete all notifications' });
  }
});
// Update user bio and banner
app.post('/users/update', bannerUpload.single('banner'), async (req, res) => {
  try {
    const users = readUsers();
    const { username, authUsername, bio, job, education, dob, hobbies } = req.body;
    const bannerFile = req.file;

    if (!username || username !== authUsername) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Handle hobbies input
    let parsedHobbies = users[userIndex].hobbies || [];
    if (hobbies !== undefined) {
      try {
        // Handle FormData array (e.g., hobbies[]=painting&hobbies[]=traveling)
        if (Array.isArray(hobbies)) {
          parsedHobbies = hobbies.filter(h => typeof h === 'string' && h.trim() !== '');
        }
        // Handle JSON string
        else if (typeof hobbies === 'string') {
          // Try parsing as JSON
          try {
            parsedHobbies = JSON.parse(hobbies);
            if (!Array.isArray(parsedHobbies)) {
              return res.status(400).json({ error: 'Hobbies must be an array' });
            }
            // Validate that all elements are strings
            if (!parsedHobbies.every(h => typeof h === 'string' && h.trim() !== '')) {
              return res.status(400).json({ error: 'All hobbies must be non-empty strings' });
            }
          } catch (jsonError) {
            // Handle comma-separated string (e.g., "painting,traveling")
            parsedHobbies = hobbies.split(',').map(h => h.trim()).filter(h => h !== '');
            if (parsedHobbies.length === 0) {
              return res.status(400).json({ error: 'Hobbies cannot be empty' });
            }
          }
        } else {
          return res.status(400).json({ error: 'Hobbies must be an array or a string' });
        }
      } catch (error) {
        console.error('Error parsing hobbies:', error, { hobbies });
        return res.status(400).json({ error: 'Invalid hobbies format', details: error.message });
      }
    }

    // Update user fields
    users[userIndex] = {
      ...users[userIndex],
      bio: bio !== undefined ? bio : users[userIndex].bio,
      job: job !== undefined ? job : users[userIndex].job,
      education: education !== undefined ? education : users[userIndex].education,
      dob: dob !== undefined ? dob : users[userIndex].dob,
      hobbies: parsedHobbies
    };

    // Handle banner upload
    if (bannerFile) {
      // Delete old banner if it exists
      if (users[userIndex].bannerURL) {
        const oldBannerPath = path.join(__dirname, 'public', users[userIndex].bannerURL);
        fs.unlink(oldBannerPath, err => {
          if (err) console.error('Error deleting old banner:', err);
        });
      }
      users[userIndex].bannerURL = `/uploads/banners/${bannerFile.filename}`;
    }

    writeUsers(users);
    res.json({ success: true, user: users[userIndex] });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Add a reply to a comment
app.post('/posts/:postId/comments/:commentId/reply', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const { username, text } = req.body;

    if (!username || !text) {
      return res.status(400).json({ error: 'Username and text are required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const newReply = {
      id: Date.now().toString(),
      username,
      text,
      date: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      reports: 0,
      reportedBy: []
    };

    comment.replies = comment.replies || [];
    comment.replies.push(newReply);

    // Create a notification for the comment owner
    if (comment.username !== username) {
      const notification = {
        id: Date.now(),
        type: 'reply',
        actor: username,
        message: `replied to your comment: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`,
        recipient: comment.username,
        postId: post.id,
        commentId: comment.id,
        replyId: newReply.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);
    }

    writePosts(posts);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Like a reply
app.post('/posts/:postId/comments/:commentId/replies/:replyId/like', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    reply.likedBy = reply.likedBy || [];
    if (reply.likedBy.includes(username)) {
      return res.status(400).json({ error: 'Reply already liked' });
    }

    reply.likedBy.push(username);
    reply.likes = (reply.likes || 0) + 1;

    // Create a notification for the reply owner
    if (reply.username !== username) {
      const notification = {
        id: Date.now(),
        type: 'reply_like',
        actor: username,
        message: `liked your reply: "${reply.text.slice(0, 50)}${reply.text.length > 50 ? '...' : ''}"`,
        recipient: reply.username,
        postId: post.id,
        commentId: comment.id,
        replyId: reply.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);
    }

    writePosts(posts);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ error: 'Failed to like reply' });
  }
});

// Unlike a reply
app.post('/posts/:postId/comments/:commentId/replies/:replyId/unlike', (req, res) => {
  try {
    const posts = readPosts();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (!reply.likedBy || !reply.likedBy.includes(username)) {
      return res.status(400).json({ error: 'Reply not liked by user' });
    }

    reply.likedBy = reply.likedBy.filter(user => user !== username);
    reply.likes = (reply.likes || 0) - 1;

    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking reply:', error);
    res.status(500).json({ error: 'Failed to unlike reply' });
  }
});

// Report a reply
app.post('/posts/:postId/comments/:commentId/replies/:replyId/report', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    reply.reportedBy = reply.reportedBy || [];
    if (reply.reportedBy.includes(username)) {
      return res.status(400).json({ error: 'User already reported this reply' });
    }

    reply.reportedBy.push(username);
    reply.reports = (reply.reports || 0) + 1;

    // Check if reports exceed likes by 3 or more
    if (reply.reports >= (reply.likes || 0) + 3) {
      // Create notification for the reply owner
      const notification = {
        id: Date.now(),
        type: 'reply_deletion',
        actor: 'Gravitas',
        message: `Your reply "${reply.text.slice(0, 50)}${reply.text.length > 50 ? '...' : ''}" was deleted because it received more reports than likes by 3 or more, which is against site rules.`,
        recipient: reply.username,
        postId: post.id,
        commentId: comment.id,
        replyId: reply.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);

      // Delete the reply
      comment.replies = comment.replies.filter(r => r.id !== replyId);
      writePosts(posts);
      writeNotifications(notifications);
      return res.json({ success: true, deleted: true, message: 'Reply deleted due to excessive reports' });
    }

    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting reply:', error);
    res.status(500).json({ error: 'Failed to report reply' });
  }
});

// Delete a reply
app.delete('/posts/:postId/comments/:commentId/replies/:replyId', (req, res) => {
  try {
    const posts = readPosts();
    const postId = parseInt(req.params.postId);
    const commentId = req.params.commentId;
    const replyId = req.params.replyId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.find(c => c.id === commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const reply = comment.replies.find(r => r.id === replyId);
    if (!reply) {
      return res.status(404).json({ error: 'Reply not found' });
    }

    if (reply.username !== username) {
      return res.status(403).json({ error: 'Not authorized to delete this reply' });
    }

    comment.replies = comment.replies.filter(r => r.id !== replyId);
    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ error: 'Failed to delete reply' });
  }
});
// Add a related post to a post
app.post('/posts/:postId/relate', upload.single('media'), (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const { username, text } = req.body;
    const mediaFile = req.file;

    if (!username || (!text && !mediaFile)) {
      return res.status(400).json({ error: 'Username and either text or media are required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Initialize relates array if it doesn't exist
    post.relates = post.relates || [];

    const newRelate = {
      id: Date.now().toString(),
      username,
      text: text || '',
      media: mediaFile ? `/uploads/${mediaFile.filename}` : null,
      mediaType: mediaFile ? 'image' : null,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    post.relates.push(newRelate);

    // Create a notification for the post owner if the relate is from a different user
    if (post.username !== username) {
      const notification = {
        id: Date.now(),
        type: 'relate',
        actor: username,
        message: `added a related post to your post: "${text ? text.slice(0, 50) + (text.length > 50 ? '...' : '') : 'Image post'}"`,
        recipient: post.username,
        postId: post.id,
        relateId: newRelate.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);
    }

    writePosts(posts);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error adding related post:', error);
    res.status(500).json({ error: 'Failed to add related post' });
  }
});

// Like a related post
app.post('/posts/:postId/relates/:relateId/like', (req, res) => {
  try {
    const posts = readPosts();
    const notifications = readNotifications();
    const postId = parseInt(req.params.postId);
    const relateId = req.params.relateId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const relate = post.relates.find(r => r.id === relateId);
    if (!relate) {
      return res.status(404).json({ error: 'Related post not found' });
    }

    relate.likedBy = relate.likedBy || [];
    if (relate.likedBy.includes(username)) {
      return res.status(400).json({ error: 'Related post already liked' });
    }

    relate.likedBy.push(username);
    relate.likes = (relate.likes || 0) + 1;

    // Create a notification for the relate owner if different from the liker
    if (relate.username !== username) {
      const notification = {
        id: Date.now(),
        type: 'relate_like',
        actor: username,
        message: `liked your related post: "${relate.text ? relate.text.slice(0, 50) + (relate.text.length > 50 ? '...' : '') : 'Image post'}"`,
        recipient: relate.username,
        postId: post.id,
        relateId: relate.id,
        date: new Date().toISOString(),
      };
      notifications.push(notification);
    }

    writePosts(posts);
    writeNotifications(notifications);
    res.json({ success: true });
  } catch (error) {
    console.error('Error liking related post:', error);
    res.status(500).json({ error: 'Failed to like related post' });
  }
});

// Unlike a related post
app.post('/posts/:postId/relates/:relateId/unlike', (req, res) => {
  try {
    const posts = readPosts();
    const postId = parseInt(req.params.postId);
    const relateId = req.params.relateId;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const relate = post.relates.find(r => r.id === relateId);
    if (!relate) {
      return res.status(404).json({ error: 'Related post not found' });
    }

    if (!relate.likedBy || !relate.likedBy.includes(username)) {
      return res.status(400).json({ error: 'Related post not liked by user' });
    }

    relate.likedBy = relate.likedBy.filter(user => user !== username);
    relate.likes = (relate.likes || 0) - 1;

    writePosts(posts);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unliking related post:', error);
    res.status(500).json({ error: 'Failed to unlike related post' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});  
