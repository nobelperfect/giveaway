
// /**
//  * src/UIComponents.js
//  * Renders a component by injecting data into a string-based template.
//  */
// function renderComponent(template, data) {
//   // Use a simple regex to replace ${key} with data[key]
//   return template.replace(/\${(\w+)}/g, (match, key) => {
//     return data[key] !== undefined ? data[key] : match;
//   });
// }

// /**
//  * Example: Building a Recipient Card
//  */
// function createRecipientCard(recipientData, cardTemplate) {
//   // 1. Prepare the data (Translation & Formatting)
//   const viewData = {
//     id: recipientData.id,
//     name: recipientData.name,
//     status: recipientData.status,
//     status_translated: _t(recipientData.status), // From your i18n logic
//     amount_formatted: formatCurrency(recipientData.amount), // From your Currency logic
//     purpose: _t(recipientData.purpose),
//     btn_text: _t('confirm_dispatch')
//   };

//   // 2. Return the "Bubbly" HTML string
//   return renderComponent(cardTemplate, viewData);
// }

// /**
//  * src/UIComponents.js
//  */

const UIComponents = {

  render: (template, data) => {
    return template.replace(/\${\s*(\w+)\s*}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : "";
    });
  }
};

// Export for Jest
if (typeof module !== 'undefined') {
  module.exports = { UIComponents };
}
