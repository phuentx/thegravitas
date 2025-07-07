

let currentPostId = null;
let pollOptionCount = 2;
let notificationCount = 0;

// Toggle notification dropdown
const toggleNotificationDropdown = async () => {
  const dropdown = document.getElementById('notification-dropdown');
  const isVisible = dropdown.style.display === 'block';
  
  if (!isVisible) {
    dropdown.style.display = 'block';
    await loadNotificationsForDropdown();
  } else {
    dropdown.style.display = 'none';
  }
};

// Modified loadNotifications function for dropdown
const loadNotificationsForDropdown = async () => {
  try {
    const username = localStorage.getItem('username');
    const [notifications, users, friendData] = await Promise.all([
      fetch(`/notifications?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch notifications')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    notificationCount = notifications.length;
    updateNotificationCount();

    const notificationContent = document.getElementById('notification-content');
    const deleteAllButton = document.querySelector('.notification-dropdown .delete-all-notifications');
    deleteAllButton.style.display = notifications.length ? 'block' : 'none';

    const officialUsernames = ['Gravitas', 'Newton', 'Dino'];
    const friendNotifications = notifications.filter(n => friendData.friends.includes(n.actor));
    const nonFriendNotifications = notifications.filter(n => !friendData.friends.includes(n.actor) && !officialUsernames.includes(n.actor));
    const officialNotifications = notifications.filter(n => officialUsernames.includes(n.actor));
    const currentUserPhoto = localStorage.getItem('userPhoto');

    const renderNotifications = category => {
      const notificationsToShow = category === 'friends' ? friendNotifications : category === 'non-friends' ? nonFriendNotifications : officialNotifications;
      notificationContent.innerHTML = notificationsToShow.length ? notificationsToShow.map(notification => {
        const user = users.find(u => u.username === notification.actor) || { username: notification.actor, photoURL: '/default-profile.jpg' };
        const notificationUserPhoto = notification.actor === username ? currentUserPhoto : user.photoURL || '/default-profile.jpg';
        const onclickAction = notification.postId 
          ? `loadPostInMiddle(${notification.postId})`
          : `loadUserProfileInMiddle('${notification.actor}')`;
        return `
          <div class="notification" style="cursor: ${notification.postId || notification.actor ? 'pointer' : 'default'}; position: relative;" onclick="${onclickAction}">
            <img src="${notificationUserPhoto}" alt="${notification.actor}" />
            <div class="notification-content">
              <p><span class="username">${notification.actor}</span><span class="message"> ${notification.message}</span></p>
              <div class="time">${new Date(notification.date).toLocaleString()}</div>
            </div>
            <button class="action-button delete-notification" onclick="deleteNotification('${notification.id}'); event.stopPropagation();" style="position: absolute; top: 12px; right: 12px;" aria-label="Delete notification"><i class="bi bi-trash"></i></button>
          </div>`;
      }).join('') : `<p class="notification-empty">${category === 'friends' ? 'No notifications from friends.' : category === 'non-friends' ? 'No notifications from non-friends.' : 'No official notifications.'}</p>`;
    };

    renderNotifications('friends');
    document.querySelectorAll('.notification-tab').forEach(tab => tab.removeEventListener('click', handleTabClick)); // Remove existing listeners
    document.querySelectorAll('.notification-tab').forEach(tab => tab.addEventListener('click', handleTabClick));

    function handleTabClick() {
      document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      renderNotifications(this.getAttribute('data-tab'));
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
    document.getElementById('notification-content').innerHTML = '<p>Error loading notifications. Please try again later.</p>';
  }
};

// Update notification count badge
const updateNotificationCount = () => {
  const countElement = document.getElementById('notification-count');
  if (notificationCount > 0) {
    countElement.textContent = notificationCount > 99 ? '99+' : notificationCount;
    countElement.style.display = 'block';
  } else {
    countElement.style.display = 'none';
  }
};
const loadNotifications = async () => {
  try {
    const username = localStorage.getItem('username');
    const [notifications, users, friendData] = await Promise.all([
      fetch(`/notifications?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch notifications')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);
    const external = document.getElementById('external-content');
    external.innerHTML = `
      <div class="notification-header">
        <h2>Notifications</h2>
        ${notifications.length ? `<button class="action-button delete-all-notifications" onclick="deleteAllNotifications()" aria-label="Delete all notifications"><i class="bi bi-trash"></i> Delete All</button>` : ''}
      </div>
      <div class="notification-tabs">
        <div class="notification-tab active" data-tab="friends">Friends</div>
        <div class="notification-tab" data-tab="non-friends">Non-Friends</div>
        <div class="notification-tab" data-tab="official">Official</div>
      </div>
      <div id="notification-content"></div>`;
    const notificationContent = document.getElementById('notification-content');
    const officialUsernames = ['Gravitas', 'Newton', 'Dino'];
    const friendNotifications = notifications.filter(n => friendData.friends.includes(n.actor));
    const nonFriendNotifications = notifications.filter(n => !friendData.friends.includes(n.actor) && !officialUsernames.includes(n.actor));
    const officialNotifications = notifications.filter(n => officialUsernames.includes(n.actor));
    const currentUserPhoto = localStorage.getItem('userPhoto');

    const renderNotifications = category => {
      const notificationsToShow = category === 'friends' ? friendNotifications : category === 'non-friends' ? nonFriendNotifications : officialNotifications;
      notificationContent.innerHTML = notificationsToShow.length ? notificationsToShow.map(notification => {
        const user = users.find(u => u.username === notification.actor) || { username: notification.actor, photoURL: '/default-profile.jpg' };
        const notificationUserPhoto = notification.actor === username ? currentUserPhoto : user.photoURL || '/default-profile.jpg';
        // Use loadPostInMiddle for post-related notifications, otherwise loadUserProfileInMiddle
        const onclickAction = notification.postId 
          ? `loadPostInMiddle(${notification.postId})`
          : `loadUserProfileInMiddle('${notification.actor}')`;
        return `
          <div class="notification" style="cursor: ${notification.postId || notification.actor ? 'pointer' : 'default'}; position: relative;" onclick="${onclickAction}">
            <img src="${notificationUserPhoto}" alt="${notification.actor}" />
            <div class="notification-content">
              <p><span class="username">${notification.actor}</span><span class="message"> ${notification.message}</span></p>
              <div class="time">${new Date(notification.date).toLocaleString()}</div>
            </div>
            <button class="action-button delete-notification" onclick="deleteNotification('${notification.id}'); event.stopPropagation();" style="position: absolute; top: 12px; right: 12px;" aria-label="Delete notification"><i class="bi bi-trash"></i></button>
          </div>`;
      }).join('') : `<p class="notification-empty">${category === 'friends' ? 'No notifications from friends.' : category === 'non-friends' ? 'No notifications from non-friends.' : 'No official notifications.'}</p>`;
    };

    renderNotifications('friends');
    document.querySelectorAll('.notification-tab').forEach(tab => tab.addEventListener('click', () => {
      document.querySelectorAll('.notification-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderNotifications(tab.getAttribute('data-tab'));
    }));
  } catch (error) {
    console.error('Error loading notifications:', error);
    document.getElementById('external-content').innerHTML = '<p>Error loading notifications. Please try again later.</p>';
  }
};
const deleteAllNotifications = async () => {
  if (!confirm('Are you sure you want to delete all your notifications? This cannot be undone.')) return;
  try {
    const username = localStorage.getItem('username');
    const res = await fetch('/notifications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete all notifications');
    loadNotifications();
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    alert('Failed to delete all notifications. Please try again.');
  }
};
// Load trending content (tags and users)
const loadTrendingContent = async () => {
  try {
    const [posts, users] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users'))
    ]);

    // Calculate trending tags (based on frequency in recent posts)
    const tagCounts = {};
    posts.forEach(post => {
      if (post.tag) {
        tagCounts[post.tag] = (tagCounts[post.tag] || 0) + 1;
      }
    });
    const trendingTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Calculate trending users (based on total likes on their posts)
    const userLikes = {};
    posts.forEach(post => {
      userLikes[post.username] = (userLikes[post.username] || 0) + (post.likes || 0);
    });
    const trendingUsers = Object.entries(userLikes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([username]) => users.find(u => u.username === username) || { username, photoURL: '/default-profile.jpg' });

    // Render trending tags
    const trendingTagsDiv = document.getElementById('trending-tags');
    trendingTagsDiv.innerHTML = trendingTags.length ?
      trendingTags.map(tag => `
        <button class="tag-button" onclick="searchByTag('${tag}')">#${tag}</button>
      `).join('') :
      '<p class="empty-text">No trending tags.</p>';

    // Render trending users
    const trendingUsersDiv = document.getElementById('trending-users');
    trendingUsersDiv.innerHTML = trendingUsers.length ?
      trendingUsers.map(user => `
        <div class="user-card" onclick="loadUserProfileInMiddle('${user.username}')">
          <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="user-avatar" />
          <div class="user-info">
            <h4>${user.username}</h4>
            <p>${user.bio || 'No bio'}</p>
          </div>
        </div>
      `).join('') :
      '<p class="empty-text">No trending users.</p>';
  } catch (error) {
    console.error('Error loading trending content:', error);
    document.getElementById('trending-tags').innerHTML = '<p class="empty-text">Error loading trending tags.</p>';
    document.getElementById('trending-users').innerHTML = '<p class="empty-text">Error loading trending users.</p>';
  }
};

// Modified loadContent to handle explore page and load trending content
const loadContent = (page, element) => {
  document.querySelectorAll('.nav-item, .footer-nav-item, .mobile-nav-item').forEach(item => item.classList.remove('active'));
  element.classList.add('active');
  if (element.classList.contains('footer-nav-item')) {
    document.querySelectorAll('.footer-nav-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
  }

  const feeds = document.getElementById('feeds');
  const external = document.getElementById('external-content');
  feeds.style.display = page === 'home' ? 'block' : 'none';
  external.style.display = page === 'home' ? 'none' : 'block';
  external.innerHTML = '';

  // Close notification dropdown when navigating
  const dropdown = document.getElementById('notification-dropdown');
  dropdown.style.display = 'none';

  // Load trending content for home and explore pages
  if (page === 'home' || page === 'explore') {
    loadTrendingContent();
  }

  const actions = {
    home: loadPosts,
    notifications: loadNotifications,
    friends: loadFriends,
    people: loadPeople,
    profile: loadProfilePosts,
    liked: loadLikedPosts,
    bookmarked: loadBookmarkedPosts,
    more: openMoreOverlay,
    explore: loadExplorePage,
    search: () => {
      external.innerHTML = `
        <div class="right-sidebar">
          <div class="sideheader">
            <div class="search-container">
              <i class="bi bi-globe-americas search-icon"></i>
              <input type="text" class="sidebar-search" placeholder="Search GraVitas">
            </div>
          </div>`;
      external.querySelector('.sidebar-search').addEventListener('input', e => searchGraVitas(e.target.value.trim().toLowerCase()));
    }
  };

  actions[page] ? actions[page]() : 
    fetch(`${page}.html`)
      .then(res => res.ok ? res.text() : Promise.reject(`Failed to load ${page}.html`))
      .then(html => external.innerHTML = html)
      .catch(err => external.innerHTML = `<p>Error loading content: ${err}</p>`);
};

// Updated function to load the explore page with cleaner design
const loadExplorePage = async () => {
  const external = document.getElementById('external-content');
  const feeds = document.getElementById('feeds');
  feeds.style.display = 'none';
  external.style.display = 'block';

  // Render explore page with refined layout
  external.innerHTML = `
    <div class="explore-container">
      <div class="search-container">
        <input type="text" id="explore-search" class="form-control explore-search" placeholder="Search users, posts, tags, or hashtags...">
      </div>
      <div class="explore-tabs">
        <button class="tab-button active" data-tab="top">Top</button>
        <button class="tab-button" data-tab="users">Users</button>
        <button class="tab-button" data-tab="posts">Posts</button>
        <button class="tab-button" data-tab="tags">Tags</button>
      </div>
      <div id="explore-content"></div>
    </div>
  `;

  // Add event listeners for tabs
  document.querySelectorAll('.tab-button').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const searchQuery = document.getElementById('explore-search').value.trim().toLowerCase();
      renderExploreContent(tab.getAttribute('data-tab'), searchQuery);
    });
  });

  // Add event listener for search input with debouncing
  let debounceTimeout;
  document.getElementById('explore-search').addEventListener('input', e => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      const query = e.target.value.trim().toLowerCase();
      const activeTab = document.querySelector('.tab-button.active').getAttribute('data-tab');
      renderExploreContent(activeTab, query);
    }, 300);
  });

  // Initial render
  renderExploreContent('top', '');
};

// Render content for explore tabs with improved layout
const renderExploreContent = async (tab, query) => {
  const exploreContent = document.getElementById('explore-content');
  exploreContent.innerHTML = '<p class="loading-text">Loading...</p>';

  try {
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    // Extract unique tags from posts
    const uniqueTags = [...new Set(posts.map(post => post.tag).filter(tag => tag))];

    if (tab === 'top') {
      // Show a curated mix of users, posts, and tags
      const topUsers = users.filter(u => u.username !== username).slice(0, 3);
      const topPosts = posts.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5);
      const topTags = uniqueTags.slice(0, 5);

      exploreContent.innerHTML = `
        <div class="section">
          <h3 class="section-title">Suggested Users</h3>
        <div id="explore-users" class="users-grid"></div>
        </div>
        <div class="section">
          <h3 class="section-title">Popular Posts</h3>
          <div id="explore-posts" class="posts-grid"></div>
        </div>
        <div class="section">
          <h3 class="section-title">Trending Tags</h3>
          <div id="explore-tags" class="tags-grid"></div>
        </div>
      `;

      // Render users
      document.getElementById('explore-users').innerHTML = topUsers.length ?
        topUsers.map(user => `
          <div class="user-card" onclick="loadUserProfileInMiddle('${user.username}')">
            <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="user-avatar" />
            <div class="user-info">
              <h4>${user.username}</h4>
              <p>${user.bio || 'No bio'}</p>
            </div>
            ${generateFriendButton(user.username, friendData, username)}
          </div>`).join('') :
        '<p class="empty-text">No users found.</p>';

      // Render posts
      document.getElementById('explore-posts').innerHTML = topPosts.length ?
        topPosts.map(post => {
          const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
          const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
          return renderPost(post, user, friendData, username, postUserPhoto);
        }).join('') :
        '<p class="empty-text">No posts found.</p>';

      // Render tags
      document.getElementById('explore-tags').innerHTML = topTags.length ?
        topTags.map(tag => `
          <button class="tag-button" onclick="searchByTag('${tag}')">#${tag}</button>
        `).join('') :
        '<p class="empty-text">No tags found.</p>';
    } else if (tab === 'users') {
      const filteredUsers = query ? 
        users.filter(user => user.username.toLowerCase().includes(query) && user.username !== username) : 
        users.filter(user => user.username !== username).slice(0, 10);
      exploreContent.innerHTML = `
        <div class="section">
          <h3 class="section-title">Users</h3>
          <div class="users-grid" id="explore-users"></div>
        </div>`;
      document.getElementById('explore-users').innerHTML = filteredUsers.length ?
        filteredUsers.map(user => `
          <div class="user-card" onclick="loadUserProfileInMiddle('${user.username}')">
            <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="user-avatar" />
            <div class="user-info">
              <h4>${user.username}</h4>
              <p>${user.bio || 'No bio'}</p>
            </div>
            ${generateFriendButton(user.username, friendData, username)}
          </div>`).join('') :
        '<p class="empty-text">No users found.</p>';
    } else if (tab === 'posts') {
      const filteredPosts = query ?
        posts.filter(post => 
          post.caption.toLowerCase().includes(query) || 
          (post.tag && post.tag.toLowerCase().includes(query)) ||
          post.caption.toLowerCase().includes(`#${query}`)
        ).reverse() :
        posts.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 10);
      exploreContent.innerHTML = `
        <div class="section">
          <h3 class="section-title">Posts</h3>
          <div class="posts-grid" id="explore-posts"></div>
        </div>`;
      document.getElementById('explore-posts').innerHTML = filteredPosts.length ?
        filteredPosts.map(post => {
          const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
          const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
          return renderPost(post, user, friendData, username, postUserPhoto);
        }).join('') :
        '<p class="empty-text">No posts found.</p>';
    } else if (tab === 'tags') {
      const filteredTags = query ? 
        uniqueTags.filter(tag => tag.toLowerCase().includes(query)) : 
        uniqueTags.slice(0, 10);
      exploreContent.innerHTML = `
        <div class="section">
          <h3 class="section-title">Tags</h3>
          <div class="tags-grid" id="explore-tags"></div>
        </div>`;
      document.getElementById('explore-tags').innerHTML = filteredTags.length ?
        filteredTags.map(tag => `
          <button class="tag-button" onclick="searchByTag('${tag}')">#${tag}</button>
        `).join('') :
        '<p class="empty-text">No tags found.</p>';
    }
  } catch (error) {
    console.error('Error loading explore content:', error);
    exploreContent.innerHTML = '<p class="empty-text">Error loading explore content. Please try again later.</p>';
  }
};

// Search GraVitas (updated to handle hashtags and mentions)
const searchGraVitas = async query => {
  try {
    const feeds = document.getElementById('feeds');
    const external = document.getElementById('external-content');
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');

    if (!query) {
      feeds.style.display = 'block';
      external.style.display = 'none';
      external.innerHTML = '';
      loadPosts();
      return;
    }

    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    // Handle hashtag or mention search
    if (query.startsWith('#')) {
      await searchByHashtag(query.slice(1));
      return;
    } else if (query.startsWith('@')) {
      await searchByUser(query.slice(1));
      return;
    }

    const filteredPosts = posts.filter(post => 
      post.caption.toLowerCase().includes(query) || 
      (post.tag && post.tag.toLowerCase().includes(query))
    ).reverse();
    const filteredUsers = users.filter(user => user.username.toLowerCase().includes(query) && user.username !== username);

    feeds.style.display = 'none';
    external.style.display = 'block';
    external.innerHTML = `
      <div class="section">
        <h3 class="section-title">Search Results for "${query}"</h3>
        <h4 class="section-subtitle">Users</h4>
        <div id="search-users" class="users-grid"></div>
        <h4 class="section-subtitle">Posts</h4>
        <div id="search-posts" class="posts-grid"></div>
      </div>`;

    const usersDiv = document.getElementById('search-users');
    usersDiv.innerHTML = filteredUsers.length ?
      filteredUsers.map(user => `
        <div class="user-card" onclick="loadUserProfileInMiddle('${user.username}')">
          <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="user-avatar" />
          <div class="user-info">
            <h4>${user.username}</h4>
            <p>${user.bio || 'No bio'}</p>
          </div>
          ${generateFriendButton(user.username, friendData, username)}
        </div>`).join('') :
      '<p class="empty-text">No users found.</p>';

    const postsDiv = document.getElementById('search-posts');
    postsDiv.innerHTML = filteredPosts.length ?
      filteredPosts.map(post => {
        const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
        const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
        return renderPost(post, user, friendData, username, postUserPhoto);
      }).join('') :
      '<p class="empty-text">No posts found.</p>';
  } catch (error) {
    console.error('Error searching:', error);
    document.getElementById('external-content').innerHTML = '<p class="empty-text">Error loading search results. Please try again later.</p>';
  }
};

