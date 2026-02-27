// Educational demonstration only — do not use on live platforms without explicit permission.

export const tiktokSelectors = {
  userTitle: 'h1[data-e2e="user-title"]',
  followersCount: 'strong[data-e2e="followers-count"]',
  followButton: 'button[data-e2e="follow-button"]',
  likeButton: 'button[data-e2e="like-button"]',
  commentInput: 'div[contenteditable="true"][data-e2e*="comment"]',
  uploadTrigger: 'div[data-e2e="create-icon"]',
  fileInputHidden: 'input[type="file"][accept="video/*"]',
  captionEditor: 'div[data-e2e="caption-input"]',
  postButton: 'button[data-e2e="post_video_button"]',
  videoCardInFeed: 'div[data-e2e="recommend-list-item-container"]',
};
