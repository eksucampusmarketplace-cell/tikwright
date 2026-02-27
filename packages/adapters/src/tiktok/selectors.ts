// Educational demonstration only — do not use on live platforms without explicit permission.

export const tiktokSelectors = {
  // Profile / User
  userTitle: 'h1[data-e2e="user-title"]',
  userSubtitle: 'h2[data-e2e="user-subtitle"]',
  followersCount: 'strong[data-e2e="followers-count"]',
  followingCount: 'strong[data-e2e="following-count"]',
  likesCount: 'strong[data-e2e="likes-count"]',

  // Follow action
  followButton: 'button[data-e2e="follow-button"]',
  followingButton: 'button:has-text("Following")',

  // Like / Engagement on video
  likeButton: 'button[data-e2e="like-button"]',
  likeCount: 'strong[data-e2e="like-count"]',
  commentButton: 'button[data-e2e="comment-button"]',
  commentInput: 'div[contenteditable="true"][data-e2e*="comment-input"]',
  postCommentButton: 'button:has-text("Post")',

  // Upload / Post flow (requires login)
  uploadTrigger: 'div[data-e2e="create-icon"]',
  hiddenFileInput: 'input[type="file"][accept="video/*"]',
  captionEditor: 'div[data-e2e="caption-input"]',
  postButton: 'button[data-e2e="post_video_button"]',
  postButtonDisabled: 'button[data-e2e="post_video_button"][aria-disabled="true"]',

  // Feed / Discovery
  videoCard: 'div[data-e2e="recommend-list-item-container"]',
  videoDesc: 'div[data-e2e="video-desc"]',
  videoAuthor: 'h3[data-e2e="video-author-uniqueid"]',

  // Common modals / challenges
  loginModal: 'div[data-e2e="login-modal"]',
  captchaContainer: 'div[data-e2e*="captcha"]'
};