// Search posts by hashtag
const searchByHashtag = async hashtag => {
  try {
    const feeds = document.getElementById('feeds');
    const external = document.getElementById('external-content');
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');

    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    const filteredPosts = posts.filter(post => 
      post.caption.toLowerCase().includes(`#${hashtag.toLowerCase()}`) || 
      (post.tag && post.tag.toLowerCase() === hashtag.toLowerCase())
    ).reverse();

    feeds.style.display = 'none';
    external.style.display = 'block';
    external.innerHTML = `
      <div class="section">
        <h3 class="section-title">Posts with #${hashtag}</h3>
        <div id="search-posts" class="posts-grid"></div>
      </div>`;

    const postsDiv = document.getElementById('search-posts');
    postsDiv.innerHTML = filteredPosts.length ?
      filteredPosts.map(post => {
        const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
        const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
        return renderPost(post, user, friendData, username, postUserPhoto);
      }).join('') :
      '<p class="empty-text">No posts found with this hashtag.</p>';
  } catch (error) {
    console.error('Error searching hashtag:', error);
    document.getElementById('external-content').innerHTML = '<p class="empty-text">Error loading hashtag results. Please try again later.</p>';
  }
};

// Search posts by user (mention)
const searchByUser = async targetUsername => {
  try {
    const feeds = document.getElementById('feeds');
    const external = document.getElementById('external-content');
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');

    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (!user) {
      external.innerHTML = '<p class="empty-text">User not found.</p>';
      feeds.style.display = 'none';
      external.style.display = 'block';
      return;
    }

    const filteredPosts = posts.filter(post => post.username.toLowerCase() === targetUsername.toLowerCase()).reverse();
    external.innerHTML = `
      <div class="section">
        <button class="btn btn-outline-primary btn-sm back-button" onclick="loadContent('home', document.querySelector('.nav-item.active'))">Back to Home</button>
        <div class="user-profile-card">
          <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="user-avatar" />
          <div class="user-info">
            <h4>${user.username}</h4>
            <p>${user.userEmail}</p>
          </div>
          ${generateFriendButton(user.username, friendData, username)}
        </div>
        <h3 class="section-title">Posts by ${user.username}</h3>
        <div id="search-posts" class="posts-grid"></div>
      </div>`;

    const postsDiv = document.getElementById('search-posts');
    postsDiv.innerHTML = filteredPosts.length ?
      filteredPosts.map(post => {
        const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
        return renderPost(post, user, friendData, username, postUserPhoto);
      }).join('') :
      `<p class="empty-text">${user.username} hasn't posted anything yet.</p>`;

    feeds.style.display = 'none';
    external.style.display = 'block';
  } catch (error) {
    console.error('Error searching user:', error);
    document.getElementById('external-content').innerHTML = '<p class="empty-text">Error loading user posts. Please try again later.</p>';
  }
};

// Search posts by tag
const searchByTag = async tag => {
  try {
    const feeds = document.getElementById('feeds');
    const external = document.getElementById('external-content');
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');

    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    const filteredPosts = posts.filter(post => post.tag && post.tag.toLowerCase() === tag.toLowerCase()).reverse();

    feeds.style.display = 'none';
    external.style.display = 'block';
    external.innerHTML = `
      <div class="section">
        <h3 class="section-title">Posts tagged "${tag}"</h3>
        <div id="search-posts" class="posts-grid"></div>
      </div>`;

    const postsDiv = document.getElementById('search-posts');
    postsDiv.innerHTML = filteredPosts.length ?
      filteredPosts.map(post => {
        const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
        const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
        return renderPost(post, user, friendData, username, postUserPhoto);
      }).join('') :
      '<p class="empty-text">No posts found with this tag.</p>';
  } catch (error) {
    console.error('Error searching tag:', error);
    document.getElementById('external-content').innerHTML = '<p class="empty-text">Error loading tag results. Please try again later.</p>';
  }
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  document.getElementById('mobile-menu').classList.toggle('active');
};

// Toggle middle section search bar
const toggleMiddleSearch = () => {
  const searchContainer = document.querySelector('.middle-search-container');
  searchContainer.style.display = searchContainer.style.display === 'block' ? 'none' : 'block';
  if (searchContainer.style.display === 'block') document.querySelector('.middle-search').focus();
};

// Modified window.onload to initialize notification count
window.onload = () => {
  const defaultNav = document.querySelector('.nav-item.active') || document.querySelector('.nav-item');
  loadContent('home', defaultNav);
  const username = localStorage.getItem('username');
  const userPhoto = localStorage.getItem('userPhoto');
  if (username) {
    document.getElementById('username-text').textContent = username;
    document.getElementById('profile-img').src = userPhoto || '/default-profile.jpg';
    // Initialize notification count
    loadNotificationsForDropdown();
  } else {
    window.location.href = 'index.html';
  }
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('post');
  const profileUsername = urlParams.get('profile');
  if (postId) {
    loadPostInMiddle(parseInt(postId));
    window.history.replaceState({}, document.title, window.location.pathname);
  } else if (profileUsername) {
    loadUserProfileInMiddle(profileUsername);
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};
// Toggle custom tag input
const toggleCustomTagInput = () => {
  const tagSelect = document.getElementById('tag-select');
  const customTagInput = document.getElementById('custom-tag');
  customTagInput.classList.toggle('active', tagSelect.value === 'custom');
  tagSelect.value === 'custom' ? customTagInput.focus() : customTagInput.value = '';
};

// Switch tabs
const switchTab = (tabId, element) => {
  document.querySelectorAll('.tab, .tab-content').forEach(el => el.classList.remove('active'));
  element.classList.add('active');
  document.getElementById(tabId).classList.add('active');
};

// Generate friend button
const generateFriendButton = (targetUsername, friendData, currentUsername) => {
  if (targetUsername === currentUsername) return '';
  const isFriend = friendData.friends.includes(targetUsername);
  const hasPendingRequest = friendData.requests.some(r =>
    (r.from === currentUsername && r.to === targetUsername) ||
    (r.from === targetUsername && r.to === currentUsername)
  );
  return isFriend ? `<button class="action-button friend-button friend" aria-label="Friend"><i class="bi bi-person-check"></i></button>` :
         hasPendingRequest ? `<button class="action-button friend-button pending" aria-label="Request Pending"><i class="bi bi-hourglass-split"></i></button>` :
         `<button class="action-button friend-button" onclick="sendFriendRequest('${targetUsername}'); event.stopPropagation();" aria-label="Send friend request"><i class="bi bi-person-plus"></i></button>`;
};

//more overlay
const openMoreOverlay = () => {
  const overlay = document.createElement('div');
  overlay.className = 'more-overlay';
  overlay.innerHTML = `
    <div class="more-modal">
      <div class="more-modal-content">
        <button class="more-option-btn" onclick="window.location.href='about.html'"><i class="bi bi-info-circle"></i> About</button>
        <button class="more-option-btn" onclick="window.location.href='entrepreneurship.html'"><i class="bi bi-briefcase"></i> Entrepreneurship</button>
        <button class="more-option-btn" onclick="window.location.href='event.html'"><i class="bi bi-calendar-event"></i> Event</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => e.target === overlay && overlay.remove());
};

//load following people and their post
const loadPeople = async () => {
 try {
 const [users, posts, friendData] = await Promise.all([
 fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
 fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
 fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
 ]);
 const external = document.getElementById('external-content');
 const currentUsername = localStorage.getItem('username');
 const userPhoto = localStorage.getItem('userPhoto');
 const followedUsers = users.filter(user => friendData.following.includes(user.username) && user.username !== currentUsername);
 const followedPosts = posts.filter(post => friendData.following.includes(post.username)).reverse();

 external.innerHTML = `
 <div class="friend-tabs">
 <div class="friend-tab active" data-tab="people">People</div>
 <div class="friend-tab" data-tab="posts">Posts</div>
 </div>
 <div id="people-content" class="people-content"></div>`;

 const peopleContent = document.getElementById('people-content');

 const renderPeopleContent = (tab) => {
 if (tab === 'people') {
 peopleContent.innerHTML = followedUsers.length ? 
 followedUsers.map(user => `
 <div class="user-card" onclick="loadUserProfileInMiddle('${user.username}')">
 <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="user-avatar" />
 <div class="user-info">
 <h4>${user.username}</h4>
 <p>${user.bio || 'No bio'}</p>
 </div>
 ${generateFriendButton(user.username, friendData, currentUsername)}
 </div>`).join('') :
 '<p class="empty-text">You don\'t follow anyone yet.</p>';
 } else if (tab === 'posts') {
 peopleContent.innerHTML = followedPosts.length ? 
 followedPosts.map(post => {
 const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
 const postUserPhoto = post.username === currentUsername ? userPhoto : user.photoURL || '/default-profile.jpg';
 return renderPost(post, user, friendData, currentUsername, postUserPhoto);
 }).join('') :
 '<p class="empty-text">No posts from people you follow.</p>';
 }
 };

 // Initial render
 renderPeopleContent('people');

 // Add tab event listeners
 document.querySelectorAll('.friend-tab').forEach(tab => {
 tab.addEventListener('click', () => {
 document.querySelectorAll('.friend-tab').forEach(t => t.classList.remove('active'));
 tab.classList.add('active');
 renderPeopleContent(tab.getAttribute('data-tab'));
 });
 });
 } catch (error) {
 console.error('Error loading people content:', error);
 document.getElementById('external-content').innerHTML = '<p>Error loading content. Please try again later.</p>';
 }
};
//interest
const loadLikedPosts = async () => {
  try {
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');
    const likedPosts = posts.filter(post => post.likedBy?.includes(username)).reverse();
    const bookmarkedPosts = posts.filter(post => post.bookmarkedBy?.includes(username)).reverse();
    const external = document.getElementById('external-content');
    external.innerHTML = `
      <div class="friend-tabs">
        <div class="friend-tab active" data-tab="liked">Liked Posts</div>
        <div class="friend-tab" data-tab="bookmarked">Bookmarked Posts</div>
      </div>
      <div id="liked-content"></div>`;
    const likedContent = document.getElementById('liked-content');

    const renderPosts = (category) => {
      const postsToShow = category === 'liked' ? likedPosts : bookmarkedPosts;
      likedContent.innerHTML = postsToShow.length ? 
        postsToShow.map(post => {
          const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
          const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
          return renderPost(post, user, friendData, username, postUserPhoto);
        }).join('') : 
        `<p style="font-size: 14px; color: #657786;">${category === 'liked' ? 'You haven\'t liked any posts yet.' : 'You haven\'t bookmarked any posts yet.'}</p>`;
    };

    renderPosts('liked');
    document.querySelectorAll('.friend-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.friend-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderPosts(tab.getAttribute('data-tab'));
      });
    });
  } catch (error) {
    console.error('Error loading liked/bookmarked posts:', error);
    document.getElementById('external-content').innerHTML = '<p>Error loading posts. Please try again later.</p>';
  }
};
const loadBookmarkedPosts = async () => {
  try {
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');
    const bookmarkedPosts = posts.filter(post => post.bookmarkedBy?.includes(username)).reverse();
    const external = document.getElementById('external-content');
    external.innerHTML = `<h5 style="font-size: 16px; font-weight: 700; color: #14171a; margin-bottom: 12px;">Bookmarked Posts</h5>`;

    if (!bookmarkedPosts.length) {
      external.innerHTML += '<p style="font-size: 14px; color: #657786;">You haven\'t bookmarked any posts yet.</p>';
      return;
    }

    external.innerHTML += bookmarkedPosts.map(post => {
      const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
      const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
      return renderPost(post, user, friendData, username, postUserPhoto);
    }).join('');
  } catch (error) {
    console.error('Error loading bookmarked posts:', error);
    document.getElementById('external-content').innerHTML = '<p>Error loading bookmarked posts. Please try again later.</p>';
  }
};

const loadProfilePosts = async () => {
  const username = localStorage.getItem('username');
  loadUserProfileInMiddle(username);
};

const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Link copied to clipboard!');
  } catch (error) {
    console.warn('Clipboard API failed:', error);
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Link copied to clipboard!');
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      alert('Failed to copy link. Please copy it manually.');
    }
  }
};

const sharePost = async postId => {
  try {
    const shareUrl = `${window.location.origin}/home.html?post=${postId}`;
    const username = localStorage.getItem('username');
    const users = await fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users'));

    // Construct share URLs for each platform
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this post!')}`;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    const redditShareUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent('Check out this post!')}`;
    const mastodonShareUrl = `https://toot.kytta.app/?text=${encodeURIComponent('Check out this post! ' + shareUrl)}`;
    const instagramShareUrl = `https://www.instagram.com`; // Instagram doesn't support direct URL sharing
    const tiktokShareUrl = `https://www.tiktok.com`; // TikTok doesn't support direct URL sharing
    const youtubeShareUrl = `https://www.youtube.com`; // YouTube doesn't have a direct share API

    // Construct embed code
    const embedCode = `<iframe src="${shareUrl}" width="500" height="300" frameborder="0" allowfullscreen></iframe>`;

    const overlay = document.createElement('div');
    overlay.className = 'share-overlay';
    overlay.innerHTML = `
      <div class="share-modal" style="background: #fff; border-radius: 8px; padding: 20px; max-width: 600px; width: 90%; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        <div class="share-modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h5 class="share-modal-title" style="font-size: 18px; font-weight: 600; color: #333;">Share Post</h5>
          <button class="share-modal-close" aria-label="Close share modal" style="background: none; border: none; font-size: 24px; cursor: pointer;">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="share-link-container" style="display: flex; gap: 8px; margin-bottom: 20px;">
          <input type="text" class="share-link-input" value="${shareUrl}" readonly aria-label="Post share link" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
          <button class="share-link-copy" aria-label="Copy share link" style="padding: 8px 16px; background: #1DA1F2; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Copy Link</button>
        </div>
        <div class="embed-code-container" style="display: none; margin-bottom: 20px;">
          <textarea class="embed-code-input" readonly aria-label="Embed code" style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; resize: none;">${embedCode}</textarea>
          <button class="embed-code-copy" aria-label="Copy embed code" style="margin-top: 8px; padding: 8px 16px; background: #1DA1F2; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">Copy Embed Code</button>
        </div>
        <h6 style="font-size: 14px; font-weight: 500; color: #5a6b76; margin: 12px 0;">Share to Social Media or Embed</h6>
        <div class="social-share-list" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; justify-items: center; padding: 12px 0;">
          <a href="${twitterShareUrl}" target="_blank" class="social-share-icon social-share-twitter" style="display: flex; flex-direction: column; align-items: center; text-decoration: none;" aria-label="Share on Twitter">
            <i class="bi bi-twitter" style="font-size: 28px; color: #1DA1F2;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">Twitter</span>
          </a>
          <a href="${facebookShareUrl}" target="_blank" class="social-share-icon social-share-facebook" style="display: flex; flex-direction: column; align-items: center; text-decoration: none;" aria-label="Share on Facebook">
            <i class="bi bi-facebook" style="font-size: 28px; color: #3B5998;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">Facebook</span>
          </a>
          <a href="${redditShareUrl}" target="_blank" class="social-share-icon social-share-reddit" style="display: flex; flex-direction: column; align-items: center; text-decoration: none;" aria-label="Share on Reddit">
            <i class="bi bi-reddit" style="font-size: 28px; color: #FF4500;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">Reddit</span>
          </a>
          <a href="${mastodonShareUrl}" target="_blank" class="social-share-icon social-share-mastodon" style="display: flex; flex-direction: column; align-items: center; text-decoration: none;" aria-label="Share on Mastodon">
            <i class="bi bi-mastodon" style="font-size: 28px; color: #6364FF;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">Mastodon</span>
          </a>
          <a href="${instagramShareUrl}" target="_blank" class="social-share-icon social-share-instagram" style="display: flex; flex-direction: column; align-items: center; text-decoration: none;" aria-label="Share on Instagram">
            <i class="bi bi-instagram" style="font-size: 28px; color: #E1306C;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">Instagram</span>
          </a>
          <a href="${tiktokShareUrl}" target="_blank" class="social-share-icon social-share-tiktok" style="display: flex; flex-direction: column; align-items-form: center; text-decoration: none;" aria-label="Share on TikTok">
            <i class="bi bi-tiktok" style="font-size: 28px; color: #000000;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">TikTok</span>
          </a>
          <a href="${youtubeShareUrl}" target="_blank" class="social-share-icon social-share-youtube" style="display: flex; flex-direction: column; align-items: center; text-decoration: none;" aria-label="Share on YouTube">
            <i class="bi bi-youtube" style="font-size: 28px; color: #FF0000;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">YouTube</span>
          </a>
          <button class="social-share-icon embed-code-toggle" style="display: flex; flex-direction: column; align-items: center; text-decoration: none; background: none; border: none; cursor: pointer;" aria-label="Show embed code">
            <i class="bi bi-code-slash" style="font-size: 28px; color: #6B7280;"></i>
            <span style="font-size: 12px; color: #6B7280; margin-top: 6px; font-weight: 400;">Embed Code</span>
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // Event listeners for modal interactions
    overlay.addEventListener('click', e => (e.target === overlay || e.target.closest('.share-modal-close')) && overlay.remove());
    
    // Copy link event listener
    overlay.querySelector('.share-link-copy').addEventListener('click', async () => {
      await copyToClipboard(shareUrl);
      // Increment share count when the link is copied
      const copyShareRes = await fetch(`/posts/${postId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const copyShareData = await copyShareRes.json();
      if (copyShareRes.ok) {
        const shareCountSpan = document.getElementById(`share-count-${postId}`);
        if (shareCountSpan) {
          shareCountSpan.textContent = copyShareData.shareCount || parseInt(shareCountSpan.textContent) + 1;
        }
        // Refresh the post in middle container if being viewed
        if (document.getElementById('external-content').style.display === 'block' && document.querySelector(`#post-${postId}`)) {
          loadPostInMiddle(postId);
        }
      }
    });

    // Embed code event listener (no share count increment)
    const embedContainer = overlay.querySelector('.embed-code-container');
    const embedCopyButton = overlay.querySelector('.embed-code-copy');
    const embedToggle = overlay.querySelector('.embed-code-toggle');
    embedToggle.addEventListener('click', () => {
      embedContainer.style.display = embedContainer.style.display === 'none' ? 'block' : 'none';
    });
    embedCopyButton.addEventListener('click', () => copyToClipboard(embedCode));

    // Social media share event listeners
    const socialShareLinks = overlay.querySelectorAll('.social-share-icon:not(.social-share-instagram):not(.social-share-tiktok):not(.social-share-youtube)');
    socialShareLinks.forEach(link => {
      link.addEventListener('click', async () => {
        // Increment share count when a social media link is clicked
        const socialShareRes = await fetch(`/posts/${postId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        const socialShareData = await socialShareRes.json();
        if (socialShareRes.ok) {
          const shareCountSpan = document.getElementById(`share-count-${postId}`);
          if (shareCountSpan) {
            shareCountSpan.textContent = socialShareData.shareCount || parseInt(shareCountSpan.textContent) + 1;
          }
          // Refresh the post in middle container if being viewed
          if (document.getElementById('external-content').style.display === 'block' && document.querySelector(`#post-${postId}`)) {
            loadPostInMiddle(postId);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error opening share modal:', error);
    alert('Failed to load share options. Please try again.');
  }
};

const loadFriends = async () => {
  try {
    const username = localStorage.getItem('username');
    const data = await fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'));
    const external = document.getElementById('external-content');
    external.innerHTML = `
      <div class="friend-tabs">
        <div class="friend-tab active" data-tab="friends">Friends</div>
        <div class="friend-tab" data-tab="suggested">Suggested</div>
      </div>
      <div id="friend-content"></div>`;
    const friendContent = document.getElementById('friend-content');

    const renderFriends = category => {
      friendContent.innerHTML = '';
      if (category === 'friends') {
        if (data.requests.length) {
          friendContent.innerHTML += '<h6 style="font-size: 14px; font-weight: 500; color: #5a6b76; margin: 12px 0;">Friend Requests</h6>' +
            data.requests.map(request => {
              const user = data.users.find(u => u.username === request.from);
              return `
                <div class="friend-item">
                  <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" />
                  <div class="friend-info"><h6>${user.username}</h6></div>
                  <button class="accept" onclick="acceptFriendRequest('${request.from}')">Accept</button>
                </div>`;
            }).join('');
        }
        friendContent.innerHTML += data.friends.length ? '<h6 style="font-size: 14px; font-weight: 500; color: #5a6b76; margin: 12px 0;">Your Friends</h6>' +
          data.friends.map(friend => {
            const user = data.users.find(u => u.username === friend);
            return `
              <div class="friend-item">
                <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" />
                <div class="friend-info"><h6>${user.username}</h6></div>
              </div>`;
          }).join('') : '<p style="font-size: 14px; color: #657786;">You have no friends yet.</p>';
      } else {
        const suggestedUsers = data.users.filter(u => u.username !== username && !data.friends.includes(u.username) && !data.requests.some(r => r.from === u.username || r.to === u.username));
        friendContent.innerHTML = suggestedUsers.length ? '<h6 style="font-size: 14px; font-weight: 500; color: #5a6b76; margin: 12px 0;">Suggested Friends</h6>' +
          suggestedUsers.map(user => `
            <div class="friend-item">
              <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" />
              <div class="friend-info"><h6>${user.username}</h6></div>
              <button onclick="sendFriendRequest('${user.username}')">Add Friend</button>
            </div>`).join('') : '<p style="font-size: 14px; color: #657786;">No suggested friends at this time.</p>';
      }
    };

    renderFriends('friends');
    document.querySelectorAll('.friend-tab').forEach(tab => tab.addEventListener('click', () => {
      document.querySelectorAll('.friend-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderFriends(tab.getAttribute('data-tab'));
    }));
  } catch (error) {
    console.error('Error loading friends:', error);
    document.getElementById('external-content').innerHTML = '<p>Error loading friends. Please try again later.</p>';
  }
};

const sendFriendRequest = async toUsername => {
  try {
    const username = localStorage.getItem('username');
    const res = await fetch('/friend-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: username, to: toUsername })
    });
    if (!res.ok) throw new Error('Failed to send friend request');
    const activeNav = document.querySelector('.nav-item.active');
    loadContent(activeNav.getAttribute('onclick').match(/'([^']+)'/)[1], activeNav);
  } catch (error) {
    console.error('Error sending friend request:', error);
    alert('Friend request already sent');
  }
};

const acceptFriendRequest = async fromUsername => {
  try {
    const username = localStorage.getItem('username');
    const res = await fetch('/friend-request/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromUsername, to: username })
    });
    if (!res.ok) throw new Error('Failed to accept friend request');
    loadFriends();
  } catch (error) {
    console.error('Error accepting friend request:', error);
    alert('Failed to accept friend request. Please try again.');
  }
};


document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('edit-profile-overlay').addEventListener('click', closeEditProfileModal);
  document.querySelector('.edit-profile-modal-close')?.addEventListener('click', closeEditProfileModal);
  document.getElementById('comment-overlay').addEventListener('click', closeCommentModal);
  document.querySelector('.comment-modal-close')?.addEventListener('click', closeCommentModal);
  document.getElementById('post-overlay').addEventListener('click', closeTweetModal);
  document.getElementById('tag-select').addEventListener('change', toggleCustomTagInput);

  const mediaUpload = document.getElementById('media-upload');
  const imagePreview = document.getElementById('image-preview');

  mediaUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.style.display = 'none';
    }
  });

  const middleSearchInput = document.querySelector('.middle-search');
  if (middleSearchInput) {
    middleSearchInput.addEventListener('input', e => searchGraVitas(e.target.value.trim().toLowerCase()));
  }
});
const loadPosts = async () => {
  try {
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);
    const postsDiv = document.getElementById('posts');
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');
    postsDiv.innerHTML = posts.reverse().map(post => {
      const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
      const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';
      return renderPost(post, user, { ...friendData, posts, users }, username, postUserPhoto);
    }).join('');
  } catch (error) {
    console.error('Error loading posts:', error);
    document.getElementById('posts').innerHTML = '<p>Error loading posts. Please try again later.</p>';
  }
}; 
const openEditProfileModal = () => {
  const username = localStorage.getItem('username');
  const bioInput = document.getElementById('bio-input');
  const bannerPreview = document.getElementById('banner-preview');
  const bannerUpload = document.getElementById('banner-upload');
  const removeBannerBtn = document.getElementById('remove-banner-btn');

  fetch(`/users?username=${encodeURIComponent(username)}`)
    .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch user'))
    .then(user => {
      bioInput.value = user.bio || '';
      document.getElementById('jobs-input').value = user.jobs || '';
      document.getElementById('education-input').value = user.education || '';
      document.getElementById('dob-input').value = user.dateOfBirth || '';
      document.getElementById('hobbies-input').value = user.hobbies || '';
      bannerPreview.src = user.bannerURL || '';
      bannerPreview.style.display = user.bannerURL ? 'block' : 'none';
      removeBannerBtn.style.display = user.bannerURL ? 'flex' : 'none';
    })
    .catch(error => {
      console.error('Error fetching user data:', error);
      alert('Failed to load profile data. Please try again.');
    });

  bannerUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        bannerPreview.src = event.target.result;
        bannerPreview.style.display = 'block';
        removeBannerBtn.style.display = 'flex';
      };
      reader.readAsDataURL(file);
    } else {
      bannerPreview.style.display = 'none';
      removeBannerBtn.style.display = 'none';
    }
  });

  removeBannerBtn.addEventListener('click', () => {
    bannerPreview.src = '';
    bannerPreview.style.display = 'none';
    removeBannerBtn.style.display = 'none';
    bannerUpload.value = '';
  });

  document.getElementById('edit-profile-overlay').className = 'edit-profile-overlay active';
  bioInput.focus();
};

