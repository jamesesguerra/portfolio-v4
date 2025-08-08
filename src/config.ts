import type { ThemeConfig } from './types'

export const themeConfig: ThemeConfig = {
  // SITE INFO ///////////////////////////////////////////////////////////////////////////////////////////
  site: {
    website: 'https://james-esg.com', // Site domain
    title: 'James Esguerra', // Site title
    author: 'James Esguerra', // Author name
    description: 'Software engineer building scalable and maintainable solutions. Focused on continuous learning and practical problem-solving. Enjoys hands-on technology projects in a homelab.', // Site description
    language: 'en-US' // Default language
  },

  // GENERAL SETTINGS ////////////////////////////////////////////////////////////////////////////////////
  general: {
    contentWidth: '35rem', // Content area width
    centeredLayout: true, // Use centered layout (false for left-aligned)
    themeToggle: true, // Show theme toggle button (uses system theme by default)
    postListDottedDivider: false, // Show dotted divider in post list
    footer: false, // Show footer
    fadeAnimation: true // Enable fade animations
  },

  // DATE SETTINGS ///////////////////////////////////////////////////////////////////////////////////////
  date: {
    dateFormat: 'MM-DD-YYYY', // Date format: YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY, MONTH DAY YYYY, DAY MONTH YYYY
    dateSeparator: '.', // Date separator: . - / (except for MONTH DAY YYYY and DAY MONTH YYYY)
    dateOnRight: true // Date position in post list (true for right, false for left)
  },

  // POST SETTINGS ///////////////////////////////////////////////////////////////////////////////////////
  post: {
    readingTime: true, // Show reading time in posts
    toc: true, // Show table of contents (when there is enough page width)
    imageViewer: true, // Enable image viewer
    copyCode: true, // Enable copy button in code blocks
    linkCard: true // Enable link card
  }
}
