const path = require('path');

module.exports = {
    entry: ['./test/ModelTest.js', './test/CollectionTest.js'],
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
    },
    node: {
        fs: "empty"
    },
};