const closeEditProfileModal = event => {
  if (event.target === document.getElementById('edit-profile-overlay') || event.target.classList.contains('edit-profile-modal-close')) {
    document.getElementById('edit-profile-overlay').className = 'edit-profile-overlay';
    document.getElementById('editProfileForm').reset();
    document.getElementById('banner-preview').style.display = 'none';
  }
};

const removeBanner = async username => {
  if (!confirm('Are you sure you want to remove your profile banner?')) return;
  try {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('authUsername', username);
    formData.append('removeBanner', true);
    const res = await fetch('/users/update', { method: 'POST', body: formData });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to remove banner');
    localStorage.removeItem('userBanner');
    loadUserProfileInMiddle(username);
    alert('Banner removed successfully!');
  } catch (error) {
    console.error('Error removing banner:', error);
    alert(`Failed to remove banner: ${error.message}`);
  }
};

document.getElementById('editProfileForm').addEventListener('submit', async e => {
  e.preventDefault();
  const bio = document.getElementById('bio-input').value.trim();
  const jobs = document.getElementById('jobs-input').value.trim();
  const education = document.getElementById('education-input').value.trim();
  const dateOfBirth = document.getElementById('dob-input').value;
  const hobbies = document.getElementById('hobbies-input').value.trim();
  const bannerFile = document.getElementById('banner-upload').files[0];
  const bannerPreview = document.getElementById('banner-preview');
  const removeBanner = bannerPreview.style.display === 'none' && !bannerFile;
  const username = localStorage.getItem('username');

  const formData = new FormData();
  formData.append('username', username);
  formData.append('authUsername', username);
  formData.append('bio', bio);
  formData.append('jobs', jobs);
  formData.append('education', education);
  formData.append('dateOfBirth', dateOfBirth);
  formData.append('hobbies', hobbies);
  if (bannerFile) formData.append('banner', bannerFile);
  if (removeBanner) formData.append('removeBanner', true);

  try {
    const res = await fetch('/users/update', { method: 'POST', body: formData });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to update profile');
    const { user } = await res.json();
    localStorage.setItem('userBio', bio);
    localStorage.setItem('userJobs', jobs);
    localStorage.setItem('userEducation', education);
    localStorage.setItem('userDateOfBirth', dateOfBirth);
    localStorage.setItem('userHobbies', hobbies);
    if (bannerFile) {
      const reader = new FileReader();
      reader.onload = event => localStorage.setItem('userBanner', event.target.result);
      reader.readAsDataURL(bannerFile);
    } else if (removeBanner) {
      localStorage.removeItem('userBanner');
    }
    closeEditProfileModal({ target: document.getElementById('edit-profile-overlay') });
    loadUserProfileInMiddle(username);
    alert('Profile updated successfully!');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert(`Failed to update profile: ${error.message}`);
  }
});

