/**
 * Text formatting utilities for 4chan-style posts
 * Handles greentext, quote links, and other formatting
 */

/**
 * Format post text with greentext and quote links
 * @param text - Raw post text
 * @param threadId - Current thread ID for quote link generation
 * @returns HTML-formatted text
 */
export function formatPostText(text: string, _threadId?: string): string {
  if (!text) return '';

  // Escape HTML to prevent XSS
  const formatted = escapeHtml(text);

  // Split into lines for processing
  const lines = formatted.split('\n');
  const processedLines = lines.map(line => {
    // Greentext: lines starting with >
    if (line.trim().startsWith('&gt;') && !line.trim().startsWith('&gt;&gt;')) {
      return `<span class="greentext">${line}</span>`;
    }
    
    // Quote links: >>12345
    if (line.includes('&gt;&gt;')) {
      return line.replace(
        /&gt;&gt;(\d+)/g,
        '<a href="#post-$1" class="quotelink" onclick="highlightPost($1)">&gt;&gt;$1</a>'
      );
    }

    return line;
  });

  return processedLines.join('\n');
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Extract post numbers referenced in text (for quoting)
 */
export function extractQuotedPosts(text: string): number[] {
  const matches = text.matchAll(/>>(\d+)/g);
  return Array.from(matches, m => parseInt(m[1]));
}

/**
 * Format a post number for display
 */
export function formatPostNumber(num: number): string {
  return `No. ${num}`;
}

/**
 * Client-side script for quote link highlighting
 * This should be included in the page
 */
export const quoteScriptContent = `
window.highlightPost = function(postNum) {
  // Remove previous highlights
  document.querySelectorAll('.post-highlight').forEach(el => {
    el.classList.remove('post-highlight');
  });
  
  // Highlight the referenced post
  const post = document.getElementById('post-' + postNum);
  if (post) {
    post.classList.add('post-highlight');
    post.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      post.classList.remove('post-highlight');
    }, 3000);
  }
};
`;

