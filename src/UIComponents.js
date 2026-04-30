// src/UIComponents.js
const UIComponents = {
  escape: (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
  },
  
  render: (template, data) => {
    return template.replace(/\${\s*(\w+)\s*}/g, (match, key) => {
      const value = data[key] !== undefined ? data[key] : "";
      // Use the escape helper here!
      return UIComponents.escape(value);
    });
  }
};

if (typeof module !== 'undefined') { module.exports = { UIComponents }; }
