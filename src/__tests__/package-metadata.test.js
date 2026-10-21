const fs = require('fs');
const path = require('path');

const packageJson = require('../../package.json');

const readme = fs.readFileSync(path.join(__dirname, '../../README.md'), 'utf8');

describe('CML package metadata', () => {
  it('uses the CML-only bridge entrypoints', () => {
    expect(packageJson.name).toBe('@yoroi-classic/cml-mobile-bridge');
    expect(packageJson.private).toBe(true);
    expect(packageJson.description).toMatch(/CML-backed native React Native bridge/);

    expect(packageJson.main).toBe('lib/commonjs/cml');
    expect(packageJson.module).toBe('lib/module/cml');
    expect(packageJson.types).toBe('lib/typescript/src/cml.d.ts');
    expect(packageJson['react-native']).toBe('src/cml');
    expect(packageJson.source).toBe('src/cml');
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