//user's profile in the middle
const loadUserProfileInMiddle = async username => {
  try {
    if (!username) throw new Error('No username');
    const currentUsername = localStorage.getItem('username');
    if (!currentUsername) {
      window.location.href = 'index.html';
      return;
    }

    // Fetch user data, posts, and friend data for the profile user (username)
    const [userResponse, posts, profileFriendData, currentUserFriendData] = await Promise.all([
      fetch(`/users?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('User fetch failed')),
      fetch('/posts').then(res => res.ok ? res.json() : []).catch(err => (console.warn('Posts fetch failed:', err), [])),
      // Fetch friend data for the profile user to get their followers/following counts
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : { followers: [], following: [], friends: [], requests: [] }).catch(err => (console.warn('Profile friends fetch failed:', err), { followers: [], following: [], friends: [], requests: [] })),
      // Fetch friend data for the current user to determine if they follow the profile user
      fetch(`/friends?username=${encodeURIComponent(currentUsername)}`).then(res => res.ok ? res.json() : { followers: [], following: [], friends: [], requests: [] }).catch(err => (console.warn('Current user friends fetch failed:', err), { followers: [], following: [], friends: [], requests: [] }))
    ]);

    if (!userResponse?.username) throw new Error('User not found');
    const user = userResponse;
    // Include both original posts and reposts by the user
    const userPosts = posts.filter(post => post.username === username || (post.isRepost && post.repostedBy?.includes(username))).reverse();
    const isOwnProfile = currentUsername === username;
    const isFollowing = currentUserFriendData.following?.includes(username);
    const userPhoto = localStorage.getItem('userPhoto') || '/default-profile.jpg';

    const feeds = document.getElementById('feeds');
    const external = document.getElementById('external-content');
    if (!feeds || !external) throw new Error('DOM elements missing');
    feeds.style.display = 'none';
    external.style.display = 'block';
    external.innerHTML = `
      <button class="btn btn-back" onclick="loadContent('home', document.querySelector('.nav-item.active'))">Back to Home</button>
      <div class="user-profile-section">
        <img src="${user.bannerURL || 'https://cdn.glitch.global/64ed69b7-ed08-43ba-8cbe-8fe8061b9ff8/bannerdesigndefult.png?v=1747827002777'}" alt="Banner" class="profile-banner" onclick="showImageOverlay(this.src)" style="cursor: pointer;" onerror="this.src='https://cdn.glitch.global/64ed69b7-ed08-43ba-8cbe-8fe8061b9ff8/bannerdefult.png?v=1747826171999'" />
        <div class="profile-info-container">
          <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" class="profile-picture" onclick="showImageOverlay(this.src)" style="cursor: pointer;" />
          <h5 class="username">${user.username}</h5>
          ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}
          <div class="profile-details">
            ${user.bio ? `<p><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>${user.bio}</p>` : ''}
            ${user.jobs ? `<p><svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 0h-4V4h4v2z"/></svg>${user.jobs}</p>` : ''}
            ${user.education ? `<p><svg viewBox="0 0 24 24"><path d="M5 13.18v4.82l7-3.06 7 3.06v-4.82l-7-3.18-7 3.18zm7-9.18l-8 3.64v2.73l8-3.64 8 3.64v-2.73l-8-3.64z"/></svg>${user.education}</p>` : ''}
            ${user.dateOfBirth ? `<p><svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>${user.dateOfBirth}</p>` : ''}
            ${user.hobbies ? `<p><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-2-6h4v4h-4z"/></svg>${user.hobbies}</p>` : ''}
          </div>
          <div class="profile-stats">
            <span><strong>${userPosts.length}</strong> Posts</span>
            <span><strong>${userPosts.reduce((sum, post) => sum + (post.likes || 0), 0)}</strong> Likes</span>
            <span><button class="follow-count-button" onclick="openFollowOverlay('${username}', 'following')"><strong>${profileFriendData.following?.length || 0}</strong> Following</button></span>
            <span><button class="follow-count-button" onclick="openFollowOverlay('${username}', 'followers')"><strong>${profileFriendData.followers?.length || 0}</strong> Followers</button></span>
          </div>
          <div class="profile-actions">
            ${isOwnProfile ? `
              <button class="btn btn-edit" onclick="openEditProfileModal()">Edit Profile</button>
              ${user.bannerURL ? `<button class="btn btn-remove-banner" onclick="removeBanner('${username}')">Remove Banner</button>` : ''}` : `
              <button class="btn ${isFollowing ? 'btn-unfollow' : 'btn-follow'}" onclick="${isFollowing ? `unfollowUser('${username}')` : `followUser('${username}')`}">${isFollowing ? 'Unfollow' : 'Follow'}</button>`}
            ${generateFriendButton(user.username, currentUserFriendData, currentUsername)}
          </div>
        </div>
      </div>
      <h6 class="posts-header">Posts by ${user.username}</h6>
      <div id="user-posts">${userPosts.length ? userPosts.map(post => renderPost(post, user, currentUserFriendData, currentUsername, post.username === currentUsername ? userPhoto : user.photoURL || '/default-profile.jpg')).join('') : `<p class="no-posts">${user.username} hasn't posted anything yet.</p>`}</div>`;

    window.showImageOverlay = imageSrc => {
      const overlay = document.createElement('div');
      overlay.className = 'image-overlay';
      overlay.innerHTML = `<button class="close-btn" onclick="this.parentElement.remove()">✕</button><img src="${imageSrc}" alt="Full-screen image" />`;
      document.body.appendChild(overlay);
    };

    if (new URLSearchParams(window.location.search).get('profile') === username) window.history.replaceState({}, document.title, window.location.pathname);
  } catch (error) {
    console.error('Error loading profile:', error);
    const external = document.getElementById('external-content');
    if (external) {
      external.style.display = 'block';
      document.getElementById('feeds').style.display = 'none';
      external.innerHTML = `<p class="no-user">User not found or error loading profile.</p>`;
    }
  }
};
const openFollowOverlay = async (username, type) => {
  try {
    const [users, friendData] = await Promise.all([
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Users fetch failed')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Friends fetch failed'))
    ]);

    const currentUsername = localStorage.getItem('username');
    const list = type === 'following' ? friendData.following || [] : friendData.followers || [];
    const overlay = document.createElement('div');
    overlay.className = 'follow-overlay';
    overlay.innerHTML = `
      <div class="follow-modal">
        <div class="follow-modal-header">
          <h5>${type === 'following' ? 'Following' : 'Followers'}</h5>
          <button class="follow-modal-close" aria-label="Close"><i class="bi bi-x"></i></button>
        </div>
        <div class="follow-list">
          ${list.length ? list.map(followUsername => {
            const user = users.find(u => u.username === followUsername) || { username: followUsername, photoURL: '/default-profile.jpg' };
            return `<div class="follow-item" onclick="loadUserProfileInMiddle('${user.username}'); event.stopPropagation();">
              <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" /><h6>${user.username}</h6>
              ${generateFriendButton(user.username, friendData, currentUsername)}
            </div>`;
          }).join('') : `<p class="follow-item-empty">No ${type} yet.</p>`}
        </div>
      </div>`;

    document.body.appendChild(overlay);
    // Ensure the close button works by attaching the event listener directly
    const closeButton = overlay.querySelector('.follow-modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => overlay.remove());
    }
    // Close overlay when clicking outside the modal
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });
  } catch (error) {
    console.error(`Error loading ${type} overlay:`, error);
    alert(`Failed to load ${type}.`);
  }
};

const followUser = async username => {
  try {
    const response = await fetch('/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower: localStorage.getItem('username'), followed: username })
    });
    if (!response.ok) throw new Error('Follow failed');
    loadUserProfileInMiddle(username);
  } catch (error) {
    console.error('Error following:', error);
    alert('Failed to follow user.');
  }
};

const unfollowUser = async username => {
  try {
    const response = await fetch('/unfollow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower: localStorage.getItem('username'), followed: username })
    });
    if (!response.ok) throw new Error('Unfollow failed');
    loadUserProfileInMiddle(username);
  } catch (error) {
    console.error('Error unfollowing:', error);
    alert('Failed to unfollow user.');
  }
};
// Existing verified users and official users (unchanged)
const userIcon = {
  'Sonam Rigsel': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
  'Phuentshok': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
  'Arun Kapur': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline不支持:1px;">Arun Kapur</i>',
  'Ngawang': '<i class="bi bi-patchPersona lize"></i>',
  'Phuntshok Namgyel Dhendrup': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
  'Dino': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
  'Phuentx': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
  'Gravitas': '<i class="bi bi-emoji-laughing-fill" style="background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
  'Sonam Penjo Dorji': '<i class="bi bi-disc" style="color: #1da1f2; font-size: 1rem;"></i>',
  'Ngawang Tshogyal Phuentshok': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
  'Riggzin Jigme Jatsho': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
};

const officialUsers = ['Newton', 'Gravitas', 'For Youth'];

// Track current post ID, sort modes, and reply state
let currentSortMode = 'newest';
let replyingToCommentId = null;
let currentRelateSortMode = 'newest';

// Modified renderPost to include Relate button
function renderPost(post, user, friendData, currentUsername, postUserPhoto, isModal = false) {
  const words = post.caption.split(/\s+/).filter(Boolean);
  const isLongCaption = words.length > 50;
  const truncatedCaption = isLongCaption ? words.slice(0, 50).join(' ') + '...' : post.caption;
  const prefix = isModal ? 'modal-post' : 'post';
  const rainbowWords = ['gay', 'lgbtq', 'lgbt', 'queer', 'pride', 'trans', 'bi', 'lesbian', 'bisexual', 'transgender'];

  const applyRainbowColors = text => {
    const wangchuckNames = ['Jigme Khesar Namgyel Wangchuck', 'Jigme Namgyel', 'Ugyen Wangchuck', 'Jigme Singye Wangchuck', 'Arun Kapur', 'Jigme Dorji Wangchuk'];
    return rainbowWords.reduce((str, word) => 
      str.replace(new RegExp(`\\b${word}\\b`, 'gi'), `<span class="rainbow-text">${word}</span>`),
      text.replace(new RegExp(`\\b(${wangchuckNames.join('|').replace(/ /g, '\\s+')})\\b`, 'gi'), `<span class="wangchuck-text">$1</span>`)
        .replace(/\bgravitas\b/gi, `<span class="gravitas-text">gravitas</span>`)
    );
  };

  const formatCaption = caption => applyRainbowColors(
    caption.replace(/#(\w+)/g, `<a href="javascript:void(0)" onclick="searchByHashtag('$1')" style="color: #1da1f2;">#$1</a>`)
      .replace(/@(\w+)/g, `<a href="javascript:void(0)" onclick="searchByUser('$1')" style="color: #1da1f2;">@$1</a>`)
      .replace(/(https?:\/\/[^\s]+)/g, match => `<div class="link-preview"><img src="https://www.google.com/s2/favicons?sz=64&domain=${match}" /><a href="${match}" target="_blank">${match.length > 40 ? match.slice(0, 40) + '...' : match}</a></div>`)
  );

  const captionContent = isLongCaption
    ? `<p class="card-text" id="${prefix}-caption-${post.id}">${formatCaption(truncatedCaption)} <a href="javascript:void(0)" class="read-more" onclick="toggleCaption(${post.id}, '${prefix}'); event.stopPropagation();">Read More</a></p>
       <p class="card-text full-caption" id="${prefix}-full-caption-${post.id}" style="display: none;">${formatCaption(post.caption)} <a href="javascript:void(0)" class="read-less" onclick="toggleCaption(${post.id}, '${prefix}'); event.stopPropagation();">Show Less</a></p>`
    : `<p class="card-text">${formatCaption(post.caption)}</p>`;

  const mediaContent = post.media ? `<img src="${post.media}" alt="Post Media" class="post-media" loading="lazy" onerror="this.src='/fall-back-image.jpg'" onclick="openMediaModal('${post.media}'); event.stopPropagation();" />` : '';
  const userIcon = ({
    'Sonam Rigsel': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
    'Phuentshok': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
    'Arun Kapur': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
    'Ngawang': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
    'Phuntshok Namgyel Dhendrup': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
    'Dino': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
    'Phuentx': '<i class="bi bi-patch-check-fill" style="color: #1da1f2;"></i>',
    'Gravitas': '<i class="bi bi-emoji-laughing-fill" style="background: linear-gradient(45deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
    'Sonam Penjo Dorji': '<i class="bi bi-disc" style="color: #1da1f2; font-size: 1rem;"></i>',
    'Ngawang Tshogyal Phuentshok': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
    'Riggzin Jigme Jatsho': '<i class="bi bi-patch-check-fill" style="background: linear-gradient(45deg, #1da1f2, #6f42c1, #000428); -webkit-background-clip: text; -webkit-text-fill-color: transparent; display: inline-block;"></i>',
  })[post.username] || '';

  const isOwnProfile = post.username === currentUsername;
  const friendButton = isOwnProfile ? '' : friendData.friends.includes(post.username) ? `<button class="action-button friend-button friend"><i class="bi bi-person-check"></i></button>` :
    friendData.requests.some(r => (r.from === currentUsername && r.to === post.username) || (r.from === post.username && r.to === currentUsername)) ? `<button class="action-button friend-button pending"><i class="bi bi-hourglass-split"></i></button>` :
    `<button class="action-button friend-button" onclick="sendFriendRequest('${post.username}'); event.stopPropagation();"><i class="bi bi-person-plus"></i></button>`;
  const actionButtons = isOwnProfile ? `
    <button class="action-button edit-button" onclick="openEditPostModal(${post.id}); event.stopPropagation();"><i class="bi bi-pencil"></i> Edit</button>
    <button class="action-button delete-button" onclick="deletePost(${post.id}); event.stopPropagation();"><i class="bi bi-trash"></i> Delete</button>
    <button class="action-button analytics-button" onclick="openAnalyticsModal(${post.id}, ${post.likes || 0}, ${post.comments.length || 0}, ${post.reports || 0}, '${post.date}'); event.stopPropagation();"><i class="bi bi-graph-up"></i> Analytics</button>` : '';
  const isLiked = post.likedBy?.includes(currentUsername);
  const isReported = post.reportedBy?.includes(currentUsername);
  const isBookmarked = post.bookmarkedBy?.includes(currentUsername);
  const tagContent = post.tag ? `<div class="tag-container"><span class="tag tag-${post.tag}">${post.tag}</span></div>` : '';

  return `
    <div class="card post-card" id="${prefix}-${post.id}" style="cursor: pointer;" onclick="loadPostInMiddle(${post.id}, event)">
      ${tagContent}
      <div class="card-body">
        <div class="profile-info">
          <img src="${postUserPhoto}" alt="User Profile" class="post-profile-img" onclick="loadUserProfileInMiddle('${post.username}'); event.stopPropagation();" />
          <div>
            <h5 class="card-title" onclick="loadUserProfileInMiddle('${post.username}'); event.stopPropagation();">${user.username} ${userIcon}</h5>
          </div>
        </div>
        ${captionContent}${mediaContent}
        <h6 class="card-subtitle text-muted">${new Date(post.date).toLocaleString()}</h6>
        <div class="post-actions">
          <button class="action-button like-button ${isLiked ? 'liked' : ''}" onclick="likePost(${post.id}); event.stopPropagation();">
            <span class="action-icon-count"><i class="bi bi-heart${isLiked ? '-fill' : ''}"></i> <span class="like-count-button" onclick="openLikesOverlay(${post.id}); event.stopPropagation();" id="like-count-${post.id}">${post.likes || 0}</span></span>
          </button>
          <button class="action-button comment-button" onclick="openCommentModal(${post.id}); event.stopPropagation();">
            <span class="action-icon-count"><i class="bi bi-chat"></i> <span class="comment-count-button" onclick="openCommentsOverlay(${post.id}); event.stopPropagation();" id="comment-count-${post.id}">${post.comments.length || 0}</span></span>
          </button>
          <button class="action-button relate-button" onclick="openRelateModal(${post.id}); event.stopPropagation();">
            <span class="action-icon-count"><i class="bi bi-camera"></i> <span class="relate-count-button" id="relate-count-${post.id}">${post.relates?.length || 0}</span></span>
          </button>
          <button class="action-button share-button" onclick="sharePost(${post.id}); event.stopPropagation();">
            <span class="action-icon-count"><i class="bi bi-download"></i> <span class="share-count-button" onclick="openSharesOverlay(${post.id}); event.stopPropagation();" id="share-count-${post.id}">${post.shareCount || 0}</span></span>
          </button>
          <button class="action-button bookmark-button ${isBookmarked ? 'bookmarked' : ''}" onclick="bookmarkPost(${post.id}); event.stopPropagation();">
            <span class="action-icon-count"><i class="bi bi-bookmark${isBookmarked ? '-fill' : ''}"></i> <span class="bookmark-count-button" onclick="openBookmarksOverlay(${post.id}); event.stopPropagation();" id="bookmark-count-${post.id}">${post.bookmarkedBy?.length || 0}</span></span>
          </button>
          <div class="more-actions">
            <button class="action-button more-button" onclick="toggleMoreActions(${post.id}); event.stopPropagation();"><i class="bi bi-grid-1x2"></i></button>
            <div class="more-actions-menu" id="more-actions-${post.id}" style="display: none;">
              ${friendButton}${actionButtons}
              <button class="action-button report-button ${isReported ? 'reported' : ''}" onclick="reportPost(${post.id}); event.stopPropagation();"><i class="bi bi-flag"></i> <span id="report-count-${post.id}">${post.reports || 0}</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

const toggleCaption = (postId, prefix) => {
  const short = document.getElementById(`${prefix}-caption-${postId}`);
  const full = document.getElementById(`${prefix}-full-caption-${postId}`);
  if (short && full) {
    const isShortVisible = short.style.display !== 'none';
    short.style.display = isShortVisible ? 'none' : 'block';
    full.style.display = isShortVisible ? 'block' : 'none';
  }
};

// Open relate modal
const openRelateModal = async (postId) => {
  currentPostId = postId;
  document.getElementById('relate-overlay').className = 'relate-overlay active';
  document.getElementById('relate-input-modal').focus();

  try {
    const [posts, users] = await Promise.all([
      fetch('/posts').then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch posts'))),
      fetch('/users').then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch users'))),
    ]);

    const post = posts.find((p) => p.id === postId);
    const relateList = document.getElementById('relate-list');
    const currentUsername = localStorage.getItem('username');
    const currentUserPhoto = localStorage.getItem('userPhoto');

    // Sort or filter relates
    let sortedRelates = post?.relates || [];
    if (currentRelateSortMode === 'newest') {
      sortedRelates = sortedRelates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentRelateSortMode === 'top') {
      sortedRelates = sortedRelates.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (currentRelateSortMode === 'verified') {
      sortedRelates = sortedRelates.filter((relate) => userIcon[relate.username]);
    } else if (currentRelateSortMode === 'officials') {
      sortedRelates = sortedRelates.filter((relate) => officialUsers.includes(relate.username));
    }

    relateList.innerHTML = sortedRelates.length
      ? sortedRelates
          .map((relate) => {
            const user = users.find((u) => u.username === relate.username) || {
              username: relate.username,
              photoURL: '/default-profile.jpg',
            };
            const relateUserPhoto =
              relate.username === currentUsername ? currentUserPhoto : user.photoURL || '/default-profile.jpg';
            const isLiked = relate.likedBy?.includes(currentUsername);
            const verifiedIcon = userIcon[relate.username] || '';
            const mediaContent = relate.media
              ? `<img src="${relate.media}" alt="Related Post Media" class="relate-media" loading="lazy" onerror="this.src='/fall-back-image.jpg'" />`
              : '';

            return `
              <div class="relate" id="relate-${relate.id}">
                <img src="${relateUserPhoto}" alt="${relate.username}" class="profile-img" />
                <div class="relate-content">
                  <div class="username-container">
                    <span class="username">${relate.username}</span>
                    ${verifiedIcon}
                  </div>
                  <p>${relate.text}</p>
                  ${mediaContent}
                  <div class="relate-actions">
                    <button class="action-button relate-like-button ${isLiked ? 'liked' : ''}" onclick="likeRelate(${post.id}, '${relate.id}'); event.stopPropagation();" aria-label="Like relate">
                      <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i> <span id="relate-like-count-${relate.id}">${relate.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>`;
          })
          .join('')
      : '<p class="relate-empty">Be the first one to add a related post</p>';

    // Update sort button states
    document.querySelectorAll('.relate-sort-buttons .sort-button').forEach((button) => {
      button.classList.toggle('active', button.textContent.toLowerCase() === currentRelateSortMode);
    });

    // Handle image upload
    const imageUpload = document.getElementById('relate-image-upload');
    imageUpload.removeEventListener('change', handleImageUpload);
    imageUpload.addEventListener('change', handleImageUpload);

    // Add Enter key listener for the relate input
    const relateInput = document.getElementById('relate-input-modal');
    relateInput.removeEventListener('keydown', handleRelateEnterKey);
    relateInput.addEventListener('keydown', handleRelateEnterKey);

    // Attach submit button listener
    const relateSubmitBtn = document.getElementById('relate-submit-btn');
    relateSubmitBtn.removeEventListener('click', submitRelateHandler);
    relateSubmitBtn.addEventListener('click', submitRelateHandler);
  } catch (error) {
    console.error('Error loading relates:', error);
    document.getElementById('relate-list').innerHTML =
      '<p class="relate-empty">Error loading related posts. Please try again later.</p>';
  }
};

// Handle image upload
let selectedImage = null;
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      event.target.value = '';
      selectedImage = null;
      return;
    }
    selectedImage = file;
  }
};

// Handle Enter key for relate submission
const handleRelateEnterKey = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submitRelateHandler();
  }
};

// Handler for relate submission
const submitRelateHandler = async () => {
  const relateInput = document.getElementById('relate-input-modal');
  const relateText = relateInput.value.trim();
  const imageUpload = document.getElementById('relate-image-upload');

  if (!relateText && !selectedImage) {
    alert('Please enter a caption or upload an image.');
    return;
  }

  try {
    const username = localStorage.getItem('username');
    const formData = new FormData();
    formData.append('username', username);
    formData.append('text', relateText);
    if (selectedImage) {
      formData.append('media', selectedImage);
    }

    const res = await fetch(`/posts/${currentPostId}/relate`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Failed to post related post');

    relateInput.value = '';
    imageUpload.value = '';
    selectedImage = null;
    openRelateModal(currentPostId);
    loadPosts();
  } catch (error) {
    console.error('Error posting relate:', error);
    alert('Failed to post related post. Please try again.');
  }
};

// Sort relates
const sortRelates = (sortMode) => {
  currentRelateSortMode = sortMode;
  openRelateModal(currentPostId);
};

// Like or unlike a relate
const likeRelate = async (postId, relateId) => {
  try {
    const username = localStorage.getItem('username');
    const relateElement = document.querySelector(`#relate-${relateId}`);
    const likeButton = relateElement.querySelector('.relate-like-button');
    const isLiked = likeButton.classList.contains('liked');
    const res = await fetch(`/posts/${postId}/relates/${relateId}/${isLiked ? 'unlike' : 'like'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to process relate like/unlike');

    const likeCountSpan = relateElement.querySelector(`#relate-like-count-${relateId}`);
    let likeCount = parseInt(likeCountSpan.textContent) || 0;
    likeButton.classList.toggle('liked');
    likeButton.querySelector('i').className = `bi bi-heart${isLiked ? '' : '-fill'}`;
    likeCountSpan.textContent = isLiked ? likeCount - 1 : likeCount + 1;

    if (document.getElementById('relate-overlay')?.className.includes('active')) {
      openRelateModal(postId);
    }
  } catch (error) {
    console.error('Error processing relate like/unlike:', error);
  }
};

// Close relate modal
const closeRelateModal = (event) => {
  if (event) event.stopPropagation();

  const relateOverlay = document.getElementById('relate-overlay');
  if (relateOverlay) {
    relateOverlay.className = 'relate-overlay';
    document.getElementById('relate-list').innerHTML = '';
    document.getElementById('relate-input-modal').value = '';
    document.getElementById('relate-image-upload').value = '';
    selectedImage = null;
    currentPostId = null;
  }
};

// Existing comment-related functions (unchanged)
const openCommentModal = async (postId) => {
  currentPostId = postId;
  document.getElementById('comment-overlay').className = 'comment-overlay active';
  document.getElementById('comment-input-modal').focus();

  try {
    const [posts, users] = await Promise.all([
      fetch('/posts').then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch posts'))),
      fetch('/users').then((res) => (res.ok ? res.json() : Promise.reject('Failed to fetch users'))),
    ]);

    const post = posts.find((p) => p.id === postId);
    const commentList = document.getElementById('comment-list');
    const currentUsername = localStorage.getItem('username');
    const currentUserPhoto = localStorage.getItem('userPhoto');

    let sortedComments = post?.comments || [];
    if (currentSortMode === 'newest') {
      sortedComments = sortedComments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (currentSortMode === 'top') {
      sortedComments = sortedComments.sort((a, b) => {
        const aScore = (a.likes || 0) + (a.replies?.length || 0);
        const bScore = (b.likes || 0) + (b.replies?.length || 0);
        return bScore - aScore;
      });
    } else if (currentSortMode === 'verified') {
      sortedComments = sortedComments.filter((comment) => userIcon[comment.username]);
    } else if (currentSortMode === 'officials') {
      sortedComments = sortedComments.filter((comment) => officialUsers.includes(comment.username));
    }

    commentList.innerHTML = sortedComments.length
      ? sortedComments
          .map((comment) => {
            const user = users.find((u) => u.username === comment.username) || {
              username: comment.username,
              photoURL: '/default-profile.jpg',
            };
            const commentUserPhoto =
              comment.username === currentUsername ? currentUserPhoto : user.photoURL || '/default-profile.jpg';
            const isOwnComment = comment.username === currentUsername;
            const isLiked = comment.likedBy?.includes(currentUsername);
            const isReported = comment.reportedBy?.includes(currentUsername);
            const verifiedIcon = userIcon[comment.username] || '';

            const repliesContent = `
              <div class="replies-container" id="replies-${comment.id}" style="display: none;">
                ${
                  comment.replies?.length
                    ? comment.replies
                        .map((reply) => {
                          const replyUser =
                            users.find((u) => u.username === reply.username) || {
                              username: reply.username,
                              photoURL: '/default-profile.jpg',
                            };
                          const replyUserPhoto =
                            reply.username === currentUsername
                              ? currentUserPhoto
                              : replyUser.photoURL || '/default-profile.jpg';
                          const isOwnReply = reply.username === currentUsername;
                          const isReplyLiked = reply.likedBy?.includes(currentUsername);
                          const isReplyReported = reply.reportedBy?.includes(currentUsername);
                          const replyVerifiedIcon = userIcon[reply.username] || '';
                          return `
                            <div class="comment reply" id="reply-${reply.id}">
                              <img src="${replyUserPhoto}" alt="${reply.username}" />
                              <div class="comment-content">
                                <div class="username-container">
                                  <span class="username">${reply.username}</span>
                                  ${replyVerifiedIcon}
                                </div>
                                <p>${reply.text}</p>
                                <div class="comment-actions">
                                  <button class="action-button comment-like-button ${
                                    isReplyLiked ? 'liked' : ''
                                  }" onclick="likeReply(${post.id}, '${comment.id}', '${
                            reply.id
                          }'); event.stopPropagation();" aria-label="Like reply">
                                    <i class="bi bi-heart${isReplyLiked ? '-fill' : ''}"></i> <span id="reply-like-count-${reply.id}">${
                            reply.likes || 0
                          }</span>
                                  </button>
                                  <div class="more-menu">
                                    <button class="action-button more-button" onclick="toggleMoreMenu('reply-${reply.id}'); event.stopPropagation();" aria-label="More options">
                                      <i class="bi bi-three-dots"></i>
                                      </button>
                                    <div class="more-menu-content" id="more-menu-reply-${reply.id}">
                                      ${
                                        isOwnReply
                                          ? `<button class="more-menu-item" onclick="deleteReply(${post.id}, '${comment.id}', '${reply.id}'); event.stopPropagation();">Delete</button>`
                                          : ''
                                      }
                                      <button class="more-menu-item" onclick="reportReply(${post.id}, '${comment.id}', '${reply.id}', '${currentUsername}'); event.stopPropagation();" ${
                            isReplyReported ? 'disabled' : ''
                          }>
                                        ${isReplyReported ? 'Reported' : 'Report'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>`;
                        })
                        .join('')
                    : ''
                }
              </div>`;

            return `
              <div class="comment" id="comment-${comment.id}">
                <img src="${commentUserPhoto} " alt="${comment.username}" />
                <div class="comment-content">
                  <div class="username-container">
                    <span class="username">${comment.username}</span>
                    ${verifiedIcon}
                  </div>
                  <p>${comment.text}</p>
                  <div class="comment-actions">
                    <button class="action-button comment-like-button ${
                      isLiked ? 'liked' : ''
                    }" onclick="likeComment(${post.id}, '${comment.id}'); event.stopPropagation();" aria-label="Like comment">
                      <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i> <span id="comment-like-count-${comment.id}">${
              comment.likes || 0
            }</span>
                    </button>
                    <button class="action-button reply-button" onclick="toggleReply('${comment.id}', ${post.id}); event.stopPropagation();" aria-label="Reply to comment">
                      <i class="bi bi-reply"></i>
                    </button>
                    <div class="more-menu">
                      <button class="action-button more-button" onclick="toggleMoreMenu('${comment.id}'); event.stopPropagation();" aria-label="More options">
                        <i class="bi bi-three-dots"></i>
                      </button>
                      <div class="more-menu-content" id="more-menu-${comment.id}">
                        ${
                          isOwnComment
                            ? `<button class="more-menu-item" onclick="deleteComment(${post.id}, '${comment.id}'); event.stopPropagation();">Delete</button>`
                            : ''
                        }
                        <button class="more-menu-item" onclick="reportComment(${post.id}, '${comment.id}', '${currentUsername}'); event.stopPropagation();" ${
                      isReported ? 'disabled' : ''
                    }>
                          ${isReported ? 'Reported' : 'Report'}
                        </button>
                      </div>
                    </div>
                  </div>
                  ${repliesContent}
                </div>
              </div>`;
          })
          .join('')
      : '<p class="comment-empty">Be the first one to comment</p>';

    // Update sort button states
    document.querySelectorAll('.sort-button').forEach((button) => {
      button.classList.toggle('active', button.textContent.toLowerCase() === currentSortMode);
    });

    // Reset comment input container to default state if not replying
    if (!replyingToCommentId) {
      resetCommentInput();
    }

    // Add Enter key listener for the comment input
    const commentInput = document.getElementById('comment-input-modal');
    commentInput.removeEventListener('keydown', handleEnterKey);
    commentInput.addEventListener('keydown', handleEnterKey);
  } catch (error) {
    console.error('Error loading comments:', error);
    document.getElementById('comment-list').innerHTML =
      '<p class="comment-empty">Error loading comments. Please try again later.</p>';
  }
};

// Handle Enter key for comment/reply submission
const handleEnterKey = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    const commentInput = document.getElementById('comment-input-modal');
    const text = commentInput.value.trim();
    if (!text) {
      alert('Please enter a comment or reply.');
      return;
    }
    if (replyingToCommentId) {
      submitReply(currentPostId, replyingToCommentId);
    } else {
      submitCommentHandler();
    }
  }
};

// Sort comments
const sortComments = (sortMode) => {
  currentSortMode = sortMode;
  openCommentModal(currentPostId);
};

// Toggle reply input and replies
const toggleReply = (commentId, postId) => {
  const repliesContainer = document.getElementById(`replies-${commentId}`);
  const commentInputContainer = document.getElementById('comment-input-container');
  const isReplying = replyingToCommentId === commentId;

  document.querySelectorAll('.replies-container').forEach((container) => {
    container.style.display = 'none';
  });

  if (isReplying) {
    replyingToCommentId = null;
    resetCommentInput();
    if (repliesContainer) {
      repliesContainer.style.display = 'none';
    }
  } else {
    replyingToCommentId = commentId;
    commentInputContainer.innerHTML = `
      <textarea class="form-control reply-input" id="comment-input-modal" placeholder="Write a reply..." maxlength="280" aria-label="Reply to comment"></textarea>
      <button class="btn btn-primary btn-sm" id="comment-submit-btn" aria-label="Send reply">Reply</button>
    `;
    const commentInput = document.getElementById('comment-input-modal');
    commentInput.focus();
    commentInput.removeEventListener('keydown', handleEnterKey);
    commentInput.addEventListener('keydown', handleEnterKey);
    if (repliesContainer) {
      repliesContainer.style.display = 'block';
    }
  }
};

// Reset comment input to default state
const resetCommentInput = () => {
  const commentInputContainer = document.getElementById('comment-input-container');
  commentInputContainer.innerHTML = `
    <input type="text" id="comment-input-modal" class="form-control comment-input" placeholder="Add a comment..." />
    <button class="send-icon" id="comment-submit-btn" aria-label="Send comment">
      <i class="bi bi-chat-dots-fill"></i>
    </button>
  `;
  const commentSubmitBtn = document.getElementById('comment-submit-btn');
  commentSubmitBtn.removeEventListener('click', submitCommentHandler);
  commentSubmitBtn.addEventListener('click', submitCommentHandler);
  const commentInput = document.getElementById('comment-input-modal');
  commentInput.removeEventListener('keydown', handleEnterKey);
  commentInput.addEventListener('keydown', handleEnterKey);
};

// Handler for comment submission
const submitCommentHandler = async () => {
  const commentInput = document.getElementById('comment-input-modal');
  const commentText = commentInput.value.trim();
  if (!commentText || !currentPostId) return;

  try {
    const username = localStorage.getItem('username');
    const res = await fetch(`/posts/${currentPostId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text: commentText }),
    });
    if (!res.ok) throw new Error('Failed to post comment');
    commentInput.value = '';
    openCommentModal(currentPostId);
    loadPosts();
  } catch (error) {
    console.error('Error posting comment:', error);
    alert('Failed to post comment. Please try again.');
  }
};

// Override the default alert function
window.alert = function (message) {
  const overlay = document.createElement('div');
  overlay.className = 'custom-alert-overlay';
  overlay.innerHTML = `
    <div class="custom-alert-modal" role="alertdialog" aria-labelledby="alert-message" aria-modal="true">
      <p id="alert-message">${message}</p>
      <button aria-label="Close alert">OK</button>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.className = 'custom-alert-overlay active';

  const closeButton = overlay.querySelector('button');
  closeButton.focus();
  closeButton.addEventListener('click', () => {
    overlay.className = 'custom-alert-overlay';
    setTimeout(() => overlay.remove(), 0);
  });

  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      overlay.className = 'custom-alert-overlay';
      setTimeout(() => overlay.remove(), 0);
    }
  });

  overlay.addEventListener('focusin', (e) => {
    if (!overlay.contains(e.target)) {
      closeButton.focus();
    }
  });
};

// Override the default confirm function
window.confirm = function (message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    overlay.innerHTML = `
      <div class="custom-confirm-modal" role="alertdialog" aria-labelledby="confirm-message" aria-modal="true">
        <p id="confirm-message">${message}</p>
        <div class="button-group">
          <button class="confirm-ok" aria-label="Confirm">OK</button>
          <button class="confirm-cancel" aria-label="Cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.className = 'custom-confirm-overlay active';

    const okButton = overlay.querySelector('.confirm-ok');
    const cancelButton = overlay.querySelector('.confirm-cancel');

    okButton.focus();

    okButton.addEventListener('click', () => {
      overlay.className = 'custom-confirm-overlay';
      setTimeout(() => {
        overlay.remove();
        resolve(true);
      }, 0);
    });

    cancelButton.addEventListener('click', () => {
      overlay.className = 'custom-confirm-overlay';
      setTimeout(() => {
        overlay.remove();
        resolve(false);
      }, 0);
    });

    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        overlay.className = 'custom-confirm-overlay';
        setTimeout(() => {
          overlay.remove();
          resolve(true);
        }, 0);
      } else if (e.key === 'Escape') {
        overlay.className = 'custom-confirm-overlay';
        setTimeout(() => {
          overlay.remove();
          resolve(false);
        }, 0);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        if (document.activeElement === okButton) {
          cancelButton.focus();
        } else {
          okButton.focus();
        }
      }
    });

    overlay.addEventListener('focusin', (e) => {
      if (!overlay.contains(e.target)) {
        okButton.focus();
      }
    });
  });
};

// Submit a reply
const submitReply = async (postId, commentId) => {
  const replyInput = document.getElementById('comment-input-modal');
  const repliesContainer = document.getElementById(`replies-${commentId}`);
  const replyText = replyInput.value.trim();
  if (!replyText) {
    alert('Please enter a reply.');
    return;
  }

  try {
    const username = localStorage.getItem('username');
    const res = await fetch(`/posts/${postId}/comments/${commentId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text: replyText }),
    });
    if (!res.ok) throw new Error('Failed to post reply');
    replyInput.value = '';
    replyingToCommentId = null;
    resetCommentInput();
    if (repliesContainer) repliesContainer.style.display = 'block';
    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
    loadPosts();
  } catch (error) {
    console.error('Error posting reply:', error);
    alert('Failed to post reply. Please try again.');
  }
};

