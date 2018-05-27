export default [
	// iife , for older browsers
	{
		input: 'src/custom-tab.js',
		output: {
			file: 'custom-tab.js',
      name: 'CustomTab',
			format: 'iife',
			sourcemap: false
		},
		experimentalCodeSplitting: false,
		experimentalDynamicImport: false
	}, {
		input: 'src/custom-tabs.js',
		output: {
			file: 'custom-tabs.js',
      name: 'CustomTabs',
			format: 'iife',
			sourcemap: false
		},
		experimentalCodeSplitting: false,
		experimentalDynamicImport: false
	}
]
