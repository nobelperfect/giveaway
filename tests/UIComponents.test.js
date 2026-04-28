const { UIComponents } = require('../src/UIComponents');

describe('UI Component Template Engine', () => {
  const mockTemplate = '<div class="${status}">Hello ${ name }</div>';

  test('should correctly inject data into placeholders', () => {
    const data = { name: 'Abebe', status: 'active' };
    const result = UIComponents.render(mockTemplate, data);
    
    expect(result).toBe('<div class="active">Hello Abebe</div>');
  });

  test('should handle missing data by returning an empty string', () => {
    const data = { status: 'active' }; // 'name' is missing
    const result = UIComponents.render(mockTemplate, data);
    
    expect(result).toBe('<div class="active">Hello </div>');
  });

  test('should be case sensitive for keys', () => {
    const data = { Name: 'Abebe' }; // Template expects 'name'
    const result = UIComponents.render(mockTemplate, data);
    
    expect(result).not.toContain('Abebe');
  });
});
