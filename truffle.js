// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
    networks: {
        development: {
            host: 'localhost',
            port: 8545,
            network_id: '*' // Match any network id
        },
        local: {
            host: 'localhost',
            port: 8000,
            network_id: '61066'
        },
        testnetRpc: {
            host: 'localhost',
            port: 8000,
            network_id: '3'
        },
        mainnetRpc: {
            host: 'localhost',
            port: 8000,
            network_id: '1',
            gas: 3000000
        }
    }
}