// Like or unlike a comment
const likeComment = async (postId, commentId) => {
  try {
    const username = localStorage.getItem('username');
    const commentElement = document.querySelector(`#comment-${commentId}`);
    const likeButton = commentElement.querySelector('.comment-like-button');
    const isLiked = likeButton.classList.contains('liked');
    const res = await fetch(`/posts/${postId}/comments/${commentId}/${isLiked ? 'unlike' : 'like'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to process comment like/unlike');

    const likeCountSpan = commentElement.querySelector(`#comment-like-count-${commentId}`);
    let likeCount = parseInt(likeCountSpan.textContent) || 0;
    likeButton.classList.toggle('liked');
    likeButton.querySelector('i').className = `bi bi-heart${isLiked ? '' : '-fill'}`;
    likeCountSpan.textContent = isLiked ? likeCount - 1 : likeCount + 1;

    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
  } catch (error) {
    console.error('Error processing comment like/unlike:', error);
  }
};

// Like or unlike a reply
const likeReply = async (postId, commentId, replyId) => {
  try {
    const username = localStorage.getItem('username');
    const replyElement = document.querySelector(`#reply-${replyId}`);
    likeButton = replyElement.querySelector('.comment-like-button');
    const isLiked = likeButton.classList.contains('liked');
    const res = await fetch(`/posts/${postId}/comments/${commentId}/replies/${replyId}/${isLiked ? 'unlike' : 'like'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to process reply like/unlike');

    const likeCountSpan = replyElement.querySelector(`#reply-like-count-${replyId}`);
    let likeCount = parseInt(likeCountSpan.textContent) || 0;
    likeButton.classList.toggle('liked');
    likeButton.querySelector('i').className = `bi bi-heart${isLiked ? '' : '-fill'}`;
    likeCountSpan.textContent = isLiked ? likeCount - 1 : likeCount + 1;

    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
  } catch (error) {
    console.error('Error processing reply like/unlike:', error);
  }
};

// Report a comment
const reportComment = async (postId, commentId, username) => {
  try {
    const res = await fetch(`/posts/${postId}/comments/${commentId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to report comment');
    }

    const data = await res.json();
    if (data.deleted) {
      alert('Comment deleted due to excessive reports.');
    } else {
      alert('Comment reported successfully.');
    }

    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
    loadPosts();
  } catch (error) {
    console.error('Error reporting comment:', error);
  }
};

// Report a reply
const reportReply = async (postId, commentId, replyId, username) => {
  try {
    const res = await fetch(`/posts/${postId}/comments/${commentId}/replies/${replyId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to report reply');
    }

    const data = await res.json();
    if (data.deleted) {
      alert('Reply deleted due to excessive reports.');
    } else {
      alert('Reply reported successfully.');
    }

    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
    loadPosts();
  } catch (error) {
    console.error('Error reporting reply:', error);
  }
};

// Delete a comment
const deleteComment = async (postId, commentId) => {
  if (!confirm('Are you sure you want to delete this comment?')) return;

  try {
    const username = localStorage.getItem('username');
    const res = await fetch(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to delete comment');

    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
    loadPosts();
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};

// Delete a reply
const deleteReply = async (postId, commentId, replyId) => {
  if (!confirm('Are you sure you want to delete this reply?')) return;
  try {
    const username = localStorage.getItem('username');
    const res = await fetch(`/posts/${postId}/comments/${commentId}/replies/${replyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    if (!res.ok) throw new Error('Failed to delete reply');

    if (document.getElementById('post-view-overlay')?.className.includes('active')) {
      // Handle post view modal refresh if needed
    } else if (document.getElementById('comment-overlay').className.includes('active')) {
      openCommentModal(postId);
    }
    loadPosts();
  } catch (error) {
    console.error('Error deleting reply:', error);
  }
};

// Toggle more menu
const toggleMoreMenu = (commentId) => {
  const menu = document.getElementById(`more-menu-${commentId}`);
  if (menu) {
    menu.classList.toggle('active');
  }
};

// Close more menus when clicking outside
document.addEventListener('click', (event) => {
  const moreMenus = document.querySelectorAll('.more-menu-content');
  moreMenus.forEach((menu) => {
    if (menu.classList.contains('active') && !event.target.closest('.more-menu')) {
      menu.classList.remove('active');
    }
  });
});

// Close comment modal
const closeCommentModal = (event) => {
  if (event) event.stopPropagation();

  const commentOverlay = document.getElementById('comment-overlay');
  if (commentOverlay) {
    commentOverlay.className = 'comment-overlay';
    document.getElementById('comment-list').innerHTML = '';
    document.getElementById('comment-input-modal').value = '';
    replyingToCommentId = null;
    resetCommentInput();
    currentPostId = null;
  }
};
const openLikesOverlay = async postId => {
  try {
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Posts fetch failed')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Users fetch failed')),
      fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : { friends: [], requests: [] }).catch(err => (console.warn(err), { friends: [], requests: [] }))
    ]);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');
    const likedBy = post.likedBy || [];
    const overlay = document.createElement('div');
    overlay.className = 'likes-overlay';
    overlay.innerHTML = `
      <div class="likes-modal">
        <div class="likes-modal-header">
          <h5>Liked by</h5>
          <button class="likes-modal-close"><i class="bi bi-x"></i></button>
        </div>
        <div class="likes-list">
          ${likedBy.length ? likedBy.map(username => {
            const user = users.find(u => u.username === username) || { username, photoURL: '/default-profile.jpg' };
            return `<div class="like-item" onclick="loadUserProfileInMiddle('${user.username}'); event.stopPropagation();">
              <img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}" /><h6>${user.username}</h6>
              ${generateFriendButton(user.username, friendData, localStorage.getItem('username'))}
            </div>`;
          }).join('') : '<p class="like-item-empty">No likes yet.</p>'}
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => (e.target === overlay || e.target.closest('.likes-modal-close')) && overlay.remove());
  } catch (error) {
    console.error('Likes overlay error:', error);
    alert('Failed to load likes.');
  }
};

const openEditPostModal = async postId => {
  try {
    const posts = await fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts'));
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('Post not found');

    let overlay = document.getElementById('edit-post-overlay') || document.createElement('div');
    overlay.id = 'edit-post-overlay';
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.innerHTML = `
      .edit-post-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); z-index: 3000; display: none; justify-content: center; align-items: center; }
      .edit-post-overlay.active { display: flex; }
      .edit-post-modal { background: #fff; border-radius: 12px; width: 90%; max-width: 500px; padding: 20px; position: relative; }
      .edit-post-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
      .edit-post-modal-title { font-size: 18px; font-weight: 600; color: #14171a; }
      .edit-post-modal-close { background: none; border: none; font-size: 24px; cursor: pointer; }
      .edit-post-form .form-control { width: 100%; padding: 8px; margin-bottom: 12px; border: 1px solid #e1e8ed; border-radius: 4px; }
      .edit-post-form .form-control.textarea { resize: vertical; min-height: 100px; }
      .edit-post-form .form-control:focus { outline: none; border-color: #1da1f2; }
      .edit-post-form .btn-primary { background: #1da1f2; color: #fff; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
      .edit-post-form .btn-primary:hover { background: #1a91da; }
      .image-preview-container { position: relative; margin-bottom: 12px; }
      .image-preview-container img { max-width: 100%; border-radius: 8px; }
      .remove-image-btn { position: absolute; top: 8px; right: 8px; background: rgba(0, 0, 0, 0.7); color: #fff; border: none; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; cursor: pointer; }`;
    document.head.appendChild(style);

    overlay.className = 'edit-post-overlay active';
    overlay.innerHTML = `
      <div class="edit-post-modal">
        <div class="edit-post-modal-header">
          <h5 class="edit-post-modal-title">Edit Post</h5>
          <button class="edit-post-modal-close" aria-label="Close edit post modal"><i class="bi bi-x"></i></button>
        </div>
        <form id="editPostForm" class="edit-post-form">
          <textarea id="edit-caption" class="form-control textarea" placeholder="What's on your mind?" maxlength="280" aria-label="Edit post caption">${post.caption}</textarea>
          <select id="edit-tag-select" class="form-control" aria-label="Select tag">
            <option value="">No Tag</option>
            <option value="social">Social</option>
            <option value="arts">Arts</option>
            <option value="anime">Anime</option>
            <option value="food">Food</option>
            <option value="blog">Blog</option>
            <option value="tech">Tech</option>
            <option value="nature">Nature</option>
            <option value="animal">Animal</option>
            <option value="car">Car</option>
            <option value="nature-retreat">Nature Retreat</option>
            <option value="le">LE</option>
            <option value="future">Future</option>
            <option value="wildlife">Wildlife</option>
            <option value="custom">Custom</option>
          </select>
          <input type="text" id="edit-custom-tag" class="form-control" placeholder="Enter custom tag" style="display: none;" aria-label="Custom tag">
          <div class="image-preview-container">
            <img id="edit-image-preview" style="display: ${post.media ? 'block' : 'none'};" src="${post.media || ''}" alt="Image preview" />
            <button type="button" class="remove-image-btn" id="remove-image-btn" style="display: ${post.media ? 'flex' : 'none'};" aria-label="Remove image">✕</button>
          </div>
          <input type="file" id="edit-media-upload" accept="image/*" aria-label="Upload new image">
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </form>
      </div>`;

    const tagSelect = document.getElementById('edit-tag-select');
    const customTagInput = document.getElementById('edit-custom-tag');
    if (post.tag) {
      if (['social', 'arts', 'anime', 'food', 'blog', 'tech', 'nature', 'animal', 'car', 'nature-retreat', 'le', 'future', 'wildlife'].includes(post.tag)) {
        tagSelect.value = post.tag;
      } else {
        tagSelect.value = 'custom';
        customTagInput.value = post.tag;
        customTagInput.style.display = 'block';
      }
    }

    tagSelect.addEventListener('change', () => {
      customTagInput.style.display = tagSelect.value === 'custom' ? 'block' : 'none';
      if (tagSelect.value === 'custom') customTagInput.focus();
      else customTagInput.value = '';
    });

    const mediaUpload = document.getElementById('edit-media-upload');
    const imagePreview = document.getElementById('edit-image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
    mediaUpload.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          imagePreview.src = event.target.result;
          imagePreview.style.display = 'block';
          removeImageBtn.style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });

    removeImageBtn.addEventListener('click', () => {
      imagePreview.src = '';
      imagePreview.style.display = 'none';
      removeImageBtn.style.display = 'none';
      mediaUpload.value = '';
    });

    document.getElementById('editPostForm').addEventListener('submit', async e => {
      e.preventDefault();
      const caption = document.getElementById('edit-caption').value.trim();
      const tagSelect = document.getElementById('edit-tag-select').value;
      const customTag = document.getElementById('edit-custom-tag').value.trim();
      const tag = tagSelect === 'custom' ? customTag : tagSelect;
      const imageRemoved = imagePreview.style.display === 'none';

      if (!caption) {
        alert('Caption is required.');
        return;
      }

      const formData = new FormData();
      formData.append('username', localStorage.getItem('username'));
      formData.append('caption', caption);
      if (tag) formData.append('tag', tag);
      if (mediaUpload.files[0]) formData.append('media', mediaUpload.files[0]);
      if (imageRemoved && !mediaUpload.files[0]) formData.append('removeMedia', true);

      try {
        const res = await fetch(`/posts/${postId}`, { method: 'PUT', body: formData });
        if (!res.ok) throw new Error('Failed to update post');
        overlay.className = 'edit-post-overlay';
        currentPostId = null;
        pollOptionCount = 2;
        loadPosts();
        const activeNav = document.querySelector('.nav-item.active');
        const currentPage = activeNav.getAttribute('onclick').match(/'([^']+)'/)[1];
        loadContent(currentPage, activeNav);
      } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post. Please try again.');
      }
    });

    overlay.addEventListener('click', e => {
      if (e.target === overlay || e.target.closest('.edit-post-modal-close')) {
        overlay.className = 'edit-post-overlay';
        currentPostId = null;
        pollOptionCount = 2;
      }
    });
  } catch (error) {
    console.error('Error opening edit post modal:', error);
    alert('Failed to load post for editing. Please try again.');
  }
};
const openAnalyticsModal = async (postId, likes, commentCount, reports, postDate) => {
  try {
    // Fetch post, users, and friend data
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    const post = posts.find(p => p.id === postId);
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');
    const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
    const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';

    // Calculate status and growth
    const analyticsOverview = calculateAnalyticsOverview(likes, commentCount, reports, postDate);

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'analytics-overlay';
    overlay.innerHTML = `
      <div class="analytics-modal">
        <div class="analytics-modal-header">
          <h5 class="analytics-title">Post Analytics</h5>
          <button class="analytics-modal-close" aria-label="Close analytics">
            <i class="bi bi-x"></i>
          </button>
        </div>
        <div class="analytics-modal-container">
          <div class="post-content">
            ${renderPost(post, user, friendData, username, postUserPhoto, true)}
          </div>
          <div class="chart-content">
            <div class="analytics-overview">
              <h6 class="overview-title">Analytics Overview</h6>
              <p class="overview-status">Status: ${analyticsOverview.status}</p>
              <p class="overview-growth">Growth Trend: ${analyticsOverview.growth}</p>
            </div>
            <div class="analytics-stats">
              <div class="stat-card">
                <span class="stat-value">${likes}</span>
                <span class="stat-label">Likes</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${commentCount}</span>
                <span class="stat-label">Comments</span>
              </div>
              <div class="stat-card">
                <span class="stat-value">${reports}</span>
                <span class="stat-label">Reports</span>
              </div>
            </div>
            <canvas id="analyticsChart-${postId}" style="max-height: 300px;"></canvas>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    // Close modal on click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.analytics-modal-close')) {
        overlay.remove();
      }
    });

    // Date range: only post date and today
    const postDateObj = new Date(postDate);
    const now = new Date();
    const labels = [
      postDateObj.toLocaleDateString(),
      now.toLocaleDateString()
    ];

    // Distribute data: 0 on post date, all data on today
    const likesData = [0, likes];
    const commentsData = [0, commentCount];
    const reportsData = [0, reports];

    // Load Chart.js dynamically if not already loaded
    if (typeof Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => renderChart(postId, labels, likesData, commentsData, reportsData);
      document.head.appendChild(script);
    } else {
      renderChart(postId, labels, likesData, commentsData, reportsData);
    }
  } catch (error) {
    console.error('Error opening analytics modal:', error);
    alert('Failed to load analytics. Please try again.');
  }
};

const calculateAnalyticsOverview = (likes, commentCount, reports, postDate) => {
  const totalEngagement = likes + commentCount + reports;
  let status = 'Neutral';
  let growth = 'Stable';

  // Compare likes, comments, and reports
  if (likes > commentCount * 2 && likes > reports * 5) {
    status = 'Positive (High Like Engagement)';
  } else if (commentCount > likes && commentCount > reports * 3) {
    status = 'Engaging (High Comment Activity)';
  } else if (reports > likes / 2 || reports > commentCount) {
    status = 'Concerning (High Reports)';
  }

  // Calculate growth trend based on time since post
  const postDateObj = new Date(postDate);
  const now = new Date();
  const daysSincePost = (now - postDateObj) / (1000 * 60 * 60 * 24);
  
  if (daysSincePost < 7 && totalEngagement > 100) {
    growth = 'Strong Growth';
  } else if (daysSincePost < 30 && totalEngagement > 50) {
    growth = 'Moderate Growth';
  } else if (daysSincePost >= 30 && totalEngagement < 10) {
    growth = 'Stagnant';
  }

  return { status, growth };
};

const renderChart = (postId, labels, likesData, commentsData, reportsData) => {
  const ctx = document.getElementById(`analyticsChart-${postId}`).getContext('2d');

  new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Likes', 'Comments', 'Reports'],
      datasets: [{
        label: 'Engagement',
        data: [likesData[1], commentsData[1], reportsData[1]], // Use only current values (today)
        backgroundColor: [
          'rgba(29, 161, 242, 0.6)', // Lightened Twitter/X blue
          'rgba(16, 185, 129, 0.6)', // Lightened emerald green
          'rgba(239, 68, 68, 0.6)' // Lightened red
        ],
        borderColor: [
          '#1DA1F2',
          '#10b981',
          '#ef4444'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          grid: {
            color: '#e5e7eb',
            lineWidth: 1
          },
          ticks: {
            display: false, // Hide radial ticks for cleaner look
            backdropColor: 'transparent'
          },
          pointLabels: {
            font: {
              size: 12,
              weight: '600',
              family: 'Inter'
            },
            color: '#111827'
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 0,
            boxHeight: 0,
            usePointStyle: true,
            pointStyle: 'circle',
            pointStyleWidth: 12,
            font: {
              size: 12,
              weight: '600',
              family: 'Inter'
            },
            color: '#111827',
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#111827',
          bodyColor: '#111827',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          titleFont: {
            size: 14,
            weight: '600'
          },
          bodyFont: {
            size: 12
          },
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.parsed || 0;
              return `${label}: ${value}`;
            }
          }
        }
      },
      animation: {
        animateRotate: true,
        animateScale: true
      }
    }
  });
};
// Track user message count for feedback prompt
let userMessageCount = 0;

// Toggle chatbot visibility
const toggleChatbot = () => {
  const chatbotContainer = document.getElementById('chatbot-container');
  chatbotContainer.style.display = chatbotContainer.style.display === 'none' ? 'flex' : 'none';
  if (chatbotContainer.style.display === 'flex') {
    document.getElementById('chatbot-input').focus();
  }
};

// Close chatbot
const closeChatbot = () => {
  document.getElementById('chatbot-container').style.display = 'none';
};

// Close full-screen image viewer
const closeImageViewer = () => {
  document.getElementById('image-viewer').style.display = 'none';
};

// Cancel image upload
const cancelImageUpload = () => {
  uploadedImage = null;
  document.getElementById('chatbot-image-upload').value = '';
  document.getElementById('chatbot-cancel-image').style.display = 'none';
  addChatbotMessage('Image upload cancelled.');
};

// Add message to chatbot
const addChatbotMessage = (message, isUser = false) => {
  const messagesContainer = document.getElementById('chatbot-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `chatbot-message ${isUser ? 'user' : 'bot'}`;
  messageDiv.innerHTML = message;
  messagesContainer.appendChild(messageDiv);
  // Add click event to images for full-screen view
  const images = messageDiv.querySelectorAll('img');
  images.forEach(img => {
    img.addEventListener('click', () => {
      const viewer = document.getElementById('image-viewer');
      const viewerImg = document.getElementById('image-viewer-img');
      viewerImg.src = img.src;
      viewerImg.alt = img.alt;
      viewer.style.display = 'flex';
    });
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// Store uploaded image
let uploadedImage = null;

// Helper function to parse multiple usernames from input
const parseUsernames = (inputString) => {
  if (!inputString) return [];
  return inputString
    .split(/,\s*|\s+or\s+/i)
    .map(name => name.replace(/^@/, '').trim()) // Remove optional @ prefix
    .filter(name => name);
};

// Handle feedback response
const handleFeedback = (feedback) => {
  const feedbackMessage = feedback === 'good' 
    ? 'Thank you for your positive feedback! I truly appreciate your support. 😊' 
    : 'Thank you for your feedback! I appreciate your honesty and will strive to improve. 😊';
  addChatbotMessage(feedbackMessage);
  // Remove feedback icons after response
  const feedbackContainer = document.getElementById('feedback-container');
  if (feedbackContainer) {
    feedbackContainer.remove();
  }
};

// Prompt for feedback after a certain number of messages
const promptFeedback = () => {
  const feedbackMessage = `
    How was the conversation so far?<br>
    <div id="feedback-container" style="margin-top: 10px;">
      <span class="feedback-icon" style="cursor: pointer; font-size: 24px; margin-right: 10px;" onclick="handleFeedback('good')">👍</span>
      <span class="feedback-icon" style="cursor: pointer; font-size: 24px;" onclick="handleFeedback('bad')">👎</span>
    </div>
  `;
  addChatbotMessage(feedbackMessage);
};

// Handle chatbot input
const handleChatbotInput = async () => {
  const input = document.getElementById('chatbot-input');
  const message = input.value.trim();
  const messageLower = message.toLowerCase();
  if (!message) return;

  addChatbotMessage(message, true);
  input.value = '';

  // Increment user message count and prompt feedback every 40 messages
  userMessageCount++;
  if (userMessageCount % 40 === 0) {
    promptFeedback();
  }

  try {
    const username = localStorage.getItem('username');
    if (!username) {
      addChatbotMessage('You need to be logged in to use this feature.');
      return;
    }

    const [users, posts, friendData, notifications] = await Promise.all([
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch(`/friends?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends')),
      fetch(`/notifications?username=${encodeURIComponent(username)}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch notifications')),
    ]);

    const currentUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    // Help command table
    const helpTable = `
      <table>
        <tr><th>Way</th><th>Command</th><th>Example</th></tr>
        <tr><td>Ask about leadership</td><td>who is the ceo/cfo</td><td>Who is the CEO</td></tr>
        <tr><td>View bio</td><td>bio of username(s)</td><td>bio of Ngawang Tshogyal Phuentshok, Sonam Rigsel</td></tr>
        <tr><td>List followers</td><td>followers of username(s)</td><td>followers of Tandin Karma Lhazen or Sonam Rigsel</td></tr>
        <tr><td>List following</td><td>following of username(s)</td><td>following of Ngawang Tshogyal Phuentshok</td></tr>
        <tr><td>View profile picture</td><td>show my profile picture / profile picture of username(s)</td><td>profile picture of Tandin Karma Lhazen, Sonam Rigsel</td></tr>
        <tr><td>View banner</td><td>show my banner / banner of username(s)</td><td>banner of Ngawang Tshogyal Phuentshok or Sonam Rigsel</td></tr>
        <tr><td>View profile details</td><td>profile of username(s) / details of username(s)</td><td>profile of Ngawang Tshogyal Phuentshok, Sonam Rigsel</td></tr>
        <tr><td>Check trends</td><td>show trends / show trends tags</td><td>show trends</td></tr>
        <tr><td>View all notifications</td><td>show notifications</td><td

> show notifications</td></tr>
        <tr><td>View notifications from user</td><td>notifications from username</td><td>notifications from Tandin Karma Lhazen</td></tr>
        <tr><td>View posts</td><td>show posts by @username</td><td>show posts by @Tandin Karma Lhazen</td></tr>
        <tr><td>Create post</td><td>post (caption)</td><td>post (My photo)</td></tr>
        <tr><td>Get post image</td><td>give me the image of (url)</td><td>give me the image of (https://thegravitas.glitch.me/home.html?post=123)</td></tr>
        <tr><td>Ask about Newton</td><td>what is newton</td><td>what is newton</td></tr>
        <tr><td>Ask about Bhutan</td><td>what is bhutan</td><td>what is bhutan</td></tr>
      </table>
    `;

    // Handle help command
    if (messageLower === 'help') {
      addChatbotMessage(`How to use GraVitas Assistant:<br>${helpTable}<br>Click the image icon to upload an image for posting!`);
      return;
    }

    // Handle "how to" queries
    if (messageLower.includes('how to')) {
      const actionMatch = message.match(/how to (\w+)/i);
      const action = actionMatch?.[1]?.toLowerCase();
      if (!action) {
        addChatbotMessage(`Please specify an action (e.g., "how to post").<br>Available commands:<br>${helpTable}`);
        return;
      }
      const commandRows = helpTable.match(/<tr>.*?<\/tr>/g);
      const matchingRow = commandRows.find(row => row.toLowerCase().includes(action));
      if (matchingRow) {
        addChatbotMessage(`How to ${action}:<br><table><tr><th>Way</th><th>Command</th><th>Example</th></tr>${matchingRow}</table>`);
      } else {
        addChatbotMessage(`No command found for "${action}".<br>Available commands:<br>${helpTable}`);
      }
      return;
    }

    // Handle greetings
    if (['hi', 'hello', 'hey', 'greetings'].includes(messageLower)) {
      addChatbotMessage(`Hello! I'm Newton, virtual assistant for The Gravitas. Type "help" to see available commands or try something like "show my profile picture".`);
      return;
    }

    // Handle Newton query
    if (messageLower.includes('what is newton')) {
      addChatbotMessage(`Newton is an advanced artificial intelligence assistant for The Gravitas, currently under development to enhance user interaction and platform functionality. It leverages sophisticated natural language processing to provide seamless responses and assist with various tasks.<br>
        <img src="https://cdn.glitch.global/64ed69b7-ed08-43ba-8cbe-8fe8061b9ff8/newtnail.png?v=1745750935919" alt="Newton AI" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Handle Bhutan query
    if (messageLower.includes('about bhutan')) {
      const bhutanDescription = `
        Bhutan, a Himalayan kingdom, is renowned for its Gross National Happiness philosophy, prioritizing well-being over economic growth. Nestled between India and China, it spans 38,394 square kilometers with a population of approximately 780,000. Thimphu is the capital. Bhutan preserves its Buddhist heritage through vibrant festivals, ancient monasteries like Paro Taktsang, and traditional architecture. Its economy relies on hydropower, agriculture, and tourism, with a focus on environmental conservation, maintaining over 70% forest cover. Bhutan's unique culture, serene landscapes, and commitment to sustainability make it a global model for holistic development.
      `;
      addChatbotMessage(`About Bhutan:<br>
        ${bhutanDescription}<br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/bbb.jpg?v=1751715953006" alt="Bhutan Landscape 1" style="max-width: 100px; border-radius: 4px;" /><br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/nbb.jpg?v=1751715996650" alt="Bhutan Landscape 2" style="max-width: 100px; border-radius: 4px;" /><br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/punakha.webp?v=1751715987309" alt="Punakha Dzong" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Handle song query
    if (messageLower.includes('your favourite song')) {
      addChatbotMessage(`My favorite artist is beabadoobee!<br>
        <img src="https://i.scdn.co/image/ab67616d0000b273b0c8bb1b1c8a7a3b0e722bb3" alt="beabadoobee" style="max-width: 100px; border-radius: 4px;" /><br>
        Favorite song: Glue Song<br>
        <a href="https://www.youtube.com/watch?v=2gX8wCnaGps" target="_blank">Watch on YouTube</a>`);
      return;
    }

    // Handle gay query
    if (messageLower.includes('are you gay')) {
      addChatbotMessage('I am not gay because I like the way I am.');
      return;
    }

    // Handle motivation query
    if (messageLower.includes('give me motivation') || messageLower.includes('needs motivation')) {
      addChatbotMessage(`One day you will achieve better than this, you can do it!<br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/eec5bd6871d7bf866c3ed05ece8da194.jpg?v=1750221275150" alt="Motivational image" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Handle Phuntshok Namgyal query
    if (messageLower.includes('who is phuntshok namgyal')) {
      addChatbotMessage(`Phuntshok Namgyal is the commentee of the CEO and his friend.<br>
        <img src="https://cdn.glitch.global/46d21e93-6494-4e68-8860-ab30cc213890/tshentop.jpg?v=1729660781848" alt="Phuntshok Namgyal" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Handle CEO query
    if (messageLower.includes('who is the ceo') || messageLower.includes('ceo of gravitas')) {
      addChatbotMessage(`The CEO of Gravitas is Phuentshok. Details: Ngawang Tshogyal Phuentshok.<br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/ntsj.jpg?v=1751543890279" alt="Phuentshok's profile picture" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Handle CFO query
    if (messageLower.includes('who is the cfo') || messageLower.includes('cfo of gravitas')) {
      addChatbotMessage(`The CFO of Gravitas is Sonam Rigsel. Details: He is the CFO of Gravitas.<br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/soma.jpg?v=1751543901499" alt="Sonam Rigsel's profile picture" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Handle periodic table image query
    if (messageLower.includes('image of the periodic') || messageLower.includes('periodic table')) {
      const periodicTableDescription = `
        The periodic table organizes chemical elements by atomic number, electron configuration, and recurring properties. Developed by Dmitri Mendeleev in 1869, it arranges elements into rows (periods) and columns (groups) based on their atomic structure. Elements in the same group share similar chemical behaviors due to identical valence electron counts. The table is divided into metals, nonmetals, and metalloids, with trends like electronegativity and atomic radius varying predictably. It is a fundamental tool in chemistry, aiding in predicting element behavior, compound formation, and scientific discoveries, continually updated with new elements.
      `;
      addChatbotMessage(`The Periodic Table:<br>
        <img src="https://cdn.glitch.global/9af78ba3-e788-47b8-b995-273533c7d730/Screenshot%202025-06-17%20at%2012.11.01%E2%80%AFAM.png?v=1750244023756" alt="Periodic Table" style="max-width: 100px; border-radius: 4px;" /><br>
        ${periodicTableDescription}`);
      return;
    }

    // Handle my profile picture or banner
    if (messageLower.includes('show my profile picture') || messageLower.includes('show my banner')) {
      if (!currentUser) {
        addChatbotMessage('User profile not found. Please try again.');
        return;
      }
      if (messageLower.includes('profile picture')) {
        addChatbotMessage(`Your profile picture:<br><img src="${currentUser.photoURL || '/default-profile.jpg'}" alt="${username}'s profile picture" style="max-width: 100px; border-radius: 4px;" />`);
      } else {
        addChatbotMessage(currentUser.bannerURL
          ? `Your banner:<br><img src="${currentUser.bannerURL}" alt="${username}'s banner" style="max-width: 100px; border-radius: 4px;" />`
          : 'You have no banner set.');
      }
      return;
    }

    // Handle bio query for multiple users
    if (messageLower.includes('bio of')) {
      const targetUsernamesString = message.match(/bio of\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernamesString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify one or more usernames (e.g., "bio of Tandin Karma Lhazen, Sonam Rigsel").');
        return;
      }
      let responseMessages = [];
      for (const targetUsername of targetUsernames) {
        const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!user) {
          responseMessages.push(`User "${targetUsername}" not found.`);
          continue;
        }
        responseMessages.push(`Bio of ${user.username}: ${user.bio || 'No bio available.'}`);
      }
      addChatbotMessage(responseMessages.length ? responseMessages.join('<br><br>') : 'No valid users found.');
      return;
    }

    // Handle followers query for multiple users
    if (messageLower.includes('followers of')) {
      const targetUsernamesString = message.match(/followers of\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernamesString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify one or more usernames (e.g., "followers of Tandin Karma Lhazen or Sonam Rigsel").');
        return;
      }
      let responseMessages = [];
      for (const targetUsername of targetUsernames) {
        const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!user) {
          responseMessages.push(`User "${targetUsername}" not found.`);
          continue;
        }
        const userFriendData = await fetch(`/friends?username=${encodeURIComponent(user.username)}`)
          .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'));
        const followers = userFriendData.followers || [];
        const followerList = followers.length
          ? followers.map(f => `<a href="javascript:void(0)" onclick="loadUserProfileInMiddle('${f}')">${f}</a>`).join(', ')
          : 'No followers.';
        responseMessages.push(`Followers of ${user.username}:<br>${followerList}`);
      }
      addChatbotMessage(responseMessages.length ? responseMessages.join('<br><br>') : 'No valid users found.');
      return;
    }

    // Handle following query for multiple users
    if (messageLower.includes('following of')) {
      const targetUsernamesString = message.match(/following of\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernamesString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify one or more usernames (e.g., "following of Ngawang Tshogyal Phuentshok, Sonam Rigsel").');
        return;
      }
      let responseMessages = [];
      for (const targetUsername of targetUsernames) {
        const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!user) {
          responseMessages.push(`User "${targetUsername}" not found.`);
          continue;
        }
        const userFriendData = await fetch(`/friends?username=${encodeURIComponent(user.username)}`)
          .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'));
        const following = userFriendData.following || [];
        const followingList = following.length
          ? following.map(f => `<a href="javascript:void(0)" onclick="loadUserProfileInMiddle('${f}')">${f}</a>`).join(', ')
          : 'Not following anyone.';
        responseMessages.push(`Following of ${user.username}:<br>${followingList}`);
      }
      addChatbotMessage(responseMessages.length ? responseMessages.join('<br><br>') : 'No valid users found.');
      return;
    }

    // Handle profile picture or banner requests for multiple users
    if (messageLower.includes('profile picture of') || messageLower.includes('banner of')) {
      const targetUsernamesString = message.match(/(?:profile picture of|banner of)\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernamesString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify one or more usernames (e.g., "profile picture of Tandin Karma Lhazen, Sonam Rigsel" or "banner of Ngawang Tshogyal Phuentshok or Sonam Rigsel").');
        return;
      }
      let responseMessages = [];
      for (const targetUsername of targetUsernames) {
        const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!user) {
          responseMessages.push(`User "${targetUsername}" not found.`);
          continue;
        }
        if (messageLower.includes('profile picture')) {
          responseMessages.push(`Profile picture of ${user.username}:<br><img src="${user.photoURL || '/default-profile.jpg'}" alt="${user.username}'s profile picture" style="max-width: 100px; border-radius: 4px;" />`);
        } else {
          responseMessages.push(user.bannerURL
            ? `Banner of ${user.username}:<br><img src="${user.bannerURL}" alt="${user.username}'s banner" style="max-width: 100px; border-radius: 4px;" />`
            : `${user.username} has no banner set.`);
        }
      }
      addChatbotMessage(responseMessages.length ? responseMessages.join('<br><br>') : 'No valid users found.');
      return;
    }

    // Handle user profile details for multiple users
    if (messageLower.includes('profile of') || messageLower.includes('details of')) {
      const targetUsernamesString = message.match(/(?:profile of|details of)\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernamesString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify one or more usernames (e.g., "profile of Tandin Karma Lhazen, Sonam Rigsel").');
        return;
      }
      let responseMessages = [];
      for (const targetUsername of targetUsernames) {
        const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!user) {
          responseMessages.push(`User "${targetUsername}" not found.`);
          continue;
        }
        const userPosts = posts.filter(p => p.username === user.username).length;
        const profileDetails = `
          <strong>Profile of ${user.username}</strong>:<br>
          - Bio: ${user.bio || 'No bio'}<br>
          - Email: ${user.userEmail || 'Not provided'}<br>
          - Jobs: ${user.jobs || 'Not provided'}<br>
          - Education: ${user.education || 'Not provided'}<br>
          - Date of Birth: ${user.dateOfBirth || 'Not provided'}<br>
          - Hobbies: ${user.hobbies || 'Not provided'}<br>
          - Posts: ${userPosts}<br>
          - Followers: ${friendData.followers?.length || 0}<br>
          - Following: ${friendData.following?.length || 0}<br>
          <a href="javascript:void(0)" onclick="loadUserProfileInMiddle('${user.username}')">View full profile</a>
        `;
        responseMessages.push(profileDetails);
      }
      addChatbotMessage(responseMessages.length ? responseMessages.join('<br><br>') : 'No valid users found.');
      return;
    }

    // Handle post previews by multiple users
    if (messageLower.includes('posts by') || messageLower.includes('show posts by')) {
      const targetUsernamesString = message.match(/(?:posts by|show posts by)\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernamesString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify one or more usernames (e.g., "show posts by @Tandin Karma Lhazen, @Sonam Rigsel").');
        return;
      }
      let responseMessages = [];
      for (const targetUsername of targetUsernames) {
        const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
        if (!user) {
          responseMessages.push(`User "${targetUsername}" not found.`);
          continue;
        }
        const userPosts = posts.filter(p => p.username === user.username).reverse().slice(0, 3);
        if (!userPosts.length) {
          responseMessages.push(`${user.username} hasn't posted anything yet.`);
          continue;
        }
        const postPreviews = userPosts.map(post => {
          const postUserPhoto = post.username === username ? localStorage.getItem('userPhoto') : user.photoURL || '/default-profile.jpg';
          return `<div style="margin-bottom: 16px;">
            <strong>${user.username}</strong>: ${post.caption.length > 100 ? post.caption.slice(0, 100) + '...' : post.caption}<br>
            ${post.media ? `<img src="${post.media}" alt="Post media" style="max-width: 100px; border-radius: 4px;" />` : ''}<br>
            <a href="javascript:void(0)" onclick="loadPostInMiddle(${post.id})">View post</a>
          </div>`;
        }).join('');
        responseMessages.push(`Recent posts by ${user.username}:<br>${postPreviews}`);
      }
      addChatbotMessage(responseMessages.length ? responseMessages.join('<br><br>') : 'No valid users found.');
      return;
    }

    // Handle all notifications
    if (messageLower.includes('notification') || messageLower.includes('show notification')) {
      const officialUsernames = ['Gravitas', 'Newton', 'Dino'];
      const friendNotifications = notifications.filter(n => friendData.friends.includes(n.actor));
      const nonFriendNotifications = notifications.filter(n => !friendData.friends.includes(n.actor) && !officialUsernames.includes(n.actor));
      const officialNotifications = notifications.filter(n => officialUsernames.includes(n.actor));
      const currentUserPhoto = localStorage.getItem('userPhoto');

      const renderNotificationRow = (n, type) => {
        const user = users.find(u => u.username === n.actor) || { username: n.actor, photoURL: '/default-profile.jpg' };
        const notificationUserPhoto = n.actor === username ? currentUserPhoto : user.photoURL || '/default-profile.jpg';
        return `
          <tr>
            <td>${type}</td>
            <td>
              <img src="${notificationUserPhoto}" alt="${n.actor}" style="width: 24px; height: 24px; border-radius: 50%; vertical-align: middle;" />
              ${n.actor}
            </td>
            <td>${n.message}${n.postId ? ` <a href="javascript:void(0)" onclick="loadPostInMiddle(${n.postId})">View post</a>` : ''}</td>
            <td>${new Date(n.date).toLocaleString()}</td>
          </tr>
        `;
      };

      const notificationTable = `
        <strong>Your Notifications</strong>:<br>
        <table>
          <tr><th>Type</th><th>Actor</th><th>Message</th><th>Date</th></tr>
          ${friendNotifications.length ? friendNotifications.slice(0, 5).map(n => renderNotificationRow(n, 'Friends')).join('') : '<tr><td colspan="4">No friend notifications.</td></tr>'}
          ${nonFriendNotifications.length ? nonFriendNotifications.slice(0, 5).map(n => renderNotificationRow(n, 'Non-Friends')).join('') : '<tr><td colspan="4">No non-friend notifications.</td></tr>'}
          ${officialNotifications.length ? officialNotifications.slice(0, 5).map(n => renderNotificationRow(n, 'Official')).join('') : '<tr><td colspan="4">No official notifications.</td></tr>'}
        </table>
        <a href="javascript:void(0)" onclick="loadNotifications()">View all notifications</a>
      `;
      addChatbotMessage(notificationTable);
      return;
    }

    // Handle notifications from a specific user
    if (messageLower.includes('notifications from')) {
      const targetUsernameString = message.match(/notifications from\s+(.+)/i)?.[1];
      const targetUsernames = parseUsernames(targetUsernameString);
      if (!targetUsernames.length) {
        addChatbotMessage('Please specify a username (e.g., "notifications from Tandin Karma Lhazen").');
        return;
      }
      if (targetUsernames.length > 1) {
        addChatbotMessage('Please specify only one username for notifications (e.g., "notifications from Tandin Karma Lhazen").');
        return;
      }
      const targetUsername = targetUsernames[0];
      const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
      if (!user) {
        addChatbotMessage(`User "${targetUsername}" not found.`);
        return;
      }
      const userNotifications = notifications.filter(n => n.actor.toLowerCase() === targetUsername.toLowerCase());
      const currentUserPhoto = localStorage.getItem('userPhoto');
      const renderNotificationRow = (n) => {
        const user = users.find(u => u.username === n.actor) || { username: n.actor, photoURL: '/default-profile.jpg' };
        const notificationUserPhoto = n.actor === username ? currentUserPhoto : user.photoURL || '/default-profile.jpg';
        return `
          <tr>
            <td>
              <img src="${notificationUserPhoto}" alt="${n.actor}" style="width: 24px; height: 24px; border-radius: 50%; vertical-align: middle;" />
              ${n.actor}
            </td>
            <td>${n.message}${n.postId ? ` <a href="javascript:void(0)" onclick="loadPostInMiddle(${n.postId})">View post</a>` : ''}</td>
            <td>${new Date(n.date).toLocaleString()}</td>
          </tr>
        `;
      };
      const notificationTable = `
        <strong>Notifications from ${targetUsername}</strong>:<br>
        <table>
          <tr><th>Actor</th><th>Message</th><th>Date</th></tr>
          ${userNotifications.length ? userNotifications.slice(0, 5).map(n => renderNotificationRow(n)).join('') : '<tr><td colspan="3">No notifications from this user.</td></tr>'}
        </table>
      `;
      addChatbotMessage(notificationTable);
      return;
    }

    // Handle post creation
    if (messageLower.includes('post (')) {
      const postContentMatch = message.match(/post \((.+?)\)/i);
      const postContent = postContentMatch?.[1];
      if (!postContent) {
        addChatbotMessage('Please provide a caption (e.g., "post (Your message)").');
        return;
      }
      const formData = new FormData();
      formData.append('username', username);
      formData.append('caption', postContent);
      if (uploadedImage) {
        formData.append('media', uploadedImage);
      }
      formData.append('tag', ''); // Default empty tag; extend if needed
      formData.append('date', new Date().toISOString());

      const response = await fetch('/posts', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        addChatbotMessage('Failed to create post. Please try again.');
        return;
      }
      const newPost = await response.json();
      const postMedia = newPost.media ? `<img src="${newPost.media}" alt="Posted image" style="max-width: 100px; border-radius: 4px;" /><br>` : '';
      addChatbotMessage(`Posted successfully!<br>
        <strong>${username}</strong>: ${postContent}<br>
        ${postMedia}
        <a href="javascript:void(0)" onclick="loadPostInMiddle(${newPost.id})">View post</a>`);
      if (typeof renderPost === 'function') {
        const postContainer = document.getElementById('post-container');
        if (postContainer) {
          const postElement = renderPost(newPost);
          postContainer.prepend(postElement);
        }
      }
      uploadedImage = null; // Reset uploaded image
      document.getElementById('chatbot-cancel-image').style.display = 'none';
      return;
    }

    // Handle get post image
    if (messageLower.includes('give me the image of')) {
      const postUrlMatch = message.match(/give me the image of \((.+?)\)/i);
      const postUrl = postUrlMatch?.[1];
      if (!postUrl) {
        addChatbotMessage('Please provide a post URL (e.g., "give me the image of (https://thegravitas.glitch.me/home.html?post=123)").');
        return;
      }
      const postIdMatch = postUrl.match(/post=(\d+)/);
      const postId = postIdMatch?.[1];
      if (!postId) {
        addChatbotMessage('Invalid post URL. Please provide a valid URL (e.g., "https://thegravitas.glitch.me/home.html?post=123").');
        return;
      }
      const post = posts.find(p => p.id === parseInt(postId));
      if (!post) {
        addChatbotMessage('Post not found.');
        return;
      }
      if (!post.media) {
        addChatbotMessage('This post has no image.');
        return;
      }
      addChatbotMessage(`Image from post ${postId}:<br><img src="${post.media}" alt="Post image" style="max-width: 100px; border-radius: 4px;" />`);
      return;
    }

    // Default response for unrecognized commands
    addChatbotMessage(`Sorry, you may have misspelled the command, or the data you provided is not in our database. Please type "help" to see available commands.`);
  } catch (error) {
    console.error('Error handling chatbot input:', error);
    addChatbotMessage('An error occurred. Please try again later.');
  }
};

// Event listeners for chatbot and image upload
document.addEventListener('DOMContentLoaded', () => {
  // Display initial greeting
  addChatbotMessage('Hi, I am Newton, virtual assistant of The Gravitas');

  const chatbotSubmitBtn = document.getElementById('chatbot-submit-btn');
  const chatbotInput = document.getElementById('chatbot-input');
  const imageUploadInput = document.getElementById('chatbot-image-upload');

  if (chatbotSubmitBtn && chatbotInput) {
    chatbotSubmitBtn.addEventListener('click', handleChatbotInput);
    chatbotInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleChatbotInput();
      }
    });
  }

  if (imageUploadInput) {
    imageUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        uploadedImage = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          addChatbotMessage(`Image uploaded! Preview:<br><img src="${event.target.result}" alt="Uploaded image preview" style="max-width: 100px; border-radius: 4px;" /><br>Create a post with: "post (Your caption)"`);
          document.getElementById('chatbot-cancel-image').style.display = 'inline-block';
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
});
const deletePost = async postId => {
  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const username = localStorage.getItem('username');
    const res = await fetch(`/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete post');

    // Close any open modals
    document.getElementById('post-view-overlay').className = 'post-overlay';
    document.getElementById('comment-overlay').className = 'comment-overlay';

    // Reload posts or profile
    const activeNav = document.querySelector('.nav-item.active');
    const currentPage = activeNav.getAttribute('onclick').match(/'([^']+)'/)[1];
    loadContent(currentPage, activeNav);
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};

// New JavaScript function to toggle more actions menu
const toggleMoreActions = postId => {
  const menu = document.getElementById(`more-actions-${postId}`);
  menu.style.display = menu.style.display === 'none' ? 'flex' : 'none';
};

// Close more actions menu when clicking outside
document.addEventListener('click', e => {
  const moreMenus = document.querySelectorAll('.more-actions-menu');
  moreMenus.forEach(menu => {
    if (!menu.contains(e.target) && !e.target.closest('.more-button')) {
      menu.style.display = 'none';
    }
  });
});

// Open post view modal
const loadPostInMiddle = async (postId, event) => {
  if (event) event.stopPropagation(); // Prevent parent event propagation
  try {
    const [posts, users, friendData] = await Promise.all([
      fetch('/posts').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch posts')),
      fetch('/users').then(res => res.ok ? res.json() : Promise.reject('Failed to fetch users')),
      fetch(`/friends?username=${encodeURIComponent(localStorage.getItem('username'))}`).then(res => res.ok ? res.json() : Promise.reject('Failed to fetch friends'))
    ]);

    const post = posts.find(p => p.id === postId);
    const username = localStorage.getItem('username');
    const userPhoto = localStorage.getItem('userPhoto');

    if (!post) {
      document.getElementById('external-content').innerHTML = '<p class="comment-empty">Post not found.</p>';
      return;
    }

    const user = users.find(u => u.username === post.username) || { username: post.username, photoURL: '/default-profile.jpg' };
    const postUserPhoto = post.username === username ? userPhoto : user.photoURL || '/default-profile.jpg';

    const feeds = document.getElementById('feeds');
    const external = document.getElementById('external-content');
    feeds.style.display = 'none';
    external.style.display = 'block';

    external.innerHTML = `
      <div class="header-container" style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <button class="btn btn-back" onclick="loadContent('home', document.querySelector('.nav-item.active'))" style="display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background-color: #f5f8fa; border: none; transition: background-color 0.2s;">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="#000000" stroke="#000000" stroke-width="2.5">
            <path d="M20 11H7.414l5.293-5.293a1 1 0 0 0-1.414-1.414l-7 7a1 1 0 0 0 0 1.414l7 7a1 1 0 0 0 1.414-1.414L7.414 13H20a1 1 0 0 0 0-2z"/>
          </svg>
        </button>
        <h5 class="post-header" style="font-size: 18px; font-weight: 700; color: #14171a; margin: 0;">Post</h5>
      </div>
      <div id="single-post-content">${renderPost(post, user, { ...friendData, posts, users }, username, postUserPhoto)}</div>
      <div class="comment-section" style="margin-top: 16px;">
        <h6 style="font-size: 16px; font-weight: 600; color: #5a6b76; margin-bottom: 12px;">Comments</h6>
        <div class="comment-input-container" style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <img src="${userPhoto || '/default-profile.jpg'}" alt="User Avatar" style="width: 40px; height: 40px; border-radius: 50%;" />
          <textarea id="post-comment-input" class="form-control" placeholder="Write a comment..." maxlength="280" style="resize: vertical; min-height: 60px; flex: 1;" aria-label="Write a comment"></textarea>
          <button id="post-comment-submit-btn" class="btn btn-primary btn-sm" style="height: fit-content;">Comment</button>
        </div>
        <div id="post-comment-list"></div>
      </div>`;

    const commentList = document.getElementById('post-comment-list');
    commentList.innerHTML = post.comments.length ?
      post.comments.map(comment => {
        const commentUser = users.find(u => u.username === comment.username) || { username: comment.username, photoURL: '/default-profile.jpg' };
        const commentUserPhoto = comment.username === username ? userPhoto : commentUser.photoURL || '/default-profile.jpg';
        const isOwnComment = comment.username === username;
        const isLiked = comment.likedBy?.includes(username);
        const isReported = comment.reportedBy?.includes(username);

        const repliesContent = `
          <div class="replies-container" id="replies-${comment.id}" style="display: none; margin-left: 48px;">
            ${comment.replies?.length ? comment.replies.map(reply => {
              const replyUser = users.find(u => u.username === reply.username) || { username: reply.username, photoURL: '/default-profile.jpg' };
              const replyUserPhoto = reply.username === username ? userPhoto : replyUser.photoURL || '/default-profile.jpg';
              const isOwnReply = reply.username === username;
              const isReplyLiked = reply.likedBy?.includes(username);
              const isReplyReported = reply.reportedBy?.includes(username);
              return `
                <div class="comment reply" id="reply-${reply.id}">
                  <img src="${replyUserPhoto}" alt="${reply.username}" style="width: 32px; height: 32px; border-radius: 50%;" />
                  <div class="comment-content">
                    <p><strong>${reply.username}</strong> ${reply.text}</p>
                    <div class="comment-actions">
                      <button class="action-button comment-like-button ${isReplyLiked ? 'liked' : ''}" onclick="likeReply(${post.id}, '${comment.id}', '${reply.id}'); event.stopPropagation();" aria-label="Like reply">
                        <i class="bi bi-heart${isReplyLiked ? '-fill' : ''}"></i> <span id="reply-like-count-${reply.id}">${reply.likes || 0}</span>
                      </button>
                      <div class="more-menu">
                        <button class="action-button more-button" onclick="toggleMoreMenu('reply-${reply.id}'); event.stopPropagation();" aria-label="More options">
                          <i class="bi bi-three-dots"></i>
                        </button>
                        <div class="more-menu-content" id="more-menu-reply-${reply.id}">
                          ${isOwnReply ? `
                            <button class="more-menu-item" onclick="deleteReply(${post.id}, '${comment.id}', '${reply.id}'); event.stopPropagation();">Delete</button>
                          ` : ''}
                          <button class="more-menu-item" onclick="reportReply(${post.id}, '${comment.id}', '${reply.id}', '${username}'); event.stopPropagation();" ${isReplyReported ? 'disabled' : ''}>
                            ${isReplyReported ? 'Reported' : 'Report'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>`;
            }).join('') : ''}
          </div>`;

        return `
          <div class="comment" id="comment-${comment.id}">
            <img src="${commentUserPhoto}" alt="${comment.username}" style="width: 40px; height: 40px; border-radius: 50%;" />
            <div class="comment-content">
              <p><strong>${comment.username}</strong> ${comment.text}</p>
              <div class="comment-actions">
                <button class="action-button comment-like-button ${isLiked ? 'liked' : ''}" onclick="likeComment(${post.id}, '${comment.id}'); event.stopPropagation();" aria-label="Like comment">
                  <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i> <span id="comment-like-count-${comment.id}">${comment.likes || 0}</span>
                </button>
                <button class="action-button reply-button" onclick="openReplyInput('${comment.id}', ${post.id}); event.stopPropagation();" aria-label="Reply to comment">
                  <i class="bi bi-reply"></i> Reply
                </button>
                <div class="more-menu">
                  <button class="action-button more-button" onclick="toggleMoreMenu('${comment.id}'); event.stopPropagation();" aria-label="More options">
                    <i class="bi bi-three-dots"></i>
                  </button>
                  <div class="more-menu-content" id="more-menu-${comment.id}">
                    ${isOwnComment ? `
                      <button class="more-menu-item" onclick="deleteComment(${post.id}, '${comment.id}'); event.stopPropagation();">Delete</button>
                    ` : ''}
                    <button class="more-menu-item" onclick="reportComment(${post.id}, '${comment.id}', '${username}'); event.stopPropagation();" ${isReported ? 'disabled' : ''}>
                      ${isReported ? 'Reported' : 'Report'}
                    </button>
                  </div>
                </div>
              </div>
              ${repliesContent}
              <div class="reply-input-container" id="reply-input-${comment.id}" style="display: none; margin-left: 48px;">
                <textarea class="form-control reply-input" id="reply-text-${comment.id}" placeholder="Write a reply..." maxlength="280" aria-label="Reply to comment by ${comment.username}"></textarea>
                <button class="btn btn-primary btn-sm" onclick="submitReply(${post.id}, '${comment.id}');">Reply</button>
              </div>
            </div>
          </div>`;
      }).join('') :
      '<p class="comment-empty" style="font-size: 14px; color: #657786;">Be the first one to comment</p>';

    document.getElementById('post-comment-submit-btn').addEventListener('click', async () => {
      const commentInput = document.getElementById('post-comment-input');
      const commentText = commentInput.value.trim();
      if (!commentText) return;

      try {
        const res = await fetch(`/posts/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, text: commentText })
        });
        if (!res.ok) throw new Error('Failed to post comment');
        commentInput.value = '';
        loadPostInMiddle(postId);
        loadPosts();
      } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment. Please try again.');
      }
    });

    document.getElementById('post-comment-input').addEventListener('keydown', async (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const commentText = event.target.value.trim();
        if (!commentText) return;

        try {
          const res = await fetch(`/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, text: commentText })
          });
          if (!res.ok) throw new Error('Failed to post comment');
          event.target.value = '';
          loadPostInMiddle(postId);
          loadPosts();
        } catch (error) {
          console.error('Error posting comment:', error);
          alert('Failed to post comment. Please try again.');
        }
      }
    });
  } catch (error) {
    console.error('Error loading post:', error);
    document.getElementById('external-content').innerHTML = '<p class="comment-empty" style="font-size: 14px; color: #657786;">Error loading post. Please try again later.</p>';
  }
};
// Like a post
const likePost = async postId => {
  try {
    const username = localStorage.getItem('username');
    const likeButton = document.querySelector(`#post-${postId} .like-button`);
    const isLiked = likeButton.classList.contains('liked');
    const res = await fetch(`/posts/${postId}/${isLiked ? 'unlike' : 'like'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.error || 'Failed to process like/unlike');

    if (responseData.deleted) {
      // Reload home feed if post is deleted
      const activeNav = document.querySelector('.nav-item.active');
      const currentPage = activeNav.getAttribute('onclick').match(/'([^']+)'/)[1];
      loadContent(currentPage, activeNav);
      alert('The post has been deleted due to excessive reports.');
      return;
    }

    const likeCountSpan = document.getElementById(`like-count-${postId}`);
    let likeCount = parseInt(likeCountSpan.textContent);
    likeButton.classList.toggle('liked');
    likeButton.querySelector('i').className = `bi bi-heart${isLiked ? '' : '-fill'}`;
    likeCountSpan.textContent = isLiked ? likeCount - 1 : likeCount + 1;
    loadPosts();
    // Refresh the post in middle container if it's being viewed
    if (document.getElementById('external-content').style.display === 'block' && document.querySelector(`#post-${postId}`)) {
      loadPostInMiddle(postId);
    }
  } catch (error) {
    console.error('Error processing like/unlike:', error);
    alert(`Failed to ${error.message.includes('unlike') ? 'unlike' : 'like'} post. Please try again.`);
  }
};

// Unlike a post (already included in likePost, but ensure consistency)
const unlikePost = async postId => {
  try {
    const username = localStorage.getItem('username');
    const likeButton = document.querySelector(`#post-${postId} .like-button`);
    const isLiked = likeButton.classList.contains('liked');
    if (!isLiked) return;

    const res = await fetch(`/posts/${postId}/unlike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    const responseData = await res.json();
    if (!res.ok) throw new Error(responseData.error || 'Failed to process unlike');

    if (responseData.deleted) {
      document.getElementById('post-view-overlay').className = 'post-overlay';
      document.getElementById('comment-overlay').className = 'comment-overlay';
      const activeNav = document.querySelector('.nav-item.active');
      const currentPage = activeNav.getAttribute('onclick').match(/'([^']+)'/)[1];
      loadContent(currentPage, activeNav);
      alert('The post has been deleted due to excessive reports.');
      return;
    }

    const likeCountSpan = document.getElementById(`like-count-${postId}`);
    let likeCount = parseInt(likeCountSpan.textContent);
    likeButton.classList.remove('liked');
    likeButton.querySelector('i').className = `bi bi-heart`;
    likeCountSpan.textContent = likeCount - 1;
    loadPosts();
  } catch (error) {
    console.error('Error processing unlike:', error);
    alert('Failed to unlike post. Please try again.');
  }
};
const bookmarkPost = async postId => {
  try {
    const username = localStorage.getItem('username');
    const bookmarkButton = document.querySelector(`#post-${postId} .bookmark-button`);
    const bookmarkCountSpan = document.getElementById(`bookmark-count-${postId}`);
    const isBookmarked = bookmarkButton.classList.contains('bookmarked');
    const res = await fetch(`/posts/${postId}/${isBookmarked ? 'unbookmark' : 'bookmark'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to process bookmark/unbookmark');

    bookmarkButton.classList.toggle('bookmarked');
    bookmarkButton.querySelector('i').className = `bi bi-bookmark${isBookmarked ? '' : '-fill'}`;
    let bookmarkCount = parseInt(bookmarkCountSpan.textContent);
    bookmarkCountSpan.textContent = isBookmarked ? bookmarkCount - 1 : bookmarkCount + 1;
    loadPosts();
  } catch (error) {
    console.error('Error processing bookmark/unbookmark:', error);
    alert(`Failed to ${error.message.includes('unbookmark') ? 'unbookmark' : 'bookmark'} post. Please try again.`);
  }
};
// Open media modal
const openMediaModal = mediaUrl => {
  const modal = document.createElement('div');
  modal.className = 'media-modal active';
  modal.innerHTML = `
    <button class="media-modal-close" onclick="this.parentElement.remove()" aria-label="Close media">
      <i class="bi bi-x"></i>
    </button>
    <img src="${mediaUrl}" class="media-modal-content" alt="Media" />`;
  document.body.appendChild(modal);
};

// Open post modal
const openTweetModal = async () => {
  document.getElementById('post-overlay').className = 'post-overlay active';
  document.getElementById('caption').focus();
  document.getElementById('postForm').reset();
  document.getElementById('tag-select').value = '';
  document.getElementById('custom-tag').classList.remove('active');
  document.getElementById('custom-tag').value = '';
  document.getElementById('image-preview').style.display = 'none';
};
// Close post modal
const closeTweetModal = event => {
  if (event.target === document.getElementById('post-overlay')) {
    document.getElementById('post-overlay').className = 'post-overlay';
    document.getElementById('postForm').reset();
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('image-url-preview').style.display = 'none';
  }
};

// Submit post
document.getElementById('postForm').addEventListener('submit', async e => {
  e.preventDefault();
  const caption = document.getElementById('caption').value.trim();
  const tagSelect = document.getElementById('tag-select').value;
  const customTag = document.getElementById('custom-tag').value.trim();
  const tag = tagSelect === 'custom' ? customTag : tagSelect;
  const mediaUpload = document.getElementById('media-upload');

  if (!caption) return alert('Caption is required.');

  const formData = new FormData();
  formData.append('username', localStorage.getItem('username'));
  formData.append('caption', caption);
  if (tag) formData.append('tag', tag);
  if (mediaUpload.files[0]) formData.append('media', mediaUpload.files[0]);

  try {
    const res = await fetch('/posts', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to create post');
    document.getElementById('postForm').reset();
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('post-overlay').className = 'post-overlay';
    loadPosts();
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post. Please try again.');
  }
});
// Toggle user menu
const toggleUserMenu = () => {
  document.getElementById('userMenu').classList.toggle('active');
};

// Logout
const logout = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('userPhoto');
  window.location.href = 'index.html';
};

// Delete a notification
const deleteNotification = async notificationId => {
  try {
    const username = localStorage.getItem('username');
    const res = await fetch(`/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw new Error('Failed to delete notification');
    loadNotifications();
  } catch (error) {
    console.error('Error deleting notification:', error);
    alert('Failed to delete notification. Please try again.');
  }
};
//event lister
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('edit-profile-overlay').addEventListener('click', closeEditProfileModal);
  document.querySelector('.edit-profile-modal-close')?.addEventListener('click', closeEditProfileModal);
  document.getElementById('comment-overlay').addEventListener('click', closeCommentModal);
  document.querySelector('.comment-modal-close')?.addEventListener('click', closeCommentModal);
  document.getElementById('post-overlay').addEventListener('click', closeTweetModal);
  document.getElementById('tag-select').addEventListener('change', toggleCustomTagInput);
  document.getElementById('edit-profile-overlay').addEventListener('click', closeEditProfileModal);
document.querySelector('.edit-profile-modal-close')?.addEventListener('click', closeEditProfileModal);

  const mediaUpload = document.getElementById('media-upload');
  const imagePreview = document.getElementById('image-preview');

  mediaUpload.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      imagePreview.style.display = 'none';
    }
  });

  const commentSubmitBtn = document.getElementById('post-comment-submit-btn');
  if (commentSubmitBtn) {
    commentSubmitBtn.addEventListener('click', async () => {
      const commentInput = document.getElementById('post-comment-input');
      const commentText = commentInput.value.trim();
      if (!commentText) return;

      try {
        const postId = document.querySelector('#post-modal-content .card').id.replace('modal-post-', '');
        const username = localStorage.getItem('username');
        const res = await fetch(`/posts/${postId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, text: commentText })
        });
        if (!res.ok) throw new Error('Failed to post comment');
        commentInput.value = '';
        loadPosts();
      } catch (error) {
        console.error('Error posting comment:', error);
        alert('Failed to post comment. Please try again.');
      }
    });
  }

  const commentInput = document.getElementById('comment-input-modal');
  if (commentInput) {
    commentInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const commentText = commentInput.value.trim();
        if (!commentText || !currentPostId) return;

        try {
          const username = localStorage.getItem('username');
          const res = await fetch(`/posts/${currentPostId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, text: commentText })
          });
          if (!res.ok) throw new Error('Failed to post comment');
          commentInput.value = '';
          openCommentModal(currentPostId);
          loadPosts();
        } catch (error) {
          console.error('Error posting comment:', error);
          alert('Failed to post comment. Please try again.');
        }
      }
    });
  }

  const postCommentInput = document.getElementById('post-comment-input');
  if (postCommentInput) {
    postCommentInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const commentText = postCommentInput.value.trim();
        if (!commentText) return;

        try {
          const postId = document.querySelector('#post-modal-content .card').id.replace('modal-post-', '');
          const username = localStorage.getItem('username');
          const res = await fetch(`/posts/${postId}/comment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, text: commentText })
          });
          if (!res.ok) throw new Error('Failed to post comment');
          postCommentInput.value = '';
          loadPosts();
        } catch (error) {
          console.error('Error posting comment:', error);
          alert('Failed to post comment. Please try again.');
        }
      }
    });
  }

  const middleSearchInput = document.querySelector('.middle-search');
  if (middleSearchInput) {
    middleSearchInput.addEventListener('input', e => searchGraVitas(e.target.value.trim().toLowerCase()));
  }
});
 // Add Enter key listener for reply inputs
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey && event.target.classList.contains('reply-input')) {
      event.preventDefault();
      const commentId = event.target.id.replace('reply-text-', '');
      const postId = currentPostId || document.querySelector('#post-modal-content .card')?.id.replace('modal-post-', '');
      if (postId && commentId) {
        submitReply(postId, commentId);
      }
    }
  });

// Handle window resize for responsive design
window.addEventListener('resize', () => {
  const mobileMenu = document.getElementById('mobile-menu');
  const middleSearch = document.querySelector('.middle-search-container');
  if (window.innerWidth > 768) {
    mobileMenu.classList.remove('active');
    middleSearch.style.display = 'block';
  }
});

// Prevent default form submissions for any unhandled forms
document.querySelectorAll('form').forEach(form => {
  form.addEventListener('submit', e => {
    if (!form.id || form.id === 'postForm' || form.id === 'editProfileForm') return;
    e.preventDefault();
  });
});
