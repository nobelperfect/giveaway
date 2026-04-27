function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Finance Dashboard')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
