// "source" is separate file because sublimelint-contrib-eslint can't seem to load
// the commented version at this time
{
	"extends": "airbnb-base",

	// airbnb addition: allow more environments
	"env": {
		"browser": true,
		"mocha": true
	},

	// airbnb departure: allow generators
	"parserOptions": {
		"generators": true
	},

	"rules": {
		// Airbnb BEST PRACTICES departures
		// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/best-practices.js
		
		// good track record of preventing this-related errors
		"no-invalid-this": 2,

		// important for consistency and clarity
		"dot-location": [ 2, "property" ],

		// for noticing an IIFE, ")()" is more obvious at a glance than "()))"
		// (3 close-parens in a row can never be the most obvious thing)
		"wrap-iife": [ 2, "inside" ],

		// support concise range comparison syntax
		"yoda": [ 2, "never", {
			"exceptRange": true
		} ],

		// don't declare anything inside conditionals. not ever.
		"no-inner-declarations": [ 2, "both" ],

		// useful to help keep eyes on things - warning-only
		"complexity": [ 1, 8 ],
		"no-warning-comments": [ 1, { "terms": [ "todo", "fixme" ], "location": "start" } ],
		"valid-jsdoc": [ 1, {
			"requireReturn": false
		} ],


		// Airbnb VARIABLES departures
		// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/variables.js

		// allow hoisted function declarations
		"no-use-before-define": [ 2, "nofunc" ],


		// Airbnb ES6 departures
		// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/es6.js
		
		// why would you not have this?
		"constructor-super": 2,

		// var is useful to immediately inform function-scope vs block-scope
		// (for the unavoidable, very occasional, mutable references)
		"no-var": 0,

		// spread is awesome. using .apply() should indicate you need a 'this' context
		"prefer-spread": 1,

		// but why use a generator if you never yield? smelly.
		"require-yield": 1,

		// it's on the Airbnb todo, but reflect seems better than the old alternatives
		"prefer-reflect": 1,


		// Airbnb STYLE departures
		// https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/style.js
		
		// function declarations are better for debugging and can be called from
		// within themselves for easy recursion
		"func-names": 2,
		"func-style": [ 2, "declaration" ],

		// you can pry tab indents from my cold, dead hands
		// (but ONLY for semantic indents. Do not use for alignment)
		"indent": [ 2, "tab", { "SwitchCase": 1, "VariableDeclarator": 1, "outerIIFEBody": 1 } ],
		
		// allow extra spaces for alignment
		"key-spacing": [ 2, { "mode": "minimum" } ],
		"no-mixed-spaces-and-tabs": [ 2, "smart-tabs" ],
		"no-multi-spaces": [ 2, {
			"exceptions": {
				"ImportDeclaration": true,
				
				// default
				"Property": true
			}
		} ],

		// important for consistency and clarity
		"newline-after-var": 2,
		"newline-before-return": 2,
		"operator-linebreak": [ 2, "before" ]
	}
}
