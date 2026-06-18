import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const reactCompilerRuleOverrides = {
  'react-hooks/set-state-in-effect': 'warn',
  'react-hooks/immutability': 'warn',
  'react-hooks/error-boundaries': 'warn',
  'react-hooks/use-memo': 'warn'
}

const nextRuleOverrides = {
  '@next/next/no-html-link-for-pages': 'warn'
}

const typescriptRuleOverrides = {
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-explicit-any': 'warn'
}

function withLocalRuleOverrides(config) {
  return {
    ...config,
    rules: {
      ...config.rules,
      ...(config.plugins?.['react-hooks'] ? reactCompilerRuleOverrides : {}),
      ...(config.plugins?.['@next/next'] ? nextRuleOverrides : {}),
      ...(config.plugins?.['@typescript-eslint'] ? typescriptRuleOverrides : {})
    }
  }
}

const eslintConfig = [
  ...nextVitals.map(withLocalRuleOverrides),
  ...nextTypescript.map(withLocalRuleOverrides),
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts'
    ]
  }
]

export default eslintConfig
