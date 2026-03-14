// Educational demonstration only — do not use on live platforms without explicit permission.
//
// This file is a STATIC REFERENCE for understanding dynamic attribute usage in modern single-page apps.
// It contains no automation logic, no navigation code, and no executable functions.
//
// Selectors are derived from publicly observable data-e2e attributes and ARIA roles used by TikTok's web interface.
// These are illustrative and may change without notice. Always verify with current dev tools / codegen.

export const TikTokSelectors = {
  // Profile / User page elements
  userTitle: 'h1[data-e2e="user-title"]',
  userName: 'h2[data-e2e="user-name"]',
  userDescription: 'h2[data-e2e="user-desc"]',
  followersCount: 'strong[data-e2e="followers-count"]',
  followingCount: 'strong[data-e2e="following-count"]',
  likesCount: 'strong[data-e2e="likes-count"]',
  followButton: 'button[data-e2e="follow-button"]',
  unfollowButton: 'button[data-e2e="unfollow-button"]',

  // Video feed elements
  videoCardInFeed: 'div[data-e2e="recommend-list-item-container"]',
  videoItem: 'div[data-e2e="user-post-item"]',
  videoPlayer: 'video',
  videoLink: 'a[data-e2e="video-author-avatar"]',

  // Engagement actions
  likeButton: 'button[data-e2e="like-button"]',
  unlikeButton: 'button[data-e2e="unlike-button"]',
  commentButton: 'button[data-e2e="comment-button"]',
  shareButton: 'button[data-e2e="share-button"]',
  bookmarkButton: 'button[data-e2e="bookmark-button"]',

  // Comments section
  commentsContainer: 'div[data-e2e="comment-item"]',
  commentInput: 'div[contenteditable="true"][data-e2e*="comment"]',
  commentSubmitButton: 'button[data-e2e="comment-submit"]',
  commentReplyInput: 'div[contenteditable="true"][data-e2e*="reply"]',

  // Upload / Creator tools
  uploadTrigger: 'div[data-e2e="create-icon"]',
  fileInputHidden: 'input[type="file"][accept="video/*"]',
  captionEditor: 'div[data-e2e="caption-input"]',
  captionTextarea: 'textarea[data-e2e="caption-textarea"]',
  postButton: 'button[data-e2e="post_video_button"]',

  // Navigation
  homeTab: 'a[data-e2e="nav-home"]',
  discoverTab: 'a[data-e2e="nav-discover"]',
  inboxTab: 'a[data-e2e="nav-inbox"]',
  profileTab: 'a[data-e2e="nav-profile"]',
  searchInput: 'input[data-e2e="search-user-input"]',

  // Authentication
  loginButton: 'button[data-e2e="top-login-button"]',
  loginModal: 'div[data-e2e="modal-container"]',
  emailLoginTab: 'a[data-e2e="login-email"]',
  usernameInput: 'input[placeholder="Phone / Email / Username"]',
  passwordInput: 'input[placeholder="Password"]',
  submitLoginButton: 'button[type="submit"]',
  signupLink: 'a[data-e2e="open-signup-dialog"]',

  // Live streaming
  liveStreamContainer: 'div[data-e2e="live-room-container"]',
  liveChatInput: 'textarea[data-e2e="chat-input"]',
  liveChatSend: 'button[data-e2e="chat-send"]',

  // Messages / DMs
  messageInput: 'textarea[data-e2e="message-input"]',
  sendButton: 'button[data-e2e="message-send"]',
  conversationItem: 'div[data-e2e="chat-item"]',

  // Notifications
  notificationBadge: 'span[data-e2e="notification-badge"]',
  notificationItem: 'div[data-e2e="notification-item"]',

  // Settings
  settingsMenu: 'div[data-e2e="settings-menu"]',
  privacySettings: 'a[data-e2e="privacy-settings"]',
  accountSettings: 'a[data-e2e="account-settings"]'
} as const;

export type TikTokSelectorKey = keyof typeof TikTokSelectors;
