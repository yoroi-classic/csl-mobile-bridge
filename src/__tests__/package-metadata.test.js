const fs = require('fs');
const path = require('path');

const packageJson = require('../../package.json');

const readme = fs.readFileSync(path.join(__dirname, '../../README.md'), 'utf8');

describe('package deprecation metadata', () => {
  it('keeps the existing bridge package entrypoints stable while deprecated', () => {
    expect(packageJson.name).toBe('@yoroi-classic/csl-mobile-bridge');
    expect(packageJson.private).toBe(true);
    expect(packageJson.description).toMatch(/Deprecated React Native bindings/);

    expect(packageJson.main).toBe('lib/commonjs/index');
    expect(packageJson.module).toBe('lib/module/index');
    expect(packageJson.types).toBe('lib/typescript/src/index.d.ts');
    expect(packageJson['react-native']).toBe('src/index');
    expect(packageJson.source).toBe('src/index');
  });

  it('documents verified CML migration packages without declaring speculative dependencies', () => {
    const declaredDependencies = {
      ...packageJson.dependencies,
      ...packageJson.peerDependencies,
      ...packageJson.devDependencies,
    };

    expect(readme).toContain('@dcspark/cardano-multiplatform-lib-browser');
    expect(readme).toContain('@dcspark/cardano-multiplatform-lib-nodejs');
    expect(readme).toContain('not a drop-in replacement');

    expect(declaredDependencies).not.toHaveProperty(
      'cardano-multiplatform-lib'
    );
    expect(declaredDependencies).not.toHaveProperty(
      '@dcspark/cardano-multiplatform-lib'
    );
  });
});
